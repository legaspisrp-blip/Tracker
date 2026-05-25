// ============================================================================
// screens-analyze.jsx — Health & Loan, Forecast, Money Coach (all functional)
// ============================================================================

// ============================================================================
// HEALTH & LOAN SIMULATOR
// ============================================================================
function HealthScreen({
  setActive
}) {
  const {
    state,
    computed
  } = useStore();
  const H = computed.health;

  // Loan simulator state
  const [loan, setLoan] = useState({
    amount: "",
    months: 12,
    rate: 2.5,
    purpose: "Cushion"
  });
  const setL = (k, v) => setLoan(p => ({
    ...p,
    [k]: v
  }));

  // Simple amortization (monthly compounding)
  const monthly = useMemo(() => {
    const P = Number(loan.amount) || 0;
    const i = (Number(loan.rate) || 0) / 100;
    const n = Number(loan.months) || 1;
    if (!P || !i) return P / n;
    return P * i / (1 - Math.pow(1 + i, -n));
  }, [loan.amount, loan.months, loan.rate]);
  const totalRepayment = monthly * (Number(loan.months) || 0);
  const totalInterest = totalRepayment - (Number(loan.amount) || 0);
  const newDtiNumerator = computed.monthlyDebtObligation + monthly;
  const newDti = computed.monthIncome ? newDtiNumerator / computed.monthIncome : null;
  const currentDti = H?.dti ?? 0;
  const risk = !computed.monthIncome ? "unknown" : newDti > 0.45 ? "high" : newDti > 0.36 ? "medium" : "low";
  if (!H && computed.isEmpty) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(Empty, {
      icon: ICONS.health,
      title: "Health score needs data",
      body: "Log income and expenses for at least a few weeks. The score combines debt-to-income, savings rate, cash reserve, and credit utilization.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        icon: ICONS.plus,
        onClick: () => setActive("transactions")
      }, "Log a transaction"),
      padding: 70
    })));
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
      gridTemplateColumns: "1fr 1.4fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      alignItems: "center",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      fontWeight: 700
    }
  }, "Financial health"), H ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DonutMini, {
    value: H.composite,
    max: 100,
    size: 180,
    stroke: 12,
    color: "var(--accent)",
    trackColor: "var(--border)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 54,
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: "var(--tracking)"
    }
  }, H.composite), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)",
      textTransform: "uppercase",
      letterSpacing: "0.1em"
    }
  }, "/ 100"))), /*#__PURE__*/React.createElement(Chip, {
    tone: H.composite >= 75 ? "up" : H.composite >= 55 ? "accent" : "warn"
  }, H.rating), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      lineHeight: 1.5,
      color: "var(--muted)",
      maxWidth: 340
    }
  }, "Combines DTI (", fmtPct(H.dti, 1), "), savings rate (", H.savingsRate != null ? fmtPct(H.savingsRate, 1) : "—", "), cash reserve (", H.reserveMonths.toFixed(1), " mo), and credit utilization (", fmtPct(H.creditUtilization, 0), ").")) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--muted)"
    }
  }, "Add some data to see your score."))), /*#__PURE__*/React.createElement(Panel, {
    title: "Loan eligibility simulator"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--muted)",
      lineHeight: 1.5
    }
  }, "Enter a hypothetical loan. We compute monthly amortization, projected DTI, and risk."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Loan amount (\u20B1)",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "100",
    min: "0",
    value: loan.amount,
    onChange: v => setL("amount", v),
    placeholder: "60000"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Term (months)"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    min: "1",
    max: "120",
    value: loan.months,
    onChange: v => setL("months", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Interest (% / mo)"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.05",
    min: "0",
    value: loan.rate,
    onChange: v => setL("rate", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Purpose"
  }, /*#__PURE__*/React.createElement(Input, {
    value: loan.purpose,
    onChange: v => setL("purpose", v),
    placeholder: "Why?"
  }))), Number(loan.amount) > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(MiniBox, {
    label: "Monthly amortization",
    value: fmtMoney(Math.round(monthly)),
    accent: true
  }), /*#__PURE__*/React.createElement(MiniBox, {
    label: "Total repayment",
    value: fmtMoney(Math.round(totalRepayment))
  }), /*#__PURE__*/React.createElement(MiniBox, {
    label: "Total interest",
    value: fmtMoney(Math.round(totalInterest)),
    color: "var(--down)"
  }), /*#__PURE__*/React.createElement(MiniBox, {
    label: "Projected DTI",
    value: newDti != null ? fmtPct(newDti, 1) : "—",
    color: risk === "high" ? "var(--down)" : risk === "medium" ? "var(--warn)" : "var(--up)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      background: risk === "high" ? "color-mix(in oklch, var(--down), transparent 90%)" : risk === "medium" ? "color-mix(in oklch, var(--warn), transparent 90%)" : "var(--accent-soft)",
      border: `1px solid ${risk === "high" ? "var(--down)" : risk === "medium" ? "var(--warn)" : "var(--accent)"}`,
      borderRadius: "var(--radius)",
      display: "flex",
      gap: 12,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      background: risk === "high" ? "var(--down)" : risk === "medium" ? "var(--warn)" : "var(--accent)",
      color: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontSize: 14,
      borderRadius: "50%",
      flexShrink: 0
    }
  }, risk === "low" ? "✓" : "!"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: risk === "high" ? "var(--down)" : risk === "medium" ? "var(--warn)" : "var(--accent)",
      textTransform: "uppercase",
      letterSpacing: "0.06em"
    }
  }, "Risk \xB7 ", risk), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text)",
      marginTop: 4,
      lineHeight: 1.5
    }
  }, risk === "high" && /*#__PURE__*/React.createElement(React.Fragment, null, "Adds ", /*#__PURE__*/React.createElement(Num, {
    weight: 700
  }, fmtMoney(Math.round(monthly)), "/mo"), ". DTI rises ", currentDti ? `from ${fmtPct(currentDti, 1)}` : "", " to ", fmtPct(newDti, 1), " \u2014 well above the 36% safe ceiling. Reduce loan amount or extend the term."), risk === "medium" && /*#__PURE__*/React.createElement(React.Fragment, null, "DTI projects to ", fmtPct(newDti, 1), ", above the 36% safe ceiling. Manageable, but no margin for surprises."), risk === "low" && /*#__PURE__*/React.createElement(React.Fragment, null, "DTI stays at ", fmtPct(newDti, 1), " \u2014 under 36%. Likely safe based on income vs obligations."), risk === "unknown" && /*#__PURE__*/React.createElement(React.Fragment, null, "No income data \u2014 log income to evaluate."))))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      border: "1px dashed var(--border)",
      fontSize: 12,
      color: "var(--muted)",
      textAlign: "center",
      borderRadius: "var(--radius)"
    }
  }, "Enter a loan amount above to see the simulation.")))), H && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 12
    }
  }, [{
    k: "DTI",
    score: H.dtiScore,
    label: "Debt-to-income",
    detail: `${fmtPct(H.dti, 1)} ratio · target ≤ 36%`
  }, {
    k: "Savings",
    score: H.savingsScore,
    label: "Savings rate",
    detail: `${H.savingsRate != null ? fmtPct(H.savingsRate, 1) : "—"} this month · target ≥ 20%`
  }, {
    k: "Reserve",
    score: H.reserveScore,
    label: "Cash reserves",
    detail: `${H.reserveMonths.toFixed(1)} mo of burn covered · target ≥ 3 mo`
  }, {
    k: "Credit",
    score: H.utilScore,
    label: "Credit utilization",
    detail: `${fmtPct(H.creditUtilization, 0)} used · target ≤ 30%`
  }].map(s => {
    const tone = s.score >= 75 ? "var(--up)" : s.score >= 50 ? "var(--accent)" : s.score >= 30 ? "var(--warn)" : "var(--down)";
    return /*#__PURE__*/React.createElement(Panel, {
      key: s.k
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "var(--muted)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontWeight: 600
      }
    }, s.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-num)",
        fontSize: 30,
        fontWeight: 600,
        color: tone,
        letterSpacing: "var(--tracking)"
      }
    }, Math.round(s.score)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--muted)",
        fontFamily: "var(--font-mono)"
      }
    }, "/100")), /*#__PURE__*/React.createElement(ProgressBar, {
      value: s.score,
      max: 100,
      color: tone,
      height: 4
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--muted)",
        lineHeight: 1.4
      }
    }, s.detail)));
  })));
}
function MiniBox({
  label,
  value,
  accent,
  color
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      background: accent ? "var(--accent-soft)" : "var(--panel-alt)",
      border: `1px solid ${accent ? "color-mix(in oklch, var(--accent), transparent 60%)" : "var(--border)"}`,
      borderRadius: "var(--radius)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      color: accent ? "var(--accent)" : "var(--muted)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: 600
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: 16,
      fontWeight: 600,
      color: color || (accent ? "var(--accent)" : "var(--text)")
    }
  }, value));
}

