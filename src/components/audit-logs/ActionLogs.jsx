import React, { useEffect, useState } from "react";

import DataTable from "../../components/ui/DataTable";
import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";


const ActionLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAuditLogs = async (currentPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axiosInstance.get(
        `api/v1/admin/audit-logs?page=${currentPage}&limit=10`
      );

      setLogs(data.data.data);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch audit logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(page);
  }, [page]);

  const badgeColor = (action) => {
    switch (action) {
      case "CREATE":
        return {
          bg: colors.successLight,
          color: colors.success,
        };

      case "UPDATE":
        return {
          bg: colors.warningLight,
          color: colors.warning,
        };

      case "DELETE":
        return {
          bg: colors.dangerLight,
          color: colors.danger,
        };

      default:
        return {
          bg: colors.blueLight,
          color: colors.blue,
        };
    }
  };

  const columns = [
    {
      key: "action",
      label: "Action",
      width: "0.8fr",
      align: "center",
      render: (_, row) => {
        const badge = badgeColor(row.action);

        return (
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: badge.bg,
              color: badge.color,
            }}
          >
            {row.action}
          </span>
        );
      },
    },

    {
      key: "module",
      label: "Module",
      width: "1fr",
      align: "left",
    },

    {
      key: "performedBy",
      label: "Performed By",
      width: "1.5fr",
      align: "left",
      render: (_, row) => (
        <div>
          <p className="font-semibold">
            {row.performedBy?.firstName} {row.performedBy?.lastName}
          </p>
          <p
            className="text-xs"
            style={{ color: colors.textSecondary }}
          >
            {row.performedBy?.employeeId}
          </p>
        </div>
      ),
    },

    {
      key: "description",
      label: "Description",
      width: "3fr",
      align: "left",
      render: (_, row) => (
        <p
          className="text-sm"
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {row.description}
        </p>
      ),
    },

    {
      key: "createdAt",
      label: "Created",
      width: "1.3fr",
      align: "center",
      render: (_, row) =>
        new Date(row.createdAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
  ];

  return (
    <div className="p-6">
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: colors.textPrimary }}
      >
        Audit Logs
      </h2>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        error={error}
        paginationMode="server"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ActionLogs;
