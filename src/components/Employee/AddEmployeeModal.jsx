import { X, Loader2, User, Briefcase } from "lucide-react";
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";

import useNotification from "../../hooks/useNotification.jsx";
import axiosInstance from "../../api/axiosInstance";
import FilterDropDown from "../ui/FilterDropDown";
import colors from "../../constants/colors.js";


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
  weekoff: [],
  workingHours: "",
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
        axiosInstance.get("/api/v1/user/all-users"),
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
          // reportingManager: initialData.reportingManager || "",
          reportingManager:
            initialData.reportingManager?._id ||
            initialData.reportingManager ||
            "",
          // systemRole: initialData.systemRole || "",
          systemRole:
            initialData.systemRole ||
            initialData.employment?.systemRole ||
            initialData.user?.role ||
            "employee",
          weekoff:
            initialData.weekoff ||
            initialData.employment?.weekoff ||
            [],

          workingHours:
            initialData.workingHours ||
            initialData.employment?.workingHours ||
            "",
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
  const handleNext = (e) => {
    e.preventDefault();

    const validationErrors = {};

    if (!form.firstName?.trim())
      validationErrors.firstName = "Required";

    if (!form.lastName?.trim())
      validationErrors.lastName = "Required";

    if (!form.email?.trim())
      validationErrors.email = "Required";

    if (!form.phoneNumber?.trim())
      validationErrors.phoneNumber = "Required";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setActiveTab("employment");
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
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      style={{ backgroundColor: "rgba(31, 41, 55, 0.60)" }}
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className="p-6 pb-0 sticky top-0 z-10 shrink-0"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
              {isEditMode ? "Edit Employee Record" : "Onboard New Employee"}
            </h2>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1 rounded-lg transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
              style={{ color: colors.textSecondary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.hover;
                e.currentTarget.style.color = colors.textPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = colors.textSecondary;
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* TABS */}
          <div
            className="flex"
            style={{ borderBottom: `1px solid ${colors.cardBorder}` }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer bg-transparent"
              style={{
                borderBottomColor:
                  activeTab === "personal" ? colors.accent : "transparent",
                color:
                  activeTab === "personal"
                    ? colors.accentDark
                    : colors.textSecondary,
              }}
            >
              <User size={16} />
              Personal Details
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("employment")}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer bg-transparent"
              style={{
                borderBottomColor:
                  activeTab === "employment" ? colors.accent : "transparent",
                color:
                  activeTab === "employment"
                    ? colors.accentDark
                    : colors.textSecondary,
              }}
            >
              <Briefcase size={16} />
              Employment Details
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            if (activeTab !== "employment") {
              e.preventDefault();
              return;
            }

            handleSubmit(e);
          }}
          className="p-6 space-y-4"
        >
          {/* PERSONAL DETAILS */}
          {activeTab === "personal" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
                    First Name <span style={{ color: colors.danger }}>*</span>
                  </label>

                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: errors.firstName
                        ? colors.danger
                        : colors.cardBorder,
                    }}
                  />

                  {errors.firstName && (
                    <p className="text-xs mt-1" style={{ color: colors.danger }}>
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
                    Last Name <span style={{ color: colors.danger }}>*</span>
                  </label>

                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: errors.lastName
                        ? colors.danger
                        : colors.cardBorder,
                    }}
                  />

                  {errors.lastName && (
                    <p className="text-xs mt-1" style={{ color: colors.danger }}>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
                    Email <span style={{ color: colors.danger }}>*</span>
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: errors.email ? colors.danger : colors.cardBorder,
                    }}
                  />

                  {errors.email && (
                    <p className="text-xs mt-1" style={{ color: colors.danger }}>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
                    Phone Number <span style={{ color: colors.danger }}>*</span>
                  </label>

                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) =>
                      handleChange("phoneNumber", e.target.value)
                    }
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: errors.phoneNumber
                        ? colors.danger
                        : colors.cardBorder,
                    }}
                  />

                  {errors.phoneNumber && (
                    <p className="text-xs mt-1" style={{ color: colors.danger }}>
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
                    Gender
                  </label>

                  <select
                    value={form.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: colors.cardBorder,
                    }}
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
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    value={form.birthdate}
                    onChange={(e) => handleChange("birthdate", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: colors.cardBorder,
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: colors.textPrimary }}
                >
                  Address
                </label>

                <textarea
                  rows="2"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    color: colors.textPrimary,
                    borderColor: colors.cardBorder,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  ["City", "city"],
                  ["State", "state"],
                  ["Zip Code", "zipCode"],
                ].map(([label, field]) => (
                  <div key={field}>
                    <label
                      className="block text-sm font-semibold mb-1.5"
                      style={{ color: colors.textPrimary }}
                    >
                      {label}
                    </label>

                    <input
                      type="text"
                      value={form[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                      style={{
                        backgroundColor: colors.inputBg,
                        color: colors.textPrimary,
                        borderColor: colors.cardBorder,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPLOYMENT DETAILS */}
          {activeTab === "employment" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              {loadingData && (
                <div
                  className="flex justify-center py-2 text-sm gap-2"
                  style={{ color: colors.accentDark }}
                >
                  <Loader2 size={16} className="animate-spin" />
                  Fetching Org Data...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
                    Joining Date
                  </label>

                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) =>
                      handleChange("joiningDate", e.target.value)
                    }
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: colors.cardBorder,
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
                    System Role
                  </label>

                  <select
                    value={form.systemRole}
                    onChange={(e) => handleChange("systemRole", e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="hr">HR</option>
                  </select>
                </div>
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4"
                style={{ borderTop: `1px solid ${colors.cardBorder}` }}
              >
                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
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
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
                    Designation (Job Title)
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={form.designation}
                    onChange={(e) =>
                      handleChange("designation", e.target.value)
                    }
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: colors.cardBorder,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
                    Employment Type
                  </label>

                  <select
                    value={form.employmentType}
                    onChange={(e) =>
                      handleChange("employmentType", e.target.value)
                    }
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-1.5"
                    style={{ color: colors.textPrimary }}
                  >
                    Work Location
                  </label>

                  <select
                    value={form.workLocation}
                    onChange={(e) =>
                      handleChange("workLocation", e.target.value)
                    }
                    className="w-full appearance-none px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
                    style={{
                      backgroundColor: colors.inputBg,
                      color: colors.textPrimary,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <option value="office">Office</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label
                  className="block mb-2"
                  style={{
                    color: colors.textPrimary,
                    fontWeight: 600,
                  }}
                >
                  Week Off
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-2"
                      style={{ color: colors.textPrimary }}
                    >
                      <input
                        type="checkbox"
                        checked={form.weekoff?.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm((prev) => ({
                              ...prev,
                              weekoff: [...prev.weekoff, day],
                            }));
                          } else {
                            setForm((prev) => ({
                              ...prev,
                              weekoff: prev.weekoff.filter(
                                (item) => item !== day
                              ),
                            }));
                          }
                        }}
                      />

                      {day}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <label
                  className="block mb-2"
                  style={{
                    color: colors.textPrimary,
                    fontWeight: 600,
                  }}
                >
                  Working Hours
                </label>

                <input
                  type="text"
                  placeholder="09:00 - 18:00"
                  value={form.workingHours}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      workingHours: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl px-3 py-2"
                  style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              <div
                className="pt-4"
                style={{ borderTop: `1px solid ${colors.cardBorder}` }}
              >
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: colors.textPrimary }}
                >
                  Reporting Manager
                </label>

                <select
                  value={form.reportingManager}
                  onChange={(e) =>
                    handleChange("reportingManager", e.target.value)
                  }
                  className="w-full appearance-none px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
                  style={{
                    backgroundColor: colors.inputBg,
                    color: colors.textPrimary,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <option value="">No Manager (Top Level)</option>

                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name} ({manager.userId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* FOOTER BUTTONS */}
          <div
            className="flex gap-3 pt-6 shrink-0 mt-6"
            style={{ borderTop: `1px solid ${colors.cardBorder}` }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: colors.inputBg,
                color: colors.textSecondary,
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              Cancel
            </button>

            {activeTab === "personal" ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                style={{
                  backgroundColor: colors.blueLight,
                  color: colors.blue,
                  border: `1px solid ${colors.blue}`,
                }}
              >
                Next: Job Details ➔
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-70 border-none"
                style={{
                  backgroundColor: colors.buttonBg,
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = colors.buttonHover;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.buttonBg;
                }}
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
