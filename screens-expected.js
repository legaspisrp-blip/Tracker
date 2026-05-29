// ============================================================================
// screens-expected.js — Expected vs Actual: income forecasting + planned expenses
// ============================================================================

// ---------------------------------------------------------------------------
// Realize Income Modal — convert expected income to actual transaction
// ---------------------------------------------------------------------------
function RealizeIncomeModal({ item, onClose }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const fxRate = state.settings.fxRate || 58.42;
  const isUSD = item.currency && item.currency.toUpperCase() === "USD";
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState(String(item.amount));
  const [accountId, setAccountId] = useState(state.cashAccounts[0]?.id || "");

  const onSave = () => {
    if (!+amount || +amount <= 0) { toast("Enter a valid amount.", "error"); return; }
    actions.realizeIncome(item.id, date, Number(amount), accountId || null);
    toast("Income realized and recorded.", "success");
    onClose();
  };

  return React.createElement(Modal, {
    open: true, onClose, title: "Realize income", width: 480,
    footer: React.createElement(React.Fragment, null,
      React.createElement(Button, { variant: "ghost", onClick: onClose }, "Cancel"),
      React.createElement(Button, { variant: "primary", onClick: onSave }, "Confirm & record")
    )
  },
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
      React.createElement("div", { style: { padding: "10px 14px", background: "var(--panel-alt)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--muted)" } },
        "Recording actual receipt for: ", React.createElement("strong", { style: { color: "var(--text)" } }, item.source)
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        React.createElement(Field, { label: "Date received", required: true },
          React.createElement(Input, { type: "date", value: date, onChange: setDate })
        ),
        React.createElement(Field, { label: "Amount received (\u20B1)", required: true },
          React.createElement(Input, { type: "number", mono: true, step: "0.01", min: "0", value: amount, onChange: setAmount })
        )
      ),
      React.createElement(Field, { label: "Deposit to account" },
        React.createElement(Select, {
          value: accountId,
          onChange: setAccountId,
          options: [
            { value: "", label: "\u2014 None / cash \u2014" },
            ...state.cashAccounts.map(a => ({ value: a.id, label: a.name + " \xb7 " + fmtMoney(a.balance, { dec: 0 }) }))
          ]
        })
      ),
      isUSD && React.createElement("div", {
        style: { fontSize: 11, color: "var(--muted)", padding: "6px 10px", border: "1px solid var(--border)", borderRadius: "var(--radius)" }
      }, "USD amount: $", Number(item.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 }), " → ", fmtMoney(item.amount * fxRate, { dec: 2 }), " at rate ", fxRate),
      +amount !== item.amount && React.createElement("div", {
        style: { fontSize: 11, color: "var(--warn)", padding: "6px 10px", border: "1px solid var(--warn)", borderRadius: "var(--radius)" }
      }, "Variance: ", isUSD ? ("$" + Math.abs(+amount - item.amount).toFixed(2)) : fmtMoney(+amount - item.amount, { dec: 2 }), " from expected")
    )
  );
}

// ---------------------------------------------------------------------------
// Complete Expense Modal — mark planned expense as paid
// ---------------------------------------------------------------------------
function CompleteExpenseModal({ item, onClose }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState(String(item.amount));
  const [accountId, setAccountId] = useState(state.cashAccounts[0]?.id || "");

  const onSave = () => {
    if (!+amount || +amount <= 0) { toast("Enter a valid amount.", "error"); return; }
    actions.completePlannedExpense(item.id, date, Number(amount), accountId || null);
    toast("Expense marked as paid and recorded.", "success");
    onClose();
  };

  return React.createElement(Modal, {
    open: true, onClose, title: "Mark as paid", width: 480,
    footer: React.createElement(React.Fragment, null,
      React.createElement(Button, { variant: "ghost", onClick: onClose }, "Cancel"),
      React.createElement(Button, { variant: "primary", onClick: onSave }, "Confirm & record")
    )
  },
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
      React.createElement("div", { style: { padding: "10px 14px", background: "var(--panel-alt)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--muted)" } },
        "Recording actual payment for: ", React.createElement("strong", { style: { color: "var(--text)" } }, item.particular)
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        React.createElement(Field, { label: "Date paid", required: true },
          React.createElement(Input, { type: "date", value: date, onChange: setDate })
        ),
        React.createElement(Field, { label: "Amount paid (\u20B1)", required: true },
          React.createElement(Input, { type: "number", mono: true, step: "0.01", min: "0", value: amount, onChange: setAmount })
        )
      ),
      React.createElement(Field, { label: "Paid from account" },
        React.createElement(Select, {
          value: accountId,
          onChange: setAccountId,
          options: [
            { value: "", label: "\u2014 None / cash \u2014" },
            ...state.cashAccounts.map(a => ({ value: a.id, label: a.name + " \xb7 " + fmtMoney(a.balance, { dec: 0 }) }))
          ]
        })
      ),
      +amount !== item.amount && React.createElement("div", {
        style: { fontSize: 11, color: "var(--warn)", padding: "6px 10px", border: "1px solid var(--warn)", borderRadius: "var(--radius)" }
      }, "Variance: ", fmtMoney(+amount - item.amount, { dec: 2 }), " from planned ", fmtMoney(item.amount, { dec: 2 }))
    )
  );
}

