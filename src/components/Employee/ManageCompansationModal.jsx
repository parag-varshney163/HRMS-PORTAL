import { X, Wallet, Landmark, CalendarDays, Loader2, User } from "lucide-react";
import React, { useState, useEffect } from "react";

import useNotification from "../../hooks/useNotification.jsx";
import axiosInstance from "../../api/axiosInstance";
import FilterDropDown from "../ui/FilterDropDown";
import colors from "../../constants/colors.js";
import Button from "../ui/Button";


const blankForm = {
  user: "", // MongoDB _id
  // Salary
  annualSalary: "",
  totalCTC: "",
  incentiveAmount: "",
  incentiveFrequency: "monthly",
  // Banking
  bankName: "",
  branchName: "",
  nameInAccount: "",
  accountNumber: "",
  ifscCode: "",
  state: "",
  panCardNumber: "",
  // Leaves
  casualLeave: 0,
  sickLeave: 0,
};
function InputField({
    label,
    type = "text",
    required = false,
    value,
    onChange,
  }) {
    return (
      <div>
        <label
          className="block text-xs font-semibold mb-1"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </label>

        <input
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
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
    );
  }

export default function ManageCompensationModal({ open, onClose, onSuccess }) {
  const notify = useNotification();
  const [form, setForm] = useState(blankForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Users State for Dropdown
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ─── FETCH USERS ON MOUNT ───
  useEffect(() => {
    if (open) {
      setLoadingUsers(true);
      axiosInstance
        .get("/api/v1/user/all-users")
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            setUsers(res.data.data);
          }
        })
        .catch((err) => console.error("Failed to fetch users", err))
        .finally(() => setLoadingUsers(false));

      setForm(blankForm); // Reset form when opened
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ─── SUBMIT HANDLER ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user)
      return notify.warning("Missing Field", "Please select an employee.");

    setIsSubmitting(true);

    // 🚨 PERFECT PAYLOAD MAPPING: Matches your Swagger screenshot exactly
    const payload = {
      user: form.user,
      annualSalary: Number(form.annualSalary) || 0,
      totalCTC: Number(form.totalCTC) || 0,
      incentiveDetails: {
        incentiveAmount: Number(form.incentiveAmount) || 0,
        incentiveFrequency: form.incentiveFrequency,
      },
      bankingDetails: {
        bankName: form.bankName,
        branchName: form.branchName,
        nameInAccount: form.nameInAccount,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        state: form.state,
        panCardNumber: form.panCardNumber,
      },
      leaveBalance: {
        casualLeave: Number(form.casualLeave) || 0,
        sickLeave: Number(form.sickLeave) || 0,
      },
    };

    try {
      const { data } = await axiosInstance.post(
        "/api/v1/salary-leave",
        payload,
      );
      if (data.success) {
        notify.success(
          "Success",
          "Compensation & Banking details saved successfully.",
        );
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      notify.error(
        "Save Failed",
        error.response?.data?.message || "Could not save compensation details.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── DROPDOWN MAPPERS ───
  const userOptions = users.map((u) => `${u.name} (${u.userId})`);
  const selectedUserObj = users.find((u) => u._id === form.user);
  const userLabel = selectedUserObj
    ? `${selectedUserObj.name} (${selectedUserObj.userId})`
    : "Search Employee...";


  

  // return (
  //   <div
  //     className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  //     onClick={() => !isSubmitting && onClose()}
  //   >
  //     <div
  //       className="bg-card border border-card-border rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col"
  //       onClick={(e) => e.stopPropagation()}
  //     >
  //       {/* HEADER */}
  //       <div className="p-6 border-b border-card-border flex justify-between items-center bg-card shrink-0 rounded-t-2xl">
  //         <div>
  //           <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
  //             <Wallet className="text-accent" /> Compensation & Benefits
  //           </h2>
  //           <p className="text-xs text-text-secondary mt-1">
  //             Set salary, banking, and initial leave balances.
  //           </p>
  //         </div>
  //         <button
  //           type="button"
  //           onClick={onClose}
  //           disabled={isSubmitting}
  //           className="text-text-secondary hover:text-text-primary p-2 rounded-lg hover:bg-hover transition-colors disabled:opacity-50"
  //         >
  //           <X size={20} />
  //         </button>
  //       </div>

  //       {/* SCROLLABLE FORM */}
  //       <form
  //         onSubmit={handleSubmit}
  //         className="p-6 overflow-y-auto custom-scrollbar space-y-8"
  //       >
  //         {/* 1. EMPLOYEE SELECTION */}
  //         <div>
  //           <label className="block text-sm font-semibold text-text-primary mb-1.5 flex justify-between items-center">
  //             <span>
  //               Select Employee <span className="text-danger">*</span>
  //             </span>
  //             {loadingUsers && (
  //               <Loader2 size={12} className="animate-spin text-accent" />
  //             )}
  //           </label>
  //           {loadingUsers ? (
  //             <div className="w-full bg-input text-text-secondary px-4 py-2.5 rounded-xl border border-card-border text-sm">
  //               Loading directory...
  //             </div>
  //           ) : (
  //             <FilterDropDown
  //               key={`user-${userLabel}`}
  //               options={userOptions}
  //               defaultLabel={userLabel}
  //               width="100%"
  //               onSelect={(selectedStr) => {
  //                 const user = users.find(
  //                   (u) => `${u.name} (${u.userId})` === selectedStr,
  //                 );
  //                 if (user) handleChange("user", user._id);
  //               }}
  //             />
  //           )}
  //         </div>

  //         {/* 2. SALARY DETAILS */}
  //         <div className="bg-input/20 p-5 rounded-xl border border-card-border/50">
  //           <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4 border-b border-card-border pb-2">
  //             <Wallet size={16} className="text-green-400" /> Salary Breakdown
  //           </h3>
  //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 Total CTC (₹)
  //               </label>
  //               <input
  //                 type="number"
  //                 required
  //                 value={form.totalCTC}
  //                 onChange={(e) => handleChange("totalCTC", e.target.value)}
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn"
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 Annual Base Salary (₹)
  //               </label>
  //               <input
  //                 type="number"
  //                 required
  //                 value={form.annualSalary}
  //                 onChange={(e) => handleChange("annualSalary", e.target.value)}
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn"
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 Incentive Amount (₹)
  //               </label>
  //               <input
  //                 type="number"
  //                 value={form.incentiveAmount}
  //                 onChange={(e) =>
  //                   handleChange("incentiveAmount", e.target.value)
  //                 }
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn"
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 Incentive Frequency
  //               </label>
  //               <select
  //                 value={form.incentiveFrequency}
  //                 onChange={(e) =>
  //                   handleChange("incentiveFrequency", e.target.value)
  //                 }
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn"
  //               >
  //                 <option value="monthly">Monthly</option>
  //                 <option value="quarterly">Quarterly</option>
  //                 <option value="yearly">Yearly</option>
  //               </select>
  //             </div>
  //           </div>
  //         </div>

  //         {/* 3. BANKING DETAILS */}
  //         <div className="bg-input/20 p-5 rounded-xl border border-card-border/50">
  //           <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4 border-b border-card-border pb-2">
  //             <Landmark size={16} className="text-blue-400" /> Banking & Tax
  //             Info
  //           </h3>
  //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 Bank Name
  //               </label>
  //               <input
  //                 type="text"
  //                 required
  //                 value={form.bankName}
  //                 onChange={(e) => handleChange("bankName", e.target.value)}
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn"
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 Branch Name
  //               </label>
  //               <input
  //                 type="text"
  //                 required
  //                 value={form.branchName}
  //                 onChange={(e) => handleChange("branchName", e.target.value)}
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn"
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 Name on Account
  //               </label>
  //               <input
  //                 type="text"
  //                 required
  //                 value={form.nameInAccount}
  //                 onChange={(e) =>
  //                   handleChange("nameInAccount", e.target.value)
  //                 }
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn"
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 Account Number
  //               </label>
  //               <input
  //                 type="text"
  //                 required
  //                 value={form.accountNumber}
  //                 onChange={(e) =>
  //                   handleChange("accountNumber", e.target.value)
  //                 }
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn"
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 IFSC Code
  //               </label>
  //               <input
  //                 type="text"
  //                 required
  //                 value={form.ifscCode}
  //                 onChange={(e) => handleChange("ifscCode", e.target.value)}
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn uppercase"
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 State
  //               </label>
  //               <input
  //                 type="text"
  //                 required
  //                 value={form.state}
  //                 onChange={(e) => handleChange("state", e.target.value)}
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn"
  //               />
  //             </div>
  //             <div className="sm:col-span-2">
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 PAN Card Number
  //               </label>
  //               <input
  //                 type="text"
  //                 required
  //                 value={form.panCardNumber}
  //                 onChange={(e) =>
  //                   handleChange("panCardNumber", e.target.value)
  //                 }
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn uppercase"
  //               />
  //             </div>
  //           </div>
  //         </div>

  //         {/* 4. LEAVE BALANCES */}
  //         <div className="bg-input/20 p-5 rounded-xl border border-card-border/50">
  //           <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 mb-4 border-b border-card-border pb-2">
  //             <CalendarDays size={16} className="text-yellow-400" /> Initial
  //             Leave Balances
  //           </h3>
  //           <div className="grid grid-cols-2 gap-4">
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 Casual Leave
  //               </label>
  //               <input
  //                 type="number"
  //                 required
  //                 value={form.casualLeave}
  //                 onChange={(e) => handleChange("casualLeave", e.target.value)}
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn"
  //               />
  //             </div>
  //             <div>
  //               <label className="block text-xs font-semibold text-text-secondary mb-1">
  //                 Sick Leave
  //               </label>
  //               <input
  //                 type="number"
  //                 required
  //                 value={form.sickLeave}
  //                 onChange={(e) => handleChange("sickLeave", e.target.value)}
  //                 className="w-full bg-input text-text-primary px-3 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn"
  //               />
  //             </div>
  //           </div>
  //         </div>
  //       </form>

  //       {/* FOOTER */}
  //       <div className="p-6 border-t border-card-border shrink-0 flex gap-3 bg-card rounded-b-2xl">
  //         <button
  //           type="button"
  //           onClick={onClose}
  //           disabled={isSubmitting}
  //           className="flex-1 py-2.5 rounded-xl bg-input text-text-secondary border border-card-border text-sm font-semibold hover:bg-hover transition-colors disabled:opacity-50"
  //         >
  //           Cancel
  //         </button>
  //         <Button
  //           type="submit"
  //           disabled={isSubmitting}
  //           onClick={handleSubmit}
  //           className="flex-1 py-2.5 rounded-xl bg-btn text-white border-none text-sm font-semibold hover:bg-btn-hover transition-colors disabled:opacity-70"
  //         >
  //           {isSubmitting ? "Saving Data..." : "Save Finance Profile"}
  //         </Button>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(31, 41, 55, 0.55)",
        backdropFilter: "blur(4px)",
      }}
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className="p-6 flex justify-between items-center shrink-0"
          style={{
            backgroundColor: colors.cardBg,
            borderBottom: `1px solid ${colors.cardBorder}`,
          }}
        >
          <div>
            <h2
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: colors.textPrimary }}
            >
              <Wallet size={21} style={{ color: colors.success }} />
              Compensation & Benefits
            </h2>

            <p
              className="text-xs mt-1"
              style={{ color: colors.textSecondary }}
            >
              Set salary, banking, and initial leave balances.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              color: colors.textSecondary,
              backgroundColor: "transparent",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.backgroundColor = colors.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto custom-scrollbar space-y-6"
        >
          {/* EMPLOYEE SELECTION */}
          <div>
            <label
              className="block text-sm font-semibold mb-1.5 flex justify-between items-center"
              style={{ color: colors.textPrimary }}
            >
              <span>
                Select Employee{" "}
                <span style={{ color: colors.danger }}>*</span>
              </span>

              {loadingUsers && (
                <Loader2
                  size={14}
                  className="animate-spin"
                  style={{ color: colors.accentDark }}
                />
              )}
            </label>

            {loadingUsers ? (
              <div
                className="w-full px-4 py-2.5 rounded-xl text-sm"
                style={{
                  backgroundColor: colors.inputBg,
                  color: colors.textSecondary,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                Loading directory...
              </div>
            ) : (
              <FilterDropDown
                key={`user-${userLabel}`}
                options={userOptions}
                defaultLabel={userLabel}
                width="100%"
                onSelect={(selectedStr) => {
                  const user = users.find(
                    (u) => `${u.name} (${u.userId})` === selectedStr,
                  );

                  if (user) handleChange("user", user._id);
                }}
              />
            )}
          </div>

          {/* SALARY DETAILS */}
          <div
            className="p-5 rounded-xl"
            style={{
              backgroundColor: colors.successLight,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <h3
              className="text-sm font-bold flex items-center gap-2 mb-4 pb-2"
              style={{
                color: colors.textPrimary,
                borderBottom: `1px solid ${colors.cardBorder}`,
              }}
            >
              <Wallet size={16} style={{ color: colors.success }} />
              Salary Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Total CTC (₹)"
                type="number"
                required
                value={form.totalCTC}
                onChange={(e) => handleChange("totalCTC", e.target.value)}
              />

              <InputField
                label="Annual Base Salary (₹)"
                type="number"
                required
                value={form.annualSalary}
                onChange={(e) => handleChange("annualSalary", e.target.value)}
              />

              <InputField
                label="Incentive Amount (₹)"
                type="number"
                value={form.incentiveAmount}
                onChange={(e) => handleChange("incentiveAmount", e.target.value)}
              />

              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: colors.textSecondary }}
                >
                  Incentive Frequency
                </label>

                <select
                  value={form.incentiveFrequency}
                  onChange={(e) =>
                    handleChange("incentiveFrequency", e.target.value)
                  }
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          {/* BANKING DETAILS */}
          <div
            className="p-5 rounded-xl"
            style={{
              backgroundColor: colors.blueLight,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <h3
              className="text-sm font-bold flex items-center gap-2 mb-4 pb-2"
              style={{
                color: colors.textPrimary,
                borderBottom: `1px solid ${colors.cardBorder}`,
              }}
            >
              <Landmark size={16} style={{ color: colors.blue }} />
              Banking & Tax Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Bank Name"
                required
                value={form.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
              />

              <InputField
                label="Branch Name"
                required
                value={form.branchName}
                onChange={(e) => handleChange("branchName", e.target.value)}
              />

              <InputField
                label="Name on Account"
                required
                value={form.nameInAccount}
                onChange={(e) => handleChange("nameInAccount", e.target.value)}
              />

              <InputField
                label="Account Number"
                required
                value={form.accountNumber}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
              />

              <InputField
                label="IFSC Code"
                required
                value={form.ifscCode}
                onChange={(e) =>
                  handleChange("ifscCode", e.target.value.toUpperCase())
                }
              />

              <InputField
                label="State"
                required
                value={form.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />

              <div className="sm:col-span-2">
                <InputField
                  label="PAN Card Number"
                  required
                  value={form.panCardNumber}
                  onChange={(e) =>
                    handleChange("panCardNumber", e.target.value.toUpperCase())
                  }
                />
              </div>
            </div>
          </div>

          {/* LEAVE BALANCES */}
          <div
            className="p-5 rounded-xl"
            style={{
              backgroundColor: colors.accentLight,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            <h3
              className="text-sm font-bold flex items-center gap-2 mb-4 pb-2"
              style={{
                color: colors.textPrimary,
                borderBottom: `1px solid ${colors.cardBorder}`,
              }}
            >
              <CalendarDays size={16} style={{ color: colors.warning }} />
              Initial Leave Balances
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Casual Leave"
                type="number"
                required
                value={form.casualLeave}
                onChange={(e) => handleChange("casualLeave", e.target.value)}
              />

              <InputField
                label="Sick Leave"
                type="number"
                required
                value={form.sickLeave}
                onChange={(e) => handleChange("sickLeave", e.target.value)}
              />
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div
          className="p-6 shrink-0 flex gap-3"
          style={{
            backgroundColor: colors.cardBg,
            borderTop: `1px solid ${colors.cardBorder}`,
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
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>

          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-none"
            bg={colors.buttonBg}
            text="#FFFFFF"
          >
            {isSubmitting ? "Saving Data..." : "Save Finance Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
