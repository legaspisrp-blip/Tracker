// ============================================================================
// screens-plan.jsx — Budgets, Goals, Recurring (subscriptions / bills)
// ============================================================================

// ---------------------------------------------------------------------------
// BUDGETS
// ---------------------------------------------------------------------------
function BudgetForm({
  open,
  onClose,
  budget
}) {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  const editing = !!budget;
  const expCats = state.categories.filter(c => c.kind === "expense");
  const usedIds = new Set(state.budgets.map(b => b.categoryId));
  const availableCats = editing ? expCats : expCats.filter(c => !usedIds.has(c.id));
  const [form, setForm] = useState(budget || {
    categoryId: availableCats[0]?.id || "",
    monthlyCap: "",
    note: ""
  });
  useEffect(() => {
    if (open) setForm(budget || {
      categoryId: availableCats[0]?.id || "",
      monthlyCap: "",
      note: ""
    });
  }, [open, budget?.id]);
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const valid = form.categoryId && +form.monthlyCap > 0;
  const save = () => {
    if (!valid) {
      toast("Pick a category and cap.", "error");
      return;
    }
    const payload = {
      ...form,
      monthlyCap: Number(form.monthlyCap)
    };
    if (editing) {
      actions.updateBudget(budget.id, payload);
      toast("Budget updated.", "success");
    } else {
      actions.addBudget(payload);
      toast("Budget added.", "success");
    }
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: editing ? "Edit budget" : "Add budget",
    width: 460,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: save,
      disabled: !valid
    }, editing ? "Save" : "Add budget"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Category",
    required: true
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.categoryId,
    onChange: v => set("categoryId", v),
    options: availableCats.map(c => ({
      value: c.id,
      label: c.name
    }))
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Monthly cap (\u20B1)",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: form.monthlyCap,
    onChange: v => set("monthlyCap", v),
    autoFocus: true
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Note"
  }, /*#__PURE__*/React.createElement(Textarea, {
    value: form.note,
    onChange: v => set("note", v),
    rows: 2
  }))));
}
function BudgetsScreen() {
  const {
    state,
    computed,
    actions
  } = useStore();
  const toast = useToast();
  const [editBud, setEditBud] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  if (state.budgets.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(Empty, {
      icon: ICONS.budgets,
      title: "No budgets yet",
      body: "Set a monthly cap per category. Pacing updates as you log expenses.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        icon: ICONS.plus,
        onClick: () => setShowAdd(true)
      }, "Add your first budget"),
      padding: 80
    })), /*#__PURE__*/React.createElement(BudgetForm, {
      open: showAdd,
      onClose: () => setShowAdd(false)
    }));
  }
  const totalCap = state.budgets.reduce((s, b) => s + b.monthlyCap, 0);
  const totalSpent = computed.budgetStats.reduce((s, b) => s + b.spent, 0);
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
    label: "Total budgeted",
    value: fmtMoney(totalCap),
    sub: `${state.budgets.length} categories`
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Total spent",
    value: fmtMoney(totalSpent),
    sub: fmtPct(totalSpent / Math.max(totalCap, 1), 0) + " of budget",
    color: totalSpent > totalCap ? "var(--down)" : "var(--text)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Remaining",
    value: fmtMoney(Math.max(0, totalCap - totalSpent)),
    color: "var(--accent)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Categories over",
    value: computed.budgetStats.filter(b => b.spent > b.cap).length,
    sub: "needs attention",
    color: "var(--down)"
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: `Category budgets · ${state.budgets.length}`,
    action: /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.plus,
      variant: "primary",
      onClick: () => setShowAdd(true)
    }, "Add budget")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 14
    }
  }, computed.budgetStats.map(b => {
    const pct = b.spent / b.cap;
    const tone = pct > 1 ? "var(--down)" : pct > 0.85 ? "var(--warn)" : "var(--accent)";
    const dailyAvg = computed.dayOfMonth ? b.spent / computed.dayOfMonth : 0;
    const projectedClose = Math.round(dailyAvg * computed.daysInMonth);
    return /*#__PURE__*/React.createElement("div", {
      key: b.id,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 10,
        background: b.category?.color || "var(--muted)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600
      }
    }, b.category?.name || "—"), /*#__PURE__*/React.createElement(Chip, {
      tone: pct > 1 ? "down" : pct > 0.85 ? "warn" : "up"
    }, fmtPct(pct, 0), " used"), b.note && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--muted)"
      }
    }, "\xB7 ", b.note)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Num, {
      weight: 600
    }, fmtMoney(b.spent)), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--muted)",
        fontSize: 11
      }
    }, "/ ", fmtMoney(b.cap)), /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.edit,
      onClick: () => setEditBud(b),
      title: "Edit"
    }), /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.trash,
      onClick: () => setConfirmDel(b),
      title: "Delete",
      danger: true
    }))), /*#__PURE__*/React.createElement(ProgressBar, {
      value: b.spent,
      max: b.cap,
      color: tone,
      height: 6
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 10.5,
        color: "var(--muted)",
        fontFamily: "var(--font-mono)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Remaining ", fmtMoney(Math.max(0, b.cap - b.spent))), /*#__PURE__*/React.createElement("span", null, computed.dayOfMonth ? `Projected close: ${fmtMoney(projectedClose)}` : "—")));
  }))), /*#__PURE__*/React.createElement(BudgetForm, {
    open: showAdd || !!editBud,
    onClose: () => {
      setShowAdd(false);
      setEditBud(null);
    },
    budget: editBud
  }), /*#__PURE__*/React.createElement(ConfirmDialog, {
    open: !!confirmDel,
    onClose: () => setConfirmDel(null),
    title: "Delete budget?",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Remove this budget? Transactions in ", /*#__PURE__*/React.createElement("strong", null, confirmDel?.category?.name), " stay logged."),
    confirmLabel: "Delete",
    danger: true,
    onConfirm: () => {
      actions.deleteBudget(confirmDel.id);
      toast("Budget deleted.", "success");
    }
  }));
}

