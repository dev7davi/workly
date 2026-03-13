import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign,
  Star,
  Crown,
  Check,
  Package,
  BarChart3,
  FileText,
  Users,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

// ⚠️ Substitua pelas URLs reais do Stripe
const STRIPE_LINKS = {
  start: "https://buy.stripe.com/6oU8wOftDaqzdBpb2EaMU02",
  pro: "https://buy.stripe.com/7sYbJ0dlv56f40P2w8aMU00",
  pro_plus: "https://buy.stripe.com/14A00i3KV8ir9l9gmYaMU01",
};

const plans = [
  {
    key: "free",
    name: "Free",
    icon: Star,
    iconColor: "text-slate-400",
    iconBg: "bg-slate-400/10",
    price: "Grátis",
    priceSub: "Iniciantes / Teste",
    highlight: false,
    badge: null,
    features: [
      "Até 20 clientes ativos",
      "Até 30 serviços cadastrados",
      "Comprovante Simples",
      "Agenda básica",
      "Resumo financeiro",
    ],
    cta: "Começar Grátis",
    ctaHref: "/auth?mode=signup",
    external: false,
    ctaStyle: "bg-muted/60 text-foreground hover:bg-muted",
  },
  {
    key: "start",
    name: "Start",
    icon: Zap,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
    price: "R$19,90",
    priceSub: "/mês · Autônomos em Crescimento",
    highlight: false,
    badge: null,
    features: [
      "Até 100 clientes e 200 serviços",
      "Ordem de Serviço (PDF) c/ Logo Workly",
      "Catálogo de Serviços",
      "Dashboard D.R.E. Financeiro",
    ],
    cta: "Assinar Start",
    ctaHref: STRIPE_LINKS.start,
    external: true,
    ctaStyle: "bg-indigo-600 text-white hover:bg-indigo-700",
  },
  {
    key: "pro",
    name: "Pro",
    icon: Crown,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    price: "R$ 39,90",
    priceSub: "/mês · Pequenos Negócios",
    highlight: true,
    badge: "Mais Popular",
    features: [
      "Clientes e Serviços Ilimitados",
      "White-Label (Sua Logo na O.S.)",
      "Anexos e Fotos nos Serviços",
      "Dashboards e Relatórios Avançados",
    ],
    cta: "Assinar Pro",
    ctaHref: STRIPE_LINKS.pro,
    external: true,
    ctaStyle: "bg-gradient-to-r from-primary to-blue-600 text-white shadow-xl shadow-primary/20",
  },
  {
    key: "pro_plus",
    name: "Pro+",
    icon: Sparkles,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    price: "R$ 69,90",
    priceSub: "/mês · Gestão Avançada",
    highlight: false,
    badge: "Completo",
    features: [
      "Tudo do Plano Pro",
      "IA (Automatização de Anotações)",
      "Gestão de Custos Extras",
      "Automação e Suporte VIP",
    ],
    cta: "Assinar Pro+",
    ctaHref: STRIPE_LINKS.pro_plus,
    external: true,
    ctaStyle:
      "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/20",
  },
];

