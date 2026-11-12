import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>MY Fashion Wear</h2>
      <div>
        <Link to="/">Home</Link>
        <Link to="/men">Men</Link>
        <Link to="/women">Women</Link>
        {isLoggedIn && <Link to="/upload">Upload</Link>}
        {isLoggedIn ? (
          <button 
            onClick={handleLogout} 
            style={{ 
              background: "transparent", 
              border: "none", 
              color: "inherit", 
              cursor: "pointer",
              font: "inherit",
              padding: "0" 
            }}>
            Logout
          </button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}