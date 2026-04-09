import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileSpreadsheet, Plus, Trash2, ChevronDown, CheckCircle2,
  Hash, Type, List, Calendar, Clock, Fingerprint, Zap, DollarSign,
  ToggleLeft, User, Info, LayoutDashboard, X,
} from "lucide-react";

/* ─── Design tokens ─────────────────────────────────────────── */
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
  orange:   "#D97706",
  orangeBg: "rgba(217,119,6,0.08)",
  purple:   "#7C3AED",
  purpleBg: "rgba(124,58,237,0.07)",
  overlay:  "rgba(0,0,0,0.45)",
};

/* ─── Field type definitions ─────────────────────────────────── */
const FIELD_TYPES = [
  {
    group: "Identity & System Fields",
    types: [
      { value: "uuid",      label: "UUID (Auto ID)",      icon: Fingerprint, desc: "System-generated unique ID (e.g. 065da08a-743e-4deb-95e4-aad64e98417b)" },
      { value: "system_id", label: "System ID (Mixed ID)", icon: Hash,        desc: "IDs like ST-MAH-OD-0023 or ST_MUM_HPSC_0114" },
      { value: "username",  label: "Username",             icon: User,        desc: "Operator / CreatedUser / ModifiedUser (e.g. yogesh_naykodi_st)" },
    ],
  },
  {
    group: "Text Fields",
    types: [
      { value: "text", label: "Text (Name / Remarks)", icon: Type, desc: "Free text like Name, Site Name, Remarks, Admin Remark" },
    ],
  },
  {
    group: "Meter & Numeric Data",
    types: [
      {
        value: "meter_reading", label: "Meter Reading (Start / Closing)", icon: Zap,
        desc: "Non-negative integer (e.g. 0, 30524)",
        subFields: [
          { key: "min", label: "Min Reading", placeholder: "e.g. 0" },
          { key: "max", label: "Max Reading", placeholder: "e.g. 999999" },
        ],
      },
      { value: "consumption", label: "Total Consumption", icon: Hash, desc: "Auto-calculated or numeric (Closing - Start)" },
      {
        value: "number", label: "General Number", icon: Hash, desc: "Any numeric field (Id, counts, etc.)",
        subFields: [
          { key: "min", label: "Min Value", placeholder: "e.g. 0" },
          { key: "max", label: "Max Value", placeholder: "e.g. 100000" },
        ],
      },
    ],
  },
  {
    group: "Financial Fields",
    types: [
      { value: "inr_rate",   label: "Per Unit Cost (₹)", icon: DollarSign, desc: "Cost per unit (e.g. 8 ₹)" },
      {
        value: "inr_amount", label: "Total Amount (₹)",  icon: DollarSign, desc: "Final bill amount",
        subFields: [
          { key: "min", label: "Min Amount", placeholder: "e.g. 0" },
          { key: "max", label: "Max Amount", placeholder: "e.g. 100000" },
        ],
      },
    ],
  },
  {
    group: "Date & Time Fields",
    types: [
      {
        value: "datetime", label: "DateTime (Reading / Created)", icon: Clock, desc: "e.g. 03/04/2026 14:22:57",
        subFields: [
          { key: "format", label: "Format", type: "select", options: [
            { value: "dd/mm/yyyy hh:mm:ss", label: "DD/MM/YYYY HH:MM:SS" },
            { value: "yyyy-mm-dd hh:mm:ss", label: "YYYY-MM-DD HH:MM:SS" },
          ]},
        ],
      },
      {
        value: "date", label: "Date Only (Reading Month)", icon: Calendar, desc: "Date without time",
        subFields: [
          { key: "format", label: "Format", type: "select", options: [
            { value: "dd/mm/yyyy", label: "DD/MM/YYYY" },
            { value: "yyyy-mm-dd", label: "YYYY-MM-DD" },
          ]},
        ],
      },
    ],
  },
  {
    group: "Approval & Status",
    types: [
      {
        value: "approval_flag", label: "Approved / Rejected", icon: ToggleLeft, desc: "Handles Approved column",
        subFields: [
          { key: "true_values",  label: "Approved Values", placeholder: "e.g. Yes, Approved, 1" },
          { key: "false_values", label: "Rejected Values",  placeholder: "e.g. No, Rejected, 0" },
        ],
      },
    ],
  },
  {
    group: "Dropdown / Fixed Values",
    types: [
      {
        value: "dropdown", label: "Fixed Options", icon: List, desc: "Circle, Technician Name, etc.",
        subFields: [
          { key: "options", label: "Options (comma-separated)", placeholder: "e.g. Circle1, Circle2, Circle3" },
        ],
      },
    ],
  },
];

