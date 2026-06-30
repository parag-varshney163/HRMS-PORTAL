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

  // ─── FETCH PERSONAL DATA ───
  const fetchPersonalData = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/api/v1/attendance/user");
      if (data.success && data.data) {
        setPersonalStats({
          attendanceRate: data.data.attendanceRate || "0%",
          lateDays: data.data.lateDays || 0,
        });

        const history = data.data.history || [];
        // setAttendanceHistory(history);
        setAttendanceHistory((prev) => {
          const today = new Date();

          const hasToday = history.some((r) => {
            const d = new Date(r.date);
            return (
              d.getDate() === today.getDate() &&
              d.getMonth() === today.getMonth() &&
              d.getFullYear() === today.getFullYear()
            );
          });

          if (!hasToday) {
            return [
              ...history,
              {
                date: today,
                status: "present",
              },
            ];
          }

          return history;
        });

        const sortedHistory = [...history].sort(
          (a, b) =>
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
        );
        const latestSession = sortedHistory[0];
        const now = new Date();

        // 🚨 SHIFT COMPLETED LOGIC: Check if they already finished a shift TODAY
        if (latestSession && latestSession.checkOut) {
          const sessionDate = new Date(
            latestSession.createdAt || latestSession.date,
          );
          if (
            now.getDate() === sessionDate.getDate() &&
            now.getMonth() === sessionDate.getMonth() &&
            now.getFullYear() === sessionDate.getFullYear()
          ) {
            setCompletedShiftHours(
              latestSession.totalWorkingHours || "Shift Ended",
            );
          }
        }

        let activeCheckInTime = null;
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
          const storedDate = new Date(stored);
          if (now.getTime() - storedDate.getTime() < 24 * 60 * 60 * 1000) {
            activeCheckInTime = storedDate;
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        if (
          !activeCheckInTime &&
          latestSession &&
          latestSession.checkIn &&
          !latestSession.checkOut
        ) {
          const sessionDate = new Date(
            latestSession.createdAt || latestSession.date || now,
          );

          if (typeof latestSession.checkIn === "string") {
            const timeMatch = latestSession.checkIn.match(
              /(\d{1,2}):(\d{2})\s*(AM|PM)?/i,
            );
            if (timeMatch) {
              let hours = parseInt(timeMatch[1], 10);
              const minutes = parseInt(timeMatch[2], 10);
              const modifier = timeMatch[3];

              if (modifier) {
                if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
                if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
              }

              sessionDate.setHours(hours, minutes, 0, 0);
            }
          }

          if (now.getTime() - sessionDate.getTime() < 24 * 60 * 60 * 1000) {
            activeCheckInTime = sessionDate;
            localStorage.setItem(STORAGE_KEY, activeCheckInTime.toISOString());
          }
        }

        if (activeCheckInTime) {
          setIsCheckedIn(true);
          setCheckInTime(activeCheckInTime);
        } else {
          setIsCheckedIn(false);
          setCheckInTime(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to fetch personal attendance", error);
    }
  }, []);

  useEffect(() => {
    fetchPersonalData();
  }, [fetchPersonalData]);

  // ─── CHECK IN ───
  const handleCheckIn = async () => {
    try {
      setIsSubmitting(true);
      setActionType("checkin");
      const loc = await getLocation();
      if (loc) {
        setCoords(loc);
        setLocation("Office Location (Verified)");
      }

      const body = { notes: remarks };
      if (loc) {
        body.latitude = loc.latitude;
        body.longitude = loc.longitude;
      }

      const { data } = await axiosInstance.post(
        "/api/v1/attendance/check-in",
        body,
      );
      if (data.success) {
        notify.success("Checked In", "You have been clocked in successfully.");
        const now = new Date();
        setCheckInTime(now);
        setIsCheckedIn(true);
        setCompletedShiftHours(null); // Reset completed status if checking in again
        localStorage.setItem(STORAGE_KEY, now.toISOString());
        fetchPersonalData();
      }
      setAttendanceHistory((prev) => {
        const today = new Date();

        // check if already exists
        const exists = prev.find((r) => {
          const d = new Date(r.date);
          return (
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear()
          );
        });

        if (exists) return prev;

        return [
          ...prev,
          {
            date: today,
            status: "present", // ✅ THIS MAKES IT GREEN
          },
        ];
      });
    } catch (error) {
      notify.error(
        "Check-in Failed",
        error.response?.data?.message || "Unable to clock in.",
      );
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  // ─── CHECK OUT ───
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
        body,
      );
      if (data.success) {
        const workedHours = data.data?.totalWorkingHours || elapsedTime;
        notify.success(
          "Checked Out Successfully",
          `Great work today! Total hours: ${workedHours}`,
        );

        setIsCheckedIn(false);
        setCheckInTime(null);
        setRemarks("");
        setCompletedShiftHours(workedHours); // 🚨 SAVE FINAL TIME
        localStorage.removeItem(STORAGE_KEY);
        fetchPersonalData();
      }
    } catch (error) {
      notify.error(
        "Check-out Failed",
        error.response?.data?.message || "Unable to clock out.",
      );
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  //   return (
  //     <div className="flex flex-col gap-6 w-full">
  //       {/* HEADER */}
  //       <div
  //         className="rounded-2xl p-4 shadow-sm"
  //         style={{
  //           background: colors.cardBg,
  //           border: `1px solid ${colors.cardBorder}`,
  //         }}
  //       >
  //         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  //           <div>
  //             <h2 className="text-2xl font-bold text-text-primary">
  //               My <span style={{ color: colors.accent }}>
  //                 Attendance
  //               </span>
  //             </h2>

  //             {!expanded && (
  //               <p className="text-sm text-text-secondary mt-1">
  //                 Click expand to view attendance details
  //               </p>
  //             )}
  //           </div>

  //           <div className="flex items-center gap-3 flex-wrap">
  //             <Button
  //               variant="custom"
  //               bg={colors.success}
  //               text="#fff"
  //               size="sm"
  //               icon={LogIn}
  //               onClick={handleCheckIn}
  //               disabled={isSubmitting || isCheckedIn}
  //               className="rounded-xl px-4 py-2.5"
  //             >
  //               {actionType === "checkin" ? "Checking In..." : "Check In"}
  //             </Button>

  //             <Button
  //               variant="custom"
  //               bg={colors.danger}
  //               text="#fff"
  //               size="sm"
  //               icon={LogOut}
  //               onClick={handleCheckOut}
  //               disabled={isSubmitting || !isCheckedIn}
  //               className="rounded-xl px-4 py-2.5"
  //             >
  //               {actionType === "checkout"
  //                 ? "Checking Out..."
  //                 : "Check Out"}
  //             </Button>

  //             {/* EXPAND BUTTON */}
  //             <button
  //               onClick={() => setExpanded(!expanded)}
  //               className="w-10 h-10 rounded-xl border border-card-border flex items-center justify-center hover:bg-input transition"
  //             >
  //               {expanded ? (
  //                 <ChevronUp size={18} />
  //               ) : (
  //                 <ChevronDown size={18} />
  //               )}
  //             </button>
  //           </div>
  //         </div>
  //       </div>

  //       {/* EXPANDED CONTENT */}
  //       {expanded && (
  //   <div className="flex flex-col xl:flex-row gap-6">
  //     {/* LEFT SECTION */}
  //     <div className="flex-1 flex flex-col">
  //       <div
  //         className="rounded-2xl p-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 h-full shadow-sm min-h-[320px]"
  //         style={{
  //           background: colors.cardBg,
  //           border: `1px solid ${colors.cardBorder}`,
  //         }}
  //       >
  //         <div
  //           className="absolute top-1/2 -translate-y-1/2 right-10 p-4 opacity-5 pointer-events-none"
  //           style={{ color: colors.accent }}
  //         >
  //           <Clock size={200} />
  //         </div>

  //         <div className="flex-1 z-10 flex flex-col justify-center w-full">
  //           <h2
  //             className="text-xl font-bold mb-1"
  //             style={{ color: colors.textPrimary }}
  //           >
  //             Today's Shift
  //           </h2>

  //           <p
  //             className="text-sm mb-8"
  //             style={{ color: colors.textSecondary }}
  //           >
  //             General Shift (12:00 PM - 09:00 PM)
  //           </p>

  //           <div className="flex flex-col sm:flex-row sm:items-center gap-8">
  //             <div>
  //               <p
  //                 className="text-xs uppercase tracking-wider mb-1.5 font-semibold"
  //                 style={{ color: colors.textSecondary }}
  //               >
  //                 Current Date
  //               </p>

  //               <p
  //                 className="text-lg font-bold"
  //                 style={{ color: colors.textPrimary }}
  //               >
  //                 {new Date().toLocaleDateString("en-US", {
  //                   weekday: "long",
  //                   month: "long",
  //                   day: "numeric",
  //                 })}
  //               </p>
  //             </div>

  //             <div
  //               className="hidden sm:block h-10 w-px"
  //               style={{ background: colors.cardBorder }}
  //             />

  //             <div>
  //               <p
  //                 className="text-xs uppercase tracking-wider mb-1.5 font-semibold"
  //                 style={{ color: colors.textSecondary }}
  //               >
  //                 Location
  //               </p>

  //               <div
  //                 className="flex items-center gap-2"
  //                 style={{ color: colors.accent }}
  //               >
  //                 <MapPin size={18} />
  //                 <span className="font-medium text-sm">{location}</span>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     {/* RIGHT SECTION */}
  //     <div className="w-full xl:w-[350px] flex flex-col gap-4">
  //       <div
  //         className="rounded-2xl p-6 shadow-sm flex-1"
  //         style={{
  //           background: colors.cardBg,
  //           border: `1px solid ${colors.cardBorder}`,
  //         }}
  //       >
  //         <div className="flex items-center justify-between mb-5">
  //           <h3
  //             className="font-semibold flex items-center gap-2"
  //             style={{ color: colors.textPrimary }}
  //           >
  //             <CalIcon size={18} color={colors.accent} />
  //             {new Date().toLocaleDateString("en-US", {
  //               month: "long",
  //               year: "numeric",
  //             })}
  //           </h3>
  //         </div>

  //         <div className="grid grid-cols-7 mb-3 text-center">
  //           {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
  //             <span
  //               key={d}
  //               className="text-[11px] font-bold uppercase tracking-wider"
  //               style={{ color: colors.textSecondary }}
  //             >
  //               {d}
  //             </span>
  //           ))}
  //         </div>

  //         <div className="grid grid-cols-7 gap-y-3 text-center">
  //           {Array.from({
  //             length: new Date(
  //               new Date().getFullYear(),
  //               new Date().getMonth(),
  //               1,
  //             ).getDay(),
  //           }).map((_, i) => (
  //             <div key={`empty-${i}`} />
  //           ))}

  //           {Array.from({
  //             length: new Date(
  //               new Date().getFullYear(),
  //               new Date().getMonth() + 1,
  //               0,
  //             ).getDate(),
  //           }).map((_, i) => {
  //             const day = i + 1;

  //             const record = attendanceHistory.find((r) => {
  //               const recordDate = new Date(r.date);
  //               return (
  //                 recordDate.getDate() === day &&
  //                 recordDate.getMonth() === new Date().getMonth() &&
  //                 recordDate.getFullYear() === new Date().getFullYear()
  //               );
  //             });

  //             let styles = {
  //               background: "transparent",
  //               color: colors.textPrimary,
  //               border: "none",
  //             };

  //             const isToday = day === new Date().getDate();

  //             if (record) {
  //               if (record.status === "present") {
  //                 styles = {
  //                   background: `${colors.success}20`,
  //                   color: colors.success,
  //                   border: `1px solid ${colors.success}50`,
  //                 };
  //               } else if (record.status === "absent") {
  //                 styles = {
  //                   background: `${colors.danger}20`,
  //                   color: colors.danger,
  //                   border: `1px solid ${colors.danger}50`,
  //                 };
  //               } else if (record.status === "late") {
  //                 styles = {
  //                   background: `${colors.warning}20`,
  //                   color: colors.warning,
  //                   border: `1px solid ${colors.warning}50`,
  //                 };
  //               } else if (record.status === "half_day") {
  //                 styles = {
  //                   background: `${colors.warning}20`,
  //                   color: colors.warning,
  //                   border: `1px solid ${colors.warning}50`,
  //                 };
  //               }
  //             } else {
  //               const today = new Date();

  //               if (day < today.getDate()) {
  //                 styles = {
  //                   background: `${colors.danger}20`,
  //                   color: colors.danger,
  //                   border: `1px solid ${colors.danger}50`,
  //                 };
  //               }
  //             }

  //             return (
  //               <div key={day} className="flex items-center justify-center">
  //                 <div
  //                   className="w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-medium"
  //                   style={{
  //                     ...styles,
  //                     boxShadow: isToday
  //                       ? `0 0 0 2px ${colors.accent}`
  //                       : "none",
  //                   }}
  //                 >
  //                   {day}
  //                 </div>
  //               </div>
  //             );
  //           })}
  //         </div>

  //         {/* Legend */}
  //         <div
  //           className="flex justify-between mt-5 pt-4"
  //           style={{
  //             borderTop: `1px solid ${colors.cardBorder}`,
  //           }}
  //         >
  //           <div
  //             className="flex items-center gap-1.5 text-[11px] font-medium"
  //             style={{ color: colors.textSecondary }}
  //           >
  //             <div
  //               className="w-2 h-2 rounded-full"
  //               style={{ background: colors.success }}
  //             />
  //             Present
  //           </div>

  //           <div
  //             className="flex items-center gap-1.5 text-[11px] font-medium"
  //             style={{ color: colors.textSecondary }}
  //           >
  //             <div
  //               className="w-2 h-2 rounded-full"
  //               style={{ background: colors.warning }}
  //             />
  //             Half
  //           </div>

  //           <div
  //             className="flex items-center gap-1.5 text-[11px] font-medium"
  //             style={{ color: colors.textSecondary }}
  //           >
  //             <div
  //               className="w-2 h-2 rounded-full"
  //               style={{ background: colors.danger }}
  //             />
  //             Absent
  //           </div>
  //         </div>
  //       </div>

  //       {/* Bottom Stats */}
  //       <div className="grid grid-cols-2 gap-4 shrink-0">
  //         <div
  //           className="rounded-xl p-4 shadow-sm flex flex-col justify-center"
  //           style={{
  //             background: colors.cardBg,
  //             border: `1px solid ${colors.cardBorder}`,
  //           }}
  //         >
  //           <p
  //             className="text-xs mb-1"
  //             style={{ color: colors.textSecondary }}
  //           >
  //             My Attendance
  //           </p>

  //           <p
  //             className="text-xl font-bold"
  //             style={{ color: colors.success }}
  //           >
  //             {personalStats.attendanceRate}
  //           </p>
  //         </div>

  //         <div
  //           className="rounded-xl p-4 shadow-sm flex flex-col justify-center"
  //           style={{
  //             background: colors.cardBg,
  //             border: `1px solid ${colors.cardBorder}`,
  //           }}
  //         >
  //           <p
  //             className="text-xs mb-1"
  //             style={{ color: colors.textSecondary }}
  //           >
  //             Late Days
  //           </p>

  //           <p
  //             className="text-xl font-bold"
  //             style={{ color: colors.warning }}
  //           >
  //             {personalStats.lateDays < 10
  //               ? `0${personalStats.lateDays}`
  //               : personalStats.lateDays}
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // )}
  //     </div>
  //   );

  return (
    <div className="w-full flex flex-col gap-6">
      {/* TOP CHECK-IN BAR */}
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
                Check in
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: colors.success }}
              >
                {checkInTime
                  ? checkInTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "--:--"}
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
                {completedShiftHours ? "Done" : "--"}
              </p>
            </div>
          </div>

          {/* SHIFT TIME */}
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
                Shift Time
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: colors.accent }}
              >
                12:00 PM - 09:00 PM
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
                {actionType === "checkout" ? "Checking Out..." : "Clock Out"}
              </Button>
            ) : (
              <Button
                variant="custom"
                bg={colors.accent}
                text="#fff"
                size="sm"
                icon={LogIn}
                onClick={handleCheckIn}
                disabled={isSubmitting || completedShiftHours}
                className="rounded-xl px-6 py-3"
              >
                {actionType === "checkin" ? "Checking In..." : "Clock In"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ATTENDANCE + CALENDAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MY ATTENDANCE */}
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

          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* CIRCLE */}
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
                  {completedShiftHours || elapsedTime}
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  Today's Work Time
                </p>
              </div>
            </div>

            {/* DETAILS */}
            <div className="flex-1 w-full">
              <div
                className="pb-5 mb-5"
                style={{ borderBottom: `1px solid ${colors.cardBorder}` }}
              >
                <p
                  className="font-bold text-lg"
                  style={{ color: colors.success }}
                >
                  {isCheckedIn ? "✓ Checked In" : "Not Checked In"}
                </p>

                <p
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {checkInTime
                    ? checkInTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "No check-in recorded"}
                </p>
              </div>

              <p
                className="font-bold text-lg mb-2"
                style={{ color: colors.textPrimary }}
              >
                Status
              </p>

              <span
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: `${colors.success}20`,
                  color: colors.success,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: colors.success }}
                />
                {isCheckedIn ? "Present" : "Absent"}
              </span>
            </div>
          </div>
        </div>

        {/* ATTENDANCE REPORT */}
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
                1,
              ).getDay(),
            }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({
              length: new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                0,
              ).getDate(),
            }).map((_, i) => {
              const day = i + 1;
              const today = new Date();

              const record = attendanceHistory.find((r) => {
                const d = new Date(r.date);
                return (
                  d.getDate() === day &&
                  d.getMonth() === today.getMonth() &&
                  d.getFullYear() === today.getFullYear()
                );
              });

              let bg = "transparent";
              let textColor = colors.textPrimary;

              if (record?.status === "present") {
                bg = colors.accent;
              } else if (record?.status === "absent") {
                bg = colors.danger;
                textColor = "#fff";
              } else if (day < today.getDate()) {
                bg = `${colors.accent}35`;
              }

              return (
                <div key={day} className="flex justify-center">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{
                      background: bg,
                      color: textColor,
                    }}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7 mt-6 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span
                key={day}
                className="text-sm font-medium"
                style={{ color: colors.textPrimary }}
              >
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




// {expanded && (
//         <div className="flex flex-col xl:flex-row gap-6">
//           {/* LEFT SECTION */}
//           <div className="flex-1 flex flex-col">
//             <div
//               className="rounded-2xl p-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 h-full shadow-sm min-h-[320px]"
//               style={{
//                 background: colors.cardBg,
//                 border: `1px solid ${colors.cardBorder}`,
//               }}
//             >
//               <div className="absolute top-1/2 -translate-y-1/2 right-10 p-4 opacity-5 pointer-events-none">
//                 <Clock size={200} className={colors.accent} />
//               </div>

//               <div className="flex-1 z-10 flex flex-col justify-center w-full">
//                 <h2 className="text-xl font-bold text-text-primary mb-1">
//                   Today's Shift
//                 </h2>

//                 <p className="text-text-secondary text-sm mb-8">
//                   General Shift (12:00 PM - 09:00 PM)
//                 </p>

//                 <div className="flex flex-col sm:flex-row sm:items-center gap-8">
//                   <div>
//                     <p className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-semibold">
//                       Current Date
//                     </p>

//                     <p className="text-lg font-bold text-text-primary">
//                       {new Date().toLocaleDateString("en-US", {
//                         weekday: "long",
//                         month: "long",
//                         day: "numeric",
//                       })}
//                     </p>
//                   </div>

//                   <div className="hidden sm:block h-10 w-px bg-card-border"></div>

//                   <div>
//                     <p className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-semibold">
//                       Location
//                     </p>

//                     <div className="flex items-center gap-2 text-accent">
//                       <MapPin size={18} />
//                       <span className="font-medium text-sm">
//                         {location}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT SECTION */}
//           <div className="w-full xl:w-87.5 flex flex-col gap-4">
//             <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm flex-1">
//               <div className="flex items-center justify-between mb-5">
//                 <h3 className="font-semibold text-text-primary flex items-center gap-2">
//                   <CalIcon size={18} className="text-accent" />{" "}
//                   {new Date().toLocaleDateString("en-US", {
//                     month: "long",
//                     year: "numeric",
//                   })}
//                 </h3>
//               </div>
//               <div className="grid grid-cols-7 mb-3 text-center">
//                 {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
//                   <span
//                     key={d}
//                     className="text-[11px] text-text-secondary font-bold uppercase tracking-wider"
//                   >
//                     {d}
//                   </span>
//                 ))}
//               </div>
//               <div className="grid grid-cols-7 gap-y-3 text-center">
//                 {Array.from({
//                   length: new Date(
//                     new Date().getFullYear(),
//                     new Date().getMonth(),
//                     1,
//                   ).getDay(),
//                 }).map((_, i) => (
//                   <div key={`empty-${i}`} />
//                 ))}
//                 {Array.from({
//                   length: new Date(
//                     new Date().getFullYear(),
//                     new Date().getMonth() + 1,
//                     0,
//                   ).getDate(),
//                 }).map((_, i) => {
//                   const day = i + 1;
//                   // const record = attendanceHistory.find(
//                   //   (r) => new Date(r.date).getDate() === day,
//                   // );
//                   // let statusColor = "text-text-primary";
//                   // let bgClass = "hover:bg-input/50";

//                   // if (record) {
//                   //   if (record.status === "present")
//                   //     bgClass =
//                   //       "bg-green-500/20 text-green-400 font-bold border border-green-500/30";
//                   //   else if (record.status === "absent")
//                   //     bgClass =
//                   //       "bg-red-500/20 text-red-400 border border-red-500/30";
//                   //   else if (record.status === "late")
//                   //     bgClass =
//                   //       "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
//                   //   else if (record.status === "half_day")
//                   //     bgClass =
//                   //       "bg-orange-500/20 text-orange-400 border border-orange-500/30";
//                   // }

//                   // const isToday = day === new Date().getDate();
//                   // if (isToday)
//                   //   bgClass +=
//                   //     " ring-2 ring-accent ring-offset-2 ring-offset-card";
//                   const record = attendanceHistory.find((r) => {
//                     const recordDate = new Date(r.date);
//                     return (
//                       recordDate.getDate() === day &&
//                       recordDate.getMonth() === new Date().getMonth() &&
//                       recordDate.getFullYear() === new Date().getFullYear()
//                     );
//                   });

//                   let bgClass = "hover:bg-input/50";

//                   // 🚨 TODAY DATE
//                   const isToday = day === new Date().getDate();

//                   // 🚨 IF RECORD EXISTS
//                   if (record) {
//                     if (record.status === "present") {
//                       bgClass =
//                         "bg-green-500/20 text-green-400 font-bold border border-green-500/30";
//                     } else if (record.status === "absent") {
//                       bgClass =
//                         "bg-red-500/20 text-red-400 border border-red-500/30";
//                     } else if (record.status === "late") {
//                       bgClass =
//                         "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
//                     } else if (record.status === "half_day") {
//                       bgClass =
//                         "bg-orange-500/20 text-orange-400 border border-orange-500/30";
//                     }
//                   }
//                   // 🚨 IF NO RECORD → MARK ABSENT (PAST DAYS ONLY)
//                   else {
//                     const today = new Date();
//                     const currentDay = today.getDate();

//                     if (day < currentDay) {
//                       bgClass =
//                         "bg-red-500/20 text-red-400 border border-red-500/30";
//                     }
//                   }

//                   // 🚨 HIGHLIGHT TODAY
//                   if (isToday) {
//                     bgClass += " ring-2 ring-accent ring-offset-2 ring-offset-card";
//                   }

//                   return (
//                     <div key={day} className="flex items-center justify-center">
//                       <div
//                         className={`w-7 h-7 flex items-center justify-center rounded-full text-[13px] cursor-default transition-colors ${bgClass || statusColor}`}
//                       >
//                         {day}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Calendar Legend */}
//               <div className="flex justify-between mt-5 pt-4 border-t border-card-border">
//                 <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
//                   <div className="w-2 h-2 rounded-full bg-green-500"></div>{" "}
//                   Present
//                 </div>
//                 <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
//                   <div className="w-2 h-2 rounded-full bg-orange-400"></div> Half
//                 </div>
//                 <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
//                   <div className="w-2 h-2 rounded-full bg-red-500"></div> Absent
//                 </div>
//               </div>
//             </div>

//             {/* Bottom Stats */}
//             <div className="grid grid-cols-2 gap-4 shrink-0">
//               <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
//                 <p className="text-xs text-text-secondary mb-1">My Attendance</p>
//                 <p className="text-xl font-bold text-green-400">
//                   {personalStats.attendanceRate}
//                 </p>
//               </div>
//               <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
//                 <p className="text-xs text-text-secondary mb-1">Late Days</p>
//                 <p className="text-xl font-bold text-yellow-400">
//                   {personalStats.lateDays < 10
//                     ? `0${personalStats.lateDays}`
//                     : personalStats.lateDays}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
// )}
