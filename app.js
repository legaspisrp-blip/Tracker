// ============================================================================
// app.jsx — Root. Routing, theme application, global add-tx modal.
// Login gate removed — app opens directly as Owner.
// ============================================================================

function App() {
  const {
    state,
    actions,
    computed
  } = useStore();
  const [active, setActive] = useState("overview");
  const [showAddTx, setShowAddTx] = useState(false);

  // Apply theme as CSS vars on body
  useEffect(() => {
    const vars = applyTheme(state.settings.variant, state.settings.mode, state.settings.accent);
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    document.body.style.background = vars["--bg"];
    document.body.style.color = vars["--text"];
    document.body.style.fontFamily = vars["--font-ui"];
  }, [state.settings.variant, state.settings.mode, state.settings.accent]);

  const perms = ROLE_PERMS["owner"];

  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "var(--font-ui)"
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    active: active,
    setActive: setActive
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Topbar, {
    active: active,
    setActive: setActive,
    openAddTx: () => setShowAddTx(true)
  }), /*#__PURE__*/React.createElement(PageHeader, {
    active: active
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement(React.Fragment, null,
    active === "overview" && /*#__PURE__*/React.createElement(OverviewScreen, { setActive: setActive, openAddTx: () => setShowAddTx(true) }),
    active === "cash" && /*#__PURE__*/React.createElement(CashCheckerScreen, null),
    active === "transactions" && /*#__PURE__*/React.createElement(TransactionsScreen, null),
    active === "expenses" && /*#__PURE__*/React.createElement(ExpensesScreen, null),
    active === "income" && /*#__PURE__*/React.createElement(IncomeScreen, null),
    active === "calendar" && /*#__PURE__*/React.createElement(CalendarScreen, null),
    active === "debt" && /*#__PURE__*/React.createElement(DebtScreen, null),
    active === "credit" && /*#__PURE__*/React.createElement(CreditScreen, null),
    active === "health" && /*#__PURE__*/React.createElement(HealthScreen, { setActive: setActive }),
    active === "forecast" && /*#__PURE__*/React.createElement(ForecastScreen, null),
    active === "coach" && /*#__PURE__*/React.createElement(MoneyCoachScreen, null),
    active === "budgets" && /*#__PURE__*/React.createElement(BudgetsScreen, null),
    active === "goals" && /*#__PURE__*/React.createElement(GoalsScreen, null),
    active === "subscriptions" && /*#__PURE__*/React.createElement(RecurringScreen, null),
    active === "report" && /*#__PURE__*/React.createElement(ReportScreen, null),
    active === "settings" && /*#__PURE__*/React.createElement(SettingsScreen, null)
  ))), /*#__PURE__*/React.createElement(TransactionForm, {
    open: showAddTx,
    onClose: () => setShowAddTx(false)
  }));
}

function Root() {
  return /*#__PURE__*/React.createElement(StoreProvider, null, /*#__PURE__*/React.createElement(ToastProvider, null, /*#__PURE__*/React.createElement(App, null)));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(Root, null));
