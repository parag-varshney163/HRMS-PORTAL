import { useNavigate, useParams } from "react-router-dom";
// /* eslint-disable no-unused-vars */
// import { useNavigate, useLocation, useParams } from "react-router-dom";
// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import axiosInstance from "../api/axiosInstance";
// import colors from "../constants/colors";
// import logo from "../assets/logo.webp";
// import useNotification from "../hooks/useNotification.jsx";
// const UpdatePassword = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { token } = useParams();
//   const notify = useNotification();
//   const handleUpdatePassword = async () => {
//     if (!password || !confirmPassword) {
//       notify.warning("Missing Fields", "Please fill both password fields.");
//       return;
//     }
//     if (password !== confirmPassword) {
//       notify.warning("Mismatch", "Passwords do not match.");
//       return;
//     }
//     try {
//       setLoading(true);
//       const res = await axiosInstance.put("https://operation.chatspark.in/api/v1/user/update-password", {
//         token,
//         newPassword: password,
//       });
//       if (res.data?.success) {
//         notify.success("Password Updated", "Your password has been changed successfully.");
//         navigate("/login");
//       } else {
//         notify.error("Update Failed", res.data?.message || "Something went wrong.");
//       }
//     } catch (err) {
//       notify.error("Update Failed", err.response?.data?.message || "Failed to update password.");
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div
//       className="min-h-screen flex items-center justify-center relative overflow-hidden"
//       style={{
//         background: `linear-gradient(to bottom, ${colors.primary}, ${colors.secondary})`,
//       }}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7 }}
//         className="relative z-10 bg-[#0f1424]/60 backdrop-blur-md rounded-2xl p-8 w-[90%] max-w-md text-white shadow-2xl"
//       >
//         <div className="flex justify-center mb-4">
//           <img src={logo} alt="ChatSpark logo" className="w-20 h-20" />
//         </div>
//         <h1 className="text-3xl font-bold text-center mb-2">
//           Reset <span style={{ color: colors.accent }}>Password</span>
//         </h1>
//         <p className="text-center text-gray-400 mb-6">
//           Enter your new password below
//         </p>
//         {/* New Password */}
//         <div className="mb-4">
//           <label className="block mb-2 text-sm text-gray-300">
//             New Password
//           </label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full px-4 py-2 rounded-md bg-input text-white focus:outline-none"
//             placeholder="Enter new password"
//           />
//         </div>
//         {/* Confirm Password */}
//         <div className="mb-6">
//           <label className="block mb-2 text-sm text-gray-300">
//             Confirm Password
//           </label>
//           <input
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             className="w-full px-4 py-2 rounded-md bg-input text-white focus:outline-none"
//             placeholder="Confirm your password"
//           />
//         </div>
//         {/* Update Button */}
//         <motion.button
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           disabled={loading}
//           onClick={handleUpdatePassword}
//           className="w-full py-2 font-semibold rounded-full shadow-lg"
//           style={{
//             backgroundColor: loading ? colors.textSecondary : colors.buttonBg,
//             color: colors.textPrimary,
//             cursor: loading ? "not-allowed" : "pointer",
//           }}
//         >
//           {loading ? "Updating..." : "Update Password"}
//         </motion.button>
//       </motion.div>
//     </div>
//   );
// };
// export default UpdatePassword;
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";

import useNotification from "../hooks/useNotification";
import axiosInstance from "../api/axiosInstance";
import colors from "../constants/colors";
import logo from "../assets/logo.webp";


const UpdatePassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const notify = useNotification();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      notify.warning(
        "Missing Fields",
        "Please fill both password fields."
      );
      return;
    }

    if (password !== confirmPassword) {
      notify.warning("Mismatch", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosInstance.post("api/v1/user/update-password", {
        token,
        newPassword: password,
      });

      if (res.data?.success) {
        notify.success(
          "Password Updated",
          "Your password has been changed successfully."
        );
        navigate("/login");
      } else {
        notify.error(
          "Update Failed",
          res.data?.message || "Something went wrong."
        );
      }
    } catch (err) {
      notify.error(
        "Update Failed",
        err.response?.data?.message || "Failed to update password."
      );
    } finally {
      setLoading(false);
    }
  };

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
          Update <span style={{ color: colors.accent }}>Password</span>
        </p>

        <div
          className="w-24 h-1 rounded-full mx-auto mb-8"
          style={{ background: colors.accent }}
        />

        {/* New Password */}
        <div className="mb-5">
          <label
            className="block mb-2 text-sm font-semibold"
            style={{ color: colors.textPrimary }}
          >
            New Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
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

        {/* Confirm Password */}
        <div className="mb-6">
          <label
            className="block mb-2 text-sm font-semibold"
            style={{ color: colors.textPrimary }}
          >
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
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
          onClick={handleUpdatePassword}
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
          {loading ? "Updating..." : "Update Password"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default UpdatePassword;