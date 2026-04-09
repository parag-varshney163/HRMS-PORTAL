import React, { useState, useEffect } from "react";
import { X, SlidersHorizontal, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import useNotification from "../../hooks/useNotification.jsx";
import axiosInstance from "../../api/axiosInstance";
import FilterDropDown from "../ui/FilterDropDown"; // 🚨 Imported your custom dropdown

export default function UpdateBalanceModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    userId: "", // Will store the MongoDB _id
    casualLeave: 0,
    sickLeave: 0,
    earnedLeave: 0,
    compOff: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── NEW: USERS STATE ───
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const notify = useNotification();

  // ─── FETCH USERS WHEN MODAL OPENS ───
  useEffect(() => {
    if (open) {
      setLoadingUsers(true);
      axiosInstance
        .get("/api/v1/user/all-users")
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setUsers(res.data.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch users:", err);
          notify.error("Error", "Could not load employee directory.");
        })
        .finally(() => setLoadingUsers(false));

      // Reset form to clean state
      setForm({
        userId: "",
        casualLeave: 0,
        sickLeave: 0,
        earnedLeave: 0,
        compOff: 0,
      });
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId)
      return notify.warning("Missing Field", "Please select an employee.");

    setIsSubmitting(true);
    const payload = {
      casualLeave: Number(form.casualLeave),
      sickLeave: Number(form.sickLeave),
      earnedLeave: Number(form.earnedLeave),
      compOff: Number(form.compOff),
    };

    await onSubmit(form.userId, payload);
    setIsSubmitting(false);
  };

  // ─── HELPER: FORMAT DROPDOWN OPTIONS ───
  // We format it as "Ayush Kumar (CS_2026...)" to make searching easier
  const userOptions = users.map((u) => `${u.name} (${u.userId})`);
  const selectedUserObj = users.find((u) => u._id === form.userId);
  const userLabel = selectedUserObj
    ? `${selectedUserObj.name} (${selectedUserObj.userId})`
    : "Search Employee...";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-card-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-visible" // Ensure dropdown isn't clipped
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-card-border bg-yellow-500/5 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-500 flex items-center justify-center">
              <SlidersHorizontal size={20} />
            </div>
            <h2 className="text-lg font-bold text-text-primary">
              Adjust Leave Balance
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-input transition-colors disabled:opacity-50 cursor-pointer border-none bg-transparent"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-text-secondary mb-4">
            Add positive numbers to increase balance, negative numbers to
            decrease.
          </p>

          {/* 🚨 DYNAMIC EMPLOYEE DROPDOWN 🚨 */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5 flex items-center justify-between">
              <span>
                Employee <span className="text-danger">*</span>
              </span>
              {loadingUsers && (
                <Loader2 size={12} className="animate-spin text-yellow-500" />
              )}
            </label>

            {loadingUsers ? (
              <div className="w-full bg-input text-text-secondary px-4 py-2.5 rounded-lg border border-card-border text-sm flex items-center">
                Loading directory...
              </div>
            ) : (
              <FilterDropDown
                key={`user-${userLabel}`} // Forces re-render on selection
                options={userOptions}
                defaultLabel={userLabel}
                width="100%"
                onSelect={(selectedFormattedName) => {
                  // Reverse map: find the object that matches the formatted string, then grab its _id
                  const user = users.find(
                    (u) => `${u.name} (${u.userId})` === selectedFormattedName,
                  );
                  if (user) handleChange("userId", user._id);
                }}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Casual Leave
              </label>
              <input
                type="number"
                value={form.casualLeave}
                onChange={(e) => handleChange("casualLeave", e.target.value)}
                className="w-full bg-input text-text-primary px-3 py-2 rounded-lg border border-card-border text-sm outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Sick Leave
              </label>
              <input
                type="number"
                value={form.sickLeave}
                onChange={(e) => handleChange("sickLeave", e.target.value)}
                className="w-full bg-input text-text-primary px-3 py-2 rounded-lg border border-card-border text-sm outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Earned Leave
              </label>
              <input
                type="number"
                value={form.earnedLeave}
                onChange={(e) => handleChange("earnedLeave", e.target.value)}
                className="w-full bg-input text-text-primary px-3 py-2 rounded-lg border border-card-border text-sm outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Comp Off
              </label>
              <input
                type="number"
                value={form.compOff}
                onChange={(e) => handleChange("compOff", e.target.value)}
                className="w-full bg-input text-text-primary px-3 py-2 rounded-lg border border-card-border text-sm outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-transparent text-text-secondary border border-card-border text-sm font-semibold hover:bg-input transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="custom"
              bg="#eab308"
              text="#000"
              disabled={isSubmitting}
              className="flex-1 justify-center"
            >
              {isSubmitting ? "Updating..." : "Update Balances"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
