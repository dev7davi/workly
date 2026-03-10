import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, "Digite seu nome completo"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

const updatePasswordSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;
type ResetForm = z.infer<typeof resetSchema>;
type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;

type AuthMode = "login" | "signup" | "reset" | "update_password";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signup") return "signup";
    if (modeParam === "reset") return "reset";
    return "login";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, resetPassword, updatePassword } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update_password");
      }
    });

    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setMode("update_password");
    }

    return () => subscription.unsubscribe();
  }, []);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const updatePasswordForm = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signup") setMode("signup");
    else if (modeParam === "reset") setMode("reset");
    else setMode("login");
  }, [searchParams]);

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        let message = "Erro ao fazer login. Tente novamente.";
        if (error.message.includes("Invalid login")) {
          message = "E-mail ou senha incorretos.";
        }
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: message,
        });
      }
      // If no error, the AuthContext listener will update user and PublicRoute will redirect
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, data.name);
      if (error) {
        let message = "Erro ao criar conta. Tente novamente.";
        if (error.message.includes("already registered")) {
          message = "Este e-mail já está cadastrado. Tente fazer login.";
        }
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: message,
        });
        return;
      }

      // Auto-login after successful signup
      const { error: loginError } = await signIn(data.email, data.password);
      if (!loginError) {
        toast({
          title: "Bem-vindo ao WORKLY! 🎉",
          description: "Sua conta foi criada com sucesso.",
        });
        navigate("/dashboard");
      } else {
        // If auto-login fails, show success and ask to login manually
        toast({
          title: "Conta criada!",
          description: "Faça login para continuar.",
        });
        setMode("login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (data: ResetForm) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível enviar o e-mail. Tente novamente.",
        });
      } else {
        toast({
          title: "E-mail enviado!",
          description: "Verifique sua caixa de entrada para redefinir a senha.",
        });
        setMode("login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (data: UpdatePasswordForm) => {
    setIsLoading(true);
    try {
      const { error } = await updatePassword(data.password);
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível atualizar a senha. O link pode ter expirado.",
        });
      } else {
        toast({
          title: "Senha atualizada!",
          description: "Você já pode acessar com sua nova senha.",
        });
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <img src="/logo_w.png" alt="Workly" className="h-10 mix-blend-multiply dark:mix-blend-normal object-contain" onError={(e) => {
              e.currentTarget.style.display = 'none';
            }} />
            <style>{`
              img[src="/logo.png"]:not([style*="display: none"]) + .fallback-auth-logo {
                display: none;
              }
            `}</style>
            <div className="fallback-auth-logo flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">WORKLY</h1>
                <p className="text-xs text-muted-foreground">Seu trabalho, organizado.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {mode === "login" && "Entrar"}
              {mode === "signup" && "Criar conta"}
              {mode === "reset" && "Recuperar senha"}
              {mode === "update_password" && "Atualizar senha"}
            </CardTitle>
            <CardDescription>
              {mode === "login" && "Acesse sua conta para gerenciar seus serviços"}
              {mode === "signup" && "Crie sua conta gratuita e comece agora"}
              {mode === "reset" && "Digite seu e-mail para receber o link"}
              {mode === "update_password" && "Digite a nova senha de acesso"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "login" && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() => setMode("reset")}
                >
                  Esqueceu a senha?
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-gradient-hero"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Entrar"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Não tem conta?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => setMode("signup")}
                  >
                    Cadastre-se
                  </Button>
                </p>
              </form>
            )}

            {mode === "signup" && (
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    {...signupForm.register("name")}
                  />
                  {signupForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    {...signupForm.register("email")}
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...signupForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...signupForm.register("confirmPassword")}
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-hero"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Criar conta"
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Já tem conta?{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => setMode("login")}
                  >
                    Entrar
                  </Button>
                </p>
              </form>
            )}

            {mode === "reset" && (
              <form onSubmit={resetForm.handleSubmit(handleReset)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">E-mail</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    {...resetForm.register("email")}
                  />
                  {resetForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-hero"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Enviar link"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => setMode("login")}
                >
                  Voltar para o login
                </Button>
              </form>
            )}

            {mode === "update_password" && (
              <form onSubmit={updatePasswordForm.handleSubmit(handleUpdatePassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...updatePasswordForm.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {updatePasswordForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {updatePasswordForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-confirm-password">Confirmar nova senha</Label>
                  <Input
                    id="new-confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...updatePasswordForm.register("confirmPassword")}
                  />
                  {updatePasswordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {updatePasswordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-hero"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Atualizar senha"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
