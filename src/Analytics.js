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
    <div className="dashboard-wrapper">

      <div className="page-header">
        <h2>📊 Analytics Dashboard</h2>
        <p>Detailed analytics and insights across all forms</p>
      </div>

      {/* FILTERS */}

      <div className="filters-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: 600, color: '#4b5563', fontSize: '13px' }}>Month:</label>
          <input
            type="month"
            value={monthYear}
            onChange={e => setMonthYear(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #e5e0d8',
              fontSize: '13px',
              background: '#fff',
              color: '#1f2937'
            }}
          />
        </div>

        <button
          onClick={fetchAnalytics}
          className="filter-btn"
        >
          🔍 Apply Filter
        </button>

        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setShowCircleAnalytics(!showCircleAnalytics)}
          className="filter-btn"
          style={{
            background: showCircleAnalytics ? "#10b981" : "#dc2626"
          }}
        >
          {showCircleAnalytics 
            ? "📊 Show Form Analytics" 
            : "🌐 Show Circle Analytics"}
        </button>

      </div>

      {/* LOADER */}

      {loading && (
        <div className="loading-container">
          <div className="loader"></div>
          <h2>Loading Analytics Data...</h2>
        </div>
      )}

      {/* TABLES */}

      {!loading && (

        !showCircleAnalytics ? (

          /* ================= FORM ANALYTICS TABLE ================= */

          <div className="table-wrapper" style={{ 
            overflowX: 'auto', 
            maxWidth: '100%', 
            marginTop: 20,
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x'
          }}>

            <table className="history-table" style={{ minWidth: '800px' }}>

              <thead>

                <tr>

                  <th style={{ ...thStyle, minWidth: 80, textAlign: 'center', width: 80 }}>
                    Username
                    <div style={{ marginTop: 10 }}></div>
                    <input
                      placeholder="Search..."
                      value={searchUsername}
                      onChange={e => setSearchUsername(e.target.value)}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        border: "1px solid #ddd",
                        width: "50%",
                        fontSize: 11
                      }}
                    />
                  </th>

                  {chartData.map(f => (
                    <th key={f.name} style={thStyle}>
                      {f.name}
                      <br />
                      <span style={{ fontSize: 12, opacity: 0.8 }}>
                        (Total: {f.total})
                      </span>
                    </th>
                  ))}

                  <th style={thStyle}>Total</th>

                </tr>

              </thead>

              <tbody>

                {filteredGrid.map((row, i) => (

                  <tr
                    key={i}
                  >

                    <td style={{ ...tdStyle, textAlign: 'center' }}>{row.username}</td>

                    {chartData.map(f => {

                      const d = row.forms[f.name] || {
                        valid: 0,
                        invalid: 0,
                        total: 0
                      };

                      return (
                        <td key={f.name} style={tdStyle}>

                          <span style={{ color: "#10b981", fontWeight: 600 }}>
                            {d.valid}
                          </span>

                          {" / "}

                          <span style={{ color: "#ef4444", fontWeight: 600 }}>
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

          <div className="table-wrapper" style={{ 
            overflowX: 'auto', 
            maxWidth: '100%', 
            marginTop: 20,
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x'
          }}>

            {circleSummary && Object.keys(circleSummary).map(formName => (

              <div key={formName} style={{ marginBottom: 40, minWidth: '600px' }}>

                <h3 style={{ color: "#dc2626", marginBottom: 16, fontWeight: 600 }}>
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
  whiteSpace: "nowrap",
  background: "#7f1d1d",
  color: "white",
  minWidth: 100,
  fontSize: 13
};

const tdStyle = {
  padding: 10,
  textAlign: "center",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
  minWidth: 100,
  fontSize: 14
};

export default Analytics;