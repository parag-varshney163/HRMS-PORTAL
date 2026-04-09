import React, { useEffect, useState } from "react";
import {
  Clock,
  DollarSign,
  Calendar,
  Gift,
  Megaphone,
  Briefcase,
  CheckCircle2,
  Hourglass,
} from "lucide-react";

import StatsCard from "../ui/StatsCard";
import axiosInstance from "../../api/axiosInstance";
import MyAttendance from "../Attendance/MyAttendance";

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [data, setData] = useState({
    userSummary: {},
    salaryOverview: {},
    announcements: [],
    holidays: [],
    anniversaries: [],
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const [
          holidaysRes,
          anniversariesRes,
          announcementsRes,
          summaryRes,
          salaryRes,
        ] = await Promise.allSettled([
          axiosInstance.get("/api/v1/dashboard/holiday-events"),
          axiosInstance.get("/api/v1/dashboard/anniversaries"),
          axiosInstance.get("/api/v1/announcements"),
          axiosInstance.get("/api/v1/dashboard/user-summary"),
          axiosInstance.get("/api/v1/dashboard/salary-overview"),
        ]);

        const getVal = (res) =>
          res.status === "fulfilled" ? res.value.data.data : null;

        setData({
          holidays: getVal(holidaysRes) || [],
          anniversaries: getVal(anniversariesRes) || [],
          announcements: getVal(announcementsRes) || [],
          userSummary: getVal(summaryRes) || {},
          salaryOverview: getVal(salaryRes) || {},
        });
      } catch (error) {
        console.error("Employee Dashboard Sync Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const { data: response } = await axiosInstance.patch(
        `/api/v1/announcements/${id}/mark-read`,
      );
      if (response.success) {
        setData((prev) => ({
          ...prev,
          announcements: prev.announcements.map((ann) =>
            ann._id === id ? { ...ann, isRead: true } : ann,
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to mark announcement as read", error);
    }
  };

  const unreadAnnouncementsCount = data.announcements.filter(
    (a) => !a.isRead,
  ).length;

  return (
    <div className="w-full pb-8 flex flex-col gap-8 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back,{" "}
          <span className="text-accent">{user.name || "User"}</span>
        </h1>
        <p className="text-sm text-text-secondary">
          Here is what's happening in your organization today.
        </p>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
        <MyAttendance />
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
            My Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              icon={Clock}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-500"
              value={
                loading ? "..." : data.userSummary.attendanceRatePercent || "0%"
              }
              label="My Attendance"
            />
            <StatsCard
              icon={Briefcase}
              iconBg="bg-yellow-500/10"
              iconColor="text-yellow-500"
              value={
                loading
                  ? "..."
                  : `${data.userSummary.totalLeaveBalance || 0} Days`
              }
              label="Leave Balance"
            />
            <StatsCard
              icon={Hourglass}
              iconBg="bg-purple-500/10"
              iconColor="text-purple-500"
              value={
                loading ? "..." : data.userSummary.pendingLeaveRequests || 0
              }
              label="Pending Leaves"
            />
            <StatsCard
              icon={DollarSign}
              iconBg="bg-green-500/10"
              iconColor="text-green-500"
              value={
                loading
                  ? "..."
                  : `${data.userSummary.remainingDaysForPayroll || 0} Days`
              }
              label="Until Next Payroll"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col h-[350px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Megaphone size={18} className="text-accent" /> Announcements
            </h3>
            {unreadAnnouncementsCount > 0 && (
              <span className="text-xs bg-input px-2 py-1 rounded-full text-text-secondary">
                {unreadAnnouncementsCount} New
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {data.announcements.length > 0 ? (
              data.announcements.map((item) => (
                <div
                  key={item._id}
                  className={`relative p-4 rounded-xl bg-input/30 border border-card-border hover:bg-input/50 transition-colors flex flex-col gap-1.5 overflow-hidden ${item.isRead ? "opacity-60 grayscale-[30%]" : ""}`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${item.category?.toLowerCase().includes("holiday") ? "bg-yellow-400" : item.category?.toLowerCase().includes("policy") ? "bg-purple-500" : "bg-accent"}`}
                  />
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-text-secondary mb-0.5 block">
                        {item.category || "General"}
                      </span>
                      <h4 className="text-sm font-bold text-text-primary leading-tight pr-2">
                        {item.title}
                      </h4>
                    </div>
                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item._id)}
                        className="text-text-secondary hover:text-green-400 p-1 rounded-md hover:bg-card transition-colors shrink-0 cursor-pointer"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 pl-2 mt-1">
                    {item.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary text-xs opacity-50">
                You're all caught up!
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col h-[350px]">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" /> Holidays & Events
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {data.holidays.length > 0 ? (
              data.holidays.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 hover:bg-input/30 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold uppercase">
                      {new Date(h.date).toLocaleString("default", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-sm font-bold">
                      {new Date(h.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {h.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {h.type || "Public Holiday"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center flex items-center justify-center h-full text-xs text-text-secondary opacity-50">
                No upcoming holidays
              </p>
            )}
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col h-[350px]">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Gift size={18} className="text-pink-400" /> Celebrations
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {data.anniversaries.length > 0 ? (
              data.anniversaries.map((a, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-500/10 text-pink-500 flex items-center justify-center text-xs">
                    🎉
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {a.userName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {a.years} Year Anniversary
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-secondary opacity-50">
                No celebrations today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
