// ============================================================================
// store.js — Single source of truth. Context + reducer + localStorage + Supabase.
// This means any browser/device will see the same data automatically.
// ============================================================================

const LS_KEY = "ledger:state:v2";
const APP_VERSION = "0.9.0";

const EMPTY_STATE = {
  version: APP_VERSION,
  session: { role: "owner", name: "" },
  settings: {
    currency: "PHP", locale: "en-PH", fxRate: 58.42, fxRateUpdated: null,
    accent: "oklch(58% 0.18 145)", mode: "light", variant: "a"
  },
  categories: [
    { id: "cat-housing", name: "Housing", color: "oklch(60% 0.14 240)", kind: "expense" },
    { id: "cat-utility", name: "Utilities", color: "oklch(70% 0.12 200)", kind: "expense" },
    { id: "cat-groceries", name: "Groceries", color: "oklch(64% 0.16 95)", kind: "expense" },
    { id: "cat-transport", name: "Transport", color: "oklch(66% 0.14 160)", kind: "expense" },
    { id: "cat-food", name: "Food", color: "oklch(68% 0.18 50)", kind: "expense" },
    { id: "cat-subscription", name: "Subscription", color: "oklch(68% 0.16 305)", kind: "expense" },
    { id: "cat-allowance", name: "Allowance", color: "oklch(72% 0.14 60)", kind: "expense" },
    { id: "cat-debt", name: "Debt Payment", color: "oklch(56% 0.22 27)", kind: "expense" },
    { id: "cat-personal", name: "Personal", color: "oklch(64% 0.10 320)", kind: "expense" },
    { id: "cat-other-exp", name: "Other", color: "oklch(60% 0.04 280)", kind: "expense" },
    { id: "cat-salary", name: "Salary", color: "oklch(58% 0.18 145)", kind: "income" },
    { id: "cat-freelance", name: "Freelance", color: "oklch(64% 0.16 175)", kind: "income" },
    { id: "cat-side", name: "Side hustle", color: "oklch(66% 0.14 120)", kind: "income" },
    { id: "cat-other-inc", name: "Other income", color: "oklch(60% 0.10 100)", kind: "income" }
  ],
  cashAccounts: [], transactions: [], debts: [], creditAccounts: [],
  budgets: [], goals: [], recurring: [], expectedIncome: [],
  plannedExpenses: [],
  notifications: [], lastBackup: null
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN": return { ...state, session: { role: action.role, name: action.name || "" } };
    case "LOGOUT": return { ...state, session: { role: null, name: "" } };
    case "SET_SETTING": return { ...state, settings: { ...state.settings, [action.key]: action.value } };
    case "ADD_CATEGORY": return { ...state, categories: [...state.categories, { id: uid("cat"), ...action.payload }] };
    case "UPDATE_CATEGORY": return { ...state, categories: state.categories.map(c => c.id === action.id ? { ...c, ...action.patch } : c) };
    case "DELETE_CATEGORY": return { ...state, categories: state.categories.filter(c => c.id !== action.id) };
    case "ADD_CASH_ACCOUNT": return { ...state, cashAccounts: [...state.cashAccounts, { id: uid("acct"), balance: 0, ...action.payload }] };
    case "UPDATE_CASH_ACCOUNT": return { ...state, cashAccounts: state.cashAccounts.map(a => a.id === action.id ? { ...a, ...action.patch } : a) };
    case "DELETE_CASH_ACCOUNT": return { ...state, cashAccounts: state.cashAccounts.filter(a => a.id !== action.id) };
    case "ADD_TRANSACTION": {
      const tx = { id: uid("tx"), createdAt: Date.now(), logger: state.session.role || "system", ...action.payload };
      const updatedAccounts = applyTxToAccounts(state.cashAccounts, tx, "apply");
      let updatedDebts = state.debts;
      if (tx.debtId) updatedDebts = recordDebtTxOnDebts(state.debts, tx, "apply");
      let updatedCreds = state.creditAccounts;
      if (tx.creditId) updatedCreds = recordCreditTxOnCredits(state.creditAccounts, tx, "apply");
      if (tx.chargedCreditId) updatedCreds = chargeCreditAccount(updatedCreds, tx, "apply");
      return { ...state, transactions: [...state.transactions, tx], cashAccounts: updatedAccounts, debts: updatedDebts, creditAccounts: updatedCreds };
    }
    case "UPDATE_TRANSACTION": {
      const prev = state.transactions.find(t => t.id === action.id);
      if (!prev) return state;
      const next = { ...prev, ...action.patch };
      let accs = applyTxToAccounts(state.cashAccounts, prev, "reverse");
      accs = applyTxToAccounts(accs, next, "apply");
      let debts = prev.debtId ? recordDebtTxOnDebts(state.debts, prev, "reverse") : state.debts;
      if (next.debtId) debts = recordDebtTxOnDebts(debts, next, "apply");
      let credits = prev.creditId ? recordCreditTxOnCredits(state.creditAccounts, prev, "reverse") : state.creditAccounts;
      if (prev.chargedCreditId) credits = chargeCreditAccount(credits, prev, "reverse");
      if (next.creditId) credits = recordCreditTxOnCredits(credits, next, "apply");
      if (next.chargedCreditId) credits = chargeCreditAccount(credits, next, "apply");
      return { ...state, transactions: state.transactions.map(t => t.id === action.id ? next : t), cashAccounts: accs, debts, creditAccounts: credits };
    }
    case "DELETE_TRANSACTION": {
      const prev = state.transactions.find(t => t.id === action.id);
      if (!prev) return state;
      const accs = applyTxToAccounts(state.cashAccounts, prev, "reverse");
      const debts = prev.debtId ? recordDebtTxOnDebts(state.debts, prev, "reverse") : state.debts;
      let credits = prev.creditId ? recordCreditTxOnCredits(state.creditAccounts, prev, "reverse") : state.creditAccounts;
      if (prev.chargedCreditId) credits = chargeCreditAccount(credits, prev, "reverse");
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.id), cashAccounts: accs, debts, creditAccounts: credits };
    }
    case "ADD_DEBT": return { ...state, debts: [...state.debts, { id: uid("debt"), paidMonths: 0, status: "active", ...action.payload }] };
    case "UPDATE_DEBT": return { ...state, debts: state.debts.map(d => d.id === action.id ? { ...d, ...action.patch } : d) };
    case "DELETE_DEBT": return { ...state, debts: state.debts.filter(d => d.id !== action.id), transactions: state.transactions.map(t => t.debtId === action.id ? { ...t, debtId: null } : t) };
    case "ADD_CREDIT": return { ...state, creditAccounts: [...state.creditAccounts, { id: uid("cred"), balance: 0, ...action.payload }] };
    case "UPDATE_CREDIT": return { ...state, creditAccounts: state.creditAccounts.map(c => c.id === action.id ? { ...c, ...action.patch } : c) };
    case "DELETE_CREDIT": return { ...state, creditAccounts: state.creditAccounts.filter(c => c.id !== action.id), transactions: state.transactions.map(t => t.creditId === action.id ? { ...t, creditId: null } : t) };
    case "ADD_BUDGET": return { ...state, budgets: [...state.budgets, { id: uid("bud"), ...action.payload }] };
    case "UPDATE_BUDGET": return { ...state, budgets: state.budgets.map(b => b.id === action.id ? { ...b, ...action.patch } : b) };
    case "DELETE_BUDGET": return { ...state, budgets: state.budgets.filter(b => b.id !== action.id) };
    case "ADD_GOAL": return { ...state, goals: [...state.goals, { id: uid("goal"), saved: 0, ...action.payload }] };
    case "UPDATE_GOAL": return { ...state, goals: state.goals.map(g => g.id === action.id ? { ...g, ...action.patch } : g) };
    case "CONTRIBUTE_GOAL": return { ...state, goals: state.goals.map(g => g.id === action.id ? { ...g, saved: (g.saved || 0) + action.amount } : g) };
    case "DELETE_GOAL": return { ...state, goals: state.goals.filter(g => g.id !== action.id) };
    case "ADD_RECURRING": return { ...state, recurring: [...state.recurring, { id: uid("rec"), lastGenerated: null, ...action.payload }] };
    case "UPDATE_RECURRING": return { ...state, recurring: state.recurring.map(r => r.id === action.id ? { ...r, ...action.patch } : r) };
    case "DELETE_RECURRING": return { ...state, recurring: state.recurring.filter(r => r.id !== action.id) };
    case "TOUCH_RECURRING": return { ...state, recurring: state.recurring.map(r => r.id === action.id ? { ...r, lastGenerated: action.date } : r) };
    case "ADD_EXPECTED": return { ...state, expectedIncome: [...state.expectedIncome, { id: uid("exp"), confidence: "medium", ...action.payload }] };
    case "UPDATE_EXPECTED": return { ...state, expectedIncome: state.expectedIncome.map(e => e.id === action.id ? { ...e, ...action.patch } : e) };
    case "DELETE_EXPECTED": return { ...state, expectedIncome: state.expectedIncome.filter(e => e.id !== action.id) };
    // ---- PLANNED EXPENSES ----
    case "ADD_PLANNED_EXPENSE": return { ...state, plannedExpenses: [...state.plannedExpenses, { id: uid("pexp"), status: "pending", createdAt: Date.now(), ...action.payload }] };
    case "UPDATE_PLANNED_EXPENSE": return { ...state, plannedExpenses: state.plannedExpenses.map(e => e.id === action.id ? { ...e, ...action.patch } : e) };
    case "DELETE_PLANNED_EXPENSE": return { ...state, plannedExpenses: state.plannedExpenses.filter(e => e.id !== action.id) };
    // Complete a planned expense: mark as done + create actual transaction
    case "COMPLETE_PLANNED_EXPENSE": {
      const pe = state.plannedExpenses.find(e => e.id === action.id);
      if (!pe) return state;
      const tx = { id: uid("tx"), createdAt: Date.now(), logger: "system",
        date: action.date || dateISO(new Date()), particular: pe.particular,
        amount: action.amount || pe.amount, kind: "expense",
        categoryId: pe.categoryId, accountId: action.accountId || pe.accountId || null,
        debtId: pe.debtId || null,
        note: "Completed from planned expense.", plannedExpenseId: pe.id };
      const accs = applyTxToAccounts(state.cashAccounts, tx, "apply");
      let debts = state.debts;
      if (pe.debtId) debts = recordDebtTxOnDebts(state.debts, tx, "apply");
      return { ...state,
        plannedExpenses: state.plannedExpenses.map(e => e.id === action.id ? { ...e, status: "completed", completedAt: Date.now(), actualAmount: tx.amount } : e),
        transactions: [...state.transactions, tx], cashAccounts: accs, debts };
    }
    // Realize expected income: mark as received + create actual transaction
    case "REALIZE_INCOME": {
      const ei = state.expectedIncome.find(e => e.id === action.id);
      if (!ei) return state;
      const tx = { id: uid("tx"), createdAt: Date.now(), logger: "system",
        date: action.date || dateISO(new Date()), particular: ei.source,
        amount: action.amount || ei.amount, kind: "income",
        categoryId: state.categories.find(c => c.id === "cat-salary")?.id || null,
        accountId: action.accountId || null,
        note: "Realized from expected income.", expectedIncomeId: ei.id };
      const accs = applyTxToAccounts(state.cashAccounts, tx, "apply");
      return { ...state,
        expectedIncome: state.expectedIncome.map(e => e.id === action.id ? { ...e, status: "received", receivedAt: Date.now(), actualAmount: tx.amount } : e),
        transactions: [...state.transactions, tx], cashAccounts: accs };
    }
    case "IMPORT_STATE": {
      const p = action.payload || {};
      return { ...EMPTY_STATE, ...p, session: { role: "owner", name: (p.session && p.session.name) || "" } };
    }
    case "RESET_ALL": return { ...EMPTY_STATE, session: state.session };
    case "BACKUP_NOW": return { ...state, lastBackup: Date.now() };
    default: return state;
  }
}

