// ============================================================================
// screens-debt.jsx — Debt management + Credit accounts + Payoff calculator
// ============================================================================

// ---------------------------------------------------------------------------
// DebtForm — add/edit a debt
// ---------------------------------------------------------------------------
function DebtForm({
  open,
  onClose,
  debt
}) {
  const {
    actions
  } = useStore();
  const toast = useToast();
  const editing = !!debt;
  const [form, setForm] = useState(debt || {
    name: "",
    monthlyPayment: "",
    totalMonths: 12,
    paidMonths: 0,
    interestRate: 0,
    dueDay: 1,
    status: "active",
    note: ""
  });
  useEffect(() => {
    if (open) setForm(debt || {
      name: "",
      monthlyPayment: "",
      totalMonths: 12,
      paidMonths: 0,
      interestRate: 0,
      dueDay: 1,
      status: "active",
      note: ""
    });
  }, [open, debt?.id]);
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const valid = form.name && +form.monthlyPayment > 0 && +form.totalMonths > 0;
  const save = () => {
    if (!valid) {
      toast("Name, monthly payment, and total months are required.", "error");
      return;
    }
    const payload = {
      ...form,
      monthlyPayment: Number(form.monthlyPayment),
      totalMonths: Number(form.totalMonths),
      paidMonths: Number(form.paidMonths) || 0,
      interestRate: Number(form.interestRate) || 0,
      dueDay: Number(form.dueDay) || 1
    };
    if (editing) {
      actions.updateDebt(debt.id, payload);
      toast("Debt updated.", "success");
    } else {
      actions.addDebt(payload);
      toast("Debt added.", "success");
    }
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: editing ? "Edit debt" : "Add debt",
    width: 520,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: save,
      disabled: !valid
    }, editing ? "Save changes" : "Add debt"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Debt name / what it's for",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    value: form.name,
    onChange: v => set("name", v),
    placeholder: "e.g. Motorcycle loan \xB7 Cash Loan 450759",
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Monthly payment (\u20B1)",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    value: form.monthlyPayment,
    onChange: v => set("monthlyPayment", v),
    placeholder: "0.00"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Due day of month"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    min: "1",
    max: "31",
    value: form.dueDay,
    onChange: v => set("dueDay", v)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Total months",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    min: "1",
    value: form.totalMonths,
    onChange: v => set("totalMonths", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Months already paid"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    min: "0",
    max: form.totalMonths,
    value: form.paidMonths,
    onChange: v => set("paidMonths", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Interest rate (% / mo)",
    hint: "Optional \u2014 used by payoff calc"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: form.interestRate,
    onChange: v => set("interestRate", v),
    placeholder: "0"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Note"
  }, /*#__PURE__*/React.createElement(Textarea, {
    value: form.note,
    onChange: v => set("note", v),
    placeholder: "Account number, reason, etc."
  })), editing && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      background: "var(--panel-alt)",
      border: "1px dashed var(--border)",
      fontSize: 11,
      color: "var(--muted)",
      lineHeight: 1.5,
      borderRadius: "var(--radius)"
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--text)"
    }
  }, "To record a payment"), " \u2014 go to Transactions, log an expense, and link it to this debt. Your ", /*#__PURE__*/React.createElement("em", null, "months paid"), " counter will increment automatically.")));
}

