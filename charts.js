// ============================================================================
// charts.jsx — Minimal SVG chart used by Overview and Forecast
// ============================================================================

function AreaChart({
  data,
  width = 600,
  height = 200,
  lines = []
}) {
  if (!data || data.length === 0) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 30,
      color: "var(--muted)",
      fontSize: 12,
      textAlign: "center"
    }
  }, "No data");
  const allVals = data.flatMap(d => lines.map(s => d[s.key])).filter(x => x != null && !isNaN(x));
  if (allVals.length === 0) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 30,
      color: "var(--muted)",
      fontSize: 12,
      textAlign: "center"
    }
  }, "No data");
  const min = Math.min(0, Math.min(...allVals));
  const max = Math.max(...allVals, 1);
  const padL = 48,
    padR = 16,
    padB = 24,
    padT = 12;
  const innerW = width - padL - padR;
  const innerH = height - padB - padT;
  const stepX = innerW / Math.max(1, data.length - 1);
  const y = v => padT + innerH - (v - min) / (max - min || 1) * innerH;
  return /*#__PURE__*/React.createElement("svg", {
    width: width,
    height: height,
    style: {
      display: "block",
      maxWidth: "100%"
    }
  }, Array.from({
    length: 5
  }).map((_, i) => {
    const yy = padT + innerH / 4 * i;
    const v = max - max / 4 * i;
    return /*#__PURE__*/React.createElement("g", {
      key: i
    }, /*#__PURE__*/React.createElement("line", {
      x1: padL,
      y1: yy,
      x2: width - padR,
      y2: yy,
      stroke: "var(--grid)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("text", {
      x: padL - 8,
      y: yy + 3,
      textAnchor: "end",
      fontSize: "10",
      fill: "var(--faint)",
      fontFamily: "var(--font-mono)"
    }, abbreviate(v)));
  }), data.map((d, i) => /*#__PURE__*/React.createElement("text", {
    key: i,
    x: padL + i * stepX,
    y: height - 8,
    textAnchor: "middle",
    fontSize: "9.5",
    fill: "var(--muted)",
    fontFamily: "var(--font-mono)"
  }, d.x)), lines.map((s, si) => {
    const pts = data.map((d, i) => d[s.key] != null ? [padL + i * stepX, y(d[s.key])] : null).filter(Boolean);
    if (pts.length === 0) return null;
    const dStr = "M" + pts.map(p => p.join(",")).join("L");
    return /*#__PURE__*/React.createElement("g", {
      key: si
    }, s.fill != null && /*#__PURE__*/React.createElement("path", {
      d: dStr + `L${pts[pts.length - 1][0]},${padT + innerH} L${pts[0][0]},${padT + innerH} Z`,
      fill: s.color,
      opacity: s.fill
    }), /*#__PURE__*/React.createElement("path", {
      d: dStr,
      fill: "none",
      stroke: s.color,
      strokeWidth: s.width || 1.4,
      strokeDasharray: s.dotted ? "2 3" : undefined
    }));
  }));
}
function abbreviate(n) {
  if (n == null) return "";
  const v = Math.abs(n);
  if (v >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (v >= 1000) return (n / 1000).toFixed(0) + "k";
  return Math.round(n);
}
Object.assign(window, {
  AreaChart
});