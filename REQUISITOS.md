# Requisitos da Aplicação - Simulador Financeiro

## 1. Requisitos Funcionais

### 1.1 Gestão de Dados Mestres

#### 1.1.1 Gestão de Projetos
- **RF001**: O sistema deve permitir criar, visualizar, editar e eliminar projetos
- **RF002**: Cada projeto deve ter um identificador único (id_prj) e descrição opcional (desc_prj)
- **RF003**: O sistema deve listar todos os projetos ordenados por identificador

#### 1.1.2 Gestão de Linguagens
- **RF004**: O sistema deve permitir criar, visualizar, editar e eliminar linguagens
- **RF005**: Cada linguagem deve estar associada a um projeto específico
- **RF006**: Cada linguagem deve ter um identificador (id_lang) e descrição opcional (desc_lang)
- **RF007**: O sistema deve validar que uma linguagem só pode ser criada para projetos existentes

#### 1.1.3 Gestão de LOBs (Lines of Business)
- **RF008**: O sistema deve permitir criar, visualizar, editar e eliminar LOBs
- **RF009**: Cada LOB deve estar associado a uma linguagem específica
- **RF010**: Cada LOB deve ter um identificador (id_lob), nome e descrição opcional
- **RF011**: O sistema deve filtrar LOBs por projeto e linguagem selecionados
- **RF012**: O sistema deve validar que um LOB só pode ser criado para combinações projeto-linguagem existentes

#### 1.1.4 Hierarquia Integrada
- **RF013**: O sistema deve apresentar uma visualização hierárquica de Projetos → Linguagens → LOBs
- **RF014**: O sistema deve permitir navegação entre as diferentes entidades da hierarquia

### 1.2 Gestão de Templates de Simulação

#### 1.2.1 Criação e Manutenção de Templates
- **RF015**: O sistema deve permitir criar templates de simulação (configurações)
- **RF016**: Cada template deve ter um nome único
- **RF017**: Cada template deve estar associado a um projeto e uma linguagem específicos
- **RF018**: O sistema deve permitir editar e eliminar templates existentes
- **RF019**: O sistema deve carregar automaticamente o template correspondente ao selecionar projeto e linguagem

#### 1.2.2 Gestão de Variáveis do Template
- **RF020**: O sistema deve permitir adicionar variáveis a um template
- **RF021**: Cada variável deve ter:
  - Número de conta hierárquico (account_num) no formato X, X.Y, X.Y.Z
  - Nome descritivo
  - Tipo de cálculo (AUTO, MANUAL, FORMULA)
  - Fórmula (opcional, obrigatória se tipo = FORMULA)
  - Tipo de valor (number, percentage, etc.)
  - Estado de bloqueio (blocked)
- **RF022**: O sistema deve validar que o número de conta é obrigatório
- **RF023**: O sistema deve permitir ordenar variáveis hierarquicamente por número de conta
- **RF024**: O sistema deve apresentar variáveis com indentação visual baseada no nível hierárquico
- **RF025**: O sistema deve permitir editar e eliminar variáveis existentes

### 1.3 Simulador Dinâmico

#### 1.3.1 Interface e Navegação
- **RF026**: O sistema deve apresentar um simulador com visualização mensal (12 meses)
- **RF027**: O sistema deve permitir selecionar projeto e versão de simulação
- **RF028**: O sistema deve apresentar as variáveis em estrutura hierárquica expansível/colapsável
- **RF029**: O sistema deve calcular e apresentar totais anuais para cada variável
- **RF030**: O sistema deve indicar visualmente variáveis não editáveis (contas pai, fórmulas)

#### 1.3.2 Gestão de Versões
- **RF031**: O sistema deve permitir criar novas versões de simulação
- **RF032**: Cada versão deve ter um nome único e data de criação
- **RF033**: O sistema deve permitir alternar entre diferentes versões
- **RF034**: O sistema deve listar versões ordenadas por data de criação (mais recente primeiro)

#### 1.3.3 Cálculos e Edição de Valores
- **RF035**: O sistema deve permitir editar valores mensais de variáveis do tipo MANUAL e AUTO (folha)
- **RF036**: O sistema deve calcular automaticamente:
  - Valores de contas pai (soma dos filhos)
  - Valores de fórmulas (avaliação de expressões)
- **RF037**: O sistema deve suportar fórmulas com referências a outras contas usando sintaxe [account_code]
- **RF038**: O sistema deve atualizar cálculos em tempo real durante a edição
- **RF039**: O sistema deve validar e tratar erros em fórmulas

