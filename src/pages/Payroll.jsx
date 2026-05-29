import { Wallet, Users, Calendar, DollarSign, Plus, X, Search, IndianRupee, } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

import SalaryHistoryModal from "../components/payroll/SalaryHistoryModal.jsx";
import FilterDropDown from "../components/ui/FilterDropDown.jsx";
import useNotification from "../hooks/useNotification.jsx";
// Components
import StatsCard from "../components/ui/StatsCard";
import SearchBar from "../components/ui/SearchBar";
import DataTable from "../components/ui/DataTable";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/ui/Button";


// 1. IN-FILE MODAL: GENERATE PAYROLL
const GeneratePayrollModal = ({ open, onClose, onGenerate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    month: new Date().getMonth() + 1, // Current month (1-12)
    year: new Date().getFullYear(), // Current year
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onGenerate(Number(form.month), Number(form.year));
    setIsSubmitting(false);
  };

  if (!open) return null;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Generate a list of years (e.g., 2024 to 2030)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-card-border rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-card-border">
          <h2 className="text-lg font-bold text-text-primary">
            Generate Payroll
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-text-secondary mb-4">
            Select the month and year to generate payroll for all eligible
            employees.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Month
              </label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn cursor-pointer"
              >
                {months.map((m, i) => (
                  <option key={i + 1} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Year
              </label>
              <select
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-card-border text-sm font-semibold hover:bg-input transition-colors"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 justify-center"
            >
              {isSubmitting ? "Generating..." : "Generate Run"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. MAIN PAGE COMPONENT: FINANCE / PAYROLL
export default function Finance() {
  const notify = useNotification();

  // State
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalWorkingDays: 0,
    grossPayroll: 0,
    netPayout: 0,
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salaryHistoryOpen, setSalaryHistoryOpen] = useState(false);

  // Table Filters & Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ─── API: FETCH STATS & TABLE DATA ───
  // const fetchData = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const [statsRes, listRes] = await Promise.allSettled([
  //       axiosInstance.get("/api/v1/payroll/stats"),
  //       axiosInstance.get(
  //         `/api/v1/payroll?page=${page}&limit=10&search=${debouncedSearch}`,
  //       ),
  //     ]);

  //     if (statsRes.status === "fulfilled" && statsRes.value.data?.success) {
  //       setStats(statsRes.value.data.data || {});
  //     }

  //     if (listRes.status === "fulfilled" && listRes.value.data?.success) {
  //       // Adjust these keys based on your specific pagination payload structure
  //       // setRecords(
  //       //   listRes.value.data.data.records ||
  //       //     listRes.value.data.data.payrolls ||
  //       //     [],
  //       // );
  //       setRecords(listRes.value.data.data.data || []);
  //       setTotalPages(listRes.value.data.data.totalPages || 1);
  //     } else {
  //       setRecords([]);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch payroll data:", error);
  //     setRecords([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [page, debouncedSearch]);
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search: debouncedSearch,
      });

      if (roleFilter) queryParams.append("role", roleFilter);
      if (departmentFilter)
        queryParams.append("department", departmentFilter);
      if (statusFilter) queryParams.append("status", statusFilter);

      const [statsRes, listRes] = await Promise.allSettled([
        axiosInstance.get("/api/v1/payroll/stats"),
        axiosInstance.get(`/api/v1/payroll?${queryParams.toString()}`),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data?.success) {
        setStats(statsRes.value.data.data || {});
      }

      if (listRes.status === "fulfilled" && listRes.value.data?.success) {
        setRecords(listRes.value.data.data.data || []);
        setTotalPages(listRes.value.data.data.totalPages || 1);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Failed to fetch payroll data:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    debouncedSearch,
    roleFilter,
    departmentFilter,
    statusFilter,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── API: GENERATE PAYROLL ACTION ───
  const handleGeneratePayroll = async (month, year) => {
    try {
      const { data } = await axiosInstance.post("/api/v1/payroll/generate", {
        month,
        year,
      });
      if (data.success) {
        notify.success(
          "Success",
          `Payroll generated successfully for ${month}/${year}`,
        );
        setIsModalOpen(false);
        fetchData(); // Refresh table and stats
      }
    } catch (error) {
      notify.error(
        "Generation Failed",
        error.response?.data?.message || "Failed to generate payroll.",
      );
    }
  };
  const handleBulkStatusUpdate = async (status) => {
    try {
      if (selectedEmployees.length === 0) {
        notify.error(
          "No Employees Selected",
          "Please select employees first."
        );
        return;
      }

      const firstRecord = records[0];

      const payload = {
        userIds: selectedEmployees,
        status,
        month: firstRecord.month,
        year: firstRecord.year,
      };

      const { data } = await axiosInstance.patch(
        "/api/v1/salary-leave/payroll/bulk-status",
        payload
      );

      if (data.success) {
        notify.success(
          "Success",
          `Salary status updated to ${status}`
        );

        setSelectedEmployees([]);
        fetchData();
      }
    } catch (error) {
      notify.error(
        "Update Failed",
        error.response?.data?.message ||
        "Unable to update salary status."
      );
    }
  };

  // ─── TABLE COLUMNS ───
  // const columns = [
  //   {
  //     key: "employee",
  //     label: "Employee",
  //     width: "2fr",
  //     align: "left",
  //     render: (_, row) => (
  //       <div className="min-w-0">
  //         <p className="text-sm font-bold text-text-primary truncate">
  //           {row.user?.firstName} {row.user?.lastName}
  //         </p>
  //         <p className="text-xs text-text-secondary font-mono truncate">
  //           {row.user?.employeeId || "N/A"}
  //         </p>
  //       </div>
  //     ),
  //   },
  //   {
  //     key: "period",
  //     label: "Period",
  //     width: "1fr",
  //     align: "left",
  //     render: (_, row) => (
  //       <span className="text-sm font-medium text-text-secondary">
  //         {row.month && row.year ? `${row.month}/${row.year}` : "-"}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "gross",
  //     label: "Gross Pay",
  //     width: "1fr",
  //     align: "right",
  //     render: (_, row) => (
  //       <span className="text-sm text-text-primary font-medium">
  //         ${(row.grossPay || row.grossPayroll || 0).toLocaleString()}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "net",
  //     label: "Net Payout",
  //     width: "1fr",
  //     align: "right",
  //     render: (_, row) => (
  //       <span className="text-sm font-bold text-green-400">
  //         ${(row.netPay || row.netPayout || 0).toLocaleString()}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "status",
  //     label: "Status",
  //     width: "1fr",
  //     align: "center",
  //     render: (val) => {
  //       const currentVal = (val || "pending").toLowerCase();
  //       let style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  //       if (currentVal === "paid")
  //         style = "bg-green-500/10 text-green-400 border-green-500/30";
  //       else if (currentVal === "generated")
  //         style = "bg-blue-500/10 text-blue-400 border-blue-500/30";

  //       return (
  //         <span
  //           className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${style}`}
  //         >
  //           {val || "Pending"}
  //         </span>
  //       );
  //     },
  //   },
  // ];
  const columns = [
    {
      key: "select",
      label: "",
      width: "60px",
      align: "center",
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedEmployees.includes(row.userId)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedEmployees((prev) => [
                ...prev,
                row.userId,
              ]);
            } else {
              setSelectedEmployees((prev) =>
                prev.filter((id) => id !== row.userId)
              );
            }
          }}
          className="w-4 h-4 cursor-pointer accent-blue-500"
        />
      ),
    },
    {
      key: "employeeName",
      label: "Employee Name",
      width: "1.8fr",
      align: "left",
      render: (_, row) => (
        <span className="text-sm font-bold text-text-primary">
          {row.employeeName || "-"}
        </span>
      ),
    },

    {
      key: "employeeId",
      label: "Employee ID",
      width: "1.4fr",
      align: "left",
      render: (val) => (
        <span className="text-xs font-mono text-text-secondary">
          {val || "-"}
        </span>
      ),
    },

    {
      key: "period",
      label: "Period",
      width: "1fr",
      align: "center",
      render: (_, row) => (
        <span className="text-sm text-text-primary">
          {row.period || `${row.month}/${row.year}`}
        </span>
      ),
    },

    {
      key: "daysWorked",
      label: "Working Days",
      width: "1fr",
      align: "center",
      render: (val) => (
        <span className="text-sm text-green-400 font-semibold">
          {val || 0}
        </span>
      ),
    },

    {
      key: "absentDays",
      label: "Absent Days",
      width: "1fr",
      align: "center",
      render: (val) => (
        <span className="text-sm text-red-400 font-semibold">
          {val || 0}
        </span>
      ),
    },

    {
      key: "grossPay",
      label: "Gross Pay",
      width: "1.2fr",
      align: "right",
      render: (val) => (
        <span className="text-sm font-medium text-text-primary">
          ₹{Number(val || 0).toLocaleString("en-IN")}
        </span>
      ),
    },

    {
      key: "reimbursement",
      label: "Reimbu..",
      width: "1.2fr",
      align: "right",
      render: (val) => (
        <span className="text-sm text-cyan-400">
          ₹{Number(val || 0).toLocaleString("en-IN")}
        </span>
      ),
    },

    {
      key: "netPayout",
      label: "Net Payout",
      width: "1.2fr",
      align: "right",
      render: (val) => (
        <span className="text-sm font-bold text-green-400">
          ₹{Number(val || 0).toLocaleString("en-IN")}
        </span>
      ),
    },

    {
      key: "employmentStatus",
      label: "Employment Status",
      width: "1.2fr",
      align: "center",
      render: (_, row) => {
        const status =
          row.employmentStatus ||
          row.employeeStatus ||
          "working";

        const isWorking = status.toLowerCase() === "working";

        return (
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${isWorking
              ? "bg-green-500/10 text-green-400 border-green-500/30"
              : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}
          >
            {isWorking ? "Working" : "Resigned"}
          </span>
        );
      },
    },

    {
      key: "salaryPaidStatus",
      label: "Salary Status",
      width: "1.2fr",
      align: "center",
      render: (val) => {
        const currentVal = (val || "pending").toLowerCase();

        let style =
          "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";

        if (currentVal === "paid") {
          style =
            "bg-green-500/10 text-green-400 border-green-500/30";
        }

        return (
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${style}`}
          >
            {val || "Pending"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "1fr",
      align: "center",
      render: (_, row) => {
        const isPaid =
          row.salaryPaidStatus?.toLowerCase() === "paid";

        return (
          <Button
            size="sm"
            bg={isPaid ? "#EF4444" : "#22C55E"}
            text="#FFF"
            onClick={async () => {
              try {
                const payload = {
                  userIds: [row.userId],
                  status: isPaid ? "pending" : "paid",
                  month: row.month,
                  year: row.year,
                };

                const { data } = await axiosInstance.patch(
                  "/api/v1/salary-leave/payroll/bulk-status",
                  payload
                );

                if (data.success) {
                  notify.success(
                    "Updated",
                    `Salary marked as ${isPaid ? "Pending" : "Paid"
                    }`
                  );

                  fetchData();
                }
              } catch (error) {
                notify.error(
                  "Update Failed",
                  error.response?.data?.message ||
                  "Unable to update status."
                );
              }
            }}
          >
            {isPaid ? "Mark Unpaid" : "Mark Paid"}
          </Button>
        );
      },
    },
  ];
  return (
    <div className="py-2 pb-10 h-full flex flex-col gap-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-card-border pb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Payroll <span className="text-accent">Management</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage, generate, and track employee compensation.
          </p>
        </div>
        <Button
          variant="custom"
          bg="#3B82F6"
          text="#FFF"
          icon={Plus}
          size="sm"
          onClick={() => setIsModalOpen(true)}
        >
          Generate Payroll
        </Button>
      </div>

      {/* ─── Stats Section (Safely maps to API JSON) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={IndianRupee}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-400"
          value={
            loading ? "..." : `${(stats.grossPayroll || 0).toLocaleString()}`
          }
          label="Gross Payroll"
        />
        <StatsCard
          icon={Wallet}
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
          value={
            loading ? "..." : `$${(stats.netPayout || 0).toLocaleString()}`
          }
          label="Net Payout"
        />
        <StatsCard
          icon={Users}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          value={loading ? "..." : stats.totalEmployees || 0}
          label="Employees Paid"
        />
        <StatsCard
          icon={Calendar}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
          value={loading ? "..." : stats.totalWorkingDays || 0}
          label="Total Working Days"
        />
      </div>

      {/* ─── Table Controls & DataTable ─── */}
      <div className="bg-card border border-card-border rounded-xl flex-1 flex flex-col overflow-hidden mt-2">
        <div className="p-4 border-b border-card-border flex flex-col sm:flex-row items-center gap-4 bg-input/20">

          {/* <div className="w-full sm:max-w-md">
            <SearchBar
              placeholder="Search employee..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          <Button

            size="sm"
            onClick={() => setSalaryHistoryOpen(true)}
          >
            Salary History
          </Button> */}
          <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            {/* Search */}
            <div className="w-full lg:max-w-md">
              <SearchBar
                placeholder="Search employee..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>

            {/* Filters + Buttons */}
            <div className="flex flex-wrap items-center gap-3">

              <FilterDropDown
                width="170px"
                defaultLabel="Role"
                options={["Admin", "Manager", "Employee"]}
                onSelect={(value) => {
                  setRoleFilter(value.toLowerCase());
                  setPage(1);
                }}
              />

              <FilterDropDown
                width="170px"
                defaultLabel="Department"
                options={["HR", "Sales", "IT", "Finance"]}
                onSelect={(value) => {
                  setDepartmentFilter(value);
                  setPage(1);
                }}
              />

              <FilterDropDown
                width="170px"
                defaultLabel="Salary Status"
                options={["Generated", "Paid", "Pending"]}
                onSelect={(value) => {
                  setStatusFilter(value.toLowerCase());
                  setPage(1);
                }}
              />

              {/* Download CSV */}
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    const queryParams = new URLSearchParams();

                    if (debouncedSearch) {
                      queryParams.append("search", debouncedSearch);
                    }

                    if (roleFilter) {
                      queryParams.append("role", roleFilter);
                    }

                    if (departmentFilter) {
                      queryParams.append("department", departmentFilter);
                    }

                    if (statusFilter) {
                      queryParams.append("status", statusFilter);
                    }

                    const response = await axiosInstance.get(
                      `/api/v1/payroll/download?${queryParams.toString()}`,
                      {
                        responseType: "blob",
                      }
                    );

                    const blob = new Blob([response.data], {
                      type: "text/csv",
                    });

                    const url = window.URL.createObjectURL(blob);

                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", "payroll-report.csv");

                    document.body.appendChild(link);
                    link.click();

                    link.remove();
                    window.URL.revokeObjectURL(url);

                    notify.success(
                      "Downloaded",
                      "Payroll CSV downloaded successfully"
                    );
                  } catch (error) {
                    notify.error(
                      "Download Failed",
                      error.response?.data?.message ||
                      "Unable to download payroll report."
                    );
                  }
                }}
              >
                Download CSV
              </Button>

              <Button
                size="sm"
                onClick={() => setSalaryHistoryOpen(true)}
              >
                Salary History
              </Button>
              <Button
                size="sm"
                bg="#22C55E"
                text="#FFF"
                disabled={selectedEmployees.length === 0}
                onClick={() => handleBulkStatusUpdate("paid")}
              >
                Mark Paid ({selectedEmployees.length})
              </Button>
            </div>
          </div>

        </div>

        <div className="flex-1 p-4">
          <DataTable
            columns={columns}
            data={records}
            loading={loading}
            paginationMode="server"
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* ─── Generate Modal ─── */}
      <GeneratePayrollModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGeneratePayroll}
      />
      <SalaryHistoryModal
        open={salaryHistoryOpen}
        onClose={() => setSalaryHistoryOpen(false)}
      />
    </div>
  );
}
