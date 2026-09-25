import { useEffect, useState } from "react";
import {
  getPatients,
  updatePatient,
  getMedications,
  getMedicalRecords,
} from "../services/Api";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [patient, setPatient] = useState({
    id: null,
    name: "",
    age: 25,
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const [medicationCount, setMedicationCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);

  // ==========================================
  // LOAD PROFILE + HEALTH DATA
  // ==========================================

  useEffect(() => {
    loadPatient();
  }, []);

  const loadPatient = async () => {
    try {
      const patients = await getPatients();

      if (patients.length > 0) {
        const data = patients[0];

        const patientId = data[0];

        setPatient({
          id: patientId,
          name: data[1] || "",
          age: data[2] || 25,
          email: data[3] || "",
          gender: data[4] || "",
          phone: data[5] || "",
          dateOfBirth: data[6] || "",
          bloodGroup: data[7] || "",
          emergencyContact: data[8] || "",
          emergencyPhone: data[9] || "",
        });

        // Load medications and medical records
        await loadHealthCounts(patientId);
      }
    } catch (error) {
      console.error("Failed to load patient:", error);
    }
  };

  // ==========================================
  // LOAD MEDICATION + RECORD COUNTS
  // ==========================================

  const loadHealthCounts = async (patientId) => {
    try {
      const [medicationData, recordData] =
        await Promise.all([
          getMedications(patientId),
          getMedicalRecords(patientId),
        ]);

      setMedicationCount(
        Array.isArray(medicationData)
          ? medicationData.length
          : 0
      );

      setRecordCount(
        Array.isArray(recordData)
          ? recordData.length
          : 0
      );
    } catch (error) {
      console.error(
        "Failed to load health counts:",
        error
      );
    }
  };

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (event) => {
    setPatient({
      ...patient,
      [event.target.name]: event.target.value,
    });
  };

  // ==========================================
  // SAVE UPDATED PATIENT DATA
  // ==========================================

  const handleSave = async () => {
    try {
      await updatePatient(patient.id, {
        name: patient.name,
        age: Number(patient.age),
        email: patient.email,
        gender: patient.gender,
        phone: patient.phone,
        date_of_birth: patient.dateOfBirth,
        blood_group: patient.bloodGroup,
        emergency_contact: patient.emergencyContact,
        emergency_phone: patient.emergencyPhone,
      });

      setIsEditing(false);

      alert("Profile updated successfully!");

      // Reload patient data
      loadPatient();

    } catch (error) {
      console.error(
        "Failed to update profile:",
        error
      );

      alert("Failed to update profile");
    }
  };

  return (
    <div className="profile-page">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <section className="profile-page-header">

        <div>

          <h1>
            My Profile
          </h1>

          <p>
            Manage your personal and health information.
          </p>

        </div>

        <button
          className="edit-profile-btn"
          onClick={() =>
            isEditing
              ? handleSave()
              : setIsEditing(true)
          }
        >
          {isEditing
            ? "✓ Save Changes"
            : "✎ Edit Profile"}
        </button>

      </section>


      {/* ====================================== */}
      {/* PROFILE OVERVIEW */}
      {/* ====================================== */}

      <section className="profile-overview glass-card">

        <div className="profile-avatar">
          👤
        </div>

        <div className="profile-overview-info">

          <h2>
            {patient.name}
          </h2>

          <p>
            {patient.email}
          </p>

          <span>
            Patient · MediTwin
          </span>

        </div>

        <div className="profile-health-badge">

          <span></span>

          Health Status: Good

        </div>

      </section>


      {/* ====================================== */}
      {/* PERSONAL INFORMATION */}
      {/* ====================================== */}

      <section className="profile-section glass-card">

        <div className="profile-section-header">

          <div>

            <h2>
              Personal Information
            </h2>

            <p>
              Your basic personal details.
            </p>

          </div>

        </div>


        <div className="profile-grid">

          {/* FULL NAME */}

          <div className="profile-field">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={patient.name}
              onChange={handleChange}
              disabled={!isEditing}
            />

          </div>


          {/* EMAIL */}

          <div className="profile-field">

            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={patient.email}
              onChange={handleChange}
              disabled={!isEditing}
            />

          </div>


          {/* PHONE */}

          <div className="profile-field">

            <label>
              Phone Number
            </label>

            <input
              type="text"
              name="phone"
              value={patient.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />

          </div>

          {/* Age */}
<div className="profile-field">

  <label>
    Age
  </label>

  <input
    type="number"
    name="age"
    value={patient.age}
    onChange={handleChange}
    disabled={!isEditing}
  />

</div>


          {/* DATE OF BIRTH */}

          <div className="profile-field">

            <label>
              Date of Birth
            </label>

            <input
              type="text"
              name="dateOfBirth"
              value={patient.dateOfBirth}
              onChange={handleChange}
              disabled={!isEditing}
            />

          </div>


          {/* GENDER */}

          <div className="profile-field">

            <label>
              Gender
            </label>

            <select
              name="gender"
              value={patient.gender}
              onChange={handleChange}
              disabled={!isEditing}
            >

              <option value="">
                Select Gender
              </option>

              <option value="Female">
                Female
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* BLOOD GROUP */}

          <div className="profile-field">

            <label>
              Blood Group
            </label>

            <select
              name="bloodGroup"
              value={patient.bloodGroup}
              onChange={handleChange}
              disabled={!isEditing}
            >

              <option value="">
                Select Blood Group
              </option>

              <option value="O+">
                O+
              </option>

              <option value="O-">
                O-
              </option>

              <option value="A+">
                A+
              </option>

              <option value="A-">
                A-
              </option>

              <option value="B+">
                B+
              </option>

              <option value="B-">
                B-
              </option>

              <option value="AB+">
                AB+
              </option>

              <option value="AB-">
                AB-
              </option>

            </select>

          </div>

        </div>

      </section>


      {/* ====================================== */}
      {/* EMERGENCY CONTACT */}
      {/* ====================================== */}

      <section className="profile-section glass-card">

        <div className="profile-section-header">

          <div>

            <h2>
              Emergency Contact
            </h2>

            <p>
              Contact information to use during emergencies.
            </p>

          </div>

          <span className="emergency-icon">
            🚨
          </span>

        </div>


        <div className="profile-grid">

          {/* CONTACT NAME */}

          <div className="profile-field">

            <label>
              Contact Name
            </label>

            <input
              type="text"
              name="emergencyContact"
              value={patient.emergencyContact}
              onChange={handleChange}
              disabled={!isEditing}
            />

          </div>


          {/* CONTACT NUMBER */}

          <div className="profile-field">

            <label>
              Contact Number
            </label>

            <input
              type="text"
              name="emergencyPhone"
              value={patient.emergencyPhone}
              onChange={handleChange}
              disabled={!isEditing}
            />

          </div>

        </div>

      </section>


      {/* ====================================== */}
      {/* HEALTH INFORMATION */}
      {/* ====================================== */}

      <section className="profile-health-cards">

        {/* BLOOD GROUP */}

        <div className="profile-mini-card glass-card">

          <span>
            🩸
          </span>

          <div>

            <small>
              Blood Group
            </small>

            <strong>
              {patient.bloodGroup || "--"}
            </strong>

          </div>

        </div>


        {/* ACTIVE MEDICATIONS */}

        <div className="profile-mini-card glass-card">

          <span>
            💊
          </span>

          <div>

            <small>
              Active Medications
            </small>

            <strong>
              {medicationCount}
            </strong>

          </div>

        </div>


        {/* MEDICAL RECORDS */}

        <div className="profile-mini-card glass-card">

          <span>
            📄
          </span>

          <div>

            <small>
              Medical Records
            </small>

            <strong>
              {recordCount}
            </strong>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Profile;