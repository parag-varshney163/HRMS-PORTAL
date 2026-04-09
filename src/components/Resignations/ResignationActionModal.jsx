import React, { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import Button from "../ui/Button";

export default function ResignationActionModal({
  open,
  onClose,
  actionType,
  onConfirm,
}) {
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const isApprove = actionType === "approve";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onConfirm({ action: actionType, comments });
    setIsSubmitting(false);
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
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${isApprove ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
            >
              {isApprove ? <CheckCircle size={20} /> : <XCircle size={20} />}
            </div>
            <h2 className="text-lg font-bold text-text-primary capitalize">
              {actionType} Resignation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-input transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Comments / Feedback <span className="text-danger">*</span>
            </label>
            <textarea
              required
              rows="3"
              placeholder={`Add comments for ${actionType}...`}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
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
            <Button
              type="submit"
              disabled={isSubmitting}
              variant={isApprove ? "custom" : "danger"}
              bg={isApprove ? "#22c55e" : ""}
              text={isApprove ? "#FFF" : ""}
              className="flex-1"
            >
              {isSubmitting ? "Processing..." : `Confirm ${actionType}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