// ---------------------------------------------------------------------------
// Add/Edit Expected Income Modal
// ---------------------------------------------------------------------------
function ExpectedIncomeEditor({ item, onClose }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const editing = !!item;
  const [form, setForm] = useState(item ? { currency: "PHP", ...item } : {
    source: "", amount: "", expectedDate: todayISO(), confidence: "medium", currency: "PHP", note: ""
  });
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const onSave = () => {
    if (!form.source || !+form.amount) { toast("Fill source and amount.", "error"); return; }
    const payload = { ...form, amount: Number(form.amount), status: form.status || "pending" };
    if (editing) { actions.updateExpected(item.id, payload); toast("Updated.", "success"); }
    else { actions.addExpected(payload); toast("Expected income added.", "success"); }
    onClose();
  };

  return React.createElement(Modal, {
    open: true, onClose,
    title: editing ? "Edit expected income" : "Add expected income",
    width: 480,
    footer: React.createElement(React.Fragment, null,
      editing && React.createElement(Button, { danger: true, onClick: () => { actions.deleteExpected(item.id); toast("Deleted.", "success"); onClose(); }, style: { marginRight: "auto" }, icon: ICONS.trash }, "Delete"),
      React.createElement(Button, { variant: "ghost", onClick: onClose }, "Cancel"),
      React.createElement(Button, { variant: "primary", onClick: onSave }, editing ? "Save changes" : "Add")
    )
  },
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
      React.createElement(Field, { label: "Source / client", required: true },
        React.createElement(Input, { value: form.source, onChange: v => setField("source", v), placeholder: "e.g. Client A \xb7 Timesheet May" })
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        React.createElement(Field, { label: "Expected amount", required: true },
          React.createElement("div", { style: { display: "flex", gap: 6 } },
            React.createElement(Select, {
              value: form.currency || "PHP",
              onChange: v => setField("currency", v),
              options: [{ value: "PHP", label: "PHP ₱" }, { value: "USD", label: "USD $" }],
              style: { width: 110 }
            }),
            React.createElement(Input, { type: "number", mono: true, step: "0.01", min: "0", value: form.amount, onChange: v => setField("amount", v) })
          )
        ),
        React.createElement(Field, { label: "Expected date" },
          React.createElement(Input, { type: "date", value: form.expectedDate, onChange: v => setField("expectedDate", v) })
        )
      ),
      React.createElement(Field, { label: "Confidence" },
        React.createElement(Select, {
          value: form.confidence,
          onChange: v => setField("confidence", v),
          options: [
            { value: "high", label: "High \u2014 confirmed" },
            { value: "medium", label: "Medium \u2014 likely" },
            { value: "low", label: "Low \u2014 uncertain" }
          ]
        })
      ),
      React.createElement(Field, { label: "Note" },
        React.createElement(Textarea, { value: form.note || "", onChange: v => setField("note", v), placeholder: "Optional details\u2026", rows: 2 })
      )
    )
  );
}

