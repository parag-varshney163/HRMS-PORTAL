import { Mail, Phone, Building2, MoreHorizontal, Calendar, Eye, } from "lucide-react";
import React, { useState } from "react";

import colors from "../../constants/colors";


const statusStyles = {
  Active: {
    bg: colors.successLight,
    text: colors.success,
    border: colors.success,
  },
  "On Leave": {
    bg: colors.warningLight,
    text: colors.warning,
    border: colors.warning,
  },
  Inactive: {
    bg: colors.dangerLight,
    text: colors.danger,
    border: colors.danger,
  },
  Screening: {
    bg: colors.blueLight,
    text: colors.blue,
    border: colors.blue,
  },
  Interview: {
    bg: colors.warningLight,
    text: colors.warning,
    border: colors.warning,
  },
  Offer: {
    bg: colors.successLight,
    text: colors.success,
    border: colors.success,
  },
  Rejected: {
    bg: colors.dangerLight,
    text: colors.danger,
    border: colors.danger,
  },
};

const roleStyles = {
  admin: {
    bg: colors.dangerLight,
    text: colors.danger,
    border: colors.danger,
  },
  hr: {
    bg: colors.purpleLight,
    text: colors.purple,
    border: colors.purple,
  },
  manager: {
    bg: colors.blueLight,
    text: colors.blue,
    border: colors.blue,
  },
  employee: {
    bg: colors.successLight,
    text: colors.success,
    border: colors.success,
  },
};

const getBadgeStyle = (style) => ({
  backgroundColor: style?.bg || colors.inputBg,
  color: style?.text || colors.textMuted,
  border: `1px solid ${style?.border || colors.cardBorder}`,
});

export default function ProfileCard({
  data,
  variant = "employee",
  onEdit,
  onDelete,
  onView,
  onDeactivate,
  hideActions = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const roleBadgeStyle =
    roleStyles[data.systemRole?.toLowerCase()] || {
      bg: colors.inputBg,
      text: colors.textMuted,
      border: colors.cardBorder,
    };

  const badgeStyle =
    statusStyles[data.status] || {
      bg: colors.inputBg,
      text: colors.textMuted,
      border: colors.cardBorder,
    };

  const initials = data.name
    ?.split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="rounded-xl p-5 transition-all group relative h-full flex flex-col justify-between"
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = colors.cardHover;
        event.currentTarget.style.borderColor = colors.accent;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = colors.cardBg;
        event.currentTarget.style.borderColor = colors.cardBorder;
      }}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {data.avatar ? (
              <img
                src={data.avatar}
                alt={data.name}
                className="w-11 h-11 rounded-full object-cover shrink-0"
                style={{ border: `2px solid ${colors.cardBorder}` }}
              />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                style={{
                  background: colors.accentLight,
                  border: `2px solid ${colors.cardBorder}`,
                  color: colors.accentDark,
                }}
              >
                {initials}
              </div>
            )}

            <div className="min-w-0">
              <h3
                className="text-sm font-semibold line-clamp-1"
                style={{ color: colors.textPrimary }}
              >
                {data.name}
              </h3>

              <p
                className="text-xs line-clamp-1"
                style={{ color: colors.textSecondary }}
              >
                {data.role || data.designation}
              </p>
            </div>
          </div>

          {variant === "candidate" ? (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap"
              style={getBadgeStyle(badgeStyle)}
            >
              {data.status}
            </span>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide border"
                style={getBadgeStyle(roleBadgeStyle)}
              >
                {data.systemRole || "Employee"}
              </span>

             {!hideActions && ( <div className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="p-1 rounded-lg transition-colors bg-transparent border-none cursor-pointer"
                  style={{ color: colors.textSecondary }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = colors.hover;
                    event.currentTarget.style.color = colors.textPrimary;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "transparent";
                    event.currentTarget.style.color = colors.textSecondary;
                  }}
                >
                  <MoreHorizontal size={18} />
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-8 rounded-lg shadow-xl py-1 z-20 min-w-[130px]"
                    style={{
                      background: colors.secondary,
                      border: `1px solid ${colors.cardBorder}`,
                    }}
                  >
                    <button
                      onClick={() => {
                        onEdit?.(data);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors bg-transparent border-none cursor-pointer"
                      style={{ color: colors.textSecondary }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = colors.hover;
                        event.currentTarget.style.color = colors.textPrimary;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                        event.currentTarget.style.color = colors.textSecondary;
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        onDelete?.(data);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors bg-transparent border-none cursor-pointer"
                      style={{ color: colors.danger }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = colors.dangerLight;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                      }}
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => {
                        onDeactivate?.(data);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm transition-colors bg-transparent border-none cursor-pointer"
                      style={{ color: colors.warning }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background = colors.warningLight;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background = "transparent";
                      }}
                    >
                      Deactivate
                    </button>
                  </div>
                )}
              </div>
             )}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center justify-between gap-2">
            <div
              className="flex items-center gap-2 min-w-0"
              style={{ color: colors.textSecondary }}
            >
              <Mail size={14} className="shrink-0" />
              <span className="text-xs truncate font-bold ">{data.email}</span>
            </div>

            {variant === "employee" && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: colors.successLight,
                  color: colors.success,
                }}
              >
                {data.utilisationRate || "0%"}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div
              className="flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <Phone size={14} className="shrink-0" />
              <span className="text-xs">{data.phone}</span>
            </div>

            {variant === "employee" && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: colors.blueLight,
                  color: colors.blue,
                }}
              >
                CL: {data.leaveBalance?.casualLeave ?? 0}
              </span>
            )}
          </div>

          {variant === "employee" && data.department && (
            <div
              className="flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <Building2 size={14} className="shrink-0" />
              <span className="text-xs">{data.department}</span>
            </div>
          )}

          {variant === "candidate" && data.appliedDate && (
            <div
              className="flex items-center gap-2"
              style={{ color: colors.textSecondary }}
            >
              <Calendar size={14} className="shrink-0" />
              <span className="text-xs">Applied: {data.appliedDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {variant === "employee" && (
        <div
          className="flex items-center justify-between pt-3 mt-auto"
          style={{ borderTop: `1px solid ${colors.cardBorder}` }}
        >
          <span
            className="text-xs font-mono"
            style={{ color: colors.textSecondary }}
          >
            {data.empId}
          </span>

          <div className="flex items-center gap-2">
            {!hideActions && (<button
              onClick={() => onView?.(data)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors border-none cursor-pointer"
              style={{
                background: colors.accentLight,
                color: colors.accentDark,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = colors.accent;
                event.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = colors.accentLight;
                event.currentTarget.style.color = colors.accentDark;
              }}
            >
              <Eye size={16} />
            </button>
            )}

            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full border"
              style={getBadgeStyle(badgeStyle)}
            >
              {data.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}