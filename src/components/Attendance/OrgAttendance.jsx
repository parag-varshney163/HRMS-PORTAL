import { CheckCircle, XCircle, AlertCircle, Users, Sunrise, Edit2, // 🚨 Imported Edit icon
X, UserX, // Imported X for Modal
 } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

import EmployeeAttendanceHistoryModal from "./EmployeeAttendanceHistoryModal.jsx";
import useNotification from "../../hooks/useNotification.jsx";
import MarkAttendanceModal from "./MarkAttendanceModal.jsx";
import EditAttendanceModal from "./EditAttendenceModal.jsx";
import ForceAbsentModal from "./ForceAbsentModal.jsx";
import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors.js";
import StatsCard from "../ui/StatsCard";
import SearchBar from "../ui/SearchBar";
import DataTable from "../ui/DataTable";
import Button from "../ui/Button"; // Reusable Button component


// Reusable Button component


// Reusable Button component


// Reusable Button component


// Reusable Button component


// Reusable Button component
// ─────────────────────────────────────────────────────────────────────────────
export default function OrgAttendance() {
  const notify = useNotification();

  const [orgStats, setOrgStats] = useState({
    present: { count: 0 },
    late: { count: 0 },
    absent: { count: 0 },
    halfDay: { count: 0 },
    attendanceRate: "0%",
  });

  const [allRecords, setAllRecords] = useState([]);
  const [loadingOrg, setLoadingOrg] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [forceAbsentModal, setForceAbsentModal] = useState(false);
  const [selecteEmployeeId, setSelecteEmployeeId] = useState(null);
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Data Orchestrator
  const fetchOrgData = useCallback(async () => {
    try {
      setLoadingOrg(true);
      const [year, monthNum] = monthFilter.split("-");

      const [statsRes, listRes] = await Promise.allSettled([
        axiosInstance.get(
          `/api/v1/attendance/stats?month=${parseInt(monthNum)}&year=${year}`,
        ),
        axiosInstance.get(
          `/api/v1/attendance/all?page=${page}&limit=10&search=${debouncedSearch}&month=${monthFilter}&status=${statusFilter}`,
        ),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        setOrgStats(statsRes.value.data.data);
      }

      if (listRes.status === "fulfilled" && listRes.value.data.success) {
        setAllRecords(listRes.value.data.data.records || []);
        setTotalPages(listRes.value.data.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch org attendance data", error);
    } finally {
      setLoadingOrg(false);
    }
  }, [page, debouncedSearch, monthFilter, statusFilter]);

  useEffect(() => {
    fetchOrgData();
  }, [fetchOrgData]);

  // ─── API: UPDATE ATTENDANCE TIMES ───
  const handleSaveTimes = async (recordId, payload) => {
    try {
      // API expects: { "checkInTime": "09:15", "checkOutTime": "18:30" }
      const { data } = await axiosInstance.put(
        `/api/v1/attendance/edit/${recordId}`,
        payload,
      );

      if (data.success) {
        notify.success("Updated", "Employee timesheet has been adjusted.");
        setIsModalOpen(false);
        fetchOrgData(); // Refresh table to show new times and recalculated status
      }
    } catch (error) {
      notify.error(
        "Update Failed",
        error.response?.data?.message || "Could not update timesheet.",
      );
    }
  };

  // ─── HELPER: UTC TO IST CONVERTER ───
  // Takes a string like "06:32" (UTC) and returns "12:02" (IST)
  const convertUtcToIst = (timeString) => {
    if (!timeString) return null;

    try {
      const [hoursStr, minutesStr] = timeString.split(":");
      let hours = parseInt(hoursStr, 10);
      let minutes = parseInt(minutesStr, 10);

      // Add 5 hours and 30 minutes for IST
      hours += 5;
      minutes += 30;

      // Handle minute overflow
      if (minutes >= 60) {
        minutes -= 60;
        hours += 1;
      }

      // Handle hour overflow (past midnight)
      if (hours >= 24) {
        hours -= 24;
      }

      // Format back to "HH:MM"
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");

      return `${formattedHours}:${formattedMinutes}`;
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      return timeString; // Fallback to original if parsing fails
    }
  };
  const columns = [
    {
      key: "employee",
      label: "Employee",
      width: "2fr",
      align: "left",
      render: (_, row) => (
        <div className="min-w-0 overflow-hidden">
          <p
            className="text-sm font-bold truncate"
            style={{ color: colors.textPrimary }}
          >
            {row.user?.firstName} {row.user?.lastName}
          </p>

          <p
            className="text-xs truncate font-mono"
            style={{ color: colors.textSecondary }}
          >
            {row.user?.employeeId}
          </p>
        </div>
      ),
    },

    {
      key: "date",
      label: "Date",
      width: "1fr",
      align: "left",
      render: (_, row) => (
        <span
          className="text-sm"
          style={{ color: colors.textPrimary }}
        >
          {new Date(row.date).toLocaleDateString()}
        </span>
      ),
    },

    {
      key: "times",
      label: "In / Out",
      width: "1.2fr",
      align: "center",
      render: (_, row) => {
        const istCheckIn = convertUtcToIst(row.checkIn);
        const istCheckOut = convertUtcToIst(row.checkOut);

        return (
          <div className="flex flex-col items-center">
            <span
              className="text-sm font-medium"
              style={{ color: colors.textPrimary }}
            >
              {istCheckIn || "--:--"}
            </span>

            <span
              className="text-[10px]"
              style={{ color: colors.textSecondary }}
            >
              {istCheckOut || "Working..."}
            </span>
          </div>
        );
      },
    },

    {
      key: "status",
      label: "Status",
      width: "1fr",
      align: "center",
      render: (val) => {
        const currentVal = val?.toLowerCase() || "";

        let badgeStyle = {
          background: colors.inputBg,
          color: colors.textSecondary,
          border: `1px solid ${colors.cardBorder}`,
        };

        if (currentVal === "present") {
          badgeStyle = {
            background: colors.successLight,
            color: colors.success,
            border: `1px solid ${colors.success}`,
          };
        } else if (currentVal === "absent") {
          badgeStyle = {
            background: colors.dangerLight,
            color: colors.danger,
            border: `1px solid ${colors.danger}`,
          };
        } else if (currentVal === "late") {
          badgeStyle = {
            background: colors.warningLight,
            color: colors.warning,
            border: `1px solid ${colors.warning}`,
          };
        } else if (
          currentVal === "halfday" ||
          currentVal === "half_day"
        ) {
          badgeStyle = {
            background: colors.orangeLight,
            color: colors.orange,
            border: `1px solid ${colors.orange}`,
          };
        }

        let displayText = val || "Unknown";

        if (
          currentVal === "halfday" ||
          currentVal === "half_day"
        ) {
          displayText = "Half Day";
        }

        return (
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider"
            style={badgeStyle}
          >
            {displayText}
          </span>
        );
      },
    },

    {
      key: "actions",
      label: "Action",
      width: "1fr",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          {/* Force Absent */}
          <button
            onClick={() => {
              setSelecteEmployeeId(
                row.userId || row.employeeId || row.user?._id
              );
              setForceAbsentModal(true);
            }}
            title="Force Mark Absent"
            className="p-2 rounded-xl transition hover:opacity-80"
            style={{
              background: colors.dangerLight,
              color: colors.danger,
            }}
          >
            <UserX size={18} />
          </button>

          {/* Edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingRecord(row);
              setIsModalOpen(true);
            }}
            title="Edit Timesheet"
            className="p-2 rounded-xl transition hover:opacity-80"
            style={{
              background: colors.blueLight,
              color: colors.blue,
            }}
          >
            <Edit2 size={16} />
          </button>

          {/* View All */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEmployeeId(row.user?._id);
              setHistoryModalOpen(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl transition hover:opacity-80"
            style={{
              background: colors.accentLight,
              color: colors.accentDark,
              border: `1px solid ${colors.accent}`,
            }}
          >
            View All
          </button>
        </div>
      ),
    },
  ];
  return (
    <div
      className="pt-8 mt-4 w-full"
      style={{
        borderTop: `1px solid ${colors.cardBorder}`,
      }}
    >
      {/* HEADER */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold"
          style={{ color: colors.textPrimary }}
        >
          Organization{" "}
          <span style={{ color: colors.accent }}>
            Overview
          </span>
        </h2>

        <p
          className="text-sm mt-1"
          style={{ color: colors.textSecondary }}
        >
          Manage and track company-wide attendance records.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard
          icon={CheckCircle}
          iconBg={colors.successLight}
          iconColor={colors.success}
          value={loadingOrg ? "..." : orgStats.present?.count || 0}
          label="Present"
        />

        <StatsCard
          icon={AlertCircle}
          iconBg={colors.warningLight}
          iconColor={colors.warning}
          value={loadingOrg ? "..." : orgStats.late?.count || 0}
          label="Late"
        />

        <StatsCard
          icon={Sunrise}
          iconBg={colors.orangeLight}
          iconColor={colors.orange}
          value={loadingOrg ? "..." : orgStats.halfDay?.count || 0}
          label="Half Day"
        />

        <StatsCard
          icon={XCircle}
          iconBg={colors.dangerLight}
          iconColor={colors.danger}
          value={loadingOrg ? "..." : orgStats.absent?.count || 0}
          label="Absent"
        />

        <StatsCard
          icon={Users}
          iconBg={colors.blueLight}
          iconColor={colors.blue}
          value={loadingOrg ? "..." : orgStats.attendanceRate || "0%"}
          label="Avg Rate"
        />
      </div>

      {/* CONTROLS */}
      <div
        className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 rounded-2xl mb-4"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm outline-none transition-colors cursor-pointer"
            style={{
              background: colors.inputBg,
              color: colors.textPrimary,
              border: `1px solid ${colors.cardBorder}`,
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm outline-none transition-colors cursor-pointer"
            style={{
              background: colors.inputBg,
              color: colors.textPrimary,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="half_day">Half Day</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        <div className="w-full xl:w-[450px] flex justify-end gap-6">
          <Button
            variant="custom"
            bg={colors.blue}
            text="#fff"
            icon={CheckCircle}
            size="sm"
            onClick={() => setMarkAttendanceOpen(true)}
          >
            +Attendance
          </Button>
          <SearchBar
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            width="100%"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 -mt-4">
        <DataTable
          columns={columns}
          data={allRecords}
          loading={loadingOrg}
          paginationMode="server"
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* EDIT ATTENDANCE MODAL */}
      <EditAttendanceModal
        key={isModalOpen ? editingRecord?._id : "closed"}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveTimes}
        record={editingRecord}
      />

      {/* HISTORY MODAL */}
      <EmployeeAttendanceHistoryModal
        open={historyModalOpen}
        employeeId={selectedEmployeeId}
        onClose={() => {
          setHistoryModalOpen(false);
          setSelectedEmployeeId(null);
        }}
      />

      {/* FORCE ABSENT MODAL */}
      <ForceAbsentModal
        open={forceAbsentModal}
        onClose={() => setForceAbsentModal(false)}
        employeeId={selecteEmployeeId}
        onSuccess={fetchOrgData}
      />
      <MarkAttendanceModal
        open={markAttendanceOpen}
        onClose={() => setMarkAttendanceOpen(false)}
        onSuccess={fetchOrgData}
      />
    </div>
  );
}
