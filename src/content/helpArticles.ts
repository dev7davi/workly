export interface HelpArticleContent {
  slug: string;
  title: string;
  category: string;
  content: string;
}

export const helpArticles: HelpArticleContent[] = [
  {
    slug: "como-cadastrar-clientes",
    title: "Como Cadastrar Clientes",
    category: "clientes",
    content: `
O cadastro de clientes é o primeiro passo para organizar sua base e iniciar o relacionamento comercial.

## Passo a Passo:

1.  **Acesse o Módulo Clientes:** No menu lateral do Worklly, clique em "Clientes".
2.  **Inicie um Novo Cadastro:** Na tela de Clientes, localize e clique no botão "Novo Cliente" (geralmente um botão com um ícone de "+" ou "Adicionar").
3.  **Preencha os Dados Essenciais:**
    *   **Nome Completo/Razão Social:** Insira o nome do cliente ou o nome da empresa.
    *   **CPF/CNPJ:** Digite o número do documento de identificação.
    *   **E-mail:** Forneça um endereço de e-mail válido para comunicação.
    *   **Telefone:** Inclua o número de contato principal.
    *   **Endereço:** Preencha os dados de endereço (CEP, Rua, Número, Bairro, Cidade, Estado).
4.  **Dados Opcionais (Recomendado):** Preencha informações adicionais como data de nascimento, observações, ou dados de contato secundários, se aplicável.
5.  **Salve o Cadastro:** Após preencher todas as informações, clique no botão "Salvar" ou "Cadastrar" para finalizar.

> [!TIP]
> **Dica:** Mantenha as informações do cliente sempre atualizadas para garantir uma comunicação eficaz e um bom relacionamento.
`
  },
  {
    slug: "importacao-de-catalogo",
    title: "Importação de Catálogo",
    category: "clientes",
    content: `
A importação de catálogo permite adicionar múltiplos clientes ou serviços de uma só vez, agilizando o processo de configuração inicial.

## Passo a Passo:

1.  **Acesse a Função de Importação:** No módulo "Clientes" (ou "Serviços", dependendo do que você deseja importar), procure por um botão ou link como "Importar" ou "Importar Catálogo".
2.  **Baixe o Modelo (Template):** A maioria das ferramentas de importação oferece um modelo de planilha (CSV ou Excel). Baixe este modelo para garantir que você preencha os dados no formato correto.
3.  **Preencha a Planilha:**
    *   Abra o modelo baixado em um editor de planilhas (Excel, Google Sheets, LibreOffice Calc).
    *   Preencha cada coluna com as informações correspondentes aos seus clientes ou serviços. **Atenção:** Siga rigorosamente o formato das colunas do modelo para evitar erros.
    *   Certifique-se de que não há linhas em branco ou dados inconsistentes.
4.  **Salve a Planilha:** Salve o arquivo no formato .csv (valores separados por vírgula) ou no formato de planilha original, conforme a instrução do Worklly.
5.  **Faça o Upload do Arquivo:** Volte para a tela de importação no Worklly e clique em "Escolher Arquivo" ou "Upload". Selecione a planilha que você preencheu.
6.  **Revise e Confirme:** O Worklly pode apresentar uma prévia dos dados a serem importados. Revise cuidadosamente e confirme a importação.

> [!TIP]
> **Dica:** Para grandes volumes de dados, faça testes com um pequeno número de registros primeiro para garantir que o formato está correto.
`
  },
  {
    slug: "gestao-de-inadimplencia",
    title: "Gestão de Inadimplência",
    category: "clientes",
    content: `
Gerenciar a inadimplência é fundamental para a saúde financeira do seu negócio. O Worklly oferece ferramentas para identificar e acompanhar clientes com pagamentos em atraso.

## Passo a Passo:

1.  **Acesse o Relatório de Inadimplência:** No módulo "Financeiro" ou "Clientes", procure por uma seção ou relatório chamado "Inadimplência", "Contas a Receber" ou similar.
2.  **Filtre e Visualize:** Utilize os filtros disponíveis (período, valor, status do cliente) para visualizar os clientes com pagamentos em atraso.
3.  **Analise os Detalhes:** Clique no nome do cliente ou na transação para ver detalhes como:
    *   Valor devido.
    *   Data de vencimento original.
    *   Dias em atraso.
    *   Histórico de contato.
4.  **Tome Ações:**
    *   **Envie Lembretes:** Utilize a funcionalidade de envio de lembretes automáticos ou manuais (por e-mail, WhatsApp) diretamente pelo Worklly.
    *   **Registre Contatos:** Anote todas as interações com o cliente (ligações, e-mails) na ficha do cliente para manter um histórico.
    *   **Negocie:** Se possível, ofereça opções de parcelamento ou renegociação.
5.  **Atualize o Status:** Após o pagamento ou acordo, atualize o status da dívida no sistema para manter os registros precisos.

> [!TIP]
> **Dica:** Configure lembretes automáticos para clientes antes mesmo do vencimento para reduzir a taxa de inadimplência.
`
  },
  {
    slug: "primeira-os",
    title: "Criando sua Primeira O.S.",
    category: "servicos",
    content: `
A Ordem de Serviço (O.S.) é o documento que formaliza a prestação de um serviço, detalhando o que será feito, para quem e por qual valor.

## Passo a Passo:

1.  **Acesse o Módulo O.S.:** No menu lateral, clique em "Serviços & O.S." ou diretamente em "O.S.".
2.  **Inicie uma Nova O.S.:** Clique no botão "Nova O.S." ou "Criar O.S.".
3.  **Selecione o Cliente:** Escolha o cliente para quem o serviço será prestado. Se o cliente não estiver cadastrado, você pode cadastrá-lo na hora ou fazê-lo previamente no módulo "Clientes".
4.  **Adicione os Serviços:**
    *   Pesquise e selecione os serviços que serão realizados. Se os serviços já estiverem cadastrados no seu catálogo, eles aparecerão com seus respectivos preços.
    *   Ajuste a quantidade, preço unitário ou adicione descontos, se necessário.
5.  **Detalhes da O.S.:**
    *   **Data de Abertura/Previsão de Conclusão:** Defina as datas relevantes.
    *   **Descrição do Problema/Serviço:** Detalhe o escopo do trabalho.
    *   **Observações Internas:** Adicione notas que só serão visíveis para sua equipe.
6.  **Anexos (Opcional):** Se houver fotos, documentos ou outros arquivos relevantes, anexe-os à O.S.
7.  **Salve e Gere a O.S.:** Clique em "Salvar" ou "Gerar O.S.". A O.S. será criada e você poderá acompanhar seu status.

> [!TIP]
> **Dica:** Utilize modelos de O.S. para serviços recorrentes, agilizando a criação.
`
  },
  {
    slug: "personalizacao-comprovante",
    title: "Personalização de Comprovante",
    category: "servicos",
    content: `
O comprovante é o documento entregue ao cliente após a conclusão do serviço ou pagamento. Personalizá-lo reforça sua marca.

## Passo a Passo:

1.  **Acesse as Configurações:** No menu principal, procure por "Configurações", "Ajustes" ou "Configurações da Empresa".
2.  **Localize a Seção de Comprovantes:** Dentro das configurações, procure por "Comprovantes", "Modelos de Documentos" ou "Impressão".
3.  **Edite o Modelo:**
    *   Você poderá adicionar seu logotipo.
    *   Incluir informações de contato da empresa (endereço, telefone, e-mail).
    *   Personalizar mensagens de rodapé (agradecimento, política de garantia).
    *   Escolher cores e fontes (se disponível).
4.  **Pré-visualize:** Utilize a função de pré-visualização para ver como o comprovante ficará antes de salvar.
5.  **Salve as Alterações:** Clique em "Salvar" ou "Aplicar" para que as personalizações entrem em vigor.

> [!TIP]
> **Dica:** Um comprovante bem personalizado transmite profissionalismo e fortalece a imagem da sua marca.
`
  },
  {
    slug: "status-servico",
    title: "Status de Cada Serviço",
    category: "servicos",
    content: `
O acompanhamento do status dos serviços permite que você e sua equipe saibam exatamente em que fase cada trabalho se encontra, otimizando a gestão e a comunicação com o cliente.

## Passo a Passo:

1.  **Acesse a Lista de O.S./Serviços:** No módulo "Serviços & O.S.", você verá uma lista de todas as Ordens de Serviço ou serviços em andamento.
2.  **Visualize o Status:** Cada O.S. terá um indicador de status (ex: "Pendente", "Em Andamento", "Aguardando Peças", "Concluído", "Cancelado").
3.  **Altere o Status:**
    *   Clique na O.S. desejada para abrir seus detalhes.
    *   Procure por um campo ou botão de "Status" e selecione a nova situação do serviço.
    *   **Importante:** Algumas transições de status podem gerar notificações automáticas para o cliente ou para a equipe.
4.  **Adicione Observações:** Ao alterar o status, adicione observações relevantes sobre o motivo da mudança ou próximos passos.

> [!TIP]
> **Dica:** Mantenha os status sempre atualizados para ter uma visão clara da carga de trabalho e do progresso dos serviços.
`
  },
  {
    slug: "entendendo-dre",
    title: "Entendendo o DRE",
    category: "financeiro",
    content: `
O DRE (Demonstrativo de Resultado do Exercício) é um relatório contábil que resume as operações financeiras de uma empresa em um período, mostrando se houve lucro ou prejuízo.

## Passo a Passo:

1.  **Acesse o Relatório DRE:** No módulo "Financeiro", procure por "Relatórios" e selecione "DRE" ou "Demonstrativo de Resultado".
2.  **Defina o Período:** Escolha o período que deseja analisar (mês, trimestre, ano).
3.  **Analise as Seções:** O DRE geralmente apresenta:
    *   **Receita Bruta:** Total de vendas de serviços.
    *   **Deduções e Abatimentos:** Impostos sobre vendas, devoluções.
    *   **Receita Líquida:** Receita Bruta menos Deduções.
    *   **Custos dos Serviços Prestados (CSP):** Gastos diretos para realizar os serviços.
    *   **Lucro Bruto:** Receita Líquida menos CSP.
    *   **Despesas Operacionais:** Gastos com vendas, administrativas, financeiras.
    *   **Lucro/Prejuízo Operacional:** Lucro Bruto menos Despesas Operacionais.
    *   **Resultado Líquido:** O lucro ou prejuízo final após todas as receitas e despesas.

> [!TIP]
> **Dica:** Compare o DRE de diferentes períodos para identificar tendências e tomar decisões estratégicas.
`
  },
  {
    slug: "gestao-de-despesas",
    title: "Gestão de Despesas",
    category: "financeiro",
    content: `
Controlar as despesas é vital para a lucratividade. O Worklly permite registrar e categorizar todos os seus gastos.

## Passo a Passo:

1.  **Acesse o Módulo de Despesas:** No módulo "Financeiro", clique em "Despesas" ou "Contas a Pagar".
2.  **Registre uma Nova Despesa:** Clique em "Nova Despesa" ou "Adicionar Gasto".
3.  **Preencha os Detalhes:**
    *   **Descrição:** Breve resumo do gasto (ex: "Aluguel do escritório", "Compra de material").
    *   **Valor:** O montante da despesa.
    *   **Data de Vencimento/Pagamento:** Quando a despesa deve ser paga ou foi paga.
    *   **Categoria:** Classifique a despesa (ex: "Aluguel", "Marketing", "Salários", "Material de Escritório"). A categorização é crucial para o DRE.
    *   **Forma de Pagamento:** Como a despesa foi paga (dinheiro, cartão, pix).
    *   **Anexos (Opcional):** Anexe notas fiscais ou comprovantes.
4.  **Salve a Despesa:** Clique em "Salvar" ou "Registrar".

> [!TIP]
> **Dica:** Crie categorias de despesas claras e utilize-as consistentemente para ter relatórios financeiros precisos.
`
  },
  {
    slug: "fluxo-de-caixa",
    title: "Fluxo de Caixa",
    category: "financeiro",
    content: `
O fluxo de caixa mostra a movimentação de dinheiro (entradas e saídas) em um período, indicando a capacidade da empresa de gerar caixa.

## Passo a Passo:

1.  **Acesse o Relatório de Fluxo de Caixa:** No módulo "Financeiro", procure por "Relatórios" e selecione "Fluxo de Caixa".
2.  **Defina o Período:** Escolha o período de análise (diário, semanal, mensal).
3.  **Analise as Entradas e Saídas:**
    *   **Entradas:** Dinheiro que entrou na empresa (recebimentos de clientes, vendas).
    *   **Saídas:** Dinheiro que saiu da empresa (pagamento de despesas, salários).
    *   **Saldo:** A diferença entre entradas e saídas, mostrando o saldo final do período.
4.  **Identifique Padrões:** Observe os períodos de maior entrada e saída para planejar suas finanças.

> [!TIP]
> **Dica:** Um fluxo de caixa positivo é essencial. Se estiver negativo, revise suas despesas e estratégias de recebimento.
`
  },
  {
    slug: "diferenca-entre-os-planos",
    title: "Diferença entre os Planos",
    category: "planos",
    content: `
Entender as características de cada plano é fundamental para escolher a opção que melhor se adapta às suas necessidades.

## Passo a Passo:

1.  **Acesse a Página de Planos:** No Worklly, procure por uma seção como "Planos", "Minha Assinatura" ou "Upgrade".
2.  **Compare os Planos:** A página geralmente apresenta uma tabela comparativa com os diferentes planos disponíveis (ex: Básico, Pro, Premium).
3.  **Analise os Recursos:** Para cada plano, observe:
    *   **Preço:** Custo mensal ou anual.
    *   **Recursos Incluídos:** Número de usuários, funcionalidades específicas (ex: relatórios avançados, integrações, suporte prioritário).
    *   **Limites:** Limite de clientes, O.S., armazenamento.
    *   **Benefícios Adicionais:** Suporte dedicado, treinamentos.

> [!TIP]
> **Dica:** Escolha um plano que atenda às suas necessidades atuais, mas que também permita escalar conforme seu negócio cresce.
`
  },
  {
    slug: "como-cancelar",
    title: "Como Cancelar",
    category: "planos",
    content: `
O processo de cancelamento de uma assinatura deve ser claro e transparente.

## Passo a Passo:

1.  **Acesse as Configurações de Assinatura:** No menu principal, vá para "Configurações", "Minha Conta" ou "Assinatura".
2.  **Localize a Opção de Cancelamento:** Procure por um botão ou link como "Gerenciar Assinatura", "Cancelar Plano" ou "Alterar Plano".
3.  **Siga as Instruções:** O Worklly pode pedir um motivo para o cancelamento ou oferecer alternativas (pausar assinatura, downgrade de plano).
4.  **Confirme o Cancelamento:** Leia atentamente as informações sobre o cancelamento (ex: data de efetivação, reembolso) e confirme a ação.
5.  **Verifique a Confirmação:** Você deverá receber um e-mail de confirmação do cancelamento.

> [!TIP]
> **Dica:** Antes de cancelar, verifique se há alguma opção de downgrade que possa atender às suas necessidades temporariamente.
`
  },
  {
    slug: "metodos-de-pagamento",
    title: "Métodos de Pagamento",
    category: "planos",
    content: `
Gerenciar seus métodos de pagamento garante que sua assinatura permaneça ativa e sem interrupções.

## Passo a Passo:

1.  **Acesse as Configurações de Pagamento:** No menu principal, vá para "Configurações", "Minha Conta" ou "Assinatura" e procure por "Métodos de Pagamento" ou "Informações de Cobrança".
2.  **Adicione um Novo Método:** Clique em "Adicionar Cartão", "Adicionar Pix" ou "Adicionar Outro Método".
3.  **Preencha os Dados:** Insira as informações do seu cartão de crédito/débito, dados bancários ou outras informações solicitadas.
4.  **Defina o Método Principal:** Se você tiver múltiplos métodos, selecione qual será o principal para cobranças futuras.
5.  **Atualize/Remova Métodos Existentes:** Você também pode editar as informações de um cartão existente ou remover um método de pagamento que não usa mais.

> [!TIP]
> **Dica:** Mantenha sempre um método de pagamento válido e atualizado para evitar interrupções no serviço.
`
  },
  {
    slug: "mensal-vs-anual",
    title: "Mensal vs. Anual: Qual é a melhor opção?",
    category: "planos",
    content: `
Escolher entre o plano mensal e o anual depende do seu planejamento e do quanto você deseja economizar no longo prazo.

## Vantagens do Plano Anual:

*   **Economia Significativa:** Ao optar pelo plano anual, você recebe um desconto de **17%**. Isso equivale a pagar por 10 meses e ganhar 2 meses totalmente grátis.
*   **Praticidade:** Você faz apenas um pagamento por ano, evitando preocupações mensais com boletos ou faturas no cartão.
*   **Fator de Investimento:** Ideal para quem já validou o uso do Worklly e quer garantir a ferramenta pelo menor preço possível.

## Comparação de Economia:

| Plano | Economia Anual |
| :--- | :--- |
| **Start** | Economize R$ 39,80/ano |
| **Pro** | Economize R$ 79,80/ano |
| **Pro+** | Economize R$ 139,80/ano |

## Como Alternar entre os Planos?
Na página de [Planos & Assinatura](/app/plans), você encontrará um interruptor (toggle) no topo. Basta alternar para "Anual" para ver os valores com desconto e realizar o upgrade.

> [!TIP]
> **Dica:** Se você está começando, o plano mensal é ótimo para testes. Assim que se sentir seguro, mude para o anual e garanta sua economia!
`
  }
];
