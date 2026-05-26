// ============================================================================
// transactions.jsx — Transaction form, table, and the three screens that
// list transactions (Transactions, Expenses, Income).
// ============================================================================

// ---------------------------------------------------------------------------
// TransactionForm — the single canonical add/edit modal used everywhere.
// ---------------------------------------------------------------------------
function TransactionForm({
  open,
  onClose,
  tx,
  kindLock
}) {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  const editing = !!tx;
  const initial = tx || {
    date: todayISO(),
    particular: "",
    amount: "",
    kind: kindLock || "expense",
    categoryId: "",
    accountId: state.cashAccounts[0]?.id || "",
    debtId: null,
    creditId: null,
    chargedCreditId: null,
    note: ""
  };
  const [form, setForm] = useState(initial);
  useEffect(() => {
    if (open) setForm(tx || initial); /* eslint-disable-next-line */
  }, [open, tx?.id]);
  const cats = state.categories.filter(c => c.kind === (form.kind === "income" ? "income" : "expense"));
  const linkOptions = form.kind === "expense" ? [{
    value: "",
    label: "— Plain expense —"
  }, ...state.debts.filter(d => d.status === "active").map(d => ({
    value: `debt:${d.id}`,
    label: `Debt payment · ${d.name}`
  })), ...state.creditAccounts.map(c => ({
    value: `credit:${c.id}`,
    label: `Credit pay · ${c.name}`
  }))] : [];
  const link = form.debtId ? `debt:${form.debtId}` : form.creditId ? `credit:${form.creditId}` : "";
  const setField = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const setLink = v => {
    if (!v) return setForm(f => ({
      ...f,
      debtId: null,
      creditId: null
    }));
    const [type, id] = v.split(":");
    if (type === "debt") {
      const d = state.debts.find(x => x.id === id);
      setForm(f => ({
        ...f,
        debtId: id,
        creditId: null,
        amount: f.amount || d?.monthlyPayment || "",
        particular: f.particular || `Payment · ${d.name}`,
        categoryId: state.categories.find(c => c.id === "cat-debt")?.id || f.categoryId
      }));
    } else if (type === "credit") {
      const c = state.creditAccounts.find(x => x.id === id);
      setForm(f => ({
        ...f,
        debtId: null,
        creditId: id,
        particular: f.particular || `Payment · ${c.name}`,
        categoryId: state.categories.find(c2 => c2.id === "cat-debt")?.id || f.categoryId
      }));
    }
  };
  const valid = form.particular && +form.amount > 0 && form.date;
  const onSave = () => {
    if (!valid) {
      toast("Fill date, particular and amount.", "error");
      return;
    }
    const payload = {
      ...form,
      amount: Number(form.amount),
      categoryId: form.categoryId || null,
      accountId: form.accountId || null,
      debtId: form.debtId || null,
      creditId: form.creditId || null,
      chargedCreditId: form.chargedCreditId || null
    };
    if (editing) {
      actions.updateTransaction(tx.id, payload);
      toast("Transaction updated.", "success");
    } else {
      actions.addTransaction(payload);
      toast("Transaction added.", "success");
    }
    onClose();
  };
  const onDelete = () => {
    actions.deleteTransaction(tx.id);
    toast("Transaction deleted.", "success");
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: editing ? "Edit transaction" : "Log transaction",
    width: 520,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, editing && state.settings.userRole !== "assistant" && /*#__PURE__*/React.createElement(Button, {
      danger: true,
      onClick: onDelete,
      style: {
        marginRight: "auto"
      },
      icon: ICONS.trash
    }, "Delete"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: onSave,
      disabled: !valid
    }, editing ? "Save changes" : "Add transaction"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, !kindLock && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 1,
      background: "var(--border)",
      padding: 1,
      borderRadius: "var(--radius)"
    }
  }, ["expense", "income"].map(k => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    onClick: () => setField("kind", k),
    style: {
      all: "unset",
      cursor: "pointer",
      flex: 1,
      padding: "8px 12px",
      textAlign: "center",
      background: form.kind === k ? "var(--panel)" : "transparent",
      color: form.kind === k ? "var(--text)" : "var(--muted)",
      fontFamily: "var(--font-ui)",
      fontSize: 12.5,
      fontWeight: 600,
      textTransform: "capitalize",
      borderRadius: "var(--radius)"
    }
  }, k))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Date",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "date",
    value: form.date,
    onChange: v => setField("date", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Amount (\u20B1)",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: form.amount,
    onChange: v => setField("amount", v),
    placeholder: "0.00",
    autoFocus: true
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Particular",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    value: form.particular,
    onChange: v => setField("particular", v),
    placeholder: "e.g. Grocery \xB7 Condo"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Category"
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.categoryId,
    onChange: v => setField("categoryId", v),
    options: [{
      value: "",
      label: "— Uncategorized —"
    }, ...cats.map(c => ({
      value: c.id,
      label: c.name
    }))]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "From / to account"
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.chargedCreditId ? "CREDIT:" + form.chargedCreditId : (form.accountId || ""),
    onChange: v => {
      if (v && v.startsWith("CREDIT:")) {
        const cId = v.replace("CREDIT:", "");
        setForm(f => ({ ...f, accountId: null, chargedCreditId: cId }));
      } else {
        setForm(f => ({ ...f, accountId: v || null, chargedCreditId: null }));
      }
    },
    options: [
      { value: "", label: "— None / cash —" },
      ...state.cashAccounts.map(a => ({ value: a.id, label: a.name + " · " + fmtMoney(a.balance, { dec: 0 }) })),
      ...(form.kind === "expense" ? state.creditAccounts.map(c => ({ value: "CREDIT:" + c.id, label: "[Credit] " + c.name + " · avail " + fmtMoney((c.limit || 0) - (c.balance || 0), { dec: 0 }) })) : [])
    ]
  }))), form.kind === "expense" && (state.debts.length || state.creditAccounts.length) > 0 && /*#__PURE__*/React.createElement(Field, {
    label: "Link to debt or credit (optional)",
    hint: "Linking auto-updates the debt's paidMonths counter or the credit balance."
  }, /*#__PURE__*/React.createElement(Select, {
    value: link,
    onChange: setLink,
    options: linkOptions
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Note"
  }, /*#__PURE__*/React.createElement(Textarea, {
    value: form.note,
    onChange: v => setField("note", v),
    placeholder: "Optional details\u2026",
    rows: 2
  }))));
}

