import { X, CalendarDays, Clock3, User2, Mail, Phone, ShieldCheck, Download, } from "lucide-react";
// EmployeeAttendanceHistoryModal.jsx
import React, { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";


const statusStyles = {
  present:
    "bg-green-500/10 text-green-400 border border-green-500/20",
  absent:
    "bg-red-500/10 text-red-400 border border-red-500/20",
  late:
    "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  half_day:
    "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  on_leave:
    "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

export default function EmployeeAttendanceHistoryModal({
  open,
  onClose,
  employeeId,
}) {
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
const [selectedMonth, setSelectedMonth] = useState("");
const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    if (!open || !employeeId) return;

    fetchEmployeeAttendance();
  }, [open, employeeId]);
 const handleDownloadAttendance = async () => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/attendance/employee-attendance/download/${employeeId}`,
      {
        params: {
          ...(selectedStatus && { status: selectedStatus }),
          ...(selectedMonth && { month: selectedMonth }),
          ...(selectedYear && { year: selectedYear }),
        },
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], {
      type: "text/csv",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    link.setAttribute(
      "download",
      `${employee?.firstName || "employee"}-attendance.csv`
    );

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed", error);
  }
};

  const fetchEmployeeAttendance = async () => {
    try {
      setLoading(true);

      const { data } = await axiosInstance.get(
        `/api/v1/attendance/employee-attendance/${employeeId}`
      );

      if (data.success) {
        setAttendanceData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch attendance history", error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const employee = attendanceData?.employee;
  const records = attendanceData?.attendances || [];
  // UTC -> IST converter
const convertUtcToIst = (timeString) => {
  if (!timeString) return "--";

  try {
    const [hoursStr, minutesStr] = timeString.split(":");

    let hours = parseInt(hoursStr, 10);
    let minutes = parseInt(minutesStr, 10);

    // Add IST offset (+5:30)
    hours += 5;
    minutes += 30;

    // Handle minute overflow
    if (minutes >= 60) {
      minutes -= 60;
      hours += 1;
    }

    // Handle hour overflow
    if (hours >= 24) {
      hours -= 24;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  } catch (error) {
    return timeString;
  }
};

//   return (
//     <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
//       <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl flex flex-col">
//         {/* HEADER */}
//         <div className="flex items-start justify-between p-6 border-b border-white/10">
//           <div>
//             <h2 className="text-2xl font-bold text-white">
//               Employee Attendance History
//             </h2>

//             <p className="text-sm text-gray-400 mt-1">
//               Last 90 days attendance records
//             </p>
//           </div>
        

//           <button
//             onClick={onClose}
//             className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
//           >
//             <X className="text-white" size={20} />
//           </button>
//         </div>
//         {/* FILTERS */}
// <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
//   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

//     {/* STATUS */}
//     <select
//       value={selectedStatus}
//       onChange={(e) => setSelectedStatus(e.target.value)}
//       className="bg-[#1F2937] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
//     >
//       <option value="">All Status</option>
//       <option value="present">Present</option>
//       <option value="absent">Absent</option>
//       <option value="late">Late</option>
//       <option value="half_day">Half Day</option>
//       <option value="on_leave">On Leave</option>
//     </select>

//     {/* MONTH */}
//     <input
//       type="month"
//       value={selectedMonth}
//       onChange={(e) => setSelectedMonth(e.target.value)}
//       className="bg-[#1F2937] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
//     />

//     {/* YEAR */}
//     <input
//       type="number"
//       placeholder="Year"
//       value={selectedYear}
//       onChange={(e) => setSelectedYear(e.target.value)}
//       className="bg-[#1F2937] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
//     />

//     {/* DOWNLOAD */}
//     <button
//       onClick={handleDownloadAttendance}
//       className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold transition"
//     >
//       <Download size={18} />
//       Download CSV
//     </button>

//   </div>
// </div>

//         {/* BODY */}
//         <div className="overflow-y-auto flex-1 p-6">
//           {loading ? (
//             <div className="h-[300px] flex items-center justify-center text-white">
//               Loading attendance history...
//             </div>
//           ) : (
//             <>
//               {/* EMPLOYEE INFO */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
//                 <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
//                   <div className="flex items-center gap-3 mb-4">
//                     <User2 className="text-cyan-400" size={20} />
//                     <h3 className="text-lg font-semibold text-white">
//                       Employee Details
//                     </h3>
//                   </div>

//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between gap-4">
//                       <span className="text-gray-400">Name</span>
//                       <span className="text-white font-medium">
//                         {employee?.firstName} {employee?.lastName}
//                       </span>
//                     </div>

//                     <div className="flex justify-between gap-4">
//                       <span className="text-gray-400">Employee ID</span>
//                       <span className="text-white font-medium">
//                         {employee?.employeeId}
//                       </span>
//                     </div>

//                     <div className="flex justify-between gap-4">
//                       <span className="text-gray-400 flex items-center gap-1">
//                         <Mail size={14} />
//                         Email
//                       </span>
//                       <span className="text-white font-medium">
//                         {employee?.email}
//                       </span>
//                     </div>

//                     <div className="flex justify-between gap-4">
//                       <span className="text-gray-400 flex items-center gap-1">
//                         <Phone size={14} />
//                         Phone
//                       </span>
//                       <span className="text-white font-medium">
//                         {employee?.phoneNumber}
//                       </span>
//                     </div>

//                     <div className="flex justify-between gap-4">
//                       <span className="text-gray-400 flex items-center gap-1">
//                         <ShieldCheck size={14} />
//                         Role
//                       </span>
//                       <span className="text-white font-medium uppercase">
//                         {employee?.role}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* STATS */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <StatCard
//                     title="Present"
//                     value={attendanceData?.presentCount || 0}
//                   />

//                   <StatCard
//                     title="Late"
//                     value={attendanceData?.lateCount || 0}
//                   />

//                   <StatCard
//                     title="Half Day"
//                     value={attendanceData?.halfDayCount || 0}
//                   />

//                   <StatCard
//                     title="Attendance Rate"
//                     value={`${attendanceData?.attendanceRate || 0}%`}
//                   />
//                 </div>
//               </div>

//               {/* TABLE */}
//               <div className="border border-white/10 rounded-2xl overflow-hidden">
//                 <div className="grid grid-cols-6 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-300">
//                   <div>Date</div>
//                   <div>Status</div>
//                   <div>Check In</div>
//                   <div>Check Out</div>
//                   <div>Working Hours</div>
//                   <div>Notes</div>
//                 </div>

//                 <div className="divide-y divide-white/5">
//                   {records.map((item) => (
//                     <div
//                       key={item._id}
//                       className="grid grid-cols-6 px-4 py-4 text-sm items-center hover:bg-white/[0.03] transition"
//                     >
//                       <div className="text-white flex items-center gap-2">
//                         <CalendarDays size={14} />
//                         {new Date(item.date).toLocaleDateString()}
//                       </div>

//                       <div>
//                         <span
//                           className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${
//                             statusStyles[item.status] ||
//                             "bg-gray-500/10 text-gray-400"
//                           }`}
//                         >
//                           {item.status?.replace("_", " ")}
//                         </span>
//                       </div>

