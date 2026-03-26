import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

function History() {

  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/UPLOAD-HISTORY`);
      setHistory(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="dashboard-wrapper">

      <div className="page-header">
        <h2>Upload History</h2>
        <p>View all previously uploaded Excel files and their validation results</p>
      </div>

      <div className="table-wrapper">

        <table className="history-table">

          <thead>
            <tr>
              <th>File Name</th>
              <th>Upload Time</th>
              <th>Total Rows</th>
              <th>Valid Rows</th>
              <th>Junk Rows</th>
            </tr>
          </thead>

          <tbody>
            {history.length > 0 ? (
              history.map((row, i) => (
                <tr key={i}>
                  <td>{row.file_name}</td>
                  <td>{row.upload_time}</td>
                  <td>{row.total_rows}</td>
                  <td>{row.valid_rows}</td>
                  <td>{row.junk_rows}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No History Found
                </td>
              </tr>
            )}
          </tbody>

        </table>

      </div>

    </div>
  );
}

export default History;