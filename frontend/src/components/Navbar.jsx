import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useState } from "react";

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-green-600">
          ⛳ Golf Charity
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hover:text-green-600 transition ${isActive ? "text-green-600" : "text-gray-700"}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/charities"
            className={({ isActive }) =>
              `hover:text-green-600 transition ${isActive ? "text-green-600" : "text-gray-700"}`
            }
          >
            Charities
          </NavLink>

          <NavLink
            to="/prizes"
            className={({ isActive }) =>
              `hover:text-green-600 transition ${isActive ? "text-green-600" : "text-gray-700"}`
            }
          >
            Prizes
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `hover:text-green-600 transition ${isActive ? "text-green-600" : "text-gray-700"}`
                }
              >
                Dashboard
              </NavLink>

              {user?.role === "ADMIN" && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `hover:text-red-600 transition ${isActive ? "text-red-600" : "text-gray-700"}`
                  }
                >
                  Admin Panel
                </NavLink>
              )}

              <div className="flex items-center gap-3">
                <span className="text-gray-600">{user?.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `hover:text-green-600 transition ${isActive ? "text-green-600" : "text-gray-700"}`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold"
              >
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="md:hidden text-gray-700 text-2xl"
        >
          ☰
        </button>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 md:hidden">
            <div className="flex flex-col gap-4 p-4">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/charities">Charities</NavLink>
              <NavLink to="/prizes">Prizes</NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  {user?.role === "ADMIN" && <NavLink to="/admin">Admin Panel</NavLink>}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login">Login</NavLink>
                  <NavLink to="/register">Register</NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
