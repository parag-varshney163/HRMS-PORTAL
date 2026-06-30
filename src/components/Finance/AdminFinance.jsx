import { Wallet, Users, DollarSign, Building } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";
import StatsCard from "../ui/StatsCard";
import SearchBar from "../ui/SearchBar";
import DataTable from "../ui/DataTable";


// const adminColumns = [
//   {
//     key: "employee",
//     label: "Employee",
//     width: "2fr",
//     align: "left",
//     render: (_, row) => {
//       const name =
//         row.employeeName || row.user?.name || row.user?.firstName || "Unknown";
//       const id = row.employeeId || row.user?.employeeId || "N/A";
//       const designation =
//         row.designation || row.employment?.designation || "Employee";

//       return (
//         <div className="flex flex-col min-w-0">
//           <span className="font-bold text-sm text-text-primary truncate">
//             {name}
//           </span>
//           <span className="text-[11px] text-text-secondary truncate mt-0.5 opacity-80">
//             {id} • {designation}
//           </span>
//         </div>
//       );
//     },
//   },
//   {
//     key: "totalCTC",
//     label: "Total CTC",
//     width: "1fr",
//     align: "right",
//     render: (val, row) => {
//       const ctc = val || row.salary?.totalCTC || 0;
//       return (
//         <span className="font-bold text-text-primary">
//           ₹{ctc.toLocaleString("en-IN")}
//         </span>
//       );
//     },
//   },
//   {
//     key: "monthlySalary",
//     label: "Monthly Pay",
//     width: "1fr",
//     align: "right",
//     render: (val, row) => {
//       const monthly = val || row.salary?.monthlySalary || row.monthlyPay || 0;
//       return (
//         <span className="text-sm font-semibold text-text-secondary">
//           ₹{monthly.toLocaleString("en-IN")}
//         </span>
//       );
//     },
//   },
//   {
//     key: "bankingDetails",
//     label: "Bank Details",
//     width: "1.5fr",
//     align: "left",
//     render: (bank, row) => {
//       const bankData = bank || row.bankAccount || row.bankDetails;
//       if (!bankData || !bankData.bankName) {
//         return (
//           <span className="text-xs text-text-secondary italic">
//             Not Provided
//           </span>
//         );
//       }
//       const maskedAcc = bankData.accountNumber
//         ? `••••${String(bankData.accountNumber).slice(-4)}`
//         : "N/A";
//       return (
//         <div className="flex flex-col min-w-0">
//           <span className="text-sm font-medium text-text-primary truncate">
//             {bankData.bankName}
//           </span>
//           <span className="text-[11px] text-text-secondary font-mono truncate mt-0.5">
//             A/c: {maskedAcc}
//           </span>
//         </div>
//       );
//     },
//   },
//   {
//     key: "status",
//     label: "Status",
//     width: "0.8fr",
//     align: "center",
//     render: (val, row) => {
//       const status = (val || row.status || "Unknown").toLowerCase();
//       const isActive = status === "active";
//       return (
//         <span
//           className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
//         >
//           {status}
//         </span>
//       );
//     },
//   },
// ];

