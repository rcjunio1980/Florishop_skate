import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Extrai e normaliza a URL do Supabase, mesmo que tenha sido colada com o nome da variável,
 * com espaços ou concatenada com outras chaves no painel de configurações.
 */
export function extractCleanSupabaseUrl(): string | null {
  const rawSources = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ];

  for (const src of rawSources) {
    if (!src || typeof src !== 'string') continue;

    // Tenta encontrar URL do Supabase (ex: https://ilkwahfnocetvyyihekr.supabase.co)
    const sbMatch = src.match(/https:\/\/[a-zA-Z0-9.-]+\.supabase\.co/i);
    if (sbMatch && !sbMatch[0].includes('seu-projeto')) {
      return sbMatch[0].replace(/\/$/, '');
    }

    // Tenta qualquer URL http ou https válida
    const urlMatch = src.match(/https?:\/\/[^\s"',;]+/i);
    if (urlMatch && !urlMatch[0].includes('seu-projeto')) {
      try {
        const parsed = new URL(urlMatch[0]);
        if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname)) {
          return urlMatch[0].replace(/\/$/, '');
        }
      } catch {}
    }
  }
  return null;
}

/**
 * Extrai e normaliza a chave publishable ou anon do Supabase,
 * suportando os novos formatos sb_publishable_* e os tokens JWT legados (eyJ...).
 */
export function extractCleanSupabaseKey(): string | null {
  const rawSources = [
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
  ];

  for (const src of rawSources) {
    if (!src || typeof src !== 'string') continue;

    // 1. Chave publishable moderna do Supabase (sb_publishable_...)
    const sbMatch = src.match(/sb_publishable_[a-zA-Z0-9_-]+/);
    if (sbMatch) return sbMatch[0];

    // 2. JWT anon clássico do Supabase (eyJ...)
    const jwtMatch = src.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
    if (jwtMatch) return jwtMatch[0];

    // 3. String direta limpa se for uma chave válida
    const trimmed = src.trim();
    if (
      trimmed &&
      !trimmed.includes(' ') &&
      !trimmed.startsWith('http') &&
      !trimmed.includes('sua-chave') &&
      !trimmed.startsWith('MY_') &&
      trimmed !== 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ) {
      return trimmed;
    }
  }
  return null;
}

export const isSupabaseConfigured = (): boolean => {
  const url = extractCleanSupabaseUrl();
  const key = extractCleanSupabaseKey();
  return Boolean(url && key);
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const url = extractCleanSupabaseUrl();
  const key = extractCleanSupabaseKey();

  if (!url || !key) {
    return null;
  }

  if (clientInstance) {
    return clientInstance;
  }

  try {
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
