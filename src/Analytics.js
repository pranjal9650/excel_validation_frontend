import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

function Analytics() {

  const [gridData, setGridData] = useState([]);
  const [summary, setSummary] = useState(null);

  const [monthYear, setMonthYear] = useState("");
  const [searchUsername, setSearchUsername] = useState("");

  const [loading, setLoading] = useState(false);

  /* ⭐ NEW STATES FOR CIRCLE ANALYTICS */
  const [showCircleAnalytics, setShowCircleAnalytics] = useState(false);
  const [circleSummary, setCircleSummary] = useState(null);

  /* FETCH DATA */

  const fetchAnalytics = useCallback(async () => {

    try {

      setLoading(true);

      let url = `${BASE_URL}/ANALYTICS`;

      const params = [];

      if (monthYear) {
        params.push(`month=${monthYear}`);
      }

      if (params.length) url += "?" + params.join("&");

      const res = await axios.get(url);

      processAnalytics(res.data);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);

  }, [monthYear]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  /* PROCESS DATA */

  const processAnalytics = (data) => {

    if (!Array.isArray(data)) return;

    const finalGrid = [];
    const summaryMap = {};
    const circleMap = {};

    data.forEach(user => {

      const row = {
        username: user.username,
        forms: {},
        total: 0
      };

      const backendForms = user.forms || {};

      Object.keys(backendForms).forEach(formName => {

        const d = backendForms[formName];

        const valid = Number(d?.valid || 0);
        const invalid = Number(d?.invalid || 0);
        const total = valid + invalid;

        row.forms[formName] = { valid, invalid, total };
        row.total += total;

        /* FORM SUMMARY */

        if (!summaryMap[formName]) {
          summaryMap[formName] = {
            valid: 0,
            invalid: 0,
            total: 0
          };
        }

        summaryMap[formName].valid += valid;
        summaryMap[formName].invalid += invalid;
        summaryMap[formName].total += total;

        /* ⭐ CIRCLE WISE ANALYTICS */

        const circleData = d?.circleWise || {};

        Object.keys(circleData).forEach(circle => {

          if (!circleMap[formName]) circleMap[formName] = {};
          if (!circleMap[formName][circle]) {
            circleMap[formName][circle] = 0;
          }

          circleMap[formName][circle] += Number(circleData[circle] || 0);

        });

      });

      finalGrid.push(row);

    });

    setGridData(finalGrid);
    setSummary({ forms: summaryMap });
    setCircleSummary(circleMap);

  };

  /* SEARCH FILTER */

  const filteredGrid = gridData.filter(row =>
    row.username &&
    row.username.toLowerCase().includes(searchUsername.toLowerCase())
  );

  const chartData = summary
    ? Object.entries(summary.forms).map(([name, stats]) => ({
        name,
        valid: Number(stats.valid || 0),
        invalid: Number(stats.invalid || 0),
        total: Number(stats.total || 0)
      }))
    : [];

  return (
    <div style={{ padding: 30, background: "#f5eaea", minHeight: "100vh" }}>

      <h1 style={{ color: "#7f1d1d", marginBottom: 25 }}>
        📊 Analytics Dashboard
      </h1>

      {/* FILTERS */}

      <div style={{
        display: "flex",
        gap: 15,
        flexWrap: "wrap",
        marginBottom: 20
      }}>

        <input
          type="month"
          value={monthYear}
          onChange={e => setMonthYear(e.target.value)}
        />

        <button
          onClick={fetchAnalytics}
          style={{
            background: "#7f1d1d",
            color: "white",
            padding: "8px 15px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer"
          }}
        >
          Apply Filter
        </button>

        {/* ⭐ TOGGLE BUTTON */}
        <button
          onClick={() => setShowCircleAnalytics(!showCircleAnalytics)}
          style={{
            background: "#1d4ed8",
            color: "white",
            padding: "8px 15px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer"
          }}
        >
          {showCircleAnalytics
            ? "📊 Show Form Analytics"
            : "🌐 Show Circle Analytics"}
        </button>

      </div>

      {/* LOADER */}

      {loading && (
        <div style={{
          textAlign: "center",
          fontSize: 18,
          marginBottom: 20
        }}>
          🔄 Loading Analytics Data...
        </div>
      )}

      {/* TABLES */}

      {!loading && (

        !showCircleAnalytics ? (

          /* ================= FORM ANALYTICS TABLE ================= */

          <div style={{
            overflowX: "auto",
            background: "white",
            padding: 20,
            borderRadius: 14,
            boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
          }}>

            <table style={{
              width: "100%",
              minWidth: 1200,
              borderCollapse: "collapse"
            }}>

              <thead>

                <tr style={{ background: "#7f1d1d", color: "white" }}>

                  <th style={thStyle}>
                    Username

                    <br />

                    <input
                      placeholder="Search user..."
                      value={searchUsername}
                      onChange={e => setSearchUsername(e.target.value)}
                      style={{
                        marginTop: 8,
                        padding: 6,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        width: "90%"
                      }}
                    />
                  </th>

                  {chartData.map(f => (
                    <th key={f.name} style={thStyle}>
                      {f.name}
                      <br />
                      <span style={{ fontSize: 12 }}>
                        (Total: {f.total})
                      </span>
                    </th>
                  ))}

                  <th style={thStyle}>Total</th>

                </tr>

              </thead>

              <tbody>

                {filteredGrid.map((row, i) => (

                  <tr key={i}
                    style={{ background: i % 2 ? "#fff" : "#f9eaea" }}
                  >

                    <td style={tdStyle}>{row.username}</td>

                    {chartData.map(f => {

                      const d = row.forms[f.name] || {
                        valid: 0,
                        invalid: 0,
                        total: 0
                      };

                      return (
                        <td key={f.name} style={tdStyle}>

                          <span style={{ color: "#16a34a", fontWeight: 600 }}>
                            {d.valid}
                          </span>

                          {" / "}

                          <span style={{ color: "#dc2626", fontWeight: 600 }}>
                            {d.invalid}
                          </span>

                          {" ("}
                          <span style={{ fontWeight: 600 }}>
                            {d.total}
                          </span>
                          {")"}

                        </td>
                      );

                    })}

                    <td style={tdStyle}>{row.total}</td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        ) : (

          /* ================= CIRCLE ANALYTICS TABLE ================= */

          <div style={{
            background: "white",
            padding: 20,
            borderRadius: 14
          }}>

            {circleSummary && Object.keys(circleSummary).map(formName => (

              <div key={formName} style={{ marginBottom: 40 }}>

                <h3 style={{ color: "#7f1d1d" }}>
                  {formName} — Circle Wise Data
                </h3>

                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: 15
                }}>

                  <thead>
                    <tr style={{ background: "#7f1d1d", color: "white" }}>
                      <th style={thStyle}>Circle</th>
                      <th style={thStyle}>Total Submissions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {Object.entries(circleSummary[formName] || {}).map(([circle, count]) => (
                      <tr key={circle}>
                        <td style={tdStyle}>{circle}</td>
                        <td style={tdStyle}>{count}</td>
                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

            ))}

          </div>

        )

      )}

    </div>
  );
}

const thStyle = {
  padding: 12,
  textAlign: "center",
  whiteSpace: "nowrap"
};

const tdStyle = {
  padding: 10,
  textAlign: "center",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap"
};

export default Analytics;