#### 1.3.4 Persistência de Dados
- **RF040**: O sistema deve permitir guardar alterações nas versões de simulação
- **RF041**: O sistema deve apresentar feedback visual do estado de gravação (idle, saving, success, error)
- **RF042**: O sistema deve persistir apenas valores de variáveis folha editáveis

### 1.4 Simulação por Mês/Ano

#### 1.4.1 Criação de Versões Anuais
- **RF043**: O sistema deve permitir criar versões de simulação para um ano específico
- **RF044**: Ao criar uma versão, o sistema deve:
  - Permitir selecionar projeto, linguagem e ano
  - Carregar template de configuração correspondente
  - Gerar 12 registos (meses) por variável do template
  - Criar um registo para cada combinação de variável × LOB × mês
- **RF045**: O sistema deve validar que projeto, linguagem, ano e nome da versão são obrigatórios
- **RF046**: O sistema deve copiar estrutura de variáveis do template selecionado

#### 1.4.2 Visualização e Edição
- **RF047**: O sistema deve permitir selecionar LOB específico para visualização
- **RF048**: O sistema deve filtrar e apresentar apenas variáveis do LOB selecionado
- **RF049**: O sistema deve permitir editar valores mensais por LOB
- **RF050**: O sistema deve apresentar estrutura hierárquica de contas por LOB

### 1.5 Gestão de Versões de Simulação

#### 1.5.1 Listagem e Filtros
- **RF051**: O sistema deve listar todas as versões criadas
- **RF052**: O sistema deve permitir filtrar versões por projeto
- **RF053**: O sistema deve apresentar informações de cada versão:
  - Nome
  - Projeto
  - Linguagem
  - Data de criação
  - Indicador de versão base
- **RF054**: O sistema deve ordenar versões por data de criação

#### 1.5.2 Operações sobre Versões
- **RF055**: O sistema deve permitir editar nome e notas de uma versão
- **RF056**: O sistema deve permitir marcar/desmarcar versão como base
- **RF057**: O sistema deve permitir eliminar versões
- **RF058**: O sistema deve solicitar confirmação antes de eliminar
- **RF059**: O sistema deve permitir reordenar versões (order_index)

### 1.6 Menu de Navegação

#### 1.6.1 Estrutura do Menu
- **RF060**: O sistema deve apresentar um menu lateral com as seguintes opções:
  - Simulador (simulador dinâmico)
  - Simulação (Mês/Ano)
  - Simulações (gestão de versões)
  - Configurações (templates)
  - Projetos (dados mestres)
- **RF061**: O sistema deve permitir abrir/fechar o menu lateral
- **RF062**: O sistema deve fechar automaticamente o menu após seleção
- **RF063**: O menu deve apresentar ícones distintivos para cada opção

## 2. Requisitos Não Funcionais

### 2.1 Performance
- **RNF001**: O sistema deve carregar listas de projetos em menos de 2 segundos
- **RNF002**: O cálculo de fórmulas deve ser executado em tempo real (<100ms)
- **RNF003**: A navegação entre versões deve ocorrer em menos de 1 segundo
- **RNF004**: O sistema deve suportar até 500 variáveis por configuração sem degradação

### 2.2 Usabilidade
- **RNF005**: A interface deve ser responsiva e funcionar em desktops (min 1280px)
- **RNF006**: O sistema deve apresentar feedback visual para todas as operações CRUD
- **RNF007**: O sistema deve utilizar mensagens de erro claras em português
- **RNF008**: A hierarquia de contas deve ter indentação visual proporcional ao nível
- **RNF009**: Campos numéricos não devem apresentar spinners (setas de incremento)

### 2.3 Confiabilidade
- **RNF010**: O sistema deve validar todos os inputs obrigatórios antes de persistir
- **RNF011**: O sistema deve tratar erros de fórmulas sem quebrar a aplicação
- **RNF012**: O sistema deve solicitar confirmação para operações destrutivas (delete)
- **RNF013**: O sistema deve manter consistência referencial entre entidades relacionadas

### 2.4 Segurança
- **RNF014**: O sistema deve implementar Row Level Security (RLS) em todas as tabelas
- **RNF015**: Dados de simulação devem ser associados a users (user_id) quando autenticado
- **RNF016**: Dados sem user_id devem ser acessíveis apenas quando não autenticado
- **RNF017**: O sistema deve validar permissões no backend (Supabase)

