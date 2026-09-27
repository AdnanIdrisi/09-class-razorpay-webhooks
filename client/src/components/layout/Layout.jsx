import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";

function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function logout() {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to={user ? "/payment" : "/login"}>
          <span className="brand-mark">K</span>
          <span>Kapda Co.</span>
        </Link>
        {user && (
          <div className="account-actions">
            <span className="welcome">Hi, {user.name}</span>
            <button className="button button-quiet" onClick={logout}>
              Log out
            </button>
          </div>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}

export default Layout;
