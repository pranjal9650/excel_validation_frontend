import React, { useState, useEffect } from "react";
import { FileSpreadsheet, Search, ChevronDown, X } from "lucide-react";

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

/* ─── Badge ──────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const isValid = String(status).toLowerCase() === "valid";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
      background: isValid ? T.greenBg : T.redBg,
      color: isValid ? T.green : T.red,
    }}>
      {isValid ? "Valid" : "Invalid"}
    </span>
  );
}

/* ─── Form tag chip ──────────────────────────────────────────── */
function FormChip({ label, onRemove }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px 4px 12px", borderRadius: 99,
        fontSize: 12.5, fontWeight: 600,
        background: hovered ? T.redBg : "rgba(204,0,0,0.06)",
        color: T.red,
        border: `1px solid rgba(204,0,0,0.18)`,
        cursor: "pointer",
        transition: "all 0.15s ease",
        userSelect: "none",
      }}
      onClick={onRemove}
    >
      {label}
      <X size={11} />
    </span>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
function FormData() {
  const [allFormTypes, setAllFormTypes]     = useState([]);
  const [selectedForms, setSelectedForms]   = useState([]);
  const [data, setData]                     = useState([]);
  const [loading, setLoading]               = useState(false);
  const [formsLoading, setFormsLoading]     = useState(true);
  const [message, setMessage]               = useState("");
  const [searchUsername, setSearchUsername] = useState("");
  const [searchFocused, setSearchFocused]   = useState(false);

  // ── Fetch all available form types from backend on mount ──
  useEffect(() => {
    fetch("http://127.0.0.1:8000/GET-FORM-NAMES")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter out "Others" — it's a meta-option, not a real form
          setAllFormTypes(data.filter((f) => f !== "Others"));
        }
      })
      .catch(() => setAllFormTypes([]))
      .finally(() => setFormsLoading(false));
  }, []);

  /* ── Form selection ── */
  const toggleForm = (value) => {
    if (value === "") return;
    if (value === "ALL") {
      setSelectedForms(
        selectedForms.length === allFormTypes.length ? [] : [...allFormTypes]
      );
      return;
    }
    setSelectedForms((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  /* ── Fetch records ── */
  const fetchData = async () => {
    if (!selectedForms.length) {
      setMessage("Please select at least one form type.");
      return;
    }
    setLoading(true);
    setMessage("");
    setData([]);
    try {
      const queryForms =
        selectedForms.length === allFormTypes.length
          ? "ALL"
          : selectedForms.join(",");

      const res    = await fetch(`http://127.0.0.1:8000/FORM-DATA-MULTI?forms=${encodeURIComponent(queryForms)}`);
      const result = await res.json();

      if (!Array.isArray(result) || result.length === 0) {
        setMessage("No records found for the selected forms.");
        setData([]);
      } else {
        setData(result);
      }
    } catch {
      setMessage("Unable to reach the server. Please try again.");
    }
    setLoading(false);
  };

  /* ── Filtered rows ── */
  const filteredData = data.filter((row) => {
    if (!searchUsername) return true;
    return String(row.username || "").toLowerCase().includes(searchUsername.toLowerCase());
  });

  const visibleRows = filteredData.slice(0, 200);

  /* ─────────────────── RENDER ─────────────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, fontFamily: "'DM Sans', sans-serif" }}>

      {/* Page header */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5, margin: 0 }}>
          Form Data Viewer
        </h2>
        <p style={{ fontSize: 13.5, color: T.muted, marginTop: 4 }}>
          View and filter submissions across all form types
        </p>
      </div>

      {/* ── Filter card ── */}
      <div style={{
        background: T.white,
        borderRadius: 14,
        border: `1px solid ${T.grey200}`,
        padding: "22px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        {/* Card header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          paddingBottom: 16, borderBottom: `1px solid ${T.grey200}`, marginBottom: 18,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: T.redBg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FileSpreadsheet size={17} color={T.red} />
          </div>
          <div>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: T.text, margin: 0 }}>Select Forms</p>
            <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>
              {formsLoading ? "Loading form types…" : `${allFormTypes.length} form type(s) available`}
            </p>
          </div>
        </div>

        {/* Dropdown */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <select
            onChange={(e) => toggleForm(e.target.value)}
            value=""
            disabled={formsLoading}
            style={{
              width: "100%",
              padding: "10px 40px 10px 14px",
              borderRadius: 9,
              border: `1px solid ${T.grey200}`,
              fontSize: 13.5,
              fontFamily: "'DM Sans', sans-serif",
              color: T.text,
              background: T.grey100,
              outline: "none",
              appearance: "none",
              cursor: formsLoading ? "not-allowed" : "pointer",
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
          >
            <option value="">— Select a form —</option>
            {allFormTypes.length > 0 && (
              <option value="ALL">⭐ Select All ({allFormTypes.length} forms)</option>
            )}
            {allFormTypes.map((f) => (
              <option key={f} value={f} disabled={selectedForms.includes(f)}>
                {f} {selectedForms.includes(f) ? "✓" : ""}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15} color={T.muted}
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
          />
        </div>

        {/* Selected chips */}
        {selectedForms.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
            {selectedForms.map((f) => (
              <FormChip key={f} label={f} onRemove={() => toggleForm(f)} />
            ))}
          </div>
        )}

        {/* Fetch button */}
        <button
          onClick={fetchData}
          disabled={loading || formsLoading || selectedForms.length === 0}
          style={{
            width: "100%",
            padding: "12px",
            background: loading || selectedForms.length === 0 ? "#e5e5e5" : T.red,
            border: "none",
            borderRadius: 9,
            color: loading || selectedForms.length === 0 ? T.muted : T.white,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            cursor: loading || selectedForms.length === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            if (!loading && selectedForms.length > 0) {
              e.currentTarget.style.background  = T.redDark;
              e.currentTarget.style.transform   = "translateY(-1px)";
              e.currentTarget.style.boxShadow   = "0 6px 18px rgba(204,0,0,0.28)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = loading || selectedForms.length === 0 ? "#e5e5e5" : T.red;
            e.currentTarget.style.transform  = "none";
            e.currentTarget.style.boxShadow  = "none";
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 14, height: 14, borderRadius: "50%",
                border: `2px solid rgba(0,0,0,0.15)`,
                borderTop: `2px solid ${T.muted}`,
                animation: "spin 0.8s linear infinite",
              }} />
              Loading...
            </>
          ) : "Fetch Records"}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Error / empty message */}
      {message && (
        <div style={{
          padding: "12px 16px", borderRadius: 9,
          background: T.redBg, border: `1px solid rgba(204,0,0,0.18)`,
          color: T.red, fontSize: 13.5, fontWeight: 500,
          borderLeft: `3px solid ${T.red}`,
        }}>
          {message}
        </div>
      )}

      {/* Results table */}
      {data.length > 0 && !loading && (
        <div style={{
          background: T.white, borderRadius: 14,
          border: `1px solid ${T.grey200}`,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          {/* Table header bar */}
          <div style={{
            padding: "18px 24px",
            borderBottom: `1px solid ${T.grey200}`,
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>Results</h3>
              <p style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>
                Showing {visibleRows.length} of {filteredData.length} records
                {data.length !== filteredData.length && ` (${data.length} total)`}
              </p>
            </div>

            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: searchFocused ? T.white : T.grey100,
              border: `1px solid ${searchFocused ? T.red : T.grey200}`,
              borderRadius: 9, padding: "8px 12px", width: 240,
              transition: "all 0.15s ease",
              boxShadow: searchFocused ? "0 0 0 3px rgba(204,0,0,0.10)" : "none",
            }}>
              <Search size={13} color={T.muted} style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by username…"
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
              {searchUsername && (
                <X size={12} color={T.muted} style={{ cursor: "pointer", flexShrink: 0 }}
                  onClick={() => setSearchUsername("")} />
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 600 }}>
              <thead>
                <tr style={{ background: T.grey100 }}>
                  {["#", "Form Type", "Username", "Status", "Date"].map((h) => (
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
                {visibleRows.map((row, i) => (
                  <tr
                    key={i}
                    style={{ background: i % 2 === 0 ? T.white : T.grey100 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(204,0,0,0.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? T.white : T.grey100)}
                  >
                    <td style={{ padding: "12px 20px", color: T.muted, fontSize: 12.5, borderBottom: `1px solid ${T.grey200}` }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "12px 20px", color: T.text, fontWeight: 500, borderBottom: `1px solid ${T.grey200}` }}>
                      {row.form_type}
                    </td>
                    <td style={{ padding: "12px 20px", color: T.text, borderBottom: `1px solid ${T.grey200}` }}>
                      {row.username || "N/A"}
                    </td>
                    <td style={{ padding: "12px 20px", borderBottom: `1px solid ${T.grey200}` }}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td style={{ padding: "12px 20px", color: T.muted, fontSize: 13, borderBottom: `1px solid ${T.grey200}` }}>
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length > 200 && (
            <div style={{
              padding: "12px 24px",
              borderTop: `1px solid ${T.grey200}`,
              fontSize: 12.5, color: T.muted, textAlign: "center",
            }}>
              Showing first 200 of {filteredData.length} records. Use search to narrow results.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FormData;