// ============================================================================
// screens-settings.jsx — Settings screen: profile, accounts, categories, data ops
// ============================================================================

function SettingsScreen() {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  const [section, setSection] = useState("profile");
  const sections = [{
    id: "profile",
    label: "Profile"
  }, {
    id: "appearance",
    label: "Appearance"
  }, {
    id: "categories",
    label: "Categories"
  }, {
    id: "accounts",
    label: "Cash accounts"
  }, {
    id: "data",
    label: "Data"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      display: "grid",
      gridTemplateColumns: "200px 1fr",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Panel, null, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 1,
      padding: 8
    }
  }, sections.map(s => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    onClick: () => setSection(s.id),
    style: {
      all: "unset",
      cursor: "pointer",
      padding: "8px 10px",
      fontSize: 12.5,
      background: section === s.id ? "var(--panel-alt)" : "transparent",
      color: section === s.id ? "var(--text)" : "var(--muted)",
      fontWeight: section === s.id ? 600 : 500,
      borderRadius: "var(--radius)"
    }
  }, s.label)))), /*#__PURE__*/React.createElement("div", null, section === "profile" && /*#__PURE__*/React.createElement(ProfileSection, null), section === "appearance" && /*#__PURE__*/React.createElement(AppearanceSection, null), section === "categories" && /*#__PURE__*/React.createElement(CategoriesSection, null), section === "accounts" && /*#__PURE__*/React.createElement(AccountsSection, null), section === "data" && /*#__PURE__*/React.createElement(DataSection, null), section === "team" && /*#__PURE__*/React.createElement(TeamSection, null)));
}
function ProfileSection() {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  const [name, setName] = useState(state.session.name || "");
  return /*#__PURE__*/React.createElement(Panel, {
    title: "Profile"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      maxWidth: 500
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Role"
  }, /*#__PURE__*/React.createElement("div", {
    style: inputStyle
  }, state.session.role === "owner" ? "Owner · Admin" : "Assistant · Limited")), /*#__PURE__*/React.createElement(Field, {
    label: "Display name"
  }, /*#__PURE__*/React.createElement(Input, {
    value: name,
    onChange: setName,
    placeholder: "Your name"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => {
      actions.login(state.session.role, name);
      toast("Profile updated.", "success");
    }
  }, "Save"))));
}
function AppearanceSection() {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  return /*#__PURE__*/React.createElement(Panel, {
    title: "Appearance"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      maxWidth: 540
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Mode"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, ["light", "dark"].map(m => /*#__PURE__*/React.createElement("button", {
    key: m,
    onClick: () => actions.setSetting("mode", m),
    style: {
      all: "unset",
      cursor: "pointer",
      padding: "10px 18px",
      border: `1px solid ${state.settings.mode === m ? "var(--accent)" : "var(--border)"}`,
      background: state.settings.mode === m ? "var(--accent-soft)" : "var(--panel-alt)",
      borderRadius: "var(--radius)",
      fontSize: 13,
      fontWeight: 600,
      textTransform: "capitalize",
      color: state.settings.mode === m ? "var(--accent)" : "var(--text)"
    }
  }, m)))), /*#__PURE__*/React.createElement(Field, {
    label: "Variant",
    hint: "Visual treatment \u2014 affects fonts, corners, and tone"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8
    }
  }, [{
    id: "a",
    label: "Terminal",
    sub: "Mono numerals · hairlines"
  }, {
    id: "b",
    label: "Quiet Ledger",
    sub: "Serif headlines · soft"
  }].map(v => /*#__PURE__*/React.createElement("button", {
    key: v.id,
    onClick: () => actions.setSetting("variant", v.id),
    style: {
      all: "unset",
      cursor: "pointer",
      flex: 1,
      padding: 14,
      border: `1px solid ${state.settings.variant === v.id ? "var(--accent)" : "var(--border)"}`,
      background: state.settings.variant === v.id ? "var(--accent-soft)" : "var(--panel-alt)",
      borderRadius: "var(--radius)",
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 14,
      color: state.settings.variant === v.id ? "var(--accent)" : "var(--text)"
    }
  }, v.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)"
    }
  }, v.sub))))), /*#__PURE__*/React.createElement(Field, {
    label: "Accent color"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      flexWrap: "wrap"
    }
  }, ["oklch(58% 0.18 145)", "oklch(62% 0.22 28)", "oklch(66% 0.18 235)", "oklch(70% 0.18 75)", "oklch(58% 0.14 40)", "oklch(60% 0.16 305)"].map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => actions.setSetting("accent", c),
    style: {
      all: "unset",
      cursor: "pointer",
      width: 32,
      height: 32,
      background: c,
      border: state.settings.accent === c ? "2px solid var(--text)" : "2px solid var(--border)",
      borderRadius: "var(--radius)"
    },
    title: c
  }))))));
}
function CategoriesSection() {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState("expense");
  const [newColor, setNewColor] = useState("oklch(60% 0.12 180)");
  const [confirmDel, setConfirmDel] = useState(null);
  const [editing, setEditing] = useState(null);
  const add = () => {
    if (!newName) {
      toast("Name required.", "error");
      return;
    }
    actions.addCategory({
      name: newName,
      kind: newKind,
      color: newColor
    });
    toast("Category added.", "success");
    setNewName("");
  };
  return /*#__PURE__*/React.createElement(Panel, {
    title: `Categories · ${state.categories.length}`
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 130px 100px auto",
      gap: 8,
      alignItems: "end"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "New category name"
  }, /*#__PURE__*/React.createElement(Input, {
    value: newName,
    onChange: setNewName,
    placeholder: "e.g. Pets \xB7 Health \xB7 Coffee"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Kind"
  }, /*#__PURE__*/React.createElement(Select, {
    value: newKind,
    onChange: setNewKind,
    options: [{
      value: "expense",
      label: "Expense"
    }, {
      value: "income",
      label: "Income"
    }]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Color"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: newColor,
    onChange: e => setNewColor(e.target.value),
    style: {
      ...inputStyle,
      fontSize: 11
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: ICONS.plus,
    onClick: add
  }, "Add")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6
    }
  }, state.categories.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 10px",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      fontSize: 12,
      fontWeight: 500
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      background: c.color
    }
  }), c.name, /*#__PURE__*/React.createElement(Chip, {
    style: {
      marginLeft: 4
    }
  }, c.kind), /*#__PURE__*/React.createElement(IconBtn, {
    icon: ICONS.edit,
    onClick: () => setEditing(c),
    title: "Edit"
  }), /*#__PURE__*/React.createElement(IconBtn, {
    icon: ICONS.trash,
    onClick: () => setConfirmDel(c),
    title: "Delete",
    danger: true
  }))))), /*#__PURE__*/React.createElement(ConfirmDialog, {
    open: !!confirmDel,
    onClose: () => setConfirmDel(null),
    title: "Delete category?",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Remove ", /*#__PURE__*/React.createElement("strong", null, confirmDel?.name), "? Transactions using it become uncategorized."),
    confirmLabel: "Delete",
    danger: true,
    onConfirm: () => {
      actions.deleteCategory(confirmDel.id);
      toast("Deleted.", "success");
    }
  }), /*#__PURE__*/React.createElement(CategoryEditModal, {
    open: !!editing,
    onClose: () => setEditing(null),
    category: editing
  }));
}
function CategoryEditModal({
  open,
  onClose,
  category
}) {
  const {
    actions
  } = useStore();
  const toast = useToast();
  const [form, setForm] = useState(category || {
    name: "",
    color: "",
    kind: "expense"
  });
  useEffect(() => {
    if (open) setForm(category);
  }, [open, category?.id]);
  if (!category) return null;
  const save = () => {
    actions.updateCategory(category.id, {
      name: form.name,
      color: form.color,
      kind: form.kind
    });
    toast("Updated.", "success");
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: "Edit category",
    width: 420,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: save
    }, "Save"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Name"
  }, /*#__PURE__*/React.createElement(Input, {
    value: form.name,
    onChange: v => setForm({
      ...form,
      name: v
    })
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Color (CSS)"
  }, /*#__PURE__*/React.createElement(Input, {
    value: form.color,
    onChange: v => setForm({
      ...form,
      color: v
    })
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Kind"
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.kind,
    onChange: v => setForm({
      ...form,
      kind: v
    }),
    options: [{
      value: "expense",
      label: "Expense"
    }, {
      value: "income",
      label: "Income"
    }]
  }))));
}
function AccountsSection() {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [edit, setEdit] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  return /*#__PURE__*/React.createElement(Panel, {
    title: `Cash accounts · ${state.cashAccounts.length}`,
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: ICONS.plus,
      onClick: () => setShowAdd(true)
    }, "Add account")
  }, state.cashAccounts.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: ICONS.cash,
    title: "No accounts yet",
    body: "Add bank accounts, wallets, or cash buckets to track balances.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: ICONS.plus,
      onClick: () => setShowAdd(true)
    }, "Add your first account"),
    padding: 50
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
  }, "Account"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px"
    })
  }, "Kind"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }, "Balance"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px",
      align: "right"
    })
  }))), /*#__PURE__*/React.createElement("tbody", null, state.cashAccounts.map(a => /*#__PURE__*/React.createElement("tr", {
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
      pad: "10px 14px"
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
  })), /*#__PURE__*/React.createElement("td", {
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
    onClick: () => setEdit(a)
  }), /*#__PURE__*/React.createElement(IconBtn, {
    icon: ICONS.trash,
    onClick: () => setConfirmDel(a),
    danger: true
  }))))))), /*#__PURE__*/React.createElement(AccountForm, {
    open: showAdd || !!edit,
    onClose: () => {
      setShowAdd(false);
      setEdit(null);
    },
    account: edit
  }), /*#__PURE__*/React.createElement(ConfirmDialog, {
    open: !!confirmDel,
    onClose: () => setConfirmDel(null),
    title: "Delete account?",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "Remove ", /*#__PURE__*/React.createElement("strong", null, confirmDel?.name), "? Linked transactions stay but lose their account reference."),
    confirmLabel: "Delete",
    danger: true,
    onConfirm: () => {
      actions.deleteCashAccount(confirmDel.id);
      toast("Account deleted.", "success");
    }
  }));
}
function AccountForm({
  open,
  onClose,
  account
}) {
  const {
    actions
  } = useStore();
  const toast = useToast();
  const editing = !!account;
  const [form, setForm] = useState(account || {
    name: "",
    kind: "bank",
    balance: 0
  });
  useEffect(() => {
    if (open) setForm(account || {
      name: "",
      kind: "bank",
      balance: 0
    });
  }, [open, account?.id]);
  const set = (k, v) => setForm(f => ({
    ...f,
    [k]: v
  }));
  const valid = form.name;
  const save = () => {
    if (!valid) {
      toast("Name required.", "error");
      return;
    }
    const payload = {
      ...form,
      balance: Number(form.balance) || 0
    };
    if (editing) actions.updateCashAccount(account.id, payload);else actions.addCashAccount(payload);
    toast(editing ? "Updated." : "Account added.", "success");
    onClose();
  };
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: editing ? "Edit account" : "Add cash account",
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
    label: "Account name",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    value: form.name,
    onChange: v => set("name", v),
    placeholder: "e.g. BPI Savings \xB7 GCash \xB7 BDO Payroll",
    autoFocus: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Kind"
  }, /*#__PURE__*/React.createElement(Select, {
    value: form.kind,
    onChange: v => set("kind", v),
    options: [{
      value: "bank",
      label: "Bank"
    }, {
      value: "wallet",
      label: "Wallet"
    }, {
      value: "cash",
      label: "Cash"
    }, {
      value: "investment",
      label: "Investment"
    }]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Starting balance (\u20B1)"
  }, /*#__PURE__*/React.createElement(Input, {
    type: "number",
    mono: true,
    step: "0.01",
    min: "0",
    value: form.balance,
    onChange: v => set("balance", v)
  })))));
}
function DataSection() {
  const {
    state,
    actions
  } = useStore();
  const toast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmMigrate, setConfirmMigrate] = useState(false);
  const [migrateResult, setMigrateResult] = useState(null);

  const onMigrateAuto = () => {
    // Find all AUTO-tagged transactions (from old recurring system)
    const autoTxs = state.transactions.filter(t => t.recurringId);
    if (autoTxs.length === 0) {
      toast("No AUTO transactions found to migrate.", "success");
      return;
    }

    const thisMonthStr = todayISO().slice(0, 7);
    let created = 0;
    let skipped = 0;
    let deleted = 0;

    // For each AUTO transaction, check if a planned expense already exists
    autoTxs.forEach(tx => {
      const txMonthStr = tx.date ? tx.date.slice(0, 7) : "";
      const alreadyPlanned = (state.plannedExpenses || []).some(pe =>
        pe.recurringId === tx.recurringId && pe.dueDate && pe.dueDate.slice(0, 7) === txMonthStr
      );

      if (!alreadyPlanned) {
        // Create planned expense from this AUTO transaction
        actions.addPlannedExpense({
          particular: tx.particular,
          amount: tx.amount,
          dueDate: tx.date,
          categoryId: tx.categoryId,
          accountId: tx.accountId,
          recurringId: tx.recurringId,
          note: "Migrated from AUTO transaction.",
          status: "pending"
        });
        created++;
      } else {
        skipped++;
      }

      // Delete the AUTO transaction (reverses balance)
      actions.deleteTransaction(tx.id);
      deleted++;
    });

    setMigrateResult({ deleted, created, skipped });
    toast(`Migrated: ${deleted} AUTO transactions removed, ${created} planned expenses created.`, "success");
    setConfirmMigrate(false);
  };
  const onExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ledger-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    actions.backupNow();
    toast("Backup downloaded.", "success");
  };
  const onImport = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.version) throw new Error("Not a Ledger backup");
        actions.importState(parsed);
        toast("Data restored.", "success");
      } catch (err) {
        toast("Invalid backup file.", "error");
      }
    };
    reader.readAsText(f);
    e.target.value = "";
  };
  const onExportTx = () => {
    if (state.transactions.length === 0) {
      toast("No transactions to export.", "warn");
      return;
    }
    downloadCSV(state.transactions, state);
    toast("CSV exported.", "success");
  };
  return /*#__PURE__*/React.createElement(Panel, {
    title: "Data \xB7 import \xB7 export \xB7 reset"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      maxWidth: 600
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      background: "var(--panel-alt)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: 700
    }
  }, "Storage"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      lineHeight: 1.5
    }
  }, "All your data lives in this browser's localStorage. Nothing is sent anywhere. Back up regularly using the buttons below."), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)"
    }
  }, "Last manual backup: ", state.lastBackup ? new Date(state.lastBackup).toLocaleString() : "never")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: onExport,
    icon: ICONS.download,
    style: {
      justifyContent: "center",
      padding: "10px 14px"
    }
  }, "Backup all data (JSON)"), /*#__PURE__*/React.createElement(Button, {
    onClick: onExportTx,
    icon: ICONS.download,
    style: {
      justifyContent: "center",
      padding: "10px 14px"
    }
  }, "Export transactions (CSV)"), /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      padding: "10px 14px",
      fontSize: 12,
      fontWeight: 600,
      background: "var(--panel)",
      color: "var(--text)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    d: ICONS.upload,
    size: 12
  }), " Restore from backup (JSON)", /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".json",
    onChange: onImport,
    style: {
      display: "none"
    }
  })), /*#__PURE__*/React.createElement(Button, {
    danger: true,
    onClick: () => setConfirmReset(true),
    icon: ICONS.trash,
    style: {
      justifyContent: "center",
      padding: "10px 14px"
    }
  }, "Reset everything")),
  /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 16px",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  },
    /*#__PURE__*/React.createElement("div", {
      style: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }
    }, "Migration"),
    /*#__PURE__*/React.createElement("div", {
      style: { fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }
    }, "Move AUTO-tagged recurring transactions to Expected vs Actual as planned expenses. Run this once after updating to the new system."),
    migrateResult && /*#__PURE__*/React.createElement("div", {
      style: { fontSize: 12, padding: "8px 10px", background: "var(--accent-soft)", borderRadius: "var(--radius)", color: "var(--accent)" }
    }, migrateResult.deleted, " transactions removed · ", migrateResult.created, " planned expenses created · ", migrateResult.skipped, " already existed"),
    /*#__PURE__*/React.createElement(Button, {
      onClick: () => setConfirmMigrate(true),
      icon: ICONS.arrow,
      style: { justifyContent: "center", padding: "10px 14px" }
    }, "Migrate AUTO transactions → planned expenses")
  ), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      background: "var(--panel-alt)",
      border: "1px dashed var(--border)",
      borderRadius: "var(--radius)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: "var(--muted)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      fontWeight: 700,
      marginBottom: 6
    }
  }, "Stats"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, "Transactions: ", /*#__PURE__*/React.createElement(Num, {
    weight: 600
  }, state.transactions.length)), /*#__PURE__*/React.createElement("div", null, "Debts: ", /*#__PURE__*/React.createElement(Num, {
    weight: 600
  }, state.debts.length)), /*#__PURE__*/React.createElement("div", null, "Credit accounts: ", /*#__PURE__*/React.createElement(Num, {
    weight: 600
  }, state.creditAccounts.length)), /*#__PURE__*/React.createElement("div", null, "Cash accounts: ", /*#__PURE__*/React.createElement(Num, {
    weight: 600
  }, state.cashAccounts.length)), /*#__PURE__*/React.createElement("div", null, "Categories: ", /*#__PURE__*/React.createElement(Num, {
    weight: 600
  }, state.categories.length)), /*#__PURE__*/React.createElement("div", null, "Recurring rules: ", /*#__PURE__*/React.createElement(Num, {
    weight: 600
  }, state.recurring.length)), /*#__PURE__*/React.createElement("div", null, "Budgets: ", /*#__PURE__*/React.createElement(Num, {
    weight: 600
  }, state.budgets.length)), /*#__PURE__*/React.createElement("div", null, "Goals: ", /*#__PURE__*/React.createElement(Num, {
    weight: 600
  }, state.goals.length))))), /*#__PURE__*/React.createElement(ConfirmDialog, {
    open: confirmReset,
    onClose: () => setConfirmReset(false),
    title: "Reset everything?",
    body: /*#__PURE__*/React.createElement(React.Fragment, null, "This will delete ", /*#__PURE__*/React.createElement("strong", null, "all"), " transactions, debts, accounts, budgets, goals, recurring rules \u2014 everything except your login. ", /*#__PURE__*/React.createElement("strong", null, "This cannot be undone."), " Consider downloading a backup first."),
    confirmLabel: "Reset all data",
    danger: true,
    onConfirm: () => {
      actions.resetAll();
      toast("All data reset.", "success");
    }
  }));
}