const adminColumns = [
  {
    key: "employee",
    label: "Employee",
    width: "2fr",
    align: "left",
    render: (_, row) => {
      const name =
        row.employeeName || row.user?.name || row.user?.firstName || "Unknown";
      const id = row.employeeId || row.user?.employeeId || "N/A";
      const designation =
        row.designation || row.employment?.designation || "Employee";

      return (
        <div className="flex flex-col min-w-0">
          <span
            className="font-bold text-sm truncate"
            style={{ color: colors.textPrimary }}
          >
            {name}
          </span>

          <span
            className="text-[11px] truncate mt-0.5 opacity-80"
            style={{ color: colors.textSecondary }}
          >
            {id} • {designation}
          </span>
        </div>
      );
    },
  },
  {
    key: "totalCTC",
    label: "Total CTC",
    width: "1fr",
    align: "right",
    render: (val, row) => {
      const ctc = val || row.salary?.totalCTC || 0;

      return (
        <span
          className="font-bold"
          style={{ color: colors.textPrimary }}
        >
          ₹{ctc.toLocaleString("en-IN")}
        </span>
      );
    },
  },
  {
    key: "monthlySalary",
    label: "Monthly Pay",
    width: "1fr",
    align: "right",
    render: (val, row) => {
      const monthly = val || row.salary?.monthlySalary || row.monthlyPay || 0;

      return (
        <span
          className="text-sm font-semibold"
          style={{ color: colors.textSecondary }}
        >
          ₹{monthly.toLocaleString("en-IN")}
        </span>
      );
    },
  },
  {
    key: "bankingDetails",
    label: "Bank Details",
    width: "1.5fr",
    align: "left",
    render: (bank, row) => {
      const bankData = bank || row.bankAccount || row.bankDetails;

      if (!bankData || !bankData.bankName) {
        return (
          <span
            className="text-xs italic"
            style={{ color: colors.textSecondary }}
          >
            Not Provided
          </span>
        );
      }

      const maskedAcc = bankData.accountNumber
        ? `••••${String(bankData.accountNumber).slice(-4)}`
        : "N/A";

      return (
        <div className="flex flex-col min-w-0">
          <span
            className="text-sm font-medium truncate"
            style={{ color: colors.textPrimary }}
          >
            {bankData.bankName}
          </span>

          <span
            className="text-[11px] font-mono truncate mt-0.5"
            style={{ color: colors.textSecondary }}
          >
            A/c: {maskedAcc}
          </span>
        </div>
      );
    },
  },
  {
    key: "status",
    label: "Status",
    width: "0.8fr",
    align: "center",
    render: (val, row) => {
      const status = (val || row.status || "Unknown").toLowerCase();
      const isActive = status === "active";

      return (
        <span
          className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border"
          style={{
            backgroundColor: isActive
              ? colors.successLight
              : colors.dangerLight,
            color: isActive ? colors.success : colors.danger,
            borderColor: isActive ? colors.success : colors.danger,
          }}
        >
          {status}
        </span>
      );
    },
  },
];
export default function AdminFinance() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/api/v1/salary-leave/finance-details?page=${page}&limit=10&search=${debouncedSearch}`,
      );
      if (data?.success && data?.data) {
        setRecords(data.data.employees || data.data.docs || data.data || []);
        setTotalPages(data.data.totalPages || 1);
        setStats({ totalCount: data.data.totalCount || 0, ...data.data });
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Failed to fetch admin finance data:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const formatCurrency = (num) => `₹${(num || 0).toLocaleString("en-IN")}`;

  // return (
  //   <div className="py-2 pb-10 h-full flex flex-col gap-6 w-full animate-in fade-in">
  //     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  //       <div>
  //         <h2 className="text-2xl font-bold text-text-primary">
  //           Finance Directory
  //         </h2>
  //         <p className="text-sm text-text-secondary mt-1">
  //           Manage organization salary and banking records.
  //         </p>
  //       </div>
  //     </div>

  //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  //       <StatsCard
  //         icon={Users}
  //         iconBg="bg-blue-500/10"
  //         iconColor="text-blue-400"
  //         value={loading ? "..." : stats.totalCount || 0}
  //         label="Total Employee Records"
  //       />
  //       <StatsCard
  //         icon={Wallet}
  //         iconBg="bg-green-500/10"
  //         iconColor="text-green-400"
  //         value={loading ? "..." : formatCurrency(stats.totalCTC)}
  //         label="Total CTC"
  //       />
  //       <StatsCard
  //         icon={Building}
  //         iconBg="bg-blue-500/10"
  //         iconColor="text-blue-400"
  //         value={loading ? "..." : formatCurrency(stats.annualSalary)}
  //         label="Annual Salary (Base)"
  //       />
  //       <StatsCard
  //         icon={DollarSign}
  //         iconBg="bg-yellow-500/10"
  //         iconColor="text-yellow-400"
  //         value={loading ? "..." : formatCurrency(stats.monthlySalary)}
  //         label="Monthly Base Salary"
  //       />
  //     </div>

  //     <div className="bg-card border border-card-border p-4 rounded-xl flex items-center justify-between">
  //       <h3 className="text-lg font-bold text-text-primary hidden sm:block">
  //         Employee Directory
  //       </h3>
  //       <div className="w-full sm:w-[400px]">
  //         <SearchBar
  //           placeholder="Search employee name or ID..."
  //           value={searchQuery}
  //           onChange={setSearchQuery}
  //           width="100%"
  //         />
  //       </div>
  //     </div>

  //     <div className="flex-1 -mt-4">
  //       <DataTable
  //         columns={adminColumns}
  //         data={records}
  //         loading={loading}
  //         paginationMode="server"
  //         page={page}
  //         totalPages={totalPages}
  //         onPageChange={setPage}
  //       />
  //     </div>
  //   </div>
  // );

  return (
  <div className="py-2 pb-10 h-full flex flex-col gap-6 w-full animate-in fade-in">
    {/* Header */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: colors.textPrimary }}
        >
          Finance <span style={{ color: colors.accent }}>Directory</span>
        </h2>

        <p
          className="text-sm mt-1"
          style={{ color: colors.textSecondary }}
        >
          Manage organization salary and banking records.
        </p>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        icon={Users}
        iconBg={colors.blueLight}
        iconColor={colors.blue}
        value={loading ? "..." : stats.totalCount || 0}
        label="Total Employee Records"
      />

      <StatsCard
        icon={Wallet}
        iconBg={colors.greenLight}
        iconColor={colors.green}
        value={loading ? "..." : formatCurrency(stats.totalCTC)}
        label="Total CTC"
      />

      <StatsCard
        icon={Building}
        iconBg={colors.purpleLight}
        iconColor={colors.purple}
        value={loading ? "..." : formatCurrency(stats.annualSalary)}
        label="Annual Salary (Base)"
      />

      <StatsCard
        icon={DollarSign}
        iconBg={colors.orangeLight}
        iconColor={colors.orange}
        value={loading ? "..." : formatCurrency(stats.monthlySalary)}
        label="Monthly Base Salary"
      />
    </div>

    {/* Search */}
    <div
      className="p-4 rounded-xl border flex items-center justify-between"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
      }}
    >
      <h3
        className="text-lg font-bold hidden sm:block"
        style={{ color: colors.textPrimary }}
      >
        Employee Directory
      </h3>

      <div className="w-full sm:w-[400px]">
        <SearchBar
          placeholder="Search employee name or ID..."
          value={searchQuery}
          onChange={setSearchQuery}
          width="100%"
        />
      </div>
    </div>

    {/* Table */}
    <div className="flex-1 -mt-4">
      <DataTable
        columns={adminColumns}
        data={records}
        loading={loading}
        paginationMode="server"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  </div>
);
}
