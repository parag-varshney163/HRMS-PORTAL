import { Clock, MapPin, LogIn, LogOut, Calendar as CalIcon, ChevronUp, ChevronDown, } from "lucide-react";
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback, useRef } from "react";

import useNotification from "../../hooks/useNotification.jsx";
import axiosInstance from "../../api/axiosInstance";
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
  const [expanded, setExpanded] = useState(false);

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

  return (
    // <div className="flex flex-col gap-6 w-full">
    //   {/* ─── HEADER WITH QUICK ACTIONS ─── */}
    //   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
    //     <div>
    //       <h2 className="text-2xl font-bold text-text-primary">
    //         My <span className="text-accent">Attendance</span>
    //       </h2>
    //       <p className="text-sm text-text-secondary mt-1">
    //         Track your daily shift and monthly calendar.
    //       </p>
    //     </div>
    //     <div className="flex gap-3">
    //       <Button
    //         variant="custom"
    //         bg="#22c55e"
    //         text="#fff"
    //         size="sm"
    //         icon={LogIn}
    //         onClick={handleCheckIn}
    //         disabled={isSubmitting || isCheckedIn} // Disable if already working
    //         className="rounded-xl px-4 py-2.5"
    //       >
    //         {actionType === "checkin" ? "Checking In..." : "Check In"}
    //       </Button>
    //       <Button
    //         variant="custom"
    //         bg="#ef4444"
    //         text="#fff"
    //         size="sm"
    //         icon={LogOut}
    //         onClick={handleCheckOut}
    //         disabled={isSubmitting || !isCheckedIn} // Disable if not working
    //         className="rounded-xl px-4 py-2.5"
    //       >
    //         {actionType === "checkout" ? "Checking Out..." : "Check Out"}
    //       </Button>
    //     </div>
    //   </div>

    //   <div className="flex flex-col xl:flex-row gap-6">
    //     {/* LEFT SECTION (Shift Info + Clock) */}
    //     <div className="flex-1 flex flex-col">
    //       <div className="bg-card border border-card-border rounded-2xl p-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 h-full shadow-sm min-h-[320px]">
    //         <div className="absolute top-1/2 -translate-y-1/2 right-10 p-4 opacity-5 pointer-events-none">
    //           <Clock size={200} className="text-accent" />
    //         </div>

    //         <div className="flex-1 z-10 flex flex-col justify-center w-full">
    //           <h2 className="text-xl font-bold text-text-primary mb-1">
    //             Today's Shift
    //           </h2>
    //           <p className="text-text-secondary text-sm mb-8">
    //             General Shift (12:00 PM - 09:00 PM)
    //           </p>

    //           <div className="flex flex-col sm:flex-row sm:items-center gap-8">
    //             <div>
    //               <p className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-semibold">
    //                 Current Date
    //               </p>
    //               <p className="text-lg font-bold text-text-primary">
    //                 {new Date().toLocaleDateString("en-US", {
    //                   weekday: "long",
    //                   month: "long",
    //                   day: "numeric",
    //                 })}
    //               </p>
    //             </div>
    //             <div className="hidden sm:block h-10 w-px bg-card-border"></div>
    //             <div>
    //               <p className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-semibold">
    //                 Location
    //               </p>
    //               <div className="flex items-center gap-2 text-accent">
    //                 <MapPin size={18} />
    //                 <span className="font-medium text-sm">{location}</span>
    //               </div>
    //             </div>
    //           </div>
    //         </div>

    //         {/* 🚨 THE UPGRADED CLOCK WIDGET BOX 🚨 */}
    //         {/* <div className="w-full lg:w-[340px] z-10 bg-input/30 p-6 rounded-2xl border border-card-border/50 backdrop-blur-sm flex flex-col items-center justify-center shrink-0">
    //           <div
    //             className={`w-36 h-36 rounded-full border-4 flex items-center justify-center mb-6 transition-all duration-500 ${
    //               isCheckedIn
    //                 ? "border-green-500/30 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.15)] scale-105"
    //                 : completedShiftHours
    //                   ? "border-accent/30 bg-accent/5 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-100"
    //                   : "border-card-border bg-input scale-100"
    //             }`}
    //           >
    //             <div className="flex flex-col items-center">
    //               <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-1.5 text-center px-2">
    //                 {isCheckedIn
    //                   ? "Working"
    //                   : completedShiftHours
    //                     ? "Shift Completed"
    //                     : "Ready to Start"}
    //               </span>
    //               <span
    //                 className={`text-3xl font-mono font-bold ${
    //                   isCheckedIn
    //                     ? "text-green-400"
    //                     : completedShiftHours
    //                       ? "text-accent"
    //                       : "text-text-primary"
    //                 }`}
    //               >
    //                 {isCheckedIn
    //                   ? elapsedTime
    //                   : completedShiftHours
    //                     ? completedShiftHours
    //                     : "00:00:00"}
    //               </span>
    //             </div>
    //           </div>

    //           <div className="w-full space-y-3">
    //             <input
    //               type="text"
    //               placeholder="Optional remarks (e.g. Traffic)..."
    //               className="w-full bg-input border border-card-border text-text-primary text-sm rounded-xl p-3 outline-none focus:border-btn transition-colors"
    //               value={remarks}
    //               onChange={(e) => setRemarks(e.target.value)}
    //               disabled={isCheckedIn || completedShiftHours}
    //             />

    //             <div className="grid grid-cols-1 gap-3">
    //               {!isCheckedIn && !completedShiftHours && (
    //                 <Button
    //                   onClick={handleCheckIn}
    //                   disabled={isSubmitting}
    //                   className="w-full justify-center py-3.5 bg-accent text-black font-bold hover:bg-accent/90"
    //                   icon={LogIn}
    //                 >
    //                   {isSubmitting ? "Fetching Location..." : "Clock In Now"}
    //                 </Button>
    //               )}

    //               {isCheckedIn && (
    //                 <Button
    //                   onClick={handleCheckOut}
    //                   disabled={isSubmitting}
    //                   className="w-full justify-center py-3.5 bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 hover:text-red-400 transition-colors font-bold"
    //                   icon={LogOut}
    //                 >
    //                   {isSubmitting ? "Fetching Location..." : "Clock Out"}
    //                 </Button>
    //               )}
    //             </div>

    //             {isCheckedIn && (
    //               <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-xs text-green-400 text-center font-medium">
    //                 You are currently clocked in.
    //               </div>
    //             )}
    //             {completedShiftHours && !isCheckedIn && (
    //               <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-xs text-accent text-center font-medium">
    //                 Great job! You have completed your shift for today.
    //               </div>
    //             )}
    //           </div>
    //         </div> */}
    //       </div>
    //     </div>

    //     {/* ─── RIGHT COLUMN: CALENDAR & STATS ─── */}
    //     <div className="w-full xl:w-87.5 flex flex-col gap-4">
    //       <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm flex-1">
    //         <div className="flex items-center justify-between mb-5">
    //           <h3 className="font-semibold text-text-primary flex items-center gap-2">
    //             <CalIcon size={18} className="text-accent" />{" "}
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
    //               className="text-[11px] text-text-secondary font-bold uppercase tracking-wider"
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
    //             // const record = attendanceHistory.find(
    //             //   (r) => new Date(r.date).getDate() === day,
    //             // );
    //             // let statusColor = "text-text-primary";
    //             // let bgClass = "hover:bg-input/50";

    //             // if (record) {
    //             //   if (record.status === "present")
    //             //     bgClass =
    //             //       "bg-green-500/20 text-green-400 font-bold border border-green-500/30";
    //             //   else if (record.status === "absent")
    //             //     bgClass =
    //             //       "bg-red-500/20 text-red-400 border border-red-500/30";
    //             //   else if (record.status === "late")
    //             //     bgClass =
    //             //       "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    //             //   else if (record.status === "half_day")
    //             //     bgClass =
    //             //       "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    //             // }

    //             // const isToday = day === new Date().getDate();
    //             // if (isToday)
    //             //   bgClass +=
    //             //     " ring-2 ring-accent ring-offset-2 ring-offset-card";
    //             const record = attendanceHistory.find((r) => {
    //               const recordDate = new Date(r.date);
    //               return (
    //                 recordDate.getDate() === day &&
    //                 recordDate.getMonth() === new Date().getMonth() &&
    //                 recordDate.getFullYear() === new Date().getFullYear()
    //               );
    //             });

    //             let bgClass = "hover:bg-input/50";

    //             // 🚨 TODAY DATE
    //             const isToday = day === new Date().getDate();

    //             // 🚨 IF RECORD EXISTS
    //             if (record) {
    //               if (record.status === "present") {
    //                 bgClass =
    //                   "bg-green-500/20 text-green-400 font-bold border border-green-500/30";
    //               } else if (record.status === "absent") {
    //                 bgClass =
    //                   "bg-red-500/20 text-red-400 border border-red-500/30";
    //               } else if (record.status === "late") {
    //                 bgClass =
    //                   "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
    //               } else if (record.status === "half_day") {
    //                 bgClass =
    //                   "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    //               }
    //             }
    //             // 🚨 IF NO RECORD → MARK ABSENT (PAST DAYS ONLY)
    //             else {
    //               const today = new Date();
    //               const currentDay = today.getDate();

    //               if (day < currentDay) {
    //                 bgClass =
    //                   "bg-red-500/20 text-red-400 border border-red-500/30";
    //               }
    //             }

    //             // 🚨 HIGHLIGHT TODAY
    //             if (isToday) {
    //               bgClass += " ring-2 ring-accent ring-offset-2 ring-offset-card";
    //             }

    //             return (
    //               <div key={day} className="flex items-center justify-center">
    //                 <div
    //                   className={`w-7 h-7 flex items-center justify-center rounded-full text-[13px] cursor-default transition-colors ${bgClass || statusColor}`}
    //                 >
    //                   {day}
    //                 </div>
    //               </div>
    //             );
    //           })}
    //         </div>

    //         {/* Calendar Legend */}
    //         <div className="flex justify-between mt-5 pt-4 border-t border-card-border">
    //           <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
    //             <div className="w-2 h-2 rounded-full bg-green-500"></div>{" "}
    //             Present
    //           </div>
    //           <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
    //             <div className="w-2 h-2 rounded-full bg-orange-400"></div> Half
    //           </div>
    //           <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
    //             <div className="w-2 h-2 rounded-full bg-red-500"></div> Absent
    //           </div>
    //         </div>
    //       </div>

    //       {/* Bottom Stats */}
    //       <div className="grid grid-cols-2 gap-4 shrink-0">
    //         <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
    //           <p className="text-xs text-text-secondary mb-1">My Attendance</p>
    //           <p className="text-xl font-bold text-green-400">
    //             {personalStats.attendanceRate}
    //           </p>
    //         </div>
    //         <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
    //           <p className="text-xs text-text-secondary mb-1">Late Days</p>
    //           <p className="text-xl font-bold text-yellow-400">
    //             {personalStats.lateDays < 10
    //               ? `0${personalStats.lateDays}`
    //               : personalStats.lateDays}
    //           </p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>








    <div className="flex flex-col gap-6 w-full">
      {/* HEADER */}
      <div className="bg-card border border-card-border rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              My <span className="text-accent">Attendance</span>
            </h2>

            {!expanded && (
              <p className="text-sm text-text-secondary mt-1">
                Click expand to view attendance details
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="custom"
              bg="#22c55e"
              text="#fff"
              size="sm"
              icon={LogIn}
              onClick={handleCheckIn}
              disabled={isSubmitting || isCheckedIn}
              className="rounded-xl px-4 py-2.5"
            >
              {actionType === "checkin" ? "Checking In..." : "Check In"}
            </Button>

            <Button
              variant="custom"
              bg="#ef4444"
              text="#fff"
              size="sm"
              icon={LogOut}
              onClick={handleCheckOut}
              disabled={isSubmitting || !isCheckedIn}
              className="rounded-xl px-4 py-2.5"
            >
              {actionType === "checkout"
                ? "Checking Out..."
                : "Check Out"}
            </Button>

            {/* EXPAND BUTTON */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-10 h-10 rounded-xl border border-card-border flex items-center justify-center hover:bg-input transition"
            >
              {expanded ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      {expanded && (
        <div className="flex flex-col xl:flex-row gap-6">
          {/* LEFT SECTION */}
          <div className="flex-1 flex flex-col">
            <div className="bg-card border border-card-border rounded-2xl p-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 h-full shadow-sm min-h-[320px]">
              <div className="absolute top-1/2 -translate-y-1/2 right-10 p-4 opacity-5 pointer-events-none">
                <Clock size={200} className="text-accent" />
              </div>

              <div className="flex-1 z-10 flex flex-col justify-center w-full">
                <h2 className="text-xl font-bold text-text-primary mb-1">
                  Today's Shift
                </h2>

                <p className="text-text-secondary text-sm mb-8">
                  General Shift (12:00 PM - 09:00 PM)
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-8">
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                      Current Date
                    </p>

                    <p className="text-lg font-bold text-text-primary">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="hidden sm:block h-10 w-px bg-card-border"></div>

                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider mb-1.5 font-semibold">
                      Location
                    </p>

                    <div className="flex items-center gap-2 text-accent">
                      <MapPin size={18} />
                      <span className="font-medium text-sm">
                        {location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="w-full xl:w-87.5 flex flex-col gap-4">
            <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm flex-1">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-text-primary flex items-center gap-2">
                  <CalIcon size={18} className="text-accent" />{" "}
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
              </div>
              <div className="grid grid-cols-7 mb-3 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <span
                    key={d}
                    className="text-[11px] text-text-secondary font-bold uppercase tracking-wider"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-3 text-center">
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
                  // const record = attendanceHistory.find(
                  //   (r) => new Date(r.date).getDate() === day,
                  // );
                  // let statusColor = "text-text-primary";
                  // let bgClass = "hover:bg-input/50";

                  // if (record) {
                  //   if (record.status === "present")
                  //     bgClass =
                  //       "bg-green-500/20 text-green-400 font-bold border border-green-500/30";
                  //   else if (record.status === "absent")
                  //     bgClass =
                  //       "bg-red-500/20 text-red-400 border border-red-500/30";
                  //   else if (record.status === "late")
                  //     bgClass =
                  //       "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
                  //   else if (record.status === "half_day")
                  //     bgClass =
                  //       "bg-orange-500/20 text-orange-400 border border-orange-500/30";
                  // }

                  // const isToday = day === new Date().getDate();
                  // if (isToday)
                  //   bgClass +=
                  //     " ring-2 ring-accent ring-offset-2 ring-offset-card";
                  const record = attendanceHistory.find((r) => {
                    const recordDate = new Date(r.date);
                    return (
                      recordDate.getDate() === day &&
                      recordDate.getMonth() === new Date().getMonth() &&
                      recordDate.getFullYear() === new Date().getFullYear()
                    );
                  });

                  let bgClass = "hover:bg-input/50";

                  // 🚨 TODAY DATE
                  const isToday = day === new Date().getDate();

                  // 🚨 IF RECORD EXISTS
                  if (record) {
                    if (record.status === "present") {
                      bgClass =
                        "bg-green-500/20 text-green-400 font-bold border border-green-500/30";
                    } else if (record.status === "absent") {
                      bgClass =
                        "bg-red-500/20 text-red-400 border border-red-500/30";
                    } else if (record.status === "late") {
                      bgClass =
                        "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
                    } else if (record.status === "half_day") {
                      bgClass =
                        "bg-orange-500/20 text-orange-400 border border-orange-500/30";
                    }
                  }
                  // 🚨 IF NO RECORD → MARK ABSENT (PAST DAYS ONLY)
                  else {
                    const today = new Date();
                    const currentDay = today.getDate();

                    if (day < currentDay) {
                      bgClass =
                        "bg-red-500/20 text-red-400 border border-red-500/30";
                    }
                  }

                  // 🚨 HIGHLIGHT TODAY
                  if (isToday) {
                    bgClass += " ring-2 ring-accent ring-offset-2 ring-offset-card";
                  }

                  return (
                    <div key={day} className="flex items-center justify-center">
                      <div
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-[13px] cursor-default transition-colors ${bgClass || statusColor}`}
                      >
                        {day}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calendar Legend */}
              <div className="flex justify-between mt-5 pt-4 border-t border-card-border">
                <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>{" "}
                  Present
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div> Half
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-medium">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div> Absent
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
              <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                <p className="text-xs text-text-secondary mb-1">My Attendance</p>
                <p className="text-xl font-bold text-green-400">
                  {personalStats.attendanceRate}
                </p>
              </div>
              <div className="bg-card border border-card-border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                <p className="text-xs text-text-secondary mb-1">Late Days</p>
                <p className="text-xl font-bold text-yellow-400">
                  {personalStats.lateDays < 10
                    ? `0${personalStats.lateDays}`
                    : personalStats.lateDays}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