function uid(prefix) { return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7); }
function round2(n) { return Math.round(n * 100) / 100; }
// Increase credit balance when charging a purchase to a credit account
function chargeCreditAccount(credits, tx, direction) {
  if (!tx.chargedCreditId) return credits;
  const sign = direction === "apply" ? 1 : -1;
  return credits.map(c => {
    if (c.id !== tx.chargedCreditId) return c;
    return { ...c, balance: round2((c.balance || 0) + tx.amount * sign) };
  });
}
function applyTxToAccounts(accounts, tx, direction) {
  if (!tx.accountId) return accounts;
  const sign = direction === "apply" ? 1 : -1;
  const delta = (tx.kind === "income" ? +tx.amount : -tx.amount) * sign;
  return accounts.map(a => a.id === tx.accountId ? { ...a, balance: round2((a.balance || 0) + delta) } : a);
}
function recordDebtTxOnDebts(debts, tx, direction) {
  const delta = direction === "apply" ? 1 : -1;
  return debts.map(d => {
    if (d.id !== tx.debtId) return d;
    const paidMonths = Math.max(0, (d.paidMonths || 0) + delta);
    const status = paidMonths >= (d.totalMonths || Infinity) ? "done" : "active";
    return { ...d, paidMonths, status };
  });
}
function recordCreditTxOnCredits(credits, tx, direction) {
  const sign = direction === "apply" ? 1 : -1;
  return credits.map(c => {
    if (c.id !== tx.creditId) return c;
    return { ...c, balance: Math.max(0, round2((c.balance || 0) - tx.amount * sign)) };
  });
}

