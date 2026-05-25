// ============================================================================
// cloud-bridge.jsx — Bridges the local store with Supabase when configured.
//
// Behavior:
//   - If Supabase is NOT configured (empty config): renders nothing; app
//     stays offline-only via localStorage.
//   - If Supabase IS configured:
//       * Watches auth state
//       * When user signs in: pulls their cloud data, replaces local state
//       * When state changes after sign-in: debounced 1s push to cloud
//
// Mount once near the root, inside <StoreProvider>.
// ============================================================================

function CloudSync({
  session,
  setSession
}) {
  const {
    state,
    actions
  } = useStore();
  const lastPushRef = useRef(0);
  const pushTimerRef = useRef(null);
  const initialPullDoneRef = useRef(false);

  // Subscribe to Supabase auth changes. Keep `session` in sync.
  useEffect(() => {
    if (!isSupabaseEnabled()) return;
    // Initial check
    sbGetSession().then(s => setSession(s));
    // Subscribe to changes
    const unsub = sbOnAuthChange(s => setSession(s));
    return unsub;
  }, []);

  // When a session appears: pull data once and replace local state.
  useEffect(() => {
    if (!session || initialPullDoneRef.current) return;
    initialPullDoneRef.current = true;
    (async () => {
      const row = await sbFetchData();
      if (row && row.data && Object.keys(row.data).length > 0) {
        // Cloud data exists — replace local
        actions.importState(row.data);
      } else {
        // No cloud data yet — push current local state up as the initial snapshot
        await sbPushData(state);
      }
    })();
    // eslint-disable-next-line
  }, [session]);

  // When local state changes AFTER initial pull, debounce-push to cloud.
  useEffect(() => {
    if (!session || !initialPullDoneRef.current) return;
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      sbPushData(state);
      lastPushRef.current = Date.now();
    }, 800);
    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
    // eslint-disable-next-line
  }, [state]);

  // Reset pull flag on sign-out so next sign-in re-pulls.
  useEffect(() => {
    if (!session) initialPullDoneRef.current = false;
  }, [session]);
  return null;
}

