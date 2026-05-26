// ============================================================================
// app.js — Root. Routing, theme, auth gate, cloud sync.
// Shows AuthScreen when Supabase is enabled and user is not signed in.
// Falls back to no-login mode when Supabase is not configured.
// ============================================================================

function App() {
  const { state, actions, computed } = useStore();
  const [active, setActive] = useState("overview");
  const [showAddTx, setShowAddTx] = useState(false);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState("owner");
  const [authChecked, setAuthChecked] = useState(!isSupabaseEnabled());

  // Apply theme as CSS vars on body
  useEffect(() => {
    const vars = applyTheme(state.settings.variant, state.settings.mode, state.settings.accent);
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    document.body.style.background = vars["--bg"];
    document.body.style.color = vars["--text"];
    document.body.style.fontFamily = vars["--font-ui"];
  }, [state.settings.variant, state.settings.mode, state.settings.accent]);

  // Check Supabase auth on mount and fetch role
  useEffect(() => {
    if (!isSupabaseEnabled()) return;
    sbGetSession().then(async s => {
      setSession(s);
      if (s && s.user && s.user.email) {
        const role = await sbGetUserRole(s.user.email);
        setUserRole(role);
        actions.setSetting("userRole", role);
      }
      setAuthChecked(true);
    });
    const unsub = sbOnAuthChange(async s => {
      setSession(s);
      if (s && s.user && s.user.email) {
        const role = await sbGetUserRole(s.user.email);
        setUserRole(role);
        actions.setSetting("userRole", role);
      } else {
        setUserRole("owner");
      }
    });
    return unsub;
  }, []);

  // While checking auth — show a simple loading state
  if (!authChecked) {
    return React.createElement("div", {
      style: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        color: "var(--muted)",
        fontFamily: "var(--font-ui)",
        fontSize: 13,
        gap: 10
      }
    }, "Loading…");
  }

  // Supabase is configured but not signed in — show auth screen
  if (isSupabaseEnabled() && !session) {
    return React.createElement(AuthScreen, { onSignedIn: () => {} });
  }

  const perms = ROLE_PERMS["owner"];

  return React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "var(--font-ui)"
    }
  },
    // Cloud sync — mounts only when Supabase is enabled and user is signed in
    isSupabaseEnabled() && session && React.createElement(CloudSync, { session, setSession }),
    React.createElement(Sidebar, { active, setActive, cloudEnabled: isSupabaseEnabled(), session, setSession, userRole }),
    React.createElement("main", {
      style: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }
    },
      React.createElement(Topbar, { active, setActive, openAddTx: () => setShowAddTx(true) }),
      React.createElement(PageHeader, { active }),
      React.createElement("div", { style: { flex: 1, overflow: "auto" } },
        React.createElement(React.Fragment, null,
          active === "overview"       && React.createElement(OverviewScreen,     { setActive, openAddTx: () => setShowAddTx(true) }),
          active === "cash"           && React.createElement(CashCheckerScreen,  null),
          active === "transactions"   && React.createElement(TransactionsScreen, null),
          active === "expenses"       && React.createElement(ExpensesScreen,     null),
          active === "income"         && React.createElement(IncomeScreen,       null),
          active === "calendar"       && React.createElement(CalendarScreen,     null),
          active === "debt"           && React.createElement(DebtScreen,         null),
          active === "credit"         && React.createElement(CreditScreen,       null),
          active === "health"         && React.createElement(HealthScreen,       { setActive }),
          active === "forecast"       && React.createElement(ForecastScreen,     null),
          active === "coach"          && React.createElement(MoneyCoachScreen,   null),
          active === "budgets"        && React.createElement(BudgetsScreen,      null),
          active === "goals"          && React.createElement(GoalsScreen,        null),
          active === "subscriptions"  && React.createElement(RecurringScreen,    null),
          active === "report"         && React.createElement(ReportScreen,       { userRole, session }),
          active === "expected"       && React.createElement(ExpectedScreen,     { userRole }),
          active === "settings"       && React.createElement(SettingsScreen,     null)
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
