// ============================================================================
// supabase-sync.js — Supabase wrapper: auth + single-row JSON sync
//
// Public API (all attached to window):
//   isSupabaseEnabled()                   - boolean: has URL + anon key
//   initSupabase()                        - returns client or null
//   sbSignUp(email, password)             - returns {data, error}
//   sbSignIn(email, password)             - returns {data, error}
//   sbSignInWithMagicLink(email)          - returns {data, error}
//   sbSignOut()                           - returns {error}
//   sbGetSession()                        - returns current session or null
//   sbOnAuthChange(cb)                    - subscribe; returns unsubscribe fn
//   sbFetchData()                         - returns user's data row or null
//   sbPushData(data)                      - upserts data (debounced via caller)
// ============================================================================

(function () {
  let _client = null;

  function isSupabaseEnabled() {
    return !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
  }

  function initSupabase() {
    if (_client) return _client;
    if (!isSupabaseEnabled()) return null;
    _client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return _client;
  }

  async function sbSignUp(email, password) {
    const c = initSupabase(); if (!c) return { error: { message: "Supabase not configured" } };
    return await c.auth.signUp({ email, password });
  }

  async function sbSignIn(email, password) {
    const c = initSupabase(); if (!c) return { error: { message: "Supabase not configured" } };
    return await c.auth.signInWithPassword({ email, password });
  }

  async function sbSignInWithMagicLink(email) {
    const c = initSupabase(); if (!c) return { error: { message: "Supabase not configured" } };
    return await c.auth.signInWithOtp({ email });
  }

  async function sbSignOut() {
    const c = initSupabase(); if (!c) return { error: { message: "Supabase not configured" } };
    return await c.auth.signOut();
  }

  async function sbGetSession() {
    const c = initSupabase(); if (!c) return null;
    const { data } = await c.auth.getSession();
    return data?.session || null;
  }

  function sbOnAuthChange(cb) {
    const c = initSupabase(); if (!c) return () => {};
    const { data: { subscription } } = c.auth.onAuthStateChange((_event, session) => cb(session));
    return () => subscription?.unsubscribe();
  }

  async function sbFetchData() {
    const c = initSupabase(); if (!c) return null;
    const { data: { user } } = await c.auth.getUser();
    if (!user) return null;
    const { data, error } = await c.from("user_data").select("data, updated_at").eq("user_id", user.id).maybeSingle();
    if (error) {
      console.warn("Supabase fetch error:", error);
      return null;
    }
    return data;
  }

  async function sbPushData(payload) {
    const c = initSupabase(); if (!c) return { error: { message: "no client" } };
    const { data: { user } } = await c.auth.getUser();
    if (!user) return { error: { message: "not signed in" } };
    // Strip the session object from the payload before pushing (no need to sync that)
    const { session, ...toSync } = payload;
    const { data, error } = await c.from("user_data").upsert(
      { user_id: user.id, data: toSync, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    if (error) console.warn("Supabase push error:", error);
    return { data, error };
  }

  Object.assign(window, {
    isSupabaseEnabled, initSupabase,
    sbSignUp, sbSignIn, sbSignInWithMagicLink, sbSignOut,
    sbGetSession, sbOnAuthChange, sbFetchData, sbPushData,
  });
})();
