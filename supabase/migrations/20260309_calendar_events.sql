-- ─── calendar_events ──────────────────────────────────────────────────────────
create table if not exists public.calendar_events (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,

  -- Core fields
  tipo_evento     text not null default 'compromisso'
                  check (tipo_evento in (
                    'servico_agendado','visita_tecnica','retorno',
                    'cobranca_agendada','vencimento_pagamento',
                    'compromisso_pessoal','compromisso_profissional',
                    'lembrete','entrega','manutencao','revisao',
                    'prazo_orcamento','prazo_contrato','follow_up','compromisso'
                  )),
  titulo          text not null,
  descricao       text,

  -- Timing
  data_inicio     date not null,
  hora_inicio     time,
  data_fim        date,
  hora_fim        time,
  dia_inteiro     boolean default false,

  -- Links
  cliente_id      uuid references public.clients(id) on delete set null,
  servico_id      uuid,  -- soft ref to services
  financeiro_id   uuid,  -- soft ref to future finance table

  -- Meta
  prioridade      text default 'normal' check (prioridade in ('baixa','normal','alta','urgente')),
  status          text default 'agendado'
                  check (status in ('agendado','confirmado','em_andamento','concluido','cancelado','adiado','atrasado')),
  cor             text default '#6366f1',

  -- Reminder
  lembrete_ativo         boolean default false,
  minutos_antes_lembrete integer default 30,

  -- Origin
  origem          text default 'manual' check (origem in ('manual','servico','cobranca','sistema')),

  -- Extra
  endereco        text,
  observacoes     text,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- RLS
alter table public.calendar_events enable row level security;

create policy "Users can view own events"   on public.calendar_events for select using (auth.uid() = user_id);
create policy "Users can insert own events" on public.calendar_events for insert with check (auth.uid() = user_id);
create policy "Users can update own events" on public.calendar_events for update using (auth.uid() = user_id);
create policy "Users can delete own events" on public.calendar_events for delete using (auth.uid() = user_id);

-- Index
create index if not exists calendar_events_user_date_idx on public.calendar_events(user_id, data_inicio);

-- Auto-updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger calendar_events_updated_at
  before update on public.calendar_events
  for each row execute function update_updated_at();