// ---------------------------------------------------------------------------
// Add/Edit Planned Expense Modal
// ---------------------------------------------------------------------------
function PlannedExpenseEditor({ item, onClose }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const editing = !!item;
  const [form, setForm] = useState(item || {
    particular: "", amount: "", dueDate: todayISO(), categoryId: "", note: ""
  });
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cats = state.categories.filter(c => c.kind === "expense");

  const onSave = () => {
    if (!form.particular || !+form.amount) { toast("Fill particular and amount.", "error"); return; }
    const payload = { ...form, amount: Number(form.amount), status: form.status || "pending" };
    if (editing) { actions.updatePlannedExpense(item.id, payload); toast("Updated.", "success"); }
    else { actions.addPlannedExpense(payload); toast("Planned expense added.", "success"); }
    onClose();
  };

  return React.createElement(Modal, {
    open: true, onClose,
    title: editing ? "Edit planned expense" : "Add planned expense",
    width: 480,
    footer: React.createElement(React.Fragment, null,
      editing && React.createElement(Button, { danger: true, onClick: () => { actions.deletePlannedExpense(item.id); toast("Deleted.", "success"); onClose(); }, style: { marginRight: "auto" }, icon: ICONS.trash }, "Delete"),
      React.createElement(Button, { variant: "ghost", onClick: onClose }, "Cancel"),
      React.createElement(Button, { variant: "primary", onClick: onSave }, editing ? "Save changes" : "Add")
    )
  },
    React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } },
      React.createElement(Field, { label: "Particular", required: true },
        React.createElement(Input, { value: form.particular, onChange: v => setField("particular", v), placeholder: "e.g. Internet bill \xb7 Rent" })
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } },
        React.createElement(Field, { label: "Planned amount (\u20B1)", required: true },
          React.createElement(Input, { type: "number", mono: true, step: "0.01", min: "0", value: form.amount, onChange: v => setField("amount", v) })
        ),
        React.createElement(Field, { label: "Due date" },
          React.createElement(Input, { type: "date", value: form.dueDate, onChange: v => setField("dueDate", v) })
        )
      ),
      React.createElement(Field, { label: "Category" },
        React.createElement(Select, {
          value: form.categoryId,
          onChange: v => setField("categoryId", v),
          options: [{ value: "", label: "\u2014 Uncategorized \u2014" }, ...cats.map(c => ({ value: c.id, label: c.name }))]
        })
      ),
      React.createElement(Field, { label: "Note" },
        React.createElement(Textarea, { value: form.note || "", onChange: v => setField("note", v), placeholder: "Optional details\u2026", rows: 2 })
      )
    )
  );
}

// ---------------------------------------------------------------------------
// Status chip helper
// ---------------------------------------------------------------------------
function statusChip(status, dueDate) {
  if (status === "completed" || status === "received") return React.createElement(Chip, { tone: "up" }, status);
  const today = new Date(); today.setHours(0,0,0,0);
  const due = dueDate ? new Date(dueDate) : null;
  if (!due) return React.createElement(Chip, { tone: "muted" }, "pending");
  const diff = Math.ceil((due - today) / 86400000);
  if (diff < 0) return React.createElement(Chip, { tone: "down" }, "overdue");
  if (diff <= 3) return React.createElement(Chip, { tone: "warn" }, "due soon");
  if (diff <= 7) return React.createElement(Chip, { tone: "warn" }, "this week");
  return React.createElement(Chip, { tone: "muted" }, "pending");
}

