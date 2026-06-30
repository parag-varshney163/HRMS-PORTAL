// import React, { useState, Suspense, lazy } from "react";
// import { Plus, Loader2 } from "lucide-react";
// import axiosInstance from "../api/axiosInstance";
// import Button from "../components/ui/Button";
// import MyLeaves from "../components/Leaves/MyLeaves";
// import ApplyLeaveModal from "../components/Leaves/ApplyLeaveModal";
// import UpdateBalanceModal from "../components/Leaves/UpdateBalanceModal";
// import useNotification from "../hooks/useNotification.jsx";
// // ─── LAZY LOAD ADMIN COMPONENTS ───
// const OrgLeaves = lazy(() => import("../components/Leaves/OrgLeaves"));
// export default function Leaves() {
//   const userRole =
//     localStorage.getItem("roleName")?.toLowerCase() || "employee";
//   const isAdminOrManager = ["admin", "hr", "manager"].includes(userRole);
//   const [isApplyModalOpen, setApplyModalOpen] = useState(false);
//   const [isBalanceModalOpen, setBalanceModalOpen] = useState(false);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const notify = useNotification();
//   // ─── UPLOAD ORCHESTRATORS ───
//   const handleApplyLeave = async (formData) => {
//     try {
//       const { data } = await axiosInstance.post("/api/v1/leave", formData);
//       if (data.success) {
//         setRefreshTrigger((prev) => prev + 1);
//         return { success: true };
//       }
//     } catch (error) {
//       return {
//         success: false,
//         message: error.response?.data?.message || "Failed to apply.",
//       };
//     }
//   };
//   const handleUpdateBalance = async (userId, payload) => {
//     try {
//       const { data } = await axiosInstance.patch(
//         `/api/v1/salary-leave/update-leaves/${userId}`,
//         payload,
//       );
//       if (data.success) {
//         notify.success("Balances Updated", "Leave balances have been updated successfully.");
//         setBalanceModalOpen(false);
//         setRefreshTrigger((prev) => prev + 1);
//       }
//     } catch (error) {
//       notify.error("Update Failed", error.response?.data?.message || "Failed to update balances.");
//     }
//   };
//   return (
//     <div className="py-2 flex flex-col gap-8 w-full pb-10">
//       {/* ─── PAGE HEADER ─── */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-card-border pb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-text-primary">
//             Leave <span className="text-accent">Management</span>
//           </h2>
//           <p className="text-sm text-text-secondary mt-1">
//             Track your balances and apply for time off.
//           </p>
//         </div>
//         <Button
//           variant="custom"
//           bg="#3B82F6"
//           text="#FFF"
//           icon={Plus}
//           size="sm"
//           onClick={() => setApplyModalOpen(true)}
//         >
//           Apply Leave
//         </Button>
//       </div>
//       {/* ─── SECTION 1: MY LEAVES (Everyone) ─── */}
//       <MyLeaves refreshTrigger={refreshTrigger} />
//       {/* ─── SECTION 2: ORG LEAVES (Admin/HR/Manager Only) ─── */}
//       {isAdminOrManager && (
//         <Suspense
//           fallback={
//             <div className="flex flex-col items-center justify-center pt-20 text-text-secondary gap-3">
//               <Loader2 className="animate-spin text-accent" size={32} />
//               <p className="text-sm font-medium">
//                 Loading organization requests...
//               </p>
//             </div>
//           }
//         >
//           <OrgLeaves
//             refreshTrigger={refreshTrigger}
//             onOpenBalanceModal={() => setBalanceModalOpen(true)}
//           />
//         </Suspense>
//       )}
//       {/* ─── MODALS ─── */}
//       <ApplyLeaveModal
//         open={isApplyModalOpen}
//         onClose={() => setApplyModalOpen(false)}
//         onSubmit={handleApplyLeave}
//       />
//       {isAdminOrManager && (
//         <UpdateBalanceModal
//           open={isBalanceModalOpen}
//           onClose={() => setBalanceModalOpen(false)}
//           onSubmit={handleUpdateBalance}
//         />
//       )}
//     </div>
//   );
// }
import React, { useState, Suspense, lazy } from "react";
import { Plus, Loader2 } from "lucide-react";

