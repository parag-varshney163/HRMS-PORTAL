/* eslint-disable no-unused-vars */
import React from "react";

const STATUS_STYLES = {
  Approved: "bg-green-500/20 text-green-400 border border-green-500/30",
  Pending: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Rejected: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export default function LeaveHistoryCard({ data }) {
  const statusClass = STATUS_STYLES[data.status] || STATUS_STYLES.Pending;

  return (
    <div className="bg-card border border-card-border rounded-xl p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between hover:border-btn/40 transition-colors">
      {/* Left Side: Type & Details */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-sm font-bold text-text-primary">{data.type}</h3>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusClass}`}
          >
            {data.status}
          </span>
        </div>
        <p className="text-xs text-text-secondary mb-1">{data.reason}</p>
        <p className="text-[10px] text-text-secondary opacity-70">
          {data.dateRange} ({data.days} days)
        </p>
      </div>
    </div>
  );
}
