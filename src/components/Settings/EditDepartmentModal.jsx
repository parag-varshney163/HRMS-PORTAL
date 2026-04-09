import React, { useState } from "react";
import { X, Network } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

export default function EditDepartmentModal({
  open,
  onClose,
  department,
  onSuccess,
}) {
  // Using lazy initialization to ensure it mounts with clean data
  const [form, setForm] = useState(() => ({
    name: department?.departmentName || department?.name || "",
    description: department?.description || "",
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Department name is required");

    setIsSubmitting(true);
    setError("");

    try {
      const targetId = department._id || department.departmentId;
      // Using PUT API from the screenshot
      const { data } = await axiosInstance.put(
        `/api/v1/department/${targetId}`,
        {
          departmentName: form.name, // Ensure this key matches your backend schema expectations
          description: form.description,
        },
      );

      if (data.success) {
        onSuccess(); // Refresh the list
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update department");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-card-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-card-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Network size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Edit Department
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-input transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Department Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Description
            </label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-input text-text-secondary border border-card-border text-sm font-semibold hover:bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-btn text-white border-none text-sm font-semibold hover:bg-btn-hover transition-colors disabled:opacity-70"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
