// ============================================================================
// screens-overview.jsx — Overview dashboard + Cash Checker
// ============================================================================

// ============================================================================
// OVERVIEW
// ============================================================================
function OverviewScreen({
  setActive,
  openAddTx
}) {
  const {
    state,
    computed
  } = useStore();
  const [editTx, setEditTx] = useState(null);

  // 6-month history (real, from logged transactions)
  const today = new Date();
  const history = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const monthTxs = state.transactions.filter(t => {
      const td = new Date(t.date);
      return td.getFullYear() === y && td.getMonth() === m;
    });
    const income = monthTxs.filter(t => t.kind === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTxs.filter(t => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
    history.push({
      x: d.toLocaleDateString("en-PH", {
        month: "short"
      }),
      income,
      expense,
      net: income - expense
    });
  }
  if (computed.isEmpty) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(Empty, {
      icon: ICONS.overview,
      title: "Welcome to Ledger",
      body: "Your dashboard will fill in as you add data. Start with a cash account, then log your first transaction.",
      padding: 70,
      action: /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8
        }
      }, /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        icon: ICONS.plus,
        onClick: () => setActive("settings")
      }, "Add cash account"), /*#__PURE__*/React.createElement(Button, {
        icon: ICONS.plus,
        onClick: openAddTx
      }, "Log transaction"))
    })));
  }
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: 1,
      background: "var(--border)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Cash on hand",
    value: fmtMoney(computed.cashOnHand),
    sub: `${state.cashAccounts.length} accounts`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Income \xB7 this month",
    value: fmtMoney(computed.monthIncome),
    trend: computed.incomeTrend,
    color: "var(--up)",
    sub: "vs last month"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Expenses \xB7 this month",
    value: fmtMoney(computed.monthExpense),
    trend: computed.expenseTrend,
    color: "var(--down)",
    sub: "vs last month"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Savings rate",
    value: computed.savingsRate != null ? fmtPct(computed.savingsRate, 1) : "—",
    sub: `net ${fmtMoney(computed.net)}`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Debt remaining",
    value: fmtMoneyShort(computed.remainingPrincipal),
    sub: computed.totalPrincipal ? fmtPct(computed.debtPaidPct, 0) + " paid" : "no debts"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.5fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Cash flow \xB7 last 6 months",
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        fontSize: 10,
        fontFamily: "var(--font-mono)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        color: "var(--muted)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 2,
        background: "var(--up)"
      }
    }), "Income"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        color: "var(--muted)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 2,
        background: "var(--down)"
      }
    }), "Expense"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 4,
        color: "var(--muted)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 2,
        background: "var(--accent)"
      }
    }), "Net"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(AreaChart, {
    data: history.map(h => ({
      x: h.x,
      income: h.income,
      expense: h.expense,
      net: h.net
    })),
    width: 580,
    height: 220,
    lines: [{
      key: "income",
      color: "var(--up)",
      fill: 0.10,
      width: 1.6
    }, {
      key: "expense",
      color: "var(--down)",
      fill: 0.08,
      width: 1.6
    }, {
      key: "net",
      color: "var(--accent)",
      width: 1.4
    }]
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: `Upcoming · next ${computed.upcoming.length} bills`,
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => setActive("calendar")
    }, "Calendar")
  }, computed.upcoming.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: ICONS.calendar,
    title: "Nothing upcoming",
    body: "Add debts or recurring rules to see scheduled bills.",
    padding: 40
  }) : /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 11.5
    }
  }, /*#__PURE__*/React.createElement("tbody", null, computed.upcoming.slice(0, 8).map(u => /*#__PURE__*/React.createElement("tr", {
    key: u.id,
    style: {
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "8px 14px",
      mono: true,
      color: "var(--muted)"
    })
  }, fmtDate(u.date), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6,
      color: "var(--faint)"
    }
  }, "\xB7 ", u.daysOut === 0 ? "today" : `${u.daysOut}d`)), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "8px 14px",
      weight: 500
    })
  }, u.label), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right",
      mono: true,
      weight: 600
    })
  }, fmtMoney(u.amount)))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "This month \xB7 by category"
  }, computed.byCategory.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: ICONS.budgets,
    title: "No expenses",
    body: "Categories appear once you log expenses.",
    padding: 30
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, computed.byCategory.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.categoryId
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 11,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      background: c.category?.color || "var(--muted)"
    }
  }), c.category?.name || "Uncategorized"), /*#__PURE__*/React.createElement(Num, {
    weight: 600
  }, fmtMoney(c.amount))), /*#__PURE__*/React.createElement(ProgressBar, {
    value: c.amount,
    max: computed.byCategory[0].amount,
    color: c.category?.color || "var(--muted)",
    height: 4
  }))))), /*#__PURE__*/React.createElement(Panel, {
    title: "Debt overview",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => setActive("debt")
    }, "Manage")
  }, computed.activeDebts.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: ICONS.debt,
    title: "No active debts",
    body: "Add a debt to track payoff progress.",
    padding: 30
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Remaining",
    value: fmtMoney(computed.remainingPrincipal),
    sub: fmtPct(computed.debtPaidPct, 0) + " of total paid"
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    value: computed.paidPrincipal,
    max: computed.totalPrincipal,
    color: "var(--accent)",
    height: 6
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", null, computed.activeDebts.length, " active accounts"), /*#__PURE__*/React.createElement("span", null, "Monthly: ", /*#__PURE__*/React.createElement(Num, {
    weight: 600,
    color: "var(--text)"
  }, fmtMoney(computed.monthlyDebtObligation)))))), /*#__PURE__*/React.createElement(Panel, {
    title: `Goals · ${state.goals.length}`,
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => setActive("goals")
    }, "Open")
  }, state.goals.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: ICONS.goals,
    title: "No goals",
    body: "Set a savings target to see progress here.",
    padding: 30
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, state.goals.slice(0, 3).map(g => {
    const pct = (g.saved || 0) / g.target;
    return /*#__PURE__*/React.createElement("div", {
      key: g.id
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11.5,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600
      }
    }, g.name), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--muted)"
      }
    }, fmtPct(pct, 0))), /*#__PURE__*/React.createElement(ProgressBar, {
      value: g.saved || 0,
      max: g.target,
      color: "var(--accent)",
      height: 4
    }));
  })))), /*#__PURE__*/React.createElement(Panel, {
    title: `Recent transactions · ${state.transactions.length} total`,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => setActive("transactions")
    }, "View all"), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "primary",
      icon: ICONS.plus,
      onClick: openAddTx
    }, "Log"))
  }, /*#__PURE__*/React.createElement(TransactionsTable, {
    rows: recent,
    onEdit: setEditTx
  })), /*#__PURE__*/React.createElement(TransactionForm, {
    open: !!editTx,
    onClose: () => setEditTx(null),
    tx: editTx
  }));
}

