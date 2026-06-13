// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// True only when real credentials are present (not the placeholder values from
// .env.example). When false the game still runs fully — the platformer is
// offline-capable — and only cloud features (cadastro persistence + ranking)
// are disabled and degrade gracefully.
export const supabaseConfigured =
  !!url && !!key &&
  !url.includes('YOUR_PROJECT') &&
  !key.includes('YOUR_ANON');

if (!supabaseConfigured && typeof console !== 'undefined') {
  console.warn(
    '[Supabase] Credenciais ausentes — rodando em modo OFFLINE. ' +
    'Cadastro e ranking não serão salvos na nuvem até configurar ' +
    'VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
  );
}

// createClient still needs a syntactically valid URL in offline mode; network
// calls simply fail and are caught by the services/scenes that use them.
export const supabase = createClient(
  supabaseConfigured ? url : 'https://offline.invalid',
  supabaseConfigured ? key : 'offline-anon-key',
);
