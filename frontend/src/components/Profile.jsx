import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Profile() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/me", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        console.log("User data from server:", data); // Debug log
        setUserData(data.user);
      } catch (err) {
        console.error("Error fetching user data:", err); // Debug log
        alert("Failed to load profile data");
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  if (!userData) {
    return (
      <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen">
        <div className="text-white container mx-auto">
          <Navbar />
          <div className="flex justify-center items-center min-h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  // Debug log for user data
  console.log("Current user data state:", userData);
  console.log("isSeller value:", userData.isSeller);

  return (
    <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen">
      <div className="text-white container mx-auto">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-8">
          <div className="bg-black bg-opacity-60 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">
              Profile Details
            </h2>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={userData.firstName || ""}
                  className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  disabled
                />
                <label className="absolute left-4 -top-4 text-xs bg-black text-gray-400 px-1">
                  First Name
                </label>
              </div>

              {userData.secondName && (
                <div className="relative">
                  <input
                    type="text"
                    value={userData.secondName}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    disabled
                  />
                  <label className="absolute left-4 -top-4 text-xs bg-black text-gray-400 px-1">
                    Second Name
                  </label>
                </div>
              )}

              <div className="relative">
                <input
                  type="email"
                  value={userData.email || ""}
                  className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  disabled
                />
                <label className="absolute left-4 -top-4 text-xs bg-black text-gray-400 px-1">
                  Email
                </label>
              </div>

              <div className="relative">
                <input
                  type="tel"
                  value={userData.mobile || ""}
                  className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  disabled
                />
                <label className="absolute left-4 -top-4 text-xs bg-black text-gray-400 px-1">
                  Mobile Number
                </label>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={userData.isSeller ? "Seller Account" : "Buyer Account"}
                  className={`w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    userData.isSeller ? "text-cyan-400" : "text-white"
                  }`}
                  disabled
                />
                <label className="absolute left-4 -top-4 text-xs bg-black text-gray-400 px-1">
                  Account Type
                </label>
              </div>

              {userData.isSeller && (
                <div className="mt-4 p-3 bg-cyan-900 bg-opacity-30 rounded-lg border border-cyan-400">
                  <p className="text-cyan-400 text-center mb-4">
                    You have seller privileges. You can add and manage items for sale.
                  </p>
                  <button
                    onClick={() => navigate("/my-listed-items")}
                    className="w-full bg-cyan-400 text-black py-2 rounded-lg font-semibold hover:bg-cyan-300 transition"
                  >
                    View My Listed Items
                  </button>
                </div>
              )}

              {!userData.isSeller && (
                <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-400">
                  <p className="text-blue-400 text-center mb-4">
                    You have buyer privileges. You can view your purchase history.
                  </p>
                  <button
                    onClick={() => navigate("/purchase-history")}
                    className="w-full bg-blue-400 text-black py-2 rounded-lg font-semibold hover:bg-blue-300 transition"
                  >
                    View Purchase History
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;