// ---------------------------------------------------------------------------
// CreditForm — add/edit a credit account
// ---------------------------------------------------------------------------
function CreditForm({
  open,
  onClose,
  credit
}) {
  const {
    actions
  } = useStore();
  const toast = useToast();
  const editing = !!credit;
  const [form, setForm] = useState(credit || {
    name: "",
    limit: "",
    balance: 0,
    dueDay: 1,
    minPayment: "",
    note: ""
  });
  useEffect(() => {
    if (open) setForm(credit || {
      name: "",
      limit: "",
      balance: 0,
      dueDay: 1,
      minPayment: "",
      note: ""
    });
  }, [open, credit?.id]);
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const valid = form.name && +form.limit > 0;
  const save = () => {
    if (!valid) {
      toast("Name and limit are required.", "error");
      return;
    }
    const payload = {
      ...form,
      limit: Number(form.limit),
      balance: Number(form.balance) || 0,
      minPayment: Number(form.minPayment) || null,
      dueDay: Number(form.dueDay) || 1
    };
    if (editing) {
      actions.updateCredit(credit.id, payload);
      toast("Credit account updated.", "success");
    } else {
      actions.addCredit(payload);
      toast("Credit account added.", "success");
    }
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: editing ? "Edit credit account" : "Add credit account",
    width: 520,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: save,
      disabled: !valid
    }, editing ? "Save changes" : "Add credit"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Account name",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    value: form.name,
    onChange: v => set("name", v),
    placeholder: "e.g. G-Credit 117, HC 178",
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Credit limit (\u20B1)",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: form.limit,
    onChange: v => set("limit", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Current balance (\u20B1)",
    hint: "What you currently owe"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: form.balance,
    onChange: v => set("balance", v)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Cycle close day"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    min: "1",
    max: "31",
    value: form.dueDay,
    onChange: v => set("dueDay", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Minimum payment (\u20B1)"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: form.minPayment,
    onChange: v => set("minPayment", v),
    placeholder: "optional"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Note"
  }, /*#__PURE__*/React.createElement(Textarea, {
    value: form.note,
    onChange: v => set("note", v),
    placeholder: "Anything to remember"
  }))));
}