// ---------------------------------------------------------------------------
// TransactionsTable — reusable table with edit/delete inline
// ---------------------------------------------------------------------------
function TransactionsTable({
  rows,
  onEdit,
  showAccount = true
}) {
  const {
    state
  } = useStore();
  if (rows.length === 0) {
    return /*#__PURE__*/React.createElement(Empty, {
      icon: ICONS.transactions,
      title: "No transactions match",
      body: "Try a different filter or log a new transaction."
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      fontSize: 9.5,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--faint)",
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px"
    })
  }, "Date"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px"
    })
  }, "Particular"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px"
    })
  }, "Category"), showAccount && /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px"
    })
  }, "Account"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "Amount"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }))), /*#__PURE__*/React.createElement("tbody", null, rows.map(r => {
    const cat = state.categories.find(c => c.id === r.categoryId);
    const acct = state.cashAccounts.find(a => a.id === r.accountId) || (r.chargedCreditId ? { name: "[Credit] " + ((state.creditAccounts.find(c => c.id === r.chargedCreditId) || {}).name || "") } : null);
    const isIn = r.kind === "income";
    return /*#__PURE__*/React.createElement("tr", {
      key: r.id,
      style: {
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        mono: true,
        color: "var(--muted)"
      })
    }, fmtDate(r.date)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        weight: 500
      })
    }, r.particular, (r.debtId || r.creditId || r.recurringId) && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 6
      }
    }, /*#__PURE__*/React.createElement(Chip, {
      tone: "muted"
    }, r.debtId ? "debt-pay" : r.creditId ? "credit-pay" : "auto"))), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px"
      })
    }, cat ? /*#__PURE__*/React.createElement(Chip, null, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        background: cat.color,
        display: "inline-block",
        marginRight: 4
      }
    }), cat.name) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--faint)"
      }
    }, "\u2014")), showAccount && /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        color: "var(--muted)"
      })
    }, acct?.name || /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--faint)"
      }
    }, "\u2014")), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        align: "right",
        mono: true,
        weight: 600,
        color: isIn ? "var(--up)" : "var(--down)"
      })
    }, isIn ? "+" : "−", fmtMoney(r.amount, {
      dec: 2
    })), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        align: "right"
      })
    }, /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.edit,
      onClick: () => onEdit(r),
      title: "Edit"
    })));
  }))));
}

