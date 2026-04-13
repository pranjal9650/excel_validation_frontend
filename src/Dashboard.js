import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  FileSpreadsheet, Rows3, CheckCircle2, XCircle, TrendingUp,
  TrendingDown, RefreshCw, User, ChevronDown, ChevronUp,
  AlertTriangle, X,
} from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000";

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
  purple:   "#7C3AED",
  purpleBg: "rgba(124,58,237,0.07)",
};

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon, accent, bg, trend, trendLabel }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.white, borderRadius: 14, border: `1px solid ${T.grey200}`,
        padding: "18px 20px", display: "flex", flexDirection: "column",
        justifyContent: "space-between", gap: 10,
        position: "relative", overflow: "hidden",
        transition: "all 0.18s ease",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-2px)" : "none",
        cursor: "default", height: "100%", boxSizing: "border-box",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 3, background: accent, borderRadius: "14px 14px 0 0",
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6 }}>
          {label}
        </span>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={accent} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1, letterSpacing: -1 }}>
        {value ?? "—"}
      </div>
      {trend !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {trend >= 0 ? <TrendingUp size={12} color={T.green} /> : <TrendingDown size={12} color={T.red} />}
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

/* ─── Per-user row — expandable ──────────────────────────────── */
function UserRow({ user, index, allFormNames }) {
  const [expanded, setExpanded] = useState(false);

  const totalValid   = Object.values(user.forms || {}).reduce((s, f) => s + (f.valid   || 0), 0);
  const totalInvalid = Object.values(user.forms || {}).reduce((s, f) => s + (f.invalid || 0), 0);
  const totalRows    = totalValid + totalInvalid;
  const accuracy     = totalRows ? Math.round((totalValid / totalRows) * 100) : 0;

  return (
    <>
      <tr
        style={{ background: index % 2 === 0 ? T.white : T.grey100, cursor: "pointer" }}
        onClick={() => setExpanded((e) => !e)}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(204,0,0,0.03)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = index % 2 === 0 ? T.white : T.grey100)}
      >
        {/* Expand toggle */}
        <td style={{ padding: "12px 16px", borderBottom: `1px solid ${T.grey200}`, width: 36 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: expanded ? T.redBg : T.grey100,
            border: `1px solid ${expanded ? "rgba(204,0,0,0.2)" : T.grey200}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {expanded
              ? <ChevronUp size={12} color={T.red} />
              : <ChevronDown size={12} color={T.muted} />}
          </div>
        </td>

        {/* Username */}
        <td style={{ padding: "12px 16px", borderBottom: `1px solid ${T.grey200}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: T.redBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: T.red, flexShrink: 0,
            }}>
              {(user.username || "?")[0].toUpperCase()}
            </div>
            <span style={{ fontWeight: 600, color: T.text, fontSize: 13.5 }}>{user.username}</span>
          </div>
        </td>

        {/* Total rows */}
        <td style={{ padding: "12px 16px", borderBottom: `1px solid ${T.grey200}`, textAlign: "center" }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>{totalRows.toLocaleString()}</span>
        </td>

        {/* Valid */}
        <td style={{ padding: "12px 16px", borderBottom: `1px solid ${T.grey200}`, textAlign: "center" }}>
          <span style={{ color: T.green, fontWeight: 700, background: T.greenBg, padding: "3px 10px", borderRadius: 99, fontSize: 12.5 }}>
            {totalValid.toLocaleString()}
          </span>
        </td>

        {/* Invalid */}
        <td style={{ padding: "12px 16px", borderBottom: `1px solid ${T.grey200}`, textAlign: "center" }}>
          <span style={{ color: T.red, fontWeight: 700, background: T.redBg, padding: "3px 10px", borderRadius: 99, fontSize: 12.5 }}>
            {totalInvalid.toLocaleString()}
          </span>
        </td>

        {/* Accuracy bar */}
        <td style={{ padding: "12px 16px", borderBottom: `1px solid ${T.grey200}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 99, background: T.grey200, overflow: "hidden", maxWidth: 90 }}>
              <div style={{
                height: "100%", borderRadius: 99, width: `${accuracy}%`,
                background: accuracy >= 70 ? T.green : accuracy >= 40 ? "#F59E0B" : T.red,
                transition: "width 0.6s ease",
              }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: accuracy >= 70 ? T.green : accuracy >= 40 ? "#F59E0B" : T.red, minWidth: 34 }}>
              {accuracy}%
            </span>
          </div>
        </td>
      </tr>

      {/* ── Expanded: per-form breakdown ── */}
      {expanded && (
        <tr>
          <td colSpan={6} style={{ padding: "0 0 4px 0", borderBottom: `1px solid ${T.grey200}`, background: "rgba(37,99,235,0.02)" }}>
            <div style={{ padding: "14px 20px 14px 60px" }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>
                Per-Form Breakdown
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {allFormNames.map((formName) => {
                  const d = user.forms?.[formName];
                  if (!d && !d?.total) return null;
                  const v   = d?.valid   || 0;
                  const inv = d?.invalid || 0;
                  const tot = v + inv;
                  if (tot === 0) return null;
                  const acc = tot ? Math.round((v / tot) * 100) : 0;
                  return (
                    <div key={formName} style={{
                      padding: "8px 12px", borderRadius: 9,
                      border: `1px solid ${T.grey200}`,
                      background: T.white, minWidth: 150,
                    }}>
                      <p style={{ fontSize: 11.5, fontWeight: 700, color: T.text, margin: "0 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                        {formName}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: T.green, fontWeight: 700 }}>{v} valid</span>
                        <span style={{ fontSize: 10, color: T.muted }}>/</span>
                        <span style={{ fontSize: 11, color: T.red, fontWeight: 700 }}>{inv} invalid</span>
                        <span style={{
                          marginLeft: "auto", fontSize: 11, fontWeight: 700,
                          color: acc >= 70 ? T.green : acc >= 40 ? "#F59E0B" : T.red,
                        }}>
                          {acc}%
                        </span>
                      </div>
                      <div style={{ marginTop: 5, height: 4, borderRadius: 99, background: T.grey200, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 99, width: `${acc}%`,
                          background: acc >= 70 ? T.green : acc >= 40 ? "#F59E0B" : T.red,
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
const Dashboard = () => {
  const [stats, setStats]         = useState(null);
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [userData, setUserData]   = useState([]);   // per-user breakdown
  const [allFormNames, setAllFormNames] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [invalidModal, setInvalidModal]       = useState(false);
  const [invalidFormName, setInvalidFormName] = useState("");
  const [invalidRecords, setInvalidRecords]   = useState([]);
  const [invalidLoading, setInvalidLoading]   = useState(false);

  const [expandedUser, setExpandedUser] = useState(null);

  const handleViewInvalid = async (formName) => {
    setInvalidFormName(formName);
    setInvalidModal(true);
    setInvalidLoading(true);
    setInvalidRecords([]);
    setExpandedUser(null);
    try {
      const res = await axios.get(`${BASE_URL}/INVALID-RECORDS-BY-USER`, {
        params: { form_name: formName }
      });
      setInvalidRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch invalid records:", err);
      setInvalidRecords([]);
    }
    setInvalidLoading(false);
  };

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        axios.get(`${BASE_URL}/DASHBOARD-DATA`),
        axios.get(`${BASE_URL}/ANALYTICS`),
      ]);
      setStats(dashRes.data);
      processAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const processAnalytics = (data) => {
    if (!Array.isArray(data)) return;

    const formMap      = {};
    const formNamesSet = new Set();

    // Build per-form totals and collect form names
    data.forEach((user) => {
      Object.keys(user.forms || {}).forEach((name) => {
        formNamesSet.add(name);
        const d       = user.forms[name];
        const valid   = Number(d?.valid   || 0);
        const invalid = Number(d?.invalid || 0);
        const total   = Number(d?.total   || valid + invalid);
        if (!formMap[name]) formMap[name] = { valid: 0, invalid: 0, total: 0 };
        formMap[name].valid   += valid;
        formMap[name].invalid += invalid;
        formMap[name].total   += total;
      });
    });

    const built = Object.entries(formMap).map(([name, s]) => ({
      name,
      Valid:   Number(s.valid   || 0),
      Invalid: Number(s.invalid || 0),
      total:   Number(s.total   || 0),
    }));

    setChartData(built);
    setTableData(built);
    setUserData(data);
    setAllFormNames([...formNamesSet]);
  };

  /* ── Loader ── */
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", border: `3px solid ${T.grey200}`, borderTop: `3px solid ${T.red}`, animation: "spin 0.9s linear infinite" }} />
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

  const validPct     = total_rows ? Math.round((valid_rows / total_rows) * 100) : 0;
  const formsTrend   = total_forms || 0;
  const rowsTrend    = total_rows ? Math.round((valid_rows / total_rows) * 100) : 0;
  const invalidTrend = total_rows ? Math.round((junk_rows / total_rows) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Invalid Records Modal ── */}
      {invalidModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, fontFamily: "'DM Sans', sans-serif",
        }}>
          <div style={{
            background: T.white, borderRadius: 18,
            width: "100%", maxWidth: 860,
            maxHeight: "85vh", display: "flex", flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
            overflow: "hidden",
          }}>

            {/* Modal Header */}
            <div style={{
              padding: "20px 28px",
              borderBottom: `1px solid ${T.grey200}`,
              display: "flex", alignItems: "center",
              justifyContent: "space-between", flexShrink: 0,
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: T.redBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <XCircle size={18} color={T.red} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0 }}>
                      Invalid Records
                    </h3>
                    <p style={{ fontSize: 12.5, color: T.muted, margin: 0 }}>
                      {invalidFormName} — showing why each record was rejected
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInvalidModal(false)}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: `1px solid ${T.grey200}`,
                  background: T.grey100, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={16} color={T.muted} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "16px 28px 24px" }}>

              {invalidLoading ? (
                <div style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "center", height: 200, gap: 12,
                  flexDirection: "column",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: `3px solid ${T.grey200}`,
                    borderTop: `3px solid ${T.red}`,
                    animation: "spin 0.9s linear infinite",
                  }} />
                  <p style={{ color: T.muted, fontSize: 13.5 }}>
                    Loading invalid records…
                  </p>
                </div>

              ) : invalidRecords.length === 0 ? (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: 200, flexDirection: "column", gap: 10,
                }}>
                  <CheckCircle2 size={40} color={T.green} />
                  <p style={{ color: T.muted, fontSize: 14, margin: 0 }}>
                    No invalid records found or data not available.
                  </p>
                </div>

              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                  {/* Summary strip */}
                  <div style={{
                    padding: "10px 16px", borderRadius: 10,
                    background: T.redBg,
                    border: "1px solid rgba(204,0,0,0.15)",
                    display: "flex", alignItems: "center", gap: 8,
                    marginBottom: 6,
                  }}>
                    <AlertTriangle size={14} color={T.red} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.red }}>
                      {invalidRecords.length} user{invalidRecords.length !== 1 ? "s" : ""} with invalid entries
                    </span>
                    <span style={{ fontSize: 12.5, color: T.muted, marginLeft: 4 }}>
                      — review the rejection reasons below
                    </span>
                  </div>

                  {/* Records list — user-wise */}
                  {invalidRecords.map((userRecord, i) => {
                    const isExpanded = expandedUser === userRecord.username;
                    return (
                      <div key={i} style={{
                        borderRadius: 12,
                        border: `1px solid ${T.grey200}`,
                        background: T.white,
                        overflow: "hidden",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}>

                        {/* User header row — clickable to expand */}
                        <div
                          onClick={() => setExpandedUser(isExpanded ? null : userRecord.username)}
                          style={{
                            padding: "14px 18px",
                            background: isExpanded ? T.redBg : T.grey100,
                            borderBottom: isExpanded ? `1px solid rgba(204,0,0,0.15)` : "none",
                            display: "flex", alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: "50%",
                              background: T.redBg,
                              border: `2px solid rgba(204,0,0,0.2)`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 13, fontWeight: 800, color: T.red, flexShrink: 0,
                            }}>
                              {(userRecord.username || "?")[0].toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: 0 }}>
                                {userRecord.username}
                              </p>
                              <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
                                {userRecord.total_invalid} invalid entr{userRecord.total_invalid !== 1 ? "ies" : "y"}
                                &nbsp;·&nbsp; {userRecord.field_summary?.length || 0} field{(userRecord.field_summary?.length || 0) !== 1 ? "s" : ""} affected
                              </p>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {userRecord.field_summary?.[0] && (
                              <span style={{
                                fontSize: 11.5, fontWeight: 600,
                                background: T.redBg, color: T.red,
                                padding: "3px 10px", borderRadius: 99,
                                border: "1px solid rgba(204,0,0,0.2)",
                              }}>
                                Most failed: {userRecord.field_summary[0].field}
                              </span>
                            )}
                            {isExpanded
                              ? <ChevronUp size={16} color={T.red} />
                              : <ChevronDown size={16} color={T.muted} />
                            }
                          </div>
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>

                            <p style={{
                              fontSize: 11.5, fontWeight: 700, color: T.muted,
                              textTransform: "uppercase", letterSpacing: 0.6, margin: 0,
                            }}>
                              Field-wise Failure Breakdown
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                              {(userRecord.field_summary || []).map((fs, j) => (
                                <div key={j} style={{
                                  display: "flex", alignItems: "flex-start",
                                  gap: 12, padding: "10px 14px", borderRadius: 9,
                                  background: T.grey100, border: `1px solid ${T.grey200}`,
                                }}>
                                  <XCircle size={14} color={T.red} style={{ marginTop: 2, flexShrink: 0 }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                                        {fs.field}
                                      </span>
                                      <span style={{
                                        fontSize: 11.5, fontWeight: 700,
                                        background: T.redBg, color: T.red,
                                        padding: "1px 8px", borderRadius: 99,
                                        border: "1px solid rgba(204,0,0,0.15)",
                                      }}>
                                        {fs.fail_count} failure{fs.fail_count !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                    {fs.sample_values?.length > 0 && (
                                      <p style={{ fontSize: 12, color: T.muted, margin: "4px 0 0" }}>
                                        Sample bad values:&nbsp;
                                        {fs.sample_values.map((v, k) => (
                                          <span key={k} style={{
                                            background: T.white,
                                            border: `1px solid ${T.grey200}`,
                                            borderRadius: 5, padding: "1px 7px",
                                            fontSize: 11.5, fontWeight: 600,
                                            color: T.text, marginRight: 4,
                                          }}>
                                            "{v}"
                                          </span>
                                        ))}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {userRecord.sample_errors?.length > 0 && (
                              <>
                                <p style={{
                                  fontSize: 11.5, fontWeight: 700, color: T.muted,
                                  textTransform: "uppercase", letterSpacing: 0.6,
                                  margin: "6px 0 0",
                                }}>
                                  Sample Invalid Rows (up to 3)
                                </p>
                                {userRecord.sample_errors.map((rec, k) => (
                                  <div key={k} style={{
                                    borderRadius: 8, overflow: "hidden",
                                    border: `1px solid rgba(204,0,0,0.12)`,
                                  }}>
                                    <div style={{
                                      padding: "7px 12px",
                                      background: T.redBg,
                                      fontSize: 12, fontWeight: 700, color: T.red,
                                    }}>
                                      Row {rec.row_number}
                                    </div>
                                    <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
                                      {rec.errors.map((err, m) => (
                                        <div key={m} style={{
                                          display: "flex", alignItems: "flex-start", gap: 8,
                                          fontSize: 12.5, color: T.text,
                                        }}>
                                          <span style={{ fontWeight: 700, minWidth: 120, color: T.muted }}>
                                            {err.field}:
                                          </span>
                                          <span style={{
                                            background: T.redBg, color: T.red,
                                            padding: "0px 6px", borderRadius: 5,
                                            fontWeight: 600, fontSize: 12,
                                          }}>
                                            "{err.value}"
                                          </span>
                                          <span style={{ color: T.muted, fontSize: 12 }}>
                                            — {err.reason}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5, margin: 0 }}>
            Validation Analytics
          </h2>
          <p style={{ fontSize: 13.5, color: T.muted, marginTop: 4 }}>
            Overview of all form validation metrics and statistics
          </p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 9,
            border: `1px solid ${T.grey200}`,
            background: T.white, color: T.muted,
            fontSize: 13, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: refreshing ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.red; e.currentTarget.style.color = T.red; e.currentTarget.style.background = T.redBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.grey200; e.currentTarget.style.color = T.muted; e.currentTarget.style.background = T.white; }}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? "spin 0.9s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* ── Main row: KPI stack (left) + Chart (right) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "stretch" }}>

        {/* Left: 4 KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 14, height: "100%" }}>
          <StatCard label="Total Forms"   value={total_forms.toLocaleString()} icon={FileSpreadsheet} accent={T.blue}   bg={T.blueBg}   trend={formsTrend}   trendLabel={`form${total_forms !== 1 ? "s" : ""} uploaded`} />
          <StatCard label="Total Rows"    value={total_rows.toLocaleString()}  icon={Rows3}           accent="#8B5CF6" bg="rgba(139,92,246,0.08)" trend={rowsTrend}    trendLabel="valid row rate" />
          <StatCard label="Valid Rows"    value={valid_rows.toLocaleString()}  icon={CheckCircle2}    accent={T.green} bg={T.greenBg}   trend={validPct}     trendLabel="accuracy rate" />
          <StatCard label="Invalid Rows"  value={junk_rows.toLocaleString()}   icon={XCircle}         accent={T.red}   bg={T.redBg}     trend={invalidTrend} trendLabel="invalid row rate" />
        </div>

        {/* Right: Bar chart */}
        <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.grey200}`, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: `1px solid ${T.grey200}`, marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: T.text, margin: 0 }}>Form-wise Validation Distribution</h3>
              <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>Valid vs Invalid rows per form type</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ label: "Valid", color: T.green, bg: T.greenBg }, { label: "Invalid", color: T.red, bg: T.redBg }].map(({ label, color, bg }) => (
                <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: bg, fontSize: 12, fontWeight: 600, color }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, color: T.muted, fontSize: 14 }}>
              <FileSpreadsheet size={32} color={T.grey200} />
              <p style={{ margin: 0 }}>No data yet — upload a file to see analytics</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barCategoryGap="30%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.grey200} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.muted, fontFamily: "'DM Sans', sans-serif" }} axisLine={{ stroke: T.grey200 }} tickLine={false} interval={0} dy={12} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: T.muted, fontFamily: "'DM Sans', sans-serif" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="Valid"   name="Valid"   fill={T.green} radius={[5, 5, 0, 0]} maxBarSize={44} />
                <Bar dataKey="Invalid" name="Invalid" fill={T.red}   radius={[5, 5, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Form summary table ── */}
      {tableData.length > 0 && (
        <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.grey200}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.grey200}` }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>Form Summary</h3>
            <p style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>Aggregated validation results across all uploads</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: T.grey100 }}>
                  {["Form Name", "Total", "Valid", "Invalid", "Accuracy", "Details"].map((h) => (
                    <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, color: T.muted, whiteSpace: "nowrap", borderBottom: `1px solid ${T.grey200}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => {
                  const acc = row.total ? Math.round((row.Valid / row.total) * 100) : 0;
                  return (
                    <tr key={row.name} style={{ background: i % 2 === 0 ? T.white : T.grey100 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(204,0,0,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? T.white : T.grey100)}
                    >
                      <td style={{ padding: "12px 20px", color: T.text, fontWeight: 500, borderBottom: `1px solid ${T.grey200}` }}>{row.name}</td>
                      <td style={{ padding: "12px 20px", color: T.text, borderBottom: `1px solid ${T.grey200}` }}>{row.total.toLocaleString()}</td>
                      <td style={{ padding: "12px 20px", borderBottom: `1px solid ${T.grey200}` }}>
                        <span style={{ color: T.green, fontWeight: 600, background: T.greenBg, padding: "2px 10px", borderRadius: 99, fontSize: 12.5 }}>{row.Valid.toLocaleString()}</span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: `1px solid ${T.grey200}` }}>
                        <span style={{ color: T.red, fontWeight: 600, background: T.redBg, padding: "2px 10px", borderRadius: 99, fontSize: 12.5 }}>{row.Invalid.toLocaleString()}</span>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: `1px solid ${T.grey200}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 99, background: T.grey200, overflow: "hidden", maxWidth: 100 }}>
                            <div style={{ height: "100%", borderRadius: 99, width: `${acc}%`, background: acc >= 70 ? T.green : acc >= 40 ? "#F59E0B" : T.red, transition: "width 0.6s ease" }} />
                          </div>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: T.muted, minWidth: 32 }}>{acc}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 20px", borderBottom: `1px solid ${T.grey200}` }}>
                        {row.Invalid > 0 ? (
                          <button
                            onClick={() => handleViewInvalid(row.name)}
                            style={{
                              padding: "5px 14px", borderRadius: 7,
                              border: `1px solid ${T.grey200}`,
                              background: T.white, color: T.red,
                              fontSize: 12, fontWeight: 700,
                              fontFamily: "'DM Sans', sans-serif",
                              cursor: "pointer", transition: "all 0.15s ease",
                              display: "flex", alignItems: "center", gap: 5,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = T.redBg;
                              e.currentTarget.style.borderColor = T.red;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = T.white;
                              e.currentTarget.style.borderColor = T.grey200;
                            }}
                          >
                            View Invalid
                          </button>
                        ) : (
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: T.green }}>All Valid ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Per-user breakdown table (NEW) ── */}
      {userData.length > 0 && (
        <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.grey200}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{
            padding: "16px 24px", borderBottom: `1px solid ${T.grey200}`,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: T.purpleBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={16} color={T.purple} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>Per-User Validation Summary</h3>
              <p style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>
                Click any row to expand per-form breakdown — {userData.length} user(s) tracked
              </p>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: T.grey100 }}>
                  <th style={{ width: 36, padding: "10px 16px", borderBottom: `1px solid ${T.grey200}` }} />
                  {["User", "Total Rows", "Valid", "Invalid", "Accuracy"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: h === "User" ? "left" : "center", fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, color: T.muted, whiteSpace: "nowrap", borderBottom: `1px solid ${T.grey200}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userData.map((user, i) => (
                  <UserRow key={user.username || i} user={user} index={i} allFormNames={allFormNames} />
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: "10px 24px", borderTop: `1px solid ${T.grey200}`, display: "flex", gap: 16, fontSize: 12, color: T.muted }}>
            <span>🟢 Green = 70%+ accuracy</span>
            <span>🟡 Amber = 40–69%</span>
            <span>🔴 Red = below 40%</span>
            <span style={{ marginLeft: "auto" }}>Click row to expand form-level detail</span>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Dashboard;
