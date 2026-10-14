import React from "react";

import ManageEmployeeLeaves from "../components/manage-leaves/ManageEmployeeLeaves";
import colors from "../constants/colors";


export default function ManageLeaves() {
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
            Deactivated{" "}
            <span style={{ color: colors.accent }}>
              Employees
            </span>
          </h2>

          <p
            className="text-sm mt-2"
            style={{ color: colors.textSecondary }}
          >
            View and monitor employees who are currently deactivated from the system.

          </p>
        </div>
      </div>

      {/* ================= ACTION LOGS TABLE ================= */}
      <ManageEmployeeLeaves/>
    </div>
  );
}

