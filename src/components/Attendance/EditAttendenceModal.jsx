import { X, CheckCircle, Clock } from "lucide-react"; // 🚨 Imported extra icons
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";

import useNotification from "../../hooks/useNotification.jsx"; // 🚨 Ensure path is correct
import axiosInstance from "../../api/axiosInstance"; // 🚨 Ensure path is correct
import colors from "../../constants/colors.js";
import Button from "../ui/Button";


// ─── 1. UTC -> IST (For displaying in the inputs) ───
const convertUtcToIst = (timeString) => {
  if (!timeString) return "";
  try {
    const [hoursStr, minutesStr] = timeString.split(":");
    let hours = parseInt(hoursStr, 10);
    let minutes = parseInt(minutesStr, 10);

    hours += 5;
    minutes += 30;

    if (minutes >= 60) {
      minutes -= 60;
      hours += 1;
    }
    if (hours >= 24) {
      hours -= 24;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  } catch (e) {
    return timeString;
  }
};

// ─── 2. IST -> UTC (For submitting back to the API) ───
const convertIstToUtc = (timeString) => {
  if (!timeString) return "";
  try {
    const [hoursStr, minutesStr] = timeString.split(":");
    let hours = parseInt(hoursStr, 10);
    let minutes = parseInt(minutesStr, 10);

    hours -= 5;
    minutes -= 30;

    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
    }
    if (hours < 0) {
      hours += 24;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  } catch (e) {
    return timeString;
  }
};

const EditAttendanceModal = ({ open, onClose, onSave, onRefresh, record }) => {
  const [form, setForm] = useState({ checkInTime: "", checkOutTime: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarkingFull, setIsMarkingFull] = useState(false); // 🚨 New state for the API
  const notify = useNotification();

  // 🚨 Security Check: Only Admins should see the Quick Action
  const isAdmin = localStorage.getItem("roleName")?.toLowerCase() === "admin";

  // Populate times when modal opens: Apply UTC -> IST
  useEffect(() => {
    if (open && record) {
      setForm({
        checkInTime: convertUtcToIst(record.checkIn) || "",
        checkOutTime: convertUtcToIst(record.checkOut) || "",
      });
    } else {
      setForm({ checkInTime: "", checkOutTime: "" });
    }
  }, [open, record]);

  if (!open) return null;

  // ─── HANDLER: MANUAL TIME UPDATE ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Convert the IST input values back to UTC before saving
    const payload = {
      checkInTime: convertIstToUtc(form.checkInTime),
      checkOutTime: convertIstToUtc(form.checkOutTime),
    };

    await onSave(record._id, payload);
    setIsSubmitting(false);
  };

  // ─── 🚨 NEW HANDLER: ADMIN MARK FULL DAY ───
  const handleMarkFullDay = async () => {
    try {
      setIsMarkingFull(true);

      // Backend expects "YYYY-MM-DD"
      const formattedDate = new Date(record.date).toISOString().split("T")[0];

      const { data } = await axiosInstance.post(
        "/api/v1/attendance/mark-full-day",
        {
          userId: record.user._id, // Extracting the MongoDB ID of the user
          date: formattedDate,
        },
      );

      if (data.success) {
        notify.success(
          "Full Day Marked",
          "Employee attendance updated successfully.",
        );
        onClose();
        if (onRefresh) onRefresh(); // 🚨 Call this to refresh your table!
      }
    } catch (error) {
      notify.error(
        "Action Failed",
        error.response?.data?.message || "Could not mark full day.",
      );
    } finally {
      setIsMarkingFull(false);
    }
  };

  // return (
  //   <div
  //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  //     onClick={onClose}
  //   >
  //     <div
  //       className="bg-card border border-card-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
  //       onClick={(e) => e.stopPropagation()}
  //     >
  //       {/* Header */}
  //       <div className="flex items-center justify-between p-5 border-b border-card-border bg-input/20">
  //         <div>
  //           <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
  //             <Clock size={18} className="text-accent" /> Edit Timesheet
  //           </h2>
  //           <p className="text-xs text-text-secondary mt-1">
  //             <span className="font-semibold text-text-primary">
  //               {record?.user?.firstName} {record?.user?.lastName}
  //             </span>{" "}
  //             • {new Date(record?.date).toLocaleDateString()}
  //           </p>
  //         </div>
  //         <button
  //           type="button"
  //           onClick={onClose}
  //           className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer border-none bg-transparent"
  //         >
  //           <X size={20} />
  //         </button>
  //       </div>

  //       <div className="p-5">
  //         {/* ─── 🚨 ADMIN QUICK ACTION ZONE ─── */}
  //         {isAdmin && (
  //           <div className="mb-6 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
  //             <div className="flex items-center gap-2 mb-1.5">
  //               <CheckCircle className="text-green-400" size={16} />
  //               <h3 className="text-sm font-bold text-green-400">
  //                 Admin Override
  //               </h3>
  //             </div>
  //             <p className="text-xs text-text-secondary mb-4 leading-relaxed">
  //               Bypass manual time entry and instantly mark this employee as
  //               present for the full day.
  //             </p>
  //             <button
  //               type="button"
  //               onClick={handleMarkFullDay}
  //               disabled={isMarkingFull || isSubmitting}
  //               className="w-full py-2.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
  //             >
  //               {isMarkingFull ? "Marking..." : <>Mark as Full Day (Present)</>}
  //             </button>
  //           </div>
  //         )}

  //         {/* Divider */}
  //         {isAdmin && (
  //           <div className="flex items-center gap-4 mb-5">
  //             <div className="h-px bg-card-border flex-1"></div>
  //             <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">
  //               Or Edit Manually
  //             </span>
  //             <div className="h-px bg-card-border flex-1"></div>
  //           </div>
  //         )}

  //         {/* ─── MANUAL TIME FORM ─── */}
  //         <form onSubmit={handleSubmit} className="space-y-4">
  //           <div className="grid grid-cols-2 gap-4">
  //             <div>
  //               <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //                 Check In (IST)
  //               </label>
  //               <input
  //                 type="time"
  //                 required
  //                 value={form.checkInTime}
  //                 onChange={(e) =>
  //                   setForm({ ...form, checkInTime: e.target.value })
  //                 }
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 cursor-pointer"
  //               />
  //             </div>

  //             <div>
  //               <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //                 Check Out (IST)
  //               </label>
  //               <input
  //                 type="time"
  //                 value={form.checkOutTime}
  //                 onChange={(e) =>
  //                   setForm({ ...form, checkOutTime: e.target.value })
  //                 }
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 cursor-pointer"
  //               />
  //             </div>
  //           </div>

  //           <div className="pt-4 flex gap-3">
  //             <button
  //               type="button"
  //               onClick={onClose}
  //               disabled={isSubmitting || isMarkingFull}
  //               className="flex-1 py-2.5 rounded-xl border border-card-border text-sm font-semibold hover:bg-input transition-colors cursor-pointer bg-transparent text-text-secondary"
  //             >
  //               Cancel
  //             </button>
  //             <Button
  //               type="submit"
  //               disabled={isSubmitting || isMarkingFull}
  //               className="flex-1 justify-center py-2.5"
  //             >
  //               {isSubmitting ? "Saving..." : "Update Times"}
  //             </Button>
  //           </div>
  //         </form>
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 border-b"
        style={{
          backgroundColor: colors.inputBg,
          borderColor: colors.cardBorder,
        }}
      >
        <div>
          <h2
            className="text-lg font-bold flex items-center gap-2"
            style={{ color: colors.textPrimary }}
          >
            <Clock size={18} color={colors.accent} />
            Edit Timesheet
          </h2>

          <p
            className="text-xs mt-1"
            style={{ color: colors.textSecondary }}
          >
            <span
              className="font-semibold"
              style={{ color: colors.textPrimary }}
            >
              {record?.user?.firstName} {record?.user?.lastName}
            </span>{" "}
            • {new Date(record?.date).toLocaleDateString()}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="transition-colors cursor-pointer border-none bg-transparent"
          style={{ color: colors.textSecondary }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = colors.textPrimary)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = colors.textSecondary)
          }
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-5">
        {/* Admin Override */}
        {isAdmin && (
          <div
            className="mb-6 p-4 rounded-xl"
            style={{
              backgroundColor: colors.successLight,
              border: `1px solid ${colors.success}`,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle size={16} color={colors.success} />
              <h3
                className="text-sm font-bold"
                style={{ color: colors.success }}
              >
                Admin Override
              </h3>
            </div>

            <p
              className="text-xs mb-4 leading-relaxed"
              style={{ color: colors.textSecondary }}
            >
              Bypass manual time entry and instantly mark this employee as
              present for the full day.
            </p>

            <button
              type="button"
              onClick={handleMarkFullDay}
              disabled={isMarkingFull || isSubmitting}
              className="w-full py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: colors.successLight,
                color: colors.success,
                border: `1px solid ${colors.success}`,
              }}
            >
              {isMarkingFull
                ? "Marking..."
                : "Mark as Full Day (Present)"}
            </button>
          </div>
        )}

        {/* Divider */}
        {isAdmin && (
          <div className="flex items-center gap-4 mb-5">
            <div
              className="h-px flex-1"
              style={{ backgroundColor: colors.cardBorder }}
            />
            <span
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: colors.textSecondary }}
            >
              Or Edit Manually
            </span>
            <div
              className="h-px flex-1"
              style={{ backgroundColor: colors.cardBorder }}
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: colors.textPrimary }}
              >
                Check In (IST)
              </label>

              <input
                type="time"
                required
                value={form.checkInTime}
                onChange={(e) =>
                  setForm({ ...form, checkInTime: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: colors.textPrimary }}
              >
                Check Out (IST)
              </label>

              <input
                type="time"
                value={form.checkOutTime}
                onChange={(e) =>
                  setForm({ ...form, checkOutTime: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isMarkingFull}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer bg-transparent disabled:opacity-50"
              style={{
                color: colors.textSecondary,
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              Cancel
            </button>

            <Button
              type="submit"
              disabled={isSubmitting || isMarkingFull}
              className="flex-1 justify-center py-2.5"
            >
              {isSubmitting ? "Saving..." : "Update Times"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
}
;

export default EditAttendanceModal;
