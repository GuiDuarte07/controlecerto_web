# Page Design — Módulo de Chamados/Ajuda (desktop-first)

## Global Styles (aplicável a todas as páginas)
- Layout base: reutilizar `AppLayout` com Sidebar + Header (padrão atual do app).
- Grid/spacing: container central com `max-width` consistente; grid de 12 colunas no desktop; gaps 16–24px.
- Tipografia: escala já usada no app (títulos 20–28px; corpo 14–16px).
- Cores: seguir tokens do tema (light/dark) e componentes shadcn/ui.
- Botões: primário (ações), secundário (cancelar), destrutivo (encerrar chamado), estados hover/focus visíveis.
- Componentes base: Card, Tabs, Badge (status), Dialog/Drawer (criar chamado), ScrollArea (lista de mensagens).

---

## 1) Página: Chamados (Usuário)
### Layout
- Estrutura: two-column (desktop)
  - Coluna esquerda: filtros + CTA “Novo chamado”.
  - Coluna direita: lista/tabela de chamados.
- CSS: Flexbox para a estrutura geral; lista em coluna; filtros em Card.

### Meta Information
- Title: "Chamados | ControleCerto"
- Description: "Acompanhe e crie chamados de suporte."
- OG: title/description iguais; `og:type=website`.

### Page Structure
1. Header da página
   - Título: “Chamados”
   - Subtítulo: “Acompanhe suas solicitações e respostas do suporte.”
2. Card de Ações
   - Botão primário: “Novo chamado” (abre Dialog/Drawer)
3. Card de Filtros
   - Select: Status (Todos, Aberto, Em atendimento, Aguardando você, Resolvido, Fechado)
   - Input: Buscar por assunto
4. Lista de Chamados
   - Cada item em Card/Row: assunto, status (Badge), “última atualização”, indicador de “aguardando resposta”
   - Ação: clicar abre `/tickets/[id]`
5. Dialog/Drawer “Novo chamado”
   - Campos: Assunto, Descrição
   - Upload: componente de anexos (drag-and-drop + lista de arquivos)
   - Botões: Criar / Cancelar

### Responsivo
- Mobile: uma coluna; filtros colapsáveis; “Novo chamado” fixo no topo.

---

## 2) Página: Detalhe do Chamado (Chat + Anexos)
### Layout
- Estrutura: split-view (desktop)
  - Esquerda (70%): conversa.
  - Direita (30%): informações do chamado + anexos.
- CSS: Grid para colunas; ScrollArea para feed.

### Meta Information
- Title: "Chamado #{id} | ControleCerto"
- Description: "Conversa e histórico do seu chamado."

### Page Structure
1. Header
   - Breadcrumb: Chamados > Chamado #{id}
   - Status Badge + prioridade (se exibida)
   - Ação: “Encerrar chamado” (confirm dialog)
2. Área de Conversa
   - Lista de mensagens (bolhas/itens em Card)
     - Identificar autor: Você vs Admin
     - Timestamp
     - Anexos da mensagem (chips/links)
   - Estado vazio (se aplicável)
3. Composer (enviar mensagem)
   - Textarea
   - Botão: “Anexar” + lista de arquivos pendentes
   - Botão primário: “Enviar”
4. Painel Lateral
   - Card “Detalhes”: assunto, criado em, última atualização, status
   - Card “Anexos do Chamado”: lista agregada (download)

### Interações
- Atualização assíncrona: botão “Atualizar” e/ou polling leve (ex.: 10–20s) para novas mensagens.
- Feedback: toast ao enviar mensagem/anexo; estados loading/disabled.
- Aviso: ao receber atualização (notificação interna), permitir abrir o chamado diretamente.

---

## 3) Página: Chamados (Admin)
### Layout
- Estrutura: triagem + detalhe (desktop)
  - Esquerda: fila com filtros (40%).
  - Direita: detalhe/atendimento (60%).
- CSS: Grid + ScrollArea para lista.

### Meta Information
- Title: "Chamados (Admin) | ControleCerto"
- Description: "Fila de atendimento e resposta aos usuários."

### Page Structure
1. Header
   - Título: “Chamados (Admin)”
2. Coluna Fila
   - Filtros: Status, Prioridade, Busca por usuário/assunto
   - Lista: cards com usuário, assunto, status, última atualização
3. Coluna Detalhe
   - Resumo do chamado (Card)
   - Conversa (mesma UI do usuário, com destaque “Admin”)
   - Composer de resposta (Textarea + anexos + Enviar)
   - Controles de atendimento
     - Select Status (inclui “Aguardando usuário”)
     - Select Prioridade
     - Botão “Encerrar” (confirm)

### Estados e Permissões
- Guard de rota: permitir acesso apenas se `IsAdmin`.
- Estado vazio: “Selecione um chamado na fila”.

### Deep link
- Suportar URL direta para atendimento em `/admin/tickets/[id]`.
