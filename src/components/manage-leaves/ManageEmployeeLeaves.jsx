import { Search, Users, CalendarDays, Plus, Minus, RotateCcw, CheckCircle2, AlertCircle, LoaderCircle, UserRound, ArrowUpRight, ArrowDownRight, ChevronDown, } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";


const EMPLOYEES_ENDPOINT = "/api/v1/user/all-users";
const UPDATE_LEAVES_ENDPOINT = "/api/v1/salary-leave/update-leaves";

const LEAVE_TYPES = [
  {
    key: "casualLeave",
    label: "Casual Leave",
    short: "CL",
    description: "Personal and casual leave",
    color: colors.blue,
    background: colors.blueLight,
  },
  {
    key: "sickLeave",
    label: "Sick Leave",
    short: "SL",
    description: "Medical and sick leave",
    color: colors.purple,
    background: colors.purpleLight,
  },
  {
    key: "earnedLeave",
    label: "Earned Leave",
    short: "EL",
    description: "Accumulated earned leave",
    color: colors.green,
    background: colors.greenLight,
  },
  {
    key: "compOff",
    label: "Comp Off",
    short: "CO",
    description: "Compensatory leave",
    color: colors.orange,
    background: colors.orangeLight,
  },
];

const EMPTY_ADJUSTMENTS = {
  casualLeave: 0,
  sickLeave: 0,
  earnedLeave: 0,
  compOff: 0,
};

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

