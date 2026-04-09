import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function FilterDropDown({
  options = [],
  defaultLabel = "Select",
  onSelect,
  defaultOpen = false,
  width = "100%",
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [selected, setSelected] = useState(defaultLabel);
  const ref = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, []);

  return (
    <div ref={ref} className="relative" style={{ width }}>
      {/* Button */}
      <button
        type="button" // 🚨 Crucial: prevents the modal from submitting
        onClick={() => setOpen((prev) => !prev)}
        className="w-full py-2.5 px-3.5 bg-input text-text-primary rounded-[10px] border border-card-border flex items-center justify-between text-sm cursor-pointer focus:border-btn transition-colors"
      >
        <span className="truncate pr-2">{selected}</span>
        <ChevronDown size={18} className="text-text-secondary shrink-0" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          className="absolute top-12 left-0 w-full bg-card rounded-[10px] border border-card-border py-1.5 shadow-xl z-50 overflow-y-auto custom-scrollbar"
          style={{ maxHeight: "200px" }} // 🚨 THE FIX: Forces internal scrolling
        >
          {options.length > 0 ? (
            options.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                  if (onSelect) onSelect(opt);
                }}
                className="py-2.5 px-3.5 text-sm cursor-pointer text-text-secondary hover:bg-hover hover:text-text-primary transition-colors truncate"
                title={opt} // Shows full name on hover if it's too long
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="py-2.5 px-3.5 text-sm text-text-secondary opacity-50 italic">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}
