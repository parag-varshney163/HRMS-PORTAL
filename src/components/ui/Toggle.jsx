import React from "react";
import colors from "../../constants/colors";

export default function Toggle({
  checked,
  onChange,
  active,
  onToggle,
  enabled,
}) {
  // 1. Resolve the current
  const isChecked = checked ?? active ?? enabled ?? false;

  // 2. Unified handler
  const handlePress = () => {
    const newValue = !isChecked;
    if (onChange) onChange(newValue);
    else if (onToggle) onToggle(newValue);
  };

  return (
    <button
      type="button"
      onClick={handlePress}
      className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full 
                 transition-colors duration-300 focus:outline-none cursor-pointer border-2"
      style={{
        backgroundColor: isChecked ? colors.accent : colors.cardBorder,
        borderColor: isChecked ? colors.accent : colors.cardBorder,
      }}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full shadow-md transition-transform duration-300 ease-in-out bg-white ${
          isChecked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
