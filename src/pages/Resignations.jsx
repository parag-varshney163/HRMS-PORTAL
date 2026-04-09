import React from "react";
import EmployeeResignations from "../components/Resignations/EmployeeResignations";
import AdminResignations from "../components/Resignations/AdminResignations";

const Resignations = () => {
  // Grab the role from local storage (default to employee if missing)
  const userRole =
    localStorage.getItem("roleName")?.toLowerCase() || "employee";

  // If the user is a standard employee, show their personal dashboard
  if (userRole === "employee") {
    return <EmployeeResignations />;
  }

  // Otherwise (Admin or Manager), show the management dashboard
  return <AdminResignations />;
};

export default Resignations;
