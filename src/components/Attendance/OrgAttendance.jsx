/* eslint-disable react-hooks/set-state-in-effect */
// import React, { useState, useEffect, useCallback } from "react";
// import { CheckCircle, XCircle, AlertCircle, Users } from "lucide-react";
// import axiosInstance from "../../api/axiosInstance";
// import StatsCard from "../ui/StatsCard";
// import DataTable from "../ui/DataTable";
// import SearchBar from "../ui/SearchBar";

// export default function OrgAttendance() {
//   const [orgStats, setOrgStats] = useState({
//     present: { count: 0 },
//     late: { count: 0 },
//     absent: { count: 0 },
//     attendanceRate: "0%",
//   });
//   const [allRecords, setAllRecords] = useState([]);
//   const [loadingOrg, setLoadingOrg] = useState(false);

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [monthFilter, setMonthFilter] = useState(() => {
//     const now = new Date();
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
//   });

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearch(searchQuery);
//       setPage(1);
//     }, 500);
//     return () => clearTimeout(handler);
//   }, [searchQuery]);

//   const fetchOrgData = useCallback(async () => {
//     try {
//       setLoadingOrg(true);
//       const [year, monthNum] = monthFilter.split("-");

//       const [statsRes, listRes] = await Promise.allSettled([
//         axiosInstance.get(
//           `/api/v1/attendance/stats?month=${parseInt(monthNum)}&year=${year}`,
//         ),
//         axiosInstance.get(
//           `/api/v1/attendance/all?page=${page}&limit=10&search=${debouncedSearch}&month=${monthFilter}&status=${statusFilter}`,
//         ),
//       ]);

//       if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
//         setOrgStats(statsRes.value.data.data);
//       }
//       if (listRes.status === "fulfilled" && listRes.value.data.success) {
//         setAllRecords(listRes.value.data.data.records || []);
//         setTotalPages(listRes.value.data.data.totalPages || 1);
//       }
//     } catch (error) {
//       console.error("Failed to fetch org attendance data", error);
//     } finally {
//       setLoadingOrg(false);
//     }
//   }, [page, debouncedSearch, monthFilter, statusFilter]);

//   useEffect(() => {
//     fetchOrgData();
//   }, [fetchOrgData]);

//   const columns = [
//     {
//       key: "employee",
//       label: "Employee",
//       width: "2fr",
//       align: "left",
//       render: (_, row) => (
//         <div className="min-w-0 overflow-hidden">
//           <p className="text-sm font-bold text-text-primary truncate">
//             {row.user?.firstName} {row.user?.lastName}
//           </p>
//           <p className="text-xs text-text-secondary truncate font-mono">
//             {row.user?.employeeId}
//           </p>
//         </div>
//       ),
//     },
//     {
//       key: "date",
//       label: "Date",
//       width: "1fr",
//       align: "left",
//       render: (_, row) => (
//         <span className="text-sm text-text-primary">
//           {new Date(row.date).toLocaleDateString()}
//         </span>
//       ),
//     },
//     {
//       key: "checkIn",
//       label: "Check In",
//       width: "1fr",
//       align: "center",
//       render: (_, row) => (
//         <span className="text-sm font-medium text-text-secondary">
//           {row.checkIn || "--:--"}
//         </span>
//       ),
//     },
//     {
//       key: "status",
//       label: "Status",
//       width: "1fr",
//       align: "center",
//       render: (val) => {
//         let style = "bg-gray-500/10 text-gray-400 border-gray-500/20";
//         if (val === "present")
//           style = "bg-green-500/10 text-green-400 border-green-500/30";
//         else if (val === "absent")
//           style = "bg-red-500/10 text-red-400 border-red-500/30";
//         else if (val === "late" || val === "half-day")
//           style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";

//         return (
//           <span
//             className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${style}`}
//           >
//             {val || "Unknown"}
//           </span>
//         );
//       },
//     },
//     {
//       key: "notes",
//       label: "Remarks",
//       width: "1.5fr",
//       align: "left",
//       render: (val) => (
//         <span className="text-xs text-text-secondary truncate block max-w-[150px]">
//           {val || "-"}
//         </span>
//       ),
//     },
//   ];

//   return (
//     <div className="pt-8 border-t border-card-border mt-4 w-full">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-text-primary">
//           Organization <span className="text-accent">Overview</span>
//         </h2>
//         <p className="text-sm text-text-secondary mt-1">
//           Manage and track company-wide attendance records.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//         <StatsCard
//           icon={CheckCircle}
//           iconBg="bg-green-500/10"
//           iconColor="text-green-400"
//           value={loadingOrg ? "..." : orgStats.present?.count || 0}
//           label="Total Present"
//         />
//         <StatsCard
//           icon={AlertCircle}
//           iconBg="bg-yellow-500/10"
//           iconColor="text-yellow-400"
//           value={loadingOrg ? "..." : orgStats.late?.count || 0}
//           label="Total Late"
//         />
//         <StatsCard
//           icon={XCircle}
//           iconBg="bg-red-500/10"
//           iconColor="text-red-400"
//           value={loadingOrg ? "..." : orgStats.absent?.count || 0}
//           label="Total Absent"
//         />
//         <StatsCard
//           icon={Users}
//           iconBg="bg-blue-500/10"
//           iconColor="text-blue-400"
//           value={loadingOrg ? "..." : orgStats.attendanceRate || "0%"}
//           label="Avg Attendance Rate"
//         />
//       </div>

//       {/* 🚨 FIX: Enhanced Unified Filter Bar */}
//       <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 bg-card/40 border border-card-border rounded-2xl mb-4">
//         {/* Left Side: Month & Status Filters */}
//         <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
//           <input
//             type="month"
//             value={monthFilter}
//             onChange={(e) => setMonthFilter(e.target.value)}
//             className="w-full sm:w-auto bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors cursor-pointer"
//           />
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="w-full sm:w-auto bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors cursor-pointer"
//           >
//             <option value="">All Statuses</option>
//             <option value="present">Present</option>
//             <option value="late">Late</option>
//             <option value="absent">Absent</option>
//           </select>
//         </div>

//         {/* Right Side: Search Bar given proper width to prevent wrapping */}
//         <div className="w-full xl:w-[450px] flex justify-end">
//           <SearchBar
//             placeholder="Search employee..."
//             value={searchQuery}
//             onChange={(val) => setSearchQuery(val)}
//             width="100%"
//           />
//         </div>
//       </div>

//       <div className="flex-1 -mt-4">
//         <DataTable
//           columns={columns}
//           data={allRecords}
//           loading={loadingOrg}
//           paginationMode="server"
//           page={page}
//           totalPages={totalPages}
//           onPageChange={setPage}
//         />
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect, useCallback } from "react";
// import {
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Users,
//   Sunrise,
// } from "lucide-react"; // 🚨 Imported Sunrise icon for Half Day
// import axiosInstance from "../../api/axiosInstance";
// import StatsCard from "../ui/StatsCard";
// import DataTable from "../ui/DataTable";
// import SearchBar from "../ui/SearchBar";

// export default function OrgAttendance() {
//   const [orgStats, setOrgStats] = useState({
//     present: { count: 0 },
//     late: { count: 0 },
//     absent: { count: 0 },
//     halfDay: { count: 0 }, // 🚨 Added halfDay to initial state
//     attendanceRate: "0%",
//   });
//   const [allRecords, setAllRecords] = useState([]);
//   const [loadingOrg, setLoadingOrg] = useState(false);

//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [monthFilter, setMonthFilter] = useState(() => {
//     const now = new Date();
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
//   });

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearch(searchQuery);
//       setPage(1);
//     }, 500);
//     return () => clearTimeout(handler);
//   }, [searchQuery]);

//   const fetchOrgData = useCallback(async () => {
//     try {
//       setLoadingOrg(true);
//       const [year, monthNum] = monthFilter.split("-");

//       const [statsRes, listRes] = await Promise.allSettled([
//         axiosInstance.get(
//           `/api/v1/attendance/stats?month=${parseInt(monthNum)}&year=${year}`,
//         ),
//         axiosInstance.get(
//           `/api/v1/attendance/all?page=${page}&limit=10&search=${debouncedSearch}&month=${monthFilter}&status=${statusFilter}`,
//         ),
//       ]);

//       if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
//         setOrgStats(statsRes.value.data.data);
//       }
//       if (listRes.status === "fulfilled" && listRes.value.data.success) {
//         setAllRecords(listRes.value.data.data.records || []);
//         setTotalPages(listRes.value.data.data.totalPages || 1);
//       }
//     } catch (error) {
//       console.error("Failed to fetch org attendance data", error);
//     } finally {
//       setLoadingOrg(false);
//     }
//   }, [page, debouncedSearch, monthFilter, statusFilter]);

//   useEffect(() => {
//     fetchOrgData();
//   }, [fetchOrgData]);

//   const columns = [
//     {
//       key: "employee",
//       label: "Employee",
//       width: "2fr",
//       align: "left",
//       render: (_, row) => (
//         <div className="min-w-0 overflow-hidden">
//           <p className="text-sm font-bold text-text-primary truncate">
//             {row.user?.firstName} {row.user?.lastName}
//           </p>
//           <p className="text-xs text-text-secondary truncate font-mono">
//             {row.user?.employeeId}
//           </p>
//         </div>
//       ),
//     },
//     {
//       key: "date",
//       label: "Date",
//       width: "1fr",
//       align: "left",
//       render: (_, row) => (
//         <span className="text-sm text-text-primary">
//           {new Date(row.date).toLocaleDateString()}
//         </span>
//       ),
//     },
//     {
//       key: "checkIn",
//       label: "Check In",
//       width: "1fr",
//       align: "center",
//       render: (_, row) => (
//         <span className="text-sm font-medium text-text-secondary">
//           {row.checkIn || "--:--"}
//         </span>
//       ),
//     },
//     {
//       key: "status",
//       label: "Status",
//       width: "1fr",
//       align: "center",
//       render: (val) => {
//         let style = "bg-gray-500/10 text-gray-400 border-gray-500/20";
//         const currentVal = val?.toLowerCase() || "";

//         if (currentVal === "present")
//           style = "bg-green-500/10 text-green-400 border-green-500/30";
//         else if (currentVal === "absent")
//           style = "bg-red-500/10 text-red-400 border-red-500/30";
//         else if (currentVal === "late")
//           style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
//         // 🚨 Added Half-Day coloring styling
//         else if (currentVal === "halfday" || currentVal === "half-day")
//           style = "bg-orange-500/10 text-orange-400 border-orange-500/30";

//         let displayText = val || "Unknown";
//         if (currentVal === "halfday") displayText = "Half Day";

//         return (
//           <span
//             className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${style}`}
//           >
//             {displayText}
//           </span>
//         );
//       },
//     },
//     {
//       key: "notes",
//       label: "Remarks",
//       width: "1.5fr",
//       align: "left",
//       render: (val) => (
//         <span className="text-xs text-text-secondary truncate block max-w-[150px]">
//           {val || "-"}
//         </span>
//       ),
//     },
//   ];

//   return (
//     <div className="pt-8 border-t border-card-border mt-4 w-full">
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold text-text-primary">
//           Organization <span className="text-accent">Overview</span>
//         </h2>
//         <p className="text-sm text-text-secondary mt-1">
//           Manage and track company-wide attendance records.
//         </p>
//       </div>

//       {/* 🚨 FIX: 5-Column Grid with the New Half Day stat mapped directly from your API payload */}
//       <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
//         <StatsCard
//           icon={CheckCircle}
//           iconBg="bg-green-500/10"
//           iconColor="text-green-400"
//           value={loadingOrg ? "..." : orgStats.present?.count || 0}
//           label="Present"
//         />
//         <StatsCard
//           icon={AlertCircle}
//           iconBg="bg-yellow-500/10"
//           iconColor="text-yellow-400"
//           value={loadingOrg ? "..." : orgStats.late?.count || 0}
//           label="Late"
//         />
//         {/* NEW HALF DAY CARD */}
//         <StatsCard
//           icon={Sunrise}
//           iconBg="bg-orange-500/10"
//           iconColor="text-orange-400"
//           value={loadingOrg ? "..." : orgStats.halfDay?.count || 0}
//           label="Half Day"
//         />
//         <StatsCard
//           icon={XCircle}
//           iconBg="bg-red-500/10"
//           iconColor="text-red-400"
//           value={loadingOrg ? "..." : orgStats.absent?.count || 0}
//           label="Absent"
//         />
//         <StatsCard
//           icon={Users}
//           iconBg="bg-blue-500/10"
//           iconColor="text-blue-400"
//           value={loadingOrg ? "..." : orgStats.attendanceRate || "0%"}
//           label="Avg Rate"
//         />
//       </div>

//       <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 bg-card/40 border border-card-border rounded-2xl mb-4">
//         <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
//           <input
//             type="month"
//             value={monthFilter}
//             onChange={(e) => setMonthFilter(e.target.value)}
//             className="w-full sm:w-auto bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors cursor-pointer"
//           />
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="w-full sm:w-auto bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors cursor-pointer"
//           >
//             <option value="">All Statuses</option>
//             <option value="present">Present</option>
//             <option value="late">Late</option>
//             {/* 🚨 Added Half Day to the filter dropdown */}
//             <option value="halfDay">Half Day</option>
//             <option value="absent">Absent</option>
//           </select>
//         </div>

//         <div className="w-full xl:w-[450px] flex justify-end">
//           <SearchBar
//             placeholder="Search employee..."
//             value={searchQuery}
//             onChange={(val) => setSearchQuery(val)}
//             width="100%"
//           />
//         </div>
//       </div>

//       <div className="flex-1 -mt-4">
//         <DataTable
//           columns={columns}
//           data={allRecords}
//           loading={loadingOrg}
//           paginationMode="server"
//           page={page}
//           totalPages={totalPages}
//           onPageChange={setPage}
//         />
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Sunrise,
  Edit2, // 🚨 Imported Edit icon
  X, // Imported X for Modal
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import StatsCard from "../ui/StatsCard";
import DataTable from "../ui/DataTable";
import SearchBar from "../ui/SearchBar";
import Button from "../ui/Button"; // Reusable Button component
import useNotification from "../../hooks/useNotification.jsx";
import EditAttendanceModal from "./EditAttendenceModal.jsx";

// 2. MAIN COMPONENT: ORG ATTENDANCE
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

  // ─── TABLE COLUMNS ───
  const columns = [
    {
      key: "employee",
      label: "Employee",
      width: "2fr",
      align: "left",
      render: (_, row) => (
        <div className="min-w-0 overflow-hidden">
          <p className="text-sm font-bold text-text-primary truncate">
            {row.user?.firstName} {row.user?.lastName}
          </p>
          <p className="text-xs text-text-secondary truncate font-mono">
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
        <span className="text-sm text-text-primary">
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
        // 🚨 APPLY THE UTC->IST CONVERSION HERE
        const istCheckIn = convertUtcToIst(row.checkIn);
        const istCheckOut = convertUtcToIst(row.checkOut);

        return (
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-text-primary">
              {istCheckIn || "--:--"}
            </span>
            <span className="text-[10px] text-text-secondary">
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
        let style = "bg-gray-500/10 text-gray-400 border-gray-500/20";
        const currentVal = val?.toLowerCase() || "";

        if (currentVal === "present")
          style = "bg-green-500/10 text-green-400 border-green-500/30";
        else if (currentVal === "absent")
          style = "bg-red-500/10 text-red-400 border-red-500/30";
        else if (currentVal === "late")
          style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
        else if (currentVal === "halfday" || currentVal === "half_day")
          style = "bg-orange-500/10 text-orange-400 border-orange-500/30";

        let displayText = val || "Unknown";
        if (currentVal === "half_day" || currentVal === "halfday")
          displayText = "Half Day";

        return (
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${style}`}
          >
            {displayText}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Action",
      width: "0.5fr",
      align: "right",
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setEditingRecord(row);
            setIsModalOpen(true);
          }}
          className="p-1.5 text-text-secondary hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          title="Edit Timesheet"
        >
          <Edit2 size={16} />
        </button>
      ),
    },
  ];
  return (
    <div className="pt-8 border-t border-card-border mt-4 w-full">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">
          Organization <span className="text-accent">Overview</span>
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Manage and track company-wide attendance records.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard
          icon={CheckCircle}
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
          value={loadingOrg ? "..." : orgStats.present?.count || 0}
          label="Present"
        />
        <StatsCard
          icon={AlertCircle}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-400"
          value={loadingOrg ? "..." : orgStats.late?.count || 0}
          label="Late"
        />
        <StatsCard
          icon={Sunrise}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-400"
          value={loadingOrg ? "..." : orgStats.halfDay?.count || 0}
          label="Half Day"
        />
        <StatsCard
          icon={XCircle}
          iconBg="bg-red-500/10"
          iconColor="text-red-400"
          value={loadingOrg ? "..." : orgStats.absent?.count || 0}
          label="Absent"
        />
        <StatsCard
          icon={Users}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          value={loadingOrg ? "..." : orgStats.attendanceRate || "0%"}
          label="Avg Rate"
        />
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 bg-card/40 border border-card-border rounded-2xl mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full sm:w-auto bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors cursor-pointer"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="half_day">Half Day</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        <div className="w-full xl:w-[450px] flex justify-end">
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

      {/* MODAL */}
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
    </div>
  );
}
