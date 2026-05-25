// ============================================================================
// store.jsx — Single source of truth. Context + reducer + localStorage.
//
// All app data flows through this store. Components use:
//   const { state, actions, computed } = useStore();
//
// Persistence: every state change is written to localStorage under the key
// LS_KEY. To swap in a real backend (Supabase, Firebase), replace the
// persistence layer at the bottom of this file — actions and shape stay.
// ============================================================================

const LS_KEY = "ledger:state:v2";
const APP_VERSION = "0.9.0";

// ---------------------------------------------------------------------------
// SHAPE — the entire app state in one object.
// ---------------------------------------------------------------------------
const EMPTY_STATE = {
  version: APP_VERSION,
  session: {
    role: "owner",
    name: ""
  },
  settings: {
    currency: "PHP",
    locale: "en-PH",
    fxRate: 58.42,
    // USD → PHP
    fxRateUpdated: null,
    accent: "oklch(58% 0.18 145)",
    mode: "light",
    // "light" | "dark"
    variant: "a" // "a" Terminal | "b" Quiet Ledger
  },
  categories: [
  // Defaults — user can add/remove in Settings.
  {
    id: "cat-housing",
    name: "Housing",
    color: "oklch(60% 0.14 240)",
    kind: "expense"
  }, {
    id: "cat-utility",
    name: "Utilities",
    color: "oklch(70% 0.12 200)",
    kind: "expense"
  }, {
    id: "cat-groceries",
    name: "Groceries",
    color: "oklch(64% 0.16 95)",
    kind: "expense"
  }, {
    id: "cat-transport",
    name: "Transport",
    color: "oklch(66% 0.14 160)",
    kind: "expense"
  }, {
    id: "cat-food",
    name: "Food",
    color: "oklch(68% 0.18 50)",
    kind: "expense"
  }, {
    id: "cat-subscription",
    name: "Subscription",
    color: "oklch(68% 0.16 305)",
    kind: "expense"
  }, {
    id: "cat-allowance",
    name: "Allowance",
    color: "oklch(72% 0.14 60)",
    kind: "expense"
  }, {
    id: "cat-debt",
    name: "Debt Payment",
    color: "oklch(56% 0.22 27)",
    kind: "expense"
  }, {
    id: "cat-personal",
    name: "Personal",
    color: "oklch(64% 0.10 320)",
    kind: "expense"
  }, {
    id: "cat-other-exp",
    name: "Other",
    color: "oklch(60% 0.04 280)",
    kind: "expense"
  }, {
    id: "cat-salary",
    name: "Salary",
    color: "oklch(58% 0.18 145)",
    kind: "income"
  }, {
    id: "cat-freelance",
    name: "Freelance",
    color: "oklch(64% 0.16 175)",
    kind: "income"
  }, {
    id: "cat-side",
    name: "Side hustle",
    color: "oklch(66% 0.14 120)",
    kind: "income"
  }, {
    id: "cat-other-inc",
    name: "Other income",
    color: "oklch(60% 0.10 100)",
    kind: "income"
  }],
  cashAccounts: [],
  // { id, name, kind, balance }
  transactions: [],
  // { id, date, particular, amount, kind, categoryId, accountId, note, recurringId?, debtId?, creditId?, currency, logger }
  debts: [],
  // { id, name, originalAmount, monthlyPayment, interestRate, dueDay, startDate, totalMonths, paidMonths, status, note }
  creditAccounts: [],
  // { id, name, limit, balance, dueDay, minPayment, note }
  budgets: [],
  // { id, categoryId, monthlyCap, note }
  goals: [],
  // { id, name, target, saved, deadline, note }
  recurring: [],
  // { id, particular, amount, kind, categoryId, accountId, dueDay, frequency, lastGenerated, note }
  expectedIncome: [],
  // { id, source, amount, currency, expectedDate, confidence }
  notifications: [],
  // dismissed alerts etc.
  lastBackup: null
};

