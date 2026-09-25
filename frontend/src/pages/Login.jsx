import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
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

        <h2>Welcome Back 👋</h2>
        <p className="auth-description">
          Login to access your personalized health companion.
        </p>

        <div className="auth-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
          />

          <button onClick={handleLogin}>
            Login
          </button>
        </div>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>

        <p className="auth-note">
          🔒 Your health information is kept private and secure.
        </p>

      </div>
    </div>
  );
}

export default Login;