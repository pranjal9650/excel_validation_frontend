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

      const res = await axios.get(`${BASE_URL}/ANALYTICS`);
      processAnalytics(res.data);

    } catch (err) {
      console.error(err);
    }

  }, []);

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
        <h2 style={{ marginTop: 15, color: "#627d98" }}>
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

      <div className="page-header">
        <h2>Validation Analytics Dashboard</h2>
        <p>Overview of all form validation metrics and statistics</p>
      </div>

      {/* KPI CARDS */}
      <div className="stats-container">

        <div className="stat-box primary">
          <h3>Total Forms</h3>
          <h2>{total_forms}</h2>
        </div>

        <div className="stat-box">
          <h3>Total Rows</h3>
          <h2>{total_rows}</h2>
        </div>

        <div className="stat-box valid">
          <h3>Valid Rows</h3>
          <h2>{valid_rows}</h2>
        </div>

        <div className="stat-box invalid">
          <h3>Invalid Rows</h3>
          <h2>{junk_rows}</h2>
        </div>

      </div>

      {/* CHART */}
      <div className="chart-section">

        <h3>Form-wise Validation Distribution</h3>

        <ResponsiveContainer width="100%" height={280}>
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
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />

            <Bar
              dataKey="invalid"
              name="Invalid"
              fill="#ef4444"
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