// ============================================================================
// screens-reports.jsx — 4 tabbed reports + CSV export + print
// ============================================================================

function ReportScreen() {
  const {
    state,
    computed
  } = useStore();
  const [tab, setTab] = useState("income-statement");
  if (computed.isEmpty) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(Empty, {
      icon: ICONS.report,
      title: "No data to report yet",
      body: "Reports populate from your transactions, debts, and accounts. Add some data first.",
      padding: 80
    })));
  }
  const onPrint = () => window.print();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 26px",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 600
    }
  }, "End-of-month reports \xB7 personal"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "8px 0 0",
      fontFamily: "var(--font-display)",
      fontSize: 36,
      fontWeight: "var(--display-weight)",
      letterSpacing: "var(--tracking)",
      lineHeight: 1
    }
  }, new Date().toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted)",
      marginTop: 6,
      fontFamily: "var(--font-mono)"
    }
  }, "4 reports \xB7 auto-generated from your real data \xB7 ", computed.transactionsThisMonth.length, " transactions")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Button, {
    icon: ICONS.download,
    onClick: () => downloadCSV(state.transactions, state)
  }, "CSV \xB7 all txns"), /*#__PURE__*/React.createElement(Button, {
    icon: ICONS.download,
    variant: "primary",
    onClick: onPrint
  }, "Print / Save as PDF"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      borderBottom: "1px solid var(--border)"
    }
  }, [{
    id: "income-statement",
    label: "1 · Income Statement",
    sub: "Inflows − Outflows"
  }, {
    id: "ledger",
    label: "2 · Personal Ledger",
    sub: "Every transaction"
  }, {
    id: "cash-flow",
    label: "3 · Cash Flow Report",
    sub: "Opening → closing"
  }, {
    id: "summary",
    label: "4 · Health Summary",
    sub: "Score + advice"
  }].map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    onClick: () => setTab(t.id),
    style: {
      all: "unset",
      cursor: "pointer",
      flex: 1,
      padding: "12px 16px",
      borderRight: "1px solid var(--border)",
      borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
      background: tab === t.id ? "var(--panel)" : "var(--panel-alt)",
      display: "flex",
      flexDirection: "column",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: tab === t.id ? "var(--text)" : "var(--muted)"
    }
  }, t.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)"
    }
  }, t.sub))))), tab === "income-statement" && /*#__PURE__*/React.createElement(IncomeStatement, null), tab === "ledger" && /*#__PURE__*/React.createElement(PersonalLedger, null), tab === "cash-flow" && /*#__PURE__*/React.createElement(CashFlow, null), tab === "summary" && /*#__PURE__*/React.createElement(HealthSummary, null));
}

