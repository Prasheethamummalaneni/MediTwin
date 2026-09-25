import { useEffect, useState } from "react";
import {
  getMedicalRecords,
  getMedications,
  getAppointments,
  getHealthMetrics,
} from "../services/Api";

function Dashboard() {
  const patientId = 1;

  const [records, setRecords] = useState([]);
  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        recordsData,
        medicationsData,
        appointmentsData,
        healthData,
      ] = await Promise.all([
        getMedicalRecords(patientId),
        getMedications(patientId),
        getAppointments(patientId),
        getHealthMetrics(patientId),
      ]);

      setRecords(recordsData || []);
      setMedications(medicationsData || []);
      setAppointments(appointmentsData || []);
      setHealthMetrics(healthData?.data || healthData || null);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  // =========================================
  // FORMAT MEDICAL RECORDS
  // =========================================

  const formattedRecords = records.map((record) => ({
    id: record[0],
    patientId: record[1],
    name: record[2],
    category: record[3],
    date: record[4],
  }));

  // =========================================
  // FORMAT MEDICATIONS
  // =========================================

  const formattedMedications = medications.map((medication) => ({
    id: medication[0],
    patientId: medication[1],
    name: medication[2],
    dosage: medication[3],
    frequency: medication[4],
    timing: medication[5],
    nextDose: medication[6],
    doctor: medication[7],
    status: medication[8],
  }));

  // =========================================
  // FORMAT APPOINTMENTS
  // =========================================

  const formattedAppointments = appointments.map((appointment) => ({
    id: appointment[0],
    patientId: appointment[1],
    doctor: appointment[2],
    specialty: appointment[3],
    hospital: appointment[4],
    date: appointment[5],
    time: appointment[6],
    reason: appointment[7],
    status: appointment[8],
  }));

  // =========================================
  // UPCOMING APPOINTMENTS
  // =========================================

  const upcomingAppointments = formattedAppointments.filter(
    (appointment) => appointment.status === "Upcoming"
  );

  // Sort upcoming appointments by date
  const sortedUpcomingAppointments = [...upcomingAppointments].sort(
    (a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);

      return dateA - dateB;
    }
  );

  const nextAppointment = sortedUpcomingAppointments[0];

  // =========================================
  // RECENT RECORDS
  // =========================================

  const recentRecords = [...formattedRecords]
    .sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    })
    .slice(0, 2);

  // =========================================
  // HEALTH METRICS
  // =========================================

  const heartRate = healthMetrics?.heart_rate;
  const weight = healthMetrics?.weight;
  const bloodPressure = healthMetrics?.blood_pressure;

  // =========================================
  // DATE FORMAT
  // =========================================

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================
  // APPOINTMENT DATE
  // =========================================

  const formatAppointmentDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  // =========================================
  // APPOINTMENT ICON
  // =========================================

  const getAppointmentIcon = (specialty) => {
    if (!specialty) return "🩺";

    if (specialty.toLowerCase().includes("dent")) {
      return "🦷";
    }

    return "🩺";
  };

  // =========================================
  // RECORD ICON
  // =========================================

  const getRecordIcon = (category) => {
    if (!category) return "📄";

    const value = category.toLowerCase();

    if (value.includes("lab")) {
      return "🩸";
    }

    if (value.includes("prescription")) {
      return "💊";
    }

    if (value.includes("diagnosis")) {
      return "🩺";
    }

    if (value.includes("imaging")) {
      return "🩻";
    }

    return "📄";
  };

  return (
    <div className="dashboard-page">

      {/* =========================================
          WELCOME SECTION
      ========================================= */}

      <section className="dashboard-section welcome-section">

        <div>
          <h1>Hello, Ananya Reddy 👋</h1>

          <p>
            Welcome back to your MediTwin Digital Health Companion.
          </p>
        </div>

        <div className="health-status">
          <span className="status-dot"></span>
          Health Status: Good
        </div>

      </section>


      {/* =========================================
          HEALTH SUMMARY CARDS
      ========================================= */}

      <section className="dashboard-section summary-section">

        <div className="summary-cards">

          {/* Health Score */}

          <div className="summary-card glass-card">

            <div className="summary-icon health-score-icon">
              ❤️
            </div>

            <div className="summary-info">

              <p>Health Score</p>

              <h3>
                85 <span>/100</span>
              </h3>

              <small>
                Based on available data
              </small>

            </div>

          </div>


          {/* Active Medications */}

          <div className="summary-card glass-card">

            <div className="summary-icon medication-icon">
              💊
            </div>

            <div className="summary-info">

              <p>Active Medications</p>

              <h3>
                {formattedMedications.length}
              </h3>

              <small>
                Current medications
              </small>

            </div>

          </div>


          {/* Upcoming Appointments */}

          <div className="summary-card glass-card">

            <div className="summary-icon appointment-icon">
              🗓️
            </div>

            <div className="summary-info">

              <p>Upcoming Appointments</p>

              <h3>
                {nextAppointment
                  ? formatAppointmentDate(nextAppointment.date)
                  : "None"}
              </h3>

              <small>
                {nextAppointment
                  ? `${nextAppointment.time} · ${nextAppointment.reason}`
                  : "No upcoming appointments"}
              </small>

            </div>

          </div>


          {/* Medical Records */}

          <div className="summary-card glass-card">

            <div className="summary-icon record-icon">
              📄
            </div>

            <div className="summary-info">

              <p>Medical Records</p>

              <h3>
                {formattedRecords.length}
              </h3>

              <small>
                Documents stored
              </small>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          HEALTH SNAPSHOT
      ========================================= */}

      <section className="dashboard-panel glass-card">

        <div className="panel-header">

          <h2>Latest Health Snapshot</h2>

        </div>

        <div className="summary-cards">

          <div className="summary-card">

            <div className="summary-icon health-score-icon">
              ❤️
            </div>

            <div className="summary-info">

              <p>Heart Rate</p>

              <h3>
                {heartRate ? `${heartRate} BPM` : "-- BPM"}
              </h3>

            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon">
              ⚖️
            </div>

            <div className="summary-info">

              <p>Weight</p>

              <h3>
                {weight ? `${weight} kg` : "-- kg"}
              </h3>

            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon">
              🩸
            </div>

            <div className="summary-info">

              <p>Blood Pressure</p>

              <h3>
                {bloodPressure || "--"}
              </h3>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          LOWER DASHBOARD
      ========================================= */}

      <div className="dashboard-grid">


        {/* =========================================
            UPCOMING APPOINTMENTS
        ========================================= */}

        <section className="dashboard-panel glass-card">

          <div className="panel-header">

            <h2>Upcoming Appointments</h2>

            <span>
              View All
            </span>

          </div>


          {sortedUpcomingAppointments.length > 0 ? (

            sortedUpcomingAppointments
              .slice(0, 2)
              .map((appointment) => (

                <div
                  className="appointment-item"
                  key={appointment.id}
                >

                  <div className="item-icon">
                    {getAppointmentIcon(
                      appointment.specialty
                    )}
                  </div>

                  <div>

                    <h3>
                      {appointment.reason}
                    </h3>

                    <p>
                      {appointment.doctor} ·{" "}
                      {appointment.hospital}
                    </p>

                    <span>
                      {formatAppointmentDate(
                        appointment.date
                      )}{" "}
                      ·{" "}
                      {appointment.time}
                    </span>

                  </div>

                </div>

              ))

          ) : (

            <div className="appointment-item">

              <div className="item-icon">
                📅
              </div>

              <div>

                <h3>
                  No upcoming appointments
                </h3>

                <p>
                  Your scheduled visits will appear here.
                </p>

              </div>

            </div>

          )}

        </section>


        {/* =========================================
            CURRENT MEDICATIONS
        ========================================= */}

        <section className="dashboard-panel glass-card">

          <div className="panel-header">

            <h2>Current Medications</h2>

            <span>
              View All
            </span>

          </div>


          {formattedMedications.length > 0 ? (

            formattedMedications
              .slice(0, 2)
              .map((medication) => (

                <div
                  className="medication-item"
                  key={medication.id}
                >

                  <div className="item-icon">
                    💊
                  </div>

                  <div>

                    <h3>
                      {medication.name}
                    </h3>

                    <p>
                      {medication.frequency}
                    </p>

                    <span>
                      {medication.nextDose
                        ? `Next: ${medication.nextDose}`
                        : medication.timing}
                    </span>

                  </div>

                </div>

              ))

          ) : (

            <div className="medication-item">

              <div className="item-icon">
                💊
              </div>

              <div>

                <h3>
                  No medications
                </h3>

                <p>
                  Your current medications will appear here.
                </p>

              </div>

            </div>

          )}

        </section>

      </div>


      {/* =========================================
          RECENT MEDICAL RECORDS
      ========================================= */}

      <section className="dashboard-panel glass-card recent-records">

        <div className="panel-header">

          <h2>Recent Medical Records</h2>

          <span>
            View All
          </span>

        </div>


        {recentRecords.length > 0 ? (

          recentRecords.map((record) => (

            <div
              className="record-item"
              key={record.id}
            >

              <div className="item-icon">
                {getRecordIcon(record.category)}
              </div>

              <div>

                <h3>
                  {record.name}
                </h3>

                <p>
                  MediTwin · {record.category}
                </p>

              </div>

              <span>
                {formatDate(record.date)}
              </span>

            </div>

          ))

        ) : (

          <div className="record-item">

            <div className="item-icon">
              📄
            </div>

            <div>

              <h3>
                No medical records
              </h3>

              <p>
                Your uploaded records will appear here.
              </p>

            </div>

          </div>

        )}

      </section>


      {/* =========================================
          HEALTH METRICS INFORMATION
      ========================================= */}

      {healthMetrics && (

        <section className="dashboard-panel glass-card">

          <div className="panel-header">

            <h2>Health Information</h2>

          </div>

          <p>
            Latest health measurements are available in your
            Health Dashboard.
          </p>

        </section>

      )}

    </div>
  );
}

export default Dashboard;