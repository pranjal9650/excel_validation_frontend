import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Upload, CheckCircle, AlertCircle, Clock, Send,
  FileSpreadsheet, FileText, RefreshCw, Info,
  Trash2, AlertTriangle,
} from "lucide-react";

const API = "http://127.0.0.1:8000";

const T = {
  red:      "#CC0000",
  redDark:  "#A30000",
  redLight: "rgba(204,0,0,0.07)",
  black:    "#111111",
  white:    "#FFFFFF",
  grey500:  "#6B7280",
  green:    "#16a34a",
  greenBg:  "#f0fdf4",
  amber:    "#d97706",
  amberBg:  "#fffbeb",
};

const FILE_SLOTS = [
  {
    key:         "employee",
    label:       "Employee Details",
    description: "Master list — Name, Username, Manager, City",
    accept:      ".xlsx,.xls",
    icon:        FileSpreadsheet,
    freq:        "Monthly / as updated",
  },
  {
    key:         "attendance",
    label:       "Attendance Report",
    description: "Daily attendance — Username, Present / Absent status",
    accept:      ".xlsx,.xls",
    icon:        FileSpreadsheet,
    freq:        "Daily",
  },
  {
    key:         "distance",
    label:       "Distance Report",
    description: "Travel data — Username, KMs covered today",
    accept:      ".xlsx,.xls",
    icon:        FileSpreadsheet,
    freq:        "Daily",
  },
  {
    key:         "forms",
    label:       "No. of Forms Filled",
    description: "Form submission counts — Username, Form Type, Count",
    accept:      ".xlsx,.xls",
    icon:        FileSpreadsheet,
    freq:        "Daily",
  },
  {
    key:         "managers",
    label:       "Manager Data",
    description: "Manager mapping — Manager Name, Employee, Circle",
    accept:      ".xlsx,.xls",
    icon:        FileSpreadsheet,
    freq:        "Daily",
  },
  {
    key:         "forms_filled",
    label:       "Forms Filled",
    description: "Daily form fill summary — Employee, Form Name, Count",
    accept:      ".xlsx,.xls",
    icon:        FileSpreadsheet,
    freq:        "Daily",
  },
  {
    key:         "alarm",
    label:       "Alarm / Sites Down",
    description: "Site outage data — Global ID, Site Name, State / Circle",
    accept:      ".csv",
    icon:        FileText,
    freq:        "Daily (optional)",
    optional:    true,
  },
];

// ── helpers ───────────────────────────────────────────────────────────

function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso), n = new Date();
  return d.getFullYear() === n.getFullYear()
      && d.getMonth()    === n.getMonth()
      && d.getDate()     === n.getDate();
}