import UpdateBalanceModal from "../components/Leaves/UpdateBalanceModal";
import ApplyLeaveModal from "../components/Leaves/ApplyLeaveModal";
import useNotification from "../hooks/useNotification.jsx";
import MyLeaves from "../components/Leaves/MyLeaves";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/ui/Button";
import colors from "../constants/colors";


// ─── LAZY LOAD ADMIN COMPONENTS ───
const OrgLeaves = lazy(() => import("../components/Leaves/OrgLeaves"));

export default function Leaves() {
  const userRole =
    localStorage.getItem("roleName")?.toLowerCase() || "employee";
  const isAdminOrManager = ["admin", "hr", "manager"].includes(userRole);

  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [isBalanceModalOpen, setBalanceModalOpen] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const notify = useNotification();

  // ─── APPLY LEAVE ─────────────────────────────────────────────
  const handleApplyLeave = async (formData) => {
    try {
      const { data } = await axiosInstance.post("/api/v1/leave", formData);

      if (data.success) {
        setRefreshTrigger((prev) => prev + 1);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to apply leave.",
      };
    }
  };

  // ─── UPDATE LEAVE BALANCE ────────────────────────────────────
  const handleUpdateBalance = async (userId, payload) => {
    try {
      const { data } = await axiosInstance.patch(
        `/api/v1/salary-leave/update-leaves/${userId}`,
        payload
      );

      if (data.success) {
        notify.success(
          "Balances Updated",
          "Leave balances have been updated successfully."
        );

        setBalanceModalOpen(false);
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      notify.error(
        "Update Failed",
        error.response?.data?.message || "Failed to update balances."
      );
    }
  };

  return (
    <div
      className="min-h-screen py-2 pb-10 flex flex-col gap-8 w-full"
      style={{
        background: colors.pageGradient,
      }}
    >
      {/* ================= HEADER ================= */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b"
        style={{
          borderColor: colors.cardBorder,
        }}
      >
        <div>
          <h2
            className="text-3xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Leave{" "}
            <span style={{ color: colors.accent }}>
              Management
            </span>
          </h2>

          <p
            className="text-sm mt-2"
            style={{ color: colors.textSecondary }}
          >
            Track your leave balances, apply for leave and manage
            organization requests.
          </p>
        </div>

        <Button
          variant="custom"
          bg={colors.buttonBg}
          hoverBg={colors.buttonHover}
          text="#FFFFFF"
          icon={Plus}
          size="sm"
          onClick={() => setApplyModalOpen(true)}
        >
          Apply Leave
        </Button>
      </div>

      {/* ================= MY LEAVES ================= */}
      <MyLeaves refreshTrigger={refreshTrigger} />

      {/* ================= ORGANIZATION LEAVES ================= */}
      {isAdminOrManager && (
        <Suspense
          fallback={
            <div
              className="flex flex-col items-center justify-center py-24 gap-4"
              style={{
                color: colors.textSecondary,
              }}
            >
              <Loader2
                size={36}
                className="animate-spin"
                style={{ color: colors.accent }}
              />

              <p className="text-sm font-medium">
                Loading organization leave requests...
              </p>
            </div>
          }
        >
          <OrgLeaves
            refreshTrigger={refreshTrigger}
            onOpenBalanceModal={() => setBalanceModalOpen(true)}
          />
        </Suspense>
      )}

      {/* ================= APPLY LEAVE MODAL ================= */}
      <ApplyLeaveModal
        open={isApplyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={handleApplyLeave}
      />

      {/* ================= UPDATE BALANCE MODAL ================= */}
      {isAdminOrManager && (
        <UpdateBalanceModal
          open={isBalanceModalOpen}
          onClose={() => setBalanceModalOpen(false)}
          onSubmit={handleUpdateBalance}
        />
      )}
    </div>
  );
}