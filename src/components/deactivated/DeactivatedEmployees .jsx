import React, { useEffect, useState } from "react";

import DataTable from "../../components/ui/DataTable";
import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";


const DeactivatedEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDeactivatedEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axiosInstance.get(
        "api/v1/user/deactivated-employees"
      );

      setEmployees(data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch deactivated employees."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDeactivatedEmployees();
  }, []);


  const statusBadge = (status) => {
    if (status === "deactivated") {
      return {
        bg: colors.dangerLight,
        color: colors.danger,
      };
    }

    return {
      bg: colors.successLight,
      color: colors.success,
    };
  };


  const columns = [
    {
      key: "name",
      label: "Employee",
      width: "1.6fr",
      align: "left",
      render: (_, row) => (
        <div>
          <p
            className="font-semibold"
            style={{ color: colors.textPrimary }}
          >
            {row.name}
          </p>

          <p
            className="text-xs"
            style={{ color: colors.textSecondary }}
          >
            {row.employeeId}
          </p>
        </div>
      ),
    },


    {
      key: "email",
      label: "Email",
      width: "2fr",
      align: "left",
    },


    {
      key: "department",
      label: "Department",
      width: "1.2fr",
      align: "left",
      render: (_, row) => (
        <span className="capitalize">
          {row.department}
        </span>
      ),
    },


    {
      key: "designation",
      label: "Designation",
      width: "1.5fr",
      align: "left",
    },


    {
      key: "employmentType",
      label: "Type",
      width: "1fr",
      align: "center",
      render: (_, row) => (
        <span className="capitalize">
          {row.employmentType.replace("_", " ")}
        </span>
      ),
    },


    {
      key: "workLocation",
      label: "Location",
      width: "1fr",
      align: "center",
      render: (_, row) => (
        <span className="capitalize">
          {row.workLocation}
        </span>
      ),
    },


    {
      key: "reportingManager",
      label: "Reporting Manager",
      width: "1.6fr",
      align: "left",
      render: (_, row) => (
        <div>
          <p
            className="font-medium"
            style={{ color: colors.textPrimary }}
          >
            {row.reportingManager?.name || "-"}
          </p>

          <p
            className="text-xs"
            style={{ color: colors.textSecondary }}
          >
            {row.reportingManager?.email || "-"}
          </p>
        </div>
      ),
    },


    {
      key: "status",
      label: "Status",
      width: "1fr",
      align: "center",
      render: (_, row) => {
        const badge = statusBadge(row.status);

        return (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
            style={{
              background: badge.bg,
              color: badge.color,
            }}
          >
            {row.status}
          </span>
        );
      },
    },


    {
      key: "deactivatedAt",
      label: "Deactivated On",
      width: "1.5fr",
      align: "center",
      render: (_, row) =>
        new Date(row.deactivatedAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
  ];


  return (
    <div className="p-6">

      <h2
        className="text-2xl font-bold mb-6"
        style={{
          color: colors.textPrimary,
        }}
      >
        Deactivated Employees
      </h2>


      <DataTable
        columns={columns}
        data={employees}
        loading={loading}
        error={error}
      />

    </div>
  );
};


export default DeactivatedEmployees;
