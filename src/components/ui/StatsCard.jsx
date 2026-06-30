// /* eslint-disable no-unused-vars */
// import React from "react";
// const StatsCard = ({ icon: Icon, iconBg, iconColor, value, label }) => {
//   return (
//     <div className="bg-card border border-card-border rounded-xl p-6 flex items-center gap-3 hover:border-btn/40 transition-colors">
//       <div
//         className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
//       >
//         <Icon size={20} className={iconColor} />
//       </div>
//       <div>
//         <p className="text-2xl font-bold text-text-primary leading-tight">
//           {value}
//         </p>
//         <p className="text-xs text-text-secondary">{label}</p>
//       </div>
//     </div>
//   );
// };
// export default React.memo(StatsCard);
/* eslint-disable no-unused-vars */
import React from "react";

import colors from "../../constants/colors";


const StatsCard = ({
  icon: Icon,
  iconBg = colors.accent,
  iconColor = "#FFFFFF",
  value,
  label,
}) => {
  return (
    <div
      className="rounded-xl p-6 flex items-center gap-3 transition-colors"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = colors.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.cardBorder;
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{
          backgroundColor: iconBg,
          color: iconColor,
        }}
      >
        <Icon size={20} />
      </div>

      <div>
        <p
          className="text-2xl font-bold leading-tight"
          style={{ color: colors.textPrimary }}
        >
          {value}
        </p>

        <p
          className="text-xs"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </p>
      </div>
    </div>
  );
};

export default React.memo(StatsCard);
