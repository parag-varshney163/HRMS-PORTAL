// import { Link, useNavigate } from "react-router-dom";
// import React, { useState } from "react";
// // eslint-disable-next-line no-unused-vars
// import { motion } from "framer-motion";
// import { LogIn } from "lucide-react";
// import axiosInstance from "../api/axiosInstance";
// import ROUTES from "../constants/Routes";
// import colors from "../constants/colors";
// import logo from "../assets/logo.webp";
// const LoginPage = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       // 1. Call API
//       const { data } = await axiosInstance.post("/api/v1/user/login", {
//         email,
//         password,
//       });
//       const token = data?.data?.token;
//       if (!token) throw new Error("Token missing from response");
//       // 2. Save auth details to LocalStorage
//       localStorage.setItem("token", token);
//       // Save User Object (Admin/Employee data)
//       // Note: Your backend sends it as 'admin' or 'user' - saving both covers bases
//       const userData = data.data.admin || data.data.user;
//       localStorage.setItem("admin", JSON.stringify(userData));
//       localStorage.setItem("user", JSON.stringify(userData)); // For Sidebar fallback
//       // Save Role
//       const roleName = userData?.role || "employee";
//       localStorage.setItem("roleName", roleName);
//       // 3. 🚀 SIMPLE REDIRECT (Bypass permission logic for now)
//       navigate(ROUTES.DASHBOARD, { replace: true });
//     } catch (err) {
//       console.error("❌ Login error:", err);
//       // specific error message or fallback
//       const msg = err.response?.data?.message || "Invalid email or password";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div
//       className="min-h-screen flex items-center justify-center text-white relative overflow-hidden"
//       style={{ background: colors.gradientVertical }}
//     >
//       <motion.div
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="bg-[#0f1424]/70 backdrop-blur-md rounded-2xl p-10 w-105 shadow-2xl relative z-10"
//       >
//         {/* Logo */}
//         <div className="flex justify-center mb-5">
//           <img src={logo} alt="ChatSpark" width={90} height={90} />
//         </div>
//         <h1 className="text-3xl font-bold text-center mb-6">
//           Chat<span style={{ color: colors.accent }}>Spark</span>
//         </h1>
//         <form onSubmit={handleLogin}>
//           {/* Email */}
//           <label className="block mb-2 text-sm text-gray-300">Email</label>
//           <input
//             type="email"
//             className="w-full mb-4 px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
//             style={{ backgroundColor: colors.inputBg }}
//             placeholder="Enter email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           {/* Password */}
//           <label className="block mb-2 text-sm text-gray-300">Password</label>
//           <input
//             type="password"
//             className="w-full mb-2 px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
//             style={{ backgroundColor: colors.inputBg }}
//             placeholder="Enter password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           {/* Forgot Password */}
//           <div className="mb-4 text-left">
//             <Link
//               to={ROUTES.RESET_PASSWORD}
//               style={{ color: colors.accent }}
//               className="text-sm hover:underline"
//             >
//               Forgot Password?
//             </Link>
//           </div>
//           {/* Error */}
//           {error && (
//             <p className="text-red-400 text-center mb-3 text-sm">{error}</p>
//           )}
//           {/* Button */}
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             type="submit"
//             disabled={loading}
//             className="w-full flex justify-center items-center gap-2 font-semibold px-8 py-3 rounded-full shadow-lg"
//             style={{
//               backgroundColor: colors.buttonBg,
//               color: colors.textPrimary,
//               opacity: loading ? 0.7 : 1,
//               cursor: loading ? "not-allowed" : "pointer",
//             }}
//           >
//             {loading ? (
//               "Logging in..."
//             ) : (
//               <>
//                 <LogIn size={18} /> Log In
//               </>
//             )}
//           </motion.button>
//         </form>
//       </motion.div>
//     </div>
//   );
// };
// export default LoginPage;
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

import axiosInstance from "../api/axiosInstance";
// 1. IMPORT THE HOOK
import { useAuth } from "../hooks/useAuth";
import ROUTES from "../constants/Routes";
import colors from "../constants/colors";
import logo from "../assets/logo.webp";


