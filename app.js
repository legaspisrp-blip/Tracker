// ============================================================================
// app.js — Root. Auth gate + routing. Option A: login required.
// ============================================================================

function App() {
  const { state, actions } = useStore();
  const [active, setActive] = useState("overview");
  const [showAddTx, setShowAddTx] = useState(false);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState("owner");
  const [authChecked, setAuthChecked] = useState(false);

  // Apply theme
  useEffect(() => {
    const vars = applyTheme(state.settings.variant, state.settings.mode, state.settings.accent);
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    document.body.style.background = vars["--bg"];
    document.body.style.color = vars["--text"];
    document.body.style.fontFamily = vars["--font-ui"];
  }, [state.settings.variant, state.settings.mode, state.settings.accent]);

  // Auth check on mount
  useEffect(() => {
    if (!isSupabaseEnabled()) {
      // No Supabase configured — run offline
      setAuthChecked(true);
      return;
    }

    // Check for existing session with 4s timeout
    const sessionTimeout = setTimeout(() => {
      console.warn("Ledger: session check timed out — showing login");
      setAuthChecked(true);
    }, 4000);

    sbGetSession().then(s => {
      clearTimeout(sessionTimeout);
      setSession(s);
      // Show app immediately - fetch role in background
      setAuthChecked(true);
      if (s && s.user && s.user.email) {
        sbGetUserRole(s.user.email).then(role => {
          setUserRole(role);
          actions.setSetting("userRole", role);
        }).catch(e => console.warn("role fetch failed", e));
      }
    }).catch(() => {
      clearTimeout(sessionTimeout);
      setAuthChecked(true);
    });

    // Listen for auth changes (login/logout) - non-blocking
    try {
      const unsub = sbOnAuthChange(async s => {
        setSession(s);
        if (s && s.user && s.user.email) {
          try {
            const role = await sbGetUserRole(s.user.email);
            setUserRole(role);
            actions.setSetting("userRole", role);
          } catch(e) {}
        } else {
          setUserRole("owner");
          actions.setSetting("userRole", "owner");
        }
      });
      return () => unsub && unsub();
    } catch(e) {
      console.warn("onAuthChange setup failed:", e);
    }
  }, []); // eslint-disable-line

  // Loading screen while checking auth
  if (!authChecked) {
    return React.createElement("div", {
      style: {
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0a0a0a",
        color: "#8a8a82", fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 13, flexDirection: "column", gap: 12
      }
    },
      React.createElement("div", { style: { fontSize: 24, color: "#ebebe6" } }, "\u20B1"),
      React.createElement("div", null, "Loading Ledger\u2026")
    );
  }

  // Not signed in and Supabase is configured — show login
  if (isSupabaseEnabled() && !session) {
    return React.createElement(AuthScreen, { onSignedIn: () => {} });
  }

  // Signed in (or offline mode) — show app
  return React.createElement("div", {
    style: { minHeight: "100vh", display: "flex", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-ui)" }
  },
    isSupabaseEnabled() && session && React.createElement(CloudSync, { session, setSession }),
    React.createElement(Sidebar, { active, setActive, cloudEnabled: isSupabaseEnabled(), session, setSession, userRole }),
    React.createElement("main", { style: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 } },
      React.createElement(Topbar, { active, setActive, openAddTx: () => setShowAddTx(true) }),
      React.createElement(PageHeader, { active }),
      React.createElement("div", { style: { flex: 1, overflow: "auto" } },
        React.createElement(React.Fragment, null,
          active === "overview"      && React.createElement(OverviewScreen,    { setActive, openAddTx: () => setShowAddTx(true) }),
          active === "cash"          && React.createElement(CashCheckerScreen, null),
          active === "transactions"  && React.createElement(TransactionsScreen,null),
          active === "expenses"      && React.createElement(ExpensesScreen,    null),
          active === "income"        && React.createElement(IncomeScreen,      null),
          active === "calendar"      && React.createElement(CalendarScreen,    null),
          active === "debt"          && React.createElement(DebtScreen,        null),
          active === "credit"        && React.createElement(CreditScreen,      null),
          active === "health"        && React.createElement(HealthScreen,      { setActive }),
          active === "forecast"      && React.createElement(ForecastScreen,    null),
          active === "coach"         && React.createElement(MoneyCoachScreen,  null),
          active === "budgets"       && React.createElement(BudgetsScreen,     null),
          active === "goals"         && React.createElement(GoalsScreen,       null),
          active === "subscriptions" && React.createElement(RecurringScreen,   null),
          active === "report"        && React.createElement(ReportScreen,      { userRole, session }),
          active === "expected"      && React.createElement(ExpectedScreen,    { userRole }),
          active === "settings"      && React.createElement(SettingsScreen,    null)
        )
      )
    ),
    React.createElement(TransactionForm, { open: showAddTx, onClose: () => setShowAddTx(false) })
  );
}

function Root() {
  return React.createElement(StoreProvider, null,
    React.createElement(ToastProvider, null,
      React.createElement(App, null)
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(Root, null));
