// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Users,
//   Clock,
//   DollarSign,
//   Percent,
//   FileText,
//   FileCheck,
//   UserPlus,
//   Calendar,
//   Gift,
//   Megaphone,
//   Briefcase,
//   CheckCircle2,
//   Hourglass, // Added for Pending Leaves
// } from "lucide-react";

// import DashboardCard from "../components/ui/DashboardCard";
// import StatsCard from "../components/ui/StatsCard";
// import Button from "../components/ui/Button";
// import axiosInstance from "../api/axiosInstance";

// import MyAttendance from "../components/Attendance/MyAttendance";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);

//   // 1. Get User Role & Info
//   const userRole =
//     localStorage.getItem("roleName")?.toLowerCase() || "employee";
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const isAdminOrHR = userRole === "admin" || userRole === "hr";

//   // 2. State for ALL APIs
//   const [data, setData] = useState({
//     stats: {},
//     actions: {},
//     leaveSummary: [],
//     userSummary: {},
//     salaryOverview: {},
//     announcements: [],
//     holidays: [],
//     anniversaries: [],
//   });

//   // 3. The "Smart Fetch" Logic
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);
//         const promises = [];

//         promises.push(axiosInstance.get("/api/v1/dashboard/holiday-events"));
//         promises.push(axiosInstance.get("/api/v1/dashboard/anniversaries"));
//         promises.push(axiosInstance.get("/api/v1/announcements"));

//         if (isAdminOrHR) {
//           promises.push(axiosInstance.get("/api/v1/dashboard/stats"));
//           promises.push(axiosInstance.get("/api/v1/dashboard/action-required"));
//           promises.push(axiosInstance.get("/api/v1/dashboard/leave-summary"));
//         } else {
//           promises.push(axiosInstance.get("/api/v1/dashboard/user-summary"));
//           promises.push(axiosInstance.get("/api/v1/dashboard/salary-overview"));
//         }

//         const results = await Promise.allSettled(promises);
//         const getVal = (idx) =>
//           results[idx].status === "fulfilled"
//             ? results[idx].value.data.data
//             : null;

//         const newData = {
//           holidays: getVal(0) || [],
//           anniversaries: getVal(1) || [],
//           announcements: getVal(2) || [],
//         };

//         if (isAdminOrHR) {
//           newData.stats = getVal(3) || {};
//           newData.actions = getVal(4) || {};
//           newData.leaveSummary = getVal(5) || [];
//         } else {
//           newData.userSummary = getVal(3) || {};
//           newData.salaryOverview = getVal(4) || {};
//         }

//         setData(newData);
//       } catch (error) {
//         console.error("Dashboard Sync Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [isAdminOrHR]);

//   const handleMarkAsRead = async (id) => {
//     try {
//       const { data: response } = await axiosInstance.patch(
//         `/api/v1/announcements/${id}/mark-read`,
//       );
//       if (response.success) {
//         setData((prev) => ({
//           ...prev,
//           announcements: prev.announcements.map((ann) =>
//             ann._id === id ? { ...ann, isRead: true } : ann,
//           ),
//         }));
//       }
//     } catch (error) {
//       console.error("Failed to mark announcement as read", error);
//     }
//   };

//   const ClickableActionCard = ({
//     icon,
//     iconBg,
//     iconColor,
//     value,
//     label,
//     path,
//   }) => (
//     <div
//       onClick={() => path && navigate(path)}
//       className={`h-full ${path ? "cursor-pointer" : ""}`}
//     >
//       <StatsCard
//         icon={icon}
//         iconBg={iconBg}
//         iconColor={iconColor}
//         value={loading ? "..." : value}
//         label={label}
//       />
//     </div>
//   );

//   const unreadAnnouncementsCount = data.announcements.filter(
//     (a) => !a.isRead,
//   ).length;

//   return (
//     <div className="w-full pb-8 flex flex-col gap-8 animate-in fade-in">
//       {/* ─── HEADER ─── */}
//       <div>
//         <h1 className="text-2xl font-bold text-text-primary">
//           Welcome back,{" "}
//           <span className="text-accent">{user.name || "User"}</span>
//         </h1>
//         <p className="text-sm text-text-secondary">
//           Here is what's happening in your organization today.
//         </p>
//       </div>

//       {/* 🚨 UNIVERSAL ATTENDANCE TRACKER 🚨 */}
//       <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
//         <MyAttendance />
//       </div>

