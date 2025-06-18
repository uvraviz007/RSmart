import React from "react";
import Navbar from "./Navbar"; // Adjust path as needed

function AboutUs() {
  return (
    <>
      <Navbar />
      <div className="pt-20 flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-black via-blue-950 to-cyan-700">
        <div className="bg-black bg-opacity-60 p-8 rounded-lg shadow-lg w-full max-w-xl text-white">
          <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">About Us</h2>
          <p className="mb-2">
            Welcome to <span className="text-cyan-400 font-semibold">RSmart</span>! We are dedicated to providing smart solutions for modern web development.
          </p>
          <p className="mb-2">
            Our mission is to create beautiful, responsive, and user-friendly web applications using the latest technologies.
          </p>
          <p>
            Thank you for visiting our platform. If you have any questions or feedback, feel free to reach out!
          </p>
        </div>
      </div>
    </>
  );
}

export default AboutUs;
