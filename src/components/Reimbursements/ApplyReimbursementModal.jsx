import { X, UploadCloud } from "lucide-react";
import React, { useState } from "react";

import colors from "../../constants/colors";
import Button from "../ui/Button";


const REIMBURSEMENT_TYPES = [
  "Travel",
  "Meals",
  "Office Supplies",
  "Internet/Phone",
  "Other",
];

const initialForm = {
  reimbursementType: "Travel",
  amount: "",
  expenseDate: "",
  description: "",
};

export default function ApplyReimbursementModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [receiptFile, setReceiptFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // const handleFileChange = (e) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setReceiptFile(e.target.files[0]);
  //   }
  // };
  const handleFileChange = (e) => {
  const file = e.target.files?.[0];

  if (file) {
    setReceiptFile(file);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.expenseDate || !form.description) {
      setError("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);

    // 🚨 Critical: Must use FormData for multipart/form-data API
    const formData = new FormData();
    formData.append("reimbursementType", form.reimbursementType);
    formData.append("amount", form.amount);
    formData.append("expenseDate", form.expenseDate);
    formData.append("description", form.description);

    if (receiptFile) {
      formData.append("receipts", receiptFile);
    }

    const result = await onSubmit?.(formData);
    setIsSubmitting(false);

    if (result && result.success) {
      setForm(initialForm);
      setReceiptFile(null);
      onClose();
    } else if (result) {
      setError(result.message || "Failed to apply for reimbursement");
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setReceiptFile(null);
    setError("");
    onClose();
  };

  return (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    onClick={handleCancel}
  >
    <div
      className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col"
      style={{
        background: colors.cardBg,
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
        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Apply Reimbursement
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: colors.textSecondary }}
          >
            Submit expenses for approval
          </p>
        </div>

        <button
          onClick={handleCancel}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: colors.textSecondary,
            background: "transparent",
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar">
        <form
          id="reimbursement-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: colors.dangerLight,
                color: colors.danger,
                border: `1px solid ${colors.danger}`,
              }}
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Expense Type */}
            <div>
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: colors.textPrimary }}
              >
                Expense Type <span style={{ color: colors.danger }}>*</span>
              </label>

              <select
                value={form.reimbursementType}
                onChange={(e) =>
                  handleChange("reimbursementType", e.target.value)
                }
                className="w-full appearance-none px-4 py-2.5 rounded-lg text-sm outline-none cursor-pointer transition-colors"
                style={{
                  background: colors.inputBg,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                {REIMBURSEMENT_TYPES.map((t) => (
                  <option
                    key={t}
                    value={t}
                    style={{
                      background: colors.cardBg,
                      color: colors.textPrimary,
                    }}
                  >
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: colors.textPrimary }}
              >
                Amount <span style={{ color: colors.danger }}>*</span>
              </label>

              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: colors.textSecondary }}
                >
                  ₹
                </span>

                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  className="w-full pl-7 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                  style={{
                    background: colors.inputBg,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Expense Date */}
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: colors.textPrimary }}
            >
              Expense Date <span style={{ color: colors.danger }}>*</span>
            </label>

            <input
              type="date"
              value={form.expenseDate}
              onChange={(e) => handleChange("expenseDate", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: colors.inputBg,
                color: colors.textPrimary,
                border: `1px solid ${colors.cardBorder}`,
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: colors.textPrimary }}
            >
              Description <span style={{ color: colors.danger }}>*</span>
            </label>

            <textarea
              rows="3"
              placeholder="What was this expense for?"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none transition-colors"
              style={{
                background: colors.inputBg,
                color: colors.textPrimary,
                border: `1px solid ${colors.cardBorder}`,
              }}
            />
          </div>

          {/* File Upload */}
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: colors.textPrimary }}
            >
              Receipts / Attachments
            </label>

            <div
              className="relative border-2 border-dashed rounded-xl p-6 text-center transition-colors group"
              style={{
                background: colors.inputBg,
                borderColor: colors.cardBorder,
              }}
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*,.pdf"
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
                  {receiptFile ? (
                    <span
                      style={{
                        color: colors.textPrimary,
                        fontWeight: 500,
                      }}
                    >
                      {receiptFile.name}
                    </span>
                  ) : (
                    "Click or drag file to upload"
                  )}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div
        className="p-5 sm:p-6 rounded-b-2xl flex gap-3 shrink-0"
        style={{
          borderTop: `1px solid ${colors.cardBorder}`,
          background: colors.cardBg,
        }}
      >
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          style={{
            background: colors.inputBg,
            color: colors.textSecondary,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          Cancel
        </button>

        <Button
          type="submit"
          form="reimbursement-form"
          variant="custom"
          bg={colors.buttonBg}
          text={colors.textPrimary}
          disabled={isSubmitting}
          className="flex-1 justify-center"
        >
          {isSubmitting ? "Submitting..." : "Apply Now"}
        </Button>
      </div>
    </div>
  </div>
);
}
