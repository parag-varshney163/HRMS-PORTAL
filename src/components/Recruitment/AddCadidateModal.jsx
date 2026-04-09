/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { X } from "lucide-react";

export default function AddCandidateModal({ open, onClose, onAdd }) {
  // State automatically starts fresh every time this component mounts
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "Screening",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg bg-card border border-card-border rounded-xl shadow-2xl p-6 m-4 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">
            Add New Candidate
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-hover rounded-lg text-text-secondary transition-colors bg-transparent border-none cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Full Name
            </label>
            <input
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              type="text"
              className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-btn"
              placeholder="e.g. Alex Thompson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Applying For (Role)
            </label>
            <input
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              type="text"
              className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-btn"
              placeholder="e.g. Senior Developer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email
              </label>
              <input
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-btn"
                placeholder="alex@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Phone
              </label>
              <input
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-btn"
                placeholder="+1 555-000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Initial Stage
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary focus:outline-none focus:border-btn"
            >
              <option value="Screening">Screening</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer Stage</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-btn text-white rounded-lg text-sm font-medium hover:bg-btn/90 border-none cursor-pointer transition-colors"
            >
              Add Candidate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
