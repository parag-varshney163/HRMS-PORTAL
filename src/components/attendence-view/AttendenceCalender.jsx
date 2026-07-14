import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { getMonthDays, getMonthName, attendanceMap, } from "./calendarUtils";
import colors from "../../constants/colors";
import AttendenceDay from "./AttendenceDay";


const AttendenceCalendar = ({ employee, attendance = [], loading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const days = useMemo(() => {
    return getMonthDays(month, year);
  }, [month, year]);

  const attendanceByDate = useMemo(() => {
    return attendanceMap(attendance);
  }, [attendance]);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div
      className="rounded-2xl h-full flex flex-col"
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      {/* Header */}

      <div
        className="flex justify-between items-center px-6 py-5 border-b"
        style={{
          borderColor: colors.cardBorder,
        }}
      >
        <div>
          <h2
            className="text-xl font-semibold"
            style={{
              color: colors.textPrimary,
            }}
          >
            Attendance Calendar
          </h2>

          <p
            className="text-sm mt-1"
            style={{
              color: colors.textMuted,
            }}
          >
            {employee?.name}
          </p>
        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={previousMonth}
            className="rounded-lg p-2 transition"
            style={{
              background: colors.secondary,
            }}
          >
            <ChevronLeft />
          </button>

          <h3
            className="font-semibold"
            style={{
              color: colors.textPrimary,
            }}
          >
            {getMonthName(month)} {year}
          </h3>

          <button
            onClick={nextMonth}
            className="rounded-lg p-2 transition"
            style={{
              background: colors.secondary,
            }}
          >
            <ChevronRight />
          </button>

        </div>
      </div>

      {/* Week Names */}

      <div className="grid grid-cols-7 border-b">

        {[
          "Sun",
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
        ].map((day) => (
          <div
            key={day}
            className="py-3 text-center font-semibold"
            style={{
              color: colors.textSecondary,
              borderColor: colors.cardBorder,
            }}
          >
            {day}
          </div>
        ))}

      </div>

      {/* Calendar */}

      <div className="grid grid-cols-7 flex-1">

        {days.map((day, index) => (
          <AttendenceDay
            key={index}
            day={day}
            attendance={attendanceByDate[day.fullDate]}
            loading={loading}
          />
        ))}

      </div>
    </div>
  );
};

export default AttendenceCalendar;
