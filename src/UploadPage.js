import React, { useState } from "react";
import { Upload, CheckCircle2, FileSpreadsheet, Loader2 } from "lucide-react";

const FORM_TYPES = [
  "Meeting Form",
  "EB Meter Form",
  "Leave Form",
  "OD Survey Form",
  "Site Survey Checklist",
  "OD Operation Form",
  "FTTH Acquisition Form",
];

const T = {
  red:     "#CC0000",
  redDark: "#A30000",
  redBg:   "rgba(204,0,0,0.07)",
  black:   "#111111",
  grey200: "#E4E4E7",
  grey100: "#F4F4F5",
  white:   "#FFFFFF",
  muted:   "#71717A",
  green:   "#059669",
  greenBg: "rgba(5,150,105,0.08)",
};

/* ─── Labelled field wrapper ─────────────────────────────── */
function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: T.black }}>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Shared input style ─────────────────────────────────── */
function inputStyle(focused) {
  return {
    padding: "10px 12px",
    borderRadius: 9,
    border: `1px solid ${focused ? T.red : T.grey200}`,
    fontSize: 13.5,
    fontFamily: "'DM Sans', sans-serif",
    color: T.black,
    background: focused ? T.white : T.grey100,
    outline: "none",
    width: "100%",
    transition: "all 0.15s ease",
    boxShadow: focused ? "0 0 0 3px rgba(204,0,0,0.10)" : "none",
  };
}

function FocusInput({ type, value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={inputStyle(focused)}
    />
  );
}

function FocusSelect({ value, onChange, children }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle(focused), cursor: "pointer" }}
    >
      {children}
    </select>
  );
}

/* ─── Main component ─────────────────────────────────────── */
function UploadPage() {
  const [formType, setFormType]         = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [file, setFile]                 = useState(null);
  const [loading, setLoading]           = useState(false);
  const [dragOver, setDragOver]         = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleUpload = async () => {
    if (!formType || !selectedDate || !file) {
      alert("Please complete all fields.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("form_type", formType);
    formData.append("date", selectedDate);
    try {
      const res = await fetch("http://127.0.0.1:8000/VALIDATE-FORM", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.detail || "Upload failed.");
      } else {
        alert("✅ File uploaded successfully!");
      }
    } catch {
      alert("Upload failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      minHeight: "calc(100vh - 140px)",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* ── Card ─────────────────────────────────────────── */}
        <div style={{
          background: T.white,
          borderRadius: 16,
          border: `1px solid ${T.grey200}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${T.grey200}`,
            textAlign: "center",
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: T.redBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px",
            }}>
              <Upload size={22} color={T.red} />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: T.black, margin: 0 }}>
              Upload Excel File
            </h2>
            <p style={{ fontSize: 12.5, color: T.muted, marginTop: 4 }}>
              Validate your Excel files with our automated system
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Form Type */}
            <Field label="Form Type">
              <FocusSelect value={formType} onChange={(e) => setFormType(e.target.value)}>
                <option value="">Select form type…</option>
                {FORM_TYPES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </FocusSelect>
            </Field>

            {/* Date */}
            <Field label="Select Date">
              <FocusInput
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Field>

            {/* File drop zone */}
            <Field label="Choose Excel File">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragOver ? T.red : file ? T.green : T.grey200}`,
                  borderRadius: 10,
                  padding: "20px 16px",
                  textAlign: "center",
                  background: dragOver
                    ? T.redBg
                    : file
                    ? T.greenBg
                    : T.grey100,
                  transition: "all 0.18s ease",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById("file-upload").click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files[0])}
                />

                {file ? (
                  <>
                    <CheckCircle2 size={36} color={T.green} style={{ margin: "0 auto 10px" }} />
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: T.black, margin: 0 }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
                      Click to change file
                    </p>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={36} color="#A1A1AA" style={{ margin: "0 auto 10px" }} />
                    <p style={{ fontSize: 13.5, color: "#555", margin: 0 }}>
                      Click to upload or drag & drop
                    </p>
                    <p style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
                      XLSX, XLS or CSV
                    </p>
                  </>
                )}
              </div>
            </Field>
          </div>

          {/* Footer */}
          <div style={{ padding: "0 24px 18px" }}>
            <UploadButton loading={loading} onClick={handleUpload} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Upload button ──────────────────────────────────────── */
function UploadButton({ loading, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        padding: "12px 0",
        background: loading ? "#E4E4E7" : hovered ? T.redDark : T.red,
        color: loading ? T.muted : T.white,
        border: "none",
        borderRadius: 10,
        fontSize: 14.5,
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "all 0.15s ease",
        boxShadow: !loading && hovered ? "0 6px 18px rgba(204,0,0,0.28)" : "none",
        transform: !loading && hovered ? "translateY(-1px)" : "none",
      }}
    >
      {loading ? (
        <>
          <Loader2 size={17} style={{ animation: "spin 0.9s linear infinite" }} />
          Uploading…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      ) : (
        <>
          <Upload size={17} />
          Upload & Validate
        </>
      )}
    </button>
  );
}

export default UploadPage;