const FIELD_TYPE_MAP = {};
FIELD_TYPES.forEach((g) => g.types.forEach((t) => { FIELD_TYPE_MAP[t.value] = t; }));

const formatFormName = (value) =>
  value.toLowerCase().split(" ").map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : "")).join(" ");

/* ─── Success Popup ──────────────────────────────────────────── */
function SuccessPopup({ formName, onClose, onGoToDashboard }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: T.overlay,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: T.white,
        borderRadius: 18,
        padding: "36px 32px",
        width: "100%",
        maxWidth: 420,
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        position: "relative",
        animation: "popIn 0.22s ease",
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 30, height: 30, borderRadius: "50%",
            border: `1px solid ${T.grey200}`,
            background: T.grey100, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={14} color={T.muted} />
        </button>

        {/* Green check circle */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: T.greenBg,
          border: `2px solid rgba(5,150,105,0.2)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <CheckCircle2 size={30} color={T.green} />
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: "0 0 8px", fontFamily: "'DM Sans', sans-serif" }}>
          Form Saved!
        </h3>
        <p style={{ fontSize: 13.5, color: T.muted, margin: "0 0 6px", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
          Validation rules for
        </p>
        <p style={{
          fontSize: 14, fontWeight: 700, color: T.blue,
          background: T.blueBg, padding: "6px 14px",
          borderRadius: 8, display: "inline-block",
          margin: "0 0 20px", fontFamily: "'DM Sans', sans-serif",
          border: "1px solid rgba(37,99,235,0.15)",
        }}>
          {formName}
        </p>
        <p style={{ fontSize: 13.5, color: T.muted, margin: "0 0 28px", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
          have been saved successfully. You can now upload data for this form from the dashboard.
        </p>

        {/* CTA button */}
        <button
          onClick={onGoToDashboard}
          style={{
            width: "100%", padding: "12px 20px",
            background: T.red, border: "none", borderRadius: 10,
            color: T.white, fontSize: 14, fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.redDark; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = T.red; e.currentTarget.style.transform = "none"; }}
        >
          <LayoutDashboard size={16} /> Go to Dashboard
        </button>

        {/* Secondary close */}
        <button
          onClick={onClose}
          style={{
            marginTop: 10, width: "100%", padding: "10px 20px",
            background: "transparent", border: `1px solid ${T.grey200}`,
            borderRadius: 10, color: T.muted,
            fontSize: 13.5, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer", transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.grey100; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          Create Another Form
        </button>
      </div>
    </div>
  );
}

/* ─── Section header ─────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, subtitle, accent = T.red, bg = T.redBg }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 16, borderBottom: `1px solid ${T.grey200}`, marginBottom: 18 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
      placeholder={placeholder} value={value} onChange={onChange}
      onBlur={(e) => { setFocused(false); onBlur && onBlur(e); }}
      onFocus={() => setFocused(true)}
      style={{
        width: "100%", padding: "10px 14px", borderRadius: 9,
        border: `1px solid ${focused ? T.red : T.grey200}`,
        fontSize: 13.5, fontFamily: "'DM Sans', sans-serif",
        color: T.text, background: focused ? T.white : T.grey100,
        outline: "none", boxShadow: focused ? "0 0 0 3px rgba(204,0,0,0.10)" : "none",
        transition: "all 0.15s ease", boxSizing: "border-box", ...style,
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
        value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "10px 36px 10px 12px", borderRadius: 9,
          border: `1px solid ${focused ? T.red : T.grey200}`,
          fontSize: 13.5, fontFamily: "'DM Sans', sans-serif",
          color: value ? T.text : T.muted,
          background: focused ? T.white : T.grey100,
          outline: "none", appearance: "none", cursor: "pointer",
          boxShadow: focused ? "0 0 0 3px rgba(204,0,0,0.10)" : "none",
          transition: "all 0.15s ease", boxSizing: "border-box",
        }}
      >
        {children}
      </select>
      <ChevronDown size={14} color={T.muted} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );
}

function FieldTypeSelector({ value, onChange }) {
  return (
    <StyledSelect value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select field type…</option>
      {FIELD_TYPES.map((group) => (
        <optgroup key={group.group} label={group.group}>
          {group.types.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </optgroup>
      ))}
    </StyledSelect>
  );
}

function SubFields({ typeDef, rule, onChange }) {
  if (!typeDef?.subFields?.length) return null;
  return (
    <>
      {typeDef.subFields.map((sf) => (
        <div key={sf.key}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
            {sf.label}
          </label>
          {sf.type === "select" ? (
            <StyledSelect value={rule?.[sf.key] || ""} onChange={(e) => onChange(sf.key, e.target.value)}>
              <option value="">Select…</option>
              {sf.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </StyledSelect>
          ) : (
            <StyledInput placeholder={sf.placeholder} value={rule?.[sf.key] || ""} onChange={(e) => onChange(sf.key, e.target.value)} />
          )}
        </div>
      ))}
    </>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
const CreateForm = () => {
  const [searchParams] = useSearchParams();

  const [formName, setFormName]       = useState("");
  const [columns, setColumns]         = useState([{ name: "" }]);
  const [rules, setRules]             = useState({});
  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState({ type: "", text: "" });
  const [showPopup, setShowPopup]     = useState(false);
  const [savedFormName, setSavedFormName] = useState("");

  /* ── Pre-fill from redirect ── */
  useEffect(() => {
    const preFilledForm = searchParams.get("form");
    if (preFilledForm) {
      const formatted = formatFormName(decodeURIComponent(preFilledForm));
      setFormName(formatted);
      try {
        const stored = sessionStorage.getItem("prefill_columns");
        if (stored) {
          const headers = JSON.parse(stored);
          if (Array.isArray(headers) && headers.length > 0) {
            setColumns(headers.map((h) => ({ name: h })));
            sessionStorage.removeItem("prefill_columns");
            setMessage({ type: "info", text: `Redirected to define rules for "${formatted}". We detected ${headers.length} column(s) — review them and set validation rules, then click Save.` });
            return;
          }
        }
      } catch { /* ignore */ }
      setMessage({ type: "info", text: `You were redirected to define validation rules for "${formatted}". Add columns and rules below, then click Save.` });
    }
  }, [searchParams]);

  /* ── Reset ── */
  const resetPage = () => {
    setFormName(""); setColumns([{ name: "" }]); setRules({});
    setLoading(false); setMessage({ type: "", text: "" }); setShowPopup(false); setSavedFormName("");
  };

  /* ── Column helpers ── */
  const addColumn = () => setColumns((p) => [...p, { name: "" }]);

  const removeColumn = (idx) => {
    const removed = columns[idx]?.name;
    setColumns((p) => p.filter((_, i) => i !== idx));
    if (removed) setRules((p) => { const n = { ...p }; delete n[removed]; return n; });
  };

  const updateColumnName = (idx, value) => {
    const oldName = columns[idx]?.name;
    setColumns((p) => p.map((c, i) => (i === idx ? { name: value } : c)));
    if (oldName && oldName !== value) {
      setRules((p) => {
        const n = { ...p };
        if (n[oldName]) { n[value] = n[oldName]; delete n[oldName]; }
        return n;
      });
    }
  };

  const handleRuleChange = (col, field, value) =>
    setRules((p) => ({ ...p, [col]: { ...p[col], [field]: value } }));

  const handleTypeChange = (col, newType) =>
    setRules((p) => ({ ...p, [col]: { required: p[col]?.required || false, type: newType } }));

  /* ── Save Rules only (no template creation) ── */
  const handleSaveRules = async () => {
    const trimmedName = formName.trim();
    const validCols   = columns.map((c) => c.name.trim()).filter(Boolean);

    if (!trimmedName || !validCols.length) {
      setMessage({ type: "error", text: "Please enter a form name and at least one column." });
      return;
    }

    const formatted = formatFormName(trimmedName);
    setFormName(formatted);
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const saveRes = await fetch("http://localhost:8000/SAVE-FORM-RULES", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_name: formatted, columns: validCols, rules }),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        setMessage({ type: "error", text: err.detail || "Failed to save form rules." });
        setLoading(false);
        return;
      }

      /* ✅ Success — show popup */
      setSavedFormName(formatted);
      setShowPopup(true);

    } catch {
      setMessage({ type: "error", text: "Unable to reach the server. Please try again." });
    }

    setLoading(false);
  };

  /* ── Dashboard navigation ── */
  const handleGoToDashboard = () => {
    setShowPopup(false);
    /* Replace with your actual routing — e.g. navigate("/dashboard") */
    window.location.href = "/dashboard";
  };

  const validColumns = columns.map((c) => c.name.trim()).filter(Boolean);

  /* ─────────────────── RENDER ─────────────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Success Popup ── */}
      {showPopup && (
        <SuccessPopup
          formName={savedFormName}
          onClose={resetPage}
          onGoToDashboard={handleGoToDashboard}
        />
      )}

      {/* ── Page header ── */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5, margin: 0 }}>
          Create Form Template
        </h2>
        <p style={{ fontSize: 13.5, color: T.muted, marginTop: 4 }}>
          Define a new form structure and save its validation rules
        </p>
      </div>

      {/* ── Banner ── */}
      {message.text && (
        <div style={{
          padding: "12px 16px", borderRadius: 9,
          background: message.type === "success" ? T.greenBg : message.type === "info" ? T.orangeBg : T.redBg,
          border: `1px solid ${message.type === "success" ? "rgba(5,150,105,0.2)" : message.type === "info" ? "rgba(217,119,6,0.2)" : "rgba(204,0,0,0.18)"}`,
          color: message.type === "success" ? T.green : message.type === "info" ? T.orange : T.red,
          fontSize: 13.5, fontWeight: 500,
          borderLeft: `3px solid ${message.type === "success" ? T.green : message.type === "info" ? T.orange : T.red}`,
          display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.6,
        }}>
          {message.type === "success" && <CheckCircle2 size={15} color={T.green} style={{ marginTop: 2, flexShrink: 0 }} />}
          {message.text}
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

        {/* ── LEFT: Form Name + Columns ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Form Name */}
          <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.grey200}`, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <SectionHeader icon={FileSpreadsheet} title="Form Details" subtitle="Enter a name for this template" />
            <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.6, display: "block", marginBottom: 7 }}>
              Form Name
            </label>
            <StyledInput
              placeholder="e.g. EB Meter Form"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onBlur={(e) => setFormName(formatFormName(e.target.value))}
            />
            {formName.trim() && (
              <p style={{ fontSize: 12, color: T.muted, marginTop: 8, margin: "8px 0 0" }}>
                Will be saved as: <strong style={{ color: T.text }}>{formatFormName(formName)}</strong>
              </p>
            )}
          </div>

          {/* Columns */}
          <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.grey200}`, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <SectionHeader icon={FileSpreadsheet} title="Column Names" subtitle="Add all columns this form should have" />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {columns.map((col, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: T.grey100, border: `1px solid ${T.grey200}`,
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

            <button
              onClick={addColumn}
              style={{
                marginTop: 14, width: "100%", padding: "9px 14px",
                borderRadius: 9, border: `1.5px dashed ${T.grey200}`,
                background: "transparent", color: T.muted,
                fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 6, transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.red; e.currentTarget.style.color = T.red; e.currentTarget.style.background = T.redBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.grey200; e.currentTarget.style.color = T.muted; e.currentTarget.style.background = "transparent"; }}
            >
              <Plus size={14} /> Add Column
            </button>
          </div>
        </div>

        {/* ── RIGHT: Validation Rules ── */}
        <div style={{ background: T.white, borderRadius: 14, border: `1px solid ${T.grey200}`, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <SectionHeader icon={FileSpreadsheet} title="Validation Rules" subtitle="Configure rules for each column" accent={T.blue} bg={T.blueBg} />

          {validColumns.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: T.muted, fontSize: 13.5, background: T.grey100, borderRadius: 10, border: `1.5px dashed ${T.grey200}` }}>
              Add columns on the left to configure validation rules
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {validColumns.map((col) => {
                const rule    = rules[col] || {};
                const typeVal = rule.type || "";
                const typeDef = FIELD_TYPE_MAP[typeVal];

                return (
                  <div key={col} style={{
                    borderRadius: 10,
                    border: `1px solid ${typeVal ? T.blue + "44" : T.grey200}`,
                    background: typeVal ? T.blueBg : T.grey100,
                    overflow: "hidden", transition: "border-color 0.2s, background 0.2s",
                  }}>
                    {/* Column header strip */}
                    <div style={{
                      padding: "10px 14px", background: T.white,
                      borderBottom: `1px solid ${T.grey200}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {typeDef ? <typeDef.icon size={13} color={T.blue} /> : <FileSpreadsheet size={13} color={T.muted} />}
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{col}</span>
                        {typeDef && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: T.blue, background: T.blueBg, padding: "2px 8px", borderRadius: 99, border: "1px solid rgba(37,99,235,0.15)" }}>
                            {typeDef.label}
                          </span>
                        )}
                      </div>

                      {/* Required toggle */}
                      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", userSelect: "none" }}>
                        <div
                          onClick={() => handleRuleChange(col, "required", !rule.required)}
                          style={{ width: 36, height: 20, borderRadius: 99, background: rule.required ? T.red : T.grey200, position: "relative", cursor: "pointer", transition: "background 0.2s ease", flexShrink: 0 }}
                        >
                          <div style={{ width: 14, height: 14, borderRadius: "50%", background: T.white, position: "absolute", top: 3, left: rule.required ? 19 : 3, transition: "left 0.2s ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Required</span>
                      </label>
                    </div>

                    {/* Rule body */}
                    <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 6 }}>
                          Field Type
                        </label>
                        <FieldTypeSelector value={typeVal} onChange={(v) => handleTypeChange(col, v)} />
                      </div>

                      {typeDef?.desc && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "8px 10px", borderRadius: 7, background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)" }}>
                          <Info size={12} color={T.blue} style={{ marginTop: 1, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: T.blue, lineHeight: 1.5 }}>{typeDef.desc}</span>
                        </div>
                      )}

                      <SubFields typeDef={typeDef} rule={rule} onChange={(field, val) => handleRuleChange(col, field, val)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Action row ── */}
      <div style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
        <button
          onClick={handleSaveRules}
          disabled={loading}
          style={{
            flex: 1, padding: "13px 20px",
            background: loading ? T.grey200 : T.red,
            border: "none", borderRadius: 10,
            color: loading ? T.muted : T.white,
            fontSize: 14, fontWeight: 700,
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
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid rgba(0,0,0,0.15)`, borderTop: `2px solid ${T.muted}`, animation: "spin 0.8s linear infinite" }} />
              Saving…
            </>
          ) : (
            <><FileSpreadsheet size={16} /> Save Form Rules</>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes popIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
};

export default CreateForm;