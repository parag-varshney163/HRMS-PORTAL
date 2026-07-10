import { Calendar, Clock, CheckCircle2, AlertCircle, XCircle, TrendingUp, } from "lucide-react";
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";

import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";
import DataTable from "../ui/DataTable";


// ─── 🚨 FIXED: UTC to IST Converter (Adds 5:30) ───
const convertUtcToIst = (timeString) => {
  if (!timeString) return "";
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

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  } catch (e) {
    return timeString;
  }
};

const EmployeeAttendanceRecords = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: "",
  });


  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { month, year, status } = filters;
      let url = `/api/v1/attendance/user?month=${month}&year=${year}`;
      if (status) url += `&status=${status}`;

      const res = await axiosInstance.get(url);
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        if (res.data?.message?.includes("No attendance records")) {
          setData({
            attendances: [],
            presentCount: 0,
            lateArrivals: 0,
            absentCount: 0,
            attendanceRate: 0,
          });
        } else {
          setError(res.data?.message || "Failed to fetch attendance data.");
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message;
      if (errorMsg?.includes("No attendance records")) {
        setData({
          attendances: [],
          presentCount: 0,
          lateArrivals: 0,
          absentCount: 0,
          attendanceRate: 0,
        });
      } else {
        console.error("Error fetching attendance records:", err);
        setError("Something went wrong while fetching data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // const stats = [
  //   {
  //     label: "Attendance Rate",
  //     value: `${data?.attendanceRate || 0}%`,
  //     icon: TrendingUp,
  //     color: "text-blue-400",
  //     bg: "bg-blue-400/10",
  //   },
  //   {
  //     label: "Present Days",
  //     value: data?.presentCount || 0,
  //     icon: CheckCircle2,
  //     color: "text-green-400",
  //     bg: "bg-green-400/10",
  //   },
  //   {
  //     label: "Late Arrivals",
  //     value: data?.lateArrivals || 0,
  //     icon: AlertCircle,
  //     color: "text-yellow-400",
  //     bg: "bg-yellow-400/10",
  //   },
  //   {
  //     label: "Absent Days",
  //     value: data?.absentCount || 0,
  //     icon: XCircle,
  //     color: "text-red-400",
  //     bg: "bg-red-400/10",
  //   },
  // ];

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "present":
  //       return "bg-green-500/20 text-green-400";
  //     case "absent":
  //       return "bg-red-500/20 text-red-400";
  //     case "late":
  //       return "bg-yellow-500/20 text-yellow-400";
  //     case "half_day":
  //       return "bg-orange-500/20 text-orange-400";
  //     case "on_leave":
  //       return "bg-blue-500/20 text-blue-400";
  //     default:
  //       return "bg-gray-500/20 text-gray-400";
  //   }
  // };

  // // ─── 🚨 DATATABLE COLUMNS ───
  // const columns = [
  //   {
  //     key: "date",
  //     label: "Date",
  //     width: "1fr",
  //     align: "left",
  //     render: (_, row) => (
  //       <span className="text-sm font-medium text-text-primary">
  //         {new Date(row.date).toLocaleDateString("en-GB", {
  //           day: "numeric",
  //           month: "short",
  //           year: "numeric",
  //         })}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "checkIn",
  //     label: "Check In",
  //     width: "1fr",
  //     align: "center",
  //     render: (_, row) => (
  //       // Applied UTC to IST conversion here
  //       <span className="text-sm font-bold text-green-400">
  //         {convertUtcToIst(row.checkIn) || "--:--"}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "checkOut",
  //     label: "Check Out",
  //     width: "1fr",
  //     align: "center",
  //     render: (_, row) => (
  //       // Applied UTC to IST conversion here
  //       <span className="text-sm font-bold text-red-400">
  //         {convertUtcToIst(row.checkOut) || "--:--"}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "workedHours",
  //     label: "Worked Hours",
  //     width: "1fr",
  //     align: "center",
  //     render: (_, row) => (
  //       <span className="text-sm font-mono text-text-secondary">
  //         {row.totalWorkingHours || "-"}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "status",
  //     label: "Status",
  //     width: "1fr",
  //     align: "center",
  //     render: (val) => (
  //       <span
  //         className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(
  //           val,
  //         )}`}
  //       >
  //         {val?.replace("_", " ") || "Unknown"}
  //       </span>
  //     ),
  //   },
  //   {
  //     key: "notes",
  //     label: "Notes",
  //     width: "1.5fr",
  //     align: "left",
  //     render: (val) => (
  //       <span className="truncate block max-w-[200px] italic text-sm text-text-secondary">
  //         {val || "-"}
  //       </span>
  //     ),
  //   },
  // ];

  // return (
  //   <div className="flex flex-col gap-6">
  //     {/* ─── METRICS GRID ─── */}
  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  //       {stats.map((stat, i) => (
  //         <div
  //           key={i}
  //           className="bg-card border border-card-border p-5 rounded-2xl flex items-center gap-4 shadow-sm"
  //         >
  //           <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
  //             <stat.icon size={24} />
  //           </div>
  //           <div>
  //             <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">
  //               {stat.label}
  //             </p>
  //             <h4 className="text-2xl font-bold text-text-primary mt-1">
  //               {loading ? "..." : stat.value}
  //             </h4>
  //           </div>
  //         </div>
  //       ))}
  //     </div>

  //     {/* ─── FILTER BAR ─── */}
  //     <div className="bg-card border border-card-border p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
  //       <div className="flex items-center gap-2">
  //         <Calendar size={18} className="text-accent" />
  //         <h3 className="font-semibold text-text-primary">
  //           Attendance History
  //         </h3>
  //       </div>

  //       <div className="flex flex-wrap items-center gap-3">
  //         <select
  //           value={filters.status}
  //           onChange={(e) => setFilters({ ...filters, status: e.target.value })}
  //           className="bg-input border border-card-border text-text-primary text-sm rounded-xl px-3 py-2 outline-none focus:border-accent transition-colors cursor-pointer"
  //         >
  //           <option value="">All Statuses</option>
  //           <option value="present">Present</option>
  //           <option value="late">Late</option>
  //           <option value="half_day">Half Day</option>
  //           <option value="absent">Absent</option>
  //           <option value="on_leave">On Leave</option>
  //         </select>

  //         <input
  //           type="number"
  //           min="2000"
  //           max="2100"
  //           value={filters.year}
  //           onChange={(e) => setFilters({ ...filters, year: e.target.value })}
  //           className="bg-input border border-card-border text-text-primary text-sm rounded-xl px-3 py-2 outline-none focus:border-accent transition-colors w-24"
  //         />

  //         <select
  //           value={filters.month}
  //           onChange={(e) => setFilters({ ...filters, month: e.target.value })}
  //           className="bg-input border border-card-border text-text-primary text-sm rounded-xl px-3 py-2 outline-none focus:border-accent transition-colors cursor-pointer"
  //         >
  //           {Array.from({ length: 12 }).map((_, i) => (
  //             <option key={i + 1} value={i + 1}>
  //               {new Date(0, i).toLocaleString("default", { month: "long" })}
  //             </option>
  //           ))}
  //         </select>
  //       </div>
  //     </div>

  //     {/* ─── HISTORY TABLE (Using DataTable) ─── */}
  //     <div className="flex-1 -mt-2">
  //       {error ? (
  //         <div className="bg-red-400/5 text-red-400 border border-red-400/20 rounded-2xl p-8 flex flex-col items-center justify-center">
  //           <AlertCircle size={32} className="opacity-50 mb-2" />
  //           <p>{error}</p>
  //         </div>
  //       ) : (
  //         <DataTable
  //           columns={columns}
  //           data={data?.attendances || []}
  //           loading={loading}
  //           // Client side pagination assumes your API returns all items for that month
  //           paginationMode="client"
  //         />
  //       )}
  //     </div>
  //   </div>
  // );

  const stats = [
    {
      label: "Attendance Rate",
      value: `${data?.attendanceRate || 0}%`,
      icon: TrendingUp,
      color: colors.blue,
      bg: colors.blueLight,
    },
    {
      label: "Present Days",
      value: data?.presentCount || 0,
      icon: CheckCircle2,
      color: colors.success,
      bg: colors.successLight,
    },
    {
      label: "Late Arrivals",
      value: data?.lateArrivals || 0,
      icon: AlertCircle,
      color: colors.warning,
      bg: colors.warningLight,
    },
    {
      label: "Absent Days",
      value: data?.absentCount || 0,
      icon: XCircle,
      color: colors.danger,
      bg: colors.dangerLight,
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return {
          background: colors.successLight,
          color: colors.success,
        };

      case "absent":
        return {
          background: colors.dangerLight,
          color: colors.danger,
        };

      case "late":
        return {
          background: colors.warningLight,
          color: colors.warning,
        };

      case "half_day":
        return {
          background: colors.orangeLight,
          color: colors.orange,
        };

      case "on_leave":
        return {
          background: colors.blueLight,
          color: colors.blue,
        };

      default:
        return {
          background: colors.inputBg,
          color: colors.textSecondary,
        };
    }
  };

  // ─── DATATABLE COLUMNS ───
  const columns = [
    {
      key: "date",
      label: "Date",
      width: "1fr",
      align: "left",
      render: (_, row) => (
        <span
          className="text-sm font-medium"
          style={{ color: colors.textPrimary }}
        >
          {new Date(row.date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "checkIn",
      label: "Check In",
      width: "1fr",
      align: "center",
      render: (_, row) => (
        <span
          className="text-sm font-bold"
          style={{ color: colors.success }}
        >
          {(row.checkIn) || "--:--"}
        </span>
      ),
    },
    {
      key: "checkOut",
      label: "Check Out",
      width: "1fr",
      align: "center",
      render: (_, row) => (
        <span
          className="text-sm font-bold"
          style={{ color: colors.danger }}
        >
          {(row.checkOut) || "--:--"}
        </span>
      ),
    },
    {
      key: "workedHours",
      label: "Worked Hours",
      width: "1fr",
      align: "center",
      render: (_, row) => (
        <span
          className="text-sm font-mono"
          style={{ color: colors.textSecondary }}
        >
          {row.totalWorkingHours || "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "1fr",
      align: "center",
      render: (val) => {
        const statusStyle = getStatusColor(val);

        return (
          <span
            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: statusStyle.background,
              color: statusStyle.color,
            }}
          >
            {val?.replace("_", " ") || "Unknown"}
          </span>
        );
      },
    },
    {
      key: "notes",
      label: "Notes",
      width: "1.5fr",
      align: "left",
      render: (val) => (
        <span
          className="truncate block max-w-[200px] italic text-sm"
          style={{ color: colors.textSecondary }}
        >
          {val || "-"}
        </span>
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      {/* ─── METRICS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl flex items-center gap-4 shadow-sm"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <div
              className="p-3 rounded-xl flex items-center justify-center"
              style={{
                background: stat.bg,
                color: stat.color,
              }}
            >
              <stat.icon size={24} />
            </div>

            <div>
              <p
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                {stat.label}
              </p>

              <h4
                className="text-2xl font-bold mt-1"
                style={{ color: colors.textPrimary }}
              >
                {loading ? "..." : stat.value}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* ─── FILTER BAR ─── */}
      <div
        className="p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <div className="flex items-center gap-2">
          <Calendar
            size={18}
            style={{ color: colors.accent }}
          />

          <h3
            className="font-semibold"
            style={{ color: colors.textPrimary }}
          >
            Attendance History
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value,
              })
            }
            className="text-sm rounded-xl px-3 py-2 outline-none cursor-pointer transition-colors"
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
            <option value="on_leave">On Leave</option>
          </select>

          <input
            type="number"
            min="2000"
            max="2100"
            value={filters.year}
            onChange={(e) =>
              setFilters({
                ...filters,
                year: e.target.value,
              })
            }
            className="text-sm rounded-xl px-3 py-2 outline-none w-24 transition-colors"
            style={{
              background: colors.inputBg,
              color: colors.textPrimary,
              border: `1px solid ${colors.cardBorder}`,
            }}
          />

          <select
            value={filters.month}
            onChange={(e) =>
              setFilters({
                ...filters,
                month: e.target.value,
              })
            }
            className="text-sm rounded-xl px-3 py-2 outline-none cursor-pointer transition-colors"
            style={{
              background: colors.inputBg,
              color: colors.textPrimary,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── HISTORY TABLE ─── */}
      <div className="flex-1 -mt-2">
        {error ? (
          <div
            className="rounded-2xl p-8 flex flex-col items-center justify-center"
            style={{
              background: colors.dangerLight,
              border: `1px solid ${colors.danger}`,
              color: colors.danger,
            }}
          >
            <AlertCircle
              size={32}
              className="mb-2"
              style={{ opacity: 0.6 }}
            />

            <p>{error}</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.attendances || []}
            loading={loading}
            paginationMode="client"
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendanceRecords;