//                       <div className="text-gray-300">
//                         {convertUtcToIst(item.checkIn || "--")}
//                       </div>

//                       <div className="text-gray-300">
//                         {convertUtcToIst(item.checkOut || "--")}
//                       </div>

//                       <div className="text-gray-300 flex items-center gap-2">
//                         <Clock3 size={14} />
//                         {item.totalWorkingHours || "--"}
//                       </div>

//                       <div
//                         className="text-gray-400 truncate max-w-[200px]"
//                         title={item.notes}
//                       >
//                         {item.notes || "--"}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );

  return (
  <div
    className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <div
      className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      {/* HEADER */}
      <div
        className="flex items-start justify-between p-6 border-b"
        style={{ borderColor: colors.cardBorder }}
      >
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Employee Attendance History
          </h2>

          <p
            className="text-sm mt-1"
            style={{ color: colors.textSecondary }}
          >
            Last 90 days attendance records
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl transition"
          style={{
            backgroundColor: colors.inputBg,
            color: colors.textPrimary,
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* FILTERS */}
      <div
        className="px-6 py-4 border-b"
        style={{
          borderColor: colors.cardBorder,
          backgroundColor: colors.hover,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* STATUS */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
            }}
          >
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half_day">Half Day</option>
            <option value="on_leave">On Leave</option>
          </select>

          {/* MONTH */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
            }}
          />

          {/* YEAR */}
          <input
            type="number"
            placeholder="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
            }}
          />

          {/* DOWNLOAD */}
          <button
            onClick={handleDownloadAttendance}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition"
            style={{
              backgroundColor: colors.buttonBg,
              color: colors.textPrimary,
            }}
          >
            <Download size={18} />
            Download CSV
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="overflow-y-auto flex-1 p-6">
        {loading ? (
          <div
            className="h-[300px] flex items-center justify-center"
            style={{ color: colors.textSecondary }}
          >
            Loading attendance history...
          </div>
        ) : (
          <>
            {/* EMPLOYEE INFO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: colors.cardHover,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <User2 size={20} color={colors.blue} />
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: colors.textPrimary }}
                  >
                    Employee Details
                  </h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: colors.textSecondary }}>Name</span>
                    <span
                      className="font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      {employee?.firstName} {employee?.lastName}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span style={{ color: colors.textSecondary }}>
                      Employee ID
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      {employee?.employeeId}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span
                      className="flex items-center gap-1"
                      style={{ color: colors.textSecondary }}
                    >
                      <Mail size={14} />
                      Email
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      {employee?.email}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span
                      className="flex items-center gap-1"
                      style={{ color: colors.textSecondary }}
                    >
                      <Phone size={14} />
                      Phone
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      {employee?.phoneNumber}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span
                      className="flex items-center gap-1"
                      style={{ color: colors.textSecondary }}
                    >
                      <ShieldCheck size={14} />
                      Role
                    </span>
                    <span
                      className="font-medium uppercase"
                      style={{ color: colors.textPrimary }}
                    >
                      {employee?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Present"
                  value={attendanceData?.presentCount || 0}
                />
                <StatCard
                  title="Late"
                  value={attendanceData?.lateCount || 0}
                />
                <StatCard
                  title="Half Day"
                  value={attendanceData?.halfDayCount || 0}
                />
                <StatCard
                  title="Attendance Rate"
                  value={`${attendanceData?.attendanceRate || 0}%`}
                />
              </div>
            </div>

            {/* TABLE */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              <div
                className="grid grid-cols-6 px-4 py-3 text-sm font-semibold"
                style={{
                  backgroundColor: colors.hover,
                  color: colors.textSecondary,
                }}
              >
                <div>Date</div>
                <div>Status</div>
                <div>Check In</div>
                <div>Check Out</div>
                <div>Working Hours</div>
                <div>Notes</div>
              </div>

              <div>
                {records.map((item) => (
                  <div
                    key={item._id}
                    className="grid grid-cols-6 px-4 py-4 text-sm items-center transition"
                    style={{
                      borderTop: `1px solid ${colors.cardBorder}`,
                    }}
                  >
                    <div
                      className="flex items-center gap-2"
                      style={{ color: colors.textPrimary }}
                    >
                      <CalendarDays size={14} />
                      {new Date(item.date).toLocaleDateString()}
                    </div>

                    <div>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${
                          statusStyles[item.status]
                        }`}
                      >
                        {item.status?.replace("_", " ")}
                      </span>
                    </div>

                    <div style={{ color: colors.textSecondary }}>
                      {convertUtcToIst(item.checkIn || "--")}
                    </div>

                    <div style={{ color: colors.textSecondary }}>
                      {convertUtcToIst(item.checkOut || "--")}
                    </div>

                    <div
                      className="flex items-center gap-2"
                      style={{ color: colors.textSecondary }}
                    >
                      <Clock3 size={14} />
                      {item.totalWorkingHours || "--"}
                    </div>

                    <div
                      className="truncate max-w-[200px]"
                      style={{ color: colors.textMuted }}
                      title={item.notes}
                    >
                      {item.notes || "--"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);
}

// function StatCard({ title, value }) {
//   return (
//     <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-center">
//       <p className="text-sm text-gray-400">{title}</p>
//       <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
//     </div>
//   );
// }
function StatCard({ title, value }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col justify-center transition-all duration-200"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      <p
        className="text-sm font-medium"
        style={{ color: colors.textSecondary }}
      >
        {title}
      </p>

      <h3
        className="text-3xl font-bold mt-2"
        style={{ color: colors.textPrimary }}
      >
        {value}
      </h3>
    </div>
  );
}
