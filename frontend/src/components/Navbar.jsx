import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav>
      <h2></h2>

      <div>
        <span></span>

        <span
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
        >
          
        </span>
      </div>
    </nav>
  );
}

export default Navbar;