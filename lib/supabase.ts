import { createClient, SupabaseClient } from '@supabase/supabase-js';

function isValidHttpUrl(str: string | undefined | null): boolean {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  if (
    !trimmed ||
    trimmed.startsWith('MY_') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('seu-projeto') ||
    trimmed === 'NEXT_PUBLIC_SUPABASE_URL'
  ) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = (): boolean => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;
  if (!isValidHttpUrl(url)) return false;

  const trimmedKey = key.trim();
  if (
    !trimmedKey ||
    trimmedKey.startsWith('MY_') ||
    trimmedKey.includes('placeholder') ||
    trimmedKey.includes('sua-chave') ||
    trimmedKey === 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ) {
    return false;
  }

  return true;
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (clientInstance) {
    return clientInstance;
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

    clientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });

    return clientInstance;
  } catch (error) {
    console.warn('Aviso: Não foi possível conectar ao Supabase:', error);
    return null;
  }
};

// Getter seguro para uso direto
export const getSupabase = getSupabaseClient;