// ============================================================================
// CASH CHECKER
// ============================================================================
function CashCheckerScreen() {
  const {
    state,
    computed
  } = useStore();
  const C = computed;
  if (state.cashAccounts.length === 0 && state.transactions.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(Empty, {
      icon: ICONS.cash,
      title: "Add a cash account to start",
      body: "Cash Checker shows how many days your cash lasts at your burn rate. It needs at least one account.",
      padding: 80
    })));
  }
  const totalLiabilities30 = C.upcoming.filter(u => u.daysOut <= 30).reduce((s, u) => s + u.amount, 0);
  const totalLiabilities14 = C.upcoming.filter(u => u.daysOut <= 14).reduce((s, u) => s + u.amount, 0);
  const surplus30 = C.cashOnHand - totalLiabilities30;
  const safetyScore = Math.min(100, Math.round(C.cashOnHand / Math.max(1, C.dailyBurn * 90) * 100));
  const tone = safetyScore >= 75 ? "var(--up)" : safetyScore >= 50 ? "var(--accent)" : safetyScore >= 30 ? "var(--warn)" : "var(--down)";
  const label = safetyScore >= 75 ? "Healthy" : safetyScore >= 50 ? "Adequate" : safetyScore >= 30 ? "Thin" : "At risk";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.1fr 1.1fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 22,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 700
    }
  }, "Survival runway"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 76,
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: "var(--tracking)",
      color: tone
    }
  }, C.survivalDays != null ? C.survivalDays : "—"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)"
    }
  }, C.survivalDays != null ? "days at current burn" : "log expenses to compute")), C.dailyBurn > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted)",
      lineHeight: 1.5
    }
  }, "Daily burn: ", /*#__PURE__*/React.createElement(Num, {
    weight: 700
  }, fmtMoney(Math.round(C.dailyBurn))), " \xB7 Cash on hand: ", /*#__PURE__*/React.createElement(Num, {
    weight: 700
  }, fmtMoney(C.cashOnHand))))), /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 22,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 700
    }
  }, "Cash safety score"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(DonutMini, {
    value: safetyScore,
    max: 100,
    size: 110,
    stroke: 10,
    color: tone,
    trackColor: "var(--border)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 28,
      fontWeight: 600,
      color: tone
    }
  }, safetyScore), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)"
    }
  }, "/ 100"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Chip, {
    tone: safetyScore >= 75 ? "up" : safetyScore >= 50 ? "accent" : "warn",
    style: {
      fontSize: 11
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      marginTop: 8,
      lineHeight: 1.5
    }
  }, "Target: 3 months of cash burn covered."))))), /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 18,
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, C.cashOnHand < totalLiabilities30 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      background: "var(--down)",
      color: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontSize: 13,
      borderRadius: "50%",
      flexShrink: 0
    }
  }, "!"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "var(--down)",
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.08em"
    }
  }, "Cash deficit \xB7 next 30 days"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text)",
      marginTop: 4,
      lineHeight: 1.5
    }
  }, "Obligations of ", /*#__PURE__*/React.createElement(Num, {
    weight: 700,
    color: "var(--down)"
  }, fmtMoney(totalLiabilities30)), " exceed your cash of ", /*#__PURE__*/React.createElement(Num, {
    weight: 700
  }, fmtMoney(C.cashOnHand)), ". Defer subscriptions or pull from emergency."))) : C.cashOnHand < totalLiabilities30 * 1.5 ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      background: "var(--warn)",
      color: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontSize: 13,
      borderRadius: "50%",
      flexShrink: 0
    }
  }, "!"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "var(--warn)",
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.08em"
    }
  }, "Tight \xB7 next 30 days"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text)",
      marginTop: 4,
      lineHeight: 1.5
    }
  }, "Less than 50% headroom after 30-day obligations. Avoid large purchases."))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 24,
      height: 24,
      background: "var(--up)",
      color: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontSize: 13,
      borderRadius: "50%",
      flexShrink: 0
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: "var(--up)",
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.08em"
    }
  }, "On track \xB7 next 30 days"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text)",
      marginTop: 4,
      lineHeight: 1.5
    }
  }, "Cash covers obligations with room to save.")))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.4fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Cash vs obligations \xB7 30-day window"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 18,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(KPIInline, {
    label: "Cash on hand",
    value: fmtMoney(C.cashOnHand)
  }), /*#__PURE__*/React.createElement(KPIInline, {
    label: "Due in 14 days",
    value: fmtMoney(totalLiabilities14),
    color: "var(--warn)"
  }), /*#__PURE__*/React.createElement(KPIInline, {
    label: "Due in 30 days",
    value: fmtMoney(totalLiabilities30),
    color: "var(--down)"
  }), /*#__PURE__*/React.createElement(KPIInline, {
    label: "Surplus",
    value: (surplus30 >= 0 ? "+" : "−") + fmtMoney(Math.abs(surplus30)),
    color: surplus30 >= 0 ? "var(--up)" : "var(--down)"
  })))), /*#__PURE__*/React.createElement(Panel, {
    title: `Accounts · ${state.cashAccounts.length}`
  }, state.cashAccounts.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    title: "No cash accounts",
    body: "Add accounts in Settings to track balances.",
    padding: 30
  }) : /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("tbody", null, state.cashAccounts.map(a => /*#__PURE__*/React.createElement("tr", {
    key: a.id,
    style: {
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      weight: 600
    })
  }, a.name), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      color: "var(--muted)"
    })
  }, /*#__PURE__*/React.createElement(Chip, null, a.kind)), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      align: "right",
      mono: true,
      weight: 600
    })
  }, fmtMoney(a.balance, {
    dec: 2
  })))), /*#__PURE__*/React.createElement("tr", {
    style: {
      borderTop: "1px solid var(--border-hi)",
      background: "var(--panel-alt)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    colSpan: 2,
    style: cellStyle({
      pad: "12px 14px",
      weight: 700
    })
  }, "TOTAL"), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "12px 14px",
      align: "right",
      mono: true,
      weight: 700
    })
  }, fmtMoney(C.cashOnHand, {
    dec: 2
  }))))))));
}
function KPIInline({
  label,
  value,
  color
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontWeight: 600
    }
  }, label), /*#__PURE__*/React.createElement(Num, {
    weight: 600,
    size: 18,
    color: color
  }, value));
}

// ---------------------------------------------------------------------------
// DonutMini — used by Cash Checker & Health
// ---------------------------------------------------------------------------
function DonutMini({
  value,
  max = 100,
  size = 80,
  stroke = 8,
  color = "var(--accent)",
  trackColor = "var(--border)",
  children
}) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const offset = C - Math.min(value, max) / max * C;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: trackColor,
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeDasharray: C,
    strokeDashoffset: offset,
    transform: `rotate(-90 ${size / 2} ${size / 2})`,
    strokeLinecap: "butt"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-num)",
      fontWeight: 600
    }
  }, children));
}
Object.assign(window, {
  OverviewScreen,
  CashCheckerScreen,
  DonutMini,
  KPIInline
});