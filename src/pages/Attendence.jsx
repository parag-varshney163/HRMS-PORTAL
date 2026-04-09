import React, { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import MyAttendance from "../components/Attendance/MyAttendance";
import EmployeeAttendanceRecords from "../components/Attendance/EmployeeAttendanceRecords";

// ─── LAZY LOADING THE ORG COMPONENT ───
// This guarantees employees never download the Admin table code!
const OrgAttendance = lazy(
  () => import("../components/Attendance/OrgAttendance"),
);

export default function Attendance() {
  // ─── ROLE CHECK ───
  const userRole =
    localStorage.getItem("roleName")?.toLowerCase() || "employee";
  const canViewOrg = ["admin", "hr", "manager"].includes(userRole);
  const isEmployee = userRole === "employee";

  return (
    <div className="py-2 flex flex-col gap-8 w-full pb-10">
      {/* 1. ALWAYS SHOW: The personal check-in/out widget */}
      {/* <MyAttendance /> */}

      {/* 2. EMPLOYEE ONLY: Show detailed metrics and personal records */}
      {isEmployee && <EmployeeAttendanceRecords />}

      {/* 3. ADMIN/HR/MANAGER: Show the organization stats and table */}
      {canViewOrg && (
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center pt-20 text-text-secondary gap-3">
              <Loader2 className="animate-spin text-accent" size={32} />
              <p className="text-sm font-medium">
                Loading organization data...
              </p>
            </div>
          }
        >
          <OrgAttendance />
        </Suspense>
      )}
    </div>
  );
}