// ---------------------------------------------------------------------------
// GOALS
// ---------------------------------------------------------------------------
function GoalForm({
  open,
  onClose,
  goal
}) {
  const {
    actions
  } = useStore();
  const toast = useToast();
  const editing = !!goal;
  const [form, setForm] = useState(goal || {
    name: "",
    target: "",
    saved: 0,
    deadline: "",
    note: ""
  });
  useEffect(() => {
    if (open) setForm(goal || {
      name: "",
      target: "",
      saved: 0,
      deadline: "",
      note: ""
    });
  }, [open, goal?.id]);
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const valid = form.name && +form.target > 0;
  const save = () => {
    if (!valid) {
      toast("Name and target are required.", "error");
      return;
    }
    const payload = {
      ...form,
      target: Number(form.target),
      saved: Number(form.saved) || 0
    };
    if (editing) {
      actions.updateGoal(goal.id, payload);
      toast("Goal updated.", "success");
    } else {
      actions.addGoal(payload);
      toast("Goal added.", "success");
    }
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: editing ? "Edit goal" : "Add savings goal",
    width: 460,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: save,
      disabled: !valid
    }, editing ? "Save" : "Add goal"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Goal name",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    value: form.name,
    onChange: v => set("name", v),
    placeholder: "e.g. Emergency fund \xB7 Laptop \xB7 Wedding",
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Target (\u20B1)",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: form.target,
    onChange: v => set("target", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Already saved (\u20B1)"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: form.saved,
    onChange: v => set("saved", v)
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Deadline (optional)"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "date",
    value: form.deadline,
    onChange: v => set("deadline", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Note"
  }, /*#__PURE__*/React.createElement(Textarea, {
    value: form.note,
    onChange: v => set("note", v),
    rows: 2
  }))));
}
function ContributeGoalModal({
  open,
  onClose,
  goal
}) {
  const {
    actions
  } = useStore();
  const toast = useToast();
  const [amount, setAmount] = useState("");
  useEffect(() => {
    if (open) setAmount("");
  }, [open]);
  if (!goal) return null;
  const save = () => {
    const n = Number(amount);
    if (!n || n <= 0) {
      toast("Enter an amount.", "error");
      return;
    }
    actions.contributeGoal(goal.id, n);
    toast(`Added ${fmtMoney(n)} to "${goal.name}".`, "success");
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: `Contribute · ${goal?.name}`,
    width: 420,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: save
    }, "Add contribution"))
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
  }, "Saved ", /*#__PURE__*/React.createElement(Num, {
    weight: 700
  }, fmtMoney(goal.saved || 0)), " of ", /*#__PURE__*/React.createElement(Num, {
    weight: 700
  }, fmtMoney(goal.target)), " \xB7 ", fmtPct((goal.saved || 0) / goal.target, 1)), /*#__PURE__*/React.createElement(Field, {
    label: "Amount to add (\u20B1)",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: amount,
    onChange: setAmount,
    autoFocus: true
  }))));
}
function GoalsScreen() {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  const [editGoal, setEditGoal] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [contribute, setContribute] = useState(null);
  if (state.goals.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(Empty, {
      icon: ICONS.goals,
      title: "No savings goals yet",
      body: "Track emergency fund, laptop fund, travel \u2014 anything you're saving toward.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        icon: ICONS.plus,
        onClick: () => setShowAdd(true)
      }, "Add your first goal"),
      padding: 80
    })), /*#__PURE__*/React.createElement(GoalForm, {
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
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Savings goals",
    action: /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.plus,
      variant: "primary",
      onClick: () => setShowAdd(true)
    }, "Add goal")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: 12
    }
  }, state.goals.map(g => {
    const pct = (g.saved || 0) / g.target;
    const remaining = g.target - (g.saved || 0);
    return /*#__PURE__*/React.createElement("div", {
      key: g.id,
      style: {
        padding: 14,
        border: "1px solid var(--border)",
        background: "var(--panel-alt)",
        borderRadius: "var(--radius)",
        display: "flex",
        flexDirection: "column",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: "var(--tracking)"
      }
    }, g.name), g.deadline && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: "var(--muted)",
        fontFamily: "var(--font-mono)",
        marginTop: 2
      }
    }, "Deadline: ", fmtDate(g.deadline, {
      year: true
    })), g.note && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--muted)",
        marginTop: 2
      }
    }, g.note)), /*#__PURE__*/React.createElement(Chip, {
      tone: pct >= 1 ? "up" : pct > 0.5 ? "accent" : "muted"
    }, fmtPct(pct, 0))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline"
      }
    }, /*#__PURE__*/React.createElement(Num, {
      weight: 600,
      size: 20
    }, fmtMoney(g.saved || 0)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--muted)",
        fontFamily: "var(--font-mono)"
      }
    }, "of ", fmtMoney(g.target))), /*#__PURE__*/React.createElement(ProgressBar, {
      value: g.saved || 0,
      max: g.target,
      color: "var(--accent)",
      height: 6
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: "var(--muted)",
        fontFamily: "var(--font-mono)"
      }
    }, "Need ", /*#__PURE__*/React.createElement(Num, {
      weight: 600,
      color: "var(--text)"
    }, fmtMoney(Math.max(0, remaining))), " more"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "primary",
      onClick: () => setContribute(g),
      style: {
        flex: 1,
        justifyContent: "center"
      },
      icon: ICONS.plus
    }, "Contribute"), /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.edit,
      onClick: () => setEditGoal(g)
    }), /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.trash,
      onClick: () => setConfirmDel(g),
      danger: true
    })));
  }))), /*#__PURE__*/React.createElement(GoalForm, {
    open: showAdd || !!editGoal,
    onClose: () => {
      setShowAdd(false);
      setEditGoal(null);
    },
    goal: editGoal
  }), /*#__PURE__*/React.createElement(ContributeGoalModal, {
    open: !!contribute,
    onClose: () => setContribute(null),
    goal: contribute
  }), /*#__PURE__*/React.createElement(ConfirmDialog, {
    open: !!confirmDel,
    onClose: () => setConfirmDel(null),
    title: "Delete goal?",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Remove ", /*#__PURE__*/React.createElement("strong", null, confirmDel?.name), "?"),
    confirmLabel: "Delete",
    danger: true,
    onConfirm: () => {
      actions.deleteGoal(confirmDel.id);
      toast("Goal deleted.", "success");
    }
  }));
}