// ============================================================================
// FORECAST
// ============================================================================
function ExpectedIncomeForm({
  open,
  onClose,
  item
}) {
  const {
    actions
  } = useStore();
  const toast = useToast();
  const editing = !!item;
  const [form, setForm] = useState(item || {
    source: "",
    amount: "",
    currency: "PHP",
    expectedDate: todayISO(),
    confidence: "high"
  });
  useEffect(() => {
    if (open) setForm(item || {
      source: "",
      amount: "",
      currency: "PHP",
      expectedDate: todayISO(),
      confidence: "high"
    });
  }, [open, item?.id]);
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const valid = form.source && +form.amount > 0 && form.expectedDate;
  const save = () => {
    if (!valid) {
      toast("Source, amount, date required.", "error");
      return;
    }
    const payload = {
      ...form,
      amount: Number(form.amount)
    };
    if (editing) actions.updateExpected(item.id, payload);else actions.addExpected(payload);
    toast(editing ? "Updated." : "Expected income added.", "success");
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: editing ? "Edit expected income" : "Add expected income",
    width: 460,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: save,
      disabled: !valid
    }, editing ? "Save" : "Add"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Source",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    value: form.source,
    onChange: v => set("source", v),
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Amount",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: form.amount,
    onChange: v => set("amount", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Currency"
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.currency,
    onChange: v => set("currency", v),
    options: [{
      value: "PHP",
      label: "PHP (₱)"
    }, {
      value: "USD",
      label: "USD ($)"
    }]
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Expected date",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "date",
    value: form.expectedDate,
    onChange: v => set("expectedDate", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Confidence"
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.confidence,
    onChange: v => set("confidence", v),
    options: [{
      value: "high",
      label: "High · committed"
    }, {
      value: "medium",
      label: "Medium"
    }, {
      value: "low",
      label: "Low · possible"
    }]
  }))));
}
function ForecastScreen() {
  const {
    state,
    computed,
    actions
  } = useStore();
  const toast = useToast();
  const [rate, setRate] = useState(state.settings.fxRate || 58.42);
  const [editItem, setEditItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  useEffect(() => {
    setRate(state.settings.fxRate || 58.42);
  }, [state.settings.fxRate]);
  const persistRate = v => {
    setRate(v);
    actions.setSetting("fxRate", v);
    actions.setSetting("fxRateUpdated", new Date().toISOString());
  };

  // Compute future cash trajectory using actual obligations + expected income
  function projectScenario(usdRate) {
    const points = [];
    let cash = computed.cashOnHand;
    const start = new Date();
    for (let day = 0; day <= 60; day++) {
      const d = new Date(start);
      d.setDate(d.getDate() + day);
      d.setHours(0, 0, 0, 0);
      const ds = d.toISOString().slice(0, 10);
      // expected income on this day
      for (const e of state.expectedIncome) {
        if (e.expectedDate === ds) {
          cash += e.currency === "USD" ? e.amount * usdRate : e.amount;
        }
      }
      // obligations on this day
      for (const u of computed.upcoming) {
        if (u.date === ds) cash -= u.amount;
      }
      points.push({
        day,
        date: ds,
        cash
      });
    }
    return points;
  }
  const safe = projectScenario(rate);
  const best = projectScenario(rate * 1.025);
  const risk = projectScenario(rate * 0.975);
  const minCash = Math.min(...safe.map(p => p.cash));
  const closeCash = safe[safe.length - 1]?.cash || 0;
  const totalExpectedUSD = state.expectedIncome.filter(e => e.currency === "USD").reduce((s, e) => s + e.amount, 0);
  const totalExpectedPHP = state.expectedIncome.filter(e => e.currency === "PHP").reduce((s, e) => s + e.amount, 0);
  const totalExpectedPHPConverted = totalExpectedPHP + totalExpectedUSD * rate;
  const totalObligations = computed.upcoming.reduce((s, u) => s + u.amount, 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Currency \xB7 USD \u2194 PHP"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
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
  }, "Current rate (editable)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    step: "0.01",
    min: "40",
    max: "80",
    value: rate,
    onChange: e => persistRate(parseFloat(e.target.value) || 0),
    style: {
      ...inputStyle,
      fontFamily: "var(--font-num)",
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: "var(--tracking)",
      padding: "2px 4px",
      border: "none",
      background: "transparent",
      width: 110
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)"
    }
  }, "PHP / USD")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "40",
    max: "80",
    step: "0.01",
    value: rate,
    onChange: e => persistRate(parseFloat(e.target.value)),
    style: {
      width: "100%",
      accentColor: "var(--accent)"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontWeight: 600
    }
  }, "Expected USD \xB7 ", state.expectedIncome.filter(e => e.currency === "USD").length, " items"), /*#__PURE__*/React.createElement(Num, {
    weight: 700,
    size: 20
  }, "$", totalExpectedUSD.toLocaleString()), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)",
      marginTop: 2
    }
  }, "Converts to ", /*#__PURE__*/React.createElement(Num, {
    weight: 700,
    color: "var(--up)"
  }, fmtMoney(totalExpectedUSD * rate)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontWeight: 600
    }
  }, "Total expected PHP value"), /*#__PURE__*/React.createElement(Num, {
    weight: 700,
    size: 20
  }, fmtMoney(totalExpectedPHPConverted)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)",
      marginTop: 2
    }
  }, "Over next 60 days")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: "var(--muted)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontWeight: 600
    }
  }, "FX sensitivity"), /*#__PURE__*/React.createElement(Num, {
    weight: 700,
    size: 20
  }, "\xB1", fmtMoney(totalExpectedUSD)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)",
      marginTop: 2
    }
  }, "per \u20B11 FX swing")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 12
    }
  }, [{
    id: "best",
    label: "Best case",
    sub: "PHP weakens · +2.5%",
    points: best,
    tone: "var(--up)"
  }, {
    id: "safe",
    label: "Current",
    sub: "Spot rate above",
    points: safe,
    tone: "var(--accent)"
  }, {
    id: "risk",
    label: "Risk case",
    sub: "PHP strengthens · −2.5%",
    points: risk,
    tone: "var(--down)"
  }].map(s => {
    const close = s.points[s.points.length - 1]?.cash || 0;
    const min = Math.min(...s.points.map(p => p.cash));
    return /*#__PURE__*/React.createElement(Panel, {
      key: s.id
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 16,
        color: s.tone
      }
    }, s.label), /*#__PURE__*/React.createElement(Chip, {
      tone: s.tone === "var(--up)" ? "up" : s.tone === "var(--down)" ? "down" : "accent"
    }, s.sub)), /*#__PURE__*/React.createElement(MiniBox, {
      label: "Cash at day 60",
      value: fmtMoney(close),
      accent: s.id === "safe",
      color: close < 0 ? "var(--down)" : undefined
    }), /*#__PURE__*/React.createElement(MiniBox, {
      label: "Lowest point",
      value: fmtMoney(min),
      color: min < 0 ? "var(--down)" : "var(--text)"
    })));
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Cash trajectory \xB7 next 60 days"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(AreaChart, {
    data: safe.map((p, i) => ({
      x: i % 5 === 0 ? p.date.slice(5) : "",
      risk: risk[i]?.cash,
      safe: p.cash,
      best: best[i]?.cash
    })),
    width: 1140,
    height: 240,
    lines: [{
      key: "risk",
      color: "var(--down)",
      width: 1.2
    }, {
      key: "best",
      color: "var(--up)",
      width: 1.2
    }, {
      key: "safe",
      color: "var(--accent)",
      fill: 0.10,
      width: 1.8
    }]
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: "Expected income \xB7 next 60 days",
    action: /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.plus,
      variant: "primary",
      onClick: () => setShowAdd(true)
    }, "Add expected income")
  }, state.expectedIncome.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: ICONS.income,
    title: "No expected income",
    body: "Add upcoming payments (especially USD ones \u2014 they auto-convert at the rate above) to power the forecast.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: ICONS.plus,
      onClick: () => setShowAdd(true)
    }, "Add"),
    padding: 40
  }) : /*#__PURE__*/React.createElement("table", {
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
  }, "Source"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "Amount"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "PHP value"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px"
    })
  }, "Confidence"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }))), /*#__PURE__*/React.createElement("tbody", null, state.expectedIncome.sort((a, b) => a.expectedDate.localeCompare(b.expectedDate)).map(e => /*#__PURE__*/React.createElement("tr", {
    key: e.id,
    style: {
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      mono: true,
      color: "var(--muted)"
    })
  }, fmtDate(e.expectedDate)), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      weight: 600
    })
  }, e.source), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      align: "right",
      mono: true,
      weight: 600
    })
  }, e.currency === "USD" ? `$${e.amount.toLocaleString()}` : fmtMoney(e.amount)), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      align: "right",
      mono: true,
      color: "var(--up)",
      weight: 600
    })
  }, fmtMoney(e.currency === "USD" ? e.amount * rate : e.amount)), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px"
    })
  }, /*#__PURE__*/React.createElement(Chip, {
    tone: e.confidence === "high" ? "up" : e.confidence === "medium" ? "accent" : "muted"
  }, e.confidence)), /*#__PURE__*/React.createElement("td", {
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
  }, /*#__PURE__*/React.createElement(IconBtn, {
    icon: ICONS.edit,
    onClick: () => setEditItem(e)
  }), /*#__PURE__*/React.createElement(IconBtn, {
    icon: ICONS.trash,
    onClick: () => {
      actions.deleteExpected(e.id);
      toast("Removed.", "success");
    },
    danger: true
  })))))))), /*#__PURE__*/React.createElement(Panel, {
    title: `Upcoming obligations · next 30 days · ${computed.upcoming.length}`
  }, computed.upcoming.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    title: "Nothing upcoming",
    body: "No active debts or recurring bills in the next 30 days.",
    padding: 30
  }) : /*#__PURE__*/React.createElement("table", {
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
  }, "Bill"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px"
    })
  }, "Kind"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "Amount"))), /*#__PURE__*/React.createElement("tbody", null, computed.upcoming.slice(0, 20).map(u => /*#__PURE__*/React.createElement("tr", {
    key: u.id,
    style: {
      borderTop: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      mono: true,
      color: "var(--muted)"
    })
  }, fmtDate(u.date)), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      weight: 600
    })
  }, u.label), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px"
    })
  }, /*#__PURE__*/React.createElement(Chip, null, u.kind)), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      align: "right",
      mono: true,
      weight: 600
    })
  }, fmtMoney(u.amount))))))), /*#__PURE__*/React.createElement(ExpectedIncomeForm, {
    open: showAdd || !!editItem,
    onClose: () => {
      setShowAdd(false);
      setEditItem(null);
    },
    item: editItem
  }));
}

