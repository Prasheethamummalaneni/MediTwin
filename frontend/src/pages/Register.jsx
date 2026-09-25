import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          🩺
        </div>

        <h1>MediTwin</h1>
        <p className="auth-subtitle">Your Health, Your Priority</p>

        <h2>Create Your Account ✨</h2>
        <p className="auth-description">
          Create an account to manage your health information in one place.
        </p>

        <div className="auth-form">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
          />

          <button onClick={handleRegister}>
            Create Account
          </button>
        </div>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>

        <p className="auth-note">
          🔒 Your health information is kept private and secure.
        </p>

      </div>
    </div>
  );
}

export default Register;