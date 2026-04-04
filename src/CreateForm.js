import React, { useState } from "react";
import { FileSpreadsheet, Plus, Trash2, ChevronDown, Download, CheckCircle2 } from "lucide-react";

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
  blueBg:   "rgba(37,99,235,0.07)",
  blue:     "#2563EB",
  text:     "#111111",
  muted:    "#71717A",
};

/* ─── Format form name to Capital Case ──────────────────────── */
const formatFormName = (value) =>
  value
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ""))
    .join(" ");

/* ─── Section header ─────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, subtitle, accent = T.red, bg = T.redBg }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      paddingBottom: 16, borderBottom: `1px solid ${T.grey200}`, marginBottom: 18,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: bg, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={17} color={accent} />
      </div>
      <div>
        <p style={{ fontSize: 14.5, fontWeight: 700, color: T.text, margin: 0 }}>{title}</p>
        <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{subtitle}</p>
      </div>
    </div>
  );
}

/* ─── Styled input ───────────────────────────────────────────── */
function StyledInput({ placeholder, value, onChange, onBlur, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={(e) => { setFocused(false); onBlur && onBlur(e); }}
      onFocus={() => setFocused(true)}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: 9,
        border: `1px solid ${focused ? T.red : T.grey200}`,
        fontSize: 13.5,
        fontFamily: "'DM Sans', sans-serif",
        color: T.text,
        background: focused ? T.white : T.grey100,
        outline: "none",
        boxShadow: focused ? "0 0 0 3px rgba(204,0,0,0.10)" : "none",
        transition: "all 0.15s ease",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}

/* ─── Styled select ──────────────────────────────────────────── */
function StyledSelect({ value, onChange, children, style = {} }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative", ...style }}>
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "10px 36px 10px 12px",
          borderRadius: 9,
          border: `1px solid ${focused ? T.red : T.grey200}`,
          fontSize: 13.5,
          fontFamily: "'DM Sans', sans-serif",
          color: T.text,
          background: focused ? T.white : T.grey100,
          outline: "none",
          appearance: "none",
          cursor: "pointer",
          boxShadow: focused ? "0 0 0 3px rgba(204,0,0,0.10)" : "none",
          transition: "all 0.15s ease",
          boxSizing: "border-box",
        }}
      >
        {children}
      </select>
      <ChevronDown
        size={14} color={T.muted}
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
const CreateForm = () => {
  const [formName, setFormName]           = useState("");
  const [columns, setColumns]             = useState([{ name: "" }]);
  const [rules, setRules]                 = useState({});
  const [downloadUrl, setDownloadUrl]     = useState("");
  const [savedFormName, setSavedFormName] = useState(""); // the exact name sent to backend
  const [loading, setLoading]             = useState(false);
  const [message, setMessage]             = useState({ type: "", text: "" });

  /* ── Reset entire page to initial state ── */
  const resetPage = () => {
    setFormName("");
    setColumns([{ name: "" }]);
    setRules({});
    setDownloadUrl("");
    setSavedFormName("");
    setLoading(false);
    setMessage({ type: "", text: "" });
  };

  /* ── Column helpers ── */
  const addColumn = () => setColumns((prev) => [...prev, { name: "" }]);

  const removeColumn = (idx) => {
    const removed = columns[idx]?.name;
    setColumns((prev) => prev.filter((_, i) => i !== idx));
    if (removed) {
      setRules((prev) => {
        const next = { ...prev };
        delete next[removed];
        return next;
      });
    }
  };

  const updateColumnName = (idx, value) => {
    const oldName = columns[idx]?.name;
    setColumns((prev) => prev.map((c, i) => (i === idx ? { name: value } : c)));
    if (oldName && oldName !== value) {
      setRules((prev) => {
        const next = { ...prev };
        if (next[oldName]) {
          next[value] = next[oldName];
          delete next[oldName];
        }
        return next;
      });
    }
  };

  const handleRuleChange = (col, field, value) =>
    setRules((prev) => ({ ...prev, [col]: { ...prev[col], [field]: value } }));

  /* ── Create file ── */
  const handleCreateFile = async () => {
    const trimmedName = formName.trim();
    const validCols   = columns.map((c) => c.name.trim()).filter(Boolean);

    if (!trimmedName || !validCols.length) {
      setMessage({ type: "error", text: "Please enter a form name and at least one column." });
      return;
    }

    // Always send Capital Case formatted name
    const formatted = formatFormName(trimmedName);
    setFormName(formatted);
    setSavedFormName(formatted);

    setLoading(true);
    setMessage({ type: "", text: "" });
    setDownloadUrl("");

    try {
      const res = await fetch("http://localhost:8000/CREATE-FILE", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_name: formatted,
          columns:   validCols,
          rules:     rules,
        }),
      });
      const data = await res.json();

      if (data.download_url) {
        setDownloadUrl("http://localhost:8000" + data.download_url);
        setMessage({
          type: "success",
          text: `"${formatted}" template created successfully. Click Download to save it.`,
        });
      } else {
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
      }
    } catch {
      setMessage({ type: "error", text: "Unable to reach the server. Please try again." });
    }
    setLoading(false);
  };

  /* ── Download → triggers browser save with correct filename → resets page ── */
  const handleDownload = async () => {
    try {
      // Fetch the file as a blob so the browser uses our filename, not the URL path
      const res = await fetch(downloadUrl);
      const blob = await res.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${savedFormName}.xlsx`; // forces the correct filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Reset the page after a short delay
      setTimeout(resetPage, 800);
    } catch {
      // Fallback: open in new tab if blob fetch fails
      window.open(downloadUrl, "_blank", "noreferrer");
      setTimeout(resetPage, 800);
    }
  };

  const validColumns = columns.map((c) => c.name.trim()).filter(Boolean);

  /* ─────────────────── RENDER ─────────────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Page header ── */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5, margin: 0 }}>
          Create Form Template
        </h2>
        <p style={{ fontSize: 13.5, color: T.muted, marginTop: 4 }}>
          Define a new form structure and generate a downloadable Excel template
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ── LEFT: Form Name + Columns ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Form Name card */}
          <div style={{
            background: T.white, borderRadius: 14,
            border: `1px solid ${T.grey200}`,
            padding: "22px 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}>
            <SectionHeader
              icon={FileSpreadsheet}
              title="Form Details"
              subtitle="Enter a name for this template"
            />
            <label style={{
              fontSize: 12, fontWeight: 600, color: T.muted,
              textTransform: "uppercase", letterSpacing: 0.6,
              display: "block", marginBottom: 7,
            }}>
              Form Name
            </label>
            <StyledInput
              placeholder="e.g. Site Survey Checklist"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onBlur={(e) => setFormName(formatFormName(e.target.value))}
            />
            {formName.trim() && (
              <p style={{ fontSize: 12, color: T.muted, marginTop: 8, margin: "8px 0 0" }}>
                Will be saved as:{" "}
                <strong style={{ color: T.text, fontWeight: 700 }}>
                  {formatFormName(formName)}.xlsx
                </strong>
              </p>
            )}
          </div>

          {/* Columns card */}
          <div style={{
            background: T.white, borderRadius: 14,
            border: `1px solid ${T.grey200}`,
            padding: "22px 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}>
            <SectionHeader
              icon={FileSpreadsheet}
              title="Column Names"
              subtitle="Add all columns this form should have"
            />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {columns.map((col, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: T.grey100,
                    border: `1px solid ${T.grey200}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: T.muted, flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <StyledInput
                      placeholder={`Column ${idx + 1} name`}
                      value={col.name}
                      onChange={(e) => updateColumnName(idx, e.target.value)}
                    />
                  </div>
                  {columns.length > 1 && (
                    <button
                      onClick={() => removeColumn(idx)}
                      title="Remove column"
                      style={{
                        width: 34, height: 34, borderRadius: 8,
                        border: `1px solid ${T.grey200}`,
                        background: T.white, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = T.redBg; e.currentTarget.style.borderColor = T.red; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = T.white; e.currentTarget.style.borderColor = T.grey200; }}
                    >
                      <Trash2 size={14} color={T.red} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add column button */}
            <button
              onClick={addColumn}
              style={{
                marginTop: 14, width: "100%",
                padding: "9px 14px",
                borderRadius: 9,
                border: `1.5px dashed ${T.grey200}`,
                background: "transparent",
                color: T.muted,
                fontSize: 13, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.red; e.currentTarget.style.color = T.red; e.currentTarget.style.background = T.redBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.grey200; e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "transparent"; }}
            >
              <Plus size={14} /> Add Column
            </button>
          </div>
        </div>

        {/* ── RIGHT: Validation Rules ── */}
        <div style={{
          background: T.white, borderRadius: 14,
          border: `1px solid ${T.grey200}`,
          padding: "22px 24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <SectionHeader
            icon={FileSpreadsheet}
            title="Validation Rules"
            subtitle="Configure rules for each column"
            accent={T.blue}
            bg={T.blueBg}
          />

          {validColumns.length === 0 ? (
            <div style={{
              padding: "40px 20px",
              textAlign: "center",
              color: T.muted,
              fontSize: 13.5,
              background: T.grey100,
              borderRadius: 10,
              border: `1.5px dashed ${T.grey200}`,
            }}>
              Add columns on the left to configure validation rules
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {validColumns.map((col) => {
                const type = rules[col]?.type || "";
                return (
                  <div key={col} style={{
                    borderRadius: 10,
                    border: `1px solid ${T.grey200}`,
                    background: T.grey100,
                    overflow: "hidden",
                  }}>
                    {/* Column header strip */}
                    <div style={{
                      padding: "10px 14px",
                      background: T.white,
                      borderBottom: `1px solid ${T.grey200}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{col}</span>

                      {/* Required toggle */}
                      <label style={{
                        display: "flex", alignItems: "center", gap: 6,
                        cursor: "pointer", userSelect: "none",
                      }}>
                        <div
                          onClick={() => handleRuleChange(col, "required", !rules[col]?.required)}
                          style={{
                            width: 36, height: 20, borderRadius: 99,
                            background: rules[col]?.required ? T.red : T.grey200,
                            position: "relative", cursor: "pointer",
                            transition: "background 0.2s ease", flexShrink: 0,
                          }}
                        >
                          <div style={{
                            width: 14, height: 14, borderRadius: "50%",
                            background: T.white,
                            position: "absolute",
                            top: 3,
                            left: rules[col]?.required ? 19 : 3,
                            transition: "left 0.2s ease",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Required</span>
                      </label>
                    </div>

                    {/* Rule body */}
                    <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <label style={{
                          fontSize: 11.5, fontWeight: 600, color: T.muted,
                          textTransform: "uppercase", letterSpacing: 0.5,
                          display: "block", marginBottom: 6,
                        }}>
                          Field Type
                        </label>
                        <StyledSelect
                          value={type}
                          onChange={(e) => handleRuleChange(col, "type", e.target.value)}
                        >
                          <option value="">Select type…</option>
                          <option value="text">Manual Entry</option>
                          <option value="number">Number</option>
                          <option value="email">Email</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="date">Date</option>
                        </StyledSelect>
                      </div>

                      {type === "dropdown" && (
                        <div>
                          <label style={{
                            fontSize: 11.5, fontWeight: 600, color: T.muted,
                            textTransform: "uppercase", letterSpacing: 0.5,
                            display: "block", marginBottom: 6,
                          }}>
                            Options (comma-separated)
                          </label>
                          <StyledInput
                            placeholder="e.g. Option A, Option B, Option C"
                            value={rules[col]?.options || ""}
                            onChange={(e) => handleRuleChange(col, "options", e.target.value)}
                          />
                        </div>
                      )}

                      {type === "date" && (
                        <div>
                          <label style={{
                            fontSize: 11.5, fontWeight: 600, color: T.muted,
                            textTransform: "uppercase", letterSpacing: 0.5,
                            display: "block", marginBottom: 6,
                          }}>
                            Date Format
                          </label>
                          <StyledSelect
                            value={rules[col]?.format || ""}
                            onChange={(e) => handleRuleChange(col, "format", e.target.value)}
                          >
                            <option value="">Select format…</option>
                            <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                            <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                            <option value="yyyy/mm/dd">YYYY/MM/DD</option>
                          </StyledSelect>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Status message ── */}
      {message.text && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 9,
          background: message.type === "success" ? T.greenBg : T.redBg,
          border: `1px solid ${message.type === "success" ? "rgba(5,150,105,0.2)" : "rgba(204,0,0,0.18)"}`,
          color: message.type === "success" ? T.green : T.red,
          fontSize: 13.5,
          fontWeight: 500,
          borderLeft: `3px solid ${message.type === "success" ? T.green : T.red}`,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {message.type === "success" && <CheckCircle2 size={15} color={T.green} />}
          {message.text}
        </div>
      )}

      {/* ── Action row ── */}
      <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>

        {/* Create Excel button */}
        <button
          onClick={handleCreateFile}
          disabled={loading}
          style={{
            flex: 1,
            padding: "13px 20px",
            background: loading ? T.grey200 : T.red,
            border: "none",
            borderRadius: 10,
            color: loading ? T.muted : T.white,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = T.redDark; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(204,0,0,0.28)"; } }}
          onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = T.red; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; } }}
        >
          {loading ? (
            <>
              <div style={{
                width: 14, height: 14, borderRadius: "50%",
                border: `2px solid rgba(0,0,0,0.15)`,
                borderTop: `2px solid ${T.muted}`,
                animation: "spin 0.8s linear infinite",
              }} />
              Creating…
            </>
          ) : (
            <>
              <FileSpreadsheet size={16} />
              Create Excel Template
            </>
          )}
        </button>

        {/* Download button — fetches as blob to force correct filename, then resets page */}
        {downloadUrl && (
          <button
            onClick={handleDownload}
            style={{
              padding: "13px 24px",
              background: T.greenBg,
              border: `1px solid rgba(5,150,105,0.25)`,
              borderRadius: 10,
              color: T.green,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(5,150,105,0.14)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = T.greenBg; e.currentTarget.style.transform = "none"; }}
          >
            <Download size={16} color={T.green} />
            Download File
          </button>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CreateForm;