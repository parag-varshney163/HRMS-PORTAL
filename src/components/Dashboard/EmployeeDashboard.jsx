import { Clock, DollarSign, Calendar, Gift, Megaphone, Briefcase, CheckCircle2, Hourglass, UserCog, } from "lucide-react";
import React, { useEffect, useState } from "react";

import MyAttendance from "../Attendance/MyAttendance";
import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";
import StatsCard from "../ui/StatsCard";


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
        <h1
          className="text-2xl font-bold"
          style={{ color: colors.textPrimary }}
        >
          Welcome back,{" "}
          <span style={{ color: colors.accent }}>
            {user.name || "User"}
          </span>
        </h1>

        <p
          className="text-sm mt-1"
          style={{ color: colors.textSecondary }}
        >
          Here is what's happening in your organization today.
        </p>
      </div>

      <div
        className="rounded-2xl p-6 shadow-sm"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <MyAttendance />
      </div>
      <div className="space-y-6">
        <div>
          <h2
            className="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: colors.textSecondary }}
          >
            My Overview
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Reporting Manager */}
            <div
              className="rounded-xl p-4 shadow-sm"
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: colors.purpleLight }}
                >
                  <UserCog size={20} style={{ color: colors.purple }} />
                </div>

                <div>
                  <p
                    className="text-md"
                    style={{ color: colors.textSecondary }}
                  >
                    Reporting Manager
                  </p>

                  <p
                    className="font-semibold"
                    style={{ color: colors.textPrimary }}
                  >
                    {loading
                      ? "..."
                      : data.userSummary.reportingManager?.name || "N/A"}
                  </p>
                </div>
              </div>

              {!loading && data.userSummary.reportingManager && (
                <div className="space-y-1 text-sm">
                  <p
                    className="truncate"
                    style={{ color: colors.textSecondary }}
                  >
                    📧 {data.userSummary.reportingManager.email}
                  </p>

                  <p style={{ color: colors.textSecondary }}>
                    📞 {data.userSummary.reportingManager.phoneNumber}
                  </p>
                </div>
              )}
            </div>

            <StatsCard
              icon={Clock}
              iconBg={colors.blueLight}
              iconColor={colors.blue}
              value={
                loading
                  ? "..."
                  : data.userSummary.attendanceRatePercent || "0%"
              }
              label="My Attendance"
            />

            <StatsCard
              icon={Briefcase}
              iconBg={colors.orangeLight}
              iconColor={colors.orange}
              value={
                loading
                  ? "..."
                  : `${data.userSummary.totalLeaveBalance || 0} Days`
              }
              label="Leave Balance"
            />

            <StatsCard
              icon={Hourglass}
              iconBg={colors.purpleLight}
              iconColor={colors.purple}
              value={
                loading
                  ? "..."
                  : data.userSummary.pendingLeaveRequests || 0
              }
              label="Pending Leaves"
            />
          </div>
        </div>

        {data.userSummary.directReports?.length > 0 && (
          <div
            className="rounded-xl p-5 shadow-sm"
            style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <h3
              className="font-semibold mb-4"
              style={{ color: colors.textPrimary }}
            >
              My Team ({data.userSummary.directReports.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data.userSummary.directReports.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: colors.inputBg,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.inputBg;
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-semibold"
                      style={{
                        background: colors.accentLight,
                        color: colors.accentDark,
                      }}
                    >
                      {member.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="font-medium truncate"
                        style={{ color: colors.textPrimary }}
                      >
                        {member.name}
                      </p>

                      <p
                        className="text-xs truncate"
                        style={{ color: colors.textSecondary }}
                      >
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div
                    className="mt-3 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    📞 {member.phoneNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <div
          className="rounded-xl p-5 flex flex-col h-[350px] shadow-sm"
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3
              className="font-semibold flex items-center gap-2"
              style={{ color: colors.textPrimary }}
            >
              <Megaphone size={18} style={{ color: colors.accent }} />
              Announcements
            </h3>

            {unreadAnnouncementsCount > 0 && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: colors.inputBg,
                  color: colors.textSecondary,
                }}
              >
                {unreadAnnouncementsCount} New
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {data.announcements.length > 0 ? (
              data.announcements.map((item) => (
                <div
                  key={item._id}
                  className={`relative p-4 rounded-xl transition-colors flex flex-col gap-1.5 overflow-hidden ${item.isRead ? "opacity-60 grayscale-[30%]" : ""
                    }`}
                  style={{
                    background: colors.inputBg,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{
                      background: item.category
                        ?.toLowerCase()
                        .includes("holiday")
                        ? colors.warning
                        : item.category?.toLowerCase().includes("policy")
                          ? colors.purple
                          : colors.accent,
                    }}
                  />

                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <span
                        className="text-[10px] font-semibold tracking-wider uppercase mb-0.5 block"
                        style={{ color: colors.textSecondary }}
                      >
                        {item.category || "General"}
                      </span>

                      <h4
                        className="text-sm font-bold leading-tight pr-2"
                        style={{ color: colors.textPrimary }}
                      >
                        {item.title}
                      </h4>
                    </div>

                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item._id)}
                        className="p-1 rounded-md transition-colors shrink-0 cursor-pointer"
                        style={{ color: colors.textSecondary }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.success;
                          e.currentTarget.style.background = colors.cardBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colors.textSecondary;
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                  </div>

                  <p
                    className="text-xs line-clamp-2 pl-2 mt-1"
                    style={{ color: colors.textSecondary }}
                  >
                    {item.message}
                  </p>
                </div>
              ))
            ) : (
              <div
                className="h-full flex flex-col items-center justify-center text-xs"
                style={{ color: colors.textMuted }}
              >
                You're all caught up!
              </div>
            )}
          </div>
        </div>

        {/* Holidays */}
        <div
          className="rounded-xl p-5 flex flex-col h-[350px] shadow-sm"
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          <h3
            className="font-semibold mb-4 flex items-center gap-2"
            style={{ color: colors.textPrimary }}
          >
            <Calendar size={18} style={{ color: colors.blue }} />
            Holidays & Events
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {data.holidays.length > 0 ? (
              data.holidays.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                  style={{ background: colors.cardBg }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.cardBg;
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0"
                    style={{
                      background: colors.blueLight,
                      color: colors.blue,
                    }}
                  >
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
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      {h.name}
                    </p>

                    <p
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {h.type || "Public Holiday"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="h-full flex items-center justify-center text-xs"
                style={{ color: colors.textMuted }}
              >
                No upcoming holidays
              </div>
            )}
          </div>
        </div>

        {/* Celebrations */}
        <div
          className="rounded-xl p-5 flex flex-col h-[350px] shadow-sm"
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          <h3
            className="font-semibold mb-4 flex items-center gap-2"
            style={{ color: colors.textPrimary }}
          >
            <Gift size={18} style={{ color: colors.orange }} />
            Celebrations
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {data.anniversaries.length > 0 ? (
              data.anniversaries.map((a, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                    style={{
                      background: colors.orangeLight,
                      color: colors.orange,
                    }}
                  >
                    🎉
                  </div>

                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      {a.userName}
                    </p>

                    <p
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {a.years} Year Anniversary
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="h-full flex items-center justify-center text-xs"
                style={{ color: colors.textMuted }}
              >
                No celebrations today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
