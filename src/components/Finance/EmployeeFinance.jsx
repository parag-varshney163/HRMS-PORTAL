import React, { useState, useEffect, useCallback } from "react";
import { Wallet, DollarSign, Receipt } from "lucide-react";

import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";
import StatsCard from "../ui/StatsCard";
import DataTable from "../ui/DataTable";


// const employeeColumns = [
//   {
//     key: "month",
//     label: "Payroll Month",
//     width: "1.5fr",
//     align: "left",
//     render: (val) => (
//       <span className="font-semibold text-sm text-text-primary">{val}</span>
//     ),
//   },
//   {
//     key: "grossPay",
//     label: "Gross Pay",
//     width: "1fr",
//     align: "right",
//     render: (val) => (
//       <span className="text-sm text-text-secondary">
//         ₹{(val || 0).toLocaleString("en-IN")}
//       </span>
//     ),
//   },
//   {
//     key: "deductions",
//     label: "Deductions",
//     width: "1fr",
//     align: "right",
//     render: (val) => (
//       <span className="text-sm text-red-400">
//         - ₹{(val || 0).toLocaleString("en-IN")}
//       </span>
//     ),
//   },
//   {
//     key: "netPay",
//     label: "Net Pay",
//     width: "1fr",
//     align: "right",
//     render: (val) => (
//       <span className="text-sm font-bold text-green-400">
//         ₹{(val || 0).toLocaleString("en-IN")}
//       </span>
//     ),
//   },
//   {
//     key: "status",
//     label: "Status",
//     width: "1fr",
//     align: "center",
//     render: (val) => {
//       const status = val?.toLowerCase() || "pending";
//       let style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
//       if (status === "generated")
//         style = "bg-blue-500/10 text-blue-400 border-blue-500/20";
//       else if (status === "paid")
//         style = "bg-green-500/10 text-green-400 border-green-500/20";

//       return (
//         <span
//           className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${style}`}
//         >
//           {val || "Pending"}
//         </span>
//       );
//     },
//   },
// ];


