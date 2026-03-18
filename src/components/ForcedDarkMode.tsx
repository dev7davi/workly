import { useEffect } from "react";

interface ForcedDarkModeProps {
  children: React.ReactNode;
}

/**
 * Componente que força a aplicação da classe 'dark' no elemento raiz (html).
 * Usado para garantir que telas de Auth e Planos permaneçam em modo escuro
 * independente da configuração do sistema ou preferência global do usuário.
 */
export const ForcedDarkMode = ({ children }: ForcedDarkModeProps) => {
  useEffect(() => {
    const html = document.documentElement;
    const originalClass = html.className;
    
    // Força o dark mode
    html.classList.add("dark");
    
    // Opcional: remover se quiser que ao sair da tela o tema volte ao anterior
    // Mas para Login/Planos, geralmente queremos que o dark persista enquanto na rota
    return () => {
      // Se houver lógica global de tema, ela reassumirá no próximo render do ThemeProvider
      // mas podemos limpar aqui se necessário.
    };
  }, []);

  return (
    <div className="dark bg-black text-white min-h-screen selection:bg-primary/30">
      {children}
    </div>
  );
};