// ----------------------------------------------------------------------------
// AuthScreen — real email+password sign-up / sign-in (Supabase)
// Shown when Supabase is configured AND user is not signed in.
// ----------------------------------------------------------------------------
function AuthScreen({
  onSignedIn
}) {
  const [mode, setMode] = useState("signin"); // signin | signup | magic
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const toast = useToast();
  const handleSubmit = async e => {
    e?.preventDefault();
    if (!email) {
      setMsg({
        kind: "error",
        text: "Enter your email."
      });
      return;
    }
    if (mode !== "magic" && !password) {
      setMsg({
        kind: "error",
        text: "Enter a password."
      });
      return;
    }
    setBusy(true);
    setMsg(null);
    let result;
    if (mode === "signup") result = await sbSignUp(email, password);else if (mode === "magic") result = await sbSignInWithMagicLink(email);else result = await sbSignIn(email, password);
    setBusy(false);
    if (result.error) {
      setMsg({
        kind: "error",
        text: result.error.message
      });
      return;
    }
    if (mode === "signup") {
      setMsg({
        kind: "ok",
        text: "Account created. Check your email if confirmation is enabled, then sign in."
      });
      setMode("signin");
      return;
    }
    if (mode === "magic") {
      setMsg({
        kind: "ok",
        text: "Magic-link email sent. Click the link from the same browser."
      });
      return;
    }
    // Sign-in success — let the auth subscription handle the rest
    toast("Signed in.", "success");
    onSignedIn?.();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "var(--font-ui)",
      display: "flex",
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "0 0 44%",
      padding: "56px",
      background: "var(--panel-alt)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    style: {
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      opacity: 0.6
    },
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("pattern", {
    id: "auth-grid",
    x: "0",
    y: "0",
    width: "40",
    height: "40",
    patternUnits: "userSpaceOnUse"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 40 0 L 0 0 0 40",
    fill: "none",
    stroke: "var(--grid)",
    strokeWidth: "1"
  }))), /*#__PURE__*/React.createElement("rect", {
    width: "100%",
    height: "100%",
    fill: "url(#auth-grid)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      background: "var(--text)",
      color: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontSize: 20,
      borderRadius: "var(--radius)"
    }
  }, "\u20B1"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: 22,
      letterSpacing: "var(--tracking)"
    }
  }, "Ledger"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color: "var(--muted)",
      letterSpacing: "0.12em",
      textTransform: "uppercase"
    }
  }, "Cloud-synced \xB7 Supabase"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: 40,
      fontWeight: "var(--display-weight)",
      letterSpacing: "var(--tracking)",
      lineHeight: 1.05,
      maxWidth: 460
    }
  }, "Your money, in one place. Now on every device."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "20px 0 0",
      maxWidth: 460,
      fontSize: 13.5,
      lineHeight: 1.6,
      color: "var(--muted)"
    }
  }, "Sign up once. Your transactions, debts, budgets, and forecasts sync to your private Supabase database. Same data on laptop, phone, and tablet.")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      fontSize: 11,
      fontFamily: "var(--font-mono)",
      color: "var(--faint)",
      letterSpacing: "0.06em"
    }
  }, "ROW-LEVEL SECURITY \xB7 YOUR DATA IS YOURS ONLY")), /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit,
    style: {
      flex: 1,
      padding: "56px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 22,
      maxWidth: 520,
      margin: "0 auto",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--muted)",
      fontWeight: 700
    }
  }, mode === "signup" ? "Create account" : mode === "magic" ? "Magic link" : "Sign in"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "6px 0 0",
      fontFamily: "var(--font-display)",
      fontSize: 28,
      fontWeight: "var(--display-weight)",
      letterSpacing: "var(--tracking)",
      lineHeight: 1.1
    }
  }, mode === "signup" ? "Welcome to Ledger." : "Welcome back.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 1,
      background: "var(--border)",
      padding: 1,
      borderRadius: "var(--radius)"
    }
  }, [{
    id: "signin",
    label: "Sign in"
  }, {
    id: "signup",
    label: "Create account"
  }, {
    id: "magic",
    label: "Magic link"
  }].map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt.id,
    type: "button",
    onClick: () => {
      setMode(opt.id);
      setMsg(null);
    },
    style: {
      all: "unset",
      cursor: "pointer",
      flex: 1,
      padding: "8px",
      textAlign: "center",
      background: mode === opt.id ? "var(--panel)" : "transparent",
      color: mode === opt.id ? "var(--text)" : "var(--muted)",
      fontSize: 12,
      fontWeight: 600,
      borderRadius: "var(--radius)"
    }
  }, opt.label))), /*#__PURE__*/React.createElement(Field, {
    label: "Email",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "email",
    value: email,
    onChange: setEmail,
    placeholder: "you@email.com",
    autoFocus: true
  })), mode !== "magic" && /*#__PURE__*/React.createElement(Field, {
    label: "Password",
    required: true,
    hint: mode === "signup" ? "Minimum 6 characters" : ""
  }, /*#__PURE__*/React.createElement(Input, {
    type: "password",
    value: password,
    onChange: setPassword,
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  })), msg && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "9px 12px",
      background: msg.kind === "error" ? "color-mix(in oklch, var(--down), transparent 88%)" : "var(--accent-soft)",
      border: `1px solid ${msg.kind === "error" ? "var(--down)" : "var(--accent)"}`,
      color: msg.kind === "error" ? "var(--down)" : "var(--accent)",
      fontSize: 12,
      lineHeight: 1.5,
      borderRadius: "var(--radius)"
    }
  }, msg.text), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    size: "lg",
    disabled: busy,
    style: {
      justifyContent: "center",
      padding: "12px 18px"
    }
  }, busy ? "Working…" : mode === "signup" ? "Create my account" : mode === "magic" ? "Email me a magic link" : "Sign in"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      lineHeight: 1.5,
      padding: "10px 12px",
      border: "1px dashed var(--border)",
      borderRadius: "var(--radius)"
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--text)"
    }
  }, "Cloud sync via Supabase."), " Your data persists across devices. If you forget your password, use the magic-link option to sign in.")));
}
Object.assign(window, {
  CloudSync,
  AuthScreen
});