const employeeColumns = [
  {
    key: "month",
    label: "Payroll Month",
    width: "1.5fr",
    align: "left",
    render: (val) => (
      <span
        className="font-semibold text-sm"
        style={{ color: colors.textPrimary }}
      >
        {val}
      </span>
    ),
  },

  {
    key: "grossPay",
    label: "Gross Pay",
    width: "1fr",
    align: "right",
    render: (val) => (
      <span
        className="text-sm"
        style={{ color: colors.textSecondary }}
      >
        ₹{Number(val || 0).toLocaleString("en-IN")}
      </span>
    ),
  },

  {
    key: "deductions",
    label: "Deductions",
    width: "1fr",
    align: "right",
    render: (val) => (
      <span
        className="text-sm"
        style={{ color: colors.danger }}
      >
        - ₹{Number(val || 0).toLocaleString("en-IN")}
      </span>
    ),
  },

  {
    key: "netPay",
    label: "Net Pay",
    width: "1fr",
    align: "right",
    render: (val) => (
      <span
        className="text-sm font-bold"
        style={{ color: colors.success }}
      >
        ₹{Number(val || 0).toLocaleString("en-IN")}
      </span>
    ),
  },

  {
    key: "status",
    label: "Status",
    width: "1fr",
    align: "center",
    render: (val) => {
      const status = (val || "pending").toLowerCase();

      const bg =
        status === "paid"
          ? colors.successLight
          : status === "generated"
            ? colors.blueLight
            : colors.warningLight;

      const text =
        status === "paid"
          ? colors.success
          : status === "generated"
            ? colors.blue
            : colors.warning;

      return (
        <span
          className="px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider border"
          style={{
            backgroundColor: bg,
            color: text,
            borderColor: text,
          }}
        >
          {val || "Pending"}
        </span>
      );
    },
  },

  // ✅ New Column
  // {
  //   key: "download",
  //   label: "Payslip",
  //   width: "1.2fr",
  //   align: "center",
  //   render: (_, row) => (
  //     <Button
  //       size="sm"
  //       bg={colors.blue}
  //       text="#FFFFFF"
  //       onClick={async () => {
  //         try {
  //           const response = await axiosInstance.get(
  //             `/api/v1/payroll/slip/${row.payrollId}/download`,
  //             {
  //               responseType: "blob",
  //             }
  //           );

  //           const blob = new Blob([response.data], {
  //             type: "application/pdf",
  //           });

  //           const url = window.URL.createObjectURL(blob);

  //           const link = document.createElement("a");
  //           link.href = url;
  //           link.download = `Payslip_${row.month}.pdf`;

  //           document.body.appendChild(link);
  //           link.click();
  //           link.remove();

  //           window.URL.revokeObjectURL(url);
  //         } catch (error) {
  //           console.error(error);
  //         }
  //       }}
  //     >
  //       Download
  //     </Button>
  //   ),
  // },
  {
    key: "download",
    label: "Payslip",
    width: "1.2fr",
    align: "center",
    render: (_, row) => {
      const isPaid =
        row.status?.toLowerCase() === "paid";

      if (!isPaid) {
        return (
          <span
            className="text-xs"
            style={{ color: colors.textSecondary }}
          >
            -
          </span>
        );
      }

      return (
        <Button
          size="sm"
          bg={colors.blue}
          text="#FFFFFF"
          onClick={async () => {
            try {
              const response = await axiosInstance.get(
                `/api/v1/payroll/slip/${row._id}/download`,
                {
                  responseType: "blob",
                }
              );

              const blob = new Blob([response.data], {
                type: "application/pdf",
              });

              const url = window.URL.createObjectURL(blob);

              const link = document.createElement("a");
              link.href = url;
              link.download = `Payslip_${row.month}.pdf`;

              document.body.appendChild(link);
              link.click();
              link.remove();

              window.URL.revokeObjectURL(url);
            } catch (error) {
              console.error(error);
            }
          }}
        >
          Download
        </Button>
      );
    },
  },
];
export default function EmployeeFinance() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/api/v1/salary-leave/user-finance-details`,
      );
      if (data?.success && data?.data) {
        setRecords(data.data.employee?.payrollSummary || []);
        setStats(data.data.summary || {});
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Failed to fetch employee finance data:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const formatCurrency = (num) => `₹${(num || 0).toLocaleString("en-IN")}`;

  // return (
  //   <div className="py-2 pb-10 h-full flex flex-col gap-6 w-full animate-in fade-in">
  //     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  //       <div>
  //         <h2 className="text-2xl font-bold text-text-primary">My Payroll</h2>
  //         <p className="text-sm text-text-secondary mt-1">
  //           View your personal salary breakdown and payslips.
  //         </p>
  //       </div>
  //     </div>

  //     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  //       <StatsCard
  //         icon={Wallet}
  //         iconBg="bg-green-500/10"
  //         iconColor="text-green-400"
  //         value={loading ? "..." : formatCurrency(stats.totalCTC)}
  //         label="My Total CTC"
  //       />
  //       <StatsCard
  //         icon={DollarSign}
  //         iconBg="bg-blue-500/10"
  //         iconColor="text-blue-400"
  //         value={loading ? "..." : formatCurrency(stats.monthlySalary)}
  //         label="My Monthly Salary"
  //       />
  //       <StatsCard
  //         icon={Receipt}
  //         iconBg="bg-purple-500/10"
  //         iconColor="text-purple-400"
  //         value={loading ? "..." : formatCurrency(stats.ytdEarnings)}
  //         label="YTD Earnings"
  //       />
  //     </div>

  //     <div className="border-b border-card-border pb-2 mt-2">
  //       <h3 className="text-lg font-bold text-text-primary">Payroll History</h3>
  //     </div>

  //     <div className="flex-1 -mt-4">
  //       <DataTable
  //         columns={employeeColumns}
  //         data={records}
  //         loading={loading}
  //         paginationMode="client" // 🚨 Employees use client-side pagination for their array
  //       />
  //     </div>
  //   </div>
  // );

  return (
  <div
    className="py-2 pb-10 min-h-screen flex flex-col gap-6 w-full"
    style={{
      background: colors.pageGradient,
    }}
  >
    {/* Header */}
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b"
      style={{
        borderColor: colors.cardBorder,
      }}
    >
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: colors.textPrimary }}
        >
          My <span style={{ color: colors.accent }}>Payroll</span>
        </h2>

        <p
          className="text-sm mt-1"
          style={{ color: colors.textSecondary }}
        >
          View your personal salary breakdown and payslips.
        </p>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatsCard
        icon={Wallet}
        iconBg={colors.successLight}
        iconColor={colors.success}
        value={loading ? "..." : formatCurrency(stats.totalCTC)}
        label="My Total CTC"
      />

      <StatsCard
        icon={DollarSign}
        iconBg={colors.blueLight}
        iconColor={colors.blue}
        value={loading ? "..." : formatCurrency(stats.monthlySalary)}
        label="My Monthly Salary"
      />

      <StatsCard
        icon={Receipt}
        iconBg={colors.accentLight}
        iconColor={colors.accent}
        value={loading ? "..." : formatCurrency(stats.ytdEarnings)}
        label="YTD Earnings"
      />
    </div>

    {/* Payroll History */}
    <div
      className="rounded-xl p-5"
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      <div
        className="pb-4 mb-4 border-b"
        style={{
          borderColor: colors.cardBorder,
        }}
      >
        <h3
          className="text-lg font-bold"
          style={{ color: colors.textPrimary }}
        >
          Payroll History
        </h3>

        <p
          className="text-sm mt-1"
          style={{ color: colors.textSecondary }}
        >
          Download your salary slips for paid payrolls.
        </p>
      </div>

      <DataTable
        columns={employeeColumns}
        data={records}
        loading={loading}
        paginationMode="client"
      />
    </div>
  </div>
);
}