//       {/* ─── DYNAMIC MIDDLE SECTION ─── */}
//       {isAdminOrHR ? (
//         <div className="space-y-6">
//           <div>
//             <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
//               Action Required
//             </h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               <ClickableActionCard
//                 icon={UserPlus}
//                 iconBg="bg-blue-500/10"
//                 iconColor="text-blue-500"
//                 value={data.actions.newJoinersCount || 0}
//                 label="New Joiners"
//                 path="/employees"
//               />
//               <ClickableActionCard
//                 icon={FileText}
//                 iconBg="bg-yellow-500/10"
//                 iconColor="text-yellow-500"
//                 value={data.actions.pendingLeavesCount || 0}
//                 label="Leave Requests"
//                 path="/leaves"
//               />
//               <ClickableActionCard
//                 icon={FileCheck}
//                 iconBg="bg-purple-500/10"
//                 iconColor="text-purple-500"
//                 value={data.actions.pendingDocumentsCount || 0}
//                 label="Pending Docs"
//                 path="/documents"
//               />
//               <ClickableActionCard
//                 icon={DollarSign}
//                 iconBg="bg-green-500/10"
//                 iconColor="text-green-500"
//                 value={data.actions.payrollDraftCount || 0}
//                 label="Payroll Drafts"
//                 path="/payroll"
//               />
//             </div>
//           </div>

//           <div>
//             <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
//               Organization Overview
//             </h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               <DashboardCard
//                 title="Total"
//                 highlight="Employees"
//                 value={loading ? "..." : data.stats.totalEmployees || 0}
//                 trendText={`+${data.stats.employeeGrowthPercent || 0} growth`}
//                 trendColor="#22c55e"
//                 trendIcon={<Users size={16} />}
//                 width="100%"
//               />
//               <DashboardCard
//                 title="Attendance"
//                 highlight="Rate"
//                 value={
//                   loading ? "..." : data.stats.attendanceRatePercent || "0%"
//                 }
//                 trendText="Average this month"
//                 trendColor="#FFD700"
//                 trendIcon={<Clock size={16} />}
//                 width="100%"
//               />
//               <DashboardCard
//                 title="Monthly"
//                 highlight="Payroll"
//                 value={
//                   loading
//                     ? "..."
//                     : `$${(data.stats.avgMonthlyPayroll || 0).toLocaleString()}`
//                 }
//                 trendText="Current Month"
//                 trendColor="#FFD700"
//                 trendIcon={<DollarSign size={16} />}
//                 width="100%"
//               />
//               <DashboardCard
//                 title="Leave"
//                 highlight="Utilization"
//                 value={
//                   loading ? "..." : data.stats.leaveUtilizationPercent || "0%"
//                 }
//                 trendText="Of total entitlement"
//                 trendColor="#eab308"
//                 trendIcon={<Percent size={16} />}
//                 width="100%"
//               />
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           <div>
//             <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
//               My Overview
//             </h2>
//             {/* 🚨 FIXED EMPLOYEE DATA MAPPING 🚨 */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               <StatsCard
//                 icon={Clock}
//                 iconBg="bg-blue-500/10"
//                 iconColor="text-blue-500"
//                 value={
//                   loading
//                     ? "..."
//                     : data.userSummary.attendanceRatePercent || "0%"
//                 }
//                 label="My Attendance"
//               />
//               <StatsCard
//                 icon={Briefcase}
//                 iconBg="bg-yellow-500/10"
//                 iconColor="text-yellow-500"
//                 value={
//                   loading
//                     ? "..."
//                     : `${data.userSummary.totalLeaveBalance || 0} Days`
//                 }
//                 label="Leave Balance"
//               />
//               <StatsCard
//                 icon={Hourglass}
//                 iconBg="bg-purple-500/10"
//                 iconColor="text-purple-500"
//                 value={
//                   loading ? "..." : data.userSummary.pendingLeaveRequests || 0
//                 }
//                 label="Pending Leaves"
//               />
//               <StatsCard
//                 icon={DollarSign}
//                 iconBg="bg-green-500/10"
//                 iconColor="text-green-500"
//                 value={
//                   loading
//                     ? "..."
//                     : `${data.userSummary.remainingDaysForPayroll || 0} Days`
//                 }
//                 label="Until Next Payroll"
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ─── COMMON WIDGETS SECTION ─── */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* 1. Announcements */}
//         <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col h-[350px]">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="font-semibold text-text-primary flex items-center gap-2">
//               <Megaphone size={18} className="text-accent" /> Announcements
//             </h3>
//             {unreadAnnouncementsCount > 0 && (
//               <span className="text-xs bg-input px-2 py-1 rounded-full text-text-secondary">
//                 {unreadAnnouncementsCount} New
//               </span>
//             )}
//           </div>
//           <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
//             {data.announcements.length > 0 ? (
//               data.announcements.map((item) => (
//                 <div
//                   key={item._id}
//                   className={`relative p-4 rounded-xl bg-input/30 border border-card-border hover:bg-input/50 transition-colors flex flex-col gap-1.5 overflow-hidden ${item.isRead ? "opacity-60 grayscale-[30%]" : ""}`}
//                 >
//                   <div
//                     className={`absolute left-0 top-0 bottom-0 w-1 ${item.category?.toLowerCase().includes("holiday") ? "bg-yellow-400" : item.category?.toLowerCase().includes("policy") ? "bg-purple-500" : "bg-accent"}`}
//                   />
//                   <div className="flex justify-between items-start pl-2">
//                     <div>
//                       <span className="text-[10px] font-semibold tracking-wider uppercase text-text-secondary mb-0.5 block">
//                         {item.category || "General"}
//                       </span>
//                       <h4 className="text-sm font-bold text-text-primary leading-tight pr-2">
//                         {item.title}
//                       </h4>
//                     </div>
//                     {!item.isRead && (
//                       <button
//                         onClick={() => handleMarkAsRead(item._id)}
//                         title="Mark as Read"
//                         className="text-text-secondary hover:text-green-400 p-1 rounded-md hover:bg-card transition-colors shrink-0 cursor-pointer"
//                       >
//                         <CheckCircle2 size={16} />
//                       </button>
//                     )}
//                   </div>
//                   <p className="text-xs text-text-secondary line-clamp-2 pl-2 mt-1">
//                     {item.message}
//                   </p>
//                 </div>
//               ))
//             ) : (
//               <div className="h-full flex flex-col items-center justify-center text-text-secondary text-xs opacity-50">
//                 You're all caught up!
//               </div>
//             )}
//           </div>
//         </div>

