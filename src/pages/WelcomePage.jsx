/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import React from "react";

import Button from "../components/ui/Button";
import colors from "../constants/colors";
import logo from "../assets/logo.webp";


const WelcomePage = () => {
  const navigate = useNavigate();

  // return (
  //   <div className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden bg-gradient-to-b from-primary to-secondary">
  //     {/* Subtle Texture */}
  //     <div
  //       className="absolute inset-0 opacity-[0.08]"
  //       style={{
  //         backgroundImage:
  //           "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
  //         backgroundSize: "contain",
  //       }}
  //     />

  //     {/* Content */}
  //     <motion.div
  //       initial={{ opacity: 0, y: 40 }}
  //       animate={{ opacity: 1, y: 0 }}
  //       transition={{ duration: 0.7 }}
  //       className="relative z-10 flex flex-col items-center text-center"
  //     >
  //       {/* Logo */}
  //       <img
  //         src={logo}
  //         alt="ChatSpark Logo"
  //         width={120}
  //         height={120}
  //         className="mb-6"
  //         loading="lazy"
  //       />

  //       {/* Branding */}
  //       <h1 className="text-[42px] font-bold mb-1">
  //         <span className="text-text-secondary">Chat</span>
  //         <span className="text-accent">Spark</span>
  //       </h1>

  //       <p className="text-[28px] font-semibold mb-4 text-text-secondary">
  //         Welcome To <span className="text-accent">ChatSpark</span>
  //       </p>

  //       {/* Divider */}
  //       <div className="w-[400px] h-[2px] mb-8 bg-accent" />

  //       {/* Button using reusable component */}
  //       <Button
  //         variant="custom"
  //         bg="#3B82F6"
  //         text="#FFFFFF"
  //         size="lg"
  //         onClick={() => navigate("/login")}
  //         icon={LogIn}
  //         motionEffect={true}
  //         whileHover={{ scale: 1.05 }}
  //         whileTap={{ scale: 0.95 }}
  //       >
  //         Log In
  //       </Button>
  //     </motion.div>
  //   </div>
  // );

  return (
  <div
    className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    style={{
      background: colors.pageGradient,
    }}
  >
    {/* Background Texture */}
    <div
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage:
          "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
      }}
    />

    {/* Decorative Blur */}
    <div
      className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl"
      style={{
        background: colors.accentLight,
      }}
    />

    <div
      className="absolute -bottom-40 -right-32 w-[420px] h-[420px] rounded-full blur-3xl"
      style={{
        background: colors.secondary,
      }}
    />

    {/* Content */}
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative z-10 flex flex-col items-center text-center"
    >
      {/* Logo */}
      <img
        src={logo}
        alt="ChatSpark Logo"
        width={120}
        height={120}
        className="mb-6"
        loading="lazy"
      />

      {/* Branding */}
      <h1
        className="text-[42px] font-bold mb-2"
        style={{ color: colors.textPrimary }}
      >
        Chat
        <span style={{ color: colors.accent }}>Spark</span>
      </h1>

      <p
        className="text-2xl font-medium mb-6"
        style={{ color: colors.textSecondary }}
      >
        Welcome to{" "}
        <span
          className="font-semibold"
          style={{ color: colors.accentDark }}
        >
          ChatSpark
        </span>
      </p>

      {/* Divider */}
      <div
        className="w-72 h-[2px] rounded-full mb-10"
        style={{
          background: colors.accent,
        }}
      />

      {/* Login Button */}
      <Button
        variant="custom"
        bg={colors.buttonBg}
        text={colors.textPrimary}
        size="lg"
        icon={LogIn}
        onClick={() => navigate("/login")}
        motionEffect
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        Log In
      </Button>
    </motion.div>
  </div>
);
};

export default WelcomePage;