// ============================================================================
// DEBT SCREEN
// ============================================================================
function DebtScreen() {
  const {
    state,
    computed,
    actions
  } = useStore();
  const toast = useToast();
  const [editDebt, setEditDebt] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [strategy, setStrategy] = useState("avalanche");
  const active = state.debts.filter(d => d.status === "active");
  const sorted = [...active].sort((a, b) => {
    if (strategy === "avalanche") {
      const ar = a.interestRate || 0;
      const br = b.interestRate || 0;
      if (ar !== br) return br - ar;
      return b.monthlyPayment - a.monthlyPayment; // tie-break highest payment
    }
    if (strategy === "snowball") {
      return remainingFor(a) - remainingFor(b);
    }
    return a.dueDay - b.dueDay;
  });
  function remainingFor(d) {
    return (d.monthlyPayment || 0) * Math.max(0, (d.totalMonths || 0) - (d.paidMonths || 0));
  }

  // ---- Payoff calculator ----
  const [extra, setExtra] = useState(0);
  const monthlyBase = computed.monthlyDebtObligation;
  const totalRem = computed.remainingPrincipal;
  const baseMonths = monthlyBase ? Math.ceil(totalRem / monthlyBase) : 0;
  const accelMonths = monthlyBase + extra ? Math.ceil(totalRem / (monthlyBase + Number(extra))) : 0;
  const monthsSaved = baseMonths - accelMonths;
  const avgRate = active.length ? active.reduce((s, d) => s + (d.interestRate || 0), 0) / active.length : 0;
  const interestSaved = Math.round(extra * monthsSaved * (avgRate / 100));
  if (state.debts.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(Empty, {
      icon: ICONS.debt,
      title: "No debts tracked",
      body: "Add a debt to see payoff projections, snowball-vs-avalanche sorting, and a calculator that updates as you log payments.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        icon: ICONS.plus,
        onClick: () => setShowAdd(true)
      }, "Add your first debt"),
      padding: 80
    })), /*#__PURE__*/React.createElement(DebtForm, {
      open: showAdd,
      onClose: () => setShowAdd(false)
    }));
  }
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
    label: "Total principal (lifetime)",
    value: fmtMoney(computed.totalPrincipal),
    sub: `${state.debts.length} accounts`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Paid",
    value: fmtMoney(computed.paidPrincipal),
    color: "var(--up)",
    sub: fmtPct(computed.debtPaidPct, 1) + " of total"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Remaining",
    value: fmtMoney(computed.remainingPrincipal),
    color: "var(--down)",
    sub: `${active.length} active`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Monthly obligation",
    value: fmtMoney(computed.monthlyDebtObligation),
    sub: computed.monthIncome ? fmtPct(computed.monthlyDebtObligation / computed.monthIncome, 1) + " of income" : "—"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Debt-free in",
    value: baseMonths ? baseMonths + " mo" : "—",
    sub: baseMonths ? "at current pace" : "no active debts"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: `Debts · sorted by ${strategy}`,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 1,
        background: "var(--border)",
        padding: 1,
        borderRadius: "var(--radius)"
      }
    }, ["avalanche", "snowball", "due"].map(s => /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: () => setStrategy(s),
      style: {
        all: "unset",
        cursor: "pointer",
        padding: "3px 8px",
        fontSize: 10,
        background: strategy === s ? "var(--panel)" : "transparent",
        color: strategy === s ? "var(--text)" : "var(--muted)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em"
      }
    }, s))), /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.plus,
      variant: "primary",
      onClick: () => setShowAdd(true)
    }, "Add debt"))
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 11.5
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      fontSize: 9,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--faint)",
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 12px"
    })
  }, "Debt"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 12px",
      align: "right"
    })
  }, "Due"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 12px",
      align: "right"
    })
  }, "Monthly"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 12px",
      align: "right"
    })
  }, "Interest"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 12px",
      align: "right"
    })
  }, "Remaining"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 12px",
      width: 120
    })
  }, "Progress"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 12px",
      align: "right"
    })
  }))), /*#__PURE__*/React.createElement("tbody", null, sorted.map(d => {
    const pct = d.totalMonths ? d.paidMonths / d.totalMonths : 0;
    const remaining = remainingFor(d);
    return /*#__PURE__*/React.createElement("tr", {
      key: d.id,
      style: {
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 12px",
        weight: 600
      })
    }, d.name, d.note && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "var(--faint)",
        fontWeight: 400,
        marginTop: 2
      }
    }, d.note)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 12px",
        align: "right",
        mono: true,
        color: "var(--muted)"
      })
    }, ordinal(d.dueDay)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 12px",
        align: "right",
        mono: true,
        weight: 600
      })
    }, fmtMoney(d.monthlyPayment)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 12px",
        align: "right",
        mono: true,
        color: "var(--muted)"
      })
    }, d.interestRate ? d.interestRate + "%" : "—"), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 12px",
        align: "right",
        mono: true,
        weight: 600
      })
    }, fmtMoney(remaining)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 12px"
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 3
      }
    }, /*#__PURE__*/React.createElement(ProgressBar, {
      value: d.paidMonths,
      max: d.totalMonths,
      color: "var(--accent)",
      height: 4
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9.5,
        color: "var(--faint)",
        fontFamily: "var(--font-mono)"
      }
    }, d.paidMonths, "/", d.totalMonths, " \xB7 ", fmtPct(pct, 0)))), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 12px",
        align: "right"
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.edit,
      onClick: () => setEditDebt(d),
      title: "Edit"
    }), /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.trash,
      onClick: () => setConfirmDel(d),
      title: "Delete",
      danger: true
    }))));
  }), state.debts.filter(d => d.status === "done").map(d => /*#__PURE__*/React.createElement("tr", {
    key: d.id,
    style: {
      borderTop: "1px solid var(--border)",
      opacity: 0.55
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 12px",
      weight: 500
    })
  }, d.name, " ", /*#__PURE__*/React.createElement(Chip, {
    tone: "up"
  }, "paid off")), /*#__PURE__*/React.createElement("td", {
    colSpan: 4,
    style: cellStyle({
      pad: "10px 12px",
      color: "var(--muted)"
    })
  }, "Completed \xB7 ", d.totalMonths, " payments"), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 12px"
    })
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: 1,
    max: 1,
    color: "var(--up)",
    height: 4
  })), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 12px",
      align: "right"
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement(IconBtn, {
    icon: ICONS.edit,
    onClick: () => setEditDebt(d),
    title: "Edit"
  }), /*#__PURE__*/React.createElement(IconBtn, {
    icon: ICONS.trash,
    onClick: () => setConfirmDel(d),
    title: "Delete",
    danger: true
  })))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Payoff calculator"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: 600,
      marginBottom: 4
    }
  }, "Extra monthly payment"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 26,
      fontWeight: 600,
      color: "var(--accent)"
    }
  }, "+", fmtMoney(Number(extra))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)"
    }
  }, "/mo")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "20000",
    step: "100",
    value: extra,
    onChange: e => setExtra(parseInt(e.target.value)),
    style: {
      width: "100%",
      marginTop: 6,
      accentColor: "var(--accent)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 9,
      color: "var(--faint)",
      fontFamily: "var(--font-mono)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u20B10"), /*#__PURE__*/React.createElement("span", null, "\u20B120,000"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      background: "var(--panel-alt)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      color: "var(--muted)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: 600
    }
  }, "Current pace"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 18,
      fontWeight: 600
    }
  }, baseMonths, " mo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)"
    }
  }, futureMonth(baseMonths))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      background: "var(--accent-soft)",
      border: "1px solid color-mix(in oklch, var(--accent), transparent 60%)",
      borderRadius: "var(--radius)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      color: "var(--accent)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: 600
    }
  }, "With extra"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 18,
      fontWeight: 600,
      color: "var(--accent)"
    }
  }, accelMonths, " mo"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--accent)",
      fontFamily: "var(--font-mono)"
    }
  }, futureMonth(accelMonths)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      border: "1px dashed var(--border)",
      fontSize: 11,
      lineHeight: 1.5,
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text)"
    }
  }, "Months saved"), /*#__PURE__*/React.createElement(Num, {
    color: monthsSaved > 0 ? "var(--up)" : "var(--muted)",
    weight: 700
  }, monthsSaved > 0 ? "−" + monthsSaved + " mo" : "0 mo")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)"
    }
  }, "Interest avoided (est.)"), /*#__PURE__*/React.createElement(Num, {
    color: interestSaved > 0 ? "var(--up)" : "var(--muted)"
  }, fmtMoney(interestSaved))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--faint)",
      marginTop: 4
    }
  }, "Math: remaining principal \xF7 (monthly + extra). Interest est. assumes flat avg of debt rates (", avgRate.toFixed(2), "%/mo).")))), /*#__PURE__*/React.createElement(Panel, {
    title: "Strategy"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      fontSize: 12,
      lineHeight: 1.6
    }
  }, strategy === "avalanche" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--accent)"
    }
  }, "Avalanche"), " \u2014 pay highest-interest debt first. Mathematically saves the most money. Sorted in the table by interest rate (descending)."), strategy === "snowball" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--accent)"
    }
  }, "Snowball"), " \u2014 pay smallest-balance debt first. Builds momentum with quick wins. Sorted by remaining balance (ascending)."), strategy === "due" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: "var(--accent)"
    }
  }, "By due date"), " \u2014 pay what's due soonest. Useful for cash-flow timing."))))), /*#__PURE__*/React.createElement(DebtForm, {
    open: showAdd || !!editDebt,
    onClose: () => {
      setShowAdd(false);
      setEditDebt(null);
    },
    debt: editDebt
  }), /*#__PURE__*/React.createElement(ConfirmDialog, {
    open: !!confirmDel,
    onClose: () => setConfirmDel(null),
    title: "Delete debt?",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "This will remove ", /*#__PURE__*/React.createElement("strong", null, confirmDel?.name), " and unlink any payments tied to it. Existing transactions stay in your ledger."),
    confirmLabel: "Delete debt",
    danger: true,
    onConfirm: () => {
      actions.deleteDebt(confirmDel.id);
      toast("Debt deleted.", "success");
    }
  }));
}

