import React, { useState, useCallback, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import useNotification from "../../hooks/useNotification.jsx";
import axiosInstance from "../../api/axiosInstance";

const initialForm = {
  title: "",
  message: "",
  audienceType: "all",
  departments: [],
  recipients: [],
};

// Helper to format department names (e.g., "testing" -> "Testing", "human_resource" -> "Human Resource")
const formatDeptName = (name) => {
  if (!name) return "";
  return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function PublishAnnouncementModal({
  open,
  onClose,
  onPublish,
  templates = [],
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = useNotification();

  // ─── NEW: DYNAMIC DATA STATES ───
  const [departmentsList, setDepartmentsList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // ─── FETCH DEPARTMENTS & USERS ON MOUNT ───
  useEffect(() => {
    if (open) {
      setLoadingData(true);
      Promise.allSettled([
        axiosInstance.get("/api/v1/department"),
        axiosInstance.get("/api/v1/user/all-users"),
      ])
        .then(([deptRes, userRes]) => {
          // Handle Departments
          if (deptRes.status === "fulfilled" && deptRes.value.data) {
            // Note: Adjust depending on whether the array is at res.data or res.data.data
            const depts = deptRes.value.data.data || deptRes.value.data;
            if (Array.isArray(depts)) setDepartmentsList(depts);
          }
          // Handle Users
          if (userRes.status === "fulfilled" && userRes.value.data?.success) {
            const users = userRes.value.data.data || [];
            setEmployeesList(users);
          }
        })
        .catch((err) => console.error("Failed to fetch dropdown data:", err))
        .finally(() => setLoadingData(false));
    } else {
      // Reset form when modal closes
      setForm(initialForm);
      setErrors({});
    }
  }, [open]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleTemplateSelect = (e) => {
    const template = templates.find((t) => t._id === e.target.value);
    if (template) {
      setForm((prev) => ({
        ...prev,
        title: template.title,
        message: template.message,
      }));
      setErrors((prev) => ({ ...prev, title: "", message: "" }));
    }
  };

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.title?.trim()) newErrors.title = "Announcement title is required";
    if (!form.message?.trim())
      newErrors.message = "Message content is required";
    if (form.audienceType === "department" && form.departments.length === 0)
      newErrors.audience = "Select at least one department";
    if (form.audienceType === "individual" && form.recipients.length === 0)
      newErrors.audience = "Select at least one employee";
    return newErrors;
  }, [form]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0)
      return setErrors(validationErrors);

    setIsSubmitting(true);
    // Passing the form which now perfectly contains the Arrays of _ids!
    const result = await onPublish?.(form);
    setIsSubmitting(false);

    if (result && !result.success)
      notify.error(
        "Publish Failed",
        result.message || "Failed to send announcement.",
      );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-card-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-card-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
              <Send size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary leading-tight">
                Send Announcement
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Broadcast a message to employees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-input transition-colors cursor-pointer bg-transparent border-none"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="publish-form" onSubmit={handleSubmit} className="space-y-5">
            {templates.length > 0 && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <label className="block text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wider">
                  Use a Template (Optional)
                </label>
                <select
                  onChange={handleTemplateSelect}
                  defaultValue=""
                  className="w-full appearance-none bg-input text-text-primary px-3 py-2 rounded border border-card-border text-sm outline-none cursor-pointer focus:border-blue-400 transition-colors"
                >
                  <option value="" disabled>
                    Select a saved template...
                  </option>
                  {templates.map((t) => (
                    <option key={t._id} value={t._id} className="bg-secondary">
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Announcement Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Subject of the announcement"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-btn transition-colors ${errors.title ? "border-danger" : "border-card-border"}`}
                />
                {errors.title && (
                  <p className="text-xs text-danger mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-primary mb-1.5">
                  Message <span className="text-danger">*</span>
                </label>
                <textarea
                  rows="4"
                  placeholder="Type your message here..."
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-btn transition-colors resize-none custom-scrollbar ${errors.message ? "border-danger" : "border-card-border"}`}
                />
                {errors.message && (
                  <p className="text-xs text-danger mt-1">{errors.message}</p>
                )}
              </div>
            </div>

            <div className="border-t border-card-border pt-4">
              <label className="block text-sm font-semibold text-text-primary mb-3">
                Who should see this? <span className="text-danger">*</span>
              </label>

              <div className="flex flex-wrap gap-3 mb-4">
                {["all", "department", "individual"].map((type) => (
                  <label
                    key={type}
                    className={`flex-1 min-w-[100px] text-center py-2 px-3 rounded-lg border cursor-pointer transition-all text-sm font-medium capitalize ${form.audienceType === type ? "bg-btn/20 border-btn text-accent" : "bg-input border-card-border text-text-secondary hover:text-text-primary"}`}
                  >
                    <input
                      type="radio"
                      name="audience"
                      value={type}
                      checked={form.audienceType === type}
                      onChange={() => handleChange("audienceType", type)}
                      className="hidden"
                    />
                    {type}
                  </label>
                ))}
              </div>

              {/* 🚨 DYNAMIC DEPARTMENTS DROPDOWN */}
              {form.audienceType === "department" && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  {loadingData ? (
                    <div className="flex items-center gap-2 text-sm text-text-secondary py-2">
                      <Loader2 size={16} className="animate-spin text-accent" />{" "}
                      Loading Departments...
                    </div>
                  ) : (
                    <select
                      multiple
                      value={form.departments}
                      onChange={(e) =>
                        handleChange(
                          "departments",
                          Array.from(e.target.selectedOptions, (o) => o.value),
                        )
                      }
                      className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors h-32 custom-scrollbar"
                    >
                      {departmentsList.map((d) => (
                        <option
                          key={d._id}
                          value={d._id}
                          className="p-1.5 hover:bg-hover cursor-pointer"
                        >
                          {formatDeptName(d.name)}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-[10px] text-text-secondary mt-2 italic">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
                  </p>
                </div>
              )}

              {/* 🚨 DYNAMIC INDIVIDUALS DROPDOWN */}
              {form.audienceType === "individual" && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  {loadingData ? (
                    <div className="flex items-center gap-2 text-sm text-text-secondary py-2">
                      <Loader2 size={16} className="animate-spin text-accent" />{" "}
                      Loading Employees...
                    </div>
                  ) : (
                    <select
                      multiple
                      value={form.recipients}
                      onChange={(e) =>
                        handleChange(
                          "recipients",
                          Array.from(e.target.selectedOptions, (o) => o.value),
                        )
                      }
                      className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors h-32 custom-scrollbar"
                    >
                      {employeesList.map((emp) => (
                        // Mapping _id as value, showing name and employeeId in the UI
                        <option
                          key={emp._id}
                          value={emp._id}
                          className="p-1.5 hover:bg-hover cursor-pointer"
                        >
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-[10px] text-text-secondary mt-2 italic">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
                  </p>
                </div>
              )}

              {errors.audience && (
                <p className="text-xs text-danger mt-2">{errors.audience}</p>
              )}
            </div>
          </form>
        </div>

        <div className="p-5 sm:p-6 border-t border-card-border bg-card rounded-b-2xl flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-input text-text-secondary border border-card-border text-sm font-semibold hover:bg-hover transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="publish-form"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-btn text-white border-none text-sm font-semibold hover:bg-btn-hover transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              "Sending..."
            ) : (
              <>
                <Send size={16} /> Publish Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