// ============================================================================
// REPORT 1 · Income Statement
// ============================================================================
function IncomeStatement() {
  const {
    state,
    computed
  } = useStore();
  const inc = computed.monthIncome;
  const exp = computed.monthExpense;
  const surplus = inc - exp;
  const byCat = computed.byCategory;
  const incomeBySource = {};
  for (const t of computed.transactionsThisMonth.filter(x => x.kind === "income")) {
    incomeBySource[t.particular] = (incomeBySource[t.particular] || 0) + t.amount;
  }
  const sources = Object.entries(incomeBySource).map(([n, a]) => ({
    name: n,
    amount: a
  })).sort((a, b) => b.amount - a.amount);
  const debtCatId = state.categories.find(c => c.id === "cat-debt")?.id;
  const debtPay = byCat.find(c => c.categoryId === debtCatId)?.amount || 0;
  return /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 26px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 700
    }
  }, "Personal Income Statement"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "4px 0 4px",
      fontFamily: "var(--font-display)",
      fontSize: 22,
      fontWeight: "var(--display-weight)",
      letterSpacing: "var(--tracking)"
    }
  }, "For the month ended ", new Date(computed.year, computed.month + 1, 0).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)"
    }
  }, "Cash basis \xB7 \u20B1"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: 18,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 2,
    style: {
      padding: "14px 0 6px",
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--up)",
      fontWeight: 700,
      borderBottom: "1px solid var(--border)"
    }
  }, "Inflows \xB7 Earnings")), sources.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 2,
    style: {
      padding: "10px 0",
      color: "var(--faint)"
    }
  }, "No income recorded this month.")) : sources.map(s => /*#__PURE__*/React.createElement("tr", {
    key: s.name,
    style: {
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "8px 0"
    }
  }, s.name), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "8px 0",
      textAlign: "right",
      fontFamily: "var(--font-num)",
      fontVariantNumeric: "tabular-nums"
    }
  }, fmtMoney(s.amount, {
    dec: 2
  })))), /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: "2px solid var(--text)",
      background: "var(--panel-alt)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 0",
      fontWeight: 700
    }
  }, "Total inflows"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 0",
      textAlign: "right",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontVariantNumeric: "tabular-nums"
    }
  }, fmtMoney(inc, {
    dec: 2
  }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 2,
    style: {
      padding: "18px 0 6px",
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--down)",
      fontWeight: 700,
      borderBottom: "1px solid var(--border)"
    }
  }, "Outflows \xB7 By category")), byCat.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 2,
    style: {
      padding: "10px 0",
      color: "var(--faint)"
    }
  }, "No expenses recorded.")) : byCat.map(c => /*#__PURE__*/React.createElement("tr", {
    key: c.categoryId,
    style: {
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "8px 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      background: c.category?.color || "var(--muted)",
      display: "inline-block",
      marginRight: 8
    }
  }), c.category?.name || "Uncategorized"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "8px 0",
      textAlign: "right",
      fontFamily: "var(--font-num)",
      fontVariantNumeric: "tabular-nums"
    }
  }, "(", fmtMoney(c.amount, {
    dec: 2
  }), ")"))), /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: "2px solid var(--text)",
      background: "var(--panel-alt)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 0",
      fontWeight: 700
    }
  }, "Total outflows"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "10px 0",
      textAlign: "right",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontVariantNumeric: "tabular-nums"
    }
  }, "(", fmtMoney(exp, {
    dec: 2
  }), ")")), debtPay > 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "18px 0 4px",
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--muted)",
      fontWeight: 700
    }
  }, "Of which \xB7 debt servicing"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "18px 0 4px",
      textAlign: "right",
      fontFamily: "var(--font-num)",
      color: "var(--muted)",
      fontVariantNumeric: "tabular-nums"
    }
  }, fmtMoney(debtPay, {
    dec: 2
  }))), /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "var(--accent-soft)",
      borderTop: "2px solid var(--accent)",
      borderBottom: "2px solid var(--accent)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "16px 0",
      fontWeight: 700,
      fontSize: 14,
      color: "var(--accent)"
    }
  }, "NET FINANCIAL SURPLUS"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "16px 0",
      textAlign: "right",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontSize: 18,
      color: surplus >= 0 ? "var(--accent)" : "var(--down)",
      fontVariantNumeric: "tabular-nums"
    }
  }, surplus >= 0 ? "+" : "−", fmtMoney(Math.abs(surplus), {
    dec: 2
  }))), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "8px 0",
      color: "var(--muted)",
      fontSize: 11
    }
  }, "Savings rate"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "8px 0",
      textAlign: "right",
      fontFamily: "var(--font-num)",
      color: "var(--muted)",
      fontSize: 11
    }
  }, inc ? fmtPct(surplus / inc, 1) : "—"))))));
}

