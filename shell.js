// ============================================================================
// shell.jsx — Sidebar + Topbar wired to the store
// ============================================================================

const NAV = [{
  id: "overview",
  label: "Overview",
  group: "main",
  icon: "overview"
}, {
  id: "cash",
  label: "Cash Checker",
  group: "main",
  icon: "cash"
}, {
  id: "transactions",
  label: "Transactions",
  group: "log",
  icon: "transactions"
}, {
  id: "expenses",
  label: "Expenses",
  group: "log",
  icon: "expenses"
}, {
  id: "income",
  label: "Income",
  group: "log",
  icon: "income"
}, {
  id: "calendar",
  label: "Calendar",
  group: "log",
  icon: "calendar"
}, {
  id: "debt",
  label: "Debt",
  group: "analyze",
  icon: "debt"
}, {
  id: "credit",
  label: "Credit",
  group: "analyze",
  icon: "credit"
}, {
  id: "health",
  label: "Health & Loan",
  group: "analyze",
  icon: "health"
}, {
  id: "forecast",
  label: "Forecast",
  group: "analyze",
  icon: "forecast"
}, {
  id: "coach",
  label: "Money Coach",
  group: "analyze",
  icon: "sparkle"
}, {
  id: "budgets",
  label: "Budgets",
  group: "plan",
  icon: "budgets"
}, {
  id: "goals",
  label: "Goals",
  group: "plan",
  icon: "goals"
}, {
  id: "subscriptions",
  label: "Recurring",
  group: "plan",
  icon: "subscriptions"
}, {
  id: "report",
  label: "Monthly Reports",
  group: "plan",
  icon: "report"
}, {
  id: "settings",
  label: "Settings",
  group: "system",
  icon: "settings"
}];
const GROUPS = {
  main: "Dashboard",
  log: "Log & track",
  analyze: "Analyze",
  plan: "Plan",
  system: "System"
};
const ROLE_PERMS = {
  owner: {
    canSee: NAV.map(n => n.id),
    canEdit: true
  },
  assistant: {
    // Limited: log + view what's needed to log
    canSee: ["transactions", "expenses", "income", "calendar", "subscriptions", "settings"],
    canEdit: true
  }
};

// ============================================================================
// SIDEBAR
// ============================================================================
function Sidebar({
  active,
  setActive,
  cloudEnabled,
  session
}) {
  const {
    state,
    actions,
    computed
  } = useStore();
  const role = state.session.role;
  const perms = ROLE_PERMS[role] || ROLE_PERMS.owner;
  const visible = NAV.filter(n => perms.canSee.includes(n.id));
  const groups = [...new Set(visible.map(v => v.group))];
  const debtBadge = computed.activeDebts.length || null;
  const upcomingBadge = computed.upcoming.filter(u => u.daysOut <= 3).length || null;
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 224,
      borderRight: "1px solid var(--border)",
      background: "var(--panel-alt)",
      padding: "16px 0 12px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      flexShrink: 0,
      height: "100vh",
      position: "sticky",
      top: 0,
      overflow: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 18px",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 24,
      height: 24,
      background: "var(--text)",
      color: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontSize: 13,
      borderRadius: state.settings.variant === "a" ? "2px" : "8px"
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
      fontSize: 15,
      letterSpacing: "var(--tracking)"
    }
  }, "Ledger"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      color: "var(--muted)",
      letterSpacing: "0.1em",
      textTransform: "uppercase"
    }
  }, "v", APP_VERSION))), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: "0 8px"
    }
  }, groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "4px 10px 2px",
      fontSize: 9,
      color: "var(--faint)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 700
    }
  }, GROUPS[g]), visible.filter(n => n.group === g).map(n => {
    const on = active === n.id;
    const badge = n.id === "debt" ? debtBadge : n.id === "calendar" ? upcomingBadge : n.id === "credit" ? state.creditAccounts.length || null : null;
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      onClick: () => setActive(n.id),
      style: {
        all: "unset",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 10px",
        fontSize: 12.5,
        fontFamily: "var(--font-ui)",
        color: on ? "var(--text)" : "var(--muted)",
        background: on ? "var(--panel)" : "transparent",
        border: on ? "1px solid var(--border)" : "1px solid transparent",
        borderRadius: "var(--radius)",
        fontWeight: on ? 600 : 500
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: on ? "var(--accent)" : "var(--faint)",
        display: "inline-flex"
      }
    }, /*#__PURE__*/React.createElement(Glyph, {
      d: ICONS[n.icon] || ICONS.overview,
      size: 14
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, n.label), badge != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        fontWeight: 700,
        color: n.id === "calendar" ? "var(--warn)" : "var(--muted)",
        padding: "1px 5px",
        background: "var(--chip)",
        borderRadius: "var(--radius)"
      }
    }, badge));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      border: "1px solid var(--border)",
      background: "var(--panel)",
      borderRadius: "var(--radius)",
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontWeight: 600
    }
  }, "Cash on hand"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 18,
      fontWeight: 600,
      color: "var(--text)",
      letterSpacing: "var(--tracking)"
    }
  }, fmtMoney(computed.cashOnHand, {
    dec: 2
  })), computed.survivalDays != null ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Chip, {
    tone: computed.survivalDays > 90 ? "up" : computed.survivalDays > 30 ? "accent" : "warn"
  }, computed.survivalDays, "d runway")) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "var(--faint)",
      fontFamily: "var(--font-mono)"
    }
  }, "add accounts to start"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 10px",
      border: "1px solid var(--border)",
      background: "var(--panel)",
      borderRadius: "var(--radius)",
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 26,
      height: 26,
      background: role === "owner" ? "var(--text)" : "var(--chip)",
      color: role === "owner" ? "var(--bg)" : "var(--text)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontSize: 11,
      borderRadius: "var(--radius)"
    }
  }, (state.session.name || role || "?").slice(0, 2).toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.15,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600
    }
  }, state.session.name || (role === "owner" ? "Owner" : "Assistant")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)",
      textTransform: "uppercase",
      letterSpacing: "0.08em"
    }
  }, role === "owner" ? "Admin · full" : "Limited · log only")),
    cloudEnabled && session && /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.lock,
      title: "Sign out",
      onClick: async () => {
        try { await window.sbSignOut(); } catch (e) { console.warn(e); }
      },
    })
  )));
}

