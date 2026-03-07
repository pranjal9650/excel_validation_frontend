import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from "recharts";

const BASE_URL = "http://127.0.0.1:8000";

const Dashboard = () => {

  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [month, setMonth] = useState("");

  /* ================= SUMMARY FETCH ================= */

  useEffect(() => {
    fetch("http://127.0.0.1:8000/DASHBOARD-DATA")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.log(err));
  }, []);

  /* ================= ANALYTICS FETCH ================= */

  const fetchAnalytics = useCallback(async () => {

    try {

      let url = `${BASE_URL}/ANALYTICS`;
      const params = [];

      if (startDate && endDate) {
        params.push(`start_date=${startDate}`);
        params.push(`end_date=${endDate}`);
      }

      if (month) params.push(`month=${month}`);

      if (params.length) url += "?" + params.join("&");

      const res = await axios.get(url);
      processAnalytics(res.data);

    } catch (err) {
      console.error(err);
    }

  }, [startDate, endDate, month]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  /* ================= PROCESS ANALYTICS ================= */

  const processAnalytics = (data) => {

    if (!Array.isArray(data)) return;

    const summaryMap = {};

    data.forEach(user => {

      const backendForms = user.forms || {};

      Object.keys(backendForms).forEach(formName => {

        const d = backendForms[formName];

        const valid = Number(d?.valid || 0);
        const invalid = Number(d?.invalid || 0);
        const total = Number(d?.total || (valid + invalid));

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

      });

    });

    setSummary({ forms: summaryMap });
  };

  const chartData = summary
    ? Object.entries(summary.forms).map(([name, stats]) => ({
        name,
        valid: Number(stats.valid || 0),
        invalid: Number(stats.invalid || 0),
        total: Number(stats.total || 0)
      }))
    : [];

  /* ================= LOADER ================= */

  if (!stats) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column"
        }}
      >
        <div className="loader"></div>
        <h2 style={{ marginTop: 15, color: "#b30000" }}>
          Loading Dashboard...
        </h2>
      </div>
    );
  }

  const {
    total_forms = 0,
    total_rows = 0,
    valid_rows = 0,
    junk_rows = 0
  } = stats;

  return (
    <div className="dashboard-wrapper">

      <h2>Validation Analytics Dashboard</h2>

      {/* KPI CARDS */}
      <div className="stats-container">

        <div className="stat-box">
          <h3>Total UploadedForms</h3>
          <h2>{total_forms}</h2>
        </div>

        <div className="stat-box">
          <h3>Total Rows</h3>
          <h2>{total_rows}</h2>
        </div>

        <div className="stat-box valid">
          <h3>Total Valid</h3>
          <h2>{valid_rows}</h2>
        </div>

        <div className="stat-box invalid">
          <h3>Total Invalid</h3>
          <h2>{junk_rows}</h2>
        </div>

      </div>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 10, marginTop: 30, marginBottom: 20 }}>

        <input type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)} />

        <input type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)} />

        <input type="month"
          value={month}
          onChange={e => setMonth(e.target.value)} />

        <button
          onClick={fetchAnalytics}
          style={{
            background: "#b30000",
            color: "white",
            padding: "8px 15px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer"
          }}
        >
          Apply Filters
        </button>

      </div>

      {/* CHART */}
      <div style={{
        background: "white",
        padding: 25,
        borderRadius: 16,
        boxShadow: "0 8px 30px rgba(179,0,0,0.08)"
      }}>

        <h3 style={{ marginBottom: 20 }}>
          Form Wise Validation Distribution
        </h3>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>

            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              interval={0}
              tickFormatter={(value, index) => {
                const total = chartData[index]?.total || 0;
                return `${value} (${total})`;
              }}
            />

            <YAxis allowDecimals={false} />

            <Tooltip />
            <Legend />

            <Bar
              dataKey="valid"
              name="Valid"
              fill="#16a34a"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />

            <Bar
              dataKey="invalid"
              name="Invalid"
              fill="#dc2626"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default Dashboard;