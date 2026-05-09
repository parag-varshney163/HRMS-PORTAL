import { X, Mail, Phone, Building2, MapPin, Calendar, Wallet, CreditCard, User, BadgeCheck, } from "lucide-react";
/* eslint-disable no-unused-vars */
import React from "react";


export default function EmployeeDetailsModal({
  open,
  onClose,
  employee,
}) {
  if (!open || !employee) return null;

  const user = employee.user || employee;
  const salary = employee.salaryAndLeave || {};

  // ✅ SAFE VALUES
  const departmentName =
    typeof user.department === "object"
      ? user.department?.name
      : user.department;

  const designationName =
    typeof user.designation === "object"
      ? user.designation?.name
      : user.designation;

  const statusValue =
    typeof user.status === "object"
      ? user.status?.name
      : user.status;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-card-border rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* HEADER */}
        <div className="flex items-start justify-between p-6 border-b border-card-border">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-btn/20 border border-card-border flex items-center justify-center text-btn text-2xl font-bold uppercase">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>

            {/* Name */}
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {user.firstName} {user.lastName}
              </h2>

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-text-secondary text-sm">
                  {user.employeeId || "N/A"}
                </p>

                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-400 border-green-500/20">
                  {statusValue || "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* CLOSE */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PERSONAL INFO */}
          <SectionCard title="Personal Information">
            <InfoRow
              icon={Mail}
              label="Email"
              value={user.email}
            />

            <InfoRow
              icon={Phone}
              label="Phone"
              value={user.phoneNumber}
            />

            <InfoRow
              icon={User}
              label="Gender"
              value={user.gender}
            />

            <InfoRow
              icon={Calendar}
              label="Date of Birth"
              value={
                user.dob
                  ? new Date(user.dob).toLocaleDateString()
                  : "N/A"
              }
            />

            <InfoRow
              icon={MapPin}
              label="Address"
              value={`${user.address || ""}, ${user.city || ""}, ${
                user.state || ""
              }`}
            />
          </SectionCard>

          {/* EMPLOYMENT */}
          <SectionCard title="Employment Details">
            <InfoRow
              icon={Building2}
              label="Department"
              value={departmentName}
            />

            <InfoRow
              icon={BadgeCheck}
              label="Designation"
              value={designationName}
            />

            <InfoRow
              icon={User}
              label="Role"
              value={user.role}
            />

            <InfoRow
              icon={BadgeCheck}
              label="Status"
              value={statusValue}
            />

            <InfoRow
              icon={Calendar}
              label="Joining Date"
              value={
                employee?.employment?.joiningDate
                  ? new Date(
                      employee.employment.joiningDate,
                    ).toLocaleDateString()
                  : "N/A"
              }
            />
          </SectionCard>

          {/* SALARY */}
          <SectionCard
            title="Salary Details"
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SalaryCard
                title="Annual Salary"
                value={salary.annualSalary}
              />

              <SalaryCard
                title="Monthly Salary"
                value={salary.monthlySalary}
              />

              <SalaryCard
                title="Total CTC"
                value={salary.totalCTC}
              />
            </div>
          </SectionCard>

          {/* BANKING */}
          <SectionCard
            title="Banking Details"
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoRow
                icon={CreditCard}
                label="Bank Name"
                value={salary?.bankingDetails?.bankName}
              />

              <InfoRow
                icon={CreditCard}
                label="Branch Name"
                value={salary?.bankingDetails?.branchName}
              />

              <InfoRow
                icon={CreditCard}
                label="Account Number"
                value={salary?.bankingDetails?.accountNumber}
              />

              <InfoRow
                icon={CreditCard}
                label="IFSC Code"
                value={salary?.bankingDetails?.ifscCode}
              />

              <InfoRow
                icon={CreditCard}
                label="PAN Number"
                value={salary?.bankingDetails?.panCardNumber}
              />

              <InfoRow
                icon={User}
                label="Account Holder"
                value={salary?.bankingDetails?.nameInAccount}
              />
            </div>
          </SectionCard>

          {/* LEAVE BALANCE */}
          <SectionCard
            title="Leave Balance"
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <LeaveCard
                title="Earned"
                value={salary?.leaveBalance?.earnedLeave}
              />

              <LeaveCard
                title="Casual"
                value={salary?.leaveBalance?.casualLeave}
              />

              <LeaveCard
                title="Sick"
                value={salary?.leaveBalance?.sickLeave}
              />

              <LeaveCard
                title="Comp Off"
                value={salary?.leaveBalance?.compOff}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

/* SECTION CARD */
function SectionCard({ title, children, className = "" }) {
  return (
    <div
      className={`bg-secondary rounded-2xl p-5 border border-card-border ${className}`}
    >
      <h3 className="text-lg font-semibold mb-5 text-text-primary">
        {title}
      </h3>

      <div className="space-y-4">{children}</div>
    </div>
  );
}

/* INFO ROW */
function InfoRow({ icon: Icon, label, value }) {
  const safeValue =
    typeof value === "object"
      ? JSON.stringify(value)
      : value;

  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-btn/10 flex items-center justify-center text-btn shrink-0">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-text-secondary mb-1">
          {label}
        </p>

        <p className="text-sm font-medium text-text-primary break-words">
          {safeValue || "N/A"}
        </p>
      </div>
    </div>
  );
}

/* SALARY CARD */
function SalaryCard({ title, value }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-4">
      <p className="text-sm text-text-secondary mb-2">
        {title}
      </p>

      <div className="flex items-center gap-2">
        <Wallet size={18} className="text-green-400" />

        <p className="text-xl font-bold text-text-primary">
          ₹{Number(value || 0).toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}

/* LEAVE CARD */
function LeaveCard({ title, value }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-4 text-center">
      <p className="text-sm text-text-secondary mb-2">
        {title}
      </p>

      <p className="text-2xl font-bold text-text-primary">
        {value || 0}
      </p>
    </div>
  );
}