// ============================================================================
// MONEY COACH — real rule-based analysis of state
// ============================================================================
function MoneyCoachScreen() {
  const {
    state,
    computed
  } = useStore();
  const insights = useMemo(() => generateInsights(state, computed), [state, computed]);
  if (computed.isEmpty) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(Empty, {
      icon: ICONS.sparkle,
      title: "Coach needs data",
      body: "Log a few transactions, add a debt or two, and the coach will start surfacing real, specific advice based on your numbers.",
      padding: 80
    })));
  }
  const byKind = {
    warn: [],
    suggest: [],
    praise: []
  };
  for (const i of insights) byKind[i.kind].push(i);
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
      gridTemplateColumns: "repeat(3, 1fr)",
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
    label: "Warnings",
    value: byKind.warn.length,
    sub: "things to fix",
    color: "var(--down)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Suggestions",
    value: byKind.suggest.length,
    sub: "things to consider",
    color: "var(--accent)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Wins",
    value: byKind.praise.length,
    sub: "things going well",
    color: "var(--up)"
  }))), [{
    id: "warn",
    title: "Watch list · act on these",
    tone: "var(--down)",
    items: byKind.warn
  }, {
    id: "suggest",
    title: "Recommendations",
    tone: "var(--accent)",
    items: byKind.suggest
  }, {
    id: "praise",
    title: "Things going well",
    tone: "var(--up)",
    items: byKind.praise
  }].map(sec => /*#__PURE__*/React.createElement(Panel, {
    key: sec.id,
    title: sec.title
  }, sec.items.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 20,
      fontSize: 12,
      color: "var(--muted)",
      textAlign: "center"
    }
  }, "Nothing here.") : /*#__PURE__*/React.createElement("div", null, sec.items.map((i, idx) => /*#__PURE__*/React.createElement("div", {
    key: idx,
    style: {
      padding: "12px 16px",
      borderTop: idx ? "1px solid var(--border)" : "none",
      display: "grid",
      gridTemplateColumns: "24px 1fr auto",
      gap: 12,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      background: `color-mix(in oklch, ${sec.tone}, transparent 80%)`,
      color: sec.tone,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-num)",
      fontWeight: 700,
      fontSize: 12,
      borderRadius: "var(--radius)"
    }
  }, sec.id === "warn" ? "!" : sec.id === "suggest" ? "→" : "✓"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, i.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--muted)",
      marginTop: 3,
      lineHeight: 1.5
    }
  }, i.body)), i.value && /*#__PURE__*/React.createElement(Num, {
    weight: 700,
    color: sec.tone
  }, i.value)))))));
}

