import { Clock, MapPin, LogIn, LogOut, Calendar as CalIcon, ChevronUp, ChevronDown, } from "lucide-react";
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback, useRef } from "react";

import useNotification from "../../hooks/useNotification.jsx";
import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors.js";
import Button from "../ui/Button";


// ─── GEOLOCATION HELPER ───
const getLocation = () =>
  new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });

const STORAGE_KEY = "hrms_checkInTime";

export default function MyAttendance() {
  // ─── STATE ───
  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      const storedDate = new Date(stored);
      if (new Date().getTime() - storedDate.getTime() < 24 * 60 * 60 * 1000) {
        return true;
      }
    }
    return false;
  });

  const [checkInTime, setCheckInTime] = useState(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      const storedDate = new Date(stored);
      if (new Date().getTime() - storedDate.getTime() < 24 * 60 * 60 * 1000) {
        return storedDate;
      }
    }
    return null;
  });

  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [completedShiftHours, setCompletedShiftHours] = useState(null); // 🚨 NEW: Remembers completed shift
  const [location, setLocation] = useState("Fetching location...");
  const [coords, setCoords] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotification();
  const [actionType, setActionType] = useState(null);
  // "checkin" | "checkout" | null

  const [personalStats, setPersonalStats] = useState({
    attendanceRate: "0%",
    lateDays: 0,
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  // const [expanded, setExpanded] = useState(false);

  // ─── REAL-TIME RUNNING CLOCK ───
  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isCheckedIn && checkInTime) {
      const tick = () => {
        const now = new Date();
        const start =
          checkInTime instanceof Date ? checkInTime : new Date(checkInTime);
        const diff = Math.max(0, now - start);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        const fmt = (n) => (n < 10 ? `0${n}` : n);
        setElapsedTime(`${fmt(hours)}:${fmt(minutes)}:${fmt(seconds)}`);
      };

      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      setElapsedTime("00:00:00");
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isCheckedIn, checkInTime]);

  // ─── GEOLOCATION ON MOUNT ───
  useEffect(() => {
    (async () => {
      const loc = await getLocation();
      if (loc) {
        setCoords(loc);
        setLocation("Office Location (Verified)");
      } else {
        setLocation("Location Access Denied");
      }
    })();
  }, []);
  const formatIST = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const latestAttendance =
    attendanceHistory.length > 0
      ? [...attendanceHistory].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )[0]
      : null;
  // const fetchPersonalData = useCallback(async () => {
  //   try {
  //     const { data } = await axiosInstance.get("/api/v1/attendance/user");

  //     if (!data.success || !data.data) return;

  //     setPersonalStats({
  //       attendanceRate: data.data.attendanceRate || "0%",
  //       lateDays: data.data.lateDays || 0,
  //     });

  //     const history = data.data.history || data.data.attendances || [];

  //     const formattedHistory = history.map((item) => ({
  //       ...item,
  //       date: new Date(item.date),
  //       checkInAt: item.checkInAt ? new Date(item.checkInAt) : null,
  //       checkOutAt: item.checkOutAt ? new Date(item.checkOutAt) : null,
  //     }));

  //     setAttendanceHistory(formattedHistory);

  //     const sortedHistory = [...formattedHistory].sort(
  //       (a, b) =>
  //         new Date(b.checkInAt || b.createdAt || b.date) -
  //         new Date(a.checkInAt || a.createdAt || a.date)
  //     );

  //     const latestSession = sortedHistory[0];
  //     const now = new Date();

  //     // Default values
  //     setIsCheckedIn(false);
  //     setCompletedShiftHours(null);

  //     if (latestSession) {
  //       // Always show latest check-in
  //       if (latestSession.checkInAt) {
  //         setCheckInTime(new Date(latestSession.checkInAt));
  //       } else {
  //         setCheckInTime(null);
  //       }
  //       // if (latestSession?.checkOut) {
  //       //   const [hours, minutes] = latestSession.checkOut.split(":");

  //       //   const checkoutDate = new Date(latestSession.date);
  //       //   checkoutDate.setHours(hours);
  //       //   checkoutDate.setMinutes(minutes);

  //       //   setCheckOutTime(checkoutDate);
  //       // } else {
  //       //   setCheckOutTime(null);
  //       // }
  //       setCheckOutTime(
  //         latestSession?.checkOutAt ? new Date(latestSession.checkOutAt) : null
  //       );
  //       // Show completed shift after checkout
  //       // if (
  //       //   latestSession.checkOutAt &&
  //       //   new Date(latestSession.date).toDateString() === now.toDateString()
  //       // ) {
  //       //   setCompletedShiftHours(
  //       //     latestSession.totalWorkingHours || "Shift Ended"
  //       //   );
  //       // }
  //       // Show completed shift after checkout
  //       const isToday =
  //         new Date(latestSession.date).toDateString() ===
  //         new Date().toDateString();

  //       if (latestSession.checkOutAt && isToday) {
  //         setCompletedShiftHours(
  //           latestSession.totalWorkingHours || "Shift Ended"
  //         );
  //       } else {
  //         setCompletedShiftHours(null);
  //       }

  //       // User is still checked in
  //       // if (
  //       //   latestSession.checkInAt &&
  //       //   !latestSession.checkOutAt &&
  //       //   new Date(latestSession.date).toDateString() === now.toDateString()
  //       // ) {
  //       //   setIsCheckedIn(true);
  //       //   setCheckInTime(new Date(latestSession.checkInAt));

  //       //   localStorage.setItem(
  //       //     STORAGE_KEY,
  //       //     new Date(latestSession.checkInAt).toISOString()
  //       //   );
  //       // } else {
  //       //   localStorage.removeItem(STORAGE_KEY);
  //       // }
  //       // User is still checked in
  //       if (
  //         latestSession.checkInAt &&
  //         !latestSession.checkOutAt &&
  //         isToday
  //       ) {
  //         setIsCheckedIn(true);
  //         setCheckInTime(new Date(latestSession.checkInAt));

  //         localStorage.setItem(
  //           STORAGE_KEY,
  //           new Date(latestSession.checkInAt).toISOString()
  //         );
  //       } else {
  //         setIsCheckedIn(false);
  //         setCheckInTime(null);
  //         localStorage.removeItem(STORAGE_KEY);
  //       }
  //     } else {
  //       setCheckInTime(null);
  //       localStorage.removeItem(STORAGE_KEY);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch personal attendance", error);
  //   }
  // }, []);

  const fetchPersonalData = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/api/v1/attendance/user");

      if (!data.success || !data.data) return;

      setPersonalStats({
        attendanceRate: data.data.attendanceRate || "0%",
        lateDays: data.data.lateDays || 0,
      });

      const history = data.data.history || data.data.attendances || [];

      const formattedHistory = history.map((item) => ({
        ...item,
        date: new Date(item.date),
        checkInAt: item.checkInAt ? new Date(item.checkInAt) : null,
        checkOutAt: item.checkOutAt ? new Date(item.checkOutAt) : null,
      }));

      setAttendanceHistory(formattedHistory);

      // Sort latest first
      const sortedHistory = [...formattedHistory].sort(
        (a, b) =>
          new Date(b.checkInAt || b.createdAt || b.date) -
          new Date(a.checkInAt || a.createdAt || a.date)
      );

      /**
       * Prefer active attendance (checked-in but not checked-out)
       * This fixes overnight shifts.
       */
      const activeSession = sortedHistory.find(
        (item) => item.checkInAt && !item.checkOutAt
      );

      /**
       * Otherwise use latest completed attendance
       */
      const latestSession = activeSession || sortedHistory[0];

      // Reset defaults
      setIsCheckedIn(false);
      setCompletedShiftHours(null);
      setCheckInTime(null);
      setCheckOutTime(null);

      if (!latestSession) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Check In
      if (latestSession.checkInAt) {
        setCheckInTime(new Date(latestSession.checkInAt));
      }

      // Check Out
      if (latestSession.checkOutAt) {
        setCheckOutTime(new Date(latestSession.checkOutAt));
      }

      /**
       * ACTIVE SHIFT
       * Works even after midnight.
       */
      if (
        latestSession.checkInAt &&
        !latestSession.checkOutAt
      ) {
        setIsCheckedIn(true);

        localStorage.setItem(
          STORAGE_KEY,
          new Date(latestSession.checkInAt).toISOString()
        );

        return;
      }

      /**
       * COMPLETED SHIFT
       */
      if (latestSession.checkOutAt) {
        setCompletedShiftHours(
          latestSession.totalWorkingHours || "Shift Ended"
        );
      }

      setIsCheckedIn(false);

      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to fetch personal attendance", error);
    }
  }, []);
  useEffect(() => {
    fetchPersonalData();
  }, [fetchPersonalData]);
  ;
  const handleCheckIn = async () => {
    try {
      setIsSubmitting(true);
      setActionType("checkin");

      const loc = await getLocation();

      if (loc) {
        setCoords(loc);
        setLocation("Office Location (Verified)");
      }

      const body = {
        notes: remarks,
      };

      if (loc) {
        body.latitude = loc.latitude;
        body.longitude = loc.longitude;
      }

      const { data } = await axiosInstance.post(
        "/api/v1/attendance/check-in",
        body
      );

      if (data.success) {
        notify.success(
          "Checked In",
          "You have been clocked in successfully."
        );

        const now = new Date();

        setIsCheckedIn(true);
        setCheckInTime(now);
        setCompletedShiftHours(null);
        setRemarks("");

        localStorage.setItem(STORAGE_KEY, now.toISOString());

        // Reload today's attendance from backend
        await fetchPersonalData();
      }
    } catch (error) {
      notify.error(
        "Check-in Failed",
        error.response?.data?.message || "Unable to clock in."
      );
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };
  const handleCheckOut = async () => {
    try {
      setIsSubmitting(true);
      setActionType("checkout");

      const loc = await getLocation();

      if (loc) {
        setCoords(loc);
        setLocation("Office Location (Verified)");
      }

      const body = {};

      if (loc) {
        body.latitude = loc.latitude;
        body.longitude = loc.longitude;
      }

      const { data } = await axiosInstance.put(
        "/api/v1/attendance/check-out",
        body
      );

      if (data.success) {
        const workedHours =
          data.data?.totalWorkingHours || elapsedTime;

        notify.success(
          "Checked Out Successfully",
          `Great work today! Total hours: ${workedHours}`
        );

        // Stop live timer
        setIsCheckedIn(false);
        setCheckInTime(null);

        setRemarks("");

        // Show today's completed shift
        setCompletedShiftHours(workedHours);

        // Remove stored session
        localStorage.removeItem(STORAGE_KEY);

        // Refresh latest attendance from backend
        await fetchPersonalData();
      }
    } catch (error) {
      notify.error(
        "Check-out Failed",
        error.response?.data?.message || "Unable to clock out."
      );
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };
  // const todayRecord = attendanceHistory.find((r) => {
  //   const d = new Date(r.date);
  //   const today = new Date();

  //   return (
  //     d.getDate() === today.getDate() &&
  //     d.getMonth() === today.getMonth() &&
  //     d.getFullYear() === today.getFullYear()
  //   );
  // });
  const today = new Date();

  const todayRecord =
    attendanceHistory.find(
      (r) => r.checkInAt && !r.checkOutAt
    ) ||
    attendanceHistory.find((r) => {
      const d = new Date(r.date);

      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    });
  return (

    <div className="w-full flex flex-col gap-6">
      <div
        className="rounded-2xl px-5 py-6"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-center">

          {/* CHECK IN */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: `${colors.success}15`,
                border: `1px solid ${colors.success}70`,
                color: colors.success,
              }}
            >
              <LogIn size={28} />
            </div>

            <div>
              <p
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Check In
              </p>

              <p
                className="text-2xl font-bold"
                style={{ color: colors.success }}
              >
                {/* {formatIST(checkInTime)} */}
                {todayRecord?.checkInAt
                  ? formatIST(todayRecord.checkInAt)
                  : "--:--"}
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: colors.textSecondary }}
              >
                IST
              </p>
            </div>
          </div>

          {/* CHECK OUT */}
          <div
            className="flex items-center gap-4 md:border-l md:pl-6"
            style={{ borderColor: colors.cardBorder }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: `${colors.danger}10`,
                border: `1px solid ${colors.danger}70`,
                color: colors.danger,
              }}
            >
              <LogOut size={28} />
            </div>


            <div>
              <p
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Check Out
              </p>

              <p
                className="text-2xl font-bold"
                style={{ color: colors.danger }}
              >
                {/* {formatIST(checkOutTime)} */}
                {/* {todayRecord?.checkOutAt
                  ? formatIST(todayRecord.checkOutAt)
                  : "--:--"} */}
                {todayRecord?.checkOutAt
                  ? formatIST(todayRecord.checkOutAt)
                  : "--:--"}
              </p>

              <p
                className="text-xs mt-1"
                style={{ color: colors.textSecondary }}
              >
                IST
              </p>
            </div>
          </div>

          {/* TOTAL WORKING HOURS */}
          <div
            className="flex items-center gap-4 md:border-l md:pl-6"
            style={{ borderColor: colors.cardBorder }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: `${colors.accent}20`,
                border: `1px solid ${colors.accent}70`,
                color: colors.accent,
              }}
            >
              <Clock size={28} />
            </div>

            <div>
              <p
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                Working Hours
              </p>

              <p
                className="text-xl font-bold"
                style={{ color: colors.accent }}
              >
                {completedShiftHours || elapsedTime}
              </p>
            </div>
          </div>

          {/* BUTTON */}
          <div className="flex justify-start md:justify-end">
            {isCheckedIn ? (
              <Button
                variant="custom"
                bg="#F2B6B6"
                text={colors.textPrimary}
                size="sm"
                icon={LogOut}
                onClick={handleCheckOut}
                disabled={isSubmitting}
                className="rounded-xl px-6 py-3"
              >
                {actionType === "checkout"
                  ? "Checking Out..."
                  : "Clock Out"}
              </Button>
            ) : (
              <Button
                variant="custom"
                bg={colors.accent}
                text="#fff"
                size="sm"
                icon={LogIn}
                onClick={handleCheckIn}
                disabled={isSubmitting || isCheckedIn}
                className="rounded-xl px-6 py-3"
              >
                {actionType === "checkin"
                  ? "Checking In..."
                  : "Clock In"}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================= MY ATTENDANCE ================= */}
        <div
          className="rounded-2xl p-6 min-h-[330px]"
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          <h2
            className="text-lg font-bold mb-7"
            style={{ color: colors.textPrimary }}
          >
            My Attendance
          </h2>

          {(() => {
            // const todayRecord = attendanceHistory.find((r) => {
            //   const d = new Date(r.date);
            //   const today = new Date();

            //   return (
            //     d.getDate() === today.getDate() &&
            //     d.getMonth() === today.getMonth() &&
            //     d.getFullYear() === today.getFullYear()
            //   );
            // });
            const today = new Date();

            const todayRecord =
              attendanceHistory.find(
                (r) => r.checkInAt && !r.checkOutAt
              ) ||
              attendanceHistory.find((r) => {
                const d = new Date(r.date);

                return (
                  d.getDate() === today.getDate() &&
                  d.getMonth() === today.getMonth() &&
                  d.getFullYear() === today.getFullYear()
                );
              });

            return (
              <div className="flex flex-col sm:flex-row items-center gap-8">

                {/* Circle */}
                <div
                  className="w-56 h-56 rounded-full flex flex-col items-center justify-center"
                  style={{
                    background: `conic-gradient(${colors.accent} ${isCheckedIn ? "65%" : "0%"
                      }, #F4E7B3 ${isCheckedIn ? "65%" : "0%"}, #F4E7B3 100%)`,
                  }}
                >
                  <div
                    className="w-44 h-44 rounded-full flex flex-col items-center justify-center"
                    style={{ background: colors.cardBg }}
                  >
                    <p
                      className="text-3xl font-bold"
                      style={{ color: colors.textPrimary }}
                    >
                      {todayRecord?.totalWorkingHours ||
                        completedShiftHours ||
                        elapsedTime}
                    </p>

                    <p
                      className="text-sm mt-1"
                      style={{ color: colors.textSecondary }}
                    >
                      Today's Work Time
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 w-full">

                  <div
                    className="pb-5 mb-5"
                    style={{
                      borderBottom: `1px solid ${colors.cardBorder}`,
                    }}
                  >

                    <div className="flex justify-between mb-2">
                      <span style={{ color: colors.textSecondary }}>
                        Check In
                      </span>

                      <span
                        style={{
                          color: colors.textPrimary,
                          fontWeight: 600,
                        }}
                      >
                        {/* {todayRecord?.checkIn || "--:--"} */}
                        {todayRecord?.checkInAt
                          ? formatIST(todayRecord.checkInAt)
                          : "--:--"}
                      </span>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span style={{ color: colors.textSecondary }}>
                        Check Out
                      </span>

                      <span
                        style={{
                          color: colors.textPrimary,
                          fontWeight: 600,
                        }}
                      >
                        {/* {todayRecord?.checkOut || "--:--"} */}
                        {todayRecord?.checkOutAt
                          ? formatIST(todayRecord.checkOutAt)
                          : "--:--"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span style={{ color: colors.textSecondary }}>
                        Working Hours
                      </span>

                      <span
                        style={{
                          color: colors.textPrimary,
                          fontWeight: 600,
                        }}
                      >
                        {todayRecord?.totalWorkingHours || "--"}
                      </span>
                    </div>
                  </div>

                  <p
                    className="font-bold text-lg mb-3"
                    style={{ color: colors.textPrimary }}
                  >
                    Status
                  </p>

                  <span
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold"
                    style={{
                      background:
                        todayRecord?.status === "present"
                          ? "#DCFCE7"
                          : "#FEE2E2",

                      color:
                        todayRecord?.status === "present"
                          ? "#15803D"
                          : "#DC2626",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          todayRecord?.status === "present"
                            ? "#16A34A"
                            : "#DC2626",
                      }}
                    />

                    {todayRecord?.status === "present"
                      ? "Present"
                      : todayRecord?.status === "half_day"
                        ? "Half Day"
                        : "Absent"}
                  </span>

                </div>
              </div>
            );
          })()}
        </div>

        {/* ================= ATTENDANCE REPORT ================= */}

        <div
          className="rounded-2xl p-6 min-h-[330px]"
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          <h2
            className="text-lg font-bold mb-7"
            style={{ color: colors.textPrimary }}
          >
            Attendance Report
          </h2>

          <div className="grid grid-cols-7 gap-y-4 text-center">

            {Array.from({
              length: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ).getDay(),
            }).map((_, i) => (
              <div key={i}></div>
            ))}

            {Array.from({
              length: new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                0
              ).getDate(),
            }).map((_, i) => {
              const day = i + 1;

              const record = attendanceHistory.find((r) => {
                const d = new Date(r.date);
                const today = new Date();

                return (
                  d.getDate() === day &&
                  d.getMonth() === today.getMonth() &&
                  d.getFullYear() === today.getFullYear()
                );
              });

              let bg = "transparent";
              let color = colors.textPrimary;

              if (record?.status === "present") {
                bg = "#22C55E";
                color = "#fff";
              }

              if (record?.status === "half_day") {
                bg = "#EF4444";
                color = "#fff";
              }

              if (record?.status === "absent") {
                bg = "#991B1B";
                color = "#fff";
              }

              return (
                <div key={day} className="flex justify-center">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{
                      background: bg,
                      color,
                    }}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-6 mt-8 text-sm">

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Present
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Half Day
            </div>

            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ background: "#991B1B" }}
              ></span>
              Absent
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

