import React, { useState } from "react";
import { X, UploadCloud } from "lucide-react";

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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
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
        className="bg-card border border-card-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-card-border shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Apply Reimbursement
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Submit expenses for approval
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-input transition-colors"
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
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Expense Type <span className="text-danger">*</span>
                </label>
                <select
                  value={form.reimbursementType}
                  onChange={(e) =>
                    handleChange("reimbursementType", e.target.value)
                  }
                  className="w-full appearance-none bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none cursor-pointer focus:border-btn transition-colors"
                >
                  {REIMBURSEMENT_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-secondary">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Amount <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    className="w-full bg-input text-text-primary pl-7 pr-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Expense Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={form.expenseDate}
                onChange={(e) => handleChange("expenseDate", e.target.value)}
                className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                rows="3"
                placeholder="What was this expense for?"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors resize-none"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Receipts / Attachments
              </label>
              <div className="relative border-2 border-dashed border-card-border rounded-xl p-6 text-center hover:border-btn/50 transition-colors bg-input/30 group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*,.pdf"
                />
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud
                    size={24}
                    className="text-text-secondary group-hover:text-btn transition-colors"
                  />
                  <span className="text-sm text-text-secondary">
                    {receiptFile ? (
                      <span className="text-text-primary font-medium">
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
        <div className="p-5 sm:p-6 border-t border-card-border bg-card rounded-b-2xl flex gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-input text-text-secondary border border-card-border text-sm font-semibold hover:bg-hover transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="reimbursement-form"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-btn text-white border-none text-sm font-semibold hover:bg-btn-hover transition-colors cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : "Apply Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
