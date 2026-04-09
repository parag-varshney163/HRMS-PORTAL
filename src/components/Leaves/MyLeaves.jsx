/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import DataTable from "../ui/DataTable";

const formatLeaveType = (type) => {
  const map = {
    casualLeave: "Casual",
    sickLeave: "Sick",
    earnedLeave: "Earned",
    compOff: "Comp-Off",
  };
  return map[type] || type;
};

export default function MyLeaves({ refreshTrigger }) {
  // 🚨 UI SAFETY: Default state is initialized to 0
  const [balance, setBalance] = useState({
    casualLeave: 0,
    sickLeave: 0,
    earnedLeave: 0,
    compOff: 0,
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyData = useCallback(async () => {
    setLoading(true);

    // 1. Fetch Balances safely
    try {
      const balanceRes = await axiosInstance.get(
        "/api/v1/salary-leave/leave-balance",
      );
      if (balanceRes.data?.success && balanceRes.data.data?.leaveBalance) {
        setBalance(balanceRes.data.data.leaveBalance);
      } else {
        // Fallback to 0 if API returns success but no data
        setBalance({
          casualLeave: 0,
          sickLeave: 0,
          earnedLeave: 0,
          compOff: 0,
        });
      }
    } catch (error) {
      console.warn("Leave balance API failed, defaulting to 0.");
      // Fallback to 0 if API throws 404 or 500
      setBalance({ casualLeave: 0, sickLeave: 0, earnedLeave: 0, compOff: 0 });
    }

    // 2. Fetch History safely
    try {
      const historyRes = await axiosInstance.get("/api/v1/leave/user-details");
      if (historyRes.data?.success && historyRes.data.data?.leaves) {
        setHistory(historyRes.data.data.leaves);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.warn("Leave history API failed, defaulting to empty list.");
      setHistory([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMyData();
  }, [fetchMyData, refreshTrigger]);

  const columns = [
    {
      key: "leaveType",
      label: "Leave Type",
      width: "1fr",
      align: "left",
      render: (val) => (
        <span className="text-sm font-semibold text-text-primary">
          {formatLeaveType(val)}
        </span>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      width: "1.5fr",
      align: "left",
      render: (val) => (
        <span className="text-xs text-text-secondary">{val || "-"}</span>
      ),
    },
    {
      key: "totalDays",
      label: "Days",
      width: "0.5fr",
      align: "center",
      render: (val) => (
        <span className="text-sm font-bold text-text-primary">{val || 0}</span>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      width: "1.5fr",
      align: "left",
      render: (val) => (
        <span
          className="text-xs text-text-secondary truncate block max-w-[150px]"
          title={val}
        >
          {val || "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "1fr",
      align: "center",
      render: (val) => {
        let style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
        if (val === "approved")
          style = "bg-green-500/10 text-green-400 border-green-500/30";
        else if (val === "rejected")
          style = "bg-red-500/10 text-red-400 border-red-500/30";
        return (
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${style}`}
          >
            {val || "Pending"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Balances Grid - Safely handles undefined with || 0 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm text-center">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Casual
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {balance.casualLeave || 0}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm text-center">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Sick
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {balance.sickLeave || 0}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm text-center">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Earned
          </p>
          <p className="text-2xl font-bold text-accent">
            {balance.earnedLeave || 0}
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-5 shadow-sm text-center">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Comp-Off
          </p>
          <p className="text-2xl font-bold text-purple-400">
            {balance.compOff || 0}
          </p>
        </div>
      </div>

      {/* History Table */}
      <div>
        <h3 className="text-lg font-bold text-text-primary mb-2">
          My Leave History
        </h3>
        <DataTable
          columns={columns}
          data={history}
          loading={loading}
          paginationMode="client"
        />
      </div>
    </div>
  );
}
