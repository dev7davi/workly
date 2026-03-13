import { useState } from "react";
import { 
    Search, Users, Briefcase, 
    CreditCard, ChevronRight, MessageCircle,
    ArrowLeft, Monitor, Smartphone, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HELP_CATEGORIES = [
    {
        id: "clients",
        title: "Clientes",
        icon: Users,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        articles: [
            { title: "Como cadastrar clientes", slug: "como-cadastrar-clientes" },
            { title: "Importação de catálogo", slug: "importacao-de-catalogo" },
            { title: "Gestão de inadimplência", slug: "gestao-de-inadimplencia" }
        ]
    },
    {
        id: "services",
        title: "Serviços & O.S.",
        icon: Briefcase,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        articles: [
            { title: "Criando sua primeira O.S.", slug: "primeira-os" },
            { title: "Personalização de Comprovante", slug: "personalizacao-comprovante" },
            { title: "Status de cada serviço", slug: "status-servico" }
        ]
    },
    {
        id: "finance",
        title: "Financeiro",
        icon: CreditCard,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        articles: [
            { title: "Entendendo o DRE", slug: "entendendo-dre" },
            { title: "Gestão de despesas", slug: "gestao-de-despesas" },
            { title: "Fluxo de caixa", slug: "fluxo-de-caixa" }
        ]
    },
    {
        id: "plans",
        title: "Planos & Assinatura",
        icon: Zap,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        articles: [
            { title: "Diferença entre os planos", slug: "diferenca-entre-os-planos" },
            { title: "Como cancelar", slug: "como-cancelar" },
            { title: "Métodos de pagamento", slug: "metodos-de-pagamento" }
        ]
    }
];

export default function Help() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const filteredCategories = HELP_CATEGORIES.map(cat => ({
        ...cat,
        articles: cat.articles.filter(art => 
            art.title.toLowerCase().includes(search.toLowerCase()) ||
            cat.title.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(cat => cat.articles.length > 0);

    return (
        <div className="flex flex-col gap-6 p-5 pb-24 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
            {/* Header */}
            <header className="flex flex-col gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Central de Ajuda</h1>
                    <p className="text-muted-foreground font-medium">Como podemos te ajudar hoje?</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Pesquisar por tutorias, dúvidas..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-14 pl-12 pr-4 rounded-2xl bg-card border-border shadow-lg focus-visible:ring-primary"
                    />
                </div>
            </header>

            {/* Support CTA */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-[2rem] p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                        <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-tight text-emerald-700 dark:text-emerald-400">Atendimento Humanizado</p>
                        <p className="text-xs font-medium text-muted-foreground">Tire dúvidas direto pelo WhatsApp</p>
                    </div>
                </div>
                <Button 
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl"
                    onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
                >
                    FALAR AGORA
                </Button>
            </div>

            {/* Categories */}
            <div className="grid gap-4 sm:grid-cols-2">
                {filteredCategories.map(cat => (
                    <div key={cat.id} className="bg-card border border-border rounded-[2rem] p-6 hover:border-primary/50 transition-all group">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", cat.bg)}>
                            <cat.icon className={cn("h-6 w-6", cat.color)} />
                        </div>
                        <h3 className="text-lg font-black mb-4">{cat.title}</h3>
                        <ul className="space-y-3">
                            {cat.articles.map(art => (
                                <li key={art.slug}>
                                    <button 
                                        onClick={() => navigate(`/help/${art.slug}`)}
                                        className="flex items-center justify-between w-full text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors group/item"
                                    >
                                        {art.title}
                                        <ChevronRight className="h-4 w-4 opacity-0 group-hover/item:opacity-100 transition-all translate-x-1" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Quick Tips */}
            <div className="grid gap-4 grid-cols-3 mt-4">
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <Monitor className="h-6 w-6 text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Desktop</p>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <Smartphone className="h-6 w-6 text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mobile</p>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <Zap className="h-6 w-6 text-muted-foreground" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Atalhos</p>
                </div>
            </div>
        </div>
    );
}