const LoginPage = () => {
  const navigate = useNavigate();
  // 2. GET THE LOGIN FUNCTION FROM CONTEXT
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Call API
      const { data } = await axiosInstance.post("/api/v1/user/login", {
        email,
        password,
      });

      console.log("Login Response:", data); // Debugging

      const token = data?.data?.accessToken || data?.data?.token;
      if (!token) throw new Error("Token missing from response");

      // 2. Extract User Data Correctly
      // The backend puts admin details inside 'admin' or 'user' key.
      const userData = data.data.admin || data.data.user;

      if (!userData) throw new Error("User data missing from response");

      // 3. 🚀 CALL CONTEXT LOGIN (This updates the Sidebar instantly!)
      // This handles all localStorage saving for you.
      login(userData, token);

      // 4. Redirect
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      console.error("❌ Login error:", err);
      const msg = err.response?.data?.message || "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // return (
  //   <div
  //     className="min-h-screen flex items-center justify-center text-white relative overflow-hidden"
  //     style={{ background: colors.gradientVertical }}
  //   >
  //     <motion.div
  //       initial={{ opacity: 0, y: 40 }}
  //       animate={{ opacity: 1, y: 0 }}
  //       transition={{ duration: 0.6 }}
  //       className="bg-[#0f1424]/70 backdrop-blur-md rounded-2xl p-10 w-105 shadow-2xl relative z-10"
  //     >
  //       <div className="flex justify-center mb-5">
  //         <img src={logo} alt="ChatSpark" width={90} height={90} />
  //       </div>

  //       <h1 className="text-3xl font-bold text-center mb-6">
  //         Chat<span style={{ color: colors.accent }}>Spark</span>
  //       </h1>

  //       <form onSubmit={handleLogin}>
  //         {/* Email */}
  //         <label className="block mb-2 text-sm text-gray-300">Email</label>
  //         <input
  //           type="email"
  //           className="w-full mb-4 px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
  //           style={{ backgroundColor: colors.inputBg }}
  //           placeholder="Enter email"
  //           value={email}
  //           onChange={(e) => setEmail(e.target.value)}
  //           required
  //         />

  //         {/* Password */}
  //         <label className="block mb-2 text-sm text-gray-300">Password</label>
  //         <input
  //           type="password"
  //           className="w-full mb-2 px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
  //           style={{ backgroundColor: colors.inputBg }}
  //           placeholder="Enter password"
  //           value={password}
  //           onChange={(e) => setPassword(e.target.value)}
  //           required
  //         />

  //         <div className="mb-4 text-left">
  //           <Link
  //             to={ROUTES.RESET_PASSWORD}
  //             style={{ color: colors.accent }}
  //             className="text-sm hover:underline"
  //           >
  //             Forgot Password?
  //           </Link>
  //         </div>

  //         {error && (
  //           <p className="text-red-400 text-center mb-3 text-sm">{error}</p>
  //         )}

  //         <motion.button
  //           whileHover={{ scale: 1.05 }}
  //           whileTap={{ scale: 0.95 }}
  //           type="submit"
  //           disabled={loading}
  //           className="w-full flex justify-center items-center gap-2 font-semibold px-8 py-3 rounded-full shadow-lg"
  //           style={{
  //             backgroundColor: colors.buttonBg,
  //             color: colors.textPrimary,
  //             opacity: loading ? 0.7 : 1,
  //             cursor: loading ? "not-allowed" : "pointer",
  //           }}
  //         >
  //           {loading ? (
  //             "Logging in..."
  //           ) : (
  //             <>
  //               <LogIn size={18} /> Log In
  //             </>
  //           )}
  //         </motion.button>
  //       </form>
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
    {/* Background Blobs */}
    <div
      className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl"
      style={{ background: colors.accentLight }}
    />

    <div
      className="absolute -bottom-40 -right-32 w-[420px] h-[420px] rounded-full blur-3xl"
      style={{ background: colors.secondary }}
    />

    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 w-full max-w-md rounded-3xl shadow-xl p-8"
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      {/* Logo */}
      <div className="flex justify-center mb-5">
        <img
          src={logo}
          alt="ChatSpark"
          width={90}
          height={90}
        />
      </div>

      {/* Heading */}
      <h1
        className="text-3xl font-bold text-center"
        style={{ color: colors.textPrimary }}
      >
        Chat
        <span style={{ color: colors.accent }}>
          Spark
        </span>
      </h1>

      <p
        className="text-center mt-2 mb-8"
        style={{ color: colors.textSecondary }}
      >
        Sign in to continue
      </p>

      <form onSubmit={handleLogin}>
        {/* Email */}
        <label
          className="block mb-2 text-sm font-medium"
          style={{ color: colors.textPrimary }}
        >
          Email
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-5 px-4 py-3 rounded-xl border outline-none transition-colors"
          style={{
            background: colors.inputBg,
            border: `1px solid ${colors.cardBorder}`,
            color: colors.textPrimary,
          }}
        />

        {/* Password */}
        <label
          className="block mb-2 text-sm font-medium"
          style={{ color: colors.textPrimary }}
        >
          Password
        </label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-3 px-4 py-3 rounded-xl border outline-none transition-colors"
          style={{
            background: colors.inputBg,
            border: `1px solid ${colors.cardBorder}`,
            color: colors.textPrimary,
          }}
        />

        {/* Forgot Password */}
        <div className="mb-5 text-right">
          <Link
            to={ROUTES.RESET_PASSWORD}
            className="text-sm hover:underline"
            style={{ color: colors.accentDark }}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-xl text-sm"
            style={{
              background: colors.dangerLight,
              color: colors.danger,
              border: `1px solid ${colors.danger}`,
            }}
          >
            {error}
          </div>
        )}

        {/* Login Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-3 rounded-xl font-semibold transition-all"
          style={{
            background: colors.buttonBg,
            color: colors.textPrimary,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            "Logging in..."
          ) : (
            <>
              <LogIn size={18} />
              Log In
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  </div>
);
};

export default LoginPage;
