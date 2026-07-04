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
import colors from "../constants/colors.js";


const GeneratePayrollModal = ({ open, onClose, onGenerate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
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

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 5 },
    (_, i) => currentYear - 1 + i
  );

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
        className="w-full max-w-md rounded-2xl border shadow-2xl"
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
          <h2
            className="text-lg font-bold"
            style={{
              color: colors.textPrimary,
            }}
          >
            Generate Payroll
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: colors.textSecondary,
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-5"
        >
          <p
            className="text-sm"
            style={{
              color: colors.textSecondary,
            }}
          >
            Select the month and year to generate payroll for all
            eligible employees.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Month */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{
                  color: colors.textPrimary,
                }}
              >
                Month
              </label>

              <select
                value={form.month}
                onChange={(e) =>
                  setForm({
                    ...form,
                    month: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  borderColor: colors.cardBorder,
                }}
              >
                {months.map((month, index) => (
                  <option
                    key={index}
                    value={index + 1}
                  >
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{
                  color: colors.textPrimary,
                }}
              >
                Year
              </label>

              <select
                value={form.year}
                onChange={(e) =>
                  setForm({
                    ...form,
                    year: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  borderColor: colors.cardBorder,
                }}
              >
                {years.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border font-semibold transition-colors"
              style={{
                borderColor: colors.cardBorder,
                color: colors.textPrimary,
                backgroundColor: colors.cardBg,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  colors.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  colors.cardBg;
              }}
            >
              Cancel
            </button>

            <Button
              type="submit"
              bg={colors.buttonBg}
              text={colors.textPrimary}
              disabled={isSubmitting}
              className="flex-1 justify-center"
            >
              {isSubmitting
                ? "Generating..."
                : "Generate Run"}
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
              setSelectedEmployees((prev) => [...prev, row.userId]);
            } else {
              setSelectedEmployees((prev) =>
                prev.filter((id) => id !== row.userId)
              );
            }
          }}
          className="w-4 h-4 cursor-pointer"
          style={{
            accentColor: colors.blue,
          }}
        />
      ),
    },

    {
      key: "employeeName",
      label: "Employee Name",
      width: "1.8fr",
      align: "left",
      render: (_, row) => (
        <span
          className="text-sm font-bold"
          style={{ color: colors.textPrimary }}
        >
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
        <span
          className="text-xs font-mono"
          style={{ color: colors.textSecondary }}
        >
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
        <span
          className="text-sm"
          style={{ color: colors.textPrimary }}
        >
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
        <span
          className="text-sm font-semibold"
          style={{ color: colors.success }}
        >
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
        <span
          className="text-sm font-semibold"
          style={{ color: colors.danger }}
        >
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
        <span
          className="text-sm font-medium"
          style={{ color: colors.textPrimary }}
        >
          ₹{Number(val || 0).toLocaleString("en-IN")}
        </span>
      ),
    },

    {
      key: "reimbursement",
      label: "Reimbu.",
      width: "1.2fr",
      align: "right",
      render: (val) => (
        <span
          className="text-sm"
          style={{ color: colors.blue }}
        >
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
        <span
          className="text-sm font-bold"
          style={{ color: colors.success }}
        >
          ₹{Number(val || 0).toLocaleString("en-IN")}
        </span>
      ),
    },

    {
      key: "employmentStatus",
      label: "Employment Status",
      width: "1.3fr",
      align: "center",
      render: (_, row) => {
        const status =
          row.employmentStatus ||
          row.employeeStatus ||
          "working";

        const isWorking =
          status.toLowerCase() === "working";

        return (
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider"
            style={{
              backgroundColor: isWorking
                ? colors.successLight
                : colors.dangerLight,
              color: isWorking
                ? colors.success
                : colors.danger,
              borderColor: isWorking
                ? colors.success
                : colors.danger,
            }}
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

        const bg =
          currentVal === "paid"
            ? colors.successLight
            : colors.warningLight;

        const text =
          currentVal === "paid"
            ? colors.success
            : colors.warning;

        return (
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider"
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
    {
      key: "generatePayslip",
      label: "Generate Payslip",
      width: "1.2fr",
      align: "center",
      render: (_, row) => (
        <Button
          size="sm"
          bg={colors.blue}
          text="#FFFFFF"
          onClick={async () => {
            try {
              const { data } = await axiosInstance.get(
                `/api/v1/payroll/slip/${row._id}`
              );

              if (data.success) {
                notify.success(
                  "Success",
                  "Payslip generated successfully."
                );

                // Optional: refresh table if required
                fetchData();
              }
            } catch (error) {
              notify.error(
                "Failed",
                error.response?.data?.message ||
                "Unable to generate payslip."
              );
            }
          }}
        >
          Generate
        </Button>
      ),
    },
    {
      key: "downloadPayslip",
      label: "Download Slip",
      width: "1.2fr",
      align: "center",
      render: (_, row) => (
        <Button
          size="sm"
          bg={colors.success}
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
              link.download = `${row.employeeName}_Payslip_${row.month}_${row.year}.pdf`;

              document.body.appendChild(link);
              link.click();
              link.remove();

              window.URL.revokeObjectURL(url);
            } catch (error) {
              notify.error(
                "Download Failed",
                error.response?.data?.message ||
                "Unable to download payslip."
              );
            }
          }}
        >
          Download
        </Button>
      ),
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
            bg={isPaid ? colors.danger : colors.success}
            text={colors.cardBg}
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
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6"
        style={{
          borderBottom: `1px solid ${colors.cardBorder}`,
        }}
      >
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Payroll{" "}
            <span style={{ color: colors.accent }}>
              Management
            </span>
          </h2>

          <p
            className="text-sm mt-1"
            style={{ color: colors.textSecondary }}
          >
            Manage, generate, and track employee compensation.
          </p>
        </div>

        <Button
          variant="custom"
          bg={colors.blue}
          text={colors.cardBg}
          icon={Plus}
          size="sm"
          onClick={() => setIsModalOpen(true)}
        >
          Generate Payroll
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={IndianRupee}
          iconBg={colors.accentLight}
          iconColor={colors.accentDark}
          value={
            loading
              ? "..."
              : `₹${(stats.grossPayroll || 0).toLocaleString()}`
          }
          label="Gross Payroll"
        />

        <StatsCard
          icon={Wallet}
          iconBg={colors.successLight}
          iconColor={colors.success}
          value={
            loading
              ? "..."
              : `₹${(stats.netPayout || 0).toLocaleString()}`
          }
          label="Net Payout"
        />

        <StatsCard
          icon={Users}
          iconBg={colors.blueLight}
          iconColor={colors.blue}
          value={loading ? "..." : stats.totalEmployees || 0}
          label="Employees Paid"
        />

        <StatsCard
          icon={Calendar}
          iconBg={colors.purpleLight}
          iconColor={colors.purple}
          value={loading ? "..." : stats.totalWorkingDays || 0}
          label="Total Working Days"
        />
      </div>

      {/* Table */}
      <div className="  rounded-xl flex-1 flex flex-col overflow-hidden mt-2">

        <div
          className="p-4 border-b  flex flex-col sm:flex-row items-center gap-4"
          style={{
            backgroundColor: colors.inputBg,
          }}
        >
          <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">


            <div className="w-full lg:max-w-md">
              <SearchBar
                placeholder="Search employee..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>


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


              <Button
                size="sm"
                bg={colors.orange}
                text={colors.cardBg}
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
                    link.download = "payroll-report.csv";

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
                bg={colors.purple}
                text={colors.cardBg}
                onClick={() => setSalaryHistoryOpen(true)}
              >
                Salary History
              </Button>

              {/* Mark Paid */}
              <Button
                size="sm"
                bg={colors.success}
                text={colors.cardBg}
                disabled={selectedEmployees.length === 0}
                onClick={() => handleBulkStatusUpdate("paid")}
              >
                Mark Paid ({selectedEmployees.length})
              </Button>
            </div>
          </div>
        </div>


        <div className="w-full overflow-x-auto">
          <div className="min-w-[2000px]">
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
      </div>

      {/* Modals */}
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