// ============================================================================
// TOPBAR
// ============================================================================
function Topbar({
  active,
  setActive,
  openAddTx
}) {
  const {
    state,
    actions,
    computed
  } = useStore();
  const role = state.session.role;
  const perms = ROLE_PERMS[role] || ROLE_PERMS.owner;
  const fxRate = state.settings.fxRate || 58.42;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 18px",
      borderBottom: "1px solid var(--border)",
      background: "var(--panel-alt)",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "5px 10px",
      border: "1px solid var(--border)",
      background: "var(--panel)",
      borderRadius: "var(--radius)",
      fontFamily: "var(--font-mono)",
      fontSize: 11.5,
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)"
    }
  }, new Date().toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric"
  }))), perms.canSee.includes("forecast") && /*#__PURE__*/React.createElement("button", {
    onClick: () => setActive("forecast"),
    style: {
      all: "unset",
      cursor: "pointer",
      padding: "5px 10px",
      border: "1px solid var(--border)",
      background: "var(--panel)",
      borderRadius: "var(--radius)",
      fontFamily: "var(--font-mono)",
      fontSize: 11.5,
      display: "flex",
      alignItems: "center",
      gap: 8,
      whiteSpace: "nowrap"
    },
    title: "Open forecast \u2014 set FX rate in Settings"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)"
    }
  }, "USD/PHP"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text)",
      fontWeight: 700
    }
  }, Number(fxRate).toFixed(2))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "5px 10px",
      border: "1px solid var(--border)",
      background: "var(--panel)",
      borderRadius: "var(--radius)",
      fontFamily: "var(--font-mono)",
      fontSize: 11.5,
      color: "var(--muted)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      background: "var(--up)",
      borderRadius: "50%"
    }
  }), "Saved \xB7 local"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    icon: ICONS.plus,
    variant: "primary",
    onClick: openAddTx
  }, "Add transaction"), perms.canSee.includes("coach") && /*#__PURE__*/React.createElement(Button, {
    icon: ICONS.sparkle,
    onClick: () => setActive("coach")
  }, "Coach"), perms.canSee.includes("report") && /*#__PURE__*/React.createElement(Button, {
    icon: ICONS.download,
    onClick: () => setActive("report")
  }, "Reports"), /*#__PURE__*/React.createElement(IconBtn, {
    icon: state.settings.mode === "light" ? ICONS.bell : ICONS.bell,
    onClick: () => actions.setSetting("mode", state.settings.mode === "light" ? "dark" : "light"),
    title: "Toggle light/dark"
  }));
}

// ============================================================================
// PageHeader
// ============================================================================
function PageHeader({
  active
}) {
  const {
    state
  } = useStore();
  const meta = NAV.find(n => n.id === active);
  const subs = {
    overview: "Your money snapshot — cash, income, expenses, debt, health.",
    cash: "How long your cash lasts · safety score · 30-day obligations.",
    transactions: "Every inflow and outflow logged · search, filter, edit, delete.",
    expenses: "Outflows only · category strip · add new.",
    income: "Inflows by source · trend.",
    calendar: "Bills laid on a real calendar · navigate any month.",
    debt: "Manage debts · payoff calculator · snowball vs avalanche.",
    credit: "Credit accounts · utilization · mark payments paid.",
    health: "Composite financial-health score + loan eligibility simulator.",
    forecast: "Future cash trajectory · USD income converts at your set rate · payment priority.",
    coach: "Real analysis of your data — what to cut, what to fix, what's safe.",
    budgets: "Caps per category · pacing tracker.",
    goals: "Savings goals · contributions · projected complete dates.",
    subscriptions: "Recurring rules — auto-generate transactions every month.",
    report: "Personal Income Statement · Ledger · Cash Flow · Health Summary · CSV export.",
    settings: "Profile, categories, cash accounts, data import/export."
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 18px",
      borderBottom: "1px solid var(--border)",
      background: "var(--panel-alt)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 600
    }
  }, state.settings.variant === "a" ? "Terminal" : "Quiet Ledger", " \xB7 ", meta?.label), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "4px 0 2px",
      fontFamily: "var(--font-display)",
      fontSize: 24,
      fontWeight: "var(--display-weight)",
      letterSpacing: "var(--tracking)",
      lineHeight: 1.1
    }
  }, meta?.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted)",
      maxWidth: 720,
      lineHeight: 1.5
    }
  }, subs[active])), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color: "var(--muted)",
      lineHeight: 1.4,
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("span", null, new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric"
  })), /*#__PURE__*/React.createElement("span", null, "Signed in as ", state.session.name || state.session.role)));
}
Object.assign(window, {
  NAV,
  GROUPS,
  ROLE_PERMS,
  Sidebar,
  Topbar,
  PageHeader
});