export default function ManageEmployeeLeaves() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [search, setSearch] = useState("");
  const [showEmployees, setShowEmployees] = useState(false);

  const [adjustments, setAdjustments] = useState({
    ...EMPTY_ADJUSTMENTS,
  });

  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    setError("");

    try {
      const response = await axiosInstance.get(EMPLOYEES_ENDPOINT);

      const payload = response?.data?.data;
      const list = Array.isArray(payload)
        ? payload
        : payload?.items || [];

      const normalized = list
        .filter((employee) => employee?._id || employee?.userId)
        .map((employee) => ({
          ...employee,
          _id: employee._id || employee.userId,
          name: employee.name || "Unnamed Employee",
          userId: employee.userId || employee._id,
        }));

      setEmployees(normalized);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to load employees. Please try again."
      );
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) => employee._id === selectedEmployeeId
      ),
    [employees, selectedEmployeeId]
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter(
      (employee) =>
        employee.name?.toLowerCase().includes(query) ||
        employee.userId?.toLowerCase().includes(query)
    );
  }, [employees, search]);

  const activeAdjustments = useMemo(
    () =>
      LEAVE_TYPES.filter(
        (leave) => Number(adjustments[leave.key]) !== 0
      ),
    [adjustments]
  );

  const totalAdded = activeAdjustments.reduce(
    (total, leave) =>
      total + Math.max(0, Number(adjustments[leave.key]) || 0),
    0
  );

  const totalReduced = activeAdjustments.reduce(
    (total, leave) =>
      total + Math.abs(
        Math.min(0, Number(adjustments[leave.key]) || 0)
      ),
    0
  );

  const totalNet = totalAdded - totalReduced;

  const handleAdjustment = (key, value) => {
    setAdjustments((previous) => ({
      ...previous,
      [key]: value === "" ? "" : Number(value),
    }));
  };

  const changeAdjustment = (key, amount) => {
    setAdjustments((previous) => ({
      ...previous,
      [key]: (Number(previous[key]) || 0) + amount,
    }));
  };

  const resetForm = () => {
    setAdjustments({ ...EMPTY_ADJUSTMENTS });
    setSearch("");
    setShowConfirmation(false);
    setLastUpdated(null);
  };

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee.");
      return;
    }

    if (activeAdjustments.length === 0) {
      toast.error("Enter at least one leave adjustment.");
      return;
    }

    // The API accepts positive values to add and negative values
    // to reduce leave balances.
    const payload = Object.fromEntries(
      LEAVE_TYPES.map(({ key }) => [
        key,
        Number(adjustments[key]) || 0,
      ])
    );

    setSubmitting(true);

    try {
      // Uses the employee MongoDB _id in the URL.
      // If your backend expects CS_001 instead, use selectedEmployee.userId.
      await axiosInstance.patch(
        `${UPDATE_LEAVES_ENDPOINT}/${selectedEmployee._id}`,
        payload
      );

      toast.success(
        `Leave balances updated for ${selectedEmployee.name}.`
      );

      setLastUpdated({
        name: selectedEmployee.name,
        employeeId: selectedEmployee.userId,
        added: totalAdded,
        reduced: totalReduced,
      });

      setAdjustments({ ...EMPTY_ADJUSTMENTS });
      setShowConfirmation(false);
    } catch (err) {
      console.error("Failed to update leave balances:", err);

      toast.error(
        err?.response?.data?.message ||
          "Failed to update leave balances. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    padding: "11px 12px",
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: 10,
    background: colors.inputBg,
    color: colors.textPrimary,
    fontSize: 14,
    outline: "none",
  };

  const smallButtonStyle = {
    width: 34,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: 9,
    background: colors.cardBg,
    color: colors.textPrimary,
    cursor: "pointer",
    flexShrink: 0,
  };

  return (
    <div
      style={{
        minHeight: "100%",
        padding: "24px",
        background: colors.pageGradient,
        color: colors.textPrimary,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <style>{`
        .leave-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.85fr);
          gap: 22px;
          align-items: start;
        }
        .leave-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .leave-card {
          transition: border-color .2s ease, box-shadow .2s ease;
        }
        .leave-card:focus-within {
          border-color: ${colors.accentDark} !important;
          box-shadow: 0 0 0 3px ${colors.accentLight};
        }
        .leave-action {
          transition: transform .15s ease, opacity .15s ease;
        }
        .leave-action:hover {
          opacity: .85;
        }
        .leave-action:active {
          transform: scale(.98);
        }
        @media (max-width: 900px) {
          .leave-layout {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 560px) {
          .leave-page {
            padding: 14px !important;
          }
          .leave-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .leave-header {
            align-items: flex-start !important;
          }
        }
      `}</style>

      {/* Page header */}
      <div
        className="leave-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 7,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                background: colors.accentLight,
                color: colors.textPrimary,
              }}
            >
              <CalendarDays size={22} />
            </div>
            <h1
              style={{
                fontSize: 25,
                fontWeight: 750,
                margin: 0,
                letterSpacing: "-0.6px",
              }}
            >
              Manage Employee Leaves
            </h1>
          </div>
          <p
            style={{
              margin: "0 0 0 52px",
              color: colors.textSecondary,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Add or reduce employee leave balances with a clear adjustment
            summary.
          </p>
        </div>

        <button
          type="button"
          onClick={resetForm}
          className="leave-action"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 15px",
            background: colors.cardBg,
            color: colors.textPrimary,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <RotateCcw size={16} />
          Reset form
        </button>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Employees available",
            value: loadingEmployees ? "..." : employees.length,
            icon: Users,
            bg: colors.blueCard,
            iconColor: colors.blue,
          },
          {
            label: "Leave types",
            value: "04",
            icon: CalendarDays,
            bg: colors.purpleCard,
            iconColor: colors.purple,
          },
          {
            label: "Days to add",
            value: formatNumber(totalAdded),
            icon: ArrowUpRight,
            bg: colors.greenCard,
            iconColor: colors.success,
          },
          {
            label: "Days to reduce",
            value: formatNumber(totalReduced),
            icon: ArrowDownRight,
            bg: colors.orangeCard,
            iconColor: colors.orange,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              style={{
                padding: 17,
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 15,
                boxShadow: "0 3px 12px rgba(31,41,55,.035)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 15,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    display: "grid",
                    placeItems: "center",
                    background: item.bg,
                    color: item.iconColor,
                  }}
                >
                  <Icon size={18} />
                </span>
              </div>
              <div style={{ fontSize: 25, fontWeight: 750 }}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div
          style={{
            padding: 14,
            marginBottom: 20,
            borderRadius: 12,
            background: colors.dangerLight,
            color: colors.danger,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
          }}
        >
          <AlertCircle size={19} />
          <span style={{ flex: 1 }}>{error}</span>
          <button
            type="button"
            onClick={fetchEmployees}
            style={{
              border: 0,
              background: "transparent",
              color: colors.danger,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {lastUpdated && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 15,
            marginBottom: 20,
            border: `1px solid ${colors.success}`,
            borderRadius: 12,
            background: colors.successLight,
            color: colors.textPrimary,
            fontSize: 14,
          }}
        >
          <CheckCircle2 color={colors.success} size={20} />
          <div>
            <strong>Leave balances updated successfully</strong>
            <div style={{ color: colors.textSecondary, marginTop: 4 }}>
              {lastUpdated.name} ({lastUpdated.employeeId}) ·{" "}
              {lastUpdated.added} days added · {lastUpdated.reduced} days
              reduced
            </div>
          </div>
        </div>
      )}

      <div className="leave-layout">
        {/* Main form */}
        <section
          style={{
            minWidth: 0,
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 16,
            overflow: "visible",
            boxShadow: "0 5px 18px rgba(31,41,55,.04)",
          }}
        >
          <div
            style={{
              padding: "19px 21px",
              borderBottom: `1px solid ${colors.cardBorder}`,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 750 }}>
              Leave adjustment
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: colors.textSecondary,
              }}
            >
              Select an employee and enter the number of days to adjust.
            </p>
          </div>

          <div style={{ padding: 21 }}>
            {/* Employee selector */}
            <label
              htmlFor="employee-search"
              style={{
                display: "block",
                marginBottom: 9,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Select employee <span style={{ color: colors.danger }}>*</span>
            </label>

            <div style={{ position: "relative", marginBottom: 22 }}>
              <div style={{ position: "relative" }}>
                <Search
                  size={18}
                  color={colors.textMuted}
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  id="employee-search"
                  type="text"
                  value={
                    showEmployees
                      ? search
                      : selectedEmployee
                        ? `${selectedEmployee.name} (${selectedEmployee.userId})`
                        : search
                  }
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setShowEmployees(true);
                  }}
                  onFocus={() => setShowEmployees(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setShowEmployees(false);
                    }

                    if (event.key === "Enter" && filteredEmployees[0]) {
                      setSelectedEmployeeId(filteredEmployees[0]._id);
                      setSearch("");
                      setShowEmployees(false);
                    }
                  }}
                  placeholder={
                    loadingEmployees
                      ? "Loading employees..."
                      : "Search by name or employee ID"
                  }
                  autoComplete="off"
                  disabled={loadingEmployees}
                  style={{
                    ...inputStyle,
                    paddingLeft: 40,
                    paddingRight: 36,
                    background: colors.cardBg,
                  }}
                />
                {loadingEmployees ? (
                  <LoaderCircle
                    size={17}
                    color={colors.textMuted}
                    style={{
                      position: "absolute",
                      right: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                ) : (
                  <ChevronDown
                    size={17}
                    color={colors.textMuted}
                    style={{
                      position: "absolute",
                      right: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>

              {showEmployees && !loadingEmployees && (
                <>
                  <button
                    type="button"
                    aria-label="Close employee list"
                    onClick={() => setShowEmployees(false)}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 8,
                      border: 0,
                      padding: 0,
                      background: "transparent",
                      cursor: "default",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 5px)",
                      left: 0,
                      right: 0,
                      zIndex: 9,
                      background: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: 11,
                      boxShadow: "0 12px 28px rgba(31,41,55,.12)",
                      maxHeight: 260,
                      overflowY: "auto",
                    }}
                  >
                    {filteredEmployees.length === 0 ? (
                      <div
                        style={{
                          padding: 18,
                          textAlign: "center",
                          color: colors.textMuted,
                          fontSize: 13,
                        }}
                      >
                        No employees found.
                      </div>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <button
                          type="button"
                          key={employee._id}
                          onClick={() => {
                            setSelectedEmployeeId(employee._id);
                            setSearch("");
                            setShowEmployees(false);
                          }}
                          style={{
                            display: "flex",
                            width: "100%",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 14px",
                            border: 0,
                            borderBottom: `1px solid ${colors.cardBorder}`,
                            background:
                              employee._id === selectedEmployeeId
                                ? colors.accentLight
                                : colors.cardBg,
                            textAlign: "left",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              width: 37,
                              height: 37,
                              borderRadius: 11,
                              background: colors.secondary,
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              color: colors.textPrimary,
                            }}
                          >
                            <UserRound size={18} />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: colors.textPrimary,
                              }}
                            >
                              {employee.name}
                            </div>
                            <div
                              style={{
                                marginTop: 4,
                                fontSize: 12,
                                color: colors.textSecondary,
                              }}
                            >
                              {employee.userId}
                            </div>
                          </div>
                          {employee._id === selectedEmployeeId && (
                            <CheckCircle2
                              size={17}
                              color={colors.success}
                            />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {selectedEmployee && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 13,
                  marginBottom: 24,
                  borderRadius: 12,
                  background: colors.secondary,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    display: "grid",
                    placeItems: "center",
                    background: colors.accentLight,
                    borderRadius: 12,
                  }}
                >
                  <UserRound size={21} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 750 }}>
                    {selectedEmployee.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    Employee ID: {selectedEmployee.userId}
                  </div>
                </div>
                <CheckCircle2 size={19} color={colors.success} />
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 13,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 750 }}>
                Adjust leave types
              </h3>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 650,
                  color: colors.textSecondary,
                }}
              >
                Days (+ / −)
              </span>
            </div>

            <div className="leave-grid">
              {LEAVE_TYPES.map((leave) => {
                const value = Number(adjustments[leave.key]) || 0;
                const isAdding = value > 0;
                const isReducing = value < 0;

                return (
                  <div
                    key={leave.key}
                    className="leave-card"
                    style={{
                      padding: 15,
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: 13,
                      background: colors.cardBg,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 39,
                          height: 39,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 11,
                          background: leave.background,
                          color: leave.color,
                          fontSize: 12,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {leave.short}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 750,
                            color: colors.textPrimary,
                          }}
                        >
                          {leave.label}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: colors.textMuted,
                            marginTop: 3,
                          }}
                        >
                          {leave.description}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <button
                        type="button"
                        aria-label={`Reduce ${leave.label} by one day`}
                        title="Reduce by one day"
                        onClick={() => changeAdjustment(leave.key, -1)}
                        style={{
                          ...smallButtonStyle,
                          color: colors.danger,
                          borderColor: colors.dangerLight,
                        }}
                      >
                        <Minus size={16} />
                      </button>

                      <input
                        type="number"
                        step="1"
                        value={adjustments[leave.key]}
                        aria-label={`${leave.label} adjustment in days`}
                        onChange={(event) =>
                          handleAdjustment(leave.key, event.target.value)
                        }
                        style={{
                          ...inputStyle,
                          textAlign: "center",
                          padding: "9px 3px",
                          fontWeight: 750,
                          fontSize: 16,
                          borderColor: isAdding
                            ? colors.success
                            : isReducing
                              ? colors.danger
                              : colors.cardBorder,
                        }}
                      />

                      <button
                        type="button"
                        aria-label={`Add one day of ${leave.label}`}
                        title="Add one day"
                        onClick={() => changeAdjustment(leave.key, 1)}
                        style={{
                          ...smallButtonStyle,
                          color: colors.success,
                          borderColor: colors.successLight,
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div
                      style={{
                        minHeight: 18,
                        marginTop: 9,
                        fontSize: 11,
                        fontWeight: 700,
                        color: isAdding
                          ? colors.success
                          : isReducing
                            ? colors.danger
                            : colors.textMuted,
                      }}
                    >
                      {isAdding
                        ? `+${formatNumber(value)} day(s) will be added`
                        : isReducing
                          ? `${formatNumber(value)} day(s) will be reduced`
                          : "No adjustment"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: 13,
                marginTop: 18,
                borderRadius: 11,
                background: colors.warningLight,
                color: colors.textPrimary,
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              <AlertCircle
                size={18}
                color={colors.warning}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <span>
                <strong>Important:</strong> Use positive values to add leave
                and negative values to reduce leave. Zero means no change.
                Verify the employee and values before submitting.
              </span>
            </div>

            <button
              type="button"
              className="leave-action"
              disabled={
                !selectedEmployee ||
                activeAdjustments.length === 0 ||
                submitting
              }
              onClick={() => setShowConfirmation(true)}
              style={{
                width: "100%",
                marginTop: 20,
                minHeight: 46,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                border: 0,
                borderRadius: 11,
                background:
                  !selectedEmployee ||
                  activeAdjustments.length === 0 ||
                  submitting
                    ? colors.cardBorder
                    : colors.buttonBg,
                color: colors.textPrimary,
                fontSize: 14,
                fontWeight: 800,
                cursor:
                  !selectedEmployee ||
                  activeAdjustments.length === 0 ||
                  submitting
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <CheckCircle2 size={18} />
              Review and update leaves
            </button>
          </div>
        </section>

        {/* Summary panel */}
        <aside
          style={{
            minWidth: 0,
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 5px 18px rgba(31,41,55,.04)",
          }}
        >
          <div
            style={{
              padding: "19px 20px",
              background: colors.secondary,
              borderBottom: `1px solid ${colors.cardBorder}`,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 750 }}>
              Adjustment summary
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                color: colors.textSecondary,
              }}
            >
              Review the changes before applying them.
            </p>
          </div>

          <div style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                marginBottom: 21,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  background: colors.accentLight,
                }}
              >
                <UserRound size={21} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: colors.textMuted,
                    marginBottom: 4,
                  }}
                >
                  Selected employee
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 750,
                    overflowWrap: "anywhere",
                  }}
                >
                  {selectedEmployee?.name || "No employee selected"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 3,
                  }}
                >
                  {selectedEmployee?.userId || "Select an employee to begin"}
                </div>
              </div>
            </div>

            <div
              style={{
                height: 1,
                background: colors.cardBorder,
                marginBottom: 17,
              }}
            />

            <div style={{ display: "grid", gap: 15 }}>
              {LEAVE_TYPES.map((leave) => {
                const value = Number(adjustments[leave.key]) || 0;

                return (
                  <div
                    key={leave.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 9,
                          background: leave.background,
                          color: leave.color,
                          fontSize: 10,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {leave.short}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        {leave.label}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        color:
                          value > 0
                            ? colors.success
                            : value < 0
                              ? colors.danger
                              : colors.textMuted,
                      }}
                    >
                      {value > 0 ? "+" : ""}
                      {formatNumber(value)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 22,
                padding: 15,
                borderRadius: 12,
                border: `1px solid ${colors.cardBorder}`,
                background: colors.inputBg,
              }}
            >
              <div
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginBottom: 8,
                }}
              >
                Net leave adjustment
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 7,
                }}
              >
                <span
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    letterSpacing: "-1px",
                    color:
                      totalNet > 0
                        ? colors.success
                        : totalNet < 0
                          ? colors.danger
                          : colors.textPrimary,
                  }}
                >
                  {totalNet > 0 ? "+" : ""}
                  {formatNumber(totalNet)}
                </span>
                <span style={{ fontSize: 12, color: colors.textSecondary }}>
                  days
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: colors.textMuted,
                  marginTop: 8,
                  lineHeight: 1.6,
                }}
              >
                Net adjustment is calculated from your entered values. It is
                not the employee's final leave balance.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                marginTop: 17,
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 11,
                  background: colors.successLight,
                }}
              >
                <ArrowUpRight size={17} color={colors.success} />
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 800,
                    color: colors.success,
                    marginTop: 5,
                  }}
                >
                  {formatNumber(totalAdded)}
                </div>
                <div style={{ fontSize: 11, color: colors.textSecondary }}>
                  Days added
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 11,
                  background: colors.dangerLight,
                }}
              >
                <ArrowDownRight size={17} color={colors.danger} />
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 800,
                    color: colors.danger,
                    marginTop: 5,
                  }}
                >
                  {formatNumber(totalReduced)}
                </div>
                <div style={{ fontSize: 11, color: colors.textSecondary }}>
                  Days reduced
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                marginTop: 19,
                fontSize: 12,
                color: colors.textSecondary,
                lineHeight: 1.5,
              }}
            >
              <CheckCircle2
                size={17}
                color={colors.success}
                style={{ flexShrink: 0 }}
              />
              Changes are submitted only after you confirm them.
            </div>
          </div>
        </aside>
      </div>

      {/* Confirmation dialog */}
      {showConfirmation && (
        <div
          role="presentation"
          onClick={() => !submitting && setShowConfirmation(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: 16,
            background: "rgba(15, 23, 42, 0.55)",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-confirm-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 450,
              maxHeight: "85vh",
              overflowY: "auto",
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 17,
              padding: 23,
              boxShadow: "0 24px 70px rgba(0,0,0,.2)",
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                display: "grid",
                placeItems: "center",
                borderRadius: 13,
                background: colors.accentLight,
                marginBottom: 16,
              }}
            >
              <CalendarDays size={23} />
            </div>

            <h2
              id="leave-confirm-title"
              style={{ fontSize: 19, margin: "0 0 8px", fontWeight: 800 }}
            >
              Confirm leave adjustment
            </h2>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: colors.textSecondary,
                margin: "0 0 18px",
              }}
            >
              You are about to change leave balances for{" "}
              <strong style={{ color: colors.textPrimary }}>
                {selectedEmployee?.name}
              </strong>
              . Please review each adjustment.
            </p>

            <div
              style={{
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 12,
                padding: "4px 14px",
                marginBottom: 17,
              }}
            >
              {activeAdjustments.map((leave) => {
                const value = Number(adjustments[leave.key]) || 0;

                return (
                  <div
                    key={leave.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 0",
                      borderBottom: `1px solid ${colors.cardBorder}`,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {leave.label}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color:
                          value > 0 ? colors.success : colors.danger,
                      }}
                    >
                      {value > 0 ? "+" : ""}
                      {formatNumber(value)} days
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 13,
                marginBottom: 20,
                borderRadius: 10,
                background: colors.secondary,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                Net adjustment
              </span>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color:
                    totalNet > 0
                      ? colors.success
                      : totalNet < 0
                        ? colors.danger
                        : colors.textPrimary,
                }}
              >
                {totalNet > 0 ? "+" : ""}
                {formatNumber(totalNet)} days
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowConfirmation(false)}
                style={{
                  padding: "11px 16px",
                  borderRadius: 10,
                  border: `1px solid ${colors.cardBorder}`,
                  background: colors.cardBg,
                  color: colors.textPrimary,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                Go back
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                style={{
                  minWidth: 145,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "11px 16px",
                  borderRadius: 10,
                  border: 0,
                  background: colors.buttonBg,
                  color: colors.textPrimary,
                  fontWeight: 800,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      size={17}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Confirm update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

