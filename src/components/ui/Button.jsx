import { motion } from "framer-motion";
// src/components/ui/Button.jsx
import React from "react";

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

// Variant styles using Tailwind classes
const variantClasses = {
  primary: "bg-accent text-black",
  secondary: "bg-card text-text-secondary border border-card-border",
  accent: "bg-accent text-black",

  danger: "bg-danger text-white",
  ghost: "bg-transparent border border-white/20 text-white",
};

export default function Button({
  children,
  onClick,
  size = "md",
  variant = "primary",
  icon: Icon,
  className = "",
  fullWidth = false,
  motionEffect = true,
  bg, // for custom
  text, // for custom
  style = {},
  ...props
}) {
  const Component = motionEffect ? motion.button : "button";

  // Custom variant uses inline styles for dynamic bg/text
  const isCustom = variant === "custom";
  const computedStyles = isCustom ? { backgroundColor: bg, color: text } : {};

  return (
    <Component
      whileHover={motionEffect ? { scale: 1.05 } : {}}
      whileTap={motionEffect ? { scale: 0.95 } : {}}
      onClick={onClick}
      style={{
        ...computedStyles,
        ...style,
      }}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-full transition-all duration-200 cursor-pointer
        ${sizes[size]}
        ${!isCustom ? variantClasses[variant] || "" : ""}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </Component>
  );
}
