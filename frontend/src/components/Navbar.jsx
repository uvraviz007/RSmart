import React, { useState, useEffect } from "react";
import logo from "../logo/RSmart.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHeart, FaShoppingCart } from 'react-icons/fa';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
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
          // Fetch cart count if user is a buyer
          if (!data.user.isSeller) {
            fetchCartCount();
          }
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
    
    const fetchCartCount = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/cart", { credentials: 'include' });
            if(res.ok) {
                const data = await res.json();
                setCartCount(data.cart?.items?.length || 0);
            }
        } catch (err) {
            console.error("Error fetching cart count:", err);
        }
    };

    fetchUserData();

    const handleStorageChange = () => {
        fetchUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', fetchCartCount);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, [location.pathname]);

  const handleProfile = () => {
    navigate("/profile");
  };

  // Detect if on login or signup page
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  const isProfilePage = location.pathname === "/profile";

  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-1">
        <Link to="/">
          <img src={logo} alt="" className="h-15 w-20" />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          isProfilePage ? (
              <Link
                to="/"
                className="bg-transparent text-white px-4 py-2 border border-white transition duration-300
                hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] hover:animate-pulse"
              >
                Home
              </Link>
          ) : userData?.isSeller ? (
              <button
                onClick={handleProfile}
                className="bg-transparent text-white px-4 py-2 border border-white transition duration-300 cursor-pointer
                  hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] hover:animate-pulse"
              >
                Profile
              </button>
          ) : (
            <>
              <Link to="/wishlist" className="relative text-white p-2 hover:text-cyan-400">
                <FaHeart size={24} />
              </Link>
              <Link to="/cart" className="relative text-white p-2 hover:text-cyan-400">
                <FaShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={handleProfile}
                className="bg-transparent text-white px-4 py-2 border border-white transition duration-300 cursor-pointer
                  hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] hover:animate-pulse"
              >
                Profile
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
              Login/Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;