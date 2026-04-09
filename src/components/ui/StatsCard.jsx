/* eslint-disable no-unused-vars */
import React from "react";

const StatsCard = ({ icon: Icon, iconBg, iconColor, value, label }) => {
  return (
    <div className="bg-card border border-card-border rounded-xl p-6 flex items-center gap-3 hover:border-btn/40 transition-colors">
      <div
        className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
      >
        <Icon size={20} className={iconColor} />
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary leading-tight">
          {value}
        </p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  );
};

export default React.memo(StatsCard);
