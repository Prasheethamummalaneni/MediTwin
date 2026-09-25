import { useEffect, useMemo, useState } from "react";

import {
  getMedications,
  getAppointments,
  getMedicalRecords,
  getHealthMetrics,
  createHealthMetrics,
} from "../services/Api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

function HealthDashboard() {
  const patientId = 1;

  const [period, setPeriod] = useState("Last 7 Days");

  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState(null);

  // Health Metrics Form
  const [metricForm, setMetricForm] = useState({
    heart_rate: "",
    weight: "",
    blood_pressure: "",
    temperature: "",
  });

  const [savingMetrics, setSavingMetrics] = useState(false);
  const [metricMessage, setMetricMessage] = useState("");

  // Popup state
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD HEALTH DATA
  // ==========================================

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setLoading(true);

      const [
        medicationData,
        appointmentData,
        recordData,
        healthMetricData,
      ] = await Promise.all([
        getMedications(patientId),
        getAppointments(patientId),
        getMedicalRecords(patientId),
        getHealthMetrics(patientId),
      ]);

      setMedications(medicationData || []);
      setAppointments(appointmentData || []);
      setRecords(recordData || []);
      setHealthMetrics(
        healthMetricData?.data || healthMetricData || null
      );
    } catch (error) {
      console.error(
        "Error loading health dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DATA COUNTS
  // ==========================================

  const medicationCount = medications.length;

  const appointmentCount = appointments.length;

  const recordCount = records.length;

  // ==========================================
  // RECORD CATEGORIES
  // ==========================================

  const recordCategories = useMemo(() => {
    const categoryCounts = {};

    records.forEach((record) => {
      const category = record[2] || "Other";

      if (categoryCounts[category]) {
        categoryCounts[category]++;
      } else {
        categoryCounts[category] = 1;
      }
    });

    return Object.entries(categoryCounts);
  }, [records]);

  // ==========================================
  // MOST RECENT RECORD
  // ==========================================

  const recentRecord =
    records.length > 0
      ? records[records.length - 1]
      : null;

  // ==========================================
  // UPCOMING APPOINTMENT
  // ==========================================

  const upcomingAppointment =
    appointments.length > 0
      ? appointments[0]
      : null;

  // ==========================================
  // HEALTH SCORE
  // ==========================================

  const healthScore = useMemo(() => {
    let score = 70;

    if (recordCount > 0) {
      score += 5;
    }

    if (medicationCount > 0) {
      score += 5;
    }

    if (appointmentCount > 0) {
      score += 5;
    }

    return Math.min(score, 100);
  }, [
    recordCount,
    medicationCount,
    appointmentCount,
  ]);

  // ==========================================
  // HEALTH SCORE LABEL
  // ==========================================

  const healthScoreLabel =
    healthScore >= 85
      ? "Good Health"
      : healthScore >= 70
      ? "Moderate"
      : "Needs Attention";

  // ==========================================
  // HEALTH TREND DATA
  // ==========================================

  const chartData = [
    Math.max(healthScore - 17, 0),
    Math.max(healthScore - 14, 0),
    Math.max(healthScore - 11, 0),
    Math.max(healthScore - 8, 0),
    Math.max(healthScore - 5, 0),
    Math.max(healthScore - 2, 0),
    healthScore,
  ];

  // ==========================================
  // CHART.JS LINE CHART
  // ==========================================

  const healthTrendChart = {
    labels: [
      "Day 1",
      "Day 2",
      "Day 3",
      "Day 4",
      "Day 5",
      "Day 6",
      "Today",
    ],

    datasets: [
  {
    label: "Health Score",
    data: chartData,

    borderColor: "#2F80ED",
    backgroundColor: "rgba(47, 128, 237, 0.16)",

    pointBackgroundColor: "#2F80ED",
    pointBorderColor: "#FFFFFF",
    pointHoverBackgroundColor: "#1D5FBF",
    pointHoverBorderColor: "#FFFFFF",

    borderWidth: 3,
    tension: 0.4,
    fill: true,

    pointRadius: 5,
    pointHoverRadius: 7,
  },
],
  };

  const healthTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
        position: "top",
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return `Health Score: ${context.parsed.y}/100`;
          },
        },
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        max: 100,

        ticks: {
          stepSize: 20,
        },

        title: {
          display: true,
          text: "Health Score",
        },
      },

      x: {
        title: {
          display: true,
          text: "Period",
        },
      },
    },
  };

  // ==========================================
  // RECORD CATEGORY CHART
  // ==========================================

  const recordCategoryChart = {
  labels: recordCategories.map(
    ([category]) => category
  ),

  datasets: [
    {
      label: "Medical Records",

      data: recordCategories.map(
        ([, count]) => count
      ),

      backgroundColor: [
        "#4DB6AC",
        "#7E8CE0",
        "#5B9EE8",
        "#F4A261",
        "#E88CB5",
        "#8BCB88",
      ],

      borderColor: "#FFFFFF",
      borderWidth: 3,

      hoverOffset: 8,
    },
  ],
};

  const recordCategoryOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed} record${
              context.parsed !== 1 ? "s" : ""
            }`;
          },
        },
      },
    },
  };

  // ==========================================
  // RECORD CATEGORY ICON
  // ==========================================

  const getCategoryIcon = (category) => {
    const lowerCategory =
      category.toLowerCase();

    if (
      lowerCategory.includes("diagnosis")
    ) {
      return "🩺";
    }

    if (
      lowerCategory.includes("prescription") ||
      lowerCategory.includes("medicine")
    ) {
      return "💊";
    }

    if (
      lowerCategory.includes("lab") ||
      lowerCategory.includes("test")
    ) {
      return "🧪";
    }

    if (
      lowerCategory.includes("scan") ||
      lowerCategory.includes("report")
    ) {
      return "📋";
    }

    return "📄";
  };

  // ==========================================
  // HEALTH METRICS FORM
  // ==========================================

  const handleMetricChange = (event) => {
    const { name, value } = event.target;

    setMetricForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // OPEN METRICS POPUP
  // ==========================================

  const openMetricModal = () => {
    setMetricMessage("");
    setIsMetricModalOpen(true);
  };

  // ==========================================
  // CLOSE METRICS POPUP
  // ==========================================

  const closeMetricModal = () => {
    if (savingMetrics) {
      return;
    }

    setIsMetricModalOpen(false);
    setMetricMessage("");
  };

  // ==========================================
  // SAVE HEALTH METRICS
  // ==========================================

  const handleSaveMetrics = async (event) => {
    event.preventDefault();

    try {
      setSavingMetrics(true);
      setMetricMessage("");

      const data = {
        patient_id: patientId,

        heart_rate: metricForm.heart_rate
          ? Number(metricForm.heart_rate)
          : null,

        weight: metricForm.weight
          ? Number(metricForm.weight)
          : null,

        blood_pressure:
          metricForm.blood_pressure,

        temperature: metricForm.temperature
          ? Number(metricForm.temperature)
          : null,
      };

      await createHealthMetrics(data);

      setMetricMessage(
        "Health metrics saved successfully."
      );

      // Reload latest health metrics
      const latestMetrics =
        await getHealthMetrics(patientId);

      setHealthMetrics(
        latestMetrics?.data ||
          latestMetrics ||
          null
      );

      // Clear form
      setMetricForm({
        heart_rate: "",
        weight: "",
        blood_pressure: "",
        temperature: "",
      });

      // Close popup after saving
      setTimeout(() => {
        setIsMetricModalOpen(false);
        setMetricMessage("");
      }, 1000);

    } catch (error) {
      console.error(
        "Error saving health metrics:",
        error
      );

      setMetricMessage(
        "Unable to save health metrics. Please try again."
      );
    } finally {
      setSavingMetrics(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="health-dashboard-page">

      {/* ====================================== */}
      {/* PAGE HEADER */}
      {/* ====================================== */}

      <section className="health-dashboard-header">

        <div>

          <h1>
            Health Dashboard
          </h1>

          <p>
            Get an overview of your health
            information and wellness trends.
          </p>

        </div>

        <div className="health-period glass-card">

          <span>
            📅
          </span>

          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value)
            }
          >

            <option>
              Last 7 Days
            </option>

            <option>
              Last 30 Days
            </option>

            <option>
              Last 3 Months
            </option>

          </select>

        </div>

      </section>


      {/* ====================================== */}
      {/* HEALTH SCORE + BASIC METRICS */}
      {/* ====================================== */}

      <section className="health-overview">

        {/* HEALTH SCORE */}

        <div className="health-score-card glass-card">

          <div className="health-score-header">

            <div>

              <h2>
                Overall Health Score
              </h2>

              <p>
                Indicative score based on your
                available MediTwin data.
              </p>

            </div>

            <span>
              ❤️
            </span>

          </div>

          <div className="health-score-value">

            <strong>
              {loading ? "..." : healthScore}
            </strong>

            <span>
              /100
            </span>

          </div>

          <div className="health-progress">

            <div
              className="health-progress-fill"
              style={{
                width: `${healthScore}%`,
              }}
            ></div>

          </div>

          <div className="health-score-footer">

            <span>
              {loading
                ? "Calculating..."
                : healthScoreLabel}
            </span>

            <span>
              Based on stored data
            </span>

          </div>

        </div>


        {/* HEART RATE */}

        <div className="health-stat-card glass-card">

          <div className="health-stat-icon">
            ❤️
          </div>

          <span>
            Heart Rate
          </span>

          <h3>
            {healthMetrics?.heart_rate ?? "--"}{" "}
            <small>BPM</small>
          </h3>

          <p>
            {healthMetrics
              ? "Latest recorded value"
              : "No data recorded"}
          </p>

        </div>


        {/* WEIGHT */}

        <div className="health-stat-card glass-card">

          <div className="health-stat-icon">
            ⚖️
          </div>

          <span>
            Weight
          </span>

          <h3>
            {healthMetrics?.weight ?? "--"}{" "}
            <small>kg</small>
          </h3>

          <p>
            {healthMetrics
              ? "Latest recorded value"
              : "No data recorded"}
          </p>

        </div>


        {/* BLOOD PRESSURE */}

        <div className="health-stat-card glass-card">

          <div className="health-stat-icon">
            🩸
          </div>

          <span>
            Blood Pressure
          </span>

          <h3>
            {healthMetrics?.blood_pressure ?? "--"}
          </h3>

          <p>
            {healthMetrics
              ? "Latest recorded value"
              : "No data recorded"}
          </p>

        </div>

      </section>


      {/* ====================================== */}
      {/* HEALTH SUMMARY */}
      {/* ====================================== */}

      <section className="health-overview">

        {/* MEDICAL RECORDS */}

        <div className="health-stat-card glass-card">

          <div className="health-stat-icon">
            📄
          </div>

          <span>
            Medical Records
          </span>

          <h3>
            {loading
              ? "..."
              : recordCount}
          </h3>

          <p>
            Stored records
          </p>

        </div>


        {/* MEDICATIONS */}

        <div className="health-stat-card glass-card">

          <div className="health-stat-icon">
            💊
          </div>

          <span>
            Medications
          </span>

          <h3>
            {loading
              ? "..."
              : medicationCount}
          </h3>

          <p>
            Current medications
          </p>

        </div>


        {/* APPOINTMENTS */}

        <div className="health-stat-card glass-card">

          <div className="health-stat-icon">
            🗓️
          </div>

          <span>
            Appointments
          </span>

          <h3>
            {loading
              ? "..."
              : appointmentCount}
          </h3>

          <p>
            Scheduled appointments
          </p>

        </div>


        {/* HEALTH STATUS */}

        <div className="health-stat-card glass-card">

          <div className="health-stat-icon">
            🩺
          </div>

          <span>
            Health Status
          </span>

          <h3>
            {loading
              ? "..."
              : healthScoreLabel}
          </h3>

          <p>
            Based on available data
          </p>

        </div>

      </section>


      {/* ====================================== */}
      {/* HEALTH TRENDS */}
      {/* ====================================== */}

      <section className="health-trends glass-card">

        <div className="health-section-header">

          <div>

            <h2>
              Health Trends
            </h2>

            <p>
              Indicative health score trend for
              the selected period.
            </p>

          </div>

          <span className="trend-positive">
            ↑ Tracking
          </span>

        </div>


        <div
          style={{
            width: "100%",
            height: "320px",
            position: "relative",
            padding: "10px",
          }}
        >

          <Line
            data={healthTrendChart}
            options={healthTrendOptions}
          />

        </div>

      </section>


      {/* ====================================== */}
      {/* RECORD CATEGORY BREAKDOWN */}
      {/* ====================================== */}

      <section className="health-information">

        {/* RECORD CATEGORY LIST */}

        <div className="health-info-card glass-card">

          <div className="health-section-header">

            <div>

              <h2>
                Medical Record Overview
              </h2>

              <p>
                Distribution of your stored
                medical records.
              </p>

            </div>

            <span>
              📊
            </span>

          </div>


          {recordCategories.length > 0 ? (

            <div className="record-category-list">

              {recordCategories.map(
                ([category, count]) => (

                  <div
                    className="record-category-row"
                    key={category}
                  >

                    <div className="record-category-info">

                      <div className="metric-icon">
                        {getCategoryIcon(
                          category
                        )}
                      </div>

                      <div>

                        <strong>
                          {category}
                        </strong>

                        <span>
                          {count} record
                          {count !== 1
                            ? "s"
                            : ""}
                        </span>

                      </div>

                    </div>


                    <div className="record-category-count">

                      {count}

                    </div>

                  </div>

                )
              )}

            </div>

          ) : (

            <div className="health-empty-state">

              <span>
                📄
              </span>

              <p>
                No medical records available
                yet.
              </p>

            </div>

          )}

        </div>


        {/* RECORD CATEGORY DOUGHNUT */}

        <div className="health-info-card glass-card">

          <div className="health-section-header">

            <div>

              <h2>
                Record Distribution
              </h2>

              <p>
                Visual breakdown of your medical
                records.
              </p>

            </div>

            <span>
              🍩
            </span>

          </div>


          {recordCategories.length > 0 ? (

            <div
              style={{
                width: "100%",
                height: "300px",
                position: "relative",
              }}
            >

              <Doughnut
                data={recordCategoryChart}
                options={recordCategoryOptions}
              />

            </div>

          ) : (

            <div className="health-empty-state">

              <span>
                📊
              </span>

              <p>
                Upload medical records to see
                the category distribution.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* ====================================== */}
      {/* HEALTH INSIGHTS */}
      {/* ====================================== */}

      <section className="health-info-card glass-card">

        <div className="health-section-header">

          <div>

            <h2>
              Health Insights
            </h2>

            <p>
              Observations based on your
              MediTwin data.
            </p>

          </div>

          <span>
            💡
          </span>

        </div>


        <div className="health-insight">

          <div>
            💚
          </div>

          <p>

            Your current indicative health
            score is{" "}

            <strong>
              {healthScore}/100
            </strong>.

          </p>

        </div>


        <div className="health-insight">

          <div>
            💊
          </div>

          <p>

            You currently have{" "}

            <strong>
              {medicationCount}
            </strong>{" "}

            medication
            {medicationCount !== 1
              ? "s"
              : ""}{" "}
            recorded in MediTwin.

          </p>

        </div>


        <div className="health-insight">

          <div>
            🗓️
          </div>

          <p>

            {upcomingAppointment
              ? `You have ${appointmentCount} appointment${
                  appointmentCount !== 1
                    ? "s"
                    : ""
                } recorded in MediTwin.`
              : "You currently have no appointments recorded."}

          </p>

        </div>


        <div className="health-insight">

          <div>
            📄
          </div>

          <p>

            Your MediTwin profile currently
            contains{" "}

            <strong>
              {recordCount}
            </strong>{" "}

            medical record
            {recordCount !== 1
              ? "s"
              : ""}.

          </p>

        </div>

      </section>


      {/* ====================================== */}
      {/* RECENT RECORD */}
      {/* ====================================== */}

      <section className="health-info-card glass-card">

        <div className="health-section-header">

          <div>

            <h2>
              Recent Medical Record
            </h2>

            <p>
              Your latest uploaded medical
              document.
            </p>

          </div>

          <span>
            📄
          </span>

        </div>


        {recentRecord ? (

          <div className="health-appointment-preview">

            <div className="metric-icon">
              {getCategoryIcon(
                recentRecord[2] || "Other"
              )}
            </div>

            <div>

              <strong>
                {recentRecord[1]}
              </strong>

              <span>
                {recentRecord[2] ||
                  "Other"}
              </span>

              <small>
                Uploaded:{" "}
                {recentRecord[3]}
              </small>

            </div>

          </div>

        ) : (

          <div className="health-empty-state">

            <span>
              📄
            </span>

            <p>
              No medical records uploaded yet.
            </p>

          </div>

        )}

      </section>


      {/* ====================================== */}
      {/* UPCOMING APPOINTMENT */}
      {/* ====================================== */}

      <section className="health-info-card glass-card health-upcoming-card">

        <div className="health-section-header">

          <div>

            <h2>
              Next Appointment
            </h2>

            <p>
              Your upcoming healthcare visit.
            </p>

          </div>

          <span>
            🗓️
          </span>

        </div>


        {upcomingAppointment ? (

          <div className="health-appointment-preview">

            <div className="metric-icon">
              🩺
            </div>

            <div>

              <strong>
                {upcomingAppointment[2] ||
                  "Doctor Appointment"}
              </strong>

              <span>
                {upcomingAppointment[3] ||
                  "Healthcare Visit"}
              </span>

              <small>

                {upcomingAppointment[5] ||
                  "Date not available"}

                {" · "}

                {upcomingAppointment[6] ||
                  "Time not available"}

              </small>

            </div>

          </div>

        ) : (

          <div className="health-empty-state">

            <span>
              🗓️
            </span>

            <p>
              No upcoming appointments
              recorded.
            </p>

          </div>

        )}

      </section>


      {/* ====================================== */}
      {/* ADD HEALTH METRICS BUTTON */}
      {/* ====================================== */}

      <section className="health-info-card glass-card add-health-metrics-card">

        <div className="health-section-header">

          <div>

            <h2>
              Update Health Information
            </h2>

            <p>
              Add your latest health measurements
              to keep your dashboard updated.
            </p>

          </div>

          <span>
            🩺
          </span>

        </div>

        <button
          type="button"
          className="health-add-metrics-button"
          onClick={openMetricModal}
        >
          ➕ Add Health Metrics
        </button>

      </section>


      {/* ====================================== */}
      {/* DISCLAIMER */}
      {/* ====================================== */}

      <div className="health-dashboard-note">

        ℹ️ Health scores and dashboard insights
        are for project demonstration purposes
        and do not represent medical diagnosis or
        professional medical advice.

      </div>


      {/* ====================================== */}
      {/* ADD HEALTH METRICS MODAL */}
      {/* ====================================== */}

      {isMetricModalOpen && (

        <div
          className="health-metrics-modal-overlay"
          onClick={closeMetricModal}
        >

          <div
            className="health-metrics-modal glass-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="health-metrics-modal-header">

              <div>

                <h2>
                  Add Health Metrics
                </h2>

                <p>
                  Enter your latest health measurements.
                </p>

              </div>

              <button
                type="button"
                className="health-modal-close"
                onClick={closeMetricModal}
                disabled={savingMetrics}
              >
                ✕
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSaveMetrics}
              className="health-metrics-form"
            >

              {/* HEART RATE */}

              <div className="health-metric-input">

                <label>
                  ❤️ Heart Rate (BPM)
                </label>

                <input
                  type="number"
                  name="heart_rate"
                  value={metricForm.heart_rate}
                  onChange={handleMetricChange}
                  placeholder="e.g. 72"
                />

              </div>


              {/* WEIGHT */}

              <div className="health-metric-input">

                <label>
                  ⚖️ Weight (kg)
                </label>

                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={metricForm.weight}
                  onChange={handleMetricChange}
                  placeholder="e.g. 65"
                />

              </div>


              {/* BLOOD PRESSURE */}

              <div className="health-metric-input">

                <label>
                  🩸 Blood Pressure
                </label>

                <input
                  type="text"
                  name="blood_pressure"
                  value={metricForm.blood_pressure}
                  onChange={handleMetricChange}
                  placeholder="e.g. 120/80"
                />

              </div>


              {/* TEMPERATURE */}

              <div className="health-metric-input">

                <label>
                  🌡️ Temperature (°F)
                </label>

                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={metricForm.temperature}
                  onChange={handleMetricChange}
                  placeholder="e.g. 98.6"
                />

              </div>


              {/* BUTTONS */}

              <div className="health-modal-actions">

                <button
                  type="button"
                  className="health-cancel-button"
                  onClick={closeMetricModal}
                  disabled={savingMetrics}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="health-save-button"
                  disabled={savingMetrics}
                >
                  {savingMetrics
                    ? "Saving..."
                    : "Save Metrics"}
                </button>

              </div>

            </form>


            {/* MESSAGE */}

            {metricMessage && (

              <p className="health-metric-message">
                {metricMessage}
              </p>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default HealthDashboard;