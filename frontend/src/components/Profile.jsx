import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
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
        // Initialize form data with current user data
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          email: data.user.email || "",
          mobile: data.user.mobile || "",
          password: "",
          confirmPassword: ""
        });
      } catch (err) {
        console.error("Error fetching user data:", err); // Debug log
        alert("Failed to load profile data");
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 3) {
      newErrors.firstName = "First name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile.toString())) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    // Password validation only if user wants to change password
    if (formData.password || formData.confirmPassword) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
        newErrors.password = "Password must include uppercase, lowercase, digit, and special character";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    if (!currentPassword.trim()) {
      alert("Please enter your current password to save changes");
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: parseInt(formData.mobile),
        oldPassword: currentPassword
      };

      console.log("Sending update data to backend:", updateData); // Debug log

      // Only include password if user wants to change it
      if (formData.password) {
        updateData.password = formData.password;
      }

      const res = await fetch(`http://localhost:5000/api/user/${userData._id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = typeof errorData.error === "string" 
          ? errorData.error 
          : Array.isArray(errorData.error) 
            ? errorData.error.map(e => e.message).join(", ")
            : "Update failed";
        alert(errorMessage);
        return;
      }

      const data = await res.json();
      console.log("Updated user data from server:", data.user); // Debug log
      console.log("userData.lastName value:", data.user.lastName); // Debug log
      console.log("Full name calculation:", data.user.lastName ? `${data.user.firstName} ${data.user.lastName}` : data.user.firstName); // Debug log
      setUserData(data.user);
      setIsEditing(false);
      setShowPasswordModal(false);
      setCurrentPassword("");
      setFormData({
        firstName: data.user.firstName || "",
        lastName: data.user.lastName || "",
        email: data.user.email || "",
        mobile: data.user.mobile || "",
        password: "",
        confirmPassword: ""
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setFormData({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      mobile: userData.mobile || "",
      password: "",
      confirmPassword: ""
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowPasswordModal(false);
    setCurrentPassword("");
    setErrors({});
    setFormData({
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      mobile: userData.mobile || "",
      password: "",
      confirmPassword: ""
    });
  };

  const handleSaveClick = () => {
    setShowPasswordModal(true);
  };

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-cyan-400">
                Profile Details
              </h2>
              {!isEditing ? (
                <button
                  onClick={handleEditClick}
                  className="bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-cyan-300 transition"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveClick}
                    disabled={isLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-400 transition disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={isEditing ? formData.firstName : (userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.firstName || "")}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    errors.firstName ? "border border-red-500" : ""
                  }`}
                  disabled={!isEditing}
                />
                <label className="absolute left-4 -top-4 text-xs bg-black text-gray-400 px-1">
                  {isEditing ? "First Name" : "Full Name"}
                </label>
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>

              {isEditing && (
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Last Name"
                  />
                  <label className="absolute left-4 -top-4 text-xs bg-black text-gray-400 px-1">
                    Last Name
                  </label>
                </div>
              )}

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={isEditing ? formData.email : (userData.email || "")}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    errors.email ? "border border-red-500" : ""
                  }`}
                  disabled={!isEditing}
                />
                <label className="absolute left-4 -top-4 text-xs bg-black text-gray-400 px-1">
                  Email
                </label>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type="tel"
                  name="mobile"
                  value={isEditing ? formData.mobile : (userData.mobile || "")}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                    errors.mobile ? "border border-red-500" : ""
                  }`}
                  disabled={!isEditing}
                />
                <label className="absolute left-4 -top-4 text-xs bg-black text-gray-400 px-1">
                  Mobile Number
                </label>
                {errors.mobile && (
                  <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>
                )}
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

              {isEditing && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <h3 className="text-cyan-400 font-semibold mb-3">Change Password (Optional)</h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                          errors.password ? "border border-red-500" : ""
                        }`}
                        placeholder="New Password"
                      />
                      {errors.password && (
                        <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                          errors.confirmPassword ? "border border-red-500" : ""
                        }`}
                        placeholder="Confirm New Password"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

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

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Confirm Current Password</h3>
            <p className="text-gray-300 mb-4">
              Please enter your current password to save the changes.
            </p>
            
            {/* Password validation errors */}
            {(errors.password || errors.confirmPassword) && (
              <div className="mb-4 p-3 bg-red-900 bg-opacity-30 rounded-lg border border-red-400">
                <h4 className="text-red-400 font-semibold mb-2">Password Requirements:</h4>
                <ul className="text-red-300 text-sm space-y-1">
                  {errors.password && <li>• {errors.password}</li>}
                  {errors.confirmPassword && <li>• {errors.confirmPassword}</li>}
                </ul>
              </div>
            )}
            
            <div className="relative mb-4">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="Current Password"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={isLoading || !currentPassword.trim()}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-400 transition disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Profile;
