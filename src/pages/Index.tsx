import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle, FileText, TrendingUp, Shield, Smartphone } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Cadastro de Serviços",
    description: "Registre todos os seus trabalhos de forma simples e organizada.",
  },
  {
    icon: TrendingUp,
    title: "Controle Financeiro",
    description: "Acompanhe o que você tem a receber e o que já foi pago.",
  },
  {
    icon: CheckCircle,
    title: "Comprovantes",
    description: "Gere comprovantes profissionais e compartilhe com seus clientes.",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description: "Suas informações protegidas e acessíveis apenas para você.",
  },
];

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">WORKLY</h1>
              <p className="text-xs text-muted-foreground">Seu trabalho, organizado.</p>
            </div>
          </div>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mx-auto max-w-lg animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2">
            <Smartphone className="h-4 w-4 text-accent-foreground" />
            <span className="text-sm font-medium text-accent-foreground">
              Instale no seu celular
            </span>
          </div>
          
          <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground">
            Organize seus serviços.{" "}
            <span className="text-gradient">Receba sem dor de cabeça.</span>
          </h2>
          
          <p className="mb-8 text-lg text-muted-foreground">
            Chega de anotações perdidas e cobranças esquecidas. 
            O WORKLY te ajuda a gerenciar seus trabalhos de forma profissional.
          </p>

          <div className="flex flex-col gap-3">
            <Link to="/auth?mode=signup" className="w-full">
              <Button className="w-full bg-gradient-hero py-6 text-lg font-semibold" size="lg">
                Começar grátis
              </Button>
            </Link>
            <Link to="/auth" className="w-full">
              <Button variant="outline" className="w-full py-6" size="lg">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card px-4 py-12">
        <div className="mx-auto max-w-lg">
          <h3 className="mb-8 text-center text-xl font-bold text-foreground">
            Tudo que você precisa
          </h3>
          
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-xl border border-border bg-background p-4 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-lg rounded-2xl bg-gradient-hero p-6 text-center">
          <h3 className="mb-2 text-xl font-bold text-primary-foreground">
            Pronto para organizar seu trabalho?
          </h3>
          <p className="mb-6 text-primary-foreground/80">
            Comece agora, é grátis!
          </p>
          <Link to="/auth?mode=signup">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
            >
              Criar minha conta
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2024 WORKLY. Feito para trabalhadores brasileiros.
        </p>
      </footer>
    </div>
  );
};

export default Index;