// ---------------------------------------------------------------------------
// useTransactionFilter — shared filter UI hook
// ---------------------------------------------------------------------------
function useTransactionFilter(initial = {}) {
  const {
    state
  } = useStore();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState(initial.kind || "all");
  const [categoryId, setCategoryId] = useState("all");
  const [accountId, setAccountId] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const filtered = state.transactions.filter(t => {
    if (initial.kind && t.kind !== initial.kind) return false;
    if (kind !== "all" && t.kind !== kind) return false;
    if (categoryId !== "all" && t.categoryId !== categoryId) return false;
    if (accountId !== "all" && t.accountId !== accountId) return false;
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!t.particular.toLowerCase().includes(s) && !(t.note || "").toLowerCase().includes(s)) return false;
    }
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0));
  const ui = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 10px",
      border: "1px solid var(--border)",
      background: "var(--panel-alt)",
      borderRadius: "var(--radius)",
      minWidth: 200
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    d: ICONS.search,
    size: 12
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "Search particular or note\u2026",
    value: q,
    onChange: e => setQ(e.target.value),
    style: {
      all: "unset",
      flex: 1,
      fontSize: 12,
      color: "var(--text)"
    }
  })), !initial.kind && /*#__PURE__*/React.createElement(Select, {
    value: kind,
    onChange: setKind,
    options: [{
      value: "all",
      label: "All kinds"
    }, {
      value: "expense",
      label: "Expenses"
    }, {
      value: "income",
      label: "Income"
    }],
    style: {
      width: 130
    }
  }), /*#__PURE__*/React.createElement(Select, {
    value: categoryId,
    onChange: setCategoryId,
    options: [{
      value: "all",
      label: "All categories"
    }, ...state.categories.filter(c => !initial.kind || c.kind === initial.kind).map(c => ({
      value: c.id,
      label: c.name
    }))],
    style: {
      width: 150
    }
  }), /*#__PURE__*/React.createElement(Select, {
    value: accountId,
    onChange: setAccountId,
    options: [{
      value: "all",
      label: "All accounts"
    }, ...state.cashAccounts.map(a => ({
      value: a.id,
      label: a.name
    }))],
    style: {
      width: 140
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: from,
    onChange: e => setFrom(e.target.value),
    style: {
      ...inputStyle,
      width: 130,
      padding: "5px 8px",
      fontSize: 11.5
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: to,
    onChange: e => setTo(e.target.value),
    style: {
      ...inputStyle,
      width: 130,
      padding: "5px 8px",
      fontSize: 11.5
    }
  }), (q || categoryId !== "all" || accountId !== "all" || from || to || kind !== "all" && !initial.kind) && /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    onClick: () => {
      setQ("");
      setKind(initial.kind || "all");
      setCategoryId("all");
      setAccountId("all");
      setFrom("");
      setTo("");
    }
  }, "Clear"));
  return {
    filtered,
    ui
  };
}

// ============================================================================
// TRANSACTIONS SCREEN
// ============================================================================
function TransactionsScreen() {
  const {
    state,
    computed
  } = useStore();
  const [editTx, setEditTx] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const filter = useTransactionFilter();
  const totalIn = filter.filtered.filter(t => t.kind === "income").reduce((s, t) => s + t.amount, 0);
  const totalOut = filter.filtered.filter(t => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
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
      gridTemplateColumns: "repeat(4, 1fr)",
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
    label: "Total \xB7 matching filter",
    value: filter.filtered.length + " txns",
    sub: `of ${state.transactions.length} total`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Filtered income",
    value: fmtMoney(totalIn),
    color: "var(--up)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Filtered expenses",
    value: fmtMoney(totalOut),
    color: "var(--down)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Net",
    value: fmtMoney(totalIn - totalOut),
    color: totalIn >= totalOut ? "var(--up)" : "var(--down)"
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: `All transactions · ${filter.filtered.length} rows`,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.download,
      onClick: () => downloadCSV(filter.filtered, state)
    }, "Export CSV"), /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.plus,
      variant: "primary",
      onClick: () => setShowAdd(true)
    }, "Log new"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      borderBottom: "1px solid var(--border)",
      background: "var(--panel-alt)"
    }
  }, filter.ui), state.transactions.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: ICONS.transactions,
    title: "No transactions yet",
    body: "Click 'Log new' to record your first inflow or outflow. The dashboard will start updating immediately.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: ICONS.plus,
      onClick: () => setShowAdd(true)
    }, "Log your first transaction"),
    padding: 60
  }) : /*#__PURE__*/React.createElement(TransactionsTable, {
    rows: filter.filtered,
    onEdit: setEditTx
  })), /*#__PURE__*/React.createElement(TransactionForm, {
    open: showAdd || !!editTx,
    onClose: () => {
      setShowAdd(false);
      setEditTx(null);
    },
    tx: editTx
  }));
}