function computeStats(state, options) {
  const now = (options && options.now) || new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const cashOnHand = state.cashAccounts.reduce((s, a) => s + (a.balance || 0), 0);
  const txs = state.transactions || [];
  const thisMonthTxs = txs.filter(t => sameMonth(t.date, year, month));
  const lastMonthTxs = txs.filter(t => sameMonth(t.date, lastMonthYear(year, month), lastMonth(month)));
  const monthIncome = sumKind(thisMonthTxs, "income");
  const monthExpense = sumKind(thisMonthTxs, "expense");
  const lastMonthIncome = sumKind(lastMonthTxs, "income");
  const lastMonthExpense = sumKind(lastMonthTxs, "expense");
  const incomeTrend = lastMonthIncome ? (monthIncome - lastMonthIncome) / lastMonthIncome : null;
  const expenseTrend = lastMonthExpense ? (monthExpense - lastMonthExpense) / lastMonthExpense : null;
  const net = monthIncome - monthExpense;
  const savingsRate = monthIncome ? net / monthIncome : null;
  const activeDebts = state.debts.filter(d => d.status === "active");
  const monthlyDebtObligation = activeDebts.reduce((s, d) => s + (d.monthlyPayment || 0), 0);
  const remainingPrincipal = activeDebts.reduce((s, d) => s + (d.monthlyPayment || 0) * Math.max(0, (d.totalMonths || 0) - (d.paidMonths || 0)), 0);
  const totalPrincipal = state.debts.reduce((s, d) => s + (d.monthlyPayment || 0) * (d.totalMonths || 0), 0);
  const paidPrincipal = state.debts.reduce((s, d) => s + (d.monthlyPayment || 0) * (d.paidMonths || 0), 0);
  const debtPaidPct = totalPrincipal ? paidPrincipal / totalPrincipal : 0;
  const totalCreditLimit = state.creditAccounts.reduce((s, c) => s + (c.limit || 0), 0);
  const totalCreditUsed = state.creditAccounts.reduce((s, c) => s + (c.balance || 0), 0);
  const creditUtilization = totalCreditLimit ? totalCreditUsed / totalCreditLimit : 0;
  const byCategory = {};
  for (const t of thisMonthTxs) {
    if (t.kind !== "expense") continue;
    const id = t.categoryId || "uncategorized";
    byCategory[id] = (byCategory[id] || 0) + t.amount;
  }
  const byCategorySorted = Object.entries(byCategory).map(([id, amt]) => ({
    categoryId: id, amount: amt, category: state.categories.find(c => c.id === id)
  })).sort((a, b) => b.amount - a.amount);
  const budgetStats = state.budgets.map(b => {
    const spent = byCategory[b.categoryId] || 0;
    const cat = state.categories.find(c => c.id === b.categoryId);
    return { ...b, spent, cap: b.monthlyCap, pct: b.monthlyCap ? spent / b.monthlyCap : 0, remaining: b.monthlyCap - spent, category: cat };
  });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const dailyBurn = dayOfMonth ? monthExpense / dayOfMonth : 0;
  const survivalDays = dailyBurn ? Math.floor(cashOnHand / dailyBurn) : null;
  const upcoming = buildUpcoming(state, now);
  const health = computeHealth({ monthIncome, monthExpense, monthlyDebtObligation, cashOnHand, dailyBurn, creditUtilization, savingsRate });
  return {
    now, year, month, cashOnHand, monthIncome, monthExpense, net, savingsRate,
    lastMonthIncome, lastMonthExpense, incomeTrend, expenseTrend,
    activeDebts, monthlyDebtObligation, remainingPrincipal, totalPrincipal, paidPrincipal, debtPaidPct,
    totalCreditLimit, totalCreditUsed, creditUtilization,
    byCategory: byCategorySorted, budgetStats, dailyBurn, survivalDays, daysInMonth, dayOfMonth,
    upcoming, health,
    transactionsThisMonth: thisMonthTxs, transactionsLastMonth: lastMonthTxs,
    isEmpty: state.transactions.length === 0 && state.debts.length === 0 && state.creditAccounts.length === 0 && state.cashAccounts.length === 0
  };
}
function sumKind(txs, kind) { return txs.filter(t => t.kind === kind).reduce((s, t) => s + t.amount, 0); }
function sameMonth(dateStr, y, m) { if (!dateStr) return false; const p = dateStr.split("-"); return Number(p[0]) === y && Number(p[1]) - 1 === m; }
function lastMonth(m) { return m === 0 ? 11 : m - 1; }
function lastMonthYear(y, m) { return m === 0 ? y - 1 : y; }
function dateISO(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function buildUpcoming(state, now) {
  const items = [];
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  for (let offset = 0; offset < 60; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    for (const debt of state.debts) {
      if (debt.status !== "active") continue;
      if (debt.dueDay === d.getDate()) items.push({ id: `debt-${debt.id}-${offset}`, date: dateISO(d), label: debt.name, amount: debt.monthlyPayment, kind: "debt", refId: debt.id, daysOut: offset });
    }
    for (const r of state.recurring) {
      if (r.frequency !== "monthly") continue;
      if (r.dueDay === d.getDate()) items.push({ id: `rec-${r.id}-${offset}`, date: dateISO(d), label: r.particular, amount: r.amount, kind: r.kind || "expense", categoryId: r.categoryId, refId: r.id, daysOut: offset });
    }
    for (const c of state.creditAccounts) {
      if (c.dueDay === d.getDate() && (c.balance || 0) > 0) items.push({ id: `cred-${c.id}-${offset}`, date: dateISO(d), label: `${c.name} \u00b7 min pay`, amount: c.minPayment || Math.min(c.balance, c.balance * 0.05), kind: "credit", refId: c.id, daysOut: offset });
    }
  }
  return items;
}
function computeHealth({ monthIncome, monthExpense, monthlyDebtObligation, cashOnHand, dailyBurn, creditUtilization, savingsRate }) {
  if (!monthIncome && !monthExpense && !cashOnHand) return null;
  const dti = monthIncome ? monthlyDebtObligation / monthIncome : 1;
  const reserveMonths = dailyBurn ? cashOnHand / (dailyBurn * 30) : 0;
  const dtiScore = Math.max(0, 100 - dti / 0.36 * 100);
  const savingsScore = savingsRate != null ? Math.min(100, Math.max(0, savingsRate * 250)) : 50;
  const reserveScore = Math.min(100, reserveMonths / 3 * 100);
  const utilScore = Math.max(0, 100 - creditUtilization * 333);
  const composite = Math.round(dtiScore * 0.35 + savingsScore * 0.25 + reserveScore * 0.25 + utilScore * 0.15);
  let rating = "At risk";
  if (composite >= 75) rating = "Strong";
  else if (composite >= 55) rating = "Stable";
  else if (composite >= 40) rating = "Stretched";
  return { composite, rating, dti, reserveMonths, savingsRate, creditUtilization, dtiScore, savingsScore, reserveScore, utilScore };
}

const StoreContext = React.createContext(null);

function loadInitial() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_STATE, ...parsed, session: { role: "owner", name: (parsed.session && parsed.session.name) || "" } };
  } catch (e) {
    console.warn("Ledger: failed to load saved state", e);
    return EMPTY_STATE;
  }
}

function StoreProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, loadInitial);

  // Save to localStorage on every state change
  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
    catch (e) { console.warn("Ledger: localStorage save failed", e); }
  }, [state]);



  const actions = React.useMemo(() => ({
    login: (role, name) => dispatch({ type: "LOGIN", role, name }),
    logout: () => dispatch({ type: "LOGOUT" }),
    setSetting: (key, value) => dispatch({ type: "SET_SETTING", key, value }),
    addCategory: p => dispatch({ type: "ADD_CATEGORY", payload: p }),
    updateCategory: (id, patch) => dispatch({ type: "UPDATE_CATEGORY", id, patch }),
    deleteCategory: id => dispatch({ type: "DELETE_CATEGORY", id }),
    addCashAccount: p => dispatch({ type: "ADD_CASH_ACCOUNT", payload: p }),
    updateCashAccount: (id, patch) => dispatch({ type: "UPDATE_CASH_ACCOUNT", id, patch }),
    deleteCashAccount: id => dispatch({ type: "DELETE_CASH_ACCOUNT", id }),
    addTransaction: p => dispatch({ type: "ADD_TRANSACTION", payload: p }),
    updateTransaction: (id, patch) => dispatch({ type: "UPDATE_TRANSACTION", id, patch }),
    deleteTransaction: id => dispatch({ type: "DELETE_TRANSACTION", id }),
    addDebt: p => dispatch({ type: "ADD_DEBT", payload: p }),
    updateDebt: (id, patch) => dispatch({ type: "UPDATE_DEBT", id, patch }),
    deleteDebt: id => dispatch({ type: "DELETE_DEBT", id }),
    addCredit: p => dispatch({ type: "ADD_CREDIT", payload: p }),
    updateCredit: (id, patch) => dispatch({ type: "UPDATE_CREDIT", id, patch }),
    deleteCredit: id => dispatch({ type: "DELETE_CREDIT", id }),
    addBudget: p => dispatch({ type: "ADD_BUDGET", payload: p }),
    updateBudget: (id, patch) => dispatch({ type: "UPDATE_BUDGET", id, patch }),
    deleteBudget: id => dispatch({ type: "DELETE_BUDGET", id }),
    addGoal: p => dispatch({ type: "ADD_GOAL", payload: p }),
    updateGoal: (id, patch) => dispatch({ type: "UPDATE_GOAL", id, patch }),
    contributeGoal: (id, amount) => dispatch({ type: "CONTRIBUTE_GOAL", id, amount }),
    deleteGoal: id => dispatch({ type: "DELETE_GOAL", id }),
    addRecurring: p => dispatch({ type: "ADD_RECURRING", payload: p }),
    updateRecurring: (id, patch) => dispatch({ type: "UPDATE_RECURRING", id, patch }),
    deleteRecurring: id => dispatch({ type: "DELETE_RECURRING", id }),
    touchRecurring: (id, date) => dispatch({ type: "TOUCH_RECURRING", id, date }),
    addExpected: p => dispatch({ type: "ADD_EXPECTED", payload: p }),
    updateExpected: (id, patch) => dispatch({ type: "UPDATE_EXPECTED", id, patch }),
    deleteExpected: id => dispatch({ type: "DELETE_EXPECTED", id }),
    // planned expenses
    addPlannedExpense: p => dispatch({ type: "ADD_PLANNED_EXPENSE", payload: p }),
    updatePlannedExpense: (id, patch) => dispatch({ type: "UPDATE_PLANNED_EXPENSE", id, patch }),
    deletePlannedExpense: id => dispatch({ type: "DELETE_PLANNED_EXPENSE", id }),
    completePlannedExpense: (id, date, amount, accountId) => dispatch({ type: "COMPLETE_PLANNED_EXPENSE", id, date, amount, accountId }),
    realizeIncome: (id, date, amount, accountId) => dispatch({ type: "REALIZE_INCOME", id, date, amount, accountId }),
    importState: payload => dispatch({ type: "IMPORT_STATE", payload }),
    resetAll: () => dispatch({ type: "RESET_ALL" }),
    backupNow: () => dispatch({ type: "BACKUP_NOW" })
  }), []);

  const computed = React.useMemo(() => computeStats(state), [state]);

  // Auto-generate planned expenses from recurring rules (not actual transactions)
  React.useEffect(() => {
    const today = new Date();
    const thisMonthStr = dateISO(today).slice(0, 7);
    for (const r of state.recurring) {
      if (r.frequency !== "monthly") continue;
      const lg = r.lastGenerated ? new Date(r.lastGenerated) : null;
      const alreadyThisMonth = lg && lg.getFullYear() === today.getFullYear() && lg.getMonth() === today.getMonth();
      if (alreadyThisMonth) continue;
      if (today.getDate() < (r.dueDay || 1)) continue;
      // Skip if ANY entry (pending OR completed) exists for this rule this month
      const alreadyExists = (state.plannedExpenses || []).some(pe =>
        pe.recurringId === r.id && pe.dueDate && pe.dueDate.slice(0, 7) === thisMonthStr
      );
      if (!alreadyExists) {
        const dueDate = dateISO(new Date(today.getFullYear(), today.getMonth(), r.dueDay));
        dispatch({ type: "ADD_PLANNED_EXPENSE", payload: {
          particular: r.particular, amount: r.amount, dueDate,
          categoryId: r.categoryId, accountId: r.accountId,
          note: 'Auto-generated from "' + r.particular + '" recurring rule.',
          recurringId: r.id, status: "pending"
        }});
      }
      dispatch({ type: "TOUCH_RECURRING", id: r.id, date: dateISO(today) });
    }
  }, [state.recurring.length]); // eslint-disable-line

  // Auto-generate monthly planned expenses for active debts
  React.useEffect(() => {
    const today = new Date();
    const thisMonthStr = dateISO(today).slice(0, 7);
    for (const debt of state.debts) {
      if (debt.status !== "active") continue;
      // Check pending AND completed — if either exists, skip (user handled it)
      const alreadyExists = (state.plannedExpenses || []).some(pe =>
        pe.debtId === debt.id && pe.dueDate && pe.dueDate.slice(0, 7) === thisMonthStr
      );
      if (alreadyExists) continue;
      const dueDate = dateISO(new Date(today.getFullYear(), today.getMonth(), debt.dueDay || 1));
      dispatch({ type: "ADD_PLANNED_EXPENSE", payload: {
        particular: "Payment · " + debt.name,
        amount: debt.monthlyPayment,
        dueDate,
        categoryId: (state.categories.find(c => c.id === "cat-debt") || {}).id || null,
        debtId: debt.id,
        note: "Auto-generated debt payment for " + debt.name + ".",
        status: "pending"
      }});
    }
  }, [state.debts.length]); // eslint-disable-line

  // Auto-generate monthly planned expenses for credit minimum payments
  React.useEffect(() => {
    const today = new Date();
    const thisMonthStr = dateISO(today).slice(0, 7);
    for (const credit of state.creditAccounts) {
      if (!credit.balance || credit.balance <= 0) continue;
      // Check pending AND completed — if either exists, skip (user handled it)
      const alreadyExists = (state.plannedExpenses || []).some(pe =>
        pe.creditId === credit.id && pe.dueDate && pe.dueDate.slice(0, 7) === thisMonthStr
      );
      if (alreadyExists) continue;
      const dueDay = credit.dueDay || 1;
      const dueDate = dateISO(new Date(today.getFullYear(), today.getMonth(), dueDay));
      const minPay = credit.minPayment || Math.max(500, Math.round((credit.balance || 0) * 0.05));
      dispatch({ type: "ADD_PLANNED_EXPENSE", payload: {
        particular: "Min pay · " + credit.name,
        amount: minPay,
        dueDate,
        categoryId: (state.categories.find(c => c.id === "cat-debt") || {}).id || null,
        creditId: credit.id,
        note: "Auto-generated credit minimum payment for " + credit.name + ".",
        status: "pending"
      }});
    }
  }, [state.creditAccounts.length]); // eslint-disable-line

  return React.createElement(StoreContext.Provider, { value: { state, actions, computed } }, children);
}

