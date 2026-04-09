import React from "react";
import EmployeeReimbursements from "../components/Reimbursements/EmployeeReimbursements";
import AdminReimbursements from "../components/Reimbursements/AdminReimbursements";

const Reimbursements = () => {
  const userRole =
    localStorage.getItem("roleName")?.toLowerCase() || "employee";

  // If the user is a standard employee, show their personal dashboard
  if (userRole === "employee") {
    return <EmployeeReimbursements />;
  }

  // Otherwise (Admin or Manager), show the management dashboard
  return <AdminReimbursements />;
};

export default Reimbursements;
