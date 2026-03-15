import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Workly Stripe Webhook
 * Intercepta pagamentos bem sucedidos do Checkout Stripe
 * E promove a conta associada ao e-mail para plano PRO automaticamente.
 */

// Inicializa cliente oficial Deno do Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

// Crypto Provider do Deno para assinar e validar o construtor do webhook
const cryptoProvider = Stripe.createCryptoProvider();

serve(async (req) => {
    // 1. Validar a assinatura de segurança da Stripe
    const signature = req.headers.get("Stripe-Signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    // Inicializar conexão Root com Database Workly (Service_Role)
    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        const body = await req.text();
        let event;
        
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature!,
                webhookSecret!,
                undefined,
                cryptoProvider
            );
        } catch (err: any) {
             console.error(`🚨 Erro de Assinatura Webhook (Possível Invasão): ${err.message}`);
             return new Response(`Webhook Oculto: Não Autorizado.`, { status: 400 });
        }

        console.log(`🔔 Webhook Oficial Recebido: ${event.type}`);

        // 2. Analisar o evento do Carrinho de Pagamento Concluído ou Assinatura Criada
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const customerEmail = session.customer_details?.email;
            const subscriptionId = session.subscription as string;
            
            // Verifica metadata enviado pelo site (se houver) ou assume Pro default
            const planToUpgradeTo = session.metadata?.plan || "pro"; 
            let billingCycle = session.metadata?.billing_cycle || "monthly";

            // Se for uma assinatura, podemos tentar buscar detalhes do ciclo
            if (subscriptionId) {
                try {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const item = subscription.items.data[0];
                    if (item && item.price.recurring?.interval === "year") {
                        billingCycle = "yearly";
                    }
                } catch (e) {
                    console.error("⚠️ Erro ao buscar detalhes da assinatura:", e);
                }
            }
            
            if (customerEmail) {
                console.log(`💳 Pagamento de ${customerEmail} processado. Promovendo para ${planToUpgradeTo} (${billingCycle})...`);

                const { data, error } = await supabaseClient
                    .from("profiles")
                    .update({ 
                        plan: planToUpgradeTo, 
                        billing_cycle: billingCycle,
                        subscription_id: subscriptionId,
                        updated_at: new Date().toISOString() 
                    })
                    .eq("email", customerEmail);
                    
                if (error) {
                    console.error("❌ Erro ao atualizar RLS/Privilégio no DB:", error);
                    return new Response("Database update error", { status: 500 });
                }
                
                console.log(`✅ Sucesso Absoluto! Cliente ${customerEmail} foi ativo no plano ${planToUpgradeTo} (${billingCycle}).`);
            } else {
                 console.log("⚠️ Carrinho aprovado, mas sem e-mail atrelado visivel.");
            }
        }

        // Tratamento adicional sugerido pelo guia para maior robustez
        if (event.type === "customer.subscription.created") {
            const subscription = event.data.object as Stripe.Subscription;
            const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
            const customerEmail = customer.email;

            if (customerEmail) {
                const planToUpgradeTo = subscription.metadata?.plan || "pro";
                const billingCycle = subscription.items.data[0]?.price.recurring?.interval === "year" ? "yearly" : "monthly";

                console.log(`🔄 Assinatura criada para ${customerEmail}. Plano: ${planToUpgradeTo}, Ciclo: ${billingCycle}`);

                await supabaseClient
                    .from("profiles")
                    .update({ 
                        plan: planToUpgradeTo,
                        billing_cycle: billingCycle,
                        subscription_id: subscription.id,
                        updated_at: new Date().toISOString()
                    })
                    .eq("email", customerEmail);
            }
        }

        return new Response(JSON.stringify({ act: "acknowledged", received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err: any) {
        console.error(`💥 Erro Fatal do Webhook: ${err.message}`);
        return new Response(`Erro crasso: ${err.message}`, { status: 500 });
    }
});
