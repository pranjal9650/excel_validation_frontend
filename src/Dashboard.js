import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  FileSpreadsheet, Rows3, CheckCircle2, XCircle, TrendingUp, TrendingDown,
} from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000";

/* ─── Design tokens ──────────────────────────────────────────── */
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
  blueBg:   "rgba(37,99,235,0.07)",
  blue:     "#2563EB",
  text:     "#111111",
  muted:    "#71717A",
};

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, accent, bg, trend, trendLabel }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.white,
        borderRadius: 14,
        border: `1px solid ${T.grey200}`,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 10,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.18s ease",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-2px)" : "none",
        cursor: "default",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Top accent strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 3, background: accent, borderRadius: "14px 14px 0 0",
      }} />

      {/* Icon + label */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>
          {label}
        </span>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: bg, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={16} color={accent} />
        </div>
      </div>

      {/* Value */}
      <div style={{ fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1, letterSpacing: -1 }}>
        {value ?? "—"}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {trend >= 0
            ? <TrendingUp size={12} color={T.green} />
            : <TrendingDown size={12} color={T.red} />}
          <span style={{ fontSize: 11.5, fontWeight: 600, color: trend >= 0 ? T.green : T.red }}>
            {Math.abs(trend)}%
          </span>
          <span style={{ fontSize: 11.5, color: T.muted }}>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Custom tooltip ─────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.grey200}`,
      borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      fontFamily: "'DM Sans', sans-serif", fontSize: 13,
    }}>
      <p style={{ fontWeight: 700, color: T.text, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill, fontWeight: 600, margin: "2px 0" }}>
          {p.name}: <span style={{ color: T.text }}>{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
const Dashboard = () => {
  const [stats, setStats]     = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/DASHBOARD-DATA`)
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/ANALYTICS`);
      processAnalytics(res.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const processAnalytics = (data) => {
    if (!Array.isArray(data)) return;
    const map = {};
    data.forEach((user) => {
      Object.keys(user.forms || {}).forEach((name) => {
        const d       = user.forms[name];
        const valid   = Number(d?.valid   || 0);
        const invalid = Number(d?.invalid || 0);
        const total   = Number(d?.total   || valid + invalid);
        if (!map[name]) map[name] = { valid: 0, invalid: 0, total: 0 };
        map[name].valid   += valid;
        map[name].invalid += invalid;
        map[name].total   += total;
      });
    });
    setSummary({ forms: map });
  };

  const chartData = summary
    ? Object.entries(summary.forms).map(([name, s]) => ({
        name,
        Valid:   Number(s.valid   || 0),
        Invalid: Number(s.invalid || 0),
        total:   Number(s.total   || 0),
      }))
    : [];

  /* ── Loader ── */
  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "60vh", gap: 16,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          border: `3px solid ${T.grey200}`,
          borderTop: `3px solid ${T.red}`,
          animation: "spin 0.9s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: T.muted, fontSize: 14, fontWeight: 500 }}>Loading dashboard…</p>
      </div>
    );
  }

  const {
    total_forms = 0,
    total_rows  = 0,
    valid_rows  = 0,
    junk_rows   = 0,
  } = stats || {};

  const validPct = total_rows ? Math.round((valid_rows / total_rows) * 100) : 0;

  /* ── Render ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page header ── */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5, margin: 0 }}>
          Validation Analytics
        </h2>
        <p style={{ fontSize: 13.5, color: T.muted, marginTop: 4 }}>
          Overview of all form validation metrics and statistics
        </p>
      </div>

      {/* ── Main row: KPI stack (left) + Chart (right) ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        gap: 20,
        alignItems: "stretch",
      }}>

        {/* Left: 4 KPI cards stacked in 2×2 grid — fills full height of chart */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 14,
          height: "100%",
        }}>
          <StatCard
            label="Total Forms"
            value={total_forms.toLocaleString()}
            icon={FileSpreadsheet}
            accent={T.blue}
            bg={T.blueBg}
            trend={12}
            trendLabel="vs last month"
          />
          <StatCard
            label="Total Rows"
            value={total_rows.toLocaleString()}
            icon={Rows3}
            accent="#8B5CF6"
            bg="rgba(139,92,246,0.08)"
            trend={5}
            trendLabel="vs last month"
          />
          <StatCard
            label="Valid Rows"
            value={valid_rows.toLocaleString()}
            icon={CheckCircle2}
            accent={T.green}
            bg={T.greenBg}
            trend={validPct}
            trendLabel="accuracy rate"
          />
          <StatCard
            label="Invalid Rows"
            value={junk_rows.toLocaleString()}
            icon={XCircle}
            accent={T.red}
            bg={T.redBg}
            trend={-8}
            trendLabel="vs last month"
          />
        </div>

        {/* Right: Chart */}
        <div style={{
          background: T.white,
          borderRadius: 14,
          border: `1px solid ${T.grey200}`,
          padding: "20px 24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          {/* Chart header */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 14,
            borderBottom: `1px solid ${T.grey200}`,
            marginBottom: 20,
          }}>
            <div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: T.text, margin: 0 }}>
                Form-wise Validation Distribution
              </h3>
              <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>
                Valid vs Invalid rows per form type
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Valid",   color: T.green, bg: T.greenBg },
                { label: "Invalid", color: T.red,   bg: T.redBg   },
              ].map(({ label, color, bg }) => (
                <span key={label} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 99,
                  background: bg, fontSize: 12, fontWeight: 600, color,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div style={{
              height: 240, display: "flex", alignItems: "center",
              justifyContent: "center", color: T.muted, fontSize: 14,
            }}>
              No analytics data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.grey200} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Sans', sans-serif" }}
                  axisLine={{ stroke: T.grey200 }}
                  tickLine={false}
                  interval={0}
                  dy={12}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: T.muted, fontFamily: "'DM Sans', sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="Valid"   name="Valid"   fill={T.green} radius={[5, 5, 0, 0]} maxBarSize={44} />
                <Bar dataKey="Invalid" name="Invalid" fill={T.red}   radius={[5, 5, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Summary table ── */}
      {chartData.length > 0 && (
        <div style={{
          background: T.white,
          borderRadius: 14,
          border: `1px solid ${T.grey200}`,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.grey200}` }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>Form Summary</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: T.grey100 }}>
                  {["Form Name", "Total", "Valid", "Invalid", "Accuracy"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 20px", textAlign: "left",
                      fontSize: 11.5, fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: 0.6,
                      color: T.muted, whiteSpace: "nowrap",
                      borderBottom: `1px solid ${T.grey200}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, i) => {
                  const acc = row.total ? Math.round((row.Valid / row.total) * 100) : 0;
                  return (
                    <tr
                      key={row.name}
                      style={{ background: i % 2 === 0 ? T.white : T.grey100 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(204,0,0,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? T.white : T.grey100)}
                    >
                      <td style={{ padding: "12px 20px", color: T.text, fontWeight: 500, borderBottom: `1px solid ${T.grey200}` }}>{row.name}</td>
                      <td style={{ padding: "12px 20px", color: T.text, borderBottom: `1px solid ${T.grey200}` }}>{row.total.toLocaleString()}</td>
                      <td style={{ padding: "12px 20px", borderBottom: `1px solid ${T.grey200}` }}>
                        <span style={{ color: T.green, fontWeight: 600, background: T.greenBg, padding: "2px 10px", borderRadius: 99, fontSize: 12.5 }}>
                          {row.Valid.toLocaleString()}
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: `1px solid ${T.grey200}` }}>
                        <span style={{ color: T.red, fontWeight: 600, background: T.redBg, padding: "2px 10px", borderRadius: 99, fontSize: 12.5 }}>
                          {row.Invalid.toLocaleString()}
                        </span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: `1px solid ${T.grey200}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            flex: 1, height: 6, borderRadius: 99,
                            background: T.grey200, overflow: "hidden", maxWidth: 100,
                          }}>
                            <div style={{
                              height: "100%", borderRadius: 99,
                              width: `${acc}%`,
                              background: acc >= 70 ? T.green : acc >= 40 ? "#F59E0B" : T.red,
                              transition: "width 0.6s ease",
                            }} />
                          </div>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: T.muted, minWidth: 32 }}>{acc}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;