// import React, { useState } from "react";
// import { X, Network } from "lucide-react";
// import axiosInstance from "../../api/axiosInstance";
// export default function EditDepartmentModal({
//   open,
//   onClose,
//   department,
//   onSuccess,
// }) {
//   // Using lazy initialization to ensure it mounts with clean data
//   const [form, setForm] = useState(() => ({
//     name: department?.departmentName || department?.name || "",
//     description: department?.description || "",
//   }));
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   if (!open) return null;
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name.trim()) return setError("Department name is required");
//     setIsSubmitting(true);
//     setError("");
//     try {
//       const targetId = department._id || department.departmentId;
//       // Using PUT API from the screenshot
//       const { data } = await axiosInstance.put(
//         `/api/v1/department/${targetId}`,
//         {
//           departmentName: form.name, // Ensure this key matches your backend schema expectations
//           description: form.description,
//         },
//       );
//       if (data.success) {
//         onSuccess(); // Refresh the list
//         onClose();
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to update department");
//     } finally {
//       setIsSubmitting(false);
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
//             <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
//               <Network size={20} />
//             </div>
//             <div>
//               <h2 className="text-lg font-bold text-text-primary">
//                 Edit Department
//               </h2>
//             </div>
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
//               Department Name <span className="text-danger">*</span>
//             </label>
//             <input
//               type="text"
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-text-primary mb-1.5">
//               Description
//             </label>
//             <textarea
//               rows="3"
//               value={form.description}
//               onChange={(e) =>
//                 setForm({ ...form, description: e.target.value })
//               }
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
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="flex-1 py-2.5 rounded-xl bg-btn text-white border-none text-sm font-semibold hover:bg-btn-hover transition-colors disabled:opacity-70"
//             >
//               {isSubmitting ? "Updating..." : "Update"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import { X, Network } from "lucide-react";

import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";


const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function DepartmentModal({
  open,
  onClose,
  department,
  onSuccess,
  mode = "create",
}) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: "",
    description: "",
    head: "",
    workingStartTime: "10:00 AM",
    workingEndTime: "07:00 PM",
    weekOff: ["saturday", "sunday"],
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: department?.departmentName || department?.name || "",
        description: department?.description || "",
        head: department?.head || "",
        workingStartTime:
          department?.workingStartTime || "10:00 AM",
        workingEndTime:
          department?.workingEndTime || "07:00 PM",
        weekOff:
          department?.weekOff || ["saturday", "sunday"],
        status: department?.status || "active",
      });

      setError("");
    }
  }, [department, open]);

  if (!open) return null;

  const inputStyle = {
    background: colors.inputBg,
    color: colors.textPrimary,
    border: `1px solid ${colors.cardBorder}`,
  };

  const handleWeekOff = (day) => {
    setForm((prev) => ({
      ...prev,
      weekOff: prev.weekOff.includes(day)
        ? prev.weekOff.filter((d) => d !== day)
        : [...prev.weekOff, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return setError("Department name is required");
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: form.name,
        description: form.description,
        head: form.head,
        workingStartTime: form.workingStartTime,
        workingEndTime: form.workingEndTime,
        weekOff: form.weekOff,
      };

      if (isEdit) {
        payload.status = form.status;

        await axiosInstance.put(
          `/api/v1/department/${
            department?._id || department?.departmentId
          }`,
          payload
        );
      } else {
        await axiosInstance.post(
          "/api/v1/department",
          payload
        );
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to save department"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
      style={{
        background: "rgba(0,0,0,0.75)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{
            borderColor: colors.cardBorder,
            background: colors.gradientDiagonal,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `${colors.accent}20`,
                color: colors.accent,
              }}
            >
              <Network size={22} />
            </div>

            <div>
              <h2
                className="text-xl font-bold"
                style={{
                  color: colors.textPrimary,
                }}
              >
                {isEdit
                  ? "Edit Department"
                  : "Create Department"}
              </h2>

              <p
                className="text-sm"
                style={{
                  color: colors.textSecondary,
                }}
              >
                Manage department details and schedules
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg transition"
            style={{
              color: colors.textSecondary,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5"
        >
          {error && (
            <div
              className="p-3 rounded-xl text-sm"
              style={{
                background: `${colors.danger}20`,
                color: colors.danger,
                border: `1px solid ${colors.danger}`,
              }}
            >
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label
              className="block mb-2 text-sm font-semibold"
              style={{
                color: colors.textPrimary,
              }}
            >
              Department Name *
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              placeholder="Engineering"
              style={inputStyle}
              className="w-full px-4 py-3 rounded-xl outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="block mb-2 text-sm font-semibold"
              style={{
                color: colors.textPrimary,
              }}
            >
              Description
            </label>

            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              placeholder="Handles product development..."
              style={inputStyle}
              className="w-full px-4 py-3 rounded-xl resize-none"
            />
          </div>

          {/* Head */}
          <div>
            <label
              className="block mb-2 text-sm font-semibold"
              style={{
                color: colors.textPrimary,
              }}
            >
              Department Head
            </label>

            <input
              type="text"
              value={form.head}
              onChange={(e) =>
                setForm({
                  ...form,
                  head: e.target.value,
                })
              }
              placeholder="User ID"
              style={inputStyle}
              className="w-full px-4 py-3 rounded-xl"
            />
          </div>

          {/* Working Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block mb-2 text-sm font-semibold"
                style={{
                  color: colors.textPrimary,
                }}
              >
                Start Time
              </label>

              <input
                type="text"
                value={form.workingStartTime}
                onChange={(e) =>
                  setForm({
                    ...form,
                    workingStartTime: e.target.value,
                  })
                }
                placeholder="10:00 AM"
                style={inputStyle}
                className="w-full px-4 py-3 rounded-xl"
              />
            </div>

            <div>
              <label
                className="block mb-2 text-sm font-semibold"
                style={{
                  color: colors.textPrimary,
                }}
              >
                End Time
              </label>

              <input
                type="text"
                value={form.workingEndTime}
                onChange={(e) =>
                  setForm({
                    ...form,
                    workingEndTime: e.target.value,
                  })
                }
                placeholder="07:00 PM"
                style={inputStyle}
                className="w-full px-4 py-3 rounded-xl"
              />
            </div>
          </div>

          {/* Week Off */}
          <div>
            <label
              className="block mb-3 text-sm font-semibold"
              style={{
                color: colors.textPrimary,
              }}
            >
              Week Off Days
            </label>

            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const selected =
                  form.weekOff.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      handleWeekOff(day)
                    }
                    className="px-4 py-2 rounded-full capitalize text-sm font-medium transition-all"
                    style={{
                      background: selected
                        ? colors.accent
                        : colors.inputBg,
                      color: selected
                        ? colors.primary
                        : colors.textSecondary,
                      border: `1px solid ${
                        selected
                          ? colors.accent
                          : colors.cardBorder
                      }`,
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status (Edit Only) */}
          {isEdit && (
            <div>
              <label
                className="block mb-2 text-sm font-semibold"
                style={{
                  color: colors.textPrimary,
                }}
              >
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                style={inputStyle}
                className="w-full px-4 py-3 rounded-xl"
              >
                <option value="active">
                  Active
                </option>
                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-semibold transition"
              style={{
                background: colors.inputBg,
                color: colors.textSecondary,
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-semibold transition"
              style={{
                background: colors.buttonBg,
                color: "#fff",
              }}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Department"
                : "Create Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