// ============================================================================
// EXPENSES SCREEN
// ============================================================================
function ExpensesScreen() {
  const {
    state,
    computed
  } = useStore();
  const [editTx, setEditTx] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const filter = useTransactionFilter({
    kind: "expense"
  });
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
      gridTemplateColumns: "repeat(4, 1fr)",
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
    label: "This month \xB7 total",
    value: fmtMoney(computed.monthExpense),
    trend: computed.expenseTrend,
    sub: `vs last mo ${fmtMoney(computed.lastMonthExpense)}`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Avg / day",
    value: fmtMoney(Math.round(computed.dailyBurn)),
    sub: `${computed.dayOfMonth} days elapsed`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Top category",
    value: computed.byCategory[0]?.category?.name || "—",
    sub: computed.byCategory[0] ? fmtMoney(computed.byCategory[0].amount) : "no expenses yet"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Logged",
    value: computed.transactionsThisMonth.filter(t => t.kind === "expense").length + " txns",
    sub: "this month"
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: `Expense ledger · ${filter.filtered.length} rows`,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.download,
      onClick: () => downloadCSV(filter.filtered, state)
    }, "Export CSV"), /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.plus,
      variant: "primary",
      onClick: () => setShowAdd(true)
    }, "Log expense"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      borderBottom: "1px solid var(--border)",
      background: "var(--panel-alt)"
    }
  }, filter.ui), state.transactions.filter(t => t.kind === "expense").length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: ICONS.expenses,
    title: "No expenses yet",
    body: "Log your first expense to see categories, budgets, and the cash burn update.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: ICONS.plus,
      onClick: () => setShowAdd(true)
    }, "Log expense"),
    padding: 60
  }) : /*#__PURE__*/React.createElement(TransactionsTable, {
    rows: filter.filtered,
    onEdit: setEditTx
  })), /*#__PURE__*/React.createElement(TransactionForm, {
    open: showAdd || !!editTx,
    onClose: () => {
      setShowAdd(false);
      setEditTx(null);
    },
    tx: editTx,
    kindLock: "expense"
  }));
}

// ============================================================================
// INCOME SCREEN
// ============================================================================
function IncomeScreen() {
  const {
    state,
    computed
  } = useStore();
  const [editTx, setEditTx] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const filter = useTransactionFilter({
    kind: "income"
  });
  const incomeBySource = {};
  for (const t of state.transactions.filter(x => x.kind === "income")) {
    incomeBySource[t.particular] = (incomeBySource[t.particular] || 0) + t.amount;
  }
  const sortedSources = Object.entries(incomeBySource).map(([name, amt]) => ({
    name,
    amount: amt
  })).sort((a, b) => b.amount - a.amount);
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
      gridTemplateColumns: "repeat(4, 1fr)",
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
    label: "This month \xB7 income",
    value: fmtMoney(computed.monthIncome),
    trend: computed.incomeTrend,
    sub: "vs last month",
    color: "var(--up)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Sources active",
    value: sortedSources.length,
    sub: "distinct labels"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Top source",
    value: sortedSources[0]?.name || "—",
    sub: sortedSources[0] ? fmtMoney(sortedSources[0].amount) + " all-time" : "log income"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Logged",
    value: computed.transactionsThisMonth.filter(t => t.kind === "income").length + " txns",
    sub: "this month"
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: `Income ledger · ${filter.filtered.length} rows`,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.download,
      onClick: () => downloadCSV(filter.filtered, state)
    }, "Export CSV"), /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.plus,
      variant: "primary",
      onClick: () => setShowAdd(true)
    }, "Log income"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      borderBottom: "1px solid var(--border)",
      background: "var(--panel-alt)"
    }
  }, filter.ui), state.transactions.filter(t => t.kind === "income").length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: ICONS.income,
    title: "No income recorded",
    body: "Log salary, freelance, side gigs, gifts \u2014 any inflow.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: ICONS.plus,
      onClick: () => setShowAdd(true)
    }, "Log income"),
    padding: 60
  }) : /*#__PURE__*/React.createElement(TransactionsTable, {
    rows: filter.filtered,
    onEdit: setEditTx
  })), /*#__PURE__*/React.createElement(TransactionForm, {
    open: showAdd || !!editTx,
    onClose: () => {
      setShowAdd(false);
      setEditTx(null);
    },
    tx: editTx,
    kindLock: "income"
  }));
}

// ---------------------------------------------------------------------------
// downloadCSV — generic CSV export of any transaction list
// ---------------------------------------------------------------------------
function downloadCSV(rows, state) {
  const headers = ["date", "kind", "particular", "category", "account", "amount", "note", "logger"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const cat = state.categories.find(c => c.id === r.categoryId)?.name || "";
    const acct = state.cashAccounts.find(a => a.id === r.accountId)?.name || "";
    const cells = [r.date, r.kind, csvEsc(r.particular), csvEsc(cat), csvEsc(acct), r.amount, csvEsc(r.note || ""), r.logger || ""];
    lines.push(cells.join(","));
  }
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ledger-transactions-${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
function csvEsc(s) {
  if (s == null) return "";
  const str = String(s);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) return `"${str.replace(/"/g, '""')}"`;
  return str;
}
Object.assign(window, {
  TransactionForm,
  TransactionsTable,
  useTransactionFilter,
  TransactionsScreen,
  ExpensesScreen,
  IncomeScreen,
  downloadCSV
});
