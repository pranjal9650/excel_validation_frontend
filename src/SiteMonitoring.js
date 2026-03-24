import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const SiteMonitoring = () => {
  const [summary, setSummary] = useState(null);
  const [downSites, setDownSites] = useState([]);
  const [upSites, setUpSites] = useState([]);

  const [filteredDown, setFilteredDown] = useState([]);
  const [filteredUp, setFilteredUp] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  // ✅ ONLY INITIAL LOAD
  useEffect(() => {
    fetchData();
  }, []);

  // ✅ FETCH FUNCTION (NO useCallback)
  const fetchData = async () => {
    try {
      setLoading(true);

      let query = "";
      if (startDate && endDate) {
        query = `?start_date=${startDate}&end_date=${endDate}`;
      }

      const [summaryRes, downRes, upRes] = await Promise.all([
        axios.get(`${BASE_URL}/SITE-MONITORING${query}`),
        axios.get(`${BASE_URL}/SITE-DOWN${query}`),
        axios.get(`${BASE_URL}/SITE-UP${query}`),
      ]);

      setSummary(summaryRes.data);
      setDownSites(downRes.data);
      setFilteredDown(downRes.data);

      setUpSites(upRes.data);
      setFilteredUp(upRes.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SEARCH FILTER ONLY
  useEffect(() => {
    if (!search) {
      setFilteredDown(downSites);
      setFilteredUp(upSites);
      return;
    }

    const lower = search.toLowerCase();

    setFilteredDown(
      downSites.filter(
        (site) =>
          site.site_name?.toLowerCase().includes(lower) ||
          site.global_id?.toLowerCase().includes(lower)
      )
    );

    setFilteredUp(
      upSites.filter(
        (site) =>
          site.site_name?.toLowerCase().includes(lower) ||
          site.global_id?.toLowerCase().includes(lower)
      )
    );
  }, [search, downSites, upSites]);

  if (loading || !summary) {
    return <h2 style={{ textAlign: "center" }}>Loading Site Monitoring...</h2>;
  }

  return (
    <div className="dashboard-wrapper">

      <h2>Site Monitoring Dashboard</h2>

      {/* 🔥 FILTERS */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Start Date (YYYY-MM-DD)"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          type="text"
          placeholder="End Date (YYYY-MM-DD)"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <button onClick={fetchData} style={{ marginRight: 20 }}>
          Apply Date Filter
        </button>

        <input
          type="text"
          placeholder="Search Site Name / Site ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📊 CARDS */}
      <div className="stats-container">
        <div className="stat-box">
          <h3>Total Sites</h3>
          <h2>{summary.total_sites}</h2>
        </div>

        <div className="stat-box valid">
          <h3>Active Sites</h3>
          <h2>{summary.up_sites}</h2>
        </div>

        <div className="stat-box invalid">
          <h3>Outage Sites</h3>
          <h2>{summary.down_sites}</h2>
        </div>
      </div>

      {/* 🟢 ACTIVE FIRST */}
      <div style={{ background: "white", padding: 25, borderRadius: 16, marginTop: 20 }}>
        <h3>🟢 Active Sites ({filteredUp.length})</h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Site Name</th>
              <th>Site ID</th>
              <th>Status</th>
              <th>Since</th>
            </tr>
          </thead>

          <tbody>
            {filteredUp.map((site, i) => (
              <tr key={i} style={{ textAlign: "center" }}>
                <td>{site.site_name}</td>
                <td>{site.global_id}</td>
                <td style={{ color: "green", fontWeight: "bold" }}>Active</td>
                <td>{site.since && site.since !== "Running" ? site.since : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔴 OUTAGE */}
      <div style={{ background: "white", padding: 25, borderRadius: 16, marginTop: 20 }}>
        <h3>🔴 Outage Sites ({filteredDown.length})</h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Site Name</th>
              <th>Site ID</th>
              <th>Alarm</th>
              <th>Since</th>
              <th>End Time</th>
            </tr>
          </thead>

          <tbody>
            {filteredDown.map((site, i) => (
              <tr key={i} style={{ textAlign: "center" }}>
                <td>{site.site_name}</td>
                <td>{site.global_id}</td>
                <td style={{ color: "red" }}>{site.alarm}</td>
                <td>{site.since}</td>
                <td>{site.end_time || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default SiteMonitoring;