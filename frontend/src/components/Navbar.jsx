import React, { useState, useEffect } from "react";
import logo from "../logo/RSmart.png";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUserData(data.user);
        } else {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    fetchUserData();
  }, [location.pathname]);

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/user/signout", {
        method: "POST",
        credentials: "include",
      });
      setIsLoggedIn(false);
      setUserData(null);
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    } catch (err) {
      alert("Logout failed");
    }
  };

  // Detect if on login or signup page
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  const isProfilePage = location.pathname === "/profile";

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Link to="/">
          <img src={logo} alt="" className="h-15 w-20" />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          isProfilePage ? (
            <>
              <Link
                to="/"
                className="bg-transparent text-white px-4 py-2 border border-white transition duration-300
                hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] hover:animate-pulse"
              >
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="bg-transparent text-white px-4 py-2 border border-white transition duration-300 cursor-pointer
                  hover:bg-black hover:text-red-400 hover:shadow-[0_0_10px_2px_rgba(239,68,68,0.7)] hover:animate-pulse"
              >
                Logout
              </button>
            </>
          ) : userData?.isSeller ? (
            <>
              <Link
                to="/additem"
                className="bg-transparent text-white px-4 py-2 border border-white transition duration-300
                hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] hover:animate-pulse"
              >
                Add Item
              </Link>
              <button
                onClick={handleProfile}
                className="bg-transparent text-white px-4 py-2 border border-white transition duration-300 cursor-pointer
                  hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] hover:animate-pulse"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-transparent text-white px-4 py-2 border border-white transition duration-300 cursor-pointer
                  hover:bg-black hover:text-red-400 hover:shadow-[0_0_10px_2px_rgba(239,68,68,0.7)] hover:animate-pulse"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleProfile}
                className="bg-transparent text-white px-4 py-2 border border-white transition duration-300 cursor-pointer
                  hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] hover:animate-pulse"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-transparent text-white px-4 py-2 border border-white transition duration-300 cursor-pointer
                  hover:bg-black hover:text-red-400 hover:shadow-[0_0_10px_2px_rgba(239,68,68,0.7)] hover:animate-pulse"
              >
                Logout
              </button>
            </>
          )
        ) : isAuthPage ? (
          <>
            <Link
              to="/"
              className="bg-transparent text-white px-4 py-2 border border-white transition duration-300
              hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] hover:animate-pulse"
            >
              Home
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-transparent text-white px-4 py-2 border border-white transition duration-300
                hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] hover:animate-pulse"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-transparent text-white px-4 py-2 border border-white transition duration-300
                hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] hover:animate-pulse"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;