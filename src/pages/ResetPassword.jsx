import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

import axiosInstance from "../api/axiosInstance";
import colors from "../constants/colors";
import logo from "../assets/logo.webp";


const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    if (!email) {
      alert("Please enter email.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.put(
        "https://operation.chatspark.in/api/v1/admin/request-password",
        {
          email,
          dashboard: "admin",
        },
      );

      if (res.data?.success) {
        alert("✅ Reset link sent to your email!");
        navigate("/login");
      } else {
        alert(res.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  // return (
  //   <div
  //     className="min-h-screen flex items-center justify-center relative overflow-hidden"
  //     style={{
  //       background: `linear-gradient(to bottom, ${colors.primary}, ${colors.secondary})`,
  //     }}
  //   >
  //     <div
  //       className="absolute inset-0 opacity-[0.05]"
  //       style={{
  //         backgroundImage:
  //           "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
  //         backgroundSize: "contain",
  //       }}
  //     ></div>

  //     <motion.div
  //       initial={{ opacity: 0, y: 40 }}
  //       animate={{ opacity: 1, y: 0 }}
  //       transition={{ duration: 0.7 }}
  //       className="relative z-10 bg-[#0f1424]/60 backdrop-blur-md rounded-2xl p-8 w-[90%] max-w-md text-white shadow-2xl"
  //     >
  //       <div className="flex justify-center mb-4">
  //         <img
  //           src={logo}
  //           alt="ChatSpark logo"
  //           className="w-20 h-20"
  //           loading="lazy"
  //         />
  //       </div>

  //       <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">
  //         Chat<span style={{ color: colors.accent }}>Spark</span>
  //       </h1>

  //       <p
  //         className="text-center text-lg md:text-3xl font-semibold mb-6"
  //         style={{ color: colors.textSecondary }}
  //       >
  //         Reset <span style={{ color: colors.accent }}>Password</span>
  //       </p>

  //       <div
  //         className="w-2/3 h-[2px] mx-auto mb-6"
  //         style={{ backgroundColor: colors.accent }}
  //       ></div>

  //       {/* Email Field */}
  //       <div className="mb-6">
  //         <label className="block mb-2 text-sm font-medium text-gray-300">
  //           Enter Email
  //         </label>
  //         <input
  //           type="email"
  //           value={email}
  //           onChange={(e) => setEmail(e.target.value)}
  //           className="w-full px-4 py-2 rounded-md bg-input text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
  //           placeholder="Enter your email"
  //         />
  //       </div>

  //       {/* Send Link Button */}
  //       <motion.button
  //         whileHover={{ scale: 1.05 }}
  //         whileTap={{ scale: 0.95 }}
  //         disabled={loading}
  //         className="w-full flex justify-center items-center gap-2 font-semibold px-6 py-2 rounded-full shadow-lg transition duration-300"
  //         style={{
  //           backgroundColor: loading ? colors.textSecondary : colors.buttonBg,
  //           color: colors.textPrimary,
  //           cursor: loading ? "not-allowed" : "pointer",
  //         }}
  //         onMouseEnter={(e) =>
  //           (e.currentTarget.style.backgroundColor = colors.buttonHover)
  //         }
  //         onMouseLeave={(e) =>
  //           (e.currentTarget.style.backgroundColor = colors.buttonBg)
  //         }
  //         onClick={handleSendLink}
  //       >
  //         {loading ? "Sending..." : "Send Reset Link"}
  //       </motion.button>
  //     </motion.div>
  //   </div>
  // );

  return (
  <div
    className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
    style={{
      background: colors.pageGradient,
    }}
  >
    {/* Background Pattern */}
    <div
      className="absolute inset-0 opacity-5"
      style={{
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
      }}
    />

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative z-10 w-full max-w-md rounded-3xl p-8 shadow-2xl"
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      {/* Logo */}
      <div className="flex justify-center mb-5">
        <img
          src={logo}
          alt="ChatSpark Logo"
          className="w-20 h-20 object-contain"
          loading="lazy"
        />
      </div>

      {/* Heading */}
      <h1
        className="text-3xl font-bold text-center"
        style={{ color: colors.textPrimary }}
      >
        Chat<span style={{ color: colors.accent }}>Spark</span>
      </h1>

      <p
        className="text-center text-lg font-semibold mt-2 mb-6"
        style={{ color: colors.textSecondary }}
      >
        Reset <span style={{ color: colors.accent }}>Password</span>
      </p>

      <div
        className="w-24 h-1 rounded-full mx-auto mb-8"
        style={{ background: colors.accent }}
      />

      {/* Email */}
      <div className="mb-6">
        <label
          className="block mb-2 text-sm font-semibold"
          style={{ color: colors.textPrimary }}
        >
          Email Address
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-xl transition-all duration-200 outline-none"
          style={{
            background: colors.inputBg,
            color: colors.textPrimary,
            border: `1px solid ${colors.cardBorder}`,
          }}
          onFocus={(e) =>
            (e.target.style.border = `1px solid ${colors.accent}`)
          }
          onBlur={(e) =>
            (e.target.style.border = `1px solid ${colors.cardBorder}`)
          }
        />
      </div>

      {/* Button */}
      <motion.button
        whileHover={!loading ? { scale: 1.02 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        disabled={loading}
        onClick={handleSendLink}
        className="w-full py-3 rounded-xl font-semibold transition-all duration-300"
        style={{
          background: loading ? colors.textMuted : colors.buttonBg,
          color: colors.textPrimary,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading
            ? "none"
            : "0 10px 25px rgba(247, 200, 66, 0.35)",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.background = colors.buttonHover;
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.background = colors.buttonBg;
          }
        }}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </motion.button>
    </motion.div>
  </div>
);
};

export default ResetPassword;
