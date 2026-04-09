// import { useLocation } from "react-router-dom";
// import React from "react";

// const Navbar = ({ callName }) => {
//   const location = useLocation();

//   // Return a heading based on current route
//   const getHeading = () => {
//     switch (location.pathname) {
//       case "/dashboard":
//         return (
//           <>Welcome <span className="text-accent font-bold">User</span></>
//         );
//       case "/employees":
//         return (
//           <>Employee <span className="text-accent">Management</span></>
//         );
//       case "/tasks":
//         return (
//           <>Task <span className="text-accent">Board</span></>
//         );
//       case "/leaves":
//         return (
//           <>Leave <span className="text-accent">Management</span></>
//         );
//       case "/finance":
//         return (
//           <>Finance <span className="text-accent">Overview</span></>
//         );
//       case "/reimbursements":
//         return (
//           <>Reimbursement <span className="text-accent">Claims</span></>
//         );
//       case "/payroll":
//         return (
//           <>Payroll <span className="text-accent">Processing</span></>
//         );
//       case "/attendence":
//         return (
//           <>Attendence <span className="text-accent">Tracker</span></>
//         );
//       case "/documents":
//         return (
//           <>Document <span className="text-accent">Center</span></>
//         );
//       case "/org-chart":
//         return (
//           <>Organisation <span className="text-accent">Chart</span></>
//         );
//       case "/settings":
//         return (
//           <>System <span className="text-accent">Settings</span></>
//         );
//       default:
//         if (callName) {
//           return (
//             <>
//               Call Review:{" "}
//               <span className="text-accent font-bold">
//                 {callName.creator}
//               </span>
//             </>
//           );
//         }
//         return (
//           <>Welcome <span className="text-accent">User</span></>
//         );
//     }
//   };

//   return (
//     <nav className="flex flex-row justify-between items-center px-6 rounded-3xl mb-2 h-[60px] bg-gradient-to-b from-primary to-secondary shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
//       {/* Left spacer */}
//       <div className="w-16" />

//       {/* Dynamic title */}
//       <h1 className="text-2xl font-semibold text-center">
//         {getHeading()}
//       </h1>

//       {/* Right spacer */}
//       <div className="w-16" />
//     </nav>
//   );
// };

// export default Navbar;

import { useLocation } from "react-router-dom";
import React from "react";
import { Menu } from "lucide-react"; // Added import

const Navbar = ({ callName, toggleSidebar }) => {
  // Added toggleSidebar prop
  const location = useLocation();

  // Return a heading based on current route
  const getHeading = () => {
    switch (location.pathname) {
      case "/dashboard":
        return (
          <>
            Welcome <span className="text-accent font-bold">User</span>
          </>
        );
      case "/employees":
        return (
          <>
            Employee <span className="text-accent">Management</span>
          </>
        );
      case "/tasks":
        return (
          <>
            Task <span className="text-accent">Board</span>
          </>
        );
      case "/leaves":
        return (
          <>
            Leave <span className="text-accent">Management</span>
          </>
        );
      case "/finance":
        return (
          <>
            Finance <span className="text-accent">Overview</span>
          </>
        );
      case "/reimbursements":
        return (
          <>
            Reimbursement <span className="text-accent">Claims</span>
          </>
        );
      case "/payroll":
        return (
          <>
            Payroll <span className="text-accent">Processing</span>
          </>
        );
      case "/offer-letters":
        return (
          <>
            Offer <span className="text-accent">Letters</span>
          </>
        );
      case "/attendence":
        return (
          <>
            Attendence <span className="text-accent">Tracker</span>
          </>
        );
      case "/documents":
        return (
          <>
            Document <span className="text-accent">Center</span>
          </>
        );
      case "/org-chart":
        return (
          <>
            Organisation <span className="text-accent">Chart</span>
          </>
        );
      case "/settings":
        return (
          <>
            System <span className="text-accent">Settings</span>
          </>
        );
      case "/resignations":
        return (
          <>
            <span className="text-accent">Resignations</span>
          </>
        );
      default:
        if (callName) {
          return (
            <>
              Call Review:{" "}
              <span className="text-accent font-bold">{callName.creator}</span>
            </>
          );
        }
        return (
          <>
            Welcome <span className="text-accent">User</span>
          </>
        );
    }
  };

  return (
    <nav className="flex flex-row justify-between items-center px-4 md:px-6 rounded-3xl mb-2 h-[60px] bg-gradient-to-b from-primary to-secondary shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
      {/* Left spacer / Mobile Menu Button */}
      <div className="w-16 flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-1 -ml-1"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Dynamic title */}
      <h1 className="text-xl md:text-2xl font-semibold text-center whitespace-nowrap">
        {getHeading()}
      </h1>

      {/* Right spacer */}
      <div className="w-16" />
    </nav>
  );
};

export default Navbar;
