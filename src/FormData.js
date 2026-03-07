import React, { useState } from "react";

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
    <div style={{ maxWidth: 1100, margin: "auto", padding: 30 }}>

      <h2 style={{ color: "#7f1d1d" }}>📊 Form Data Viewer</h2>

      {/* FILTER CARD */}
      <div style={{
        background: "white",
        padding: 25,
        borderRadius: 18,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
      }}>

        {/* FORM SELECT */}
        <div style={{ marginBottom: 20 }}>
          <label>Select Forms</label>

          <select
            onChange={(e) => toggleForm(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {selectedForms.map(f => (
            <span
              key={f}
              onClick={() => toggleForm(f)}
              style={{
                background: "#fce7e7",
                padding: "6px 12px",
                borderRadius: 20,
                cursor: "pointer"
              }}
            >
              {f} ❌
            </span>
          ))}
        </div>

        <button
          onClick={fetchData}
          style={{
            marginTop: 20,
            background: "#7f1d1d",
            color: "white",
            padding: "12px 25px",
            borderRadius: 10,
            border: "none"
          }}
        >
          Fetch Records
        </button>

      </div>

      {/* LOADER */}
      {loading && <h3 style={{ textAlign: "center" }}>🔄 Loading...</h3>}

      {/* MESSAGE */}
      {message && <h3 style={{ textAlign: "center", color: "#7f1d1d" }}>{message}</h3>}

      {/* TABLE */}
      {filteredData.length > 0 && (

        <div style={{ marginTop: 30 }}>

          {/* SEARCH USERNAME MOVED HERE */}
          <div style={{ marginBottom: 15 }}>
            <input
              type="text"
              placeholder="🔍 Search Username..."
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #ddd"
              }}
            />
          </div>

          <div style={{ overflowX: "auto" }}>

            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>

              <thead>
                <tr style={{ background: "#7f1d1d", color: "white" }}>
                  <th style={{ padding: 12 }}>Form Type</th>
                  <th style={{ padding: 12 }}>Username</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.slice(0, 100).map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 12 }}>{row.form_type}</td>
                    <td style={{ padding: 12 }}>
                      {getUsernameColumnValue(row)}
                    </td>
                    <td style={{ padding: 12 }}>{row.status}</td>
                    <td style={{ padding: 12 }}>{row.date}</td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}

export default FormData;