import { X, CalendarPlus } from "lucide-react";
import React, { useState } from "react";

import colors from "../../constants/colors";
import Button from "../ui/Button";


export default function ApplyLeaveModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    leaveType: "casualLeave",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason) {
      return setError("Please fill all required fields.");
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      return setError("End date cannot be before start date.");
    }

    setIsSubmitting(true);
    const result = await onSubmit(form);
    setIsSubmitting(false);

    if (result.success) {
      setForm({
        leaveType: "casualLeave",
        startDate: "",
        endDate: "",
        reason: "",
      });
      onClose();
    } else {
      setError(result.message || "Failed to apply for leave.");
    }
  };

  // return (
  //   <div
  //     className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  //     onClick={onClose}
  //   >
  //     <div
  //       className="bg-card border border-card-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col"
  //       onClick={(e) => e.stopPropagation()}
  //     >
  //       <div className="flex items-center justify-between p-5 border-b border-card-border">
  //         <div className="flex items-center gap-3">
  //           <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
  //             <CalendarPlus size={20} />
  //           </div>
  //           <h2 className="text-lg font-bold text-text-primary">
  //             Apply for Leave
  //           </h2>
  //         </div>
  //         <button
  //           onClick={onClose}
  //           className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-input transition-colors"
  //         >
  //           <X size={20} />
  //         </button>
  //       </div>

  //       <form onSubmit={handleSubmit} className="p-5 space-y-4">
  //         {error && (
  //           <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 text-sm rounded-lg">
  //             {error}
  //           </div>
  //         )}

  //         <div>
  //           <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //             Leave Type
  //           </label>
  //           <select
  //             value={form.leaveType}
  //             onChange={(e) => handleChange("leaveType", e.target.value)}
  //             className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors cursor-pointer"
  //           >
  //             <option value="casualLeave">Casual Leave</option>
  //             <option value="sickLeave">Sick Leave</option>
  //             <option value="earnedLeave">Earned Leave</option>
  //             <option value="compOff">Comp-Off</option>
  //           </select>
  //         </div>

  //         <div className="grid grid-cols-2 gap-4">
  //           <div>
  //             <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //               Start Date <span className="text-danger">*</span>
  //             </label>
  //             <input
  //               type="date"
  //               value={form.startDate}
  //               onChange={(e) => handleChange("startDate", e.target.value)}
  //               className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
  //             />
  //           </div>
  //           <div>
  //             <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //               End Date <span className="text-danger">*</span>
  //             </label>
  //             <input
  //               type="date"
  //               value={form.endDate}
  //               onChange={(e) => handleChange("endDate", e.target.value)}
  //               className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
  //             />
  //           </div>
  //         </div>

  //         <div>
  //           <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //             Reason <span className="text-danger">*</span>
  //           </label>
  //           <textarea
  //             rows="3"
  //             placeholder="Briefly state your reason..."
  //             value={form.reason}
  //             onChange={(e) => handleChange("reason", e.target.value)}
  //             className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors resize-none"
  //           />
  //         </div>

  //         <div className="pt-4 flex gap-3">
  //           <button
  //             type="button"
  //             onClick={onClose}
  //             disabled={isSubmitting}
  //             className="flex-1 py-2.5 rounded-xl bg-input text-text-secondary border border-card-border text-sm font-semibold hover:bg-hover transition-colors"
  //           >
  //             Cancel
  //           </button>
  //           <Button type="submit" disabled={isSubmitting} className="flex-1">
  //             {isSubmitting ? "Submitting..." : "Submit Request"}
  //           </Button>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // );

  return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col border"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 border-b"
        style={{ borderColor: colors.cardBorder }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: colors.blueLight,
              color: colors.blue,
            }}
          >
            <CalendarPlus size={20} />
          </div>

          <h2
            className="text-lg font-bold"
            style={{ color: colors.textPrimary }}
          >
            Apply for Leave
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: colors.textSecondary,
            backgroundColor: "transparent",
          }}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <div
            className="p-3 text-sm rounded-lg border"
            style={{
              backgroundColor: colors.dangerLight,
              color: colors.danger,
              borderColor: colors.danger,
            }}
          >
            {error}
          </div>
        )}

        {/* Leave Type */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: colors.textPrimary }}
          >
            Leave Type
          </label>

          <select
            value={form.leaveType}
            onChange={(e) => handleChange("leaveType", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.textPrimary,
              borderColor: colors.cardBorder,
            }}
          >
            <option value="casualLeave">Casual Leave</option>
            <option value="sickLeave">Sick Leave</option>
            <option value="earnedLeave">Earned Leave</option>
            <option value="compOff">Comp-Off</option>
          </select>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: colors.textPrimary }}
            >
              Start Date{" "}
              <span style={{ color: colors.danger }}>*</span>
            </label>

            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
              style={{
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                borderColor: colors.cardBorder,
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: colors.textPrimary }}
            >
              End Date{" "}
              <span style={{ color: colors.danger }}>*</span>
            </label>

            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
              style={{
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                borderColor: colors.cardBorder,
              }}
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: colors.textPrimary }}
          >
            Reason{" "}
            <span style={{ color: colors.danger }}>*</span>
          </label>

          <textarea
            rows={3}
            placeholder="Briefly state your reason..."
            value={form.reason}
            onChange={(e) => handleChange("reason", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border text-sm resize-none outline-none"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.textPrimary,
              borderColor: colors.cardBorder,
            }}
          />
        </div>

        {/* Buttons */}
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.textSecondary,
              borderColor: colors.cardBorder,
            }}
          >
            Cancel
          </button>

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="custom"
            bg={colors.buttonBg}
            hoverBg={colors.buttonHover}
            text="#FFFFFF"
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  </div>
);
}