// ---------------------------------------------------------------------------
// TeamSection — manage assistant accounts
// ---------------------------------------------------------------------------
function TeamSection() {
  const { state } = useStore();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwner = state.settings.userRole !== "assistant";

  useEffect(() => {
    if (!isOwner) return;
    sbListUserRoles().then(rows => {
      setMembers(rows);
      setLoading(false);
    });
  }, []);

  const onAdd = async () => {
    if (!email) { toast("Enter an email.", "error"); return; }
    setBusy(true);
    const { data: { user } } = await window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY).auth.getUser();
    const { error } = await sbAddUserRole(email.trim().toLowerCase(), "assistant", user?.id);
    if (error) { toast("Failed to add: " + error.message, "error"); }
    else {
      toast("Assistant added. They can now sign up/log in with that email.", "success");
      setEmail("");
      const rows = await sbListUserRoles();
      setMembers(rows);
    }
    setBusy(false);
  };

  const onRemove = async (memberEmail) => {
    await sbRemoveUserRole(memberEmail);
    toast("Removed.", "success");
    const rows = await sbListUserRoles();
    setMembers(rows);
  };

  if (!isOwner) {
    return /*#__PURE__*/React.createElement(Panel, { title: "Team" },
      /*#__PURE__*/React.createElement(Empty, { icon: ICONS.lock, title: "Owner only", body: "Only the owner can manage team members.", padding: 40 })
    );
  }

  return /*#__PURE__*/React.createElement(Panel, { title: "Team · manage assistants" },
    /*#__PURE__*/React.createElement("div", { style: { padding: 16, display: "flex", flexDirection: "column", gap: 16 } },
      /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", lineHeight: 1.6 } },
        "Add an assistant by their email. They sign up or log in with that email and automatically get limited access — they can add and edit transactions, mark expenses as paid, and send you reports. They cannot delete, see balances, or access analytics."
      ),
      /*#__PURE__*/React.createElement("div", { style: { display: "flex", gap: 8 } },
        /*#__PURE__*/React.createElement(Input, {
          type: "email",
          value: email,
          onChange: setEmail,
          placeholder: "assistant@email.com",
          style: { flex: 1 }
        }),
        /*#__PURE__*/React.createElement(Button, {
          variant: "primary",
          onClick: onAdd,
          disabled: busy || !email
        }, busy ? "Adding…" : "Add assistant")
      ),
      loading
        ? /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } }, "Loading…")
        : members.length === 0
          ? /*#__PURE__*/React.createElement("div", { style: { fontSize: 12, color: "var(--faint)", fontStyle: "italic" } }, "No assistants added yet.")
          : /*#__PURE__*/React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } },
              /*#__PURE__*/React.createElement("thead", null,
                /*#__PURE__*/React.createElement("tr", { style: { fontSize: 9.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--faint)", fontWeight: 600 } },
                  /*#__PURE__*/React.createElement("th", { style: cellStyle({ pad: "8px 14px" }) }, "Email"),
                  /*#__PURE__*/React.createElement("th", { style: cellStyle({ pad: "8px 14px" }) }, "Role"),
                  /*#__PURE__*/React.createElement("th", { style: cellStyle({ pad: "8px 14px", align: "right" }) })
                )
              ),
              /*#__PURE__*/React.createElement("tbody", null,
                members.map(m => /*#__PURE__*/React.createElement("tr", { key: m.id, style: { borderTop: "1px solid var(--border)" } },
                  /*#__PURE__*/React.createElement("td", { style: cellStyle({ pad: "10px 14px", weight: 500 }) }, m.email),
                  /*#__PURE__*/React.createElement("td", { style: cellStyle({ pad: "10px 14px" }) },
                    /*#__PURE__*/React.createElement(Chip, { tone: "muted" }, m.role)
                  ),
                  /*#__PURE__*/React.createElement("td", { style: cellStyle({ pad: "10px 14px", align: "right" }) },
                    /*#__PURE__*/React.createElement(Button, { size: "sm", danger: true, onClick: () => onRemove(m.email) }, "Remove")
                  )
                ))
              )
            )
    )
  );
}

Object.assign(window, {
  SettingsScreen
});