// ============================================================================
// CREDIT SCREEN
// ============================================================================
function CreditScreen() {
  const {
    state,
    computed,
    actions
  } = useStore();
  const toast = useToast();
  const [editCred, setEditCred] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [payCred, setPayCred] = useState(null); // for "Record payment" flow

  if (state.creditAccounts.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(Empty, {
      icon: ICONS.credit,
      title: "No credit accounts yet",
      body: "Add a credit line to track utilization, billing cycles, and pay-down recommendations.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        icon: ICONS.plus,
        onClick: () => setShowAdd(true)
      }, "Add credit account"),
      padding: 80
    })), /*#__PURE__*/React.createElement(CreditForm, {
      open: showAdd,
      onClose: () => setShowAdd(false)
    }));
  }
  const tone = computed.creditUtilization >= 0.5 ? "var(--down)" : computed.creditUtilization >= 0.3 ? "var(--warn)" : "var(--up)";
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
    label: "Total limit",
    value: fmtMoney(computed.totalCreditLimit),
    sub: `${state.creditAccounts.length} accounts`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Used",
    value: fmtMoney(computed.totalCreditUsed),
    color: tone,
    sub: fmtPct(computed.creditUtilization, 1) + " utilization"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Available headroom",
    value: fmtMoney(computed.totalCreditLimit - computed.totalCreditUsed),
    sub: "pre-approved spend",
    color: "var(--up)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Health",
    value: computed.creditUtilization < 0.3 ? "Healthy" : computed.creditUtilization < 0.5 ? "Watch" : "At risk",
    color: tone,
    sub: "30% threshold"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Pay-down to 30%",
    value: fmtMoney(Math.max(0, computed.totalCreditUsed - computed.totalCreditLimit * 0.3)),
    sub: "suggested",
    color: "var(--accent)"
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: "Credit accounts",
    action: /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.plus,
      variant: "primary",
      onClick: () => setShowAdd(true)
    }, "Add account")
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
  }, "Account"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "Limit"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "Balance"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      width: 220
    })
  }, "Utilization"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "Cycle close"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "Min pay"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "Pay to 30%"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }))), /*#__PURE__*/React.createElement("tbody", null, state.creditAccounts.map(c => {
    const u = c.limit ? c.balance / c.limit : 0;
    const t2 = u >= 0.5 ? "var(--down)" : u >= 0.3 ? "var(--warn)" : "var(--up)";
    const payTo30 = Math.max(0, c.balance - c.limit * 0.3);
    return /*#__PURE__*/React.createElement("tr", {
      key: c.id,
      style: {
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        weight: 600
      })
    }, c.name), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        align: "right",
        mono: true
      })
    }, fmtMoney(c.limit)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        align: "right",
        mono: true,
        weight: 600
      })
    }, fmtMoney(c.balance)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px"
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(ProgressBar, {
      value: c.balance,
      max: Math.max(c.limit, 1),
      color: t2,
      height: 6
    })), /*#__PURE__*/React.createElement(Num, {
      color: t2,
      weight: 700,
      size: 11
    }, fmtPct(u, 0)))), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        align: "right",
        mono: true,
        color: "var(--muted)"
      })
    }, ordinal(c.dueDay)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        align: "right",
        mono: true
      })
    }, c.minPayment ? fmtMoney(c.minPayment) : "—"), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        align: "right",
        mono: true,
        color: payTo30 > 0 ? "var(--accent)" : "var(--muted)",
        weight: 600
      })
    }, payTo30 > 0 ? fmtMoney(Math.round(payTo30)) : "ok"), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        align: "right"
      })
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 4,
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => setPayCred(c)
    }, "Record payment"), /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.edit,
      onClick: () => setEditCred(c),
      title: "Edit"
    }), /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.trash,
      onClick: () => setConfirmDel(c),
      title: "Delete",
      danger: true
    }))));
  }), /*#__PURE__*/React.createElement("tr", {
    style: {
      borderTop: "1px solid var(--border-hi)",
      background: "var(--panel-alt)"
    }
  }, /*#__PURE__*/React.createElement("td", {
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
  }, fmtMoney(computed.totalCreditLimit)), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "12px 14px",
      align: "right",
      mono: true,
      weight: 700
    })
  }, fmtMoney(computed.totalCreditUsed)), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "12px 14px"
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: computed.totalCreditUsed,
    max: Math.max(computed.totalCreditLimit, 1),
    color: tone,
    height: 6
  })), /*#__PURE__*/React.createElement(Num, {
    color: tone,
    weight: 700,
    size: 11
  }, fmtPct(computed.creditUtilization, 1)))), /*#__PURE__*/React.createElement("td", {
    colSpan: 4
  }))))), /*#__PURE__*/React.createElement(CreditForm, {
    open: showAdd || !!editCred,
    onClose: () => {
      setShowAdd(false);
      setEditCred(null);
    },
    credit: editCred
  }), /*#__PURE__*/React.createElement(ConfirmDialog, {
    open: !!confirmDel,
    onClose: () => setConfirmDel(null),
    title: "Delete credit account?",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Remove ", /*#__PURE__*/React.createElement("strong", null, confirmDel?.name), "? Linked payments stay in your ledger but lose their reference."),
    confirmLabel: "Delete",
    danger: true,
    onConfirm: () => {
      actions.deleteCredit(confirmDel.id);
      toast("Credit account deleted.", "success");
    }
  }), /*#__PURE__*/React.createElement(CreditPaymentModal, {
    open: !!payCred,
    onClose: () => setPayCred(null),
    credit: payCred
  }));
}

