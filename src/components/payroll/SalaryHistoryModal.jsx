// SalaryHistoryModal.jsx
import React, { useEffect, useState, useCallback } from "react";
import { X, History } from "lucide-react";

import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";
import DataTable from "../ui/DataTable";


export default function SalaryHistoryModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSalaryHistory = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await axiosInstance.get(
        `/api/v1/salary-leave/salary-history?page=${page}&limit=10`,
      );

      if (data?.success) {
        setLogs(data?.data?.logs || []);
        setTotalPages(
          Math.ceil((data?.data?.totalCount || 0) / 10) || 1,
        );
      }
    } catch (error) {
      console.error("Failed to fetch salary history", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (open) {
      fetchSalaryHistory();
    }
  }, [open, fetchSalaryHistory]);

  if (!open) return null;

  // Flatten API data for table rows
  const formattedData = logs.flatMap((log) => {
    if (!log?.changes?.length) {
      return [
        {
          id: log._id,
          employeeName: log.employeeName || "Unknown",
          component: "-",
          oldAmount: "-",
          newAmount: "-",
          changedBy: log.changedBy || "-",
          changeDate: log.changeDate,
        },
      ];
    }

    return log.changes.map((change, index) => ({
      id: `${log._id}-${index}`,
      employeeName: log.employeeName || "Unknown",
      component: change.component || "-",
      oldAmount: change.oldAmount || 0,
      newAmount: change.newAmount || 0,
      changedBy: log.changedBy || "-",
      changeDate: log.changeDate,
    }));
  });

  // const columns = [
  //   {
  //     key: "employeeName",
  //     label: "Employee Name",
  //     width: "1.5fr",
  //     align: "left",
  //     render: (val) => (
  //       <span className="text-sm font-semibold text-text-primary">
  //         {val || "-"}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "component",
  //     label: "Component Affected",
  //     width: "1.3fr",
  //     align: "left",
  //     render: (val) => (
  //       <span className="text-sm text-yellow-400 capitalize">
  //         {val || "-"}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "oldAmount",
  //     label: "Old Amount",
  //     width: "1fr",
  //     align: "right",
  //     render: (val) => (
  //       <span className="text-sm text-red-400 font-medium">
  //         {typeof val === "number"
  //           ? `₹${val.toLocaleString()}`
  //           : val}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "newAmount",
  //     label: "New Amount",
  //     width: "1fr",
  //     align: "right",
  //     render: (val) => (
  //       <span className="text-sm text-green-400 font-bold">
  //         {typeof val === "number"
  //           ? `₹${val.toLocaleString()}`
  //           : val}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "changedBy",
  //     label: "Changed By",
  //     width: "1fr",
  //     align: "left",
  //     render: (val) => (
  //       <span className="text-sm text-text-secondary">
  //         {val || "-"}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "changeDate",
  //     label: "Change Date",
  //     width: "1.2fr",
  //     align: "center",
  //     render: (val) => (
  //       <span className="text-xs text-text-secondary">
  //         {val
  //           ? new Date(val).toLocaleString()
  //           : "-"}
  //       </span>
  //     ),
  //   },
  // ];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-card border border-card-border rounded-2xl w-full max-w-7xl h-[85vh] shadow-2xl flex flex-col overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* HEADER */}
//         <div className="flex items-center justify-between p-5 border-b border-card-border">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400">
//               <History size={20} />
//             </div>

//             <div>
//               <h2 className="text-xl font-bold text-text-primary">
//                 Salary Audit Trail
//               </h2>
//               <p className="text-sm text-text-secondary">
//                 Track all employee salary modifications
//               </p>
//             </div>
//           </div>

//           <button
//             onClick={onClose}
//             className="p-2 rounded-lg hover:bg-input text-text-secondary hover:text-text-primary transition"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* TABLE */}
//       <div className="flex-1 p-4 overflow-y-auto min-h-0">
//   <div className="min-w-[1200px]">
//     <DataTable
//       columns={columns}
//       data={formattedData}
//       loading={loading}
//       paginationMode="server"
//       page={page}
//       totalPages={totalPages}
//       onPageChange={setPage}
//     />
//   </div>
// </div>
//       </div>
//     </div>
//   );

const columns = [
  {
    key: "employeeName",
    label: "Employee Name",
    width: "1.5fr",
    align: "left",
    render: (val) => (
      <span
        className="text-sm font-semibold"
        style={{ color: colors.textPrimary }}
      >
        {val || "-"}
      </span>
    ),
  },

  {
    key: "component",
    label: "Component Affected",
    width: "1.3fr",
    align: "left",
    render: (val) => (
      <span
        className="text-sm capitalize font-medium"
        style={{ color: colors.accentDark }}
      >
        {val || "-"}
      </span>
    ),
  },

  {
    key: "oldAmount",
    label: "Old Amount",
    width: "1fr",
    align: "right",
    render: (val) => (
      <span
        className="text-sm font-medium"
        style={{ color: colors.danger }}
      >
        {typeof val === "number"
          ? `₹${val.toLocaleString()}`
          : val}
      </span>
    ),
  },

  {
    key: "newAmount",
    label: "New Amount",
    width: "1fr",
    align: "right",
    render: (val) => (
      <span
        className="text-sm font-bold"
        style={{ color: colors.success }}
      >
        {typeof val === "number"
          ? `₹${val.toLocaleString()}`
          : val}
      </span>
    ),
  },

  {
    key: "changedBy",
    label: "Changed By",
    width: "1fr",
    align: "left",
    render: (val) => (
      <span
        className="text-sm"
        style={{ color: colors.textSecondary }}
      >
        {val || "-"}
      </span>
    ),
  },

  {
    key: "changeDate",
    label: "Change Date",
    width: "1.2fr",
    align: "center",
    render: (val) => (
      <span
        className="text-xs"
        style={{ color: colors.textMuted }}
      >
        {val
          ? new Date(val).toLocaleString()
          : "-"}
      </span>
    ),
  },
];
    

return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{
      backgroundColor: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(6px)",
    }}
    onClick={onClose}
  >
    <div
      className="w-full max-w-7xl h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 border-b"
        style={{
          borderColor: colors.cardBorder,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl"
            style={{
              backgroundColor: colors.accentLight,
              color: colors.accent,
            }}
          >
            <History size={20} />
          </div>

          <div>
            <h2
              className="text-xl font-bold"
              style={{
                color: colors.textPrimary,
              }}
            >
              Salary Audit Trail
            </h2>

            <p
              className="text-sm"
              style={{
                color: colors.textSecondary,
              }}
            >
              Track all employee salary modifications
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: colors.textSecondary,
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.hover;
            e.currentTarget.style.color = colors.textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = colors.textSecondary;
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Table */}
      <div
        className="flex-1 p-4 overflow-y-auto min-h-0"
        style={{
          backgroundColor: colors.cardBg,
        }}
      >
        <div className="min-w-[1200px]">
          <DataTable
            columns={columns}
            data={formattedData}
            loading={loading}
            paginationMode="server"
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  </div>
);
}