// ---------------------------------------------------------------------------
// RECURRING (subscriptions + bills)
// ---------------------------------------------------------------------------
function RecurringForm({
  open,
  onClose,
  rec
}) {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  const editing = !!rec;
  const [form, setForm] = useState(rec || {
    particular: "",
    amount: "",
    kind: "expense",
    categoryId: state.categories.find(c => c.id === "cat-subscription")?.id || "",
    accountId: state.cashAccounts[0]?.id || "",
    dueDay: 1,
    frequency: "monthly",
    note: ""
  });
  useEffect(() => {
    if (open) setForm(rec || {
      particular: "",
      amount: "",
      kind: "expense",
      categoryId: state.categories.find(c => c.id === "cat-subscription")?.id || "",
      accountId: state.cashAccounts[0]?.id || "",
      dueDay: 1,
      frequency: "monthly",
      note: ""
    });
  }, [open, rec?.id]);
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const valid = form.particular && +form.amount > 0;
  const save = () => {
    if (!valid) {
      toast("Particular and amount are required.", "error");
      return;
    }
    const payload = {
      ...form,
      amount: Number(form.amount),
      dueDay: Number(form.dueDay) || 1,
      categoryId: form.categoryId || null,
      accountId: form.accountId || null
    };
    if (editing) {
      actions.updateRecurring(rec.id, payload);
      toast("Recurring rule updated.", "success");
    } else {
      actions.addRecurring(payload);
      toast("Recurring rule added · auto-runs on due day.", "success");
    }
    onClose();
  };
  const cats = state.categories.filter(c => c.kind === form.kind);
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: editing ? "Edit recurring rule" : "Add recurring rule",
    width: 520,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: save,
      disabled: !valid
    }, editing ? "Save" : "Add rule"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Particular",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    value: form.particular,
    onChange: v => set("particular", v),
    placeholder: "e.g. Netflix \xB7 Condo Rent \xB7 MERALCO",
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Amount (\u20B1)",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: form.amount,
    onChange: v => set("amount", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Day of month",
    hint: "When to auto-generate"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    min: "1",
    max: "31",
    value: form.dueDay,
    onChange: v => set("dueDay", v)
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Kind"
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.kind,
    onChange: v => set("kind", v),
    options: [{
      value: "expense",
      label: "Expense"
    }, {
      value: "income",
      label: "Income"
    }]
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Category"
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.categoryId,
    onChange: v => set("categoryId", v),
    options: [{
      value: "",
      label: "—"
    }, ...cats.map(c => ({
      value: c.id,
      label: c.name
    }))]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "From / to account"
  }, state.cashAccounts.length ? /*#__PURE__*/React.createElement(Select, {
    value: form.accountId,
    onChange: v => set("accountId", v),
    options: [{
      value: "",
      label: "— None / cash —"
    }, ...state.cashAccounts.map(a => ({
      value: a.id,
      label: a.name
    }))]
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      ...inputStyle,
      color: "var(--muted)",
      fontStyle: "italic"
    }
  }, "No accounts yet")), /*#__PURE__*/React.createElement(Field, {
    label: "Note"
  }, /*#__PURE__*/React.createElement(Textarea, {
    value: form.note,
    onChange: v => set("note", v),
    rows: 2
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      background: "var(--panel-alt)",
      border: "1px dashed var(--border)",
      fontSize: 11,
      color: "var(--muted)",
      lineHeight: 1.5,
      borderRadius: "var(--radius)"
    }
  }, "A transaction will auto-generate each month when day ", /*#__PURE__*/React.createElement("strong", null, form.dueDay), " arrives. You can still edit or delete individual generated transactions.")));
}
function RecurringScreen() {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  const [editRec, setEditRec] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const monthlyTotal = state.recurring.filter(r => r.kind === "expense" && r.frequency === "monthly").reduce((s, r) => s + r.amount, 0);
  const monthlyIncomeTotal = state.recurring.filter(r => r.kind === "income" && r.frequency === "monthly").reduce((s, r) => s + r.amount, 0);
  if (state.recurring.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14
      }
    }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement(Empty, {
      icon: ICONS.subscriptions,
      title: "No recurring rules yet",
      body: "Set up rules for monthly bills, subscriptions, allowances, or recurring income. They'll auto-generate transactions on their due day.",
      action: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        icon: ICONS.plus,
        onClick: () => setShowAdd(true)
      }, "Add your first rule"),
      padding: 80
    })), /*#__PURE__*/React.createElement(RecurringForm, {
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
    label: "Monthly outflow",
    value: fmtMoney(monthlyTotal),
    sub: state.recurring.filter(r => r.kind === "expense").length + " rules",
    color: "var(--down)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Monthly inflow",
    value: fmtMoney(monthlyIncomeTotal),
    color: "var(--up)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Annual outflow",
    value: fmtMoney(monthlyTotal * 12),
    sub: "projected"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--panel)"
    }
  }, /*#__PURE__*/React.createElement(KPI, {
    label: "Net monthly",
    value: fmtMoney(monthlyIncomeTotal - monthlyTotal),
    color: monthlyIncomeTotal - monthlyTotal >= 0 ? "var(--up)" : "var(--down)"
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: `Recurring rules · ${state.recurring.length}`,
    action: /*#__PURE__*/React.createElement(Button, {
      icon: ICONS.plus,
      variant: "primary",
      onClick: () => setShowAdd(true)
    }, "Add rule")
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
  }, "Particular"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px"
    })
  }, "Kind"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px"
    })
  }, "Category"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "Day"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "Amount"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px"
    })
  }, "Last run"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }))), /*#__PURE__*/React.createElement("tbody", null, state.recurring.map(r => {
    const cat = state.categories.find(c => c.id === r.categoryId);
    return /*#__PURE__*/React.createElement("tr", {
      key: r.id,
      style: {
        borderTop: "1px solid var(--border)"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        weight: 600
      })
    }, r.particular, r.note && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: "var(--faint)",
        fontWeight: 400
      }
    }, r.note)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px"
      })
    }, /*#__PURE__*/React.createElement(Chip, {
      tone: r.kind === "income" ? "up" : "muted"
    }, r.kind)), /*#__PURE__*/React.createElement("td", {
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
    }), cat.name) : "—"), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        align: "right",
        mono: true,
        color: "var(--muted)"
      })
    }, ordinal(r.dueDay)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        align: "right",
        mono: true,
        weight: 600
      })
    }, fmtMoney(r.amount)), /*#__PURE__*/React.createElement("td", {
      style: cellStyle({
        pad: "10px 14px",
        mono: true,
        color: "var(--muted)"
      })
    }, r.lastGenerated ? fmtDate(r.lastGenerated) : "—"), /*#__PURE__*/React.createElement("td", {
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
      onClick: () => setEditRec(r),
      title: "Edit"
    }), /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.trash,
      onClick: () => setConfirmDel(r),
      title: "Delete",
      danger: true
    }))));
  })))), /*#__PURE__*/React.createElement(RecurringForm, {
    open: showAdd || !!editRec,
    onClose: () => {
      setShowAdd(false);
      setEditRec(null);
    },
    rec: editRec
  }), /*#__PURE__*/React.createElement(ConfirmDialog, {
    open: !!confirmDel,
    onClose: () => setConfirmDel(null),
    title: "Delete recurring rule?",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Remove ", /*#__PURE__*/React.createElement("strong", null, confirmDel?.particular), "? Previously generated transactions stay logged."),
    confirmLabel: "Delete",
    danger: true,
    onConfirm: () => {
      actions.deleteRecurring(confirmDel.id);
      toast("Rule deleted.", "success");
    }
  }));
}
Object.assign(window, {
  BudgetForm,
  BudgetsScreen,
  GoalForm,
  GoalsScreen,
  ContributeGoalModal,
  RecurringForm,
  RecurringScreen
});