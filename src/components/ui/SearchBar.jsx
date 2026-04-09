// import React from "react";
// import { Search } from "lucide-react";

// import Button from "./Button";

// export default function SearchBar({
//   placeholder = "Search...",
//   value,
//   onChange,
//   onSearch,
//   width = "100%",
// }) {
//   const handleSearch = () => {
//     onSearch?.(value);
//   };

//   return (
//     <div
//       className="flex items-center gap-3.5 flex-wrap"
//       style={{ width }}
//     >
//       {/* Search Input */}
//       <input
//         type="text"
//         placeholder={placeholder}
//         value={value}
//         onChange={(e) => {
//           onChange?.(e.target.value);
//         }}
//         onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//         className="flex-1 max-w-[400px] bg-input text-text-primary py-3 px-4 rounded-[10px] border border-card-border text-sm outline-none placeholder:text-text-secondary/50 focus:border-btn transition-colors"
//       />

//       {/* Search Button */}
//       <Button
//         variant="custom"
//         bg="#3B82F6"
//         text="#fff"
//         size="sm"
//         icon={Search}
//         className="rounded-xl py-3 px-5.5"
//         onClick={handleSearch}
//       >
//         Search
//       </Button>
//     </div>
//   );
// }

import React from "react";
import { Search } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  width = "100%",
}) {
  return (
    // 🚨 FIX 1: "flex flex-row items-center" forces everything onto one line!
    <div className="flex flex-row items-center gap-3 w-full" style={{ width }}>
      {/* Search Input Container */}
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-text-secondary" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-input text-text-primary pl-10 pr-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors"
          placeholder={placeholder}
        />
      </div>

      {/* Search Button */}
      {/* 🚨 FIX 2: "shrink-0" prevents the button from getting squished or wrapping to a new line */}
      <button
        type="button"
        className="bg-[#3B82F6] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors shrink-0 flex items-center gap-2 cursor-pointer border-none"
      >
        <Search size={16} /> Search
      </button>
    </div>
  );
}
