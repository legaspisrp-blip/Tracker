// ============================================================================
// supabase-config.js — EDIT THIS FILE with your Supabase project credentials.
//
// Without these, the app runs offline (localStorage only). Fill them in and
// you get email/password accounts, cloud sync, and cross-device access.
//
// HOW TO GET THESE:
//   1. Create a free Supabase project at https://supabase.com
//   2. Go to Project Settings → API
//   3. Copy "Project URL"      → SUPABASE_URL below
//   4. Copy "anon / public key" → SUPABASE_ANON_KEY below
//   5. Run supabase-schema.sql in the SQL Editor (one-time setup)
//   6. Save this file. Open the app. You'll now see a sign-in screen.
//
// The anon key is SAFE TO COMMIT — it's a public key with no admin rights.
// Row-Level Security (set up by schema.sql) ensures each user only sees their
// own data. Never paste the "service_role" key here.
// ============================================================================
window.SUPABASE_URL      = "https://rrrzwidshbmkjotylvjr.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycnp3aWRzaGJta2pvdHlsdmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NTYwMjUsImV4cCI6MjA5NTIzMjAyNX0.VcheyBzjXCt24AVFyqieF62D6MtR1zz2tWbX0ET8AmY";

window.isSupabaseEnabled = () => !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
