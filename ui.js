function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// ============================================================================
// ui.jsx — Reusable UI atoms used across all screens
//   - Panel, Button, IconBtn, Input, Field, Select, Textarea
//   - Modal, ConfirmDialog
//   - Toast system (useToast, ToastHost)
//   - Empty (with CTA), Chip, KeyVal, Num, Glyph + ICONS
// ============================================================================

// Make React hooks available globally — all our .jsx files are separate scripts,
// so they don't share lexical scope. Stash hooks on window for everyone.
const {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useReducer,
  useContext
} = React;
Object.assign(window, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useReducer,
  useContext
});

// ---------------------------------------------------------------------------
// ICONS
// ---------------------------------------------------------------------------
const ICONS = {
  overview: "M2 8L8 3L14 8 M3.5 7.5V13H12.5V7.5",
  cash: "M2 5H14V11H2Z M2 5L8 9L14 5 M5 13H11",
  expenses: "M2.5 3.5H13.5V12.5H2.5Z M2.5 6.5H13.5 M5.5 9H10.5",
  income: "M8 13V3 M4 7L8 3L12 7",
  debt: "M2 8C2 5 5 3 8 3C11 3 14 5 14 8C14 11 11 13 8 13C5 13 2 11 2 8Z M5 8H11 M8 5V11",
  credit: "M2 4H14V12H2Z M2 7H14 M4.5 10H8",
  health: "M8 14S2 10 2 6.5C2 4.5 3.5 3 5.5 3C6.5 3 7.5 3.5 8 4.5C8.5 3.5 9.5 3 10.5 3C12.5 3 14 4.5 14 6.5C14 10 8 14 8 14Z",
  forecast: "M2 12L5 8L8 10L11 5L14 7 M2 14H14",
  budgets: "M3 13V5 M8 13V3 M13 13V8",
  goals: "M8 14V8 M3 8A5 5 0 1 1 13 8 A5 5 0 1 1 3 8 M8 8L11 5",
  subscriptions: "M3 4H13V12H3Z M3 7H13",
  calendar: "M3 4H13V13H3Z M3 7H13 M6 2.5V5 M10 2.5V5",
  transactions: "M2.5 5L10 5 M2.5 11L10 11 M11 3L13 5L11 7 M5 9L3 11L5 13",
  report: "M4 2.5V13.5L8 11.5L12 13.5V2.5",
  settings: "M8 6.5A1.5 1.5 0 1 0 8 9.5A1.5 1.5 0 1 0 8 6.5Z M13 9L12 9.5 M13 7L12 6.5 M10 4L9.5 5 M8 3L8 4 M6 4L6.5 5 M3 7L4 6.5 M3 9L4 9.5 M6 12L6.5 11 M8 13V12 M10 12L9.5 11",
  search: "M7 12A5 5 0 1 0 7 2A5 5 0 1 0 7 12Z M11 11L14 14",
  bell: "M4 11V7C4 5 6 3 8 3C10 3 12 5 12 7V11L13 12.5H3Z M6.5 13.5C7 14.5 9 14.5 9.5 13.5",
  plus: "M8 3V13 M3 8H13",
  minus: "M3 8H13",
  arrow: "M5 3L11 8L5 13",
  arrowLeft: "M11 3L5 8L11 13",
  download: "M8 2.5V10 M5 7L8 10L11 7 M3 13H13",
  upload: "M8 13V5 M5 8L8 5L11 8 M3 3H13",
  filter: "M2.5 4H13.5 M5 8H11 M7 12H9",
  sparkle: "M8 2.5V6 M8 10V13.5 M2.5 8H6 M10 8H13.5 M4.5 4.5L6.5 6.5 M9.5 9.5L11.5 11.5 M11.5 4.5L9.5 6.5 M6.5 9.5L4.5 11.5",
  user: "M8 8A2.5 2.5 0 1 0 8 3A2.5 2.5 0 1 0 8 8Z M3 13.5C3 11 5 9 8 9C11 9 13 11 13 13.5",
  check: "M3 8L7 12L13 4",
  x: "M4 4L12 12 M12 4L4 12",
  edit: "M3 13H6L13 6L10 3L3 10V13",
  trash: "M3 5H13 M5 5V13H11V5 M6 7V11 M10 7V11 M6 5V3H10V5",
  lock: "M4.5 7V5C4.5 3.5 6 2.5 8 2.5C10 2.5 11.5 3.5 11.5 5V7 M3 7H13V13H3Z",
  more: "M3 8A1 1 0 1 0 3 8 M8 8A1 1 0 1 0 8 8 M13 8A1 1 0 1 0 13 8",
  refresh: "M3 8A5 5 0 0 1 12 5L14 7 M14 3V7H10 M13 8A5 5 0 0 1 4 11L2 9 M2 13V9H6",
  warning: "M8 2L14 13H2Z M8 6V10 M8 12V12.5"
};
function Glyph({
  d,
  size = 14,
  color
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    style: {
      flexShrink: 0,
      color: color || "currentColor"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: d,
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}

// ---------------------------------------------------------------------------
// Panel · standard card with optional header
// ---------------------------------------------------------------------------
function Panel({
  children,
  style,
  title,
  action,
  dense,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--panel)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      ...style
    }
  }, rest), title && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: dense ? "8px 12px" : "12px 16px",
      borderBottom: "1px solid var(--border)",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--muted)",
      fontFamily: "var(--font-ui)",
      fontWeight: 600
    }
  }, title), action), children);
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
function Button({
  children,
  onClick,
  variant = "secondary",
  size = "md",
  icon,
  danger,
  disabled,
  type = "button",
  title,
  style
}) {
  const sizes = {
    sm: {
      padding: "5px 9px",
      fontSize: 11
    },
    md: {
      padding: "7px 12px",
      fontSize: 12
    },
    lg: {
      padding: "10px 16px",
      fontSize: 13
    }
  };
  const variants = {
    primary: {
      background: "var(--text)",
      color: "var(--bg)",
      border: "1px solid var(--text)"
    },
    secondary: {
      background: "var(--panel)",
      color: "var(--text)",
      border: "1px solid var(--border)"
    },
    accent: {
      background: "var(--accent)",
      color: "var(--bg)",
      border: "1px solid var(--accent)"
    },
    ghost: {
      background: "transparent",
      color: "var(--muted)",
      border: "1px solid transparent"
    },
    danger: {
      background: "color-mix(in oklch, var(--down), transparent 90%)",
      color: "var(--down)",
      border: "1px solid color-mix(in oklch, var(--down), transparent 60%)"
    }
  };
  const v = danger ? variants.danger : variants[variant];
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    onClick: onClick,
    disabled: disabled,
    title: title,
    style: {
      all: "unset",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontFamily: "var(--font-ui)",
      fontWeight: 600,
      borderRadius: "var(--radius)",
      whiteSpace: "nowrap",
      ...sizes[size],
      ...v,
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(Glyph, {
    d: icon,
    size: size === "lg" ? 14 : 12
  }), children);
}
function IconBtn({
  icon,
  onClick,
  title,
  danger,
  disabled
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    title: title,
    style: {
      all: "unset",
      cursor: disabled ? "not-allowed" : "pointer",
      width: 26,
      height: 26,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid var(--border)",
      background: "var(--panel)",
      color: danger ? "var(--down)" : "var(--muted)",
      borderRadius: "var(--radius)",
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    d: icon,
    size: 12
  }));
}

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------
const inputStyle = {
  all: "unset",
  padding: "8px 11px",
  border: "1px solid var(--border)",
  background: "var(--panel-alt)",
  fontFamily: "var(--font-ui)",
  fontSize: 13,
  color: "var(--text)",
  borderRadius: "var(--radius)",
  boxSizing: "border-box",
  width: "100%"
};
function Field({
  label,
  hint,
  children,
  required,
  error
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--muted)",
      fontWeight: 600
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--down)",
      marginLeft: 4
    }
  }, "*")), children, hint && !error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: "var(--faint)"
    }
  }, hint), error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      color: "var(--down)"
    }
  }, error));
}
function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  mono,
  autoFocus,
  step,
  min,
  max,
  style
}) {
  return /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value ?? "",
    onChange: e => onChange(type === "number" ? e.target.value === "" ? "" : parseFloat(e.target.value) : e.target.value),
    placeholder: placeholder,
    autoFocus: autoFocus,
    step: step,
    min: min,
    max: max,
    style: {
      ...inputStyle,
      fontFamily: mono ? "var(--font-num)" : "var(--font-ui)",
      fontVariantNumeric: mono ? "tabular-nums" : "normal",
      ...style
    }
  });
}
function Select({
  value,
  onChange,
  options,
  placeholder,
  style
}) {
  return /*#__PURE__*/React.createElement("select", {
    value: value ?? "",
    onChange: e => onChange(e.target.value),
    style: {
      ...inputStyle,
      cursor: "pointer",
      ...style
    }
  }, placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)));
}
function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3
}) {
  return /*#__PURE__*/React.createElement("textarea", {
    value: value ?? "",
    onChange: e => onChange(e.target.value),
    placeholder: placeholder,
    rows: rows,
    style: {
      ...inputStyle,
      resize: "vertical",
      lineHeight: 1.4
    }
  });
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 520
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "color-mix(in oklch, var(--bg), transparent 30%)",
      backdropFilter: "blur(2px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width,
      maxWidth: "100%",
      maxHeight: "92vh",
      background: "var(--panel)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 18px",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: "var(--tracking)"
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      all: "unset",
      cursor: "pointer",
      width: 26,
      height: 26,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--muted)",
      borderRadius: "var(--radius)"
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    d: ICONS.x,
    size: 13
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 18px",
      overflow: "auto",
      flex: 1
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 18px",
      borderTop: "1px solid var(--border)",
      background: "var(--panel-alt)",
      display: "flex",
      justifyContent: "flex-end",
      gap: 6
    }
  }, footer)));
}
function ConfirmDialog({
  open,
  title = "Are you sure?",
  body,
  confirmLabel = "Confirm",
  danger,
  onConfirm,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: onClose,
    title: title,
    width: 420,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: danger ? "danger" : "primary",
      danger: danger,
      onClick: () => {
        onConfirm();
        onClose();
      }
    }, confirmLabel))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      lineHeight: 1.6,
      color: "var(--text)"
    }
  }, body));
}

