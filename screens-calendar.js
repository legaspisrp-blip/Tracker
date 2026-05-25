// ============================================================================
// screens-calendar.jsx — Dynamic calendar with month/year nav + agenda view
// ============================================================================

function CalendarScreen() {
  const {
    state,
    computed
  } = useStore();
  const [view, setView] = useState("month"); // "month" | "agenda"
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return {
      year: d.getFullYear(),
      month: d.getMonth()
    };
  });
  const firstDay = new Date(cursor.year, cursor.month, 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7; // Mon-first
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === cursor.year && today.getMonth() === cursor.month;
  const todayDate = today.getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Collect events for this month: recurring + active debts + credit cycles + actual transactions logged in this month
  function eventsFor(day) {
    if (!day) return [];
    const events = [];
    for (const r of state.recurring) {
      if (r.frequency === "monthly" && r.dueDay === day) {
        const cat = state.categories.find(c => c.id === r.categoryId);
        events.push({
          id: "r" + r.id,
          label: r.particular,
          amount: r.amount,
          kind: r.kind,
          color: cat?.color || (r.kind === "income" ? "var(--up)" : "var(--muted)"),
          variant: "recurring"
        });
      }
    }
    for (const dbt of state.debts) {
      if (dbt.status === "active" && dbt.dueDay === day) {
        events.push({
          id: "d" + dbt.id,
          label: dbt.name,
          amount: dbt.monthlyPayment,
          kind: "expense",
          color: "var(--down)",
          variant: "debt"
        });
      }
    }
    for (const c of state.creditAccounts) {
      if (c.dueDay === day && (c.balance || 0) > 0) {
        events.push({
          id: "c" + c.id,
          label: `${c.name} · close`,
          amount: c.minPayment || 0,
          kind: "expense",
          color: "var(--warn)",
          variant: "credit"
        });
      }
    }
    // Actual transactions on this day
    const dateStr = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    for (const t of state.transactions) {
      if (t.date === dateStr) {
        const cat = state.categories.find(c => c.id === t.categoryId);
        events.push({
          id: "t" + t.id,
          label: t.particular,
          amount: t.amount,
          kind: t.kind,
          color: cat?.color || (t.kind === "income" ? "var(--up)" : "var(--muted)"),
          variant: "actual"
        });
      }
    }
    return events;
  }
  function shift(deltaMonths) {
    setCursor(c => {
      let m = c.month + deltaMonths;
      let y = c.year;
      while (m < 0) {
        m += 12;
        y -= 1;
      }
      while (m > 11) {
        m -= 12;
        y += 1;
      }
      return {
        year: y,
        month: m
      };
    });
  }
  const monthName = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric"
  });
  const dows = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Agenda view: next 30 days from today
  const agendaItems = computed.upcoming.slice(0, 30);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: 14
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: `${view === "month" ? "Bill calendar" : "Agenda · next 30 days"}`,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 6,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 1,
        background: "var(--border)",
        padding: 1,
        borderRadius: "var(--radius)"
      }
    }, ["month", "agenda"].map(v => /*#__PURE__*/React.createElement("button", {
      key: v,
      onClick: () => setView(v),
      style: {
        all: "unset",
        cursor: "pointer",
        padding: "3px 8px",
        fontSize: 10,
        background: view === v ? "var(--panel)" : "transparent",
        color: view === v ? "var(--text)" : "var(--muted)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em"
      }
    }, v))), view === "month" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.arrowLeft,
      onClick: () => shift(-1),
      title: "Previous month"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        padding: "0 8px",
        minWidth: 130,
        textAlign: "center"
      }
    }, monthName), /*#__PURE__*/React.createElement(IconBtn, {
      icon: ICONS.arrow,
      onClick: () => shift(1),
      title: "Next month"
    }), /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => {
        const d = new Date();
        setCursor({
          year: d.getFullYear(),
          month: d.getMonth()
        });
      }
    }, "Today")))
  }, view === "month" ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: 0,
      border: "1px solid var(--border)"
    }
  }, dows.map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      padding: "6px 10px",
      fontSize: 10,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--muted)",
      fontWeight: 600,
      background: "var(--panel-alt)",
      borderBottom: "1px solid var(--border)",
      borderRight: "1px solid var(--border)"
    }
  }, d)), cells.map((d, i) => {
    const events = eventsFor(d);
    const total = events.filter(e => e.kind === "expense").reduce((s, e) => s + (e.amount || 0), 0);
    const isToday = d === todayDate && isCurrentMonth;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        minHeight: 100,
        padding: "6px 8px",
        borderRight: i % 7 < 6 ? "1px solid var(--border)" : "none",
        borderBottom: "1px solid var(--border)",
        background: isToday ? "var(--accent-soft)" : "var(--panel)",
        display: "flex",
        flexDirection: "column",
        gap: 3
      }
    }, d && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-num)",
        fontSize: 12,
        fontWeight: 700,
        color: isToday ? "var(--accent)" : "var(--text)"
      }
    }, d), total > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontFamily: "var(--font-mono)",
        color: "var(--muted)"
      }
    }, fmtMoneyShort(total))), events.slice(0, 3).map(e => /*#__PURE__*/React.createElement("div", {
      key: e.id,
      style: {
        fontSize: 9.5,
        padding: "2px 5px",
        background: `color-mix(in oklch, ${e.color}, transparent 85%)`,
        color: e.color,
        borderLeft: `2px solid ${e.color}`,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontWeight: 600
      }
    }, e.label)), events.length > 3 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        color: "var(--muted)"
      }
    }, "+", events.length - 3, " more")));
  }))) : /*#__PURE__*/React.createElement("div", null, agendaItems.length === 0 ? /*#__PURE__*/React.createElement(Empty, {
    icon: ICONS.calendar,
    title: "Nothing upcoming",
    body: "No active debts, credit cycles, or recurring rules are due in the next 30 days.",
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
  }, "Amount"), /*#__PURE__*/React.createElement("th", {
    style: cellStyle({
      pad: "8px 14px"
    })
  }, "When"))), /*#__PURE__*/React.createElement("tbody", null, agendaItems.map(u => /*#__PURE__*/React.createElement("tr", {
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
  }, /*#__PURE__*/React.createElement(Chip, {
    tone: u.kind === "debt" ? "down" : u.kind === "credit" ? "warn" : "muted"
  }, u.kind)), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      align: "right",
      mono: true,
      weight: 600
    })
  }, fmtMoney(u.amount)), /*#__PURE__*/React.createElement("td", {
    style: cellStyle({
      pad: "10px 14px",
      color: "var(--muted)"
    })
  }, u.daysOut === 0 ? /*#__PURE__*/React.createElement(Chip, {
    tone: "warn"
  }, "today") : u.daysOut <= 3 ? /*#__PURE__*/React.createElement(Chip, {
    tone: "warn"
  }, "in ", u.daysOut, "d") : u.daysOut <= 7 ? /*#__PURE__*/React.createElement(Chip, null, "this week") : `in ${u.daysOut}d`))))))), /*#__PURE__*/React.createElement(Panel, {
    title: "Legend"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px",
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      fontSize: 11,
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      background: "var(--down)"
    }
  }), " Debt due"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      background: "var(--warn)"
    }
  }), " Credit cycle close"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      background: "var(--up)"
    }
  }), " Income"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      background: "var(--accent)"
    }
  }), " Recurring / actual"))));
}
Object.assign(window, {
  CalendarScreen
});