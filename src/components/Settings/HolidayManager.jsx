import { Plus, Edit2, Trash2, Calendar, X, Loader2 } from "lucide-react";
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";

import useNotification from "../../hooks/useNotification.jsx";
import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors.js";
import Button from "../ui/Button";


export default function HolidayManager() {
  const notify = useNotification();

  // ─── STATE ───
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({ title: "", date: "" });
  const [errors, setErrors] = useState({});

  // ─── API: FETCH (READ) ───
  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/v1/holiday");
      if (data.success) {
        // Sort holidays chronologically
        const sortedHolidays = (data.data || []).sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        );
        setHolidays(sortedHolidays);
      }
    } catch (error) {
      notify.error("Failed to load", "Could not fetch company holidays.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchHolidays();
  }, []);

  // ─── MODAL HANDLERS ───
  const openModal = (holiday = null) => {
    if (holiday) {
      setEditingHoliday(holiday);
      // The HTML date input requires YYYY-MM-DD format
      const formattedDate = new Date(holiday.date).toISOString().split("T")[0];
      setForm({ title: holiday.title, date: formattedDate });
    } else {
      setEditingHoliday(null);
      setForm({ title: "", date: "" });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ title: "", date: "" });
    setEditingHoliday(null);
  };

  // ─── API: CREATE & UPDATE ───
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Holiday title is required";
    if (!form.date) newErrors.date = "Date is required";
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    try {
      setIsSubmitting(true);
      const payload = { title: form.title, date: form.date };

      if (editingHoliday) {
        // UPDATE (PUT)
        const { data } = await axiosInstance.put(
          `/api/v1/holiday/${editingHoliday._id}`,
          payload,
        );
        if (data.success)
          notify.success("Updated", "Holiday updated successfully.");
      } else {
        // CREATE (POST)
        const { data } = await axiosInstance.post("/api/v1/holiday", payload);
        if (data.success)
          notify.success("Created", "New holiday added successfully.");
      }

      closeModal();
      fetchHolidays(); // Refresh the list
    } catch (error) {
      notify.error(
        "Action Failed",
        error.response?.data?.message || "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── API: DELETE ───
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?"))
      return;

    try {
      const { data } = await axiosInstance.delete(`/api/v1/holiday/${id}`);
      if (data.success) {
        notify.success("Deleted", "Holiday removed successfully.");
        fetchHolidays();
      }
    } catch (error) {
      notify.error(
        "Delete Failed",
        error.response?.data?.message || "Could not delete holiday.",
      );
    }
  };

  // return (
  //   <div className="flex flex-col h-full animate-in fade-in">
  //     {/* HEADER */}
  //     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
  //       <div>
  //         <h3 className="text-xl font-bold text-text-primary">
  //           Company Holidays
  //         </h3>
  //         <p className="text-sm text-text-secondary mt-1">
  //           Manage official organization holidays and off-days.
  //         </p>
  //       </div>
  //       <Button
  //         variant="custom"
  //         bg="#3B82F6"
  //         text="#FFF"
  //         icon={Plus}
  //         size="sm"
  //         onClick={() => openModal()}
  //       >
  //         Add Holiday
  //       </Button>
  //     </div>

  //     {/* HOLIDAY LIST */}
  //     <div className="flex-1 bg-card border border-card-border rounded-xl overflow-hidden shadow-sm">
  //       {loading ? (
  //         <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
  //           <Loader2 className="animate-spin text-accent mb-3" size={32} />
  //           <p>Loading holidays...</p>
  //         </div>
  //       ) : holidays.length === 0 ? (
  //         <div className="flex flex-col items-center justify-center py-20 text-text-secondary border-dashed border border-card-border rounded-xl m-4">
  //           <Calendar size={48} className="opacity-30 mb-4" />
  //           <p className="font-semibold text-text-primary">No Holidays Found</p>
  //           <p className="text-sm mt-1">
  //             Click the button above to add the first official holiday.
  //           </p>
  //         </div>
  //       ) : (
  //         <div className="overflow-x-auto">
  //           <table className="w-full text-left border-collapse">
  //             <thead>
  //               <tr className="bg-input/50 border-b border-card-border">
  //                 <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
  //                   Date
  //                 </th>
  //                 <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">
  //                   Holiday Title
  //                 </th>
  //                 <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">
  //                   Actions
  //                 </th>
  //               </tr>
  //             </thead>
  //             <tbody className="divide-y divide-card-border">
  //               {holidays.map((holiday) => (
  //                 <tr
  //                   key={holiday._id}
  //                   className="hover:bg-input/30 transition-colors group"
  //                 >
  //                   <td className="px-6 py-4 whitespace-nowrap">
  //                     <div className="flex items-center gap-3">
  //                       <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex flex-col items-center justify-center shrink-0">
  //                         <span className="text-[10px] font-bold uppercase leading-none">
  //                           {new Date(holiday.date).toLocaleDateString(
  //                             "en-US",
  //                             { month: "short" },
  //                           )}
  //                         </span>
  //                         <span className="text-sm font-black leading-none mt-0.5">
  //                           {new Date(holiday.date).getDate()}
  //                         </span>
  //                       </div>
  //                       <span className="text-sm font-medium text-text-secondary">
  //                         {new Date(holiday.date).toLocaleDateString("en-US", {
  //                           weekday: "long",
  //                           year: "numeric",
  //                         })}
  //                       </span>
  //                     </div>
  //                   </td>
  //                   <td className="px-6 py-4">
  //                     <span className="text-sm font-bold text-text-primary">
  //                       {holiday.title}
  //                     </span>
  //                   </td>
  //                   <td className="px-6 py-4 text-right">
  //                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
  //                       <button
  //                         onClick={() => openModal(holiday)}
  //                         className="p-2 text-text-secondary hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
  //                         title="Edit"
  //                       >
  //                         <Edit2 size={16} />
  //                       </button>
  //                       <button
  //                         onClick={() => handleDelete(holiday._id)}
  //                         className="p-2 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
  //                         title="Delete"
  //                       >
  //                         <Trash2 size={16} />
  //                       </button>
  //                     </div>
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //       )}
  //     </div>

  //     {/* CREATE / EDIT MODAL */}
  //     {isModalOpen && (
  //       <div
  //         className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  //         onClick={closeModal}
  //       >
  //         <div
  //           className="bg-card border border-card-border rounded-2xl w-full max-w-sm shadow-2xl"
  //           onClick={(e) => e.stopPropagation()}
  //         >
  //           <div className="flex items-center justify-between p-5 border-b border-card-border">
  //             <h2 className="text-lg font-bold text-text-primary">
  //               {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
  //             </h2>
  //             <button
  //               onClick={closeModal}
  //               className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none"
  //             >
  //               <X size={20} />
  //             </button>
  //           </div>

  //           <form onSubmit={handleSubmit} className="p-5 space-y-4">
  //             <div>
  //               <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //                 Holiday Title <span className="text-danger">*</span>
  //               </label>
  //               <input
  //                 type="text"
  //                 placeholder="e.g. Christmas Day"
  //                 value={form.title}
  //                 onChange={(e) => {
  //                   setForm({ ...form, title: e.target.value });
  //                   if (errors.title) setErrors({ ...errors, title: "" });
  //                 }}
  //                 className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-btn transition-colors ${errors.title ? "border-danger" : "border-card-border"}`}
  //               />
  //               {errors.title && (
  //                 <p className="text-xs text-danger mt-1">{errors.title}</p>
  //               )}
  //             </div>

  //             <div>
  //               <label className="block text-sm font-semibold text-text-primary mb-1.5">
  //                 Date <span className="text-danger">*</span>
  //               </label>
  //               <input
  //                 type="date"
  //                 value={form.date}
  //                 onChange={(e) => {
  //                   setForm({ ...form, date: e.target.value });
  //                   if (errors.date) setErrors({ ...errors, date: "" });
  //                 }}
  //                 className={`w-full bg-input text-text-primary px-4 py-2.5 rounded-xl border text-sm outline-none focus:border-btn transition-colors [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 cursor-pointer ${errors.date ? "border-danger" : "border-card-border"}`}
  //               />
  //               {errors.date && (
  //                 <p className="text-xs text-danger mt-1">{errors.date}</p>
  //               )}
  //             </div>

  //             <div className="pt-4 flex gap-3">
  //               <button
  //                 type="button"
  //                 onClick={closeModal}
  //                 disabled={isSubmitting}
  //                 className="flex-1 py-2.5 rounded-xl bg-input text-text-secondary border border-card-border text-sm font-semibold hover:bg-hover transition-colors cursor-pointer"
  //               >
  //                 Cancel
  //               </button>
  //               <Button
  //                 type="submit"
  //                 disabled={isSubmitting}
  //                 className="flex-1 justify-center py-2.5"
  //               >
  //                 {isSubmitting
  //                   ? "Saving..."
  //                   : editingHoliday
  //                     ? "Update"
  //                     : "Create"}
  //               </Button>
  //             </div>
  //           </form>
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // );

  return (
  <div className="flex flex-col h-full animate-in fade-in">
    {/* HEADER */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3
          className="text-xl font-bold"
          style={{ color: colors.textPrimary }}
        >
          Company Holidays
        </h3>
        <p
          className="text-sm mt-1"
          style={{ color: colors.textSecondary }}
        >
          Manage official organization holidays and off-days.
        </p>
      </div>

      <Button
        variant="custom"
        bg={colors.blue}
        text="#FFFFFF"
        icon={Plus}
        size="sm"
        onClick={() => openModal()}
      >
        Add Holiday
      </Button>
    </div>

    {/* HOLIDAY LIST */}
    <div
      className="flex-1 rounded-xl overflow-hidden shadow-sm border"
      style={{
        background: colors.cardBg,
        borderColor: colors.cardBorder,
      }}
    >
      {loading ? (
        <div
          className="flex flex-col items-center justify-center py-20"
          style={{ color: colors.textSecondary }}
        >
          <Loader2
            className="animate-spin mb-3"
            size={32}
            style={{ color: colors.accent }}
          />
          <p>Loading holidays...</p>
        </div>
      ) : holidays.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 border rounded-xl m-4"
          style={{
            color: colors.textSecondary,
            borderStyle: "dashed",
            borderColor: colors.cardBorder,
          }}
        >
          <Calendar
            size={48}
            style={{ color: colors.textMuted }}
            className="mb-4 opacity-40"
          />

          <p
            className="font-semibold"
            style={{ color: colors.textPrimary }}
          >
            No Holidays Found
          </p>

          <p className="text-sm mt-1">
            Click the button above to add the first official holiday.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className="border-b"
                style={{
                  background: colors.inputBg,
                  borderColor: colors.cardBorder,
                }}
              >
                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider"
                  style={{ color: colors.textSecondary }}
                >
                  Date
                </th>

                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider"
                  style={{ color: colors.textSecondary }}
                >
                  Holiday Title
                </th>

                <th
                  className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right"
                  style={{ color: colors.textSecondary }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {holidays.map((holiday) => (
                <tr
                  key={holiday._id}
                  className="group transition-colors"
                  style={{
                    borderBottom: `1px solid ${colors.cardBorder}`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = colors.hover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0"
                        style={{
                          background: colors.blueLight,
                          color: colors.blue,
                        }}
                      >
                        <span className="text-[10px] font-bold uppercase leading-none">
                          {new Date(holiday.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                            }
                          )}
                        </span>

                        <span className="text-sm font-black leading-none mt-0.5">
                          {new Date(holiday.date).getDate()}
                        </span>
                      </div>

                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.textSecondary }}
                      >
                        {new Date(holiday.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className="text-sm font-bold"
                      style={{ color: colors.textPrimary }}
                    >
                      {holiday.title}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(holiday)}
                        title="Edit"
                        className="p-2 rounded-lg transition-colors cursor-pointer"
                        style={{
                          color: colors.blue,
                          background: colors.blueLight,
                        }}
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(holiday._id)}
                        title="Delete"
                        className="p-2 rounded-lg transition-colors cursor-pointer"
                        style={{
                          color: colors.danger,
                          background: colors.dangerLight,
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* MODAL */}
    {isModalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.55)" }}
        onClick={closeModal}
      >
        <div
          className="w-full max-w-sm rounded-2xl border shadow-2xl"
          style={{
            background: colors.cardBg,
            borderColor: colors.cardBorder,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center justify-between p-5 border-b"
            style={{ borderColor: colors.cardBorder }}
          >
            <h2
              className="text-lg font-bold"
              style={{ color: colors.textPrimary }}
            >
              {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
            </h2>

            <button
              onClick={closeModal}
              className="bg-transparent border-none cursor-pointer"
              style={{ color: colors.textSecondary }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: colors.textPrimary }}
              >
                Holiday Title{" "}
                <span style={{ color: colors.danger }}>*</span>
              </label>

              <input
                type="text"
                placeholder="e.g. Christmas Day"
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  if (errors.title)
                    setErrors({ ...errors, title: "" });
                }}
                className="w-full px-4 py-2.5 rounded-xl border outline-none transition-colors"
                style={{
                  background: colors.inputBg,
                  color: colors.textPrimary,
                  borderColor: errors.title
                    ? colors.danger
                    : colors.cardBorder,
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

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: colors.textPrimary }}
              >
                Date <span style={{ color: colors.danger }}>*</span>
              </label>

              <input
                type="date"
                value={form.date}
                onChange={(e) => {
                  setForm({ ...form, date: e.target.value });
                  if (errors.date)
                    setErrors({ ...errors, date: "" });
                }}
                className="w-full px-4 py-2.5 rounded-xl border outline-none cursor-pointer"
                style={{
                  background: colors.inputBg,
                  color: colors.textPrimary,
                  borderColor: errors.date
                    ? colors.danger
                    : colors.cardBorder,
                }}
              />

              {errors.date && (
                <p
                  className="text-xs mt-1"
                  style={{ color: colors.danger }}
                >
                  {errors.date}
                </p>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border font-semibold transition-colors"
                style={{
                  background: colors.inputBg,
                  color: colors.textSecondary,
                  borderColor: colors.cardBorder,
                }}
              >
                Cancel
              </button>

              <Button
                type="submit"
                bg={colors.buttonBg}
                hoverBg={colors.buttonHover}
                text="#fff"
                disabled={isSubmitting}
                className="flex-1 justify-center py-2.5"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingHoliday
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
}