function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

function fmtMoney(n, opts) {
  opts = opts || {};
  if (n == null || isNaN(n)) return "\u2014";
  const dec = opts.dec != null ? opts.dec : 0;
  const sign = n < 0 ? "\u2212" : "";
  const v = Math.abs(n).toLocaleString("en-PH", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  return sign + "\u20B1" + v;
}
function fmtMoneyShort(n) {
  if (n == null || isNaN(n)) return "\u2014";
  const sign = n < 0 ? "\u2212" : "";
  const v = Math.abs(n);
  if (v >= 1000000) return sign + "\u20B1" + (v / 1000000).toFixed(2) + "M";
  if (v >= 1000) return sign + "\u20B1" + (v / 1000).toFixed(1) + "K";
  return sign + "\u20B1" + v.toFixed(0);
}
function fmtPct(n, dec) {
  dec = dec != null ? dec : 1;
  if (n == null || isNaN(n)) return "\u2014";
  return (n * 100).toFixed(dec) + "%";
}
function fmtDate(iso, opts) {
  opts = opts || {};
  if (!iso) return "\u2014";
  const p = iso.split("-");
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  return d.toLocaleDateString("en-PH", { month: opts.month || "short", day: "numeric", year: opts.year ? "numeric" : undefined });
}
function todayISO() { return dateISO(new Date()); }

Object.assign(window, {
  StoreProvider, useStore,
  fmtMoney, fmtMoneyShort, fmtPct, fmtDate, todayISO,
  LS_KEY, APP_VERSION, EMPTY_STATE
});
