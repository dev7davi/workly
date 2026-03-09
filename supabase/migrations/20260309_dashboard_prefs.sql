-- ─── dashboard_preferences ──────────────────────────────────────────────────
create table if not exists public.dashboard_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  show_financial_summary boolean default true,
  show_today_agenda boolean default true,
  show_revenue_chart boolean default true,
  show_cost_chart boolean default true,
  show_clients_widget boolean default true,
  show_notifications_widget boolean default true,
  default_calendar_view text default 'month',
  default_dashboard text default 'overview',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.dashboard_preferences enable row level security;

create policy "Users can view own preferences" on public.dashboard_preferences for select using (auth.uid() = user_id);
create policy "Users can insert own preferences" on public.dashboard_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own preferences" on public.dashboard_preferences for update using (auth.uid() = user_id);

-- ─── reminders_log ────────────────────────────────────────────────────────
create table if not exists public.reminders_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  channel text not null,
  sent_at timestamptz null,
  status text not null default 'pending',
  error_message text null,
  created_at timestamptz default now()
);

alter table public.reminders_log enable row level security;

create policy "Users can view own reminders" on public.reminders_log for select using (auth.uid() = user_id);
create policy "Users can insert own reminders" on public.reminders_log for insert with check (auth.uid() = user_id);
create policy "Users can update own reminders" on public.reminders_log for update using (auth.uid() = user_id);
create policy "Users can delete own reminders" on public.reminders_log for delete using (auth.uid() = user_id);
