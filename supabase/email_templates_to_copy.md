# Copie os códigos HTML abaixo e cole no painel do Supabase
*Acesso:* Vá em Supabase Dashboard -> **Authentication** -> **Email Templates**.

## 1. Confirmação de E-mail (Confirm signup)
**Subject / Assunto:** Bem-vindo ao Workly! Confirme seu cadastro
**Conteúdo Markdown puro HTML:**
```html
<div style="font-family: Arial, sans-serif; background-color: #0d1117; color: #ffffff; padding: 40px 20px; text-align: center;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #161b22; padding: 30px; border-radius: 12px; border: 1px solid #30363d;">
        <img src="https://workly.app/faviconw.png" alt="Workly" style="width: 60px; height: 60px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #58a6ff;">Bem-vindo ao Workly!</h2>
        <p style="color: #c9d1d9; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Sua conta foi criada com sucesso.<br>Confirme seu e-mail para acessar o melhor sistema de gestão para prestadores de serviços.
        </p>
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #238636; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px;">
            Confirmar Meu E-mail
        </a>
        <p style="color: #8b949e; font-size: 12px; margin-top: 30px;">
            Aumente seu lucro, reduza esquecimentos e emita O.S. profissionais.<br><br>
            ©2026 Workly App - Seu negócio, organizado.
        </p>
    </div>
</div>
```

---

## 2. Recuperar Senha (Reset Password)
**Subject / Assunto:** Redefinição de Senha - Workly
**Conteúdo Markdown puro HTML:**
```html
<div style="font-family: Arial, sans-serif; background-color: #0d1117; color: #ffffff; padding: 40px 20px; text-align: center;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #161b22; padding: 30px; border-radius: 12px; border: 1px solid #30363d;">
        <img src="https://workly.app/faviconw.png" alt="Workly" style="width: 60px; height: 60px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #58a6ff;">Recuperação de Senha</h2>
        <p style="color: #c9d1d9; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
            Olá!<br>Você solicitou a redefinição da sua senha no Workly.<br>Clique no botão abaixo para criar uma senha nova de forma segura.
        </p>
        <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #238636; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px;">
            Redefinir Minha Senha
        </a>
        <p style="color: #8b949e; font-size: 12px; margin-top: 30px;">
            Se você não solicitou, por favor, ignore este e-mail.<br>
            Seu link expira em 24 horas.<br><br>
            ©2026 Workly App - Seu negócio, organizado.
        </p>
    </div>
</div>
```

**Importante:** Verifique se em *Site URL* ou *Redirect URLs* no seu Supabase estão cadastrados o `http://localhost:5173/` ou a sua URL de produção. Em ambiente local de testes o Supabase troca o "https://workly.app/" do `ConfirmationURL` pelo Redirect URL cadastrado lá.
