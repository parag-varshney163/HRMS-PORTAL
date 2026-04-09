import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Save, CalendarDays, ShieldCheck } from "lucide-react";
import Toggle from "../ui/Toggle";
import Button from "../ui/Button";

const initialForm = {
  casualLeave: "0",
  sickLeave: "0",
  earnedLeave: "0",
  compOffLeave: "0",
  leaveRules: {
    allowCarryForward: false,
    allowEncashment: false,
    allowNegativeBalance: false,
  },
};

export default function LeavePolicy() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ─── FETCH POLICY ───
  const fetchPolicy = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/v1/leave-policy");
      if (data.success && data.data) {
        setForm({
          casualLeave: data.data.casualLeave || "0",
          sickLeave: data.data.sickLeave || "0",
          earnedLeave: data.data.earnedLeave || "0",
          compOffLeave: data.data.compOffLeave || "0",
          leaveRules: {
            allowCarryForward: data.data.leaveRules?.allowCarryForward || false,
            allowEncashment: data.data.leaveRules?.allowEncashment || false,
            allowNegativeBalance:
              data.data.leaveRules?.allowNegativeBalance || false,
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch leave policy", error);
      // If 404, it might just mean no policy exists yet, which is fine, we use defaults.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  // ─── HANDLERS ───
  // Handle top-level numeric inputs
  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage({ type: "", text: "" });
  };

  // Handle nested boolean toggles
  const handleRuleToggle = (ruleKey) => {
    setForm((prev) => ({
      ...prev,
      leaveRules: {
        ...prev.leaveRules,
        [ruleKey]: !prev.leaveRules[ruleKey],
      },
    }));
    setMessage({ type: "", text: "" });
  };

  // ─── SAVE SETTINGS ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // POST handles both create and update for this endpoint
      const { data } = await axiosInstance.post("/api/v1/leave-policy", form);
      if (data.success) {
        setMessage({
          type: "success",
          text: "Leave policy updated successfully!",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update leave policy.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── REUSABLE ROW COMPONENT FOR TOGGLES ───
  const RuleRow = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-card-border/50 last:border-0">
      <div className="pr-6">
        <h4 className="text-sm font-semibold text-text-primary">{label}</h4>
        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );

  if (loading)
    return (
      <div className="animate-pulse text-text-secondary">
        Loading leave policy...
      </div>
    );

  return (
    <div className="animate-in fade-in duration-300 flex flex-col h-full max-w-4xl">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-card-border">
        <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
          <CalendarDays size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-text-primary">Leave Policy</h3>
          <p className="text-sm text-text-secondary">
            Configure annual leave quotas and company rules.
          </p>
        </div>
      </div>

      {/* ─── Status Message ─── */}
      {message.text && (
        <div
          className={`p-4 mb-6 rounded-lg text-sm font-medium border ${
            message.type === "success"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ─── Settings Form ─── */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
          {/* SECTION 1: Annual Leave Allocations */}
          <div className="bg-input/20 border border-card-border rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-400" /> Annual Leave
              Quotas (Days)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Casual Leave
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.casualLeave}
                  onChange={(e) =>
                    handleInputChange("casualLeave", e.target.value)
                  }
                  className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Sick Leave
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.sickLeave}
                  onChange={(e) =>
                    handleInputChange("sickLeave", e.target.value)
                  }
                  className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Earned Leave
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.earnedLeave}
                  onChange={(e) =>
                    handleInputChange("earnedLeave", e.target.value)
                  }
                  className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Comp-Off
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.compOffLeave}
                  onChange={(e) =>
                    handleInputChange("compOffLeave", e.target.value)
                  }
                  className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Leave Rules */}
          <div className="bg-input/20 border border-card-border rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-purple-400" /> Compliance
              Rules
            </h3>
            <div className="flex flex-col">
              <RuleRow
                label="Carry Forward Leaves"
                description="Allow employees to transfer unused earned leaves to the next year."
                checked={form.leaveRules.allowCarryForward}
                onChange={() => handleRuleToggle("allowCarryForward")}
              />
              <RuleRow
                label="Leave Encashment"
                description="Allow employees to cash out unused earned leaves at year-end."
                checked={form.leaveRules.allowEncashment}
                onChange={() => handleRuleToggle("allowEncashment")}
              />
              <RuleRow
                label="Allow Negative Balance"
                description="Permit employees to take leaves even if their balance is zero."
                checked={form.leaveRules.allowNegativeBalance}
                onChange={() => handleRuleToggle("allowNegativeBalance")}
              />
            </div>
          </div>
        </div>

        {/* ─── Save Button ─── */}
        <div className="mt-auto pt-4 pb-2 flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            variant="custom"
            bg="#3B82F6"
            text="#FFFFFF"
            icon={Save}
            className={saving ? "opacity-70" : ""}
          >
            {saving ? "Saving Policy..." : "Save Leave Policy"}
          </Button>
        </div>
      </form>
    </div>
  );
}
