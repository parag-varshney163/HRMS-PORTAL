import { UserCheck, Clock, CalendarDays, FileText, CheckCircle, Loader2, Users, } from "lucide-react";
import React, { useEffect, useState } from "react";

import FilterDropDown from "../../components/ui/FilterDropDown";
import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";


const USERS_API = "/api/v1/user/all-users";

const ACTIONS = {
  "Check In": "check_in",
  "Check Out": "check_out",
  "Mark Attendance": "mark_attendance",
};

const ATTENDANCE_TYPES = {
  "Full Day": "full_day",
  "Half Day": "half_day",
};

export default function HRAttendanceAction() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [action, setAction] = useState("Check In");
  const [attendanceType, setAttendanceType] = useState("Full Day");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch active employees
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axiosInstance.get(USERS_API);

      const activeUsers = (data?.data || []).filter(
        (user) => user.status === "active"
      );

      setUsers(activeUsers);
    } catch (err) {
      console.error("Users fetch error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to fetch employees."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Employee dropdown options
  const userOptions = users.map(
    (user) => `${user.name.trim()} (${user.userId})`
  );

  const handleUserSelect = (value) => {
    const user = users.find(
      (item) =>
        `${item.name.trim()} (${item.userId})` === value
    );

    setSelectedUser(user || null);
    setError("");
    setSuccess("");
  };

  // Submit attendance action
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) {
      setError("Please select an employee.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const queryParams = {
        action: ACTIONS[action],
      };

      if (action === "Mark Attendance") {
        queryParams.attendanceType =
          ATTENDANCE_TYPES[attendanceType];

        queryParams.date = date;
      }

      const payload = {
        userId: selectedUser._id,
        notes: notes.trim(),
      };

      const { data } = await axiosInstance.post(
        "/api/v1/attendance/hr-action",
        payload,
        {
          params: queryParams,
        }
      );

      setSuccess(
        data?.message || "Attendance updated successfully."
      );

      setNotes("");
      setSelectedUser(null);
    } catch (err) {
      console.error("Attendance action error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to update attendance."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    background: colors.inputBg,
    border: `1px solid ${colors.cardBorder}`,
    color: colors.textPrimary,
    outline: "none",
    fontSize: "14px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: colors.textPrimary,
    marginBottom: "9px",
  };

  return (
    <div
      className="w-full space-y-5"
      style={{ color: colors.textPrimary }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: colors.accentLight }}
        >
          <UserCheck
            size={23}
            color={colors.accentDark}
          />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            HR Attendance Action
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: colors.textSecondary }}
          >
            Manage employee attendance and check-in/check-out
          </p>
        </div>
      </div>

      {/* Employee Stats */}
      <div
        className="rounded-xl p-4 flex items-center justify-between"
        style={{
          background: colors.secondary,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <div className="flex items-center gap-3">
          <Users color={colors.accentDark} size={21} />
          <div>
            <p className="text-sm font-semibold">
              Active Employees
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: colors.textSecondary }}
            >
              Available for attendance actions
            </p>
          </div>
        </div>

        <span
          className="text-xl font-bold"
          style={{ color: colors.accentDark }}
        >
          {loading ? "..." : users.length}
        </span>
      </div>

      {/* Form Card */}
      <div
        className="rounded-2xl p-5 sm:p-7"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          boxShadow: "0 5px 20px rgba(31,41,55,0.04)",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Employee */}
          <div>
            <label style={labelStyle}>
              Select Employee *
            </label>

            {loading ? (
              <div
                className="flex items-center gap-2 text-sm py-3"
                style={{ color: colors.textSecondary }}
              >
                <Loader2 size={17} className="animate-spin" />
                Loading employees...
              </div>
            ) : (
              <FilterDropDown
                options={userOptions}
                defaultLabel={
                  selectedUser
                    ? `${selectedUser.name.trim()} (${selectedUser.userId})`
                    : "Select Employee"
                }
                onSelect={handleUserSelect}
                disabled={!users.length}
              />
            )}

            {!loading && !users.length && (
              <p
                className="text-xs mt-2"
                style={{ color: colors.textMuted }}
              >
                No active employees found.
              </p>
            )}
          </div>

          {/* Employee Details */}
          {selectedUser && (
            <div
              className="rounded-xl p-4 flex items-center justify-between"
              style={{
                background: colors.greenLight,
                border: `1px solid ${colors.green}50`,
              }}
            >
              <div>
                <p className="text-sm font-semibold">
                  {selectedUser.name.trim()}
                </p>
                <p className="text-xs mt-1">
                  Employee ID: {selectedUser.userId}
                </p>
              </div>

              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: colors.cardBg,
                  color: colors.success,
                }}
              >
                Active
              </span>
            </div>
          )}

          {/* Action */}
          <div>
            <label style={labelStyle}>
              Attendance Action *
            </label>

            <FilterDropDown
              options={[
                "Check In",
                "Check Out",
                "Mark Attendance",
              ]}
              defaultLabel={action}
              onSelect={(value) => {
                setAction(value);
                setError("");
                setSuccess("");
              }}
            />
          </div>

          {/* Attendance Type */}
          {action === "Mark Attendance" && (
            <>
              <div>
                <label style={labelStyle}>
                  Attendance Type *
                </label>

                <FilterDropDown
                  options={["Full Day", "Half Day"]}
                  defaultLabel={attendanceType}
                  onSelect={setAttendanceType}
                />
              </div>

              {/* Date */}
              <div>
                <label style={labelStyle}>
                  <span className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    Attendance Date *
                  </span>
                </label>

                <input
                  type="date"
                  value={date}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDate(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div>
            <label style={labelStyle}>
              <span className="flex items-center gap-2">
                <FileText size={16} />
                Notes
              </span>
            </label>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter attendance remarks..."
              className="resize-none"
              style={inputStyle}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{
                background: colors.dangerLight,
                color: colors.danger,
                border: `1px solid ${colors.danger}40`,
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              className="rounded-lg p-3 text-sm flex items-center gap-2"
              style={{
                background: colors.successLight,
                color: colors.success,
                border: `1px solid ${colors.success}50`,
              }}
            >
              <CheckCircle size={17} />
              {success}
            </div>
          )}

          {/* Submit */}
          <div
            className="pt-4 flex justify-end"
            style={{
              borderTop: `1px solid ${colors.cardBorder}`,
            }}
          >
            <button
              type="submit"
              disabled={
                submitting ||
                loading ||
                !selectedUser ||
                !users.length
              }
              className="px-7 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{
                background: colors.buttonBg,
                color: colors.textPrimary,
                boxShadow: "0 4px 12px rgba(247,200,66,0.2)",
              }}
            >
              {submitting ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Clock size={17} />
                  Submit Attendance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

