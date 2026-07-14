import AttendanceStats from "./AttendanceStats";
import colors from "../../constants/colors";


const EmployeeProfile = ({ employee, attendance = [], loading }) => {
  if (loading) {
    return (
      <div
        className="rounded-2xl p-6 animate-pulse"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <div
          className="w-28 h-28 rounded-full mx-auto"
          style={{ background: colors.cardBorder }}
        />

        <div
          className="h-5 rounded mt-6"
          style={{ background: colors.cardBorder }}
        />

        <div
          className="h-4 rounded mt-3 w-2/3 mx-auto"
          style={{ background: colors.cardBorder }}
        />

        <div className="grid grid-cols-2 gap-3 mt-8">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 rounded-xl"
              style={{ background: colors.cardBorder }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!employee) return null;

  const present = attendance.filter(
    (item) => item.status === "present"
  ).length;

  const absent = attendance.filter(
    (item) => item.status === "absent"
  ).length;

  const leave = attendance.filter(
    (item) => item.status === "leave"
  ).length;

  const halfDay = attendance.filter(
    (item) => item.status === "half_day"
  ).length;

  const totalDays = attendance.length;

  const workingDays = present + halfDay;

  return (
    <div
      className="rounded-2xl p-6 h-full overflow-y-auto"
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      {/* Avatar */}

      <div className="flex flex-col items-center">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-white text-5xl font-bold"
          style={{
            background: colors.blue,
          }}
        >
          {employee.name?.charAt(0)}
        </div>

        <h2
          className="text-xl font-bold mt-5 text-center"
          style={{
            color: colors.textPrimary,
          }}
        >
          {employee.name}
        </h2>

        <p
          className="text-sm mt-1"
          style={{
            color: colors.textSecondary,
          }}
        >
          {employee.designation}
        </p>

        <p
          className="text-sm"
          style={{
            color: colors.textMuted,
          }}
        >
          {employee.employeeId}
        </p>

        <p
          className="text-sm mt-2"
          style={{
            color: colors.textMuted,
          }}
        >
          {employee.phoneNumber}
        </p>
      </div>

      {/* Divider */}

      <div
        className="my-6 border-t"
        style={{
          borderColor: colors.cardBorder,
        }}
      />

      {/* Attendance Stats */}

      <AttendanceStats
        present={present}
        absent={absent}
        leave={leave}
        halfDay={halfDay}
      />

      {/* Summary */}

      <div className="mt-8 space-y-4">

        <SummaryRow
          title="Working Days"
          value={workingDays}
        />

        <SummaryRow
          title="Total Records"
          value={totalDays}
        />

        <SummaryRow
          title="Department"
          value={employee.department}
        />

        <SummaryRow
          title="Work Location"
          value={employee.workLocation}
        />

        <SummaryRow
          title="Joining Date"
          value={
            employee.joiningDate
              ? new Date(employee.joiningDate).toLocaleDateString()
              : "-"
          }
        />

        <SummaryRow
          title="Reporting Manager"
          value={
            employee.reportingManager?.name || "-"
          }
        />

        <SummaryRow
          title="Week Off"
          value={
            employee.weekoff?.length
              ? employee.weekoff.join(", ")
              : "-"
          }
        />

      </div>
    </div>
  );
};

export default EmployeeProfile;

const SummaryRow = ({ title, value }) => {
  return (
    <div className="flex justify-between items-center">

      <span
        className="text-sm"
        style={{
          color: colors.textSecondary,
        }}
      >
        {title}
      </span>

      <span
        className="font-semibold text-sm text-right"
        style={{
          color: colors.textPrimary,
        }}
      >
        {value}
      </span>

    </div>
  );
};
