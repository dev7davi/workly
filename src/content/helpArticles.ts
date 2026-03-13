export interface HelpArticleContent {
  slug: string;
  title: string;
  category: string;
  content: string;
}

export const helpArticles: HelpArticleContent[] = [
  {
    slug: "cadastro-clientes",
    title: "Como Cadastrar Clientes",
    category: "clientes",
    content: `
O cadastro de clientes é o primeiro passo para organizar sua base e agilizar a criação de serviços no Workly. Com uma base bem preenchida, você consegue emitir recibos e ordens de serviço em segundos.

## Passo a Passo para um Cadastro Perfeito:

1. **Acesse o Módulo Clientes:** No menu inferior ou lateral, clique no ícone de pessoas (Clientes).
2. **Inicie um Novo Cadastro:** Clique no botão flutuante "+" ou no botão "Novo Cliente" no topo da tela.
3. **Preencha os Dados Essenciais:**
    *   **Nome Completo/Razão Social:** Campo obrigatório para identificação.
    *   **Telefone:** Fundamental para o botão de cobrança via WhatsApp.
    *   **CPF/CNPJ:** Necessário para uma organização mais profissional.
4. **Endereço Completo:** Preencha para que a Ordem de Serviço (PDF) saia com todos os dados do local do atendimento.
5. **Salve o Cadastro:** Após preencher, clique em "Salvar".

> [!TIP]
> **Dica de mestre:** Se você começar um Novo Serviço para um cliente que ainda não existe, pode digitar o nome dele diretamente no campo de busca e o Workly oferecerá para criar o cadastro automaticamente!

## Por que manter os dados atualizados?
Manter o telefone e o endereço corretos permite que você use a função de **Rota no GPS** e **Cobrança um clique** diretamente pelo Dashboard.
    `
  },
  {
    slug: "limites-planos",
    title: "Entenda os Limites do seu Plano",
    category: "planos",
    content: `
O Workly utiliza um sistema de limites mensais para garantir a sustentabilidade da plataforma. Cada plano possui uma capacidade diferente de armazenamento e criação.

## Como funcionam os limites?

*   **Clientes Ativos:** É o número total de clientes que você pode ter cadastrados simultaneamente.
*   **Serviços Criados no Mês:** Este é um contador anti-burla. Ele conta quantos serviços você iniciou no mês corrente. Mesmo que você delete um serviço, ele continua contando na sua cota mensal.

## Tabela de Limites:

| Plano | Clientes Ativos | Serviços p/ Mês |
| :--- | :--- | :--- |
| **Grátis** | Até 10 | Até 20 |
| **Start** | Até 50 | Até 100 |
| **Pro** | Ilimitado | Ilimitado |
| **Pro+** | Ilimitado | Ilimitado + Custos |

## Quando o limite reseta?
O contador de serviços criados reseta automaticamente no **primeiro dia de cada mês**. Se você atingiu o limite e precisa cadastrar mais hoje, recomendamos fazer o upgrade para o plano Start ou Pro.

> [!IMPORTANT]
> Se você deletar um cliente, uma "vaga" de cliente ativo será liberada imediatamente. No entanto, o contador de serviços criados só libera espaço no início do próximo mês.
    `
  },
  {
    slug: "financeiro-agenda",
    title: "Organizando sua Agenda e Financeiro",
    category: "financeiro",
    content: `
A integração entre a Agenda e o Financeiro é o que torna o Workly poderoso. Todo serviço cadastrado com uma data de pagamento alimenta automaticamente seus relatórios.

## Dicas de Organização:

1. **Datas de Pagamento:** Sempre que finalizar um serviço, registre a data em que espera receber. Isso gera alertas no seu Dashboard.
2. **Status de Pagamento:** Mude para "Pago" assim que o dinheiro cair na conta para manter seu gráfico de receita fiel à realidade.
3. **Uso da Agenda:** Use a Agenda para compromissos que não são necessariamente serviços cobrados, como visitas técnicas ou orçamentos.

## Visualizando sua Evolução:
No módulo **Financeiro**, você encontra o gráfico de evolução. A linha sólida representa o que você já recebeu, e a linha pontilhada o que ainda tem a receber (pendente).
    `
  }
];
