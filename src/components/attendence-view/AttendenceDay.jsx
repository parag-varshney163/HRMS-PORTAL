import colors from "../../constants/colors";


const statusConfig = {
  present: {
    label: "Present",
    bg: colors.successLight,
    text: colors.success,
  },
  absent: {
    label: "Absent",
    bg: colors.dangerLight,
    text: colors.danger,
  },
  leave: {
    label: "Leave",
    bg: colors.purpleLight,
    text: colors.purple,
  },
  half_day: {
    label: "Half Day",
    bg: colors.warningLight,
    text: colors.warning,
  },
};
const holidayConfig = {
  bg: "#EDE9FE",       // light purple
  text: "#7C3AED",     // purple
};
const weekOffConfig = {
  bg: "#DBEAFE",
  text: "#2563EB",
};

const AttendenceDay = ({ day, attendance, loading, holiday, isWeekOff }) => {
  // Empty Cell
  if (day.empty) {
    return (
      <div
        className="border min-h-[140px]"
        style={{
          borderColor: colors.cardBorder,
          background: colors.cardBg,
        }}
      />
    );
  }

  const config =
    statusConfig[attendance?.status] || null;
  // const isHoliday = !!holiday;
  const isHoliday = !!holiday && !attendance;
const showWeekOff = !attendance && !holiday && isWeekOff;

  return (
    <div
      className="border p-2 transition-all hover:shadow-sm"
      style={{
        borderColor: colors.cardBorder,
       background: isHoliday
  ? "#F5F3FF"
  : showWeekOff
    ? "#EFF6FF"
    : day.today
      ? colors.accentLight
      : colors.cardBg,
      }}
    >
      {/* Date */}

      <div className="flex justify-between items-center mb-2">
        <span
          className={`font-semibold ${day.today ? "text-lg" : ""
            }`}
          style={{
            color: day.today
              ? colors.accentDark
              : colors.textPrimary,
          }}
        >
          {day.date}
        </span>

        {day.today && (
          <div
            className="text-[10px] px-2 py-1 rounded-full font-medium"
            style={{
              background: colors.accent,
              color: "#fff",
            }}
          >
            Today
          </div>
        )}
      </div>

      {/* Loading */}

      {loading && (
        <div className="animate-pulse space-y-2">
          <div
            className="h-4 rounded"
            style={{
              background: colors.cardBorder,
            }}
          />

          <div
            className="h-3 rounded"
            style={{
              background: colors.cardBorder,
            }}
          />

          <div
            className="h-3 rounded"
            style={{
              background: colors.cardBorder,
            }}
          />
        </div>
      )}
      {/* Holiday */}

      {!loading && isHoliday && (
        <div
          className="rounded-lg p-2"
          style={{
            background: holidayConfig.bg,
          }}
        >
          <div
            className="font-semibold text-xs"
            style={{
              color: holidayConfig.text,
            }}
          >
            🎉 Holiday
          </div>

          <div
            className="mt-2 text-xs font-medium"
            style={{
              color: holidayConfig.text,
            }}
          >
            {holiday.title}
          </div>

          <div
            className="mt-1 text-[11px]"
            style={{
              color: colors.textSecondary,
            }}
          >
            Official Holiday
          </div>
        </div>
      )}
      {/* Week Off */}

{!loading && showWeekOff && (
  <div
    className="rounded-lg p-2"
    style={{
      background: weekOffConfig.bg,
    }}
  >
    <div
      className="font-semibold text-xs"
      style={{
        color: weekOffConfig?.text,
      }}
    >
      🌴 Week Off
    </div>

    <div
      className="mt-2 text-xs font-medium"
      style={{
        color: weekOffConfig.text,
      }}
    >
      Scheduled Off
    </div>

    <div
      className="mt-1 text-[11px]"
      style={{
        color: colors.textSecondary,
      }}
    >
      Weekly Holiday
    </div>
  </div>
)}

      {/* Attendance */}

      {!loading && attendance && (
        <div
          className="rounded-lg p-2"
          style={{
            background: config?.bg,
          }}
        >
          {/* Status */}

          <div
            className="font-semibold text-xs capitalize"
            style={{
              color: config?.text,
            }}
          >
            {config?.label}
          </div>

          {/* Check In */}

          {attendance.checkIn && (
            <div
              className="text-xs mt-2"
              style={{
                color: colors.textPrimary,
              }}
            >
              <span className="font-medium">IN :</span>{" "}
              {attendance.checkIn}
            </div>
          )}

          {/* Check Out */}

          {attendance.checkOut && (
            <div
              className="text-xs mt-1"
              style={{
                color: colors.textPrimary,
              }}
            >
              <span className="font-medium">OUT :</span>{" "}
              {attendance.checkOut}
            </div>
          )}

          {/* Working Hours */}

          {attendance.totalWorkingHours && (
            <div
              className="mt-2 text-xs font-semibold"
              style={{
                color: config?.text,
              }}
            >
              {attendance.totalWorkingHours}
            </div>
          )}

          {/* Notes */}

          {attendance.notes && (
            <div
              className="mt-2 text-[11px] italic"
              style={{
                color: colors.textSecondary,
              }}
            >
              {attendance.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendenceDay;
