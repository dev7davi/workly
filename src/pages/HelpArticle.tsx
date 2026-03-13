import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { helpArticles } from "@/content/helpArticles";
import { cn } from "@/lib/utils";

export default function HelpArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const article = helpArticles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-300">
        <h1 className="text-2xl font-black mb-4">Artigo não encontrado</h1>
        <button 
          onClick={() => navigate("/help")}
          className="flex items-center gap-2 text-primary font-bold hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Ajuda
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-5 pb-28 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
      {/* Botão Voltar */}
      <header className="flex flex-col gap-4 pt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        
        <h1 className="text-3xl font-black tracking-tight leading-tight">
          {article.title}
        </h1>
        
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 rounded-full",
            article.category === "clientes" && "bg-blue-500/10 text-blue-500",
            article.category === "financeiro" && "bg-emerald-500/10 text-emerald-500",
            article.category === "planos" && "bg-amber-500/10 text-amber-500",
            !["clientes", "financeiro", "planos"].includes(article.category) && "bg-primary/10 text-primary"
          )}>
            {article.category}
          </span>
          <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase">
            <Clock className="h-3 w-3" /> 2 min de leitura
          </div>
        </div>
      </header>

      {/* Conteúdo do Artigo */}
      <div className="bg-card border border-border rounded-[2rem] shadow-xl overflow-hidden">
        <div className="p-6 md:p-10">
          <div className="prose dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-2xl prose-blockquote:py-1 prose-blockquote:px-4 prose-img:rounded-2xl">
            <ReactMarkdown>
              {article.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Footer do Artigo */}
      <footer className="flex flex-col items-center gap-4 py-8 text-center border-t border-border mt-4">
        <p className="text-sm font-bold text-muted-foreground">Este artigo foi útil?</p>
        <div className="flex gap-2">
          <button className="px-6 py-2 rounded-xl bg-muted font-bold text-xs hover:bg-muted/80 transition-all">Não</button>
          <button className="px-6 py-2 rounded-xl bg-primary text-white font-black text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all">Sim, ajudou!</button>
        </div>
        <Link 
          to="/help" 
          className="text-xs font-bold text-primary hover:underline mt-4 flex items-center gap-2"
        >
          <BookOpen className="h-3.5 w-3.5" /> Ver todos os artigos
        </Link>
      </footer>
    </div>
  );
}