// Generate real, data-driven insights
function generateInsights(state, computed) {
  const out = [];
  const H = computed.health;

  // DTI warning
  if (H && H.dti > 0.36) {
    out.push({
      kind: "warn",
      title: "Debt-to-income above safe ceiling",
      body: `Your monthly debt obligation is ${fmtPct(H.dti, 1)} of average income. Banks consider 36% the safe limit. Avoid taking on new debt and aim to close a debt account.`,
      value: fmtPct(H.dti, 1)
    });
  } else if (H && computed.monthIncome) {
    out.push({
      kind: "praise",
      title: "DTI under control",
      body: `Monthly obligations are ${fmtPct(H.dti, 1)} of income — well within the safe 36% range.`,
      value: fmtPct(H.dti, 1)
    });
  }

  // Credit utilization
  if (computed.creditUtilization > 0.5) {
    out.push({
      kind: "warn",
      title: "Credit utilization is high",
      body: `You're using ${fmtPct(computed.creditUtilization, 1)} of available credit. Above 50% damages your credit score. Suggest paying down by ${fmtMoney(Math.round(computed.totalCreditUsed - computed.totalCreditLimit * 0.3))} to reach 30%.`,
      value: fmtPct(computed.creditUtilization, 0)
    });
  } else if (computed.creditUtilization > 0.3) {
    out.push({
      kind: "suggest",
      title: "Trim credit utilization",
      body: `You're at ${fmtPct(computed.creditUtilization, 1)}. Banks see 30% as the threshold for a healthy score. Pay down ${fmtMoney(Math.round(Math.max(0, computed.totalCreditUsed - computed.totalCreditLimit * 0.3)))} to be safely below.`,
      value: fmtPct(computed.creditUtilization, 0)
    });
  } else if (computed.totalCreditLimit > 0) {
    out.push({
      kind: "praise",
      title: "Credit utilization healthy",
      body: `At ${fmtPct(computed.creditUtilization, 0)} — well below the 30% threshold.`,
      value: fmtPct(computed.creditUtilization, 0)
    });
  }

  // Savings rate
  if (H && computed.monthIncome) {
    if ((H.savingsRate ?? 0) < 0) {
      out.push({
        kind: "warn",
        title: "Spending more than you earn this month",
        body: `Net is ${fmtMoney(computed.net)}. Identify a category to cut this week.`,
        value: fmtPct(H.savingsRate || 0, 0)
      });
    } else if ((H.savingsRate ?? 0) < 0.1) {
      out.push({
        kind: "suggest",
        title: "Savings rate is thin",
        body: `Saving ${fmtPct(H.savingsRate, 1)} this month. Aim for ≥ 20% — set aside a fixed amount on the 1st before spending.`
      });
    } else if ((H.savingsRate ?? 0) >= 0.2) {
      out.push({
        kind: "praise",
        title: "Strong savings rate",
        body: `Saving ${fmtPct(H.savingsRate, 1)} this month. You can safely allocate part of that to your emergency goal.`,
        value: fmtPct(H.savingsRate, 1)
      });
    }
  }

  // Cash reserve
  if (H && H.reserveMonths < 1) {
    out.push({
      kind: "warn",
      title: "Cash reserve below 1 month of expenses",
      body: `${H.reserveMonths.toFixed(1)} mo of burn covered. Build to at least 3 mo. Pause subscriptions if needed.`
    });
  } else if (H && H.reserveMonths < 3) {
    out.push({
      kind: "suggest",
      title: "Build cash reserve",
      body: `${H.reserveMonths.toFixed(1)} months covered. Target: 3 months of fixed obligations.`
    });
  } else if (H && H.reserveMonths >= 3) {
    out.push({
      kind: "praise",
      title: "Healthy cash cushion",
      body: `${H.reserveMonths.toFixed(1)} months of expenses in cash. Solid.`
    });
  }

  // Budget overruns
  for (const b of computed.budgetStats) {
    if (b.spent > b.cap) {
      out.push({
        kind: "warn",
        title: `Over budget · ${b.category?.name || "category"}`,
        body: `Spent ${fmtMoney(b.spent)} this month — ${fmtMoney(b.spent - b.cap)} over your ${fmtMoney(b.cap)} cap.`,
        value: "+" + fmtMoney(b.spent - b.cap)
      });
    }
  }

  // Category share — heaviest single category warning
  if (computed.byCategory.length > 0 && computed.monthExpense) {
    const top = computed.byCategory[0];
    if (top.amount / computed.monthExpense > 0.45) {
      out.push({
        kind: "suggest",
        title: `${top.category?.name || "One category"} dominates spend`,
        body: `${fmtPct(top.amount / computed.monthExpense, 0)} of this month went to ${top.category?.name || "that category"}. Worth auditing — anything to cut?`
      });
    }
  }

  // Frequent subscriptions check
  const subRules = state.recurring.filter(r => r.categoryId === "cat-subscription");
  if (subRules.length >= 4) {
    out.push({
      kind: "suggest",
      title: `You have ${subRules.length} active subscriptions`,
      body: `Combined ₱${subRules.reduce((s, r) => s + r.amount, 0).toLocaleString()}/mo. Worth auditing every quarter — anything you stopped using?`
    });
  }

  // Active debts close to done — encouragement
  const nearDone = state.debts.filter(d => d.status === "active" && d.totalMonths > 0 && d.totalMonths - d.paidMonths <= 3 && d.totalMonths - d.paidMonths > 0);
  if (nearDone.length) {
    out.push({
      kind: "praise",
      title: `${nearDone.length} debt${nearDone.length > 1 ? "s" : ""} close to done`,
      body: `${nearDone.map(d => d.name).join(", ")} — within 3 payments. Consider pre-paying to free up ${fmtMoney(nearDone.reduce((s, d) => s + d.monthlyPayment, 0))}/mo sooner.`
    });
  }
  return out;
}
Object.assign(window, {
  HealthScreen,
  ForecastScreen,
  MoneyCoachScreen,
  ExpectedIncomeForm,
  MiniBox,
  generateInsights
});