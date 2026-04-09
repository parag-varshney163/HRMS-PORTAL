/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { X, Loader2, User, Briefcase } from "lucide-react";
import useNotification from "../../hooks/useNotification.jsx";
import axiosInstance from "../../api/axiosInstance";
import FilterDropDown from "../ui/FilterDropDown";

// Formatter: "human_resource" -> "Human Resource"
const formatName = (name) => {
  if (!name) return "";
  return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const blankForm = {
  // ─── PERSONAL DETAILS ───
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  gender: "",
  birthdate: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  // ─── EMPLOYMENT DETAILS ───
  department: "", // Captures department _id
  designation: "",
  joiningDate: "",
  employmentType: "full_time",
  workLocation: "office",
  reportingManager: "", // Captures manager _id
  systemRole: "employee",
};

export default function AddEmployeeModal({
  open,
  onClose,
  onSave,
  initialData,
}) {
  const notify = useNotification();
  const isEditMode = !!initialData;

  // ─── STATE ───
  const [activeTab, setActiveTab] = useState("personal"); // "personal" | "employment"
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown Data States
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // ─── FETCH DEPARTMENTS & MANAGERS ───
  useEffect(() => {
    if (open) {
      setLoadingData(true);
      Promise.allSettled([
        axiosInstance.get("/api/v1/department"),
        axiosInstance.get("/api/v1/user/all-managers"),
      ])
        .then(([deptRes, mgrRes]) => {
          if (deptRes.status === "fulfilled" && deptRes.value.data?.success) {
            setDepartments(deptRes.value.data.data || []);
          }
          if (mgrRes.status === "fulfilled" && mgrRes.value.data?.success) {
            setManagers(mgrRes.value.data.data || []);
          }
        })
        .catch((err) => console.error("Failed to fetch dropdown data", err))
        .finally(() => setLoadingData(false));
    }
  }, [open]);

  // ─── POPULATE FORM DATA ───
  useEffect(() => {
    if (open) {
      setActiveTab("personal"); // Reset to first tab on open
      if (initialData) {
        setForm({
          firstName: initialData.firstName || "",
          lastName: initialData.lastName || "",
          email: initialData.email || "",
          phoneNumber: initialData.phone || initialData.phoneNumber || "",
          gender: initialData.gender || "",
          birthdate: initialData.birthdate
            ? initialData.birthdate.split("T")[0]
            : "",
          address: initialData.address || "",
          city: initialData.city || "",
          state: initialData.state || "",
          zipCode: initialData.zipCode || "",

          // 🚨 FIX: Safely grab the department ID directly!
          department:
            initialData.departmentId || initialData.department?._id || "",

          designation: initialData.designation || "",
          joiningDate: initialData.joiningDate
            ? initialData.joiningDate.split("T")[0]
            : "",
          employmentType: initialData.employmentType || "full_time",
          workLocation: initialData.workLocation || "office",
          reportingManager: initialData.reportingManager || "",
          systemRole: initialData.systemRole || "employee",
        });
      } else {
        setForm(blankForm);
      }
      setErrors({});
    }
  }, [initialData, open]);

  if (!open) return null;

  // ─── HANDLERS ───
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName?.trim()) newErrors.firstName = "Required";
    if (!form.lastName?.trim()) newErrors.lastName = "Required";
    if (!form.email?.trim()) newErrors.email = "Required";
    if (!form.phoneNumber?.trim()) newErrors.phoneNumber = "Required";
    // Add employment validation if needed
    // if (!form.department) newErrors.department = "Required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setActiveTab("personal"); // Switch back to personal tab if errors are there
      return;
    }

    setIsSubmitting(true);
    const result = await onSave?.(form); // Send combined payload to parent
    setIsSubmitting(false);

    if (result && !result.success) {
      notify.error(
        "Operation Failed",
        result.message || "Could not save employee.",
      );
    } else if (result?.success) {
      onClose();
    }
  };

  // ─── DROPDOWN MAPPERS ───
  const departmentOptions = departments.map((dept) => formatName(dept.name));
  const selectedDeptObj = departments.find((d) => d._id === form.department);
  const departmentLabel = selectedDeptObj
    ? formatName(selectedDeptObj.name)
    : "Select Department...";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      // 🚨 FIX 1: Prevent closing if currently submitting!
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="bg-card border border-card-border rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-6 pb-0 sticky top-0 bg-card z-10 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">
              {isEditMode ? "Edit Employee Record" : "Onboard New Employee"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting} // 🚨 FIX 2: Disable X button during save
              className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-hover transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* 🚨 TABS NAVIGATION */}
          <div className="flex border-b border-card-border">
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "personal" ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"}`}
            >
              <User size={16} /> Personal Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("employment")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === "employment" ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"}`}
            >
              <Briefcase size={16} /> Employment Details
            </button>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ========================================== */}
          {/* TAB 1: PERSONAL DETAILS                    */}
          {/* ========================================== */}
          {activeTab === "personal" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-btn transition-colors ${errors.firstName ? "border-danger" : "border-card-border"}`}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-danger mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-btn transition-colors ${errors.lastName ? "border-danger" : "border-card-border"}`}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-danger mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-btn transition-colors ${errors.email ? "border-danger" : "border-card-border"}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-danger mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) =>
                      handleChange("phoneNumber", e.target.value)
                    }
                    className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-btn transition-colors ${errors.phoneNumber ? "border-danger" : "border-card-border"}`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-danger mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full appearance-none bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none cursor-pointer focus:border-btn transition-colors"
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.birthdate}
                    onChange={(e) => handleChange("birthdate", e.target.value)}
                    className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Address
                </label>
                <textarea
                  rows="2"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={form.zipCode}
                    onChange={(e) => handleChange("zipCode", e.target.value)}
                    className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* TAB 2: EMPLOYMENT DETAILS                  */}
          {/* ========================================== */}
          {activeTab === "employment" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              {loadingData && (
                <div className="flex justify-center py-2 text-accent text-sm gap-2">
                  <Loader2 size={16} className="animate-spin" /> Fetching Org
                  Data...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) =>
                      handleChange("joiningDate", e.target.value)
                    }
                    className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    System Role
                  </label>
                  <select
                    value={form.systemRole}
                    onChange={(e) => handleChange("systemRole", e.target.value)}
                    className="w-full appearance-none bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none cursor-pointer focus:border-btn transition-colors"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-card-border pt-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Department
                  </label>
                  <FilterDropDown
                    key={`dept-${departmentLabel}`}
                    options={departmentOptions}
                    defaultLabel={departmentLabel}
                    width="100%"
                    onSelect={(selectedName) => {
                      const dept = departments.find(
                        (d) => formatName(d.name) === selectedName,
                      );
                      if (dept) handleChange("department", dept._id);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Designation (Job Title)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={form.designation}
                    onChange={(e) =>
                      handleChange("designation", e.target.value)
                    }
                    className="w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Employment Type
                  </label>
                  <select
                    value={form.employmentType}
                    onChange={(e) =>
                      handleChange("employmentType", e.target.value)
                    }
                    className="w-full appearance-none bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none cursor-pointer focus:border-btn transition-colors"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-1.5">
                    Work Location
                  </label>
                  <select
                    value={form.workLocation}
                    onChange={(e) =>
                      handleChange("workLocation", e.target.value)
                    }
                    className="w-full appearance-none bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none cursor-pointer focus:border-btn transition-colors"
                  >
                    <option value="office">Office</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-card-border pt-4">
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Reporting Manager
                </label>
                <select
                  value={form.reportingManager}
                  onChange={(e) =>
                    handleChange("reportingManager", e.target.value)
                  }
                  className="w-full appearance-none bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none cursor-pointer focus:border-btn transition-colors"
                >
                  <option value="">No Manager (Top Level)</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.firstName} {m.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex gap-3 pt-6 shrink-0 border-t border-card-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-input text-text-secondary border border-card-border text-sm font-semibold hover:bg-hover transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            {activeTab === "personal" ? (
              <button
                type="button"
                onClick={() => setActiveTab("employment")}
                className="flex-1 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-semibold hover:bg-blue-500/20 transition-colors cursor-pointer"
              >
                Next: Job Details ➔
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-btn text-white border-none text-sm font-semibold hover:bg-btn-hover transition-colors cursor-pointer disabled:opacity-70"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                    ? "Save All Changes"
                    : "Complete Onboarding"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
