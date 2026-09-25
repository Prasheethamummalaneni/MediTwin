import { useEffect, useState } from "react";
import {
  getAppointments,
  createAppointment,
  deleteAppointment,
} from "../services/Api";

function Appointments() {
  const patientId = 1;
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [formData, setFormData] = useState({
    doctor: "",
    specialty: "",
    hospital: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    status: "Upcoming",
  });

  // LOAD APPOINTMENTS
  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await getAppointments(patientId);

      const formattedAppointments = data.map((appointment) => ({
        id: appointment[0],
        patientId: appointment[1],
        doctor: appointment[2],
        specialization: appointment[3],
        hospital: appointment[4],
        date: appointment[5],
        time: appointment[6],
        type: appointment[7],
        status: appointment[8],
        icon: appointment[3]?.toLowerCase().includes("dent")
          ? "🦷"
          : "🩺",
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    }
  };

  // FORM CHANGE
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // ADD APPOINTMENT
  const handleAddAppointment = async (event) => {
    event.preventDefault();

    try {
      await createAppointment({
        patient_id: patientId,
        doctor: formData.doctor,
        specialty: formData.specialty,
        hospital: formData.hospital,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        reason: formData.reason,
        status: formData.status,
      });

      alert("Appointment added successfully! 📅");

      setFormData({
        doctor: "",
        specialty: "",
        hospital: "",
        appointment_date: "",
        appointment_time: "",
        reason: "",
        status: "Upcoming",
      });

      setShowForm(false);

      await loadAppointments();
    } catch (error) {
      console.error("Failed to add appointment:", error);
      alert("Failed to add appointment");
    }
  };

  // DELETE APPOINTMENT
  const handleDelete = async (appointmentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmDelete) return;

    try {
      await deleteAppointment(appointmentId);

      alert("Appointment deleted successfully! 🗑️");

      await loadAppointments();
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      alert("Failed to delete appointment");
    }
  };

  // VIEW APPOINTMENT
  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
  };

  // CLOSE VIEW POPUP
  const closeView = () => {
    setSelectedAppointment(null);
  };

  // FILTER
  const filteredAppointments =
    filter === "All"
      ? appointments
      : appointments.filter(
          (appointment) => appointment.status === filter
        );

  // SUMMARY
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === "Upcoming"
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "Completed"
  ).length;

  // NEXT APPOINTMENT
  const nextAppointment = appointments.find(
    (appointment) => appointment.status === "Upcoming"
  );

  return (
    <div className="appointments-page">

      {/* PAGE HEADER */}
      <section className="appointments-page-header">
        <div>
          <h1>Appointments</h1>

          <p>
            Manage your upcoming and previous healthcare appointments.
          </p>
        </div>

        <button
          className="add-appointment-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Appointment
        </button>
      </section>


      {/* ADD APPOINTMENT FORM */}
      {showForm && (
        <section className="appointment-form glass-card">

          <div className="appointment-section-header">

            <div>
              <h2>Add Appointment</h2>

              <p>
                Enter the details of your healthcare appointment.
              </p>
            </div>

            <button
              className="close-form-btn"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

          </div>


          <form onSubmit={handleAddAppointment}>

            <div className="appointment-form-grid">

              {/* DOCTOR */}
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


              {/* SPECIALIZATION */}
              <div className="form-group">

                <label>Specialization</label>

                <input
                  type="text"
                  name="specialty"
                  placeholder="Example: General Physician"
                  value={formData.specialty}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* HOSPITAL */}
              <div className="form-group">

                <label>Hospital / Clinic</label>

                <input
                  type="text"
                  name="hospital"
                  placeholder="Example: City Hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* DATE */}
              <div className="form-group">

                <label>Appointment Date</label>

                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* TIME */}
              <div className="form-group">

                <label>Appointment Time</label>

                <input
                  type="text"
                  name="appointment_time"
                  placeholder="Example: 10:30 AM"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* REASON */}
              <div className="form-group">

                <label>Reason</label>

                <input
                  type="text"
                  name="reason"
                  placeholder="Example: Regular checkup"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* STATUS */}
              <div className="form-group">

                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

              </div>

            </div>


            {/* FORM BUTTONS */}
            <div className="appointment-form-actions">

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
                Save Appointment
              </button>

            </div>

          </form>

        </section>
      )}


      {/* SUMMARY CARDS */}
      <section className="appointment-summary">

        <div className="appointment-summary-card glass-card">

          <div className="appointment-summary-icon">
            🗓️
          </div>

          <div>
            <span>Upcoming</span>

            <h3>{upcomingAppointments}</h3>
          </div>

        </div>


        <div className="appointment-summary-card glass-card">

          <div className="appointment-summary-icon">
            ⏰
          </div>

          <div>
            <span>Next Appointment</span>

            <h3>
              {nextAppointment
                ? nextAppointment.date
                : "None"}
            </h3>
          </div>

        </div>


        <div className="appointment-summary-card glass-card">

          <div className="appointment-summary-icon">
            ✅
          </div>

          <div>
            <span>Completed</span>

            <h3>{completedAppointments}</h3>
          </div>

        </div>

      </section>


      {/* NEXT APPOINTMENT */}
      {nextAppointment && (
        <section className="next-appointment glass-card">

          <div className="appointment-section-header">

            <div>
              <h2>Next Appointment</h2>

              <p>
                Your upcoming healthcare visit.
              </p>
            </div>

            <span className="appointment-status">
              Upcoming
            </span>

          </div>


          <div className="next-appointment-content">

            <div className="appointment-doctor-icon">
              {nextAppointment.icon}
            </div>


            <div className="next-appointment-details">

              <h3>
                {nextAppointment.type}
              </h3>

              <p>
                {nextAppointment.doctor} ·{" "}
                {nextAppointment.specialization}
              </p>

              <span>
                {nextAppointment.hospital}
              </span>

            </div>


            <div className="appointment-date-box">

              <strong>
                {nextAppointment.date.split("-")[2]}
              </strong>

              <span>
                {new Date(nextAppointment.date)
                  .toLocaleString("en-US", {
                    month: "short",
                  })
                  .toUpperCase()}
              </span>

            </div>


            <div className="appointment-time-box">

              <strong>
                {nextAppointment.time}
              </strong>

              <span>
                Upcoming
              </span>

            </div>


            <button
              className="appointment-view-btn"
              onClick={() => handleView(nextAppointment)}
            >
              View Details
            </button>

          </div>

        </section>
      )}


      {/* APPOINTMENT LIST */}
      <section className="appointment-list-section">

        <div className="appointment-list-header">

          <div>
            <h2>Your Appointments</h2>

            <p>
              View and manage your healthcare appointments.
            </p>
          </div>


          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="appointment-filter"
          >
            <option value="All">All</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

        </div>


        <div className="appointments-list">

          {filteredAppointments.length > 0 ? (

            filteredAppointments.map((appointment) => (

              <div
                className="appointment-card glass-card"
                key={appointment.id}
              >

                {/* APPOINTMENT INFORMATION */}
                <div className="appointment-main">

                  <div className="appointment-icon">
                    {appointment.icon}
                  </div>


                  <div className="appointment-details">

                    <div className="appointment-name-row">

                      <h3>
                        {appointment.type}
                      </h3>

                      <span
                        className={
                          appointment.status === "Upcoming"
                            ? "appointment-active"
                            : appointment.status === "Cancelled"
                            ? "appointment-completed"
                            : "appointment-completed"
                        }
                      >
                        {appointment.status}
                      </span>

                    </div>


                    <p>
                      {appointment.doctor} ·{" "}
                      {appointment.specialization}
                    </p>


                    <small>
                      {appointment.hospital}
                    </small>

                  </div>

                </div>


                {/* DATE */}
                <div className="appointment-date">

                  <span>Date</span>

                  <strong>
                    {appointment.date}
                  </strong>

                </div>


                {/* TIME */}
                <div className="appointment-time">

                  <span>Time</span>

                  <strong>
                    {appointment.time}
                  </strong>

                </div>


                {/* ACTIONS */}
                <div className="appointment-actions">

                  <button
                    className="appointment-view-btn"
                    onClick={() => handleView(appointment)}
                  >
                    View
                  </button>


                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(appointment.id)
                    }
                  >
                    🗑️ Delete
                  </button>

                </div>

              </div>

            ))

          ) : (

            <div className="no-records glass-card">

              <div>📅</div>

              <h3>
                No appointments found
              </h3>

              <p>
                Add an appointment to see it here.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* APPOINTMENT VIEW POPUP */}
      {selectedAppointment && (

        <div
          className="appointment-modal-overlay"
          onClick={closeView}
        >

          <div
            className="appointment-modal glass-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* POPUP HEADER */}
            <div className="appointment-modal-header">

              <div>

                <h2>
                  Appointment Details
                </h2>

                <p>
                  Complete information about this appointment.
                </p>

              </div>


              <button
                className="appointment-modal-close"
                onClick={closeView}
              >
                ✕
              </button>

            </div>


            {/* POPUP TITLE */}
            <div className="appointment-modal-title">

              <div className="appointment-modal-icon">
                {selectedAppointment.icon}
              </div>


              <div>

                <h3>
                  {selectedAppointment.type}
                </h3>

                <span
                  className={
                    selectedAppointment.status === "Upcoming"
                      ? "appointment-active"
                      : "appointment-completed"
                  }
                >
                  {selectedAppointment.status}
                </span>

              </div>

            </div>


            {/* APPOINTMENT DETAILS */}
            <div className="appointment-details-grid">

              <div className="appointment-detail-box">

                <span>Doctor</span>

                <strong>
                  {selectedAppointment.doctor}
                </strong>

              </div>


              <div className="appointment-detail-box">

                <span>Specialization</span>

                <strong>
                  {selectedAppointment.specialization}
                </strong>

              </div>


              <div className="appointment-detail-box">

                <span>Hospital / Clinic</span>

                <strong>
                  {selectedAppointment.hospital}
                </strong>

              </div>


              <div className="appointment-detail-box">

                <span>Date</span>

                <strong>
                  {selectedAppointment.date}
                </strong>

              </div>


              <div className="appointment-detail-box">

                <span>Time</span>

                <strong>
                  {selectedAppointment.time}
                </strong>

              </div>


              <div className="appointment-detail-box">

                <span>Reason</span>

                <strong>
                  {selectedAppointment.type}
                </strong>

              </div>

            </div>


            {/* POPUP FOOTER */}
            <div className="appointment-modal-footer">

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

export default Appointments;