// ---------------------------------------------------------------------------
// CreditPaymentModal — quick "record payment" flow that creates a tx + reduces balance
// ---------------------------------------------------------------------------
function CreditPaymentModal({
  open,
  onClose,
  credit
}) {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  const [amount, setAmount] = useState(credit?.minPayment || "");
  const [accountId, setAccountId] = useState(state.cashAccounts[0]?.id || "");
  const [date, setDate] = useState(todayISO());
  useEffect(() => {
    if (open) {
      setAmount(credit?.minPayment || "");
      setDate(todayISO());
      setAccountId(state.cashAccounts[0]?.id || "");
    }
  }, [open, credit?.id]);
  if (!credit) return null;
  const valid = +amount > 0 && amount <= credit.balance;
  const save = () => {
    if (!valid) {
      toast("Amount must be greater than 0 and at most the current balance.", "error");
      return;
    }
    const debtCatId = state.categories.find(c => c.id === "cat-debt")?.id || null;
    actions.addTransaction({
      date,
      amount: Number(amount),
      particular: `Payment · ${credit.name}`,
      kind: "expense",
      categoryId: debtCatId,
      accountId: accountId || null,
      creditId: credit.id,
      note: `Credit payment to ${credit.name}`
    });
    toast(`₱${Number(amount).toLocaleString()} paid to ${credit.name}.`, "success");
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: `Record payment · ${credit.name}`,
    width: 460,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: save,
      disabled: !valid
    }, "Record payment"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      background: "var(--panel-alt)",
      border: "1px solid var(--border)",
      fontSize: 12,
      borderRadius: "var(--radius)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--muted)"
    }
  }, "Current balance"), /*#__PURE__*/React.createElement(Num, {
    weight: 700,
    size: 20
  }, fmtMoney(credit.balance, {
    dec: 2
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8,
      fontSize: 11,
      color: "var(--muted)"
    }
  }, "of ", fmtMoney(credit.limit), " limit")), /*#__PURE__*/React.createElement(Field, {
    label: "Amount (\u20B1)",
    required: true,
    hint: `Max ${fmtMoney(credit.balance)} · paying reduces balance immediately`
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    max: credit.balance,
    value: amount,
    onChange: setAmount,
    autoFocus: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Date"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "date",
    value: date,
    onChange: setDate
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Paying from"
  }, state.cashAccounts.length ? /*#__PURE__*/React.createElement(Select, {
    value: accountId,
    onChange: setAccountId,
    options: [{
      value: "",
      label: "— None / cash —"
    }, ...state.cashAccounts.map(a => ({
      value: a.id,
      label: `${a.name} · ${fmtMoney(a.balance, {
        dec: 0
      })}`
    }))]
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      ...inputStyle,
      color: "var(--muted)",
      fontStyle: "italic"
    }
  }, "No cash accounts \xB7 payment won't deduct from any account"))));
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function ordinal(n) {
  if (n == null) return "—";
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function futureMonth(monthsAhead) {
  if (!monthsAhead) return "—";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d = new Date();
  const target = new Date(d.getFullYear(), d.getMonth() + monthsAhead);
  return `${months[target.getMonth()]} ${target.getFullYear()}`;
}
Object.assign(window, {
  DebtScreen,
  CreditScreen,
  DebtForm,
  CreditForm,
  CreditPaymentModal,
  ordinal,
  futureMonth
});