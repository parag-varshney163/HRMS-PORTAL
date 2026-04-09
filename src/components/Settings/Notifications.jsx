import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Save, BellRing, Mail, MonitorSmartphone } from "lucide-react";
import Toggle from "../ui/Toggle";
import Button from "../ui/Button"; // 👈 Importing your custom Button

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // ─── STATE STRUCTURE MATCHING YOUR JSON ───
  const [preferences, setPreferences] = useState({
    emailNotifications: {
      leaveRequests: true,
      newEmployeeOnboarding: true,
      payrollProcessed: true,
      documentUploads: false,
    },
    systemAlerts: {
      attendanceAlerts: true,
      birthdayReminders: true,
    },
  });

  // ─── FETCH SETTINGS ───
  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/v1/notification");
      if (data.success && data.data) {
        setPreferences((prev) => ({
          emailNotifications: {
            ...prev.emailNotifications,
            ...data.data.emailNotifications,
          },
          systemAlerts: { ...prev.systemAlerts, ...data.data.systemAlerts },
        }));
      }
    } catch (error) {
      console.error("Failed to fetch notification preferences", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // ─── HANDLE TOGGLE ───
  const handleToggle = (category, key) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
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
      const { data } = await axiosInstance.post(
        "/api/v1/notification",
        preferences,
      );
      if (data.success) {
        setMessage({
          type: "success",
          text: "Notification preferences updated successfully!",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update preferences.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ─── REUSABLE ROW USING YOUR TOGGLE ───
  const SettingRow = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-5 border-b border-card-border/50 last:border-0">
      <div className="pr-6">
        <h4 className="text-[15px] font-semibold text-text-primary">{label}</h4>
        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );

  if (loading)
    return (
      <div className="animate-pulse text-text-secondary">
        Loading preferences...
      </div>
    );

  return (
    <div className="animate-in fade-in duration-300 flex flex-col h-full">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-card-border">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
          <BellRing size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-text-primary">Notifications</h3>
          <p className="text-sm text-text-secondary">
            Control what alerts HR and Admins receive.
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
        {/* ─── Responsive Grid Container ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
          {/* SECTION 1: Email Notifications */}
          <div className="bg-input/20 border border-card-border rounded-xl p-5 sm:p-6 shadow-sm h-full">
            <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
              <Mail size={18} className="text-blue-400" /> Email Notifications
            </h3>
            <div className="flex flex-col">
              <SettingRow
                label="Leave Requests"
                description="Get an email when an employee applies for leave."
                checked={preferences.emailNotifications.leaveRequests}
                onChange={() =>
                  handleToggle("emailNotifications", "leaveRequests")
                }
              />
              <SettingRow
                label="New Employee Onboarding"
                description="Alerts when a new user profile is created."
                checked={preferences.emailNotifications.newEmployeeOnboarding}
                onChange={() =>
                  handleToggle("emailNotifications", "newEmployeeOnboarding")
                }
              />
              <SettingRow
                label="Payroll Processed"
                description="Receive summaries when payroll is generated."
                checked={preferences.emailNotifications.payrollProcessed}
                onChange={() =>
                  handleToggle("emailNotifications", "payrollProcessed")
                }
              />
              <SettingRow
                label="Document Uploads"
                description="Alerts when employees upload compliance documents."
                checked={preferences.emailNotifications.documentUploads}
                onChange={() =>
                  handleToggle("emailNotifications", "documentUploads")
                }
              />
            </div>
          </div>

          {/* SECTION 2: System Alerts */}
          <div className="bg-input/20 border border-card-border rounded-xl p-5 sm:p-6 shadow-sm h-full">
            <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
              <MonitorSmartphone size={18} className="text-purple-400" /> System
              Alerts
            </h3>
            <div className="flex flex-col">
              <SettingRow
                label="Attendance Alerts"
                description="In-app alerts for late check-ins or missing punch-outs."
                checked={preferences.systemAlerts.attendanceAlerts}
                onChange={() =>
                  handleToggle("systemAlerts", "attendanceAlerts")
                }
              />
              <SettingRow
                label="Birthday Reminders"
                description="Show reminders for upcoming employee birthdays/anniversaries."
                checked={preferences.systemAlerts.birthdayReminders}
                onChange={() =>
                  handleToggle("systemAlerts", "birthdayReminders")
                }
              />
            </div>
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
                {saving ? "Saving Preferences..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        </div>

        {/* ─── Save Button (PUSHED TO BOTTOM RIGHT) ─── */}
      </form>
    </div>
  );
}
