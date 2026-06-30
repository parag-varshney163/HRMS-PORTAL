import { X, UserMinus } from "lucide-react";
// import React, { useState } from "react";
// import { X, UserMinus } from "lucide-react";
// import Button from "../ui/Button";
// export default function ApplyResignationModal({ open, onClose, onSubmit }) {
//   const [form, setForm] = useState({ reason: "", lastWorkingDate: "" });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   if (!open) return null;
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.reason || !form.lastWorkingDate)
//       return setError("All fields are required.");
//     setIsSubmitting(true);
//     setError("");
//     const result = await onSubmit(form);
//     setIsSubmitting(false);
//     if (result.success) {
//       setForm({ reason: "", lastWorkingDate: "" });
//       onClose();
//     } else {
//       setError(result.message);
//     }
//   };
//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <div
//         className="bg-card border border-card-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex items-center justify-between p-5 border-b border-card-border">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
//               <UserMinus size={20} />
//             </div>
//             <h2 className="text-lg font-bold text-text-primary">
//               Apply Resignation
//             </h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-input transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>
//         <form onSubmit={handleSubmit} className="p-5 space-y-4">
//           {error && (
//             <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 text-sm rounded-lg">
//               {error}
//             </div>
//           )}
//           <div>
//             <label className="block text-sm font-semibold text-text-primary mb-1.5">
//               Proposed Last Working Date
//             </label>
//             <input
//               type="date"
//               value={form.lastWorkingDate}
//               onChange={(e) =>
//                 setForm({ ...form, lastWorkingDate: e.target.value })
//               }
//               className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-text-primary mb-1.5">
//               Reason for Resignation
//             </label>
//             <textarea
//               rows="4"
//               placeholder="Please provide your reason..."
//               value={form.reason}
//               onChange={(e) => setForm({ ...form, reason: e.target.value })}
//               className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors resize-none"
//             />
//           </div>
//           <div className="pt-4 flex gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={isSubmitting}
//               className="flex-1 py-2.5 rounded-xl bg-input text-text-secondary border border-card-border text-sm font-semibold hover:bg-hover transition-colors"
//             >
//               Cancel
//             </button>
//             <Button
//               type="submit"
//               disabled={isSubmitting}
//               variant="danger"
//               className="flex-1"
//             >
//               {isSubmitting ? "Submitting..." : "Submit Resignation"}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";

import colors from "../../constants/colors";
import Button from "../ui/Button";


export default function ApplyResignationModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ reason: "", lastWorkingDate: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.reason || !form.lastWorkingDate) {
      setError("All fields are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await onSubmit(form);

    setIsSubmitting(false);

    if (result?.success) {
      setForm({ reason: "", lastWorkingDate: "" });
      onClose();
    } else {
      setError(result?.message || "Failed to submit resignation.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(31, 41, 55, 0.55)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: `1px solid ${colors.cardBorder}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: colors.dangerLight,
                color: colors.danger,
              }}
            >
              <UserMinus size={20} />
            </div>

            <h2
              className="text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              Apply Resignation
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.textSecondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.textPrimary;
              e.currentTarget.style.backgroundColor = colors.inputBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.textSecondary;
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div
              className="p-3 text-sm rounded-lg"
              style={{
                backgroundColor: colors.dangerLight,
                color: colors.danger,
                border: `1px solid ${colors.danger}`,
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: colors.textPrimary }}
            >
              Proposed Last Working Date
            </label>

            <input
              type="date"
              value={form.lastWorkingDate}
              onChange={(e) =>
                setForm({ ...form, lastWorkingDate: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                border: `1px solid ${colors.cardBorder}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.accent;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.cardBorder;
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: colors.textPrimary }}
            >
              Reason for Resignation
            </label>

            <textarea
              rows="4"
              placeholder="Please provide your reason..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors resize-none"
              style={{
                backgroundColor: colors.inputBg,
                color: colors.textPrimary,
                border: `1px solid ${colors.cardBorder}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.accent;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = colors.cardBorder;
              }}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: colors.inputBg,
                color: colors.textSecondary,
                border: `1px solid ${colors.cardBorder}`,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = colors.hover;
                  e.currentTarget.style.color = colors.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.inputBg;
                e.currentTarget.style.color = colors.textSecondary;
              }}
            >
              Cancel
            </button>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="custom"
              bg={colors.danger}
              text="#FFFFFF"
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Resignation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}