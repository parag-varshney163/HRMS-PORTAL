import { Mail, Phone, Building2, MoreHorizontal, Calendar, Eye } from "lucide-react";
/* eslint-disable no-unused-vars */
import React, { useState } from "react";


const statusStyles = {
  // Common statuses
  Active: "bg-green-500/20 text-green-400 border-green-500/30",
  "On Leave": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Inactive: "bg-red-500/20 text-red-400 border-red-500/30",
  // Recruitment statuses
  Screening: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Interview: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Offer: "bg-green-500/20 text-green-400 border-green-500/30",
  Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function ProfileCard({
  data,
  variant = "employee",
  onEdit,
  onDelete,
  onView,
  onDeactivate
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Use status style or default to gray/active if missing
  const badgeStyle =
    statusStyles[data.status] ||
    "bg-gray-500/20 text-gray-400 border-gray-500/30";

  // Initials generator
  const initials = data.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 hover:border-btn/40 transition-all group relative h-full flex flex-col justify-between">
      <div>
        {/* ─── Header: Avatar, Info, & (Menu OR Status Badge) ─── */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar Logic */}
            {data.avatar ? (
              <img
                src={data.avatar}
                alt={data.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-card-border"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-btn/20 border-2 border-card-border flex items-center justify-center text-sm font-semibold text-btn shrink-0">
                {initials}
              </div>
            )}

            {/* Name & Role */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary line-clamp-1">
                {data.name}
              </h3>
              <p className="text-xs text-text-secondary line-clamp-1">
                {data.role || data.designation}
              </p>
            </div>
          </div>

          {/* Right Side Action: Candidate = Badge, Employee = Menu */}
          {variant === "candidate" ? (
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badgeStyle}`}
            >
              {data.status}
            </span>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-hover transition-colors bg-transparent border-none cursor-pointer"
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 bg-secondary border border-card-border rounded-lg shadow-xl py-1 z-20 min-w-[120px]">
                  <button
                    onClick={() => {
                      onEdit?.(data);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-hover hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(data);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-hover transition-colors bg-transparent border-none cursor-pointer"
                  >
                    Delete
                  </button>
                      <button
      onClick={() => {
        onDeactivate?.(data);
        setMenuOpen(false);
      }}
      className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-hover transition-colors bg-transparent border-none cursor-pointer"
    >
      Deactivate
    </button>

                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Body: Info List ─── */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Mail size={14} className="shrink-0" />
            <span className="text-xs truncate">{data.email}</span>
          </div>

          <div className="flex items-center gap-2 text-text-secondary">
            <Phone size={14} className="shrink-0" />
            <span className="text-xs">{data.phone}</span>
          </div>

          {/* Employee Specific: Department */}
          {variant === "employee" && data.department && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Building2 size={14} className="shrink-0" />
              <span className="text-xs">{data.department}</span>
            </div>
          )}

          {/* Candidate Specific: Applied Date */}
          {variant === "candidate" && data.appliedDate && (
            <div className="flex items-center gap-2 text-text-secondary">
              <Calendar size={14} className="shrink-0" />
              <span className="text-xs">Applied: {data.appliedDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Footer: Only for Employee View ─── */}
      {variant === "employee" && (
        // <div className="flex items-center justify-between pt-3 border-t border-card-border mt-auto">
        //   <span className="text-xs text-text-secondary font-mono">
        //     {data.empId}
        //   </span>
        //   <span
        //     className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${badgeStyle}`}
        //   >
        //     {data.status}
        //   </span>
        // </div>
        <div className="flex items-center justify-between pt-3 border-t border-card-border mt-auto">
  <span className="text-xs text-text-secondary font-mono">
    {data.empId}
  </span>

  <div className="flex items-center gap-2">
    <button
      onClick={() => onView?.(data)}
      className="w-8 h-8 rounded-lg bg-btn/10 hover:bg-btn/20 text-btn flex items-center justify-center transition"
    >
      <Eye size={16} />
    </button>

    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${badgeStyle}`}
    >
      {data.status}
    </span>
  </div>
</div>
      )}
    </div>
  );
}