### 2.5 Manutenibilidade
- **RNF018**: O código deve seguir padrões TypeScript e React
- **RNF019**: Componentes devem ser modulares e reutilizáveis
- **RNF020**: O sistema deve utilizar biblioteca de componentes UI (shadcn/ui)
- **RNF021**: O sistema deve utilizar Tailwind CSS para estilos
- **RNF022**: Queries ao banco devem estar centralizadas nos componentes

### 2.6 Compatibilidade
- **RNF023**: O sistema deve funcionar nos navegadores modernos (Chrome, Firefox, Safari, Edge)
- **RNF024**: O sistema deve utilizar Supabase como backend
- **RNF025**: O sistema deve ser construído com React 18+ e Vite

## 3. Regras de Negócio

### 3.1 Hierarquia de Dados
- **RN001**: Linguagens dependem de Projetos (não pode existir linguagem sem projeto)
- **RN002**: LOBs dependem de Linguagens (não pode existir LOB sem linguagem)
- **RN003**: Templates dependem de Projeto e Linguagem
- **RN004**: Versões de simulação dependem de Projeto e Linguagem

### 3.2 Estrutura de Contas
- **RN005**: Números de conta seguem formato hierárquico: X, X.Y, X.Y.Z, etc.
- **RN006**: Contas pai não são editáveis (valores calculados pela soma dos filhos)
- **RN007**: Apenas contas folha (sem filhos) podem ter valores manuais
- **RN008**: Contas com cálculo FORMULA não são editáveis manualmente

### 3.3 Cálculos
- **RN009**: Contas do tipo AUTO calculam soma dos filhos se tiverem filhos
- **RN010**: Contas do tipo AUTO são editáveis se forem folha
- **RN011**: Contas do tipo MANUAL são sempre editáveis (se folha)
- **RN012**: Contas do tipo FORMULA avaliam expressão matemática
- **RN013**: Fórmulas podem referenciar outras contas usando [account_code]
- **RN014**: Referências circulares devem ser evitadas (não validado atualmente)

### 3.4 Versões de Simulação
- **RN015**: Uma versão anual gera 12 registos (meses) por variável por LOB
- **RN016**: Apenas uma versão pode ser marcada como "base" por vez (não enforçado)
- **RN017**: Versões são independentes entre si (não há versionamento incremental)

### 3.5 Templates
- **RN018**: Deve existir apenas um template ativo por combinação projeto-linguagem (não enforçado)
- **RN019**: Alterações no template não afetam versões já criadas
- **RN020**: Templates definem a estrutura inicial de novas versões

## 4. Modelo de Dados

### 4.1 Entidades Principais

#### Tabela: project
- `id_prj` (text, PK): Identificador do projeto
- `desc_prj` (text): Descrição do projeto
- `created_at` (timestamp): Data de criação

#### Tabela: lang
- `id_lang` (text, PK): Identificador da linguagem
- `id_prj` (text, FK): Referência ao projeto
- `desc_lang` (text): Descrição da linguagem
- `created_at` (timestamp): Data de criação

#### Tabela: lob
- `id_lob` (text, PK): Identificador do LOB
- `id_lang` (text, FK): Referência à linguagem
- `name` (text): Nome do LOB
- `desc_lob` (text): Descrição do LOB
- `created_at` (timestamp): Data de criação
- `updated_at` (timestamp): Data de atualização

#### Tabela: simulation_configs
- `id_sim_cfg` (uuid, PK): Identificador da configuração
- `name` (text): Nome da configuração
- `description` (text): Descrição
- `id_prj` (text): Referência ao projeto
- `id_lang` (text): Referência à linguagem
- `user_id` (text): Identificador do usuário
- `is_active` (boolean): Status ativo
- `created_at` (timestamp): Data de criação
- `updated_at` (timestamp): Data de atualização

#### Tabela: simulation_configs_variables
- `id_sim_cfg_var` (uuid, PK): Identificador da variável
- `id_sim_cfg` (uuid, FK): Referência à configuração
- `account_num` (text): Número da conta hierárquico
- `name` (text): Nome da variável
- `calculation_type` (varchar): Tipo de cálculo (AUTO/MANUAL/FORMULA)
- `formula` (text): Fórmula matemática
- `value_type` (text): Tipo do valor (number, percentage)
- `blocked` (boolean): Indica se está bloqueada
- `row_index` (integer): Ordem de exibição
- `id_proj` (text): Referência ao projeto
- `id_lang` (text): Referência à linguagem
- `created_at` (timestamp): Data de criação

