# Guia de Deploy Real: Workly na DigitalOcean 🚀

Sua infraestrutura já está configurada com Nginx e SSL. Agora vamos subir a aplicação usando Docker para resolver o erro **502 Bad Gateway**.

## 1. Enviando os Arquivos (PowerShell)
Abra o PowerShell no seu computador e rode o comando abaixo para enviar o projeto para a VPS:

```powershell
scpi -i "$env:USERPROFILE\.ssh\id_rsa_workly" -r "c:\Users\Davi\OneDrive\Área de Trabalho\workly" seu_usuario@SEU_IP:/home/seu_usuario/
```
> [!IMPORTANT]
> Substitua `seu_usuario` pelo seu login da VPS (ex: `davi`) e `SEU_IP` pelo IP do seu servidor.

## 2. Acessando e Preparando o Servidor
Acesse a VPS via SSH:
```powershell
ssh -i "$env:USERPROFILE\.ssh\id_rsa_workly" seu_usuario@SEU_IP
```

**Verifique se o Docker está instalado:**
```bash
docker compose version
```
*Se der erro de "command not found", instale com:*
```bash
sudo apt update && sudo apt install docker.io docker-compose-v2 -y
sudo usermod -aG docker $USER
# SAIA DO TERMINAL (exit) E ENTRE NOVAMENTE para aplicar as permissões.
```

## 3. Iniciando a Aplicação
Dentro da VPS, entre na pasta e suba o container:

```bash
cd ~/workly
docker compose up -d --build
```

## 4. Como o Fluxo Funciona
1. **Nginx da VPS (443)** -> Recebe o HTTPS do domínio.
2. **Reverse Proxy** -> Repassa para `localhost:3000`.
3. **Docker (3000)** -> Recebe a conexão e entrega a aplicação React.

## 5. Verificação
```bash
docker ps
```
Se aparecer `workly-frontend` com status **Up**, seu site `worklly.com.br` já estará no ar com as novas melhorias! 🔓✨