function relLabel(iso) {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

// ── File card ─────────────────────────────────────────────────────────

function FileCard({ slot, statusData, onUpload, uploadingKey }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const info     = statusData[slot.key] || {};
  const meta     = info.meta;
  const uploaded = info.uploaded && !!meta;
  const fresh    = uploaded && isToday(meta?.uploaded_at);
  const stale    = uploaded && !fresh;
  const busy     = uploadingKey === slot.key;
  const Icon     = slot.icon;

  const pick = (file) => { if (file) onUpload(slot.key, file); };

  // colours
  let border = "#D1D5DB", bg = "#FAFAFA";
  if (drag)       { border = T.red;   bg = T.redLight; }
  else if (fresh) { border = T.green; bg = T.greenBg;  }
  else if (stale) { border = T.amber; bg = T.amberBg;  }

  return (
    <div style={{
      border: `1.5px solid ${border}`,
      borderRadius: 12,
      background: bg,
      padding: "18px 18px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      transition: "border-color .18s, background .18s",
    }}>

      {/* — top row — */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>

        {/* icon box */}
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: fresh ? T.greenBg : stale ? T.amberBg : T.redLight,
          border: `1px solid ${fresh ? "#bbf7d0" : stale ? "#fde68a" : "rgba(204,0,0,0.16)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={16} color={fresh ? T.green : stale ? T.amber : T.red} />
        </div>

        {/* labels */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: T.black }}>
              {slot.label}
            </p>
            {slot.optional && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: T.amber,
                background: T.amberBg, border: "1px solid #fde68a",
                borderRadius: 20, padding: "1px 8px",
              }}>
                Optional
              </span>
            )}
          </div>
          <p style={{ margin: "3px 0 0", fontSize: 11.5, color: T.grey500, lineHeight: 1.4 }}>
            {slot.description}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#9CA3AF" }}>
            Frequency: {slot.freq}
          </p>
        </div>

        {/* status badge */}
        {fresh ? (
          <span style={badge(T.green, T.greenBg, "#bbf7d0")}>
            <CheckCircle size={10} /> Ready
          </span>
        ) : stale ? (
          <span style={badge(T.amber, T.amberBg, "#fde68a")}>
            <AlertTriangle size={10} /> Outdated
          </span>
        ) : (
          <span style={badge(T.grey500, "#F3F4F6", "#E5E7EB")}>
            <Clock size={10} /> Pending
          </span>
        )}
      </div>

      {/* — stale warning — */}
      {stale && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 7, padding: "7px 10px",
          fontSize: 11.5, color: "#92400e",
        }}>
          <AlertTriangle size={11} style={{ flexShrink: 0 }} />
          Uploaded <strong style={{ margin: "0 3px" }}>{relLabel(meta?.uploaded_at)}</strong>
          — please re-upload today's file.
        </div>
      )}

      {/* — file meta (fresh only) — */}
      {fresh && meta && (
        <div style={{
          fontSize: 11.5, color: T.grey500,
          background: "#F9FAFB", borderRadius: 7,
          padding: "6px 10px", lineHeight: 1.7,
        }}>
          <strong style={{ color: T.black }}>{meta.original_name}</strong>
          {" · "}{fmtTime(meta.uploaded_at)}
          {" · "}{(meta.size_bytes / 1024).toFixed(1)} KB
        </div>
      )}

      {/* — drop zone — */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
        onClick={() => !busy && inputRef.current?.click()}
        style={{
          border: `1.5px dashed ${drag ? T.red : "#D1D5DB"}`,
          borderRadius: 8, padding: "16px 12px",
          textAlign: "center",
          cursor: busy ? "not-allowed" : "pointer",
          background: drag ? T.redLight : "transparent",
          transition: "all .15s",
          opacity: busy ? 0.65 : 1,
        }}
      >
        {busy
          ? <RefreshCw size={18} color={T.red}   style={{ marginBottom: 5, animation: "spin 1s linear infinite" }} />
          : <Upload    size={18} color={drag ? T.red : T.grey500} style={{ marginBottom: 5 }} />
        }
        <p style={{ margin: 0, fontSize: 12.5, color: busy ? T.red : T.grey500 }}>
          {busy
            ? "Uploading…"
            : (fresh || stale)
              ? "Drop a new file to replace"
              : "Click or drag & drop to upload"}
        </p>
        <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9CA3AF" }}>
          {slot.accept.replace(/\./g, "").toUpperCase().replace(/,/g, ", ")}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={slot.accept}
        style={{ display: "none" }}
        onChange={(e) => pick(e.target.files[0])}
      />
    </div>
  );
}

function badge(color, bg, borderColor) {
  return {
    display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
    fontSize: 10.5, fontWeight: 600, color,
    background: bg, border: `1px solid ${borderColor}`,
    borderRadius: 20, padding: "3px 9px",
    whiteSpace: "nowrap",
  };
}

// ── Main page ─────────────────────────────────────────────────────────

export default function EmailReports() {
  const [status,       setStatus]       = useState({});
  const [uploadingKey, setUploadingKey] = useState(null);
  const [sending,      setSending]      = useState(false);
  const [clearing,     setClearing]     = useState(false);
  const [toast,        setToast]        = useState(null);
  const [loading,      setLoading]      = useState(true);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/REPORT-FILES-STATUS`);
      setStatus(data);
    } catch {
      showToast("error", "Cannot reach the backend — is the server running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleUpload = async (fileType, file) => {
    setUploadingKey(fileType);
    const form = new FormData();
    form.append("file_type", fileType);
    form.append("file", file);
    try {
      await axios.post(`${API}/UPLOAD-REPORT-FILE`, form);
      const label = FILE_SLOTS.find((s) => s.key === fileType)?.label || fileType;
      showToast("success", `${label} uploaded successfully.`);
      await fetchStatus();
    } catch (e) {
      showToast("error", e.response?.data?.detail || "Upload failed — please try again.");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all uploaded files? You'll need to re-upload before sending.")) return;
    setClearing(true);
    try {
      await axios.post(`${API}/CLEAR-REPORT-FILES`);
      await fetchStatus();
      showToast("success", "All files cleared. Ready for today's fresh upload.");
    } catch (e) {
      showToast("error", e.response?.data?.detail || "Clear failed.");
    } finally {
      setClearing(false);
    }
  };

  const handleSend = async () => {
    const required = ["employee", "attendance", "distance", "forms", "managers", "forms_filled"];
    const notReady = required.filter(
      (k) => !status[k]?.uploaded || !isToday(status[k]?.meta?.uploaded_at)
    );
    if (notReady.length > 0) {
      const labels = notReady.map(
        (k) => FILE_SLOTS.find((s) => s.key === k)?.label || k
      );
      showToast("error", `Upload today's files for: ${labels.join(", ")}.`);
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API}/SEND-DAILY-REPORT`);
      showToast("success", "Reports sent to all managers, circle heads and management.");
    } catch (e) {
      showToast("error", e.response?.data?.detail || "Send failed — check backend logs.");
    } finally {
      setSending(false);
    }
  };

  const required      = ["employee", "attendance", "distance", "forms", "managers", "forms_filled"];
  const requiredReady = required.every(
    (k) => status[k]?.uploaded && isToday(status[k]?.meta?.uploaded_at)
  );
  const anyUploaded = Object.values(status).some((v) => v?.uploaded);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── header ── */}
      <div style={{
        background: "#fff", border: "1px solid #E5E2DC",
        borderRadius: 14, padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: T.redLight, border: "1px solid rgba(204,0,0,0.16)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Send size={18} color={T.red} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: T.black, letterSpacing: "-0.3px" }}>
              Email Reports
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: T.grey500 }}>
              Upload today's 6 files, then send the daily reports to all managers, circle heads &amp; management
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {anyUploaded && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              style={ghostBtn("#fecaca", "#fff5f5", T.red, clearing)}
            >
              {clearing
                ? <RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} />
                : <Trash2 size={12} />}
              Clear All
            </button>
          )}
          <button onClick={fetchStatus} style={ghostBtn("#E5E2DC", "#FAFAF8", T.grey500, false)}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* ── info banner ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 9,
        background: "#EFF6FF", border: "1px solid #BFDBFE",
        borderRadius: 10, padding: "11px 16px",
        fontSize: 12.5, color: "#1e40af",
      }}>
        <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Upload all 6 required files below each day before clicking <strong>Send Reports Now</strong>.
          Files uploaded on a previous day are shown as <strong>Outdated</strong> — always replace them with today's data.
          The scheduler also sends reports automatically at <strong>6 PM</strong>.
        </span>
      </div>

      {/* ── file cards grid ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: T.grey500 }}>
          <RefreshCw size={22} color={T.red} style={{ animation: "spin 1s linear infinite", marginBottom: 10 }} />
          <p style={{ margin: 0, fontSize: 13 }}>Checking file status…</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}>
          {FILE_SLOTS.map((slot) => (
            <FileCard
              key={slot.key}
              slot={slot}
              statusData={status}
              onUpload={handleUpload}
              uploadingKey={uploadingKey}
            />
          ))}
        </div>
      )}

      {/* ── send bar ── */}
      <div style={{
        background: "#fff", border: "1px solid #E5E2DC",
        borderRadius: 14, padding: "18px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.black }}>
            {requiredReady
              ? "All files ready — dispatch reports"
              : "Waiting for today's files…"}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: T.grey500 }}>
            {requiredReady
              ? "Emails will go out to all managers, circle heads and the management team."
              : "All 5 required files must be uploaded today before you can send."}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* readiness dots */}
          <div style={{ display: "flex", gap: 5 }}>
            {required.map((k) => {
              const ok    = status[k]?.uploaded && isToday(status[k]?.meta?.uploaded_at);
              const stale = status[k]?.uploaded && !ok;
              return (
                <div
                  key={k}
                  title={FILE_SLOTS.find((s) => s.key === k)?.label}
                  style={{
                    width: 9, height: 9, borderRadius: "50%",
                    background: ok ? T.green : stale ? T.amber : "#D1D5DB",
                  }}
                />
              );
            })}
          </div>

          <button
            onClick={handleSend}
            disabled={!requiredReady || sending}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 22px", borderRadius: 9, border: "none",
              background: requiredReady && !sending ? T.red : "#D1D5DB",
              color: "#fff", fontSize: 13.5, fontWeight: 700,
              cursor: requiredReady && !sending ? "pointer" : "not-allowed",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: requiredReady && !sending ? "0 2px 10px rgba(204,0,0,0.3)" : "none",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => { if (requiredReady && !sending) e.currentTarget.style.background = T.redDark; }}
            onMouseLeave={(e) => { if (requiredReady && !sending) e.currentTarget.style.background = T.red; }}
          >
            {sending
              ? <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />
              : <Send size={15} />}
            {sending ? "Sending…" : "Send Reports Now"}
          </button>
        </div>
      </div>

      {/* ── toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          display: "flex", alignItems: "flex-start", gap: 10,
          background: "#fff",
          border: `1.5px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.13)",
          padding: "13px 16px", maxWidth: 380,
          fontSize: 13, color: T.black,
          animation: "fadeInUp .2s ease",
        }}>
          {toast.type === "success"
            ? <CheckCircle size={15} color={T.green} style={{ flexShrink: 0, marginTop: 1 }} />
            : <AlertCircle size={15} color={T.red}   style={{ flexShrink: 0, marginTop: 1 }} />}
          <span>{toast.msg}</span>
        </div>
      )}

      <style>{`
        @keyframes spin     { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

function ghostBtn(borderColor, bg, color, disabled) {
  return {
    display: "flex", alignItems: "center", gap: 6,
    padding: "7px 14px", borderRadius: 8,
    border: `1px solid ${borderColor}`, background: bg, color,
    fontSize: 12.5, fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans', sans-serif",
    opacity: disabled ? 0.6 : 1,
  };
}