// ---------------------------------------------------------------------------
// REDUCER — all state transitions go through here.
// ---------------------------------------------------------------------------
function reducer(state, action) {
  switch (action.type) {
    // ---- SESSION ----
    case "LOGIN":
      return {
        ...state,
        session: {
          role: action.role,
          name: action.name || ""
        }
      };
    case "LOGOUT":
      return {
        ...state,
        session: {
          role: null,
          name: ""
        }
      };

    // ---- SETTINGS ----
    case "SET_SETTING":
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.key]: action.value
        }
      };

    // ---- CATEGORIES ----
    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, {
          id: uid("cat"),
          ...action.payload
        }]
      };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map(c => c.id === action.id ? {
          ...c,
          ...action.patch
        } : c)
      };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.id)
      };

    // ---- CASH ACCOUNTS ----
    case "ADD_CASH_ACCOUNT":
      return {
        ...state,
        cashAccounts: [...state.cashAccounts, {
          id: uid("acct"),
          balance: 0,
          ...action.payload
        }]
      };
    case "UPDATE_CASH_ACCOUNT":
      return {
        ...state,
        cashAccounts: state.cashAccounts.map(a => a.id === action.id ? {
          ...a,
          ...action.patch
        } : a)
      };
    case "DELETE_CASH_ACCOUNT":
      return {
        ...state,
        cashAccounts: state.cashAccounts.filter(a => a.id !== action.id)
      };

    // ---- TRANSACTIONS ----
    case "ADD_TRANSACTION":
      {
        const tx = {
          id: uid("tx"),
          createdAt: Date.now(),
          logger: state.session.role || "system",
          ...action.payload
        };
        const updatedAccounts = applyTxToAccounts(state.cashAccounts, tx, "apply");
        let updatedDebts = state.debts;
        if (tx.debtId) updatedDebts = recordDebtTxOnDebts(state.debts, tx, "apply");
        let updatedCreds = state.creditAccounts;
        if (tx.creditId) updatedCreds = recordCreditTxOnCredits(state.creditAccounts, tx, "apply");
        return {
          ...state,
          transactions: [...state.transactions, tx],
          cashAccounts: updatedAccounts,
          debts: updatedDebts,
          creditAccounts: updatedCreds
        };
      }
    case "UPDATE_TRANSACTION":
      {
        const prev = state.transactions.find(t => t.id === action.id);
        if (!prev) return state;
        const next = {
          ...prev,
          ...action.patch
        };
        // Reverse old, apply new
        let accs = applyTxToAccounts(state.cashAccounts, prev, "reverse");
        accs = applyTxToAccounts(accs, next, "apply");
        let debts = prev.debtId ? recordDebtTxOnDebts(state.debts, prev, "reverse") : state.debts;
        if (next.debtId) debts = recordDebtTxOnDebts(debts, next, "apply");
        let credits = prev.creditId ? recordCreditTxOnCredits(state.creditAccounts, prev, "reverse") : state.creditAccounts;
        if (next.creditId) credits = recordCreditTxOnCredits(credits, next, "apply");
        return {
          ...state,
          transactions: state.transactions.map(t => t.id === action.id ? next : t),
          cashAccounts: accs,
          debts,
          creditAccounts: credits
        };
      }
    case "DELETE_TRANSACTION":
      {
        const prev = state.transactions.find(t => t.id === action.id);
        if (!prev) return state;
        const accs = applyTxToAccounts(state.cashAccounts, prev, "reverse");
        const debts = prev.debtId ? recordDebtTxOnDebts(state.debts, prev, "reverse") : state.debts;
        const credits = prev.creditId ? recordCreditTxOnCredits(state.creditAccounts, prev, "reverse") : state.creditAccounts;
        return {
          ...state,
          transactions: state.transactions.filter(t => t.id !== action.id),
          cashAccounts: accs,
          debts,
          creditAccounts: credits
        };
      }

    // ---- DEBTS ----
    case "ADD_DEBT":
      return {
        ...state,
        debts: [...state.debts, {
          id: uid("debt"),
          paidMonths: 0,
          status: "active",
          ...action.payload
        }]
      };
    case "UPDATE_DEBT":
      return {
        ...state,
        debts: state.debts.map(d => d.id === action.id ? {
          ...d,
          ...action.patch
        } : d)
      };
    case "DELETE_DEBT":
      // Disassociate any tx that referenced this debt
      return {
        ...state,
        debts: state.debts.filter(d => d.id !== action.id),
        transactions: state.transactions.map(t => t.debtId === action.id ? {
          ...t,
          debtId: null
        } : t)
      };

    // ---- CREDIT ACCOUNTS ----
    case "ADD_CREDIT":
      return {
        ...state,
        creditAccounts: [...state.creditAccounts, {
          id: uid("cred"),
          balance: 0,
          ...action.payload
        }]
      };
    case "UPDATE_CREDIT":
      return {
        ...state,
        creditAccounts: state.creditAccounts.map(c => c.id === action.id ? {
          ...c,
          ...action.patch
        } : c)
      };
    case "DELETE_CREDIT":
      return {
        ...state,
        creditAccounts: state.creditAccounts.filter(c => c.id !== action.id),
        transactions: state.transactions.map(t => t.creditId === action.id ? {
          ...t,
          creditId: null
        } : t)
      };

    // ---- BUDGETS ----
    case "ADD_BUDGET":
      return {
        ...state,
        budgets: [...state.budgets, {
          id: uid("bud"),
          ...action.payload
        }]
      };
    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map(b => b.id === action.id ? {
          ...b,
          ...action.patch
        } : b)
      };
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter(b => b.id !== action.id)
      };

    // ---- GOALS ----
    case "ADD_GOAL":
      return {
        ...state,
        goals: [...state.goals, {
          id: uid("goal"),
          saved: 0,
          ...action.payload
        }]
      };
    case "UPDATE_GOAL":
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.id ? {
          ...g,
          ...action.patch
        } : g)
      };
    case "CONTRIBUTE_GOAL":
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.id ? {
          ...g,
          saved: (g.saved || 0) + action.amount
        } : g)
      };
    case "DELETE_GOAL":
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.id)
      };

    // ---- RECURRING ----
    case "ADD_RECURRING":
      return {
        ...state,
        recurring: [...state.recurring, {
          id: uid("rec"),
          lastGenerated: null,
          ...action.payload
        }]
      };
    case "UPDATE_RECURRING":
      return {
        ...state,
        recurring: state.recurring.map(r => r.id === action.id ? {
          ...r,
          ...action.patch
        } : r)
      };
    case "DELETE_RECURRING":
      return {
        ...state,
        recurring: state.recurring.filter(r => r.id !== action.id)
      };
    case "TOUCH_RECURRING":
      return {
        ...state,
        recurring: state.recurring.map(r => r.id === action.id ? {
          ...r,
          lastGenerated: action.date
        } : r)
      };

    // ---- EXPECTED INCOME (Forecast) ----
    case "ADD_EXPECTED":
      return {
        ...state,
        expectedIncome: [...state.expectedIncome, {
          id: uid("exp"),
          confidence: "medium",
          ...action.payload
        }]
      };
    case "UPDATE_EXPECTED":
      return {
        ...state,
        expectedIncome: state.expectedIncome.map(e => e.id === action.id ? {
          ...e,
          ...action.patch
        } : e)
      };
    case "DELETE_EXPECTED":
      return {
        ...state,
        expectedIncome: state.expectedIncome.filter(e => e.id !== action.id)
      };

    // ---- DATA OPS ----
    case "IMPORT_STATE":
      return {
        ...EMPTY_STATE,
        ...action.payload,
        session: state.session
      };
    case "RESET_ALL":
      return {
        ...EMPTY_STATE,
        session: state.session
      };
    case "BACKUP_NOW":
      return {
        ...state,
        lastBackup: Date.now()
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Helpers used by the reducer
// ---------------------------------------------------------------------------
function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// Adjust account balances when a transaction is applied or reversed.
// - income: + on the linked account
// - expense / debt-pay / credit-pay: − on the linked account
function applyTxToAccounts(accounts, tx, direction) {
  if (!tx.accountId) return accounts;
  const sign = direction === "apply" ? 1 : -1;
  const delta = (tx.kind === "income" ? +tx.amount : -tx.amount) * sign;
  return accounts.map(a => a.id === tx.accountId ? {
    ...a,
    balance: round2((a.balance || 0) + delta)
  } : a);
}

// Adjust paidMonths on a debt when a debt-payment tx is applied or reversed.
function recordDebtTxOnDebts(debts, tx, direction) {
  const delta = direction === "apply" ? 1 : -1;
  return debts.map(d => {
    if (d.id !== tx.debtId) return d;
    const paidMonths = Math.max(0, (d.paidMonths || 0) + delta);
    const status = paidMonths >= (d.totalMonths || Infinity) ? "done" : "active";
    return {
      ...d,
      paidMonths,
      status
    };
  });
}

// Adjust credit-account balance when a credit-payment tx is applied or reversed.
// A credit-payment REDUCES the outstanding balance on the credit line.
function recordCreditTxOnCredits(credits, tx, direction) {
  const sign = direction === "apply" ? 1 : -1;
  return credits.map(c => {
    if (c.id !== tx.creditId) return c;
    const newBal = Math.max(0, round2((c.balance || 0) - tx.amount * sign));
    return {
      ...c,
      balance: newBal
    };
  });
}
function round2(n) {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// COMPUTED — derived values. Recomputed every render via useMemo in the hook.
// All computations work against current state — never stale.
// ---------------------------------------------------------------------------
function computeStats(state, options = {}) {
  const now = options.now || new Date();
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

  // Debt
  const activeDebts = state.debts.filter(d => d.status === "active");
  const monthlyDebtObligation = activeDebts.reduce((s, d) => s + (d.monthlyPayment || 0), 0);
  const remainingPrincipal = activeDebts.reduce((s, d) => s + (d.monthlyPayment || 0) * Math.max(0, (d.totalMonths || 0) - (d.paidMonths || 0)), 0);
  const totalPrincipal = state.debts.reduce((s, d) => s + (d.monthlyPayment || 0) * (d.totalMonths || 0), 0);
  const paidPrincipal = state.debts.reduce((s, d) => s + (d.monthlyPayment || 0) * (d.paidMonths || 0), 0);
  const debtPaidPct = totalPrincipal ? paidPrincipal / totalPrincipal : 0;

  // Credit
  const totalCreditLimit = state.creditAccounts.reduce((s, c) => s + (c.limit || 0), 0);
  const totalCreditUsed = state.creditAccounts.reduce((s, c) => s + (c.balance || 0), 0);
  const creditUtilization = totalCreditLimit ? totalCreditUsed / totalCreditLimit : 0;

  // By category (this month, expenses only)
  const byCategory = {};
  for (const t of thisMonthTxs) {
    if (t.kind !== "expense") continue;
    const id = t.categoryId || "uncategorized";
    byCategory[id] = (byCategory[id] || 0) + t.amount;
  }
  const byCategorySorted = Object.entries(byCategory).map(([id, amt]) => ({
    categoryId: id,
    amount: amt,
    category: state.categories.find(c => c.id === id)
  })).sort((a, b) => b.amount - a.amount);

  // Budget pacing
  const budgetStats = state.budgets.map(b => {
    const spent = byCategory[b.categoryId] || 0;
    const cat = state.categories.find(c => c.id === b.categoryId);
    return {
      ...b,
      spent,
      cap: b.monthlyCap,
      pct: b.monthlyCap ? spent / b.monthlyCap : 0,
      remaining: b.monthlyCap - spent,
      category: cat
    };
  });

  // Cash safety
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const dailyBurn = dayOfMonth ? monthExpense / dayOfMonth : 0;
  const survivalDays = dailyBurn ? Math.floor(cashOnHand / dailyBurn) : null;

  // Upcoming bills (next 30 days from "today" = end of dataset or real today)
  const upcoming = buildUpcoming(state, now);

  // Health score (only when there is enough data)
  const health = computeHealth({
    monthIncome,
    monthExpense,
    monthlyDebtObligation,
    cashOnHand,
    dailyBurn,
    creditUtilization,
    savingsRate
  });
  return {
    now,
    year,
    month,
    cashOnHand,
    monthIncome,
    monthExpense,
    net,
    savingsRate,
    lastMonthIncome,
    lastMonthExpense,
    incomeTrend,
    expenseTrend,
    activeDebts,
    monthlyDebtObligation,
    remainingPrincipal,
    totalPrincipal,
    paidPrincipal,
    debtPaidPct,
    totalCreditLimit,
    totalCreditUsed,
    creditUtilization,
    byCategory: byCategorySorted,
    budgetStats,
    dailyBurn,
    survivalDays,
    daysInMonth,
    dayOfMonth,
    upcoming,
    health,
    transactionsThisMonth: thisMonthTxs,
    transactionsLastMonth: lastMonthTxs,
    isEmpty: state.transactions.length === 0 && state.debts.length === 0 && state.creditAccounts.length === 0 && state.cashAccounts.length === 0
  };
}
function sumKind(txs, kind) {
  return txs.filter(t => t.kind === kind).reduce((s, t) => s + t.amount, 0);
}
function sameMonth(dateStr, y, m) {
  const d = new Date(dateStr);
  return d.getFullYear() === y && d.getMonth() === m;
}
function lastMonth(m) {
  return m === 0 ? 11 : m - 1;
}
function lastMonthYear(y, m) {
  return m === 0 ? y - 1 : y;
}
function buildUpcoming(state, now) {
  const items = [];
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  for (let offset = 0; offset < 60; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    // Debts due on this day-of-month
    for (const debt of state.debts) {
      if (debt.status !== "active") continue;
      if (debt.dueDay === d.getDate()) {
        items.push({
          id: `debt-${debt.id}-${offset}`,
          date: dateISO(d),
          label: debt.name,
          amount: debt.monthlyPayment,
          kind: "debt",
          refId: debt.id,
          daysOut: offset
        });
      }
    }
    // Recurring on this day-of-month
    for (const r of state.recurring) {
      if (r.frequency !== "monthly") continue;
      if (r.dueDay === d.getDate()) {
        items.push({
          id: `rec-${r.id}-${offset}`,
          date: dateISO(d),
          label: r.particular,
          amount: r.amount,
          kind: r.kind || "expense",
          categoryId: r.categoryId,
          refId: r.id,
          daysOut: offset
        });
      }
    }
    // Credit minimums (treat dueDay as billing close)
    for (const c of state.creditAccounts) {
      if (c.dueDay === d.getDate() && (c.balance || 0) > 0) {
        items.push({
          id: `cred-${c.id}-${offset}`,
          date: dateISO(d),
          label: `${c.name} · min pay`,
          amount: c.minPayment || Math.min(c.balance, c.balance * 0.05),
          kind: "credit",
          refId: c.id,
          daysOut: offset
        });
      }
    }
  }
  return items;
}
function dateISO(d) {
  return d.toISOString().slice(0, 10);
}

// Health score 0-100, weighted: DTI 35 / Savings 25 / Reserve 25 / Util 15
function computeHealth({
  monthIncome,
  monthExpense,
  monthlyDebtObligation,
  cashOnHand,
  dailyBurn,
  creditUtilization,
  savingsRate
}) {
  if (!monthIncome && !monthExpense && !cashOnHand) return null;
  const dti = monthIncome ? monthlyDebtObligation / monthIncome : 1;
  const reserveMonths = dailyBurn ? cashOnHand / (dailyBurn * 30) : 0;
  const dtiScore = Math.max(0, 100 - dti / 0.36 * 100);
  const savingsScore = savingsRate != null ? Math.min(100, Math.max(0, savingsRate * 250)) : 50;
  const reserveScore = Math.min(100, reserveMonths / 3 * 100);
  const utilScore = Math.max(0, 100 - creditUtilization * 333);
  const composite = Math.round(dtiScore * 0.35 + savingsScore * 0.25 + reserveScore * 0.25 + utilScore * 0.15);
  let rating = "At risk";
  if (composite >= 75) rating = "Strong";else if (composite >= 55) rating = "Stable";else if (composite >= 40) rating = "Stretched";
  return {
    composite,
    rating,
    dti,
    reserveMonths,
    savingsRate,
    creditUtilization,
    dtiScore,
    savingsScore,
    reserveScore,
    utilScore
  };
}

// ---------------------------------------------------------------------------
// CONTEXT + PROVIDER + HOOK
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// SUPABASE — optional cloud sync. Works only when supabase-config.js is filled.
// Falls back to localStorage-only if credentials are missing.
// ---------------------------------------------------------------------------
const DEVICE_ID_KEY = "ledger:device-id";

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = "device_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function getSupabaseClient() {
  try {
    const url = window.SUPABASE_URL;
    const key = window.SUPABASE_ANON_KEY;
    if (!url || !key || url.includes("your-project") || key.includes("your-anon")) return null;
    return window.supabase.createClient(url, key);
  } catch (e) {
    return null;
  }
}

const StoreContext = React.createContext(null);
function loadInitial() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY_STATE,
      ...parsed,
      session: { role: "owner", name: parsed.session?.name || "" }
    };
  } catch (e) {
    console.warn("Ledger: failed to load saved state", e);
    return EMPTY_STATE;
  }
}
function StoreProvider({
  children
}) {
  const [state, dispatch] = React.useReducer(reducer, undefined, loadInitial);
  const supabaseRef = React.useRef(getSupabaseClient());
  const deviceId = React.useRef(getDeviceId());
  const saveTimerRef = React.useRef(null);

  // Persist to localStorage on every change
  React.useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Ledger: failed to persist state", e);
    }
  }, [state]);

  // Load from Supabase on first mount (overrides localStorage if cloud is newer)
  React.useEffect(() => {
    const sb = supabaseRef.current;
    if (!sb) return;
    sb.from("user_data")
      .select("data, updated_at")
      .eq("user_id", deviceId.current)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return; // no cloud data yet, that's fine
        dispatch({ type: "IMPORT_STATE", payload: data.data });
        console.log("Ledger: loaded from Supabase ✓");
      });
  // eslint-disable-next-line
  }, []);

  // Save to Supabase on every state change (debounced 1.5s)
  React.useEffect(() => {
    const sb = supabaseRef.current;
    if (!sb) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      sb.from("user_data")
        .upsert({
          user_id: deviceId.current,
          data: state,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" })
        .then(({ error }) => {
          if (error) console.warn("Ledger: Supabase save failed", error);
        });
    }, 1500);
    return () => clearTimeout(saveTimerRef.current);
  }, [state]);

  // ---- Actions (stable references would be nice but we recompute; cheap) ----
  const actions = React.useMemo(() => ({
    // session
    login: (role, name) => dispatch({
      type: "LOGIN",
      role,
      name
    }),
    logout: () => dispatch({
      type: "LOGOUT"
    }),
    // settings
    setSetting: (key, value) => dispatch({
      type: "SET_SETTING",
      key,
      value
    }),
    // categories
    addCategory: p => dispatch({
      type: "ADD_CATEGORY",
      payload: p
    }),
    updateCategory: (id, patch) => dispatch({
      type: "UPDATE_CATEGORY",
      id,
      patch
    }),
    deleteCategory: id => dispatch({
      type: "DELETE_CATEGORY",
      id
    }),
    // cash accounts
    addCashAccount: p => dispatch({
      type: "ADD_CASH_ACCOUNT",
      payload: p
    }),
    updateCashAccount: (id, patch) => dispatch({
      type: "UPDATE_CASH_ACCOUNT",
      id,
      patch
    }),
    deleteCashAccount: id => dispatch({
      type: "DELETE_CASH_ACCOUNT",
      id
    }),
    // transactions
    addTransaction: p => dispatch({
      type: "ADD_TRANSACTION",
      payload: p
    }),
    updateTransaction: (id, patch) => dispatch({
      type: "UPDATE_TRANSACTION",
      id,
      patch
    }),
    deleteTransaction: id => dispatch({
      type: "DELETE_TRANSACTION",
      id
    }),
    // debts
    addDebt: p => dispatch({
      type: "ADD_DEBT",
      payload: p
    }),
    updateDebt: (id, patch) => dispatch({
      type: "UPDATE_DEBT",
      id,
      patch
    }),
    deleteDebt: id => dispatch({
      type: "DELETE_DEBT",
      id
    }),
    // credit
    addCredit: p => dispatch({
      type: "ADD_CREDIT",
      payload: p
    }),
    updateCredit: (id, patch) => dispatch({
      type: "UPDATE_CREDIT",
      id,
      patch
    }),
    deleteCredit: id => dispatch({
      type: "DELETE_CREDIT",
      id
    }),
    // budgets
    addBudget: p => dispatch({
      type: "ADD_BUDGET",
      payload: p
    }),
    updateBudget: (id, patch) => dispatch({
      type: "UPDATE_BUDGET",
      id,
      patch
    }),
    deleteBudget: id => dispatch({
      type: "DELETE_BUDGET",
      id
    }),
    // goals
    addGoal: p => dispatch({
      type: "ADD_GOAL",
      payload: p
    }),
    updateGoal: (id, patch) => dispatch({
      type: "UPDATE_GOAL",
      id,
      patch
    }),
    contributeGoal: (id, amount) => dispatch({
      type: "CONTRIBUTE_GOAL",
      id,
      amount
    }),
    deleteGoal: id => dispatch({
      type: "DELETE_GOAL",
      id
    }),
    // recurring
    addRecurring: p => dispatch({
      type: "ADD_RECURRING",
      payload: p
    }),
    updateRecurring: (id, patch) => dispatch({
      type: "UPDATE_RECURRING",
      id,
      patch
    }),
    deleteRecurring: id => dispatch({
      type: "DELETE_RECURRING",
      id
    }),
    touchRecurring: (id, date) => dispatch({
      type: "TOUCH_RECURRING",
      id,
      date
    }),
    // expected income
    addExpected: p => dispatch({
      type: "ADD_EXPECTED",
      payload: p
    }),
    updateExpected: (id, patch) => dispatch({
      type: "UPDATE_EXPECTED",
      id,
      patch
    }),
    deleteExpected: id => dispatch({
      type: "DELETE_EXPECTED",
      id
    }),
    // data ops
    importState: payload => dispatch({
      type: "IMPORT_STATE",
      payload
    }),
    resetAll: () => dispatch({
      type: "RESET_ALL"
    }),
    backupNow: () => dispatch({
      type: "BACKUP_NOW"
    })
  }), []);

  // Computed slice (recomputed on every state change)
  const computed = React.useMemo(() => computeStats(state), [state]);

  // Auto-generate recurring transactions whose dueDay <= today and not yet generated this month.
  // Runs whenever recurring rules change or on first mount.
  React.useEffect(() => {
    const today = new Date();
    let dispatched = false;
    for (const r of state.recurring) {
      if (r.frequency !== "monthly") continue;
      const lg = r.lastGenerated ? new Date(r.lastGenerated) : null;
      const alreadyThisMonth = lg && lg.getFullYear() === today.getFullYear() && lg.getMonth() === today.getMonth();
      if (alreadyThisMonth) continue;
      if (today.getDate() < (r.dueDay || 1)) continue;
      // Generate
      const txDate = new Date(today.getFullYear(), today.getMonth(), r.dueDay);
      dispatch({
        type: "ADD_TRANSACTION",
        payload: {
          date: dateISO(txDate),
          particular: r.particular,
          amount: r.amount,
          kind: r.kind || "expense",
          categoryId: r.categoryId,
          accountId: r.accountId,
          note: `Auto-generated from "${r.particular}" recurring rule.`,
          recurringId: r.id
        }
      });
      dispatch({
        type: "TOUCH_RECURRING",
        id: r.id,
        date: dateISO(today)
      });
      dispatched = true;
    }
    // eslint-disable-next-line
  }, [state.recurring.length]);
  return /*#__PURE__*/React.createElement(StoreContext.Provider, {
    value: {
      state,
      actions,
      computed
    }
  }, children);
}
function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Currency / number formatters (kept here because they need state.settings)
// ---------------------------------------------------------------------------
function fmtMoney(n, opts = {}) {
  if (n == null || isNaN(n)) return "—";
  const dec = opts.dec ?? 0;
  const sign = n < 0 ? "−" : "";
  const v = Math.abs(n).toLocaleString("en-PH", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });
  return `${sign}₱${v}`;
}
function fmtMoneyShort(n) {
  if (n == null || isNaN(n)) return "—";
  const sign = n < 0 ? "−" : "";
  const v = Math.abs(n);
  if (v >= 1_000_000) return `${sign}₱${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${sign}₱${(v / 1_000).toFixed(1)}K`;
  return `${sign}₱${v.toFixed(0)}`;
}
function fmtPct(n, dec = 1) {
  if (n == null || isNaN(n)) return "—";
  return `${(n * 100).toFixed(dec)}%`;
}

// Date formatters
function fmtDate(iso, opts = {}) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-PH", {
    month: opts.month || "short",
    day: "numeric",
    year: opts.year ? "numeric" : undefined
  });
}
function todayISO() {
  return dateISO(new Date());
}
Object.assign(window, {
  StoreProvider,
  useStore,
  fmtMoney,
  fmtMoneyShort,
  fmtPct,
  fmtDate,
  todayISO,
  LS_KEY,
  APP_VERSION,
  EMPTY_STATE
});