#### Tabela: simulation_versions
- `id_sim_ver` (uuid, PK): Identificador da versão
- `name` (text): Nome da versão
- `id_prj` (text): Referência ao projeto
- `id_lang` (text): Referência à linguagem
- `user_id` (text): Identificador do usuário
- `notes` (text): Notas da versão
- `is_base` (boolean): Versão base
- `order_index` (integer): Ordem de exibição
- `data` (jsonb): Dados adicionais
- `created_at` (timestamp): Data de criação
- `updated_at` (timestamp): Data de atualização

#### Tabela: simulation
- `id_sim` (uuid, PK): Identificador do registro
- `version_id` (uuid, FK): Referência à versão
- `account_num` (text): Número da conta
- `name` (text): Nome da variável
- `id_proj` (text): Referência ao projeto
- `id_lang` (text): Referência à linguagem
- `id_lob` (text): Referência ao LOB
- `calculation_type` (varchar): Tipo de cálculo
- `formula` (text): Fórmula
- `value_type` (text): Tipo do valor
- `month` (smallint): Mês (1-12)
- `year` (integer): Ano
- `value` (double precision): Valor calculado/inserido
- `value_orig` (double precision): Valor original
- `row_index` (integer): Ordem
- `created_at` (timestamp): Data de criação

## 5. Casos de Uso Principais

### 5.1 UC001: Criar Estrutura de Projeto
**Ator**: Utilizador  
**Pré-condições**: Nenhuma  
**Fluxo**:
1. Criar projeto (id, descrição)
2. Criar linguagens para o projeto
3. Criar LOBs para cada linguagem
4. Sistema valida hierarquia

### 5.2 UC002: Configurar Template de Simulação
**Ator**: Utilizador  
**Pré-condições**: Projeto e linguagem existem  
**Fluxo**:
1. Selecionar projeto e linguagem
2. Criar/selecionar template
3. Adicionar variáveis com números de conta hierárquicos
4. Definir tipos de cálculo e fórmulas
5. Ordenar variáveis
6. Sistema grava template

### 5.3 UC003: Criar Versão Anual de Simulação
**Ator**: Utilizador  
**Pré-condições**: Template configurado  
**Fluxo**:
1. Selecionar projeto, linguagem e ano
2. Informar nome da versão
3. Sistema carrega template correspondente
4. Sistema gera 12 registos × variáveis × LOBs
5. Sistema cria versão com estrutura completa

### 5.4 UC004: Editar Simulação por LOB
**Ator**: Utilizador  
**Pré-condições**: Versão criada  
**Fluxo**:
1. Selecionar versão
2. Selecionar LOB
3. Sistema apresenta variáveis do LOB em estrutura hierárquica
4. Editar valores mensais de contas folha
5. Sistema calcula contas pai automaticamente
6. Sistema avalia fórmulas
7. Gravar alterações

### 5.5 UC005: Simular Cenários no Simulador Dinâmico
**Ator**: Utilizador  
**Pré-condições**: Versão criada  
**Fluxo**:
1. Selecionar projeto e versão
2. Sistema apresenta todas as variáveis em formato mensal
3. Expandir/colapsar hierarquia
4. Editar valores de contas folha editáveis
5. Sistema recalcula em tempo real
6. Visualizar totais anuais
7. Gravar simulação

## 6. Melhorias Futuras (Backlog)

### 6.1 Funcionalidades
- **MF001**: Exportação para Excel/CSV
- **MF002**: Importação de dados em massa
- **MF003**: Comparação entre versões (diff)
- **MF004**: Gráficos e dashboards de análise
- **MF005**: Cópia de versões (duplicar)
- **MF006**: Histórico de alterações (audit log)
- **MF007**: Comentários e anotações em variáveis
- **MF008**: Múltiplos anos na mesma visualização
- **MF009**: Validação de fórmulas (referências circulares)
- **MF010**: Editor de fórmulas com autocomplete
- **MF011**: Agrupamento por categorias personalizadas
- **MF012**: Permissões granulares por usuário/projeto
- **MF013**: Notificações e alertas de valores fora de ranges

### 6.2 Técnicas
- **MT001**: Testes automatizados (unit, integration)
- **MT002**: Otimização de queries com indexes
- **MT003**: Cache de cálculos complexos
- **MT004**: Paginação para grandes volumes
- **MT005**: WebSockets para colaboração em tempo real
- **MT006**: PWA (Progressive Web App)
- **MT007**: Logs estruturados e monitoring
- **MT008**: Backup automático de versões

---

**Documento de Requisitos - Versão 1.0**  
**Data**: 2025  
**Autor**: Gerado automaticamente com base na análise do código
