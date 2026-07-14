// Month Names
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Week Days
export const WEEK_DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

// ------------------------------------
// Month Name
// ------------------------------------

export const getMonthName = (month) => MONTHS[month];

// ------------------------------------
// Attendance Map
// Converts attendance array into object
// {
//   "2026-07-01": {...},
//   "2026-07-02": {...}
// }
// ------------------------------------

export const attendanceMap = (attendance = []) => {
  const map = {};

  attendance.forEach((item) => {
    if (!item.date) return;

    const key = new Date(item.date).toISOString().split("T")[0];

    map[key] = item;
  });

  return map;
};

// ------------------------------------
// Calendar Days
// ------------------------------------

export const getMonthDays = (month, year) => {
  const firstDay = new Date(year, month, 1).getDay();

  const totalDays = new Date(year, month + 1, 0).getDate();

  const totalPrevMonthDays = new Date(year, month, 0).getDate();

  const calendar = [];

  // Previous Month Empty Cells

  for (let i = firstDay - 1; i >= 0; i--) {
    calendar.push({
      empty: true,
      date: totalPrevMonthDays - i,
    });
  }

  // Current Month

  for (let day = 1; day <= totalDays; day++) {
    const current = new Date(year, month, day);

    calendar.push({
      empty: false,
      date: day,
      fullDate: current.toISOString().split("T")[0],
      today:
        current.toDateString() === new Date().toDateString(),
    });
  }

  // Fill Remaining Grid (42 cells)

  while (calendar.length < 42) {
    calendar.push({
      empty: true,
      date: calendar.length - totalDays - firstDay + 1,
    });
  }

  return calendar;
};

// ------------------------------------
// Previous Month
// ------------------------------------

export const previousMonth = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    1
  );
};

// ------------------------------------
// Next Month
// ------------------------------------

export const nextMonth = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );
};

// ------------------------------------
// Format Date
// 2026-07-14
// ------------------------------------

export const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

// ------------------------------------
// Status Color
// ------------------------------------

export const getStatus = (status) => {
  switch (status) {
    case "present":
      return "present";

    case "absent":
      return "absent";

    case "leave":
      return "leave";

    case "half_day":
      return "half_day";

    default:
      return "none";
  }
};

// ------------------------------------
// Attendance Statistics
// ------------------------------------

export const calculateStats = (attendance = []) => {
  const stats = {
    present: 0,
    absent: 0,
    leave: 0,
    halfDay: 0,
    workingHours: 0,
  };

  attendance.forEach((item) => {
    switch (item.status) {
      case "present":
        stats.present++;
        break;

      case "absent":
        stats.absent++;
        break;

      case "leave":
        stats.leave++;
        break;

      case "half_day":
        stats.halfDay++;
        break;

      default:
        break;
    }

    if (item.totalWorkingHours) {
      const hour = parseInt(item.totalWorkingHours);

      if (!isNaN(hour)) {
        stats.workingHours += hour;
      }
    }
  });

  stats.total = attendance.length;

  stats.attendancePercentage =
    stats.total === 0
      ? 0
      : Math.round(
          ((stats.present + stats.halfDay) /
            stats.total) *
            100
        );

  return stats;
};
