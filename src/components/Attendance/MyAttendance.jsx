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

  // ─── FETCH PERSONAL DATA ───
  // const fetchPersonalData = useCallback(async () => {
  //   try {
  //     const { data } = await axiosInstance.get("/api/v1/attendance/user");
  //     if (data.success && data.data) {
  //       setPersonalStats({
  //         attendanceRate: data.data.attendanceRate || "0%",
  //         lateDays: data.data.lateDays || 0,
  //       });

  //       // const history = data.data.history || [];
  //       // setAttendanceHistory(history);
  //       const history =
  //         data.data.history ||
  //         data.data.attendances ||
  //         [];
  //       setAttendanceHistory((prev) => {
  //         const today = new Date();

  //         const hasToday = history.some((r) => {
  //           const d = new Date(r.date);
  //           return (
  //             d.getDate() === today.getDate() &&
  //             d.getMonth() === today.getMonth() &&
  //             d.getFullYear() === today.getFullYear()
  //           );
  //         });

  //         if (!hasToday) {
  //           return [
  //             ...history,
  //             {
  //               date: today,
  //               status: "present",
  //             },
  //           ];
  //         }

  //         return history;
  //       });

  //       const sortedHistory = [...history].sort(
  //         (a, b) =>
  //           new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
  //       );
  //       const latestSession = sortedHistory[0];
  //       const now = new Date();

  //       // 🚨 SHIFT COMPLETED LOGIC: Check if they already finished a shift TODAY
  //       if (latestSession && latestSession.checkOut) {
  //         const sessionDate = new Date(
  //           latestSession.createdAt || latestSession.date,
  //         );
  //         if (
  //           now.getDate() === sessionDate.getDate() &&
  //           now.getMonth() === sessionDate.getMonth() &&
  //           now.getFullYear() === sessionDate.getFullYear()
  //         ) {
  //           setCompletedShiftHours(
  //             latestSession.totalWorkingHours || "Shift Ended",
  //           );
  //         }
  //       }

  //       let activeCheckInTime = null;
  //       const stored = localStorage.getItem(STORAGE_KEY);

  //       if (stored) {
  //         const storedDate = new Date(stored);
  //         if (now.getTime() - storedDate.getTime() < 24 * 60 * 60 * 1000) {
  //           activeCheckInTime = storedDate;
  //         } else {
  //           localStorage.removeItem(STORAGE_KEY);
  //         }
  //       }

  //       // if (
  //       //   !activeCheckInTime &&
  //       //   latestSession &&
  //       //   latestSession.checkIn &&
  //       //   !latestSession.checkOut
  //       // ) {
  //       //   const sessionDate = new Date(
  //       //     latestSession.createdAt || latestSession.date || now,
  //       //   );

  //       //   if (typeof latestSession.checkIn === "string") {
  //       //     const timeMatch = latestSession.checkIn.match(
  //       //       /(\d{1,2}):(\d{2})\s*(AM|PM)?/i,
  //       //     );
  //       //     if (timeMatch) {
  //       //       let hours = parseInt(timeMatch[1], 10);
  //       //       const minutes = parseInt(timeMatch[2], 10);
  //       //       const modifier = timeMatch[3];

  //       //       if (modifier) {
  //       //         if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
  //       //         if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
  //       //       }

  //       //       sessionDate.setHours(hours, minutes, 0, 0);
  //       //     }
  //       //   }

  //       //   if (now.getTime() - sessionDate.getTime() < 24 * 60 * 60 * 1000) {
  //       //     activeCheckInTime = sessionDate;
  //       //     localStorage.setItem(STORAGE_KEY, activeCheckInTime.toISOString());
  //       //   }
  //       // }
  //       if (
  //         !activeCheckInTime &&
  //         latestSession &&
  //         latestSession.checkInAt &&
  //         !latestSession.checkOut
  //       ) {
  //         const sessionDate = new Date(latestSession.checkInAt);

  //         // Restore only if it's today's attendance
  //         if (
  //           sessionDate.getDate() === now.getDate() &&
  //           sessionDate.getMonth() === now.getMonth() &&
  //           sessionDate.getFullYear() === now.getFullYear()
  //         ) {
  //           activeCheckInTime = sessionDate;
  //           localStorage.setItem(STORAGE_KEY, sessionDate.toISOString());
  //         }
  //       }

  //       if (activeCheckInTime) {
  //         setIsCheckedIn(true);
  //         setCheckInTime(activeCheckInTime);
  //       } else {
  //         setIsCheckedIn(false);
  //         setCheckInTime(null);
  //         localStorage.removeItem(STORAGE_KEY);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch personal attendance", error);
  //   }
  // }, []);
  //   const fetchPersonalData = useCallback(async () => {
  //   try {
  //     const { data } = await axiosInstance.get("/api/v1/attendance/user");

  //     if (data.success && data.data) {
  //       setPersonalStats({
  //         attendanceRate: data.data.attendanceRate || "0%",
  //         lateDays: data.data.lateDays || 0,
  //       });

  //       const history = data.data.history || data.data.attendances || [];

  //       // Convert API data
  //       const formattedHistory = history.map((item) => ({
  //         ...item,
  //         date: new Date(item.date),
  //         checkInAt: item.checkInAt ? new Date(item.checkInAt) : null,
  //       }));

  //       setAttendanceHistory(formattedHistory);

  //       const sortedHistory = [...formattedHistory].sort(
  //         (a, b) =>
  //           new Date(b.checkInAt || b.createdAt || b.date) -
  //           new Date(a.checkInAt || a.createdAt || a.date)
  //       );

  //       const latestSession = sortedHistory[0];
  //       const now = new Date();

  //       // Today's completed shift
  //       if (
  //         latestSession &&
  //         latestSession.checkOut &&
  //         new Date(latestSession.date).toDateString() === now.toDateString()
  //       ) {
  //         setCompletedShiftHours(
  //           latestSession.totalWorkingHours || "Shift Ended"
  //         );
  //       } else {
  //         setCompletedShiftHours(null);
  //       }

  //       let activeCheckInTime = null;

  //       // Restore from local storage
  //       const stored = localStorage.getItem(STORAGE_KEY);

  //       if (stored) {
  //         const storedDate = new Date(stored);

  //         if (storedDate.toDateString() === now.toDateString()) {
  //           activeCheckInTime = storedDate;
  //         } else {
  //           localStorage.removeItem(STORAGE_KEY);
  //         }
  //       }

  //       // Restore from backend if browser storage missing
  //       if (
  //         !activeCheckInTime &&
  //         latestSession &&
  //         latestSession.checkInAt &&
  //         !latestSession.checkOut
  //       ) {
  //         const sessionDate = new Date(latestSession.checkInAt);

  //         if (sessionDate.toDateString() === now.toDateString()) {
  //           activeCheckInTime = sessionDate;
  //           localStorage.setItem(STORAGE_KEY, sessionDate.toISOString());
  //         }
  //       }

  //       if (activeCheckInTime) {
  //         setIsCheckedIn(true);
  //         setCheckInTime(activeCheckInTime);
  //       } else {
  //         setIsCheckedIn(false);
  //         setCheckInTime(null);
  //         localStorage.removeItem(STORAGE_KEY);
  //       }
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
      }));

      setAttendanceHistory(formattedHistory);

      const sortedHistory = [...formattedHistory].sort(
        (a, b) =>
          new Date(b.checkInAt || b.createdAt || b.date) -
          new Date(a.checkInAt || a.createdAt || a.date)
      );

      const latestSession = sortedHistory[0];
      const now = new Date();

      // Default values
      setIsCheckedIn(false);
      setCompletedShiftHours(null);

      if (latestSession) {
        // Always show latest check-in
        if (latestSession.checkInAt) {
          setCheckInTime(new Date(latestSession.checkInAt));
        } else {
          setCheckInTime(null);
        }
        if (latestSession?.checkOut) {
          const [hours, minutes] = latestSession.checkOut.split(":");

          const checkoutDate = new Date(latestSession.date);
          checkoutDate.setHours(hours);
          checkoutDate.setMinutes(minutes);

          setCheckOutTime(checkoutDate);
        } else {
          setCheckOutTime(null);
        }
        // Show completed shift after checkout
        if (
          latestSession.checkOut &&
          new Date(latestSession.date).toDateString() === now.toDateString()
        ) {
          setCompletedShiftHours(
            latestSession.totalWorkingHours || "Shift Ended"
          );
        }

        // User is still checked in
        if (
          latestSession.checkInAt &&
          !latestSession.checkOut &&
          new Date(latestSession.date).toDateString() === now.toDateString()
        ) {
          setIsCheckedIn(true);
          setCheckInTime(new Date(latestSession.checkInAt));

          localStorage.setItem(
            STORAGE_KEY,
            new Date(latestSession.checkInAt).toISOString()
          );
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        setCheckInTime(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to fetch personal attendance", error);
    }
  }, []);

  useEffect(() => {
    fetchPersonalData();
  }, [fetchPersonalData]);

  // ─── CHECK IN ───
  // const handleCheckIn = async () => {
  //   try {
  //     setIsSubmitting(true);
  //     setActionType("checkin");
  //     const loc = await getLocation();
  //     if (loc) {
  //       setCoords(loc);
  //       setLocation("Office Location (Verified)");
  //     }

  //     const body = { notes: remarks };
  //     if (loc) {
  //       body.latitude = loc.latitude;
  //       body.longitude = loc.longitude;
  //     }

  //     const { data } = await axiosInstance.post(
  //       "/api/v1/attendance/check-in",
  //       body,
  //     );
  //     if (data.success) {
  //       notify.success("Checked In", "You have been clocked in successfully.");
  //       const now = new Date();
  //       setCheckInTime(now);
  //       setIsCheckedIn(true);
  //       setCompletedShiftHours(null); // Reset completed status if checking in again
  //       localStorage.setItem(STORAGE_KEY, now.toISOString());
  //       fetchPersonalData();
  //     }
  //     setAttendanceHistory((prev) => {
  //       const today = new Date();

  //       // check if already exists
  //       const exists = prev.find((r) => {
  //         const d = new Date(r.date);
  //         return (
  //           d.getDate() === today.getDate() &&
  //           d.getMonth() === today.getMonth() &&
  //           d.getFullYear() === today.getFullYear()
  //         );
  //       });

  //       if (exists) return prev;

  //       return [
  //         ...prev,
  //         {
  //           date: today,
  //           status: "present", // ✅ THIS MAKES IT GREEN
  //         },
  //       ];
  //     });
  //   } catch (error) {
  //     notify.error(
  //       "Check-in Failed",
  //       error.response?.data?.message || "Unable to clock in.",
  //     );
  //   } finally {
  //     setIsSubmitting(false);
  //     setActionType(null);
  //   }
  // };
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

  // ─── CHECK OUT ───
  // const handleCheckOut = async () => {
  //   try {
  //     setIsSubmitting(true);
  //     setActionType("checkout");
  //     const loc = await getLocation();
  //     if (loc) {
  //       setCoords(loc);
  //       setLocation("Office Location (Verified)");
  //     }

  //     const body = {};
  //     if (loc) {
  //       body.latitude = loc.latitude;
  //       body.longitude = loc.longitude;
  //     }

  //     const { data } = await axiosInstance.put(
  //       "/api/v1/attendance/check-out",
  //       body,
  //     );
  //     if (data.success) {
  //       const workedHours = data.data?.totalWorkingHours || elapsedTime;
  //       notify.success(
  //         "Checked Out Successfully",
  //         `Great work today! Total hours: ${workedHours}`,
  //       );

  //       setIsCheckedIn(false);
  //       setCheckInTime(null);
  //       setRemarks("");
  //       setCompletedShiftHours(workedHours); // 🚨 SAVE FINAL TIME
  //       localStorage.removeItem(STORAGE_KEY);
  //       fetchPersonalData();
  //     }
  //   } catch (error) {
  //     notify.error(
  //       "Check-out Failed",
  //       error.response?.data?.message || "Unable to clock out.",
  //     );
  //   } finally {
  //     setIsSubmitting(false);
  //     setActionType(null);
  //   }
  // };
  //   const handleCheckOut = async () => {
  //   try {
  //     setIsSubmitting(true);
  //     setActionType("checkout");

  //     const loc = await getLocation();

  //     if (loc) {
  //       setCoords(loc);
  //       setLocation("Office Location (Verified)");
  //     }

  //     const body = {};

  //     if (loc) {
  //       body.latitude = loc.latitude;
  //       body.longitude = loc.longitude;
  //     }

  //     const { data } = await axiosInstance.put(
  //       "/api/v1/attendance/check-out",
  //       body
  //     );

  //     if (data.success) {
  //       const workedHours =
  //         data.data?.totalWorkingHours || elapsedTime;

  //       notify.success(
  //         "Checked Out Successfully",
  //         `Great work today! Total hours: ${workedHours}`
  //       );

  //       setIsCheckedIn(false);

  //       // Don't clear immediately
  //       // fetchPersonalData() will restore today's check-in & check-out
  //       setRemarks("");

  //       setCompletedShiftHours(workedHours);

  //       localStorage.removeItem(STORAGE_KEY);

  //       // Refresh latest attendance
  //       await fetchPersonalData();
  //     }
  //   } catch (error) {
  //     notify.error(
  //       "Check-out Failed",
  //       error.response?.data?.message || "Unable to clock out."
  //     );
  //   } finally {
  //     setIsSubmitting(false);
  //     setActionType(null);
  //   }
  // };
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
  const todayRecord = attendanceHistory.find((r) => {
    const d = new Date(r.date);
    const today = new Date();

    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  });
  return (

    <div className="w-full flex flex-col gap-6">
      {/* TOP CHECK-IN BAR */}
      {/* <div
        className="rounded-2xl px-5 py-6"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-center">
        
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
      </div> */}
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
                {formatIST(checkInTime)}
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
                disabled={isSubmitting || completedShiftHours}
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

      {/* ATTENDANCE + CALENDAR */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
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
      </div> */}
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
            const todayRecord = attendanceHistory.find((r) => {
              const d = new Date(r.date);
              const today = new Date();

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

