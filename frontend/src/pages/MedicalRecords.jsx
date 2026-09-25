import { useEffect, useRef, useState } from "react";
import {
  getMedicalRecords,
  uploadMedicalRecord,
  deleteMedicalRecord,
  viewMedicalRecord,
  downloadMedicalRecord,
} from "../services/Api";

function MedicalRecords() {
  const patientId = 1;
  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All Records");
  const [selectedFile, setSelectedFile] = useState(null);
  const [records, setRecords] = useState([]);

  // Load medical records from backend
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await getMedicalRecords(patientId);

      const formattedRecords = data.map((record) => ({
        id: record[0],
        patientId: record[1],
        name: record[2],
        category: record[3],
        date: record[4],
        hospital: "MediTwin",
        icon: "📄",
      }));

      setRecords(formattedRecords);
    } catch (error) {
      console.error("Failed to load medical records:", error);
    }
  };

  // Search + filter
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "All Records" ||
      record.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Open file picker
  const handleChooseFile = () => {
    fileInputRef.current.click();
  };

  // Handle selected file and upload to backend
  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);

    try {
      await uploadMedicalRecord(patientId, file);

      alert("Medical record uploaded successfully!");

      setSelectedFile(null);

      await loadRecords();
    } catch (error) {
      console.error("Failed to upload medical record:", error);
      alert("Failed to upload medical record");
    }

    // Allow selecting the same file again
    event.target.value = "";
  };

  // Delete medical record
  const handleDelete = async (recordId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medical record?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteMedicalRecord(recordId);

      alert("Medical record deleted successfully!");

      // Reload records after deletion
      await loadRecords();
    } catch (error) {
      console.error("Failed to delete medical record:", error);
      alert("Failed to delete medical record");
    }
  };

  return (
    <div className="medical-records-page">

      {/* Page Header */}

      <section className="records-page-header">

        <div>
          <h1>Medical Records</h1>

          <p>
            Store, organize and access all your medical documents in one place.
          </p>
        </div>

        <button
          className="upload-record-btn"
          onClick={handleChooseFile}
        >
          + Upload Record
        </button>

      </section>


      {/* Hidden File Input */}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />


      {/* Search and Filter */}

      <section className="records-tools glass-card">

        <div className="search-box">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search medical records..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

        </div>


        <select
          value={filterCategory}
          onChange={(event) => setFilterCategory(event.target.value)}
          className="record-filter"
        >
          <option>All Records</option>
          <option>Lab Report</option>
          <option>Health Report</option>
          <option>Prescription</option>
          <option>Imaging</option>
          <option>Diagnosis</option>
          <option>Other</option>
        </select>

      </section>


      {/* Upload Area */}

      <section className="upload-area glass-card">

        <div className="upload-icon">
          📄
        </div>

        <h2>Upload Medical Document</h2>

        <p>
          Upload your medical reports, prescriptions or diagnostic documents.
        </p>

        <button
          className="choose-file-btn"
          onClick={handleChooseFile}
        >
          Choose File
        </button>

        <small>
          Supported formats: PDF, TXT , IMAGE 
        </small>


        {/* Selected File */}

        {selectedFile && (
          <div className="selected-file">

            <span>
              📎 {selectedFile.name}
            </span>

            <button
              onClick={() => setSelectedFile(null)}
            >
              ✕
            </button>

          </div>
        )}

      </section>


      {/* Medical Records Section */}

      <section className="records-section">

        <div className="records-section-title">

          <div>
            <h2>Your Medical Records</h2>

            <p>
              View and manage your stored medical documents.
            </p>
          </div>

          <span>
            {filteredRecords.length} Documents
          </span>

        </div>


        {/* Records */}

        <div className="records-list">

          {filteredRecords.length > 0 ? (

            filteredRecords.map((record) => (

              <div
                className="record-card glass-card"
                key={record.id}
              >

                {/* Record Information */}

                <div className="record-main">

                  <div className="record-icon">
                    {record.icon}
                  </div>


                  <div className="record-details">

                    <h3>
                      {record.name}
                    </h3>

                    <p>
                      {record.hospital}
                    </p>


                    <div className="record-meta">

                      <span className="record-category">
                        {record.category}
                      </span>

                      <span>
                        {record.date}
                      </span>

                    </div>

                  </div>

                </div>


                {/* Record Actions */}

                <div className="record-actions">

                  <button
                    className="view-btn"
                    onClick={() => window.open(viewMedicalRecord(record.id), "_blank")}>
                    View
                  </button>
                  <button
  className="download-btn"
  onClick={() => downloadMedicalRecord(record.id)}
>
  Download
</button>

<button
  className="delete-btn"
  onClick={() => handleDelete(record.id)}
>
  Delete
</button>

                  

                </div>

              </div>

            ))

          ) : (

            <div className="no-records glass-card">

              <div>
                📄
              </div>

              <h3>
                No records found
              </h3>

              <p>
                Try a different search or filter.
              </p>

            </div>

          )}

        </div>

      </section>

    </div>
  );
}

export default MedicalRecords;