// ---------------------------------------------------------------------------
// Main ExpectedScreen
// ---------------------------------------------------------------------------
function ExpectedScreen() {
  const { state } = useStore();
  const fxRate = state.settings.fxRate || 58.42;
  const toPHP = (amount, currency) => (currency && currency.toUpperCase() === "USD") ? (amount || 0) * fxRate : (amount || 0);
  const [tab, setTab] = useState("income");
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editIncome, setEditIncome] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [realizeItem, setRealizeItem] = useState(null);
  const [completeItem, setCompleteItem] = useState(null);

  const incomes = [...(state.expectedIncome || [])].sort((a, b) => {
    if (a.status === "received" && b.status !== "received") return 1;
    if (b.status === "received" && a.status !== "received") return -1;
    const da = a.expectedDate || "9999";
    const db = b.expectedDate || "9999";
    return da.localeCompare(db);
  });
  const expenses = [...(state.plannedExpenses || [])].sort((a, b) => {
    // Completed go to bottom
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (b.status === "completed" && a.status !== "completed") return -1;
    // Sort by due date ascending (nearest first)
    const da = a.dueDate || "9999";
    const db = b.dueDate || "9999";
    return da.localeCompare(db);
  });

  const totalExpIncome = incomes.filter(e => e.status !== "received").reduce((s, e) => s + toPHP(e.amount, e.currency), 0);
  // actualAmount is always stored in PHP — don't apply currency conversion to it
  const totalActIncome = incomes.filter(e => e.status === "received").reduce((s, e) => s + (e.actualAmount || toPHP(e.amount, e.currency)), 0);
  const totalExpExpense = expenses.filter(e => e.status !== "completed").reduce((s, e) => s + (e.amount || 0), 0);
  const totalActExpense = expenses.filter(e => e.status === "completed").reduce((s, e) => s + (e.actualAmount || e.amount || 0), 0);

  const tabs = [
    { id: "income", label: "Expected income", count: incomes.length },
    { id: "expenses", label: "Planned expenses", count: expenses.length }
  ];

  return React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, padding: 14 } },

    // KPI row
    React.createElement("div", {
      style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }
    },
      React.createElement("div", { style: { background: "var(--panel)" } }, React.createElement(KPI, { label: "Income expected", value: fmtMoney(totalExpIncome), color: "var(--up)" })),
      React.createElement("div", { style: { background: "var(--panel)" } }, React.createElement(KPI, { label: "Income received", value: fmtMoney(totalActIncome), color: "var(--up)" })),
      React.createElement("div", { style: { background: "var(--panel)" } }, React.createElement(KPI, { label: "Expenses planned", value: fmtMoney(totalExpExpense), color: "var(--down)" })),
      React.createElement("div", { style: { background: "var(--panel)" } }, React.createElement(KPI, { label: "Expenses paid", value: fmtMoney(totalActExpense), color: "var(--down)" }))
    ),

    // Tab panel
    React.createElement(Panel, {
      title: tab === "income" ? "Expected income" : "Planned expenses",
      action: React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } },
        React.createElement("div", { style: { display: "flex", gap: 1, background: "var(--border)", padding: 1, borderRadius: "var(--radius)" } },
          tabs.map(t => React.createElement("button", {
            key: t.id, type: "button",
            onClick: () => setTab(t.id),
            style: { all: "unset", cursor: "pointer", padding: "4px 12px", fontSize: 11, fontWeight: 600,
              background: tab === t.id ? "var(--panel)" : "transparent",
              color: tab === t.id ? "var(--text)" : "var(--muted)", borderRadius: "var(--radius)" }
          }, t.label, " (", t.count, ")")
          )
        ),
        tab === "income"
          ? React.createElement(Button, { variant: "primary", icon: ICONS.plus, onClick: () => setShowIncomeForm(true) }, "Add expected")
          : React.createElement(Button, { variant: "primary", icon: ICONS.plus, onClick: () => setShowExpenseForm(true) }, "Add planned")
      )
    },

      tab === "income" && React.createElement("div", null,
        incomes.length === 0
          ? React.createElement(Empty, { icon: ICONS.income, title: "No expected income yet", body: "Add income you are expecting from clients, salary, or other sources.", padding: 50 })
          : React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } },
              React.createElement("thead", null,
                React.createElement("tr", { style: { fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--faint)", fontWeight: 600 } },
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px" }) }, "Source"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px" }) }, "Expected date"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px" }) }, "Confidence"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px", align: "right" }) }, "Expected"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px", align: "right" }) }, "Actual"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px", align: "right" }) }, "Variance"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px" }) }, "Status"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px", align: "right" }) })
                )
              ),
              React.createElement("tbody", null,
                incomes.map(e => {
                  const actual = e.actualAmount || 0;
                  const variance = e.status === "received" ? actual - e.amount : null;
                  return React.createElement("tr", { key: e.id, style: { borderTop: "1px solid var(--border)", opacity: e.status === "received" ? 0.6 : 1 } },
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", weight: 500 }) }, e.source),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", mono: true, color: "var(--muted)" }) }, fmtDate(e.expectedDate)),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px" }) },
                      React.createElement(Chip, { tone: e.confidence === "high" ? "up" : e.confidence === "low" ? "down" : "muted" }, e.confidence)
                    ),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", align: "right", mono: true }) },
                    e.currency === "USD"
                      ? React.createElement("div", null,
                          React.createElement("div", null, "$" + Number(e.amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
                          React.createElement("div", { style: { fontSize: 10, color: "var(--muted)" } }, fmtMoney(toPHP(e.amount, e.currency), { dec: 2 }))
                        )
                      : fmtMoney(e.amount, { dec: 2 })
                  ),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", align: "right", mono: true, color: "var(--up)" }) }, e.status === "received" ? fmtMoney(actual, { dec: 2 }) : "\u2014"),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", align: "right", mono: true, color: variance !== null ? (variance >= 0 ? "var(--up)" : "var(--down)") : "var(--faint)" }) },
                      variance !== null ? (variance >= 0 ? "+" : "") + fmtMoney(variance, { dec: 2 }) : "\u2014"
                    ),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px" }) }, statusChip(e.status, e.expectedDate)),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", align: "right" }) },
                      React.createElement("div", { style: { display: "flex", gap: 4, justifyContent: "flex-end" } },
                        e.status !== "received" && React.createElement(Button, { size: "sm", variant: "primary", onClick: () => setRealizeItem(e) }, "Mark received"),
                        React.createElement(IconBtn, { icon: ICONS.edit, onClick: () => setEditIncome(e), title: "Edit" })
                      )
                    )
                  );
                })
              )
            )
      ),

      tab === "expenses" && React.createElement("div", null,
        expenses.length === 0
          ? React.createElement(Empty, { icon: ICONS.expenses, title: "No planned expenses yet", body: "Add expenses you know are coming so you can track and mark them as paid.", padding: 50 })
          : React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } },
              React.createElement("thead", null,
                React.createElement("tr", { style: { fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--faint)", fontWeight: 600 } },
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px" }) }, "Particular"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px" }) }, "Due date"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px" }) }, "Category"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px", align: "right" }) }, "Planned"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px", align: "right" }) }, "Actual"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px", align: "right" }) }, "Variance"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px" }) }, "Status"),
                  React.createElement("th", { style: cellStyle({ pad: "8px 14px", align: "right" }) })
                )
              ),
              React.createElement("tbody", null,
                expenses.map(e => {
                  const cat = state.categories.find(c => c.id === e.categoryId);
                  const actual = e.actualAmount || 0;
                  const variance = e.status === "completed" ? actual - e.amount : null;
                  return React.createElement("tr", { key: e.id, style: { borderTop: "1px solid var(--border)", opacity: e.status === "completed" ? 0.6 : 1 } },
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", weight: 500 }) },
                    e.particular,
                    e.recurringId && React.createElement(Chip, { tone: "muted", style: { marginLeft: 6 } }, "recurring"),
                    e.debtId && React.createElement(Chip, { tone: "down", style: { marginLeft: 6 } }, "debt")
                  ),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", mono: true, color: "var(--muted)" }) }, fmtDate(e.dueDate)),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px" }) },
                      cat ? React.createElement(Chip, null, React.createElement("span", { style: { width: 6, height: 6, background: cat.color, display: "inline-block", marginRight: 4 } }), cat.name)
                          : React.createElement("span", { style: { color: "var(--faint)" } }, "\u2014")
                    ),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", align: "right", mono: true }) }, fmtMoney(e.amount, { dec: 2 })),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", align: "right", mono: true, color: "var(--down)" }) }, e.status === "completed" ? fmtMoney(actual, { dec: 2 }) : "\u2014"),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", align: "right", mono: true, color: variance !== null ? (variance <= 0 ? "var(--up)" : "var(--down)") : "var(--faint)" }) },
                      variance !== null ? (variance >= 0 ? "+" : "") + fmtMoney(variance, { dec: 2 }) : "\u2014"
                    ),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px" }) }, statusChip(e.status, e.dueDate)),
                    React.createElement("td", { style: cellStyle({ pad: "10px 14px", align: "right" }) },
                      React.createElement("div", { style: { display: "flex", gap: 4, justifyContent: "flex-end" } },
                        e.status !== "completed" && React.createElement(Button, { size: "sm", variant: "primary", onClick: () => setCompleteItem(e) }, "Mark paid"),
                        React.createElement(IconBtn, { icon: ICONS.edit, onClick: () => setEditExpense(e), title: "Edit" })
                      )
                    )
                  );
                })
              )
            )
      )
    ),

    // Modals
    (showIncomeForm || editIncome) && React.createElement(ExpectedIncomeEditor, { item: editIncome, onClose: () => { setShowIncomeForm(false); setEditIncome(null); } }),
    (showExpenseForm || editExpense) && React.createElement(PlannedExpenseEditor, { item: editExpense, onClose: () => { setShowExpenseForm(false); setEditExpense(null); } }),
    realizeItem && React.createElement(RealizeIncomeModal, { item: realizeItem, onClose: () => setRealizeItem(null) }),
    completeItem && React.createElement(CompleteExpenseModal, { item: completeItem, onClose: () => setCompleteItem(null) })
  );
}

Object.assign(window, {
  ExpectedScreen,
  ExpectedIncomeEditor,
  PlannedExpenseEditor,
  RealizeIncomeModal,
  CompleteExpenseModal
});