const faqs = [
  { q: "Tem aplicativo para baixar?", a: "Não. O Workly é um sistema 100% online — você acessa pelo navegador do celular, tablet ou computador. Nenhuma instalação necessária." },
  { q: "Funciona bem no celular?", a: "Sim! O Workly foi desenvolvido com design mobile-first. A experiência no celular é tão boa quanto no computador." },
  { q: "Meus dados ficam salvos?", a: "Sim. Todos os dados são salvos na nuvem com segurança. Você pode acessar de qualquer lugar, a qualquer hora." },
  { q: "Posso gerar recibo e comprovante?", a: "Sim! Comprovante simples no plano Free. Com o Pro você pode personalizar com sua logo." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade. Cancele quando quiser pela plataforma de pagamento, sem burocracia." },
  { q: "O plano Free é realmente gratuito?", a: "Sim, sem cartão de crédito. O Free tem limite de 5 serviços e 5 clientes para você experimentar antes de escolher um plano pago." },
];

const Index = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col pt-16 font-sans selection:bg-primary/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo_w6.png" alt="WORKLY" className="h-8 mix-blend-multiply dark:mix-blend-normal" />
          </div>
          <div className="flex items-center gap-6">
            <a href="#planos" className="text-sm font-semibold hover:text-primary transition-colors hidden sm:block">
              Planos
            </a>
            <Link to="/auth" className="text-sm font-semibold hover:text-primary transition-colors hidden sm:block">
              Entrar
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="rounded-full px-6 font-bold shadow-md shadow-primary/10">
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 md:pt-36 md:pb-44">
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[140px]" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Sistema Inteligente para Prestadores de Serviço
            </span>
          </div>

          <h1 className="mb-8 text-4xl font-black leading-[1.1] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Sua operação e o seu financeiro{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              na palma da mão
            </span>.
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl font-medium leading-relaxed">
            Abandone as planilhas chatas e caderninhos. O Workly centraliza seus agendamentos, ordens de serviço, controle de custos e cobranças em um só lugar. Automatize seu fluxo, saiba o seu lucro real e passe profissionalismo.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/auth?mode=signup" className="w-full sm:w-auto">
              <Button size="lg" className="h-16 w-full rounded-2xl px-10 text-lg font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 sm:w-auto">
                Testar Gratuitamente Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#planos" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
              Ver planos e preços
            </a>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            Sem instalação · Funciona no navegador · Qualquer dispositivo
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-muted/30 py-12">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-8">
            Ideal para profissionais como você
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-60 md:gap-12">
            {["Eletricistas", "Estética", "Designers", "Personal Trainers", "Diaristas", "Freelas"].map((item) => (
              <span key={item} className="text-sm font-bold md:text-lg">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* The 3 Main Promises */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black md:text-5xl tracking-tight mb-4">
              Por que os melhores estão mudando para o Workly?
            </h2>
            <p className="text-muted-foreground text-lg font-medium">Você foca no seu serviço, nós cuidamos da gestão do seu negócio.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Zap,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                title: "Descubra o seu Lucro Real",
                desc: "Esqueça o 'faturamento ilusório'. O Workly debita automaticamente taxas, deslocamentos e materiais (DRE), te mostrando exatamente quanto sobrou limpo no bolso por cada serviço prestado.",
              },
              {
                icon: FileText,
                color: "text-indigo-500",
                bg: "bg-indigo-500/10",
                title: "O.S. Profissional com Sua Logo",
                desc: "Gere Ordens de Serviço completas em PDF com 1 clique. Aplique sua própria marca (White-label) e envie diretamente pelo WhatsApp do cliente, passando confiança imediata.",
              },
              {
                icon: ShieldCheck,
                color: "text-primary",
                bg: "bg-primary/10",
                title: "Adeus aos esquecimentos",
                desc: "O Dashboard inteligente te alerta sobre pagamentos pendentes, agendamentos do dia e clientes que precisam de retorno. Transforme o 'deixa que eu te pago depois' em caixa fechado.",
              },
            ].map((item) => (
              <div key={item.title} className="group flex flex-col p-8 rounded-3xl border bg-card transition-all hover:-translate-y-2 hover:shadow-xl hover:border-primary/20">
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} transition-transform group-hover:scale-110`}>
                  <item.icon className={`h-7 w-7 ${item.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-black tracking-tight">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="bg-muted/20 px-6 py-24 border-y border-border/50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-primary font-black uppercase tracking-widest text-xs mb-3">Tudo integrado</p>
            <h2 className="text-3xl font-black md:text-4xl tracking-tight mb-4">
              Um ecossistema completo para autônomos
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { icon: FileText, label: "Gerador de O.S. (PDF)" },
              { icon: Sparkles, label: "IA Leitora de Anotações" },
              { icon: Package, label: "Gestão de Custos" },
              { icon: Users, label: "Histórico de Clientes" },
              { icon: Crown, label: "Documentos White-label" },
              { icon: DollarSign, label: "Cálculo de Lucro Real" },
              { icon: CheckCircle, label: "Agenda Mensal Integrada" },
              { icon: BarChart3, label: "Relatórios Financeiros" },
            ].map((feat) => (
              <div key={feat.label} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all cursor-default">
                <feat.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm font-bold">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain / ICP Section */}
      <section className="relative overflow-hidden bg-foreground py-24 px-6 text-background">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-3xl font-black md:text-5xl tracking-tight">
            Parece que você está trabalhando de graça?
          </h2>
          <p className="mb-12 text-lg text-background/80 md:text-xl font-medium">
            Muitos profissionais sentem que o dinheiro entra e some logo em seguida. Sem controle dos custos pequenos (combustível, peças, taxas da maquininha), você não sabe se teve lucro ou se pagou para trabalhar.
          </p>
          <div className="grid gap-4 text-left md:grid-cols-2">
            {[
              "Encontre seus custos ocultos rapidamente",
              "Pare de esquecer o que pediram no WhatsApp",
              "Não perca mais tempo calculando preços base",
              "Feche mais negócios mostrando profissionalismo",
            ].map((point) => (
              <div key={point} className="flex items-center gap-3 bg-white/5 rounded-2xl px-5 py-4">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="font-semibold">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="px-6 py-24 md:py-36">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">Planos & Preços</p>
            <h2 className="text-3xl font-black md:text-5xl tracking-tight mb-4">
              Comece grátis. Cresça no ritmo certo.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Sem surpresas, sem letras miúdas. Cancele quando quiser.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 items-start">
            {plans.map((plan) => {
              const PlanIcon = plan.icon;
              return (
                <div
                  key={plan.key}
                  className={`relative flex flex-col rounded-3xl border-2 overflow-hidden transition-all duration-300 ${plan.highlight
                    ? "border-primary shadow-2xl shadow-primary/20 scale-[1.03]"
                    : "border-border bg-card shadow-lg"
                    }`}
                >
                  {plan.badge && (
                    <div className="absolute top-4 right-4">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${plan.highlight ? "bg-primary text-white" : "bg-amber-500 text-white"}`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className={`p-8 ${plan.highlight ? "bg-card" : "bg-card"}`}>
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-5 ${plan.iconBg}`}>
                      <PlanIcon className={`h-7 w-7 ${plan.iconColor}`} />
                    </div>
                    <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-3xl font-black">{plan.price}</span>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{plan.priceSub}</p>
                  </div>

                  <div className="px-8 pb-4 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-3">
                        <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlight ? "text-primary" : plan.key === "plus" ? "text-amber-500" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 pt-6">
                    {plan.external ? (
                      <a href={plan.ctaHref} target="_blank" rel="noopener noreferrer" className="block">
                        <Button className={`w-full h-14 rounded-2xl font-black text-base transition-all hover:scale-[1.02] active:scale-95 ${plan.ctaStyle}`}>
                          {plan.cta}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </a>
                    ) : (
                      <Link to={plan.ctaHref}>
                        <Button className={`w-full h-14 rounded-2xl font-black text-base transition-all hover:scale-[1.02] active:scale-95 ${plan.ctaStyle}`}>
                          {plan.cta}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center flex flex-wrap items-center justify-center gap-8 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <span>✓ Cancele quando quiser</span>
            <span>✓ Pagamento por Stripe (seguro)</span>
            <span>✓ Sem fidelidade</span>
            <span>✓ Suporte incluso</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/20 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-3">Dúvidas</p>
            <h2 className="text-3xl font-black tracking-tight">Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-black text-base pr-4">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed font-medium">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 md:py-36">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary to-blue-700 p-8 text-center text-white md:p-20 relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          <h2 className="relative mb-6 text-3xl font-black md:text-6xl tracking-tight">
            Recupere o controle da sua rotina.
          </h2>
          <p className="relative mb-10 text-lg opacity-90 md:text-xl">
            Se você recuperar UMA cobrança esquecida, o Workly já valeu — e no plano gratuito, ele é totalmente sem custo.
          </p>
          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="h-16 rounded-2xl bg-white text-primary hover:bg-white/90 text-xl font-black px-12 transition-all hover:scale-105 active:scale-95">
                Criar minha conta agora
              </Button>
            </Link>
            <a href="#planos" className="text-white/70 font-bold underline underline-offset-4 hover:text-white transition-colors text-sm">
              Ver planos
            </a>
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-widest opacity-50">
            Acesse pelo navegador · Sem instalação
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-12">
        <div className="mx-auto max-w-5xl flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo_w6.png" alt="WORKLY" className="h-8 mix-blend-multiply dark:mix-blend-normal" />
            </div>
            <div className="text-xs text-muted-foreground font-medium space-y-1">
              <p>E-mail: serviceworkly@gmail.com</p>
              <p>Whatsapp: +55 17 99203.0665</p>
            </div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-[0.2em] mt-2">
              © 2026 WORKLY — Feito para o autônomo brasileiro.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#planos" className="text-xs font-bold hover:text-primary transition-colors">Planos</a>
            <Link to="/auth" className="text-xs font-bold hover:text-primary transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
