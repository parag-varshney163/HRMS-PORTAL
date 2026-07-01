import { X, UploadCloud, UserPlus, Clock } from "lucide-react";
import React, { useState, useCallback } from "react";

import useNotification from "../../hooks/useNotification.jsx";
import colors from "../../constants/colors.js";


const initialForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",

  experience: "",
  currentDesignation: "",
  currentCompany: "",
  employmentType: "full_time",

  skills: "",
  noticePeriod: "",

  positionApplied: "",
  source: "",

  currentSalary: "",
  expectedSalary: "",

  notes: "",
  hrRemarks: "",

  status: "screening",
  profileImage: "",
  interviewTimeline: [],
};
const FormInput = ({
  label,
  required = false,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  step,
}) => (
  <div>
    <label
      className="block text-sm font-semibold mb-1.5"
      style={{ color: colors.textPrimary }}
    >
      {label} {required && <span style={{ color: colors.danger }}>*</span>}
    </label>

    <input
      type={type}
      step={step}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
      style={{
        backgroundColor: colors.inputBg,
        color: colors.textPrimary,
        borderColor: error ? colors.danger : colors.cardBorder,
      }}
    />

    {error && (
      <p className="text-xs mt-1" style={{ color: colors.danger }}>
        {error}
      </p>
    )}
  </div>
);
export default function CandidateModal({ open, onClose, onSave, initialData }) {
  // ─── LAZY INITIALIZATION ───
  const getInitialState = () => {
    if (initialData) {
      // return {
      //   fullName: initialData.fullName || "",
      //   email: initialData.email || "",
      //   phoneNumber: initialData.phoneNumber || "",
      //   experience: initialData.experience || "",
      //   positionApplied: initialData.positionApplied || "",
      //   source: initialData.source || "",
      //   currentCompany: initialData.currentCompany || "",
      //   currentSalary: initialData.currentSalary || "",
      //   expectedSalary: initialData.expectedSalary || "",
      //   notes: initialData.notes || "",
      //   status: initialData.status || "screening",
      //   // Safely map timeline if it exists
      //   interviewTimeline: initialData.interviewTimeline || [],
      // };
      return {
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        dateOfBirth: initialData.dateOfBirth
          ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
          : "",

        experience: initialData.experience || "",
        currentDesignation: initialData.currentDesignation || "",
        currentCompany: initialData.currentCompany || "",
        employmentType: initialData.employmentType || "full_time",
        profileImage: initialData.profileImage || "",

        skills: Array.isArray(initialData.skills)
          ? initialData.skills.join(", ")
          : initialData.skills || "",

        noticePeriod: initialData.noticePeriod || "",

        positionApplied: initialData.positionApplied || "",
        source: initialData.source || "",

        currentSalary: initialData.currentSalary || "",
        expectedSalary: initialData.expectedSalary || "",

        notes: initialData.notes || "",
        hrRemarks: initialData.hrRemarks || "",

        status: initialData.status || "screening",

        interviewTimeline: initialData.interviewTimeline || [],
      };
    }
    return initialForm;
  };
  const [form, setForm] = useState(getInitialState);
  const [resumeFile, setResumeFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const notify = useNotification();
  const isEditMode = !!initialData;
  // ─── HANDLERS ───
  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };
  const handleProfileImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };
  // Specific handler for nested interview timeline array
  const handleTimelineChange = (index, field, value) => {
    setForm((prev) => {
      const newTimeline = [...prev.interviewTimeline];
      newTimeline[index] = { ...newTimeline[index], [field]: value };
      return { ...prev, interviewTimeline: newTimeline };
    });
  };
  // ─── VALIDATION ───
  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!form.email?.trim()) newErrors.email = "Email is required";
    if (!form.positionApplied?.trim())
      newErrors.positionApplied = "Position is required";
    return newErrors;
  }, [form]);
  if (!open) return null;
  // ─── SUBMISSION ───
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const validationErrors = validate();
  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     return;
  //   }
  //   setIsSubmitting(true);
  //   // 🚨 IMPORTANT: Build FormData for multipart/form-data API
  //   const formData = new FormData();
  //   Object.keys(form).forEach((key) => {
  //     if (key === "interviewTimeline") {
  //       // API requires interviewTimeline to be sent as a JSON string
  //       if (isEditMode && form.interviewTimeline.length > 0) {
  //         formData.append(
  //           "interviewTimeline",
  //           JSON.stringify(form.interviewTimeline),
  //         );
  //       }
  //     } else if (form[key]) {
  //       // Prevent appending literal "undefined" or "null" strings
  //       formData.append(key, form[key]);
  //     }
  //   });
  //   if (resumeFile) {
  //     formData.append("resume", resumeFile);
  //   }
  //   const result = await onSave?.(formData);
  //   setIsSubmitting(false);
  //   if (result && !result.success) {
  //     notify.error("Save Failed", result.message || "Failed to save candidate.");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (key === "interviewTimeline") {
        if (form.interviewTimeline?.length > 0) {
          formData.append(
            "interviewTimeline",
            JSON.stringify(form.interviewTimeline),
          );
        }
      } else if (key === "skills") {
        formData.append(
          "skills",
          form.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .join(","),
        );
      } else if (
        form[key] !== undefined &&
        form[key] !== null &&
        form[key] !== ""
      ) {
        formData.append(key, form[key]);
      }
    });

    if (resumeFile) {
      formData.append("resume", resumeFile);
    }

    // if (profileImage) {
    //   formData.append("profileImage", profileImage);
    // }


    const result = await onSave?.(formData);

    setIsSubmitting(false);

    if (result && !result.success) {
      notify.error(
        "Save Failed",
        result.message || "Failed to save candidate."
      );
    }
  };



  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(31, 41, 55, 0.55)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 sm:p-6 shrink-0"
          style={{ borderBottom: `1px solid ${colors.cardBorder}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: colors.blueLight,
                color: colors.blue,
              }}
            >
              <UserPlus size={20} />
            </div>

            <h2
              className="text-lg sm:text-xl font-bold leading-tight"
              style={{ color: colors.textPrimary }}
            >
              {isEditMode ? "Edit Candidate Details" : "Add New Candidate"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.textSecondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.inputBg;
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

        {/* Form */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="candidate-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                required
                placeholder="Jane Doe"
                value={form.fullName}
                error={errors.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
              />

              <FormInput
                label="Email Address"
                required
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                error={errors.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormInput
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />

              <FormInput
                label="Date Of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              />

              <FormInput
                label="Position Applied"
                required
                placeholder="Frontend Developer"
                value={form.positionApplied}
                error={errors.positionApplied}
                onChange={(e) =>
                  handleChange("positionApplied", e.target.value)
                }
              />

              <FormInput
                label="Experience (Yrs)"
                type="number"
                step="0.5"
                placeholder="3.5"
                value={form.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: colors.textPrimary }}
                >
                  Overall Status
                </label>

                {/* <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none cursor-pointer"
                  style={{
                    backgroundColor: colors.inputBg,
                    color: colors.textPrimary,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <option value="screening">Screening</option>
                  <option value="interview">Interview Process</option>
                  <option value="selected">Selected / Offered</option>
                  <option value="rejected">Rejected</option>
                </select> */}
                <select
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none cursor-pointer"
                  style={{
                    backgroundColor: colors.inputBg,
                    color: colors.textPrimary,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <option value="screening">Screening</option>
                  <option value="hr_round">HR Round</option>
                  <option value="technical_round_1">Technical Round 1</option>
                  <option value="technical_round_2">Technical Round 2</option>
                  <option value="offer_stage">Offer Stage</option>
                  <option value="selected">Selected</option>
                  <option value="on_hold">On Hold</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <FormInput
                label="Source"
                placeholder="e.g., LinkedIn, Referral"
                value={form.source}
                onChange={(e) => handleChange("source", e.target.value)}
              />
            </div>

            {/* Professional Details */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl"
              style={{
                backgroundColor: colors.secondary,
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              <FormInput
                label="Current Company"
                placeholder="Tech Corp"
                value={form.currentCompany}
                onChange={(e) => handleChange("currentCompany", e.target.value)}
              />

              <FormInput
                label="Current Designation"
                placeholder="Senior Developer"
                value={form.currentDesignation}
                onChange={(e) =>
                  handleChange("currentDesignation", e.target.value)
                }
              />

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
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    color: colors.textPrimary,
                    borderColor: colors.cardBorder,
                  }}
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <FormInput
                label="Skills"
                placeholder="React, Node.js, MongoDB"
                value={form.skills}
                onChange={(e) => handleChange("skills", e.target.value)}
              />

              <FormInput
                label="Notice Period"
                placeholder="30 Days"
                value={form.noticePeriod}
                onChange={(e) => handleChange("noticePeriod", e.target.value)}
              />

              <FormInput
                label="Profile Image URL"
                placeholder="https://example.com/profile.jpg"
                value={form.profileImage}
                onChange={(e) => handleChange("profileImage", e.target.value)}
              />

              <FormInput
                label="Current Salary"
                placeholder="80,000"
                value={form.currentSalary}
                onChange={(e) => handleChange("currentSalary", e.target.value)}
              />

              <FormInput
                label="Expected Salary"
                placeholder="100,000"
                value={form.expectedSalary}
                onChange={(e) => handleChange("expectedSalary", e.target.value)}
              />

              <div>
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: colors.textPrimary }}
                >
                  HR Remarks
                </label>

                <textarea
                  rows="2"
                  placeholder="Internal HR remarks..."
                  value={form.hrRemarks}
                  onChange={(e) => handleChange("hrRemarks", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none resize-none"
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
                Notes / Remarks
              </label>

              <textarea
                rows="2"
                placeholder="Add any initial thoughts or screening notes..."
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none resize-none"
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.textPrimary,
                  borderColor: colors.cardBorder,
                }}
              />
            </div>

            {/* Resume */}
            <div>
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: colors.textPrimary }}
              >
                Resume
              </label>

              <div
                className="relative border-2 border-dashed rounded-xl p-5 text-center group"
                style={{
                  borderColor: colors.cardBorder,
                  backgroundColor: colors.inputBg,
                }}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx"
                />

                <div className="flex flex-col items-center gap-1">
                  <UploadCloud size={20} style={{ color: colors.textSecondary }} />

                  <span
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {resumeFile ? (
                      <span style={{ color: colors.textPrimary }}>
                        {resumeFile.name}
                      </span>
                    ) : isEditMode ? (
                      "Upload new file to replace existing resume"
                    ) : (
                      "Click or drag file to upload (.pdf, .doc, .docx)"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Interview Timeline */}
            {isEditMode && form.interviewTimeline?.length > 0 && (
              <div
                className="pt-5"
                style={{ borderTop: `1px solid ${colors.cardBorder}` }}
              >
                <h3
                  className="text-base font-bold mb-4 flex items-center gap-2"
                  style={{ color: colors.textPrimary }}
                >
                  <Clock size={18} style={{ color: colors.accentDark }} />
                  Interview Stages Tracker
                </h3>

                <div className="space-y-3">
                  {form.interviewTimeline.map((stage, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row gap-3 p-3.5 rounded-xl items-center"
                      style={{
                        backgroundColor: colors.secondary,
                        border: `1px solid ${colors.cardBorder}`,
                      }}
                    >
                      <div className="w-full sm:w-1/4">
                        <span
                          className="text-sm font-semibold block"
                          style={{ color: colors.textPrimary }}
                        >
                          {stage.stageName}
                        </span>
                      </div>

                      <div className="w-full sm:w-1/4">
                        <select
                          value={stage.status}
                          onChange={(e) =>
                            handleTimelineChange(idx, "status", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                          style={{
                            backgroundColor: colors.cardBg,
                            color: colors.textPrimary,
                            borderColor: colors.cardBorder,
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="w-full sm:w-1/4">
                        <input
                          type="date"
                          value={
                            stage.date
                              ? new Date(stage.date).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleTimelineChange(idx, "date", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                          style={{
                            backgroundColor: colors.cardBg,
                            color: colors.textPrimary,
                            borderColor: colors.cardBorder,
                          }}
                        />
                      </div>

                      <div className="w-full sm:w-1/4">
                        <input
                          type="text"
                          placeholder="Remarks..."
                          value={stage.remarks}
                          onChange={(e) =>
                            handleTimelineChange(idx, "remarks", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                          style={{
                            backgroundColor: colors.cardBg,
                            color: colors.textPrimary,
                            borderColor: colors.cardBorder,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div
          className="p-5 sm:p-6 rounded-b-2xl flex gap-3 shrink-0"
          style={{
            backgroundColor: colors.cardBg,
            borderTop: `1px solid ${colors.cardBorder}`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.textSecondary,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            form="candidate-form"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-70"
            style={{
              backgroundColor: colors.buttonBg,
              color: colors.textPrimary,
            }}
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update Candidate"
                : "Save Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
}

