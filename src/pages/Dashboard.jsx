import React, { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";


// 🚨 CODE SPLITTING: Only the required dashboard is downloaded!
const AdminDashboard = lazy(
  () => import("../components/Dashboard/AdminDashboard"),
);
const EmployeeDashboard = lazy(
  () => import("../components/Dashboard/EmployeeDashboard"),
);

export default function Dashboard() {
  const userRole =
    localStorage.getItem("roleName")?.toLowerCase() || "employee";
  const isAdminOrHR = ["admin", "hr"].includes(userRole);

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-full w-full py-20 text-text-secondary gap-3">
          <Loader2 className="animate-spin text-accent" size={32} />
          <p className="text-sm font-medium">Loading Dashboard...</p>
        </div>
      }
    >
      {isAdminOrHR ? <AdminDashboard /> : <EmployeeDashboard />}
    </Suspense>
  );
}
