import { CheckCircle2, XCircle, Clock3, CalendarMinus, } from "lucide-react";

import colors from "../../constants/colors";


const AttendanceStats = ({
  present = 0,
  absent = 0,
  leave = 0,
  halfDay = 0,
}) => {
  const cards = [
    {
      title: "Present",
      value: present,
      icon: CheckCircle2,
      bg: colors.successLight,
      color: colors.success,
    },
    {
      title: "Absent",
      value: absent,
      icon: XCircle,
      bg: colors.dangerLight,
      color: colors.danger,
    },
    {
      title: "Leave",
      value: leave,
      icon: CalendarMinus,
      bg: colors.purpleLight,
      color: colors.purple,
    },
    {
      title: "Half Day",
      value: halfDay,
      icon: Clock3,
      bg: colors.warningLight,
      color: colors.warning,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-xl p-4 transition-all duration-200 hover:shadow-md"
            style={{
              background: card.bg,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-medium"
                style={{
                  color: card.color,
                }}
              >
                {card.title}
              </span>

              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "#fff",
                }}
              >
                <Icon size={18} color={card.color} />
              </div>
            </div>

            <h2
              className="mt-4 text-3xl font-bold"
              style={{
                color: card.color,
              }}
            >
              {card.value}
            </h2>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceStats;