// ---------------------------------------------------------------------------
// Toast system — call useToast() to get toast(msg, kind)
// ---------------------------------------------------------------------------
const ToastContext = React.createContext(null);
function ToastProvider({
  children
}) {
  const [toasts, setToasts] = React.useState([]);
  const toast = React.useCallback((message, kind = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(cur => [...cur, {
      id,
      message,
      kind
    }]);
    setTimeout(() => setToasts(cur => cur.filter(t => t.id !== id)), 3500);
  }, []);
  return /*#__PURE__*/React.createElement(ToastContext.Provider, {
    value: toast
  }, children, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 16,
      right: 16,
      zIndex: 200,
      display: "flex",
      flexDirection: "column",
      gap: 6,
      pointerEvents: "none"
    }
  }, toasts.map(t => {
    const tone = t.kind === "success" ? "var(--up)" : t.kind === "error" ? "var(--down)" : t.kind === "warn" ? "var(--warn)" : "var(--accent)";
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      style: {
        padding: "10px 14px",
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${tone}`,
        fontSize: 12.5,
        color: "var(--text)",
        fontFamily: "var(--font-ui)",
        borderRadius: "var(--radius)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        minWidth: 220,
        maxWidth: 360,
        pointerEvents: "auto"
      }
    }, t.message);
  })));
}
function useToast() {
  const t = React.useContext(ToastContext);
  if (!t) throw new Error("useToast outside ToastProvider");
  return t;
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function Empty({
  icon,
  title,
  body,
  action,
  padding = 40
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 12,
      color: "var(--muted)"
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 44,
      background: "var(--chip)",
      color: "var(--muted)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius)"
    }
  }, /*#__PURE__*/React.createElement(Glyph, {
    d: icon,
    size: 20
  })), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: 16,
      fontWeight: 700,
      color: "var(--text)",
      letterSpacing: "var(--tracking)"
    }
  }, title), body && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12.5,
      maxWidth: 360,
      lineHeight: 1.5
    }
  }, body), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, action));
}

// ---------------------------------------------------------------------------
// Chip / Num / KeyVal
// ---------------------------------------------------------------------------
function Chip({
  children,
  tone,
  style
}) {
  const palette = {
    up: {
      bg: "color-mix(in oklch, var(--up), transparent 88%)",
      fg: "var(--up)",
      bd: "var(--up)"
    },
    down: {
      bg: "color-mix(in oklch, var(--down), transparent 88%)",
      fg: "var(--down)",
      bd: "var(--down)"
    },
    warn: {
      bg: "color-mix(in oklch, var(--warn), transparent 88%)",
      fg: "var(--warn)",
      bd: "var(--warn)"
    },
    accent: {
      bg: "var(--accent-soft)",
      fg: "var(--accent)",
      bd: "var(--accent)"
    },
    muted: {
      bg: "var(--chip)",
      fg: "var(--muted)",
      bd: "var(--border)"
    }
  }[tone || "muted"];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 7px",
      background: palette.bg,
      color: palette.fg,
      border: `1px solid color-mix(in oklch, ${palette.bd}, transparent 70%)`,
      fontSize: 10,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      fontFamily: "var(--font-ui)",
      borderRadius: "var(--radius)",
      whiteSpace: "nowrap",
      ...style
    }
  }, children);
}
function Num({
  children,
  color,
  mono = true,
  weight = 500,
  size
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: mono ? "var(--font-num)" : "inherit",
      color: color || "var(--text)",
      fontWeight: weight,
      fontSize: size,
      fontVariantNumeric: "tabular-nums"
    }
  }, children);
}
function KPI({
  label,
  value,
  sub,
  trend,
  color,
  large
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--muted)",
      fontWeight: 600
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-num)",
      fontSize: large ? 28 : 22,
      fontWeight: 600,
      color: color || "var(--text)",
      letterSpacing: "var(--tracking)",
      lineHeight: 1.05,
      fontVariantNumeric: "tabular-nums"
    }
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      color: "var(--muted)",
      fontFamily: "var(--font-mono)"
    }
  }, trend != null && trend !== 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      color: trend > 0 ? "var(--up)" : "var(--down)",
      marginRight: 6
    }
  }, trend > 0 ? "▲" : "▼", " ", Math.abs(trend * 100).toFixed(1), "%"), sub));
}

// ---------------------------------------------------------------------------
// Table helpers
// ---------------------------------------------------------------------------
function cellStyle({
  pad,
  align,
  mono,
  weight,
  color,
  width
}) {
  return {
    padding: pad,
    textAlign: align || "left",
    fontFamily: mono ? "var(--font-num)" : "inherit",
    fontWeight: weight || 400,
    color: color || "inherit",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    width
  };
}
function ProgressBar({
  value,
  max,
  color,
  height = 6,
  bg = "var(--grid)"
}) {
  const pct = Math.min(100, Math.max(0, value / max * 100));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%",
      height,
      background: bg,
      overflow: "hidden",
      borderRadius: "var(--radius)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      width: `${pct}%`,
      background: color || "var(--accent)"
    }
  }));
}
Object.assign(window, {
  ICONS,
  Glyph,
  Panel,
  Button,
  IconBtn,
  Field,
  Input,
  Select,
  Textarea,
  inputStyle,
  Modal,
  ConfirmDialog,
  ToastProvider,
  useToast,
  Empty,
  Chip,
  Num,
  KPI,
  ProgressBar,
  cellStyle
});