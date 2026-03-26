import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

/* ─── Design tokens (mirrors App.js / Dashboard.js) ─────────── */
const T = {
  red:      "#CC0000",
  redDark:  "#A30000",
  black:    "#111111",
  grey200:  "#E4E4E7",
  grey100:  "#F4F4F5",
  white:    "#FFFFFF",
  green:    "#059669",
  greenBg:  "rgba(5,150,105,0.08)",
  redBg:    "rgba(204,0,0,0.07)",
  text:     "#111111",
  muted:    "#71717A",
};

/* ─── Shared table styles ────────────────────────────────────── */
const thStyle = {
  padding: "10px 20px",
  textAlign: "left",
  fontSize: 11.5,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.6,
  color: T.muted,
  whiteSpace: "nowrap",
  borderBottom: `1px solid ${T.grey200}`,
  background: T.grey100,
};

const tdStyle = {
  padding: "12px 20px",
  borderBottom: `1px solid ${T.grey200}`,
  color: T.text,
  fontSize: 13.5,
  whiteSpace: "nowrap",
};

/* ─── Toggle button ──────────────────────────────────────────── */
function ToggleButton({ active, onClick, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "9px 18px",
        borderRadius: 8,
        border: `1px solid ${active ? T.red : T.grey200}`,
        background: active ? T.red : hovered ? T.grey100 : T.white,
        color: active ? T.white : hovered ? T.text : T.muted,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {children}
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
function Analytics() {
  const [gridData, setGridData]             = useState([]);
  const [summary, setSummary]               = useState(null);
  const [monthYear, setMonthYear]           = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [loading, setLoading]               = useState(false);
  const [showCircleAnalytics, setShowCircleAnalytics] = useState(false);
  const [circleSummary, setCircleSummary]   = useState(null);
  const [searchFocused, setSearchFocused]   = useState(false);

  /* ── Fetch ── */
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${BASE_URL}/ANALYTICS`;
      if (monthYear) url += `?month=${monthYear}`;
      const res = await axios.get(url);
      processAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [monthYear]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  /* ── Process ── */
  const processAnalytics = (data) => {
    if (!Array.isArray(data)) return;

    const finalGrid  = [];
    const summaryMap = {};
    const circleMap  = {};

    data.forEach((user) => {
      const row        = { username: user.username, forms: {}, total: 0 };
      const backendForms = user.forms || {};

      Object.keys(backendForms).forEach((formName) => {
        const d       = backendForms[formName];
        const valid   = Number(d?.valid   || 0);
        const invalid = Number(d?.invalid || 0);
        const total   = valid + invalid;

        row.forms[formName] = { valid, invalid, total };
        row.total += total;

        if (!summaryMap[formName]) summaryMap[formName] = { valid: 0, invalid: 0, total: 0 };
        summaryMap[formName].valid   += valid;
        summaryMap[formName].invalid += invalid;
        summaryMap[formName].total   += total;

        const circleData = d?.circleWise || {};
        Object.keys(circleData).forEach((circle) => {
          if (!circleMap[formName])         circleMap[formName] = {};
          if (!circleMap[formName][circle]) circleMap[formName][circle] = 0;
          circleMap[formName][circle] += Number(circleData[circle] || 0);
        });
      });

      finalGrid.push(row);
    });

    setGridData(finalGrid);
    setSummary({ forms: summaryMap });
    setCircleSummary(circleMap);
  };

  /* ── Derived ── */
  const filteredGrid = gridData.filter((row) =>
    row.username?.toLowerCase().includes(searchUsername.toLowerCase())
  );

  const chartData = summary
    ? Object.entries(summary.forms).map(([name, stats]) => ({
        name,
        valid:   Number(stats.valid   || 0),
        invalid: Number(stats.invalid || 0),
        total:   Number(stats.total   || 0),
      }))
    : [];

  /* ─────────────────── RENDER ─────────────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Page header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5, margin: 0 }}>
          Analytics Dashboard
        </h2>
        <p style={{ fontSize: 13.5, color: T.muted, marginTop: 4 }}>
          Detailed analytics and insights across all forms
        </p>
      </div>

      {/* ── Filters ── */}
      <div style={{
        background: T.white,
        borderRadius: 14,
        border: `1px solid ${T.grey200}`,
        padding: "16px 20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
      }}>
        {/* Month picker */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: T.muted, whiteSpace: "nowrap" }}>
            Month
          </label>
          <input
            type="month"
            value={monthYear}
            onChange={(e) => setMonthYear(e.target.value)}
            style={{
              padding: "9px 13px",
              borderRadius: 8,
              border: `1px solid ${T.grey200}`,
              fontSize: 13.5,
              fontFamily: "'DM Sans', sans-serif",
              background: T.grey100,
              color: T.text,
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = T.red;
              e.target.style.boxShadow   = "0 0 0 3px rgba(204,0,0,0.10)";
              e.target.style.background  = T.white;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = T.grey200;
              e.target.style.boxShadow   = "none";
              e.target.style.background  = T.grey100;
            }}
          />
        </div>

        {/* Apply button */}
        <button
          onClick={fetchAnalytics}
          style={{
            padding: "9px 18px",
            borderRadius: 8,
            border: "none",
            background: T.red,
            color: T.white,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            transition: "background 0.15s, transform 0.15s",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) => { e.target.style.background = T.redDark; e.target.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.target.style.background = T.red; e.target.style.transform = "none"; }}
        >
          🔍 Apply Filter
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: T.grey200 }} />

        {/* View toggle */}
        <ToggleButton
          active={!showCircleAnalytics}
          onClick={() => setShowCircleAnalytics(false)}
        >
          📊 Form Analytics
        </ToggleButton>
        <ToggleButton
          active={showCircleAnalytics}
          onClick={() => setShowCircleAnalytics(true)}
        >
          🌐 Circle Analytics
        </ToggleButton>
      </div>

      {/* ── Loader ── */}
      {loading && (
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: 60, gap: 16,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            border: `3px solid ${T.grey200}`,
            borderTop: `3px solid ${T.red}`,
            animation: "spin 0.9s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: T.muted, fontSize: 14, fontWeight: 500, margin: 0 }}>
            Loading analytics data…
          </p>
        </div>
      )}

      {/* ── Tables ── */}
      {!loading && (
        !showCircleAnalytics ? (

          /* ══ Form Analytics Table ══════════════════════════════ */
          <div style={{
            background: T.white,
            borderRadius: 14,
            border: `1px solid ${T.grey200}`,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}>
            {/* Table header */}
            <div style={{
              padding: "18px 24px",
              borderBottom: `1px solid ${T.grey200}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>
                  Form Analytics
                </h3>
                <p style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>
                  Valid / Invalid (Total) per user per form
                </p>
              </div>

              {/* Username search */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: searchFocused ? T.white : T.grey100,
                border: `1px solid ${searchFocused ? T.red : T.grey200}`,
                borderRadius: 9,
                padding: "7px 12px",
                width: 220,
                transition: "all 0.15s ease",
                boxShadow: searchFocused ? "0 0 0 3px rgba(204,0,0,0.10)" : "none",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  placeholder="Search username…"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  style={{
                    flex: 1, border: "none", background: "transparent",
                    outline: "none", fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif", color: T.text,
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 700 }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, minWidth: 140 }}>Username</th>
                    {chartData.map((f) => (
                      <th key={f.name} style={{ ...thStyle, textAlign: "center" }}>
                        {f.name}
                        <span style={{ display: "block", fontSize: 11, color: T.muted, fontWeight: 500, marginTop: 2 }}>
                          Total: {f.total}
                        </span>
                      </th>
                    ))}
                    <th style={{ ...thStyle, textAlign: "center" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrid.map((row, i) => (
                    <tr
                      key={i}
                      style={{ background: i % 2 === 0 ? T.white : T.grey100 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(204,0,0,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? T.white : T.grey100)}
                    >
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{row.username}</td>

                      {chartData.map((f) => {
                        const d = row.forms[f.name] || { valid: 0, invalid: 0, total: 0 };
                        return (
                          <td key={f.name} style={{ ...tdStyle, textAlign: "center" }}>
                            <span style={{ color: T.green, fontWeight: 700 }}>{d.valid}</span>
                            <span style={{ color: T.muted, margin: "0 4px" }}>/</span>
                            <span style={{ color: T.red, fontWeight: 700 }}>{d.invalid}</span>
                            <span style={{ color: T.muted, fontSize: 12, marginLeft: 4 }}>({d.total})</span>
                          </td>
                        );
                      })}

                      <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700 }}>
                        {row.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div style={{
              padding: "12px 24px",
              borderTop: `1px solid ${T.grey200}`,
              display: "flex",
              gap: 16,
              fontSize: 12,
              color: T.muted,
            }}>
              <span>
                <span style={{ color: T.green, fontWeight: 700 }}>Green</span> = Valid
              </span>
              <span>
                <span style={{ color: T.red, fontWeight: 700 }}>Red</span> = Invalid
              </span>
              <span style={{ color: T.muted }}>(Total) in parentheses</span>
            </div>
          </div>

        ) : (

          /* ══ Circle Analytics Tables ═══════════════════════════ */
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {circleSummary && Object.keys(circleSummary).map((formName) => {
              const entries = Object.entries(circleSummary[formName] || {});
              const grandTotal = entries.reduce((s, [, c]) => s + c, 0);

              return (
                <div
                  key={formName}
                  style={{
                    background: T.white,
                    borderRadius: 14,
                    border: `1px solid ${T.grey200}`,
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Card header */}
                  <div style={{
                    padding: "16px 24px",
                    borderBottom: `1px solid ${T.grey200}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <div>
                      <h3 style={{ fontSize: 14.5, fontWeight: 700, color: T.text, margin: 0 }}>
                        {formName}
                      </h3>
                      <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Circle-wise submissions</p>
                    </div>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: 99,
                      background: T.redBg,
                      color: T.red,
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}>
                      {grandTotal.toLocaleString()} total
                    </span>
                  </div>

                  {/* Table */}
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Circle</th>
                          <th style={{ ...thStyle, textAlign: "center" }}>Submissions</th>
                          <th style={{ ...thStyle, textAlign: "left" }}>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries
                          .sort(([, a], [, b]) => b - a)
                          .map(([circle, count], i) => {
                            const pct = grandTotal ? Math.round((count / grandTotal) * 100) : 0;
                            return (
                              <tr
                                key={circle}
                                style={{ background: i % 2 === 0 ? T.white : T.grey100 }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(204,0,0,0.03)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? T.white : T.grey100)}
                              >
                                <td style={{ ...tdStyle, fontWeight: 600 }}>{circle}</td>
                                <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700 }}>
                                  {count.toLocaleString()}
                                </td>
                                <td style={{ ...tdStyle }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{
                                      flex: 1, height: 6, borderRadius: 99,
                                      background: T.grey200, overflow: "hidden", maxWidth: 120,
                                    }}>
                                      <div style={{
                                        height: "100%", borderRadius: 99,
                                        width: `${pct}%`,
                                        background: T.red,
                                        transition: "width 0.5s ease",
                                      }} />
                                    </div>
                                    <span style={{ fontSize: 12.5, fontWeight: 600, color: T.muted, minWidth: 32 }}>
                                      {pct}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

export default Analytics;