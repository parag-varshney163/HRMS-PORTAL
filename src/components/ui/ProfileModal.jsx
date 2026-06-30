import { X, Mail, Phone, Building2, Briefcase, Calendar, IndianRupee, MapPin, BadgeCheck, } from "lucide-react";
import React from "react";

import colors from "../../constants/colors";


export default function ProfileModal({
  open,
  onClose,
  loading,
  profileData,
}) {
  if (!open) return null;
  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          <div
            className="p-6 flex justify-between items-center"
            style={{ background: colors.gradientDiagonal }}
          >
            <h2 className="text-xl font-bold text-white">
              Employee Profile
            </h2>

            <button onClick={onClose}>
              <X className="text-white" />
            </button>
          </div>

          <div className="p-10">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-10 h-10 border-4 rounded-full animate-spin"
                style={{
                  borderColor: colors.accent,
                  borderTopColor: "transparent",
                }}
              />

              <p className="text-text-secondary">
                Loading profile...
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-24 rounded-xl animate-pulse"
                  style={{
                    background: colors.inputBg,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { user, employment, salaryAndLeave } = profileData;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        {/* Header */}
        {/* <div
          className="p-6 flex justify-between items-center"
          style={{
            background: colors.gradientDiagonal,
          }}
        >
          <div className="flex items-center gap-4">
           
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "#fff",
              }}
            >
              {user?.firstName?.charAt(0)}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h2>

              <p className="text-white/80 text-sm">
                {employment?.designation}
              </p>

              <div className="flex gap-2 mt-2">
               
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    color: "#fff",
                  }}
                >
                  {user?.role}
                </span>

                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: colors.successLight,
                    color: colors.success,
                  }}
                >
                  {user?.status}
                </span>
              </div>
            </div>
          </div>

          <button onClick={onClose}>
            <X className="text-white" />
          </button>
        </div> */}
        <div
          className="p-6 flex justify-between items-center border-b"
          style={{
            background: colors.accentLight,
            borderColor: colors.cardBorder,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{
                background: colors.buttonBg,
                color: colors.textPrimary,
              }}
            >
              {user?.firstName?.charAt(0)}
            </div>

            <div>
              <h2
                className="text-2xl font-bold"
                style={{ color: colors.textPrimary }}
              >
                {user?.firstName} {user?.lastName}
              </h2>

              <p
                className="text-sm mt-1"
                style={{ color: colors.textSecondary }}
              >
                {employment?.designation}
              </p>

              <div className="flex gap-2 mt-3">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: colors.primary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  {user?.role}
                </span>

                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                  style={{
                    background: colors.successLight,
                    color: colors.success,
                  }}
                >
                  {user?.status}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.textSecondary }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = colors.hover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <X size={22} />
          </button>
        </div>


        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Overview */}
          <div className="grid md:grid-cols-3 gap-4">

            <InfoCard
              icon={<BadgeCheck size={18} />}
              label="Employee ID"
              value={user?.employeeId}
            />

            <InfoCard
              icon={<Building2 size={18} />}
              label="Department"
              value={employment?.department?.name}
            />

            <InfoCard
              icon={<Briefcase size={18} />}
              label="Designation"
              value={employment?.designation}
            />
          </div>

          {/* Contact */}
          <SectionTitle title="Contact Information" />

          <div className="grid md:grid-cols-2 gap-4">

            <InfoCard
              icon={<Mail size={18} />}
              label="Email"
              value={user?.email}
            />

            <InfoCard
              icon={<Phone size={18} />}
              label="Phone"
              value={user?.phoneNumber}
            />

            <InfoCard
              icon={<MapPin size={18} />}
              label="Location"
              value={`${user?.city}, ${user?.state}`}
            />

            <InfoCard
              icon={<Calendar size={18} />}
              label="Joining Date"
              value={new Date(
                employment?.joiningDate
              ).toLocaleDateString()}
            />
          </div>

          {/* Salary */}
          <SectionTitle title="Compensation" />

          <div className="grid md:grid-cols-3 gap-4">
            <SalaryCard
              title="Monthly Salary"
              amount={salaryAndLeave?.monthlySalary}
            />

            <SalaryCard
              title="Annual Salary"
              amount={salaryAndLeave?.annualSalary}
            />

            <SalaryCard
              title="Total CTC"
              amount={salaryAndLeave?.totalCTC}
            />
          </div>

          {/* Leave Balance */}
          <SectionTitle title="Leave Balance" />

          <div className="grid md:grid-cols-4 gap-4">

            <LeaveCard
              label="Casual"
              count={
                salaryAndLeave?.leaveBalance.casualLeave
              }
            />

            <LeaveCard
              label="Sick"
              count={
                salaryAndLeave?.leaveBalance.sickLeave
              }
            />

            <LeaveCard
              label="Earned"
              count={
                salaryAndLeave?.leaveBalance.earnedLeave
              }
            />

            <LeaveCard
              label="Comp Off"
              count={
                salaryAndLeave?.leaveBalance.compOff
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const SectionTitle = ({ title }) => (
  <h3
    className="text-lg font-bold"
    style={{ color: colors.textPrimary }}
  >
    {title}
  </h3>
);

const InfoCard = ({ icon, label, value }) => (
  <div
    className="rounded-2xl p-4 transition-all duration-200 hover:shadow-sm"
    style={{
      background: colors.cardBg,
      border: `1px solid ${colors.cardBorder}`,
    }}
  >
    <div
      className="flex items-center gap-2 mb-2"
      style={{ color: colors.accentDark }}
    >
      {icon}
      <span
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </span>
    </div>

    <p
      className="font-semibold text-sm break-words"
      style={{ color: colors.textPrimary }}
    >
      {value || "-"}
    </p>
  </div>
);

const SalaryCard = ({ title, amount }) => (
  <div
    className="rounded-2xl p-5 transition-all duration-200 hover:shadow-sm"
    style={{
      background: colors.greenLight,
      border: `1px solid ${colors.cardBorder}`,
    }}
  >
    <p
      className="text-sm font-medium"
      style={{ color: colors.textSecondary }}
    >
      {title}
    </p>

    <div
      className="flex items-center gap-1 mt-3"
      style={{ color: colors.success }}
    >
      <IndianRupee size={18} />

      <span className="text-xl font-bold">
        {Number(amount || 0).toLocaleString("en-IN")}
      </span>
    </div>
  </div>
);

const LeaveCard = ({ label, count }) => (
  <div
    className="rounded-2xl p-5 text-center transition-all duration-200 hover:shadow-sm"
    style={{
      background: colors.accentLight,
      border: `1px solid ${colors.cardBorder}`,
    }}
  >
    <p
      className="text-sm font-medium"
      style={{ color: colors.textSecondary }}
    >
      {label}
    </p>

    <p
      className="text-3xl font-bold mt-2"
      style={{ color: colors.accentDark }}
    >
      {count ?? 0}
    </p>
  </div>
);
