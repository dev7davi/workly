# Guia de Deploy Real: Worklly na DigitalOcean 🚀

Sua infraestrutura já está configurada com Nginx e SSL. Agora vamos subir a aplicação usando Docker para aplicar as melhorias de branding e PWA.

## 1. Enviando os Arquivos (Se não usar Git na VPS)
Se você costuma enviar via PowerShell:
```powershell
# Sincronizar pasta local com a VPS
scp -i "$env:USERPROFILE\.ssh\id_rsa_workly" -r "c:\Users\Davi\OneDrive\Área de Trabalho\workly\*" seu_usuario@SEU_IP:/home/seu_usuario/workly/
```

## 2. Acessando a VPS
```powershell
ssh -i "$env:USERPROFILE\.ssh\id_rsa_workly" seu_usuario@SEU_IP
```

## 3. O "Melhor" Fluxo de Atualização (Comando por Comando)
Dentro da VPS, execute estes comandos para garantir que nada antigo fique no cache:

```bash
cd ~/workly

# 1. Garantir que o código está na branch correta
git pull origin feat/5-funcionalidades-principais

# 2. Parar o sistema atual
docker-compose down

# 3. Build LIMPO (Crucial para novos ícones PWA e Branding)
docker-compose build --no-cache

# 4. Subir o sistema novo
docker-compose up -d

# 5. Limpar imagens antigas (Para não encher o disco da VPS)
docker image prune -f
```

## 4. Como o Fluxo Funciona
1. **Nginx da VPS (443)** -> Recebe o HTTPS de `worklly.com.br`.
2. **Reverse Proxy** -> Repassa para `localhost:3000`.
3. **Docker (3000)** -> Entrega o novo build do **Worklly**.

## 5. Verificação Final (Se o comando acima falhar, use docker-compose com hífen)
```bash
docker ps
# ou
docker-compose ps
```
Se aparecer `workly-frontend` como **Up**, acesse o site. 
> [!TIP]
> No navegador, dê um **Ctrl + F5** (ou limpe o cache do site nas configurações) para forçar o navegador a baixar os novos ícones do Worklly! 🔓✨

