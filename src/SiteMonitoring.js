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

  // Add state for viewing preference
  const [viewMode, setViewMode] = useState("all"); // "all", "active", "outage"

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

      const combinedData = [
        ...upRes.data.map(site => ({
          ...site,
          status: "Active"
          })),
          ...downRes.data.map(site => ({
            ...site,
            status: "Outage"
            }))
          ];

          await axios.post(`${BASE_URL}/SAVE-SITE-DATA`, combinedData);
          console.log("DB SAVED ✅");

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
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <h2>Loading Site Monitoring...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">

      <div className="page-header">
        <h2>🖥️ Site Monitoring Dashboard</h2>
        <p>Track and monitor site status and connectivity in real-time</p>
      </div>

      {/* FILTERS */}
      <div className="filters-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: 600, color: '#4b5563', fontSize: '13px' }}>From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: 600, color: '#4b5563', fontSize: '13px' }}>To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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

        <button onClick={fetchData} className="filter-btn" style={{ padding: '10px 20px' }}>
          🔍 Apply Filter
        </button>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          <button 
            onClick={() => setViewMode('all')} 
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: viewMode === 'all' ? '2px solid #dc2626' : '1px solid #e5e0d8',
              background: viewMode === 'all' ? '#fef2f2' : '#fff',
              color: viewMode === 'all' ? '#dc2626' : '#4b5563',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            📊 All Sites
          </button>
          <button 
            onClick={() => setViewMode('active')} 
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: viewMode === 'active' ? '2px solid #10b981' : '1px solid #e5e0d8',
              background: viewMode === 'active' ? '#ecfdf5' : '#fff',
              color: viewMode === 'active' ? '#10b981' : '#4b5563',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            🟢 Active
          </button>
          <button 
            onClick={() => setViewMode('outage')} 
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: viewMode === 'outage' ? '2px solid #ef4444' : '1px solid #e5e0d8',
              background: viewMode === 'outage' ? '#fef2f2' : '#fff',
              color: viewMode === 'outage' ? '#ef4444' : '#4b5563',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            🔴 Outage
          </button>
        </div>

        <input
          type="text"
          placeholder="🔎 Search Site Name or Site ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #e5e0d8',
            fontSize: '13px',
            background: '#fff',
            color: '#1f2937',
            flex: 1,
            minWidth: '200px'
          }}
        />
      </div>

      {/* 📊 CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
        <div className="stat-box primary" style={{ position: 'relative', overflow: 'hidden', padding: '16px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #dc2626, #b91c1c)' }}></div>
          <h3>📍 Total Sites</h3>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#1f2937' }}>{summary.total_sites}</h2>
        </div>

        <div className="stat-box valid" style={{ position: 'relative', overflow: 'hidden', padding: '16px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10b981, #059669)' }}></div>
          <h3>✅ Active Sites</h3>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#10b981' }}>{summary.up_sites}</h2>
        </div>

        <div className="stat-box invalid" style={{ position: 'relative', overflow: 'hidden', padding: '16px' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #ef4444, #dc2626)' }}></div>
          <h3>⚠️ Outage Sites</h3>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#ef4444' }}>{summary.down_sites}</h2>
        </div>
      </div>

      {/* 🟢 ACTIVE FIRST */}
      {(viewMode === 'all' || viewMode === 'active') && (
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🟢</span> Active Sites ({filteredUp.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="history-table">
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
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{site.site_name}</td>
                  <td style={{ color: '#6b7280' }}>{site.global_id}</td>
                  <td>
                    <span style={{ 
                      background: 'rgba(16, 185, 129, 0.15)', 
                      color: '#10b981',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      ● Active
                    </span>
                  </td>
                  <td style={{ color: '#6b7280' }}>{site.since && site.since !== "Running" ? site.since : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* 🔴 OUTAGE */}
      {(viewMode === 'all' || viewMode === 'outage') && (
      <div className="card" style={{ marginTop: 24, marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title" style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🔴</span> Outage Sites ({filteredDown.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="history-table">
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
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{site.site_name}</td>
                  <td style={{ color: '#6b7280' }}>{site.global_id}</td>
                  <td>
                    <span style={{ 
                      background: 'rgba(239, 68, 68, 0.15)', 
                      color: '#ef4444',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {site.alarm}
                    </span>
                  </td>
                  <td style={{ color: '#6b7280' }}>{site.since}</td>
                  <td style={{ color: '#6b7280' }}>{site.end_time || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

    </div>
  );
};

export default SiteMonitoring;