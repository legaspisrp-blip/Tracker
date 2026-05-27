// ============================================================================
// supabase-sync.js — Supabase auth + data sync
// Uses the legacy eyJ... anon key for proper auth support.
// ============================================================================

(function () {
  let _client = null;

  function isSupabaseEnabled() {
    return !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase);
  }

  function initSupabase() {
    if (_client) return _client;
    if (!isSupabaseEnabled()) return null;
    try {
      _client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "implicit",
          storage: window.localStorage
        }
      });
    } catch(e) {
      console.warn("Supabase init failed:", e);
      return null;
    }
    return _client;
  }

  async function sbSignUp(email, password) {
    const c = initSupabase();
    if (!c) return { error: { message: "Supabase not configured." } };
    return await c.auth.signUp({ email, password });
  }

  async function sbSignIn(email, password) {
    const c = initSupabase();
    if (!c) return { error: { message: "Supabase not configured." } };
    return await c.auth.signInWithPassword({ email, password });
  }

  async function sbSignInWithMagicLink(email) {
    const c = initSupabase();
    if (!c) return { error: { message: "Supabase not configured." } };
    return await c.auth.signInWithOtp({ email });
  }

  async function sbSignOut() {
    const c = initSupabase();
    if (!c) return { error: null };
    return await c.auth.signOut();
  }

  async function sbGetSession() {
    const c = initSupabase();
    if (!c) return null;
    try {
      // First try reading from localStorage directly (fast, no network)
      const storageKey = "sb-" + window.SUPABASE_URL.split("//")[1].split(".")[0] + "-auth-token";
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.access_token) {
          // We have a stored session — return it immediately
          return parsed;
        }
      }
      // No stored session — do network call
      const { data } = await c.auth.getSession();
      return data?.session || null;
    } catch(e) {
      console.warn("sbGetSession error:", e);
      return null;
    }
  }

  function sbOnAuthChange(cb) {
    const c = initSupabase();
    if (!c) return () => {};
    try {
      const { data: { subscription } } = c.auth.onAuthStateChange((_event, session) => cb(session));
      return () => subscription?.unsubscribe();
    } catch(e) {
      return () => {};
    }
  }

  async function sbFetchData() {
    const c = initSupabase();
    if (!c) return null;
    try {
      const { data: { user } } = await c.auth.getUser();
      if (!user) return null;
      const { data, error } = await c.from("user_data")
        .select("data, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) { console.warn("sbFetchData error:", error); return null; }
      return data;
    } catch(e) {
      console.warn("sbFetchData exception:", e);
      return null;
    }
  }

  async function sbPushData(payload) {
    const c = initSupabase();
    if (!c) return { error: { message: "no client" } };
    try {
      const { data: { user } } = await c.auth.getUser();
      if (!user) return { error: { message: "not signed in" } };
      const { session: _s, ...toSync } = payload;
      const { data, error } = await c.from("user_data").upsert(
        { user_id: user.id, data: toSync, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
      if (error) console.warn("sbPushData error:", error);
      return { data, error };
    } catch(e) {
      console.warn("sbPushData exception:", e);
      return { error: e };
    }
  }

  async function sbGetUserRole(email) {
    const c = initSupabase();
    if (!c) return "owner";
    try {
      const { data } = await c.from("user_roles").select("role").eq("email", email).maybeSingle();
      return data?.role || "owner";
    } catch(e) { return "owner"; }
  }

  async function sbAddUserRole(email, role, addedBy) {
    const c = initSupabase();
    if (!c) return { error: { message: "no client" } };
    return await c.from("user_roles").upsert({ email, role, added_by: addedBy }, { onConflict: "email" });
  }

  async function sbRemoveUserRole(email) {
    const c = initSupabase();
    if (!c) return { error: { message: "no client" } };
    return await c.from("user_roles").delete().eq("email", email);
  }

  async function sbListUserRoles() {
    const c = initSupabase();
    if (!c) return [];
    try {
      const { data } = await c.from("user_roles").select("*").order("created_at");
      return data || [];
    } catch(e) { return []; }
  }

  Object.assign(window, {
    isSupabaseEnabled, initSupabase,
    sbSignUp, sbSignIn, sbSignInWithMagicLink, sbSignOut,
    sbGetSession, sbOnAuthChange, sbFetchData, sbPushData,
    sbGetUserRole, sbAddUserRole, sbRemoveUserRole, sbListUserRoles,
  });
})();
