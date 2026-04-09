import React, { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// 🚨 CODE SPLITTING: These files are only downloaded when explicitly needed
const AdminFinance = lazy(() => import("../components/Finance/AdminFinance"));
const EmployeeFinance = lazy(
  () => import("../components/Finance/EmployeeFinance"),
);

export default function Finance() {
  // Grab the role
  const userRole =
    localStorage.getItem("roleName")?.toLowerCase() || "employee";
  const isAdminOrHR = ["admin", "hr"].includes(userRole);

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-full w-full py-20 text-text-secondary gap-3">
          <Loader2 className="animate-spin text-accent" size={32} />
          <p className="text-sm font-medium">Loading Finance Module...</p>
        </div>
      }
    >
      {isAdminOrHR ? <AdminFinance /> : <EmployeeFinance />}
    </Suspense>
  );
}
