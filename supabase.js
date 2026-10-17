(() => {
  'use strict';

  const SUPABASE_URL = window.PSC_RUNTIME_SUPABASE?.url || 'https://ewewkojlsgqvcqarmpgr.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = window.PSC_RUNTIME_SUPABASE?.key || 'sb_publishable_sy9aBzGOMKQO2CZJyGxD-Q_TyzP4mOb';

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    console.error('Supabase client library did not load.');
    window.PSC_SUPABASE = null;
    return;
  }

  window.PSC_SUPABASE = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
})();