// ============================================================================
// REPORT 2 · Personal Ledger
// ============================================================================
function PersonalLedger() {
  const {
    state,
    computed
  } = useStore();
  const rows = [...computed.transactionsThisMonth].sort((a, b) => a.date.localeCompare(b.date));
  // Opening balance: cash on hand minus net of this month's transactions
  const netThisMonth = rows.reduce((s, r) => s + (r.kind === "income" ? r.amount : -r.amount), 0);
  const opening = computed.cashOnHand - netThisMonth;
  let bal = opening;
  return /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 26px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 700
    }
  }, "Personal Ledger"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "4px 0 4px",
      fontFamily: "var(--font-display)",
      fontSize: 22,
      fontWeight: "var(--display-weight)",
      letterSpacing: "var(--tracking)"
    }
  }, "Full transaction journal"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)"
    }
  }, rows.length, " entries \xB7 running balance \xB7 \u20B1"), rows.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    title: "No transactions this month",
    body: "Log some to populate the ledger.",
    padding: 40
  }) : /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: 18,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "var(--panel-alt)",
      borderTop: "2px solid var(--text)",
      borderBottom: "2px solid var(--text)"
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "10px 12px"
    })
  }, "Date"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "10px 12px"
    })
  }, "Particular"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "10px 12px"
    })
  }, "Category"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "10px 12px",
      align: "right"
    })
  }, "Debit (in)"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "10px 12px",
      align: "right"
    })
  }, "Credit (out)"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "10px 12px",
      align: "right"
    })
  }, "Running balance"))), /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: "1px solid var(--border)",
      background: "var(--panel-alt)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 12px",
      mono: true,
      color: "var(--muted)",
      weight: 700
    })
  }, fmtDate(rows[0].date)), /*#__PURE__*/React.createElement("td", {
    colSpan: 4,
    style: cellStyle({
      pad: "10px 12px",
      weight: 700,
      color: "var(--muted)"
    })
  }, "Opening balance \xB7 brought forward"), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 12px",
      align: "right",
      mono: true,
      weight: 700
    })
  }, fmtMoney(opening, {
    dec: 2
  }))), rows.map(r => {
    bal += r.kind === "income" ? r.amount : -r.amount;
    const cat = state.categories.find(c => c.id === r.categoryId);
    return /*#__PURE__*/React.createElement("tr", {
      key: r.id,
      style: {
        borderBottom: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "8px 12px",
        mono: true,
        color: "var(--muted)"
      })
    }, fmtDate(r.date)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "8px 12px"
      })
    }, r.particular), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "8px 12px"
      })
    }, cat ? /*#__PURE__*/React.createElement(Chip, null, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        background: cat.color,
        display: "inline-block",
        marginRight: 4
      }
    }), cat.name) : "—"), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "8px 12px",
        align: "right",
        mono: true,
        weight: 600,
        color: "var(--up)"
      })
    }, r.kind === "income" ? fmtMoney(r.amount, {
      dec: 2
    }) : ""), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "8px 12px",
        align: "right",
        mono: true,
        weight: 600,
        color: "var(--down)"
      })
    }, r.kind === "expense" ? fmtMoney(r.amount, {
      dec: 2
    }) : ""), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "8px 12px",
        align: "right",
        mono: true,
        weight: 600
      })
    }, fmtMoney(bal, {
      dec: 2
    })));
  }), /*#__PURE__*/React.createElement("tr", {
    style: {
      borderTop: "2px solid var(--text)",
      borderBottom: "2px solid var(--text)",
      background: "var(--panel-alt)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    colSpan: 3,
    style: cellStyle({
      pad: "10px 12px",
      weight: 700
    })
  }, "TOTALS"), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 12px",
      align: "right",
      mono: true,
      weight: 700,
      color: "var(--up)"
    })
  }, fmtMoney(rows.filter(r => r.kind === "income").reduce((s, r) => s + r.amount, 0), {
    dec: 2
  })), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 12px",
      align: "right",
      mono: true,
      weight: 700,
      color: "var(--down)"
    })
  }, fmtMoney(rows.filter(r => r.kind === "expense").reduce((s, r) => s + r.amount, 0), {
    dec: 2
  })), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 12px",
      align: "right",
      mono: true,
      weight: 700
    })
  }, fmtMoney(bal, {
    dec: 2
  })))))));
}

