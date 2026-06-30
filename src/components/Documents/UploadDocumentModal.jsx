import { X, UploadCloud, FileText } from "lucide-react";
import React, { useState, useCallback } from "react";

import colors from "../../constants/colors";
import Button from "../ui/Button";


export default function UploadDocumentModal({
  open,
  onClose,
  onSubmit,
  isAdmin,
}) {
  const [form, setForm] = useState({
    title: "",
    type: "",
    category: "",
    userId: "",
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.type || !form.category || !file) {
      return setError("Please fill all required fields and select a file.");
    }

    setIsSubmitting(true);

    // Construct FormData for the API
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("type", form.type);
    formData.append("category", form.category);
    formData.append("file", file);

    // If Admin provided a userId, use the admin-upload route logic (handled in parent)
    const uploadContext = {
      formData,
      userId: isAdmin && form.userId.trim() ? form.userId.trim() : null,
    };

    const result = await onSubmit(uploadContext);
    setIsSubmitting(false);

    if (result.success) {
      setForm({ title: "", type: "", category: "", userId: "" });
      setFile(null);
      onClose();
    } else {
      setError(result.message || "Failed to upload document.");
    }
  };

  if (!open) return null;

  // return (
  //   <div
  //     className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  //     onClick={onClose}
  //   >
  //     <div
  //       className="bg-card border border-card-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col"
  //       onClick={(e) => e.stopPropagation()}
  //     >
  //       {/* Header */}
  //       <div className="flex items-center justify-between p-5 border-b border-card-border">
  //         <div className="flex items-center gap-3">
  //           <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
  //             <FileText size={20} />
  //           </div>
  //           <h2 className="text-lg font-bold text-text-primary">
  //             Upload Document
  //           </h2>
  //         </div>
  //         <button
  //           onClick={onClose}
  //           className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-input transition-colors"
  //         >
  //           <X size={20} />
  //         </button>
  //       </div>

  //       {/* Form Area */}
  //       <form onSubmit={handleSubmit} className="p-5 space-y-4">
  //         {error && (
  //           <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 text-sm rounded-lg">
  //             {error}
  //           </div>
  //         )}

  //         {/* Admin Override Field */}
  //         {isAdmin && (
  //           <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl mb-2">
  //             <label className="block text-xs font-semibold text-yellow-500 mb-1.5 uppercase tracking-wider">
  //               Admin Override (Optional)
  //             </label>
  //             <input
  //               type="text"
  //               placeholder="Upload for Employee (Enter User ID)"
  //               value={form.userId}
  //               onChange={(e) => handleChange("userId", e.target.value)}
  //               className="w-full bg-input text-text-primary px-3 py-2 rounded-lg border border-card-border text-sm outline-none focus:border-yellow-500 transition-colors"
  //             />
  //             <p className="text-[10px] text-text-secondary mt-1">
  //               Leave blank to upload to your own profile.
  //             </p>
  //           </div>
  //         )}

  //         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  //           <div>
  //             <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //               Document Title <span className="text-danger">*</span>
  //             </label>
  //             <input
  //               type="text"
  //               placeholder="e.g., Aadhar Card"
  //               value={form.title}
  //               onChange={(e) => handleChange("title", e.target.value)}
  //               className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
  //             />
  //           </div>
  //           <div>
  //             <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //               Category <span className="text-danger">*</span>
  //             </label>
  //             <input
  //               type="text"
  //               placeholder="e.g., Identity, Academic"
  //               value={form.category}
  //               onChange={(e) => handleChange("category", e.target.value)}
  //               className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
  //             />
  //           </div>
  //         </div>

  //         <div>
  //           <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //             Document Type <span className="text-danger">*</span>
  //           </label>
  //           <input
  //             type="text"
  //             placeholder="e.g., ID Proof, Degree Certificate"
  //             value={form.type}
  //             onChange={(e) => handleChange("type", e.target.value)}
  //             className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
  //           />
  //         </div>

  //         {/* File Upload Zone */}
  //         <div>
  //           <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //             File <span className="text-danger">*</span>
  //           </label>
  //           <div className="relative border-2 border-dashed border-card-border rounded-xl p-6 text-center hover:border-btn/50 transition-colors bg-input/30 group">
  //             <input
  //               type="file"
  //               onChange={(e) => setFile(e.target.files[0])}
  //               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
  //               accept=".pdf,.png,.jpg,.jpeg"
  //             />
  //             <div className="flex flex-col items-center gap-2">
  //               <UploadCloud
  //                 size={24}
  //                 className="text-text-secondary group-hover:text-btn transition-colors"
  //               />
  //               <span className="text-sm text-text-secondary">
  //                 {file ? (
  //                   <span className="text-text-primary font-medium">
  //                     {file.name}
  //                   </span>
  //                 ) : (
  //                   "Click or drag file to upload"
  //                 )}
  //               </span>
  //             </div>
  //           </div>
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
  //             {isSubmitting ? "Uploading..." : "Upload Document"}
  //           </Button>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // );

  return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{
      backgroundColor: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(6px)",
    }}
    onClick={onClose}
  >
    <div
      className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
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
            <FileText size={20} />
          </div>

          <h2
            className="text-lg font-bold"
            style={{ color: colors.textPrimary }}
          >
            Upload Document
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: colors.textSecondary,
          }}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {error && (
          <div
            className="p-3 rounded-lg text-sm border"
            style={{
              backgroundColor: colors.dangerLight,
              color: colors.danger,
              borderColor: colors.danger,
            }}
          >
            {error}
          </div>
        )}

        {/* Admin Override */}
        {isAdmin && (
          <div
            className="p-4 rounded-xl mb-2 border"
            style={{
              backgroundColor: colors.accentLight,
              borderColor: colors.accent,
            }}
          >
            <label
              className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: colors.accentDark }}
            >
              Admin Override (Optional)
            </label>

            <input
              type="text"
              placeholder="Upload for Employee (Enter User ID)"
              value={form.userId}
              onChange={(e) =>
                handleChange("userId", e.target.value)
              }
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
              style={{
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                borderColor: colors.cardBorder,
              }}
            />

            <p
              className="text-[10px] mt-1"
              style={{ color: colors.textSecondary }}
            >
              Leave blank to upload to your own profile.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: colors.textPrimary }}
            >
              Document Title{" "}
              <span style={{ color: colors.danger }}>*</span>
            </label>

            <input
              type="text"
              placeholder="e.g., Aadhar Card"
              value={form.title}
              onChange={(e) =>
                handleChange("title", e.target.value)
              }
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
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
              Category{" "}
              <span style={{ color: colors.danger }}>*</span>
            </label>

            <input
              type="text"
              placeholder="e.g., Identity, Academic"
              value={form.category}
              onChange={(e) =>
                handleChange("category", e.target.value)
              }
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
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
            Document Type{" "}
            <span style={{ color: colors.danger }}>*</span>
          </label>

          <input
            type="text"
            placeholder="e.g., ID Proof, Degree Certificate"
            value={form.type}
            onChange={(e) =>
              handleChange("type", e.target.value)
            }
            className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.textPrimary,
              borderColor: colors.cardBorder,
            }}
          />
        </div>

        {/* Upload Area */}
        <div>
          <label
            className="block text-sm font-semibold mb-1.5"
            style={{ color: colors.textPrimary }}
          >
            File <span style={{ color: colors.danger }}>*</span>
          </label>

          <div
            className="relative border-2 border-dashed rounded-xl p-6 text-center transition-colors"
            style={{
              borderColor: colors.cardBorder,
              backgroundColor: colors.inputBg,
            }}
          >
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.png,.jpg,.jpeg"
            />

            <div className="flex flex-col items-center gap-2">
              <UploadCloud
                size={24}
                style={{ color: colors.textSecondary }}
              />

              <span
                className="text-sm"
                style={{ color: colors.textSecondary }}
              >
                {file ? (
                  <span
                    className="font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    {file.name}
                  </span>
                ) : (
                  "Click or drag file to upload"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
            style={{
              backgroundColor: colors.inputBg,
              color: colors.textSecondary,
              borderColor: colors.cardBorder,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.inputBg;
            }}
          >
            Cancel
          </button>

          <Button
            type="submit"
            bg={colors.buttonBg}
            text={colors.textPrimary}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Uploading..." : "Upload Document"}
          </Button>
        </div>
      </form>
    </div>
  </div>
);
}
