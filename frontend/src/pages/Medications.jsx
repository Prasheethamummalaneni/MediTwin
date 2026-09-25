import { useEffect, useState } from "react";
import {
  getMedications,
  createMedication,
  deleteMedication,
} from "../services/Api";

function Medications() {
  const [medications, setMedications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    timing: "",
    next_dose: "",
    doctor: "",
    status: "Active",
  });

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const data = await getMedications(1);

      const formattedMedications = data.map((medicine) => ({
        id: medicine[0],
        patientId: medicine[1],
        name: medicine[2],
        dosage: medicine[3],
        frequency: medicine[4],
        timing: medicine[5],
        nextDose: medicine[6],
        doctor: medicine[7],
        status: medicine[8],
        icon: "💊",
      }));

      setMedications(formattedMedications);
    } catch (error) {
      console.error("Failed to load medications:", error);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleAddMedication = async (event) => {
    event.preventDefault();

    try {
      await createMedication({
        patient_id: 1,
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        timing: formData.timing,
        next_dose: formData.next_dose,
        doctor: formData.doctor,
        status: formData.status,
      });

      alert("Medication added successfully! 💊");

      setFormData({
        name: "",
        dosage: "",
        frequency: "",
        timing: "",
        next_dose: "",
        doctor: "",
        status: "Active",
      });

      setShowForm(false);
      await loadMedications();
    } catch (error) {
      console.error("Failed to add medication:", error);
      alert("Failed to add medication");
    }
  };

  const filteredMedications =
    filter === "All"
      ? medications
      : medications.filter((medicine) => medicine.status === filter);

  const activeMedications = medications.filter(
    (medicine) => medicine.status === "Active"
  ).length;

  const completedMedications = medications.filter(
    (medicine) => medicine.status === "Completed"
  ).length;

  const handleDelete = async (medicationId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medication?"
    );

    if (!confirmDelete) return;

    try {
      await deleteMedication(medicationId);

      alert("Medication deleted successfully!");

      await loadMedications();
    } catch (error) {
      console.error("Failed to delete medication:", error);
      alert("Failed to delete medication");
    }
  };

  // VIEW MEDICATION DETAILS
  const handleView = (medicine) => {
    setSelectedMedication(medicine);
  };

  // CLOSE VIEW POPUP
  const closeView = () => {
    setSelectedMedication(null);
  };

  return (
    <div className="medications-page">

      {/* PAGE HEADER */}
      <section className="medications-page-header">
        <div>
          <h1>Medications</h1>
          <p>
            Keep track of your medicines, dosage and daily medication schedule.
          </p>
        </div>

        <button
          className="add-medication-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Medication
        </button>
      </section>


      {/* ADD MEDICATION FORM */}
      {showForm && (
        <section className="medication-form glass-card">

          <div className="medication-section-header">
            <div>
              <h2>Add Medication</h2>
              <p>Enter the details of your medication.</p>
            </div>

            <button
              className="close-form-btn"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAddMedication}>

            <div className="medication-form-grid">

              <div className="form-group">
                <label>Medicine Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Example: Vitamin D"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-group">
                <label>Dosage</label>

                <input
                  type="text"
                  name="dosage"
                  placeholder="Example: 1000 IU"
                  value={formData.dosage}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-group">
                <label>Frequency</label>

                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select frequency</option>
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">
                    Three times daily
                  </option>
                  <option value="As needed">As needed</option>
                </select>
              </div>


              <div className="form-group">
                <label>Timing</label>

                <input
                  type="text"
                  name="timing"
                  placeholder="Example: After breakfast"
                  value={formData.timing}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-group">
                <label>Next Dose</label>

                <input
                  type="text"
                  name="next_dose"
                  placeholder="Example: 8:00 PM"
                  value={formData.next_dose}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-group">
                <label>Doctor</label>

                <input
                  type="text"
                  name="doctor"
                  placeholder="Example: Dr. Sarah"
                  value={formData.doctor}
                  onChange={handleChange}
                  required
                />
              </div>


              <div className="form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

            </div>


            <div className="medication-form-actions">

              <button
                type="button"
                className="cancel-medication-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-medication-btn"
              >
                Save Medication
              </button>

            </div>

          </form>
        </section>
      )}


      {/* SUMMARY CARDS */}
      <section className="medication-summary">

        <div className="medication-summary-card glass-card">
          <div className="medication-summary-icon">💊</div>

          <div>
            <span>Active Medications</span>
            <h3>{activeMedications}</h3>
          </div>
        </div>


        <div className="medication-summary-card glass-card">
          <div className="medication-summary-icon">⏰</div>

          <div>
            <span>Today's Doses</span>
            <h3>{medications.length}</h3>
          </div>
        </div>


        <div className="medication-summary-card glass-card">
          <div className="medication-summary-icon">✅</div>

          <div>
            <span>Completed Today</span>
            <h3>{completedMedications}</h3>
          </div>
        </div>

      </section>


      {/* TODAY'S MEDICATION */}
      <section className="today-medication glass-card">

        <div className="medication-section-header">

          <div>
            <h2>Today's Medication Schedule</h2>
            <p>Stay on track with your medication routine.</p>
          </div>

          <span className="today-label">Today</span>

        </div>


        <div className="dose-list">

          {medications.length > 0 ? (

            medications.map((medicine) => (

              <div
                className={
                  medicine.status === "Completed"
                    ? "dose-item completed-dose"
                    : "dose-item"
                }
                key={medicine.id}
              >

                <div className="dose-icon">
                  {medicine.status === "Completed" ? "✅" : "💊"}
                </div>


                <div className="dose-info">

                  <h3>{medicine.name}</h3>

                  <p>
                    {medicine.dosage} · {medicine.timing}
                  </p>

                </div>


                <div className="dose-time">

                  <span>
                    {medicine.status === "Completed"
                      ? "Completed"
                      : medicine.nextDose}
                  </span>

                  <small>
                    {medicine.status === "Completed"
                      ? "Today ✓"
                      : "Upcoming"}
                  </small>

                </div>

              </div>

            ))

          ) : (

            <div className="no-records glass-card">

              <div>💊</div>

              <h3>No medications found</h3>

              <p>
                Add medications to see your daily schedule.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* MEDICATION LIST */}
      <section className="medication-list-section">

        <div className="medication-list-header">

          <div>
            <h2>Your Medications</h2>

            <p>
              View and manage your current medication information.
            </p>
          </div>


          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="medication-filter"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>

        </div>


        <div className="medications-list">

          {filteredMedications.length > 0 ? (

            filteredMedications.map((medicine) => (

              <div
                className="medication-card glass-card"
                key={medicine.id}
              >

                <div className="medication-main">

                  <div className="medication-icon">
                    {medicine.icon}
                  </div>


                  <div className="medication-details">

                    <div className="medication-name-row">

                      <h3>{medicine.name}</h3>

                      <span
                        className={
                          medicine.status === "Active"
                            ? "status-active"
                            : "status-completed"
                        }
                      >
                        {medicine.status}
                      </span>

                    </div>


                    <p>
                      {medicine.dosage} · {medicine.frequency}
                    </p>


                    <small>
                      {medicine.timing} · Prescribed by{" "}
                      {medicine.doctor}
                    </small>

                  </div>

                </div>


                <div className="medication-next-dose">

                  <span>Next Dose</span>

                  <strong>
                    {medicine.nextDose}
                  </strong>

                </div>


                <div className="medication-actions">

                  {/* VIEW BUTTON */}
                  <button
                    className="medication-view-btn"
                    onClick={() => handleView(medicine)}
                  >
                    View
                  </button>


                  {/* DELETE BUTTON */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(medicine.id)}
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            ))

          ) : (

            <div className="no-records glass-card">

              <div>💊</div>

              <h3>No medications found</h3>

              <p>
                Try a different filter or add a medication.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* MEDICATION VIEW POPUP */}
      {selectedMedication && (

        <div
          className="medication-modal-overlay"
          onClick={closeView}
        >

          <div
            className="medication-modal glass-card"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="medication-modal-header">

              <div>
                <h2>Medication Details</h2>
                <p>Complete information about this medicine.</p>
              </div>

              <button
                className="medication-modal-close"
                onClick={closeView}
              >
                ✕
              </button>

            </div>


            <div className="medication-modal-title">

              <div className="medication-modal-icon">
                💊
              </div>

              <div>
                <h3>{selectedMedication.name}</h3>

                <span
                  className={
                    selectedMedication.status === "Active"
                      ? "status-active"
                      : "status-completed"
                  }
                >
                  {selectedMedication.status}
                </span>
              </div>

            </div>


            <div className="medication-details-grid">

              <div className="medication-detail-box">
                <span>Dosage</span>
                <strong>{selectedMedication.dosage}</strong>
              </div>


              <div className="medication-detail-box">
                <span>Frequency</span>
                <strong>{selectedMedication.frequency}</strong>
              </div>


              <div className="medication-detail-box">
                <span>Timing</span>
                <strong>{selectedMedication.timing}</strong>
              </div>


              <div className="medication-detail-box">
                <span>Next Dose</span>
                <strong>{selectedMedication.nextDose}</strong>
              </div>


              <div className="medication-detail-box">
                <span>Doctor</span>
                <strong>{selectedMedication.doctor}</strong>
              </div>

            </div>


            <div className="medication-modal-footer">

              <button
                className="cancel-medication-btn"
                onClick={closeView}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Medications;