// ============================================================================
// REPORT 3 · Cash Flow
// ============================================================================
function CashFlow() {
  const {
    state,
    computed
  } = useStore();
  const inc = computed.monthIncome;
  const exp = computed.monthExpense;
  const opening = computed.cashOnHand - (inc - exp);
  const close = computed.cashOnHand;
  const byCat = computed.byCategory;
  const Line = ({
    label,
    value,
    indent,
    sub,
    bold
  }) => /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: indent ? "8px 0 8px 24px" : "8px 0",
      fontSize: 13,
      fontWeight: bold ? 700 : 500,
      color: sub ? "var(--muted)" : "var(--text)"
    }
  }, label), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "8px 0",
      textAlign: "right",
      fontFamily: "var(--font-num)",
      fontWeight: bold ? 700 : 500,
      fontVariantNumeric: "tabular-nums",
      color: sub ? "var(--muted)" : value < 0 ? "var(--down)" : "var(--text)"
    }
  }, value < 0 ? `(${fmtMoney(Math.abs(value), {
    dec: 2
  })})` : fmtMoney(value, {
    dec: 2
  })));
  return /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 26px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 700
    }
  }, "Full Cash Flow Report"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "4px 0 4px",
      fontFamily: "var(--font-display)",
      fontSize: 22,
      fontWeight: "var(--display-weight)",
      letterSpacing: "var(--tracking)"
    }
  }, "Cash movements this month"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)"
    }
  }, "Opening cash \u2192 Closing cash \xB7 \u20B1"), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement(Line, {
    label: "Opening cash",
    value: opening,
    bold: true
  }), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 2,
    style: {
      padding: "16px 0 4px",
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--up)",
      fontWeight: 700,
      borderBottom: "1px solid var(--border)"
    }
  }, "Cash inflows")), /*#__PURE__*/React.createElement(Line, {
    label: "Income (all sources)",
    value: inc,
    indent: true
  }), /*#__PURE__*/React.createElement(Line, {
    label: "Total cash inflows",
    value: inc,
    bold: true
  }), /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: 2,
    style: {
      padding: "16px 0 4px",
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--down)",
      fontWeight: 700,
      borderBottom: "1px solid var(--border)"
    }
  }, "Cash outflows \xB7 by category")), byCat.map(c => /*#__PURE__*/React.createElement(Line, {
    key: c.categoryId,
    label: c.category?.name || "Uncategorized",
    value: -c.amount,
    indent: true
  })), /*#__PURE__*/React.createElement(Line, {
    label: "Total cash outflows",
    value: -exp,
    bold: true
  }), /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "var(--accent-soft)",
      borderTop: "2px solid var(--accent)",
      borderBottom: "2px solid var(--accent)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "16px 0",
      fontWeight: 700,
      fontSize: 14,
      color: "var(--accent)"
    }
  }, "NET CHANGE IN CASH"), /*#__PURE__*/React.createElement("td", {
    style: {
      padding: "16px 0",
      textAlign: "right",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontSize: 16,
      color: inc - exp >= 0 ? "var(--accent)" : "var(--down)",
      fontVariantNumeric: "tabular-nums"
    }
  }, inc - exp >= 0 ? "+" : "", fmtMoney(inc - exp, {
    dec: 2
  }))), /*#__PURE__*/React.createElement(Line, {
    label: "Closing cash",
    value: close,
    bold: true
  })))));
}

// ============================================================================
// REPORT 4 · Health Summary
// ============================================================================
function HealthSummary() {
  const {
    state,
    computed
  } = useStore();
  const H = computed.health;
  const insights = generateInsights(state, computed);
  const warnings = insights.filter(i => i.kind === "warn");
  const suggestions = insights.filter(i => i.kind === "suggest");
  const wins = insights.filter(i => i.kind === "praise");
  return /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "20px 26px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 700
    }
  }, "Financial Health Summary"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: "4px 0 4px",
      fontFamily: "var(--font-display)",
      fontSize: 22,
      fontWeight: "var(--display-weight)",
      letterSpacing: "var(--tracking)"
    }
  }, "Behavior, debt, and what to do next"), H && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 14,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(MiniBox, {
    label: "Composite score",
    value: `${H.composite} / 100`,
    accent: true
  }), /*#__PURE__*/React.createElement(MiniBox, {
    label: "Status",
    value: H.rating
  }), /*#__PURE__*/React.createElement(MiniBox, {
    label: "DTI ratio",
    value: fmtPct(H.dti, 1),
    color: H.dti > 0.36 ? "var(--down)" : "var(--up)"
  }), /*#__PURE__*/React.createElement(MiniBox, {
    label: "Savings rate",
    value: H.savingsRate != null ? fmtPct(H.savingsRate, 1) : "—",
    color: H.savingsRate >= 0.2 ? "var(--up)" : H.savingsRate < 0 ? "var(--down)" : "var(--text)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 16
    }
  }, [{
    title: "Watch list",
    tone: "var(--down)",
    items: warnings
  }, {
    title: "Recommendations",
    tone: "var(--accent)",
    items: suggestions
  }, {
    title: "Wins",
    tone: "var(--up)",
    items: wins
  }].map(sec => /*#__PURE__*/React.createElement("div", {
    key: sec.title
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: sec.tone,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      fontWeight: 700,
      marginBottom: 10
    }
  }, sec.title), sec.items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted)"
    }
  }, "Nothing here.") : /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingLeft: 18,
      fontSize: 12.5,
      lineHeight: 1.6,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, sec.items.map((i, idx) => /*#__PURE__*/React.createElement("li", {
    key: idx
  }, /*#__PURE__*/React.createElement("strong", null, i.title), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--muted)",
      marginTop: 2
    }
  }, i.body)))))))));
}
Object.assign(window, {
  ReportScreen,
  IncomeStatement,
  PersonalLedger,
  CashFlow,
  HealthSummary
});