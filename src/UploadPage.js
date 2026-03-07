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

function UploadPage() {

  const [formType, setFormType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {

    if (!formType || !selectedDate || !file) {
      alert("Please complete all fields.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("form_type", formType);
    formData.append("date", selectedDate);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/VALIDATE-FORM",
        {
          method: "POST",
          body: formData
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // ⭐ Show backend error message
        alert(result.detail || "Upload Failed ❌");
        setLoading(false);
        return;
      }

      // ⭐ Success message
      alert("✅ File Uploaded Successfully");

      // Do NOT redirect automatically
      // User can decide next action

      console.log("Upload Result:", result);

    } catch (error) {
      alert("Upload Failed ❌");
    }

    setLoading(false);
  };

  return (
    <div className="upload-wrapper">

      <div className="upload-card">

        <h2>Upload Excel File</h2>

        {/* FORM TYPE */}
        <div className="form-group">
          <label>Form Type</label>
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
          >
            <option value="">Select Form</option>
            {FORM_TYPES.map((form, index) => (
              <option key={index} value={form}>
                {form}
              </option>
            ))}
          </select>
        </div>

        {/* DATE */}
        <div className="form-group">
          <label>Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* FILE */}
        <div className="form-group">
          <label>Choose Excel File</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <button
          className="primary-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload & Validate"}
        </button>

      </div>
    </div>
  );
}

export default UploadPage;