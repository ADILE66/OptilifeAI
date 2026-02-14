-- OPTILIFE AI - SUPABASE SCHEMA SETUP
-- Copiez et collez ce script dans l'éditeur SQL de votre Dashboard Supabase

-- 1. Table des PROFILES (extension de auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  avatar_url text,
  role text default 'user',
  onboarding_completed boolean default false,
  is_pro_member boolean default false,
  trial_started_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Table des OBJECTIFS (Goals)
create table user_goals (
  user_id uuid references auth.users on delete cascade primary key,
  calories integer default 2000,
  protein integer default 150,
  carbs integer default 250,
  fat integer default 70,
  water_ml integer default 2500,
  activity_minutes integer default 30,
  fasting_hours integer default 16,
  sleep_hours integer default 8,
  target_weight float,
  updated_at timestamp with time zone default now()
);

-- 3. Table des LOGS D'HYDRATATION
create table water_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount_ml integer not null,
  created_at timestamp with time zone default now()
);

-- 4. Table des LOGS DE NOURRITURE
create table food_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  portion text,
  calories integer,
  protein integer,
  carbs integer,
  fat integer,
  image_url text,
  created_at timestamp with time zone default now()
);

-- 5. Table des LOGS D'ACTIVITÉ
create table activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  activity_name text not null,
  duration_minutes integer not null,
  calories_burned integer,
  steps integer,
  icon text,
  created_at timestamp with time zone default now()
);

-- 6. Table des LOGS DE JEÛNE
create table fasting_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  goal_hours integer,
  status text check (status in ('active', 'completed')),
  created_at timestamp with time zone default now()
);

-- 7. Table des LOGS DE SOMMEIL
create table sleep_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  duration_minutes integer,
  quality text check (quality in ('bad', 'average', 'good', 'excellent')),
  created_at timestamp with time zone default now()
);

-- 8. Table des LOGS DE POIDS
create table weight_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  weight_kg float not null,
  created_at timestamp with time zone default now()
);

-- RLS (Row Level Security) - Sécurité des données
alter table profiles enable row level security;
alter table user_goals enable row level security;
alter table water_logs enable row level security;
alter table food_logs enable row level security;
alter table activity_logs enable row level security;
alter table fasting_logs enable row level security;
alter table sleep_logs enable row level security;
alter table weight_logs enable row level security;

-- Création des politiques (Policies) pour permettre aux utilisateurs de voir uniquement leurs propres données
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view their own goals" on user_goals for select using (auth.uid() = user_id);
create policy "Users can update their own goals" on user_goals for all using (auth.uid() = user_id);

create policy "Users can manage their own water logs" on water_logs for all using (auth.uid() = user_id);
create policy "Users can manage their own food logs" on food_logs for all using (auth.uid() = user_id);
create policy "Users can manage their own activity logs" on activity_logs for all using (auth.uid() = user_id);
create policy "Users can manage their own fasting logs" on fasting_logs for all using (auth.uid() = user_id);
create policy "Users can manage their own sleep logs" on sleep_logs for all using (auth.uid() = user_id);
create policy "Users can manage their own weight logs" on weight_logs for all using (auth.uid() = user_id);

-- Fonction pour créer automatiquement un profil à l'inscription
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (new.id, '', '', 'user');
  
  insert into public.user_goals (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
