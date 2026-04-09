/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import React from "react";

import Button from "../components/ui/Button";
import logo from "../assets/logo.webp";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden bg-gradient-to-b from-primary to-secondary">
      {/* Subtle Texture */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
          backgroundSize: "contain",
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
        <h1 className="text-[42px] font-bold mb-1">
          <span className="text-text-secondary">Chat</span>
          <span className="text-accent">Spark</span>
        </h1>

        <p className="text-[28px] font-semibold mb-4 text-text-secondary">
          Welcome To <span className="text-accent">ChatSpark</span>
        </p>

        {/* Divider */}
        <div className="w-[400px] h-[2px] mb-8 bg-accent" />

        {/* Button using reusable component */}
        <Button
          variant="custom"
          bg="#3B82F6"
          text="#FFFFFF"
          size="lg"
          onClick={() => navigate("/login")}
          icon={LogIn}
          motionEffect={true}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Log In
        </Button>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
