import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import useNotification from "../../hooks/useNotification.jsx";
import axiosInstance from "../../api/axiosInstance.js";

// Formatter for Department Names
const formatDeptName = (name) => {
  if (!name) return "";
  return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const blankForm = {
  user: "",
  roleTitle: "",
  department: "",
  manager: "",
};

export default function CreateOrgNodeModal({ open, onClose, onSuccess }) {
  const notify = useNotification();

  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown Data States
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // ─── FETCH ALL DROPDOWN DATA IN PARALLEL ───
  useEffect(() => {
    if (open) {
      setLoadingData(true);
      Promise.allSettled([
        axiosInstance.get("/api/v1/user/all-users"),
        axiosInstance.get("/api/v1/user/all-managers"),
        axiosInstance.get("/api/v1/department"),
      ])
        .then(([usersRes, managersRes, deptsRes]) => {
          if (usersRes.status === "fulfilled" && usersRes.value.data?.success) {
            setUsers(usersRes.value.data.data || []);
          }
          if (
            managersRes.status === "fulfilled" &&
            managersRes.value.data?.success
          ) {
            setManagers(managersRes.value.data.data || []);
          }
          if (deptsRes.status === "fulfilled" && deptsRes.value.data?.success) {
            setDepartments(deptsRes.value.data.data || []);
          }
        })
        .catch((err) => console.error("Failed to fetch dropdown data:", err))
        .finally(() => setLoadingData(false));

      // Reset form on open
      setForm(blankForm);
      setErrors({});
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.user) newErrors.user = "Employee is required";
    if (!form.roleTitle?.trim()) newErrors.roleTitle = "Role Title is required";
    if (!form.department) newErrors.department = "Department is required";
    // Manager might be optional for the CEO/Top Level, but if required by your backend, uncomment the line below:
    // if (!form.manager) newErrors.manager = "Manager is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await axiosInstance.post(
        "/api/v1/organization-chart/create-org",
        form,
      );
      if (data.success || data.message?.includes("successfully")) {
        // Status 201 check
        notify.success(
          "Node Created",
          "Successfully added to the organization chart.",
        );
        onSuccess(); // Refresh the chart in the parent
        onClose(); // Close modal
      }
    } catch (error) {
      notify.error(
        "Creation Failed",
        error.response?.data?.message || "Could not create org node.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-card-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Create Organization Node
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Assign an employee to the hierarchy tree.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {loadingData && (
            <div className="flex items-center justify-center gap-2 text-sm text-accent bg-accent/10 py-2 rounded-lg">
              <Loader2 size={16} className="animate-spin" /> Loading Directory
              Data...
            </div>
          )}

          {/* 1. User Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Employee <span className="text-danger">*</span>
            </label>
            <select
              disabled={loadingData}
              value={form.user}
              onChange={(e) => handleChange("user", e.target.value)}
              className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer focus:border-btn transition-colors disabled:opacity-50 ${errors.user ? "border-danger" : "border-card-border"}`}
            >
              <option value="" disabled>
                Select Employee
              </option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || `${u.firstName} ${u.lastName}`}
                </option>
              ))}
            </select>
            {errors.user && (
              <p className="text-xs text-danger mt-1">{errors.user}</p>
            )}
          </div>

          {/* 2. Role Title */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Role Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Software Engineer"
              disabled={loadingData}
              value={form.roleTitle}
              onChange={(e) => handleChange("roleTitle", e.target.value)}
              className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-btn transition-colors disabled:opacity-50 ${errors.roleTitle ? "border-danger" : "border-card-border"}`}
            />
            {errors.roleTitle && (
              <p className="text-xs text-danger mt-1">{errors.roleTitle}</p>
            )}
          </div>

          {/* 3. Department Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Department <span className="text-danger">*</span>
            </label>
            <select
              disabled={loadingData}
              value={form.department}
              onChange={(e) => handleChange("department", e.target.value)}
              className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer focus:border-btn transition-colors disabled:opacity-50 ${errors.department ? "border-danger" : "border-card-border"}`}
            >
              <option value="" disabled>
                Select Department
              </option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {formatDeptName(dept.name)}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-xs text-danger mt-1">{errors.department}</p>
            )}
          </div>

          {/* 4. Manager Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Reports To (Manager)
            </label>
            <select
              disabled={loadingData}
              value={form.manager}
              onChange={(e) => handleChange("manager", e.target.value)}
              className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none cursor-pointer focus:border-btn transition-colors disabled:opacity-50"
            >
              <option value="">No Manager (Top Level / CEO)</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name || `${m.firstName} ${m.lastName}`}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || loadingData}
              className="flex-1 py-2.5 rounded-xl bg-input text-text-secondary border border-card-border text-sm font-semibold hover:bg-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingData}
              className="flex-1 py-2.5 rounded-xl bg-btn text-white border-none text-sm font-semibold hover:bg-btn-hover transition-colors disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create Node"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
