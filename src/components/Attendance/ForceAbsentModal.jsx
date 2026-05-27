import { X, AlertTriangle } from "lucide-react";
// ForceAbsentModal.jsx
import React, { useState } from "react";

import axiosInstance from "../../api/axiosInstance";
import FilterDropDown from "../ui/FilterDropDown";
import Button from "../ui/Button";


const leaveOptions = [
  "casualLeave",
  "sickLeave",
  "earnedLeave",
  "compOff",
];

export default function ForceAbsentModal({
  open,
  onClose,
  onSuccess,
  employeeId,
}) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    leaveType: "",
    reason: "",
  });

  const handleSubmit = async () => {
    try {
      if (!formData.date || !formData.leaveType) {
        alert("Please fill all required fields");
        return;
      }

      setLoading(true);

      const payload = {
        userId: employeeId,
        date: formData.date,
        leaveType: formData.leaveType,
        reason: formData.reason,
      };

      const { data } = await axiosInstance.post(
        "/api/v1/attendance/force-absent",
        payload
      );

      if (data?.success) {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error("Force absent failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card border border-card-border rounded-3xl overflow-hidden shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-card-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Force Mark Absent
              </h2>

              <p className="text-sm text-text-secondary">
                Deduct leave balance & mark absent
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 transition"
          >
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-5">

          {/* DATE */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Date *
            </label>

            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  date: e.target.value,
                })
              }
              className="w-full bg-input border border-card-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-btn"
            />
          </div>

          {/* LEAVE TYPE */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Leave Type *
            </label>

            <FilterDropDown
              width="100%"
              defaultLabel="Select Leave Type"
              options={leaveOptions}
              onSelect={(value) =>
                setFormData({
                  ...formData,
                  leaveType: value,
                })
              }
            />
          </div>

          {/* REASON */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Reason
            </label>

            <textarea
              rows={4}
              placeholder="Enter reason..."
              value={formData.reason}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reason: e.target.value,
                })
              }
              className="w-full bg-input border border-card-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-btn resize-none"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-card-border">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading ? "Processing..." : "Mark Absent"}
          </Button>
        </div>
      </div>
    </div>
  );
}
