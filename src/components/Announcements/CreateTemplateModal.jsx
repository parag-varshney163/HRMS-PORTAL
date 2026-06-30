import React, { useState, useCallback } from "react";
import { X, FileText } from "lucide-react";

import useNotification from "../../hooks/useNotification.jsx";
import colors from "../../constants/colors.js";


// ─── 1. FIX: Added required backend fields with safe defaults ───
const initialForm = {
  title: "",
  message: "",
  type: "announcement",
  category: "Company-wide Announcement",
  isDefault: false,
  audienceType: "all", // Fills the required Mongoose path
  departments: [], // Required for schema consistency
  recipients: [], // Required for schema consistency
};

const CATEGORIES = [
  "Company-wide Announcement",
  "Policy Update",
  "Holiday Notice",
  "Maintenance Alert",
  "Event Invitation",
];

export default function CreateTemplateModal({
  open,
  onClose,
  onSave,
  initialData = null,
}) {
  // ─── 2. FIX: Ensure initialData maps these required fields if editing ───
  const getInitialState = () => {
    if (initialData) {
      return {
        title: initialData.title || "",
        message: initialData.message || "",
        type: initialData.type || "announcement",
        category: initialData.category || "Company-wide Announcement",
        isDefault: initialData.isDefault || false,
        audienceType: initialData.audienceType || "all",
        departments: initialData.departments || [],
        recipients: initialData.recipients || [],
      };
    }
    return initialForm;
  };

  const [form, setForm] = useState(getInitialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotification();

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.title?.trim()) newErrors.title = "Template title is required";
    if (!form.message?.trim())
      newErrors.message = "Message content is required";
    return newErrors;
  }, [form]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    // Payload now cleanly includes audienceType: "all" to satisfy the backend
    const result = await onSave?.(form);
    setIsSubmitting(false);

    if (result && !result.success) {
      notify.error("Save Failed", result.message || "Failed to save template.");
    }
  };

  // return (
  //   <div
  //     className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  //     onClick={onClose}
  //   >
  //     <div
  //       className="bg-card border border-card-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
  //       onClick={(e) => e.stopPropagation()}
  //     >
  //       {/* ─── Header ─── */}
  //       <div className="flex items-center justify-between p-5 sm:p-6 border-b border-card-border shrink-0">
  //         <div className="flex items-center gap-3">
  //           <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
  //             <FileText size={20} />
  //           </div>
  //           <div>
  //             <h2 className="text-lg sm:text-xl font-bold text-text-primary leading-tight">
  //               {initialData ? "Edit Template" : "Create Template"}
  //             </h2>
  //             <p className="text-xs text-text-secondary mt-0.5">
  //               Design a reusable announcement draft
  //             </p>
  //           </div>
  //         </div>
  //         <button
  //           onClick={onClose}
  //           className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-input transition-colors"
  //         >
  //           <X size={20} />
  //         </button>
  //       </div>

  //       {/* ─── Scrollable Form Area ─── */}
  //       <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
  //         <form
  //           id="template-form"
  //           onSubmit={handleSubmit}
  //           className="space-y-4"
  //         >
  //           {/* Title */}
  //           <div>
  //             <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //               Template Title <span className="text-danger">*</span>
  //             </label>
  //             <input
  //               type="text"
  //               placeholder="e.g., Diwali Holiday Notice"
  //               value={form.title}
  //               onChange={(e) => handleChange("title", e.target.value)}
  //               className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-btn transition-colors ${errors.title ? "border-danger" : "border-card-border"}`}
  //             />
  //             {errors.title && (
  //               <p className="text-xs text-danger mt-1">{errors.title}</p>
  //             )}
  //           </div>

  //           {/* Category Dropdown */}
  //           <div>
  //             <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //               Category
  //             </label>
  //             <select
  //               value={form.category}
  //               onChange={(e) => handleChange("category", e.target.value)}
  //               className="w-full appearance-none bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none cursor-pointer focus:border-btn transition-colors"
  //             >
  //               {CATEGORIES.map((cat) => (
  //                 <option key={cat} value={cat} className="bg-secondary">
  //                   {cat}
  //                 </option>
  //               ))}
  //             </select>
  //           </div>

  //           {/* Message Content */}
  //           <div>
  //             <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //               Message Body <span className="text-danger">*</span>
  //             </label>
  //             <textarea
  //               rows="5"
  //               placeholder="Write the announcement content here..."
  //               value={form.message}
  //               onChange={(e) => handleChange("message", e.target.value)}
  //               className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-btn transition-colors resize-none custom-scrollbar ${errors.message ? "border-danger" : "border-card-border"}`}
  //             />
  //             {errors.message && (
  //               <p className="text-xs text-danger mt-1">{errors.message}</p>
  //             )}
  //           </div>

  //           {/* Is Default Toggle (Checkbox) */}
  //           <label className="flex items-center gap-3 cursor-pointer group w-max mt-2">
  //             <div className="relative flex items-center">
  //               <input
  //                 type="checkbox"
  //                 checked={form.isDefault}
  //                 onChange={(e) => handleChange("isDefault", e.target.checked)}
  //                 className="peer sr-only"
  //               />
  //               <div className="w-10 h-5 bg-input rounded-full peer-checked:bg-btn transition-colors border border-card-border"></div>
  //               <div className="absolute left-1 top-1 w-3 h-3 bg-text-secondary rounded-full transition-transform peer-checked:translate-x-5 peer-checked:bg-white"></div>
  //             </div>
  //             <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
  //               Set as Default Template
  //             </span>
  //           </label>
  //         </form>
  //       </div>

  //       {/* ─── Footer Buttons ─── */}
  //       <div className="p-5 sm:p-6 border-t border-card-border bg-card rounded-b-2xl flex gap-3 shrink-0">
  //         <button
  //           type="button"
  //           onClick={onClose}
  //           disabled={isSubmitting}
  //           className="flex-1 py-2.5 rounded-xl bg-input text-text-secondary border border-card-border text-sm font-semibold hover:bg-hover transition-colors cursor-pointer disabled:opacity-50"
  //         >
  //           Cancel
  //         </button>
  //         <button
  //           type="submit"
  //           form="template-form"
  //           disabled={isSubmitting}
  //           className="flex-1 py-2.5 rounded-xl bg-btn text-white border-none text-sm font-semibold hover:bg-btn-hover transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
  //         >
  //           {isSubmitting
  //             ? "Saving..."
  //             : initialData
  //               ? "Update Template"
  //               : "Save Template"}
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] rounded-2xl"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 sm:p-6 shrink-0"
        style={{
          borderBottom: `1px solid ${colors.cardBorder}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: colors.blueLight,
              color: colors.blue,
            }}
          >
            <FileText size={20} />
          </div>

          <div>
            <h2
              className="text-lg sm:text-xl font-bold leading-tight"
              style={{ color: colors.textPrimary }}
            >
              {initialData ? "Edit Template" : "Create Template"}
            </h2>

            <p
              className="text-xs mt-0.5"
              style={{ color: colors.textSecondary }}
            >
              Design a reusable announcement draft
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: colors.textSecondary,
            backgroundColor: "transparent",
          }}
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
        <form
          id="template-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Title */}
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: colors.textPrimary }}
            >
              Template Title{" "}
              <span style={{ color: colors.danger }}>*</span>
            </label>

            <input
              type="text"
              placeholder="e.g., Diwali Holiday Notice"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                border: `1px solid ${
                  errors.title
                    ? colors.danger
                    : colors.cardBorder
                }`,
              }}
            />

            {errors.title && (
              <p
                className="text-xs mt-1"
                style={{ color: colors.danger }}
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: colors.textPrimary }}
            >
              Category
            </label>

            <select
              value={form.category}
              onChange={(e) =>
                handleChange("category", e.target.value)
              }
              className="w-full appearance-none px-4 py-2.5 rounded-lg text-sm outline-none cursor-pointer transition-colors"
              style={{
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              {CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  style={{
                    backgroundColor: colors.secondary,
                    color: colors.textPrimary,
                  }}
                >
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: colors.textPrimary }}
            >
              Message Body{" "}
              <span style={{ color: colors.danger }}>*</span>
            </label>

            <textarea
              rows={5}
              placeholder="Write the announcement content here..."
              value={form.message}
              onChange={(e) =>
                handleChange("message", e.target.value)
              }
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none custom-scrollbar transition-colors"
              style={{
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                border: `1px solid ${
                  errors.message
                    ? colors.danger
                    : colors.cardBorder
                }`,
              }}
            />

            {errors.message && (
              <p
                className="text-xs mt-1"
                style={{ color: colors.danger }}
              >
                {errors.message}
              </p>
            )}
          </div>

          {/* Default Toggle */}
          <label className="flex items-center gap-3 cursor-pointer w-max mt-2">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  handleChange(
                    "isDefault",
                    e.target.checked
                  )
                }
                className="peer sr-only"
              />

              <div
                className="w-10 h-5 rounded-full border transition-colors"
                style={{
                  backgroundColor: form.isDefault
                    ? colors.accent
                    : colors.inputBg,
                  borderColor: colors.cardBorder,
                }}
              />

              <div
                className="absolute left-1 top-1 w-3 h-3 rounded-full transition-transform"
                style={{
                  backgroundColor: form.isDefault
                    ? "#fff"
                    : colors.textSecondary,
                  transform: form.isDefault
                    ? "translateX(20px)"
                    : "translateX(0)",
                }}
              />
            </div>

            <span
              className="text-sm font-medium"
              style={{ color: colors.textPrimary }}
            >
              Set as Default Template
            </span>
          </label>
        </form>
      </div>

      {/* Footer */}
      <div
        className="p-5 sm:p-6 rounded-b-2xl flex gap-3 shrink-0"
        style={{
          borderTop: `1px solid ${colors.cardBorder}`,
          backgroundColor: colors.cardBg,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
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
          form="template-form"
          disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
          style={{
            backgroundColor: colors.buttonBg,
            color: "#fff",
            border: "none",
          }}
        >
          {isSubmitting
            ? "Saving..."
            : initialData
            ? "Update Template"
            : "Save Template"}
        </button>
      </div>
    </div>
  </div>
);
}
