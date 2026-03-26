import React, { useState } from "react";
import { Button } from "./components/ui/button"; 

const FORM_TYPES = [
  "Meeting Form",
  "EB Meter Form",
  "Leave Form",
  "OD Survey Form",
  "Site Survey Checklist",
  "OD Operation Form",
  "FTTH Acquisition Form"
];

/* ⭐ USERNAME COLUMN MAPPING ⭐ */
const USERNAME_COLUMNS = {
  "Meeting Form": "User Name",
  "OD Operation Form": "CreatedUser",
  "OD Survey Form": "User Name",
  "Leave Form": "CreatedUser",
  "EB Meter Form": "CreatedUser",
  "FTTH Acquisition Form": "CreatedUser",
  "Site Survey Checklist": "CreatedUser"
};

function FormData() {

  const [selectedForms, setSelectedForms] = useState([]);
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [searchUsername, setSearchUsername] = useState("");

  /* ---------------- FORM SELECTION ---------------- */

  const toggleForm = (value) => {

    if (value === "ALL") {

      if (selectedForms.length === FORM_TYPES.length) {
        setSelectedForms([]);
      } else {
        setSelectedForms([...FORM_TYPES]);
      }

      return;
    }

    if (selectedForms.includes(value)) {
      setSelectedForms(selectedForms.filter(f => f !== value));
    } else {
      setSelectedForms([...selectedForms, value]);
    }
  };

  /* ---------------- FETCH DATA ---------------- */

  const fetchData = async () => {

    if (!selectedForms.length) {
      alert("Select form type");
      return;
    }

    setLoading(true);
    setMessage("");

    try {

      const queryForms =
        selectedForms.length === FORM_TYPES.length
          ? "ALL"
          : selectedForms.join(",");

      const res = await fetch(
        `http://127.0.0.1:8000/FORM-DATA-MULTI?forms=${queryForms}`
      );

      const result = await res.json();

      if (!result.length) {
        setMessage("❌ No records found");
        setData([]);
      } else {
        setData(result);
      }

    } catch {
      setMessage("Server Error");
    }

    setLoading(false);
  };

  /* ---------------- GET USERNAME ---------------- */

  const getUsernameColumnValue = (row) => {

    const formType = row.form_type;
    const usernameColumn = USERNAME_COLUMNS[formType];

    if (!usernameColumn) return "N/A";

    return row[usernameColumn] || row.username || "N/A";
  };

  /* ---------------- FILTER DATA BY SEARCH ---------------- */

  const filteredData = data.filter(row => {

    const username = getUsernameColumnValue(row);

    if (!searchUsername) return true;

    return username
      .toLowerCase()
      .includes(searchUsername.toLowerCase());

  });

  /* ---------------- UI ---------------- */

  return (
    <div className="dashboard-wrapper">

      <div className="page-header">
        <h2>📊 Form Data Viewer</h2>
        <p>View data from multiple form types</p>
      </div>

      {/* FILTER CARD */}
      <div className="card">

        {/* FORM SELECT */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 600, color: "#1f2937", display: "block", marginBottom: 12, fontSize: '14px' }}>Select Forms</label>

          <select
            onChange={(e) => toggleForm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #e5e0d8',
              fontSize: '14px',
              background: '#fff',
              color: '#1f2937',
              cursor: 'pointer'
            }}
          >
            <option value="">Select Form</option>
            <option value="ALL">⭐ Select All</option>

            {FORM_TYPES.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}

          </select>
        </div>

        {/* Selected Tags */}
        {selectedForms.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            {selectedForms.map(f => (
              <span
                key={f}
                onClick={() => toggleForm(f)}
                style={{
                  background: "rgba(220, 38, 38, 0.15)",
                  color: "#dc2626",
                  padding: "8px 14px",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {f} ❌
              </span>
            ))}
          </div>
        )}

        <Button onClick={fetchData} className="mt-2">
          📥 Fetch Records
        </Button>

      </div>

      {/* LOADER */}
      {loading && (
        <div className="loading-container">
          <div className="loader"></div>
          <h2>🔄 Loading Data...</h2>
        </div>
      )}

      {/* MESSAGE */}
      {message && (
        <div style={{ 
          textAlign: "center", 
          color: "#dc2626",
          background: 'rgba(220, 38, 38, 0.1)',
          padding: '16px',
          borderRadius: '10px',
          marginTop: '20px',
          fontWeight: 600
        }}>
          {message}
        </div>
      )}

      {/* TABLE */}
      {filteredData.length > 0 && !loading && (

        <div style={{ marginTop: 30 }}>

          {/* SEARCH USERNAME */}
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="🔍 Search by Username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              style={{
                width: "100%",
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1px solid #e5e0d8',
                fontSize: '14px',
                background: '#fff',
                color: '#1f2937'
              }}
            />
          </div>

          <div className="card">
            <div style={{ overflowX: "auto" }}>

              <table className="history-table">

                <thead>
                  <tr>
                    <th>Form Type</th>
                    <th>Username</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.slice(0, 100).map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{row.form_type}</td>
                      <td style={{ color: '#4b5563' }}>
                        {getUsernameColumnValue(row)}
                      </td>
                      <td>
                        <span style={{ 
                          background: row.status === 'Valid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: row.status === 'Valid' ? '#10b981' : '#ef4444',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ color: '#6b7280' }}>{row.date}</td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          </div>

        </div>

      )}

    </div>
  );
}

export default FormData;
