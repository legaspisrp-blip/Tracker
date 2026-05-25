// ============================================================================
// store.js — Single source of truth. Context + reducer + localStorage + Supabase.
// KEY CHANGE: All devices share ONE Supabase row keyed by SUPABASE_ROW_ID.
// This means any browser/device will see the same data automatically.
// ============================================================================

const LS_KEY = "ledger:state:v2";
const APP_VERSION = "0.9.0";
const SUPABASE_ROW_ID = "ledger-main"; // ONE shared row for all devices

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
      if (next.creditId) credits = recordCreditTxOnCredits(credits, next, "apply");
      return { ...state, transactions: state.transactions.map(t => t.id === action.id ? next : t), cashAccounts: accs, debts, creditAccounts: credits };
    }
    case "DELETE_TRANSACTION": {
      const prev = state.transactions.find(t => t.id === action.id);
      if (!prev) return state;
      const accs = applyTxToAccounts(state.cashAccounts, prev, "reverse");
      const debts = prev.debtId ? recordDebtTxOnDebts(state.debts, prev, "reverse") : state.debts;
      const credits = prev.creditId ? recordCreditTxOnCredits(state.creditAccounts, prev, "reverse") : state.creditAccounts;
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
function sameMonth(dateStr, y, m) { const d = new Date(dateStr); return d.getFullYear() === y && d.getMonth() === m; }
function lastMonth(m) { return m === 0 ? 11 : m - 1; }
function lastMonthYear(y, m) { return m === 0 ? y - 1 : y; }
function dateISO(d) { return d.toISOString().slice(0, 10); }
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

// ---------------------------------------------------------------------------
// SUPABASE helper
// ---------------------------------------------------------------------------
function getSupabaseClient() {
  try {
    const url = window.SUPABASE_URL;
    const key = window.SUPABASE_ANON_KEY;
    if (!url || !key || url.includes("your-project") || key.includes("your-anon")) return null;
    return window.supabase.createClient(url, key);
  } catch (e) { return null; }
}

// ---------------------------------------------------------------------------
// CONTEXT + PROVIDER + HOOK
// ---------------------------------------------------------------------------
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
  const sbRef = React.useRef(getSupabaseClient());
  const saveTimer = React.useRef(null);

  // Save to localStorage on every state change
  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); }
    catch (e) { console.warn("Ledger: localStorage save failed", e); }
  }, [state]);

  // On mount: load latest data from Supabase shared row
  React.useEffect(() => {
    const sb = sbRef.current;
    if (!sb) return;
    sb.from("user_data")
      .select("data")
      .eq("user_id", SUPABASE_ROW_ID)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { console.warn("Ledger: Supabase load failed", error); return; }
        if (!data || !data.data) { console.log("Ledger: no cloud data yet"); return; }
        const cloudData = { ...data.data };
        delete cloudData.session;
        dispatch({ type: "IMPORT_STATE", payload: cloudData });
        console.log("Ledger: loaded from Supabase \u2713", (cloudData.cashAccounts || []).length, "accounts");
      });
  }, []); // eslint-disable-line

  // Save to Supabase on every state change (debounced 1.5s)
  React.useEffect(() => {
    const sb = sbRef.current;
    if (!sb) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      sb.from("user_data")
        .upsert({ user_id: SUPABASE_ROW_ID, data: state, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
        .then(({ error }) => {
          if (error) console.warn("Ledger: Supabase save failed", error);
        });
    }, 1500);
    return () => clearTimeout(saveTimer.current);
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
    importState: payload => dispatch({ type: "IMPORT_STATE", payload }),
    resetAll: () => dispatch({ type: "RESET_ALL" }),
    backupNow: () => dispatch({ type: "BACKUP_NOW" })
  }), []);

  const computed = React.useMemo(() => computeStats(state), [state]);

  // Auto-generate recurring transactions
  React.useEffect(() => {
    const today = new Date();
    for (const r of state.recurring) {
      if (r.frequency !== "monthly") continue;
      const lg = r.lastGenerated ? new Date(r.lastGenerated) : null;
      const alreadyThisMonth = lg && lg.getFullYear() === today.getFullYear() && lg.getMonth() === today.getMonth();
      if (alreadyThisMonth) continue;
      if (today.getDate() < (r.dueDay || 1)) continue;
      const txDate = new Date(today.getFullYear(), today.getMonth(), r.dueDay);
      dispatch({ type: "ADD_TRANSACTION", payload: { date: dateISO(txDate), particular: r.particular, amount: r.amount, kind: r.kind || "expense", categoryId: r.categoryId, accountId: r.accountId, note: `Auto-generated from "${r.particular}" recurring rule.`, recurringId: r.id } });
      dispatch({ type: "TOUCH_RECURRING", id: r.id, date: dateISO(today) });
    }
  }, [state.recurring.length]); // eslint-disable-line

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
  const d = new Date(iso);
  return d.toLocaleDateString("en-PH", { month: opts.month || "short", day: "numeric", year: opts.year ? "numeric" : undefined });
}
function todayISO() { return dateISO(new Date()); }

Object.assign(window, {
  StoreProvider, useStore,
  fmtMoney, fmtMoneyShort, fmtPct, fmtDate, todayISO,
  LS_KEY, APP_VERSION, EMPTY_STATE
});
