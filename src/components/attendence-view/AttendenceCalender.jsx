import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { attendanceMap, getMonthDays, getMonthName } from "./CalendarUtils";
import colors from "../../constants/colors";
import AttendenceDay from "./AttendenceDay";


const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];


const AttendenceCalendar = ({ employee, attendance = [], loading, holidays = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const days = useMemo(() => {
    return getMonthDays(month, year);
  }, [month, year]);

  const attendanceByDate = useMemo(() => {
    return attendanceMap(attendance);
  }, [attendance]);

  const holidayMap = useMemo(() => {
    const map = {};

    holidays.forEach((holiday) => {
      // Use the API date exactly as received
      const key = holiday.date.slice(0, 10);

      map[key] = holiday;
    });

    return map;
  }, [holidays]);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const weekOffs = employee?.weekoff || [];

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

        {/* {days.map((day, index) => (
          <AttendenceDay
            key={index}
            day={day}
            attendance={attendanceByDate[day.fullDate]}
            holiday={holidayMap[day.fullDate]}
            loading={loading}
          />
        ))} */}
        {days.map((day, index) => {
          const holiday = holidays.find((h) => {
            const d = new Date(h.date);

            return (
              d.getFullYear() === year &&
              d.getMonth() === month &&
              d.getDate() === day.date
            );
          });

          return (
            <AttendenceDay
              key={index}
              day={day}
              attendance={attendanceByDate[day.fullDate]}
              isWeekOff={
                !day.empty &&
                employee?.weekoff?.includes(
                  weekDays[new Date(year, month, day.date).getDay()]
                )
              }
              holiday={holiday}
              loading={loading}
            />
          );
        })}

      </div>
    </div>
  );
};

export default AttendenceCalendar;
