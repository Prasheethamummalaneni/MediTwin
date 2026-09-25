import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Settings() {
    const [notifications, setNotifications] = useState(true);
    const [healthReminders, setHealthReminders] = useState(true);
    const navigate = useNavigate();
  return (
    <div className="settings-page">

      {/* Page Header */}
      <section className="settings-page-header">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your MediTwin application preferences.
          </p>
        </div>
      </section>

      {/* General Settings */}
      <section className="settings-section glass-card">

        <div className="settings-section-header">
          <div>
            <h2>General Settings</h2>
            <p>Customize your MediTwin experience.</p>
          </div>

          <span>⚙️</span>
        </div>

        <div className="settings-item">
          <div>
            <h3>Notifications</h3>
            <p>
              Receive reminders for medications and appointments.
            </p>
          </div>

          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}/>
        </div>

        <div className="settings-item">
          <div>
            <h3>Health Reminders</h3>
            <p>
              Get reminders related to your health activities.
            </p>
          </div>

          <input
            type="checkbox"
            checked={healthReminders}
            onChange={() => setHealthReminders(!healthReminders)}/>
        </div>

      </section>

      {/* Privacy & Security */}
      <section className="settings-section glass-card">

        <div className="settings-section-header">
          <div>
            <h2>Privacy & Security</h2>
            <p>
              Manage your health data preferences.
            </p>
          </div>

          <span>🔐</span>
        </div>

        <div className="settings-item">
          <div>
            <h3>Secure Medical Records</h3>
            <p>
              Your medical information is stored securely within MediTwin.
            </p>
          </div>

          <span className="settings-status">Protected</span>
        </div>

        <div className="settings-item">
          <div>
            <h3>Secure Sharing</h3>
            <p>
              Control access when sharing your medical records.
            </p>
          </div>

          <span className="settings-status">🔒 Secure</span>
        </div>

      </section>

      {/* Account */}
      <section className="settings-section glass-card">

        <div className="settings-section-header">
          <div>
            <h2>Account</h2>
            <p>Manage your MediTwin account.</p>
          </div>

          <span>👤</span>
        </div>

        <div className="settings-item">
          <div>
            <h3>Profile</h3>
            <p>
              Update your personal and health information.
            </p>
          </div>

          <button
            className="settings-action-btn"
            onClick={() => navigate("/profile")}>
                View Profile
          </button>
        </div>

      </section>

    </div>
  );
}

export default Settings;