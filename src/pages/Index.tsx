import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ArrowRight,
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
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      "Até 10 clientes ativos",
      "Até 20 serviços p/ mês",
      "Comprovante Simples",
      "Agenda básica",
      "Resumo financeiro",
      "PDF com logo Workly",
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
      "Até 100 clientes",
      "Até 200 serviços",
      "O.S. PDF c/ Logo Workly",
      "Catálogo de Serviços",
      "Dashboard DRE",
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
      "Cli. e Serv. Ilimitados",
      "White Label (Logo Própria)",
      "Anexos e Fotos",
      "Relatórios Avançados",
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
      "Inteligência IA",
      "Gestão livre de Custos",
      "Suporte VIP",
    ],
    cta: "Assinar Pro+",
    ctaHref: STRIPE_LINKS.pro_plus,
    external: true,
    ctaStyle:
      "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/20",
  },
];

const faqs = [
  { q: "Tem aplicativo para baixar?", a: "O Workly é 100% online, acessível de qualquer dispositivo, sem necessidade de instalação." },
  { q: "Meus dados ficam salvos?", a: "Sim, seus dados são armazenados com segurança na nuvem, acessíveis a qualquer hora e lugar." },
  { q: "Posso gerar recibo e comprovante?", a: "Sim! Comprovante simples no plano Free. Com o Pro você pode personalizar com sua logo nas Ordens de Serviço." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade. Cancele quando quiser pela plataforma de pagamento, sem burocracia." },
  { q: "O plano Free é realmente gratuito?", a: "Sim, sem cartão de crédito. É a forma ideal de você experimentar a plataforma antes de expandir." },
];

export default function Index() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 selection:text-white">
      {/* 1. Header/Navbar */}
      <nav className="fixed top-0 z-[100] w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img src="/logo_w6.png" alt="WORKLY" className="h-8 brightness-0 invert" />
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-white/60">
            <a href="#funcionalidades" className="hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#planos" className="hover:text-primary transition-colors">Planos</a>
            <a href="#faq" className="hover:text-primary transition-colors">Dúvidas</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/auth" className="text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white font-black px-6 shadow-lg shadow-primary/20">
                Criar Conta Grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Ambient Light Effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Sistema Inteligente para Prestadores de Serviço
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8 max-w-5xl">
            Sua Gestão{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Simplificada
            </span>{" "}
            e Lucrativa.
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl font-medium leading-relaxed mb-12">
            Diga adeus às planilhas e caderninhos. O Workly centraliza seus agendamentos, ordens de serviço, controle de custos e cobranças. Otimize seu tempo e saiba seu lucro real.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-20 w-full justify-center">
            <Link to="/auth?mode=signup" className="w-full sm:w-auto">
              <Button size="lg" className="h-16 w-full sm:w-auto px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-2xl shadow-primary/30 transition-all hover:scale-105">
                Começar Grátis Agora
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
            <a href="#planos" className="text-sm font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors underline underline-offset-8">
              Ver Planos e Preços
            </a>
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-12">
            Junte-se a +10.000 profissionais que já transformaram seus negócios com o Workly.
          </p>

          {/* Product Mockup */}
          <div className="relative w-full max-w-6xl group">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-[80px] group-hover:bg-primary/30 transition-all duration-700 pointer-events-none" />
            <div className="relative rounded-[2rem] border border-white/10 bg-black/40 p-2 md:p-4 backdrop-blur-3xl overflow-hidden shadow-2xl">
              <img 
                src="/mockup.png" 
                alt="Workly Dashboard" 
                className="w-full h-auto rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Social Proof */}
      <section className="py-20 bg-white/5 border-y border-white/5 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-10">A escolha dos autônomos que buscam excelência</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {["Eletricistas", "Esteticistas", "Designers", "Personal Trainers", "Diaristas", "Freelas", "Consultores", "Técnicos"].map(cat => (
              <span key={cat} className="text-lg md:text-2xl font-black tracking-tight">{cat}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Problem/Pain Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-8">
                Você está realmente lucrando ou apenas{" "}
                <span className="text-red-500">pagando para trabalhar?</span>
              </h2>
              <p className="text-lg md:text-xl text-white/60 font-medium leading-relaxed mb-10">
                Muitos profissionais sentem que o dinheiro entra e some logo em seguida. Sem controle dos custos reais (combustível, peças, taxas), você não sabe se teve lucro ou prejuízo.
              </p>
              <Link to="/auth?mode=signup">
                <Button className="rounded-2xl h-14 px-8 bg-white text-black hover:bg-white/90 font-black">
                  Quero recuperar meu controle
                </Button>
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Encontre seus custos ocultos e saiba seu lucro real.",
                "Pare de esquecer o que pediram no WhatsApp.",
                "Não perca mais tempo calculando preços base.",
                "Feche mais negócios com O.S. profissionais.",
                "Tenha uma agenda inteligente que te lembra de tudo.",
                "Automatize anotações com IA e foque no que importa.",
              ].map((point, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-4 hover:border-primary/20 transition-colors">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <p className="text-sm font-bold leading-tight">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Solution/Features */}
      <section id="funcionalidades" className="py-32 px-6 bg-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-primary font-black uppercase tracking-widest text-xs mb-4">Tudo integrado</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">O Ecossistema Completo para o seu Sucesso</h2>
            <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">Ferramentas inteligentes que transformam sua rotina e seus resultados.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                icon: Sparkles, 
                title: "IA Leitora de Anotações", 
                desc: "Automatize o registro de informações importantes e ganhe tempo precioso." ,
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
              { 
                icon: FileText, 
                title: "Gerador de O.S. (PDF) White-label", 
                desc: "Impressione seus clientes com documentos profissionais e personalizados com sua logo.",
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              { 
                icon: DollarSign, 
                title: "Cálculo de Lucro Real", 
                desc: "Descubra exatamente quanto você lucra por serviço, considerando combustível e materiais.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              },
              { 
                icon: Calendar, 
                title: "Agenda Inteligente", 
                desc: "Visualize sua produtividade e nunca mais perca um compromisso importante.",
                color: "text-indigo-500",
                bg: "bg-indigo-500/10"
              },
              { 
                icon: Users, 
                title: "Histórico de Clientes Completo", 
                desc: "Tenha todos os detalhes de cada contato na palma da mão para um atendimento VIP.",
                color: "text-pink-500",
                bg: "bg-pink-500/10"
              },
              { 
                icon: BarChart3, 
                title: "Relatórios Financeiros Detalhados", 
                desc: "Acompanhe a evolução do seu negócio com dashboards claros e intuitivos.",
                color: "text-primary",
                bg: "bg-primary/10"
              },
            ].map((feat, i) => (
              <div key={i} className="group p-8 rounded-[2.5rem] bg-black/60 border border-white/5 hover:border-primary/20 transition-all duration-500 hover:-translate-y-1">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feat.bg)}>
                  <feat.icon className={cn("h-7 w-7", feat.color)} />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-3">{feat.title}</h3>
                <p className="text-white/50 text-sm font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. How it Works */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">3 Passos Simples para Transformar seu Negócio</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Step lines - Desktop Only */}
            <div className="hidden md:block absolute top-[2.5rem] left-[15%] right-[15%] h-px bg-white/10" />
            
            {[
              { 
                step: "1", 
                title: "Crie sua Conta Grátis", 
                desc: "Cadastre-se em segundos e explore todas as funcionalidades sem compromisso." 
              },
              { 
                step: "2", 
                title: "Configure seu Perfil", 
                desc: "Adicione seus clientes, cadastre seus serviços e personalize suas O.S." 
              },
              { 
                step: "3", 
                title: "Comece a Lucrar Mais", 
                desc: "Gerencie sua agenda, controle seus custos e veja seu lucro real crescer." 
              },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black mb-8 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                  {item.step}
                </div>
                <h3 className="text-xl font-black tracking-tight mb-4">{item.title}</h3>
                <p className="text-white/50 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Pricing Table */}
      <section id="planos" className="py-32 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Investimento</p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Planos Flexíveis para o seu Crescimento</h2>
            <p className="text-white/60 text-lg font-medium">Cancele quando quiser. Sem letras miúdas.</p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
            {plans.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.key} className={cn(
                  "relative p-8 rounded-[2.5rem] border-2 transition-all duration-500",
                  p.highlight 
                    ? "border-primary bg-primary/5 shadow-2xl shadow-primary/20 scale-[1.05] z-10" 
                    : "border-white/5 bg-black/40"
                )}>
                  {p.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                      {p.badge}
                    </div>
                  )}
                  
                  <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6", p.iconBg)}>
                    <Icon className={cn("h-7 w-7", p.iconColor)} />
                  </div>
                  
                  <h3 className="text-2xl font-black tracking-tight mb-1">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-black">{p.price}</span>
                  </div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-white/40 mb-8">{p.priceSub}</p>
                  
                  <div className="space-y-4 mb-10">
                    {p.features.map(f => (
                      <div key={f} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm font-bold text-white/70">{f}</span>
                      </div>
                    ))}
                  </div>

                  <a href={p.ctaHref} target={p.external ? "_blank" : "_self"} rel="noreferrer">
                    <Button className={cn(
                      "w-full h-14 rounded-2xl font-black uppercase tracking-widest",
                      p.highlight ? "bg-primary hover:bg-primary/90 text-white" : "bg-white/5 hover:bg-white/10 text-white"
                    )}>
                      {p.cta}
                    </Button>
                  </a>
                </div>
              );
            })}
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            <span>✓ Cancele quando quiser</span>
            <span>✓ Pagamento Seguro (Stripe)</span>
            <span>✓ Sem fidelidade</span>
            <span>✓ Suporte incluso</span>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tighter">Dúvidas Comuns? A gente responde.</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-3xl border border-white/5 bg-white/5 overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/10 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-lg font-black tracking-tight">{faq.q}</span>
                  <ChevronDown className={cn("h-6 w-6 text-white/40 transition-transform duration-500", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-white/60 font-medium leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto relative group overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary to-blue-700 py-20 px-8 text-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
          
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-8 relative z-10">
            Recupere o controle da sua rotina e multiplique seus resultados.
          </h2>
          <p className="text-lg md:text-xl text-white/80 font-medium max-w-2xl mx-auto mb-12 relative z-10">
            Se você recuperar UMA cobrança esquecida, o Workly já valeu. No plano gratuito, ele é totalmente sem custo.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <Link to="/auth?mode=signup" className="w-full sm:w-auto">
              <Button size="lg" className="h-20 w-full sm:w-auto px-16 rounded-[2rem] bg-white text-primary hover:bg-white/90 font-black text-2xl shadow-2xl transition-all hover:scale-105 active:scale-95">
                Criar minha conta agora
              </Button>
            </Link>
            <a href="#planos" className="font-black uppercase tracking-widest text-sm text-white/60 hover:text-white transition-colors underline underline-offset-8">
              Ver Planos
            </a>
          </div>
          
          <p className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
            Acesse pelo navegador · Sem instalação · Experimente Grátis
          </p>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-6">
            <img src="/logo_w6.png" alt="WORKLY" className="h-8 brightness-0 invert" />
            <div className="space-y-2 text-sm text-white/40 font-bold">
              <p>E-mail: serviceworkly@gmail.com</p>
              <p>WhatsApp: +55 17 99203.0665</p>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              © 2026 WORKLY — Feito para o autônomo brasileiro.
            </p>
          </div>
          
          <div className="flex gap-12">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Navegação</p>
              <nav className="flex flex-col gap-2 text-sm font-bold text-white/60">
                <a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a>
                <a href="#planos" className="hover:text-white transition-colors">Planos</a>
                <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
              </nav>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Acesso</p>
              <nav className="flex flex-col gap-2 text-sm font-bold text-white/60">
                <Link to="/auth" className="hover:text-white transition-colors">Entrar</Link>
                <Link to="/auth?mode=signup" className="hover:text-white transition-colors">Criar Conta</Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
