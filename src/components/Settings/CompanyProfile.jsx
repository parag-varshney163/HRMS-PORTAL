/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Save, Building } from "lucide-react";

const initialForm = {
  name: "",
  email: "",
  phoneNumber: "",
  website: "",
  address: "",
  workingStartTime: "09:00",
  workingEndTime: "18:00",
};

export default function CompanyProfile() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchCompanyData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/v1/company");
      if (data.success && data.data) {
        setForm({
          name: data.data.name || "",
          email: data.data.email || "",
          phoneNumber: data.data.phoneNumber || "",
          website: data.data.website || "",
          address: data.data.address || "",
          workingStartTime: data.data.workingStartTime || "09:00",
          workingEndTime: data.data.workingEndTime || "18:00",
        });
      }
    } catch (error) {
      console.error("Failed to fetch company data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // API uses POST for both create and update according to your screenshot
      const { data } = await axiosInstance.post("/api/v1/company", form);
      if (data.success) {
        setMessage({
          type: "success",
          text: "Company profile updated successfully!",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="animate-pulse text-text-secondary">
        Loading company details...
      </div>
    );

  return (
    <div className="max-w-4xl h-full">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-card-border">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
          <Building size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-text-primary">
            Company Profile
          </h3>
          <p className="text-sm text-text-secondary">
            Update your organization's primary details and working hours.
          </p>
        </div>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Company Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Official Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Phone Number <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              required
              className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Website
            </label>
            <input
              type="url"
              placeholder="https://"
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
              className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            Company Address
          </label>
          <textarea
            rows="3"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-card-border">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Working Start Time
            </label>
            <input
              type="time"
              value={form.workingStartTime}
              onChange={(e) => handleChange("workingStartTime", e.target.value)}
              className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors cursor-text"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              Working End Time
            </label>
            <input
              type="time"
              value={form.workingEndTime}
              onChange={(e) => handleChange("workingEndTime", e.target.value)}
              className="w-full bg-input text-text-primary px-4 py-2.5 rounded-lg border border-card-border text-sm outline-none focus:border-btn transition-colors cursor-text"
            />
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-btn text-white text-sm font-semibold hover:bg-btn-hover transition-colors disabled:opacity-70"
          >
            <Save size={16} /> {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