//         {/* 2. Holidays */}
//         <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col h-[350px]">
//           <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
//             <Calendar size={18} className="text-blue-400" /> Holidays & Events
//           </h3>
//           <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
//             {data.holidays.length > 0 ? (
//               data.holidays.map((h, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center gap-3 p-2 hover:bg-input/30 rounded-lg transition-colors"
//                 >
//                   <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex flex-col items-center justify-center shrink-0">
//                     <span className="text-[10px] font-bold uppercase">
//                       {new Date(h.date).toLocaleString("default", {
//                         month: "short",
//                       })}
//                     </span>
//                     <span className="text-sm font-bold">
//                       {new Date(h.date).getDate()}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-text-primary">
//                       {h.name}
//                     </p>
//                     <p className="text-xs text-text-secondary">
//                       {h.type || "Public Holiday"}
//                     </p>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <p className="text-center flex items-center justify-center h-full text-xs text-text-secondary opacity-50">
//                 No upcoming holidays
//               </p>
//             )}
//           </div>
//         </div>

//         {/* 3. Leave Summary / Celebrations */}
//         <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col h-[350px]">
//           {isAdminOrHR ? (
//             <>
//               <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
//                 <Briefcase size={18} className="text-green-400" /> Department
//                 Leaves
//               </h3>
//               <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
//                 {data.leaveSummary.length > 0 ? (
//                   data.leaveSummary.map((item, idx) => (
//                     <div
//                       key={idx}
//                       className="flex justify-between items-center p-2 border-b border-card-border/50 last:border-0"
//                     >
//                       <span className="text-sm text-text-secondary">
//                         {item?.employeeName || "Unknown"}
//                       </span>
//                       <span className="text-sm font-bold text-text-primary">
//                         {item.count} On Leave
//                       </span>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="h-full flex items-center justify-center text-xs text-text-secondary opacity-50">
//                     Everyone is present today!
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             <>
//               <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
//                 <Gift size={18} className="text-pink-400" /> Celebrations
//               </h3>
//               <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
//                 {data.anniversaries.length > 0 ? (
//                   data.anniversaries.map((a, idx) => (
//                     <div key={idx} className="flex items-center gap-3">
//                       <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center text-xs">
//                         🎉
//                       </div>
//                       <div>
//                         <p className="text-sm font-medium text-text-primary">
//                           {a.userName}
//                         </p>
//                         <p className="text-xs text-text-secondary">
//                           {a.years} Year Anniversary
//                         </p>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="h-full flex items-center justify-center text-xs text-text-secondary opacity-50">
//                     No celebrations today
//                   </div>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

// 🚨 CODE SPLITTING: Only the required dashboard is downloaded!
const AdminDashboard = lazy(
  () => import("../components/Dashboard/AdminDashboard"),
);
const EmployeeDashboard = lazy(
  () => import("../components/Dashboard/EmployeeDashboard"),
);

export default function Dashboard() {
  const userRole =
    localStorage.getItem("roleName")?.toLowerCase() || "employee";
  const isAdminOrHR = ["admin", "hr"].includes(userRole);

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-full w-full py-20 text-text-secondary gap-3">
          <Loader2 className="animate-spin text-accent" size={32} />
          <p className="text-sm font-medium">Loading Dashboard...</p>
        </div>
      }
    >
      {isAdminOrHR ? <AdminDashboard /> : <EmployeeDashboard />}
    </Suspense>
  );
}
