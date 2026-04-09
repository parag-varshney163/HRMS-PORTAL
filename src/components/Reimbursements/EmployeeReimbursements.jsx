import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  FileText,
  Inbox,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance.js";

import Button from "../../components/ui/Button.jsx";
import StatsCard from "../ui/StatsCard.jsx";
import ApplyReimbursementModal from "../Reimbursements/ApplyReimbursementModal.jsx";
import useNotification from "../../hooks/useNotification.jsx";

const EmployeeReimbursements = () => {
  const notify = useNotification();

  // ─── STATE ───
  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);

  // ─── FETCH EMPLOYEE DATA ───
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/v1/reimbursement/user");

      if (data.success && data.data) {
        // Map the stats from the nested data object
        setStats({
          totalRequests: data.data.totalRequests || 0,
          pendingManager: data.data.pendingManager || 0,
          pendingAdmin: data.data.pendingAdmin || 0,
          approved: data.data.approved || 0,
          totalApprovedAmount: data.data.totalApprovedAmount || 0,
        });

        // Map the array of reimbursements
        setRequests(data.data.reimbursements || []);
      }
    } catch (error) {
      console.error("Failed to fetch reimbursements:", error);
      notify.error("Loading Failed", "Could not load your reimbursement data.");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchData();
  }, []);

  // ─── ACTION: APPLY ───
  const handleApplyReimbursement = async (formData) => {
    try {
      const { data } = await axiosInstance.post(
        "/api/v1/reimbursement",
        formData,
      );
      if (data.success) {
        notify.success(
          "Submitted",
          "Your expense claim has been submitted for approval.",
        );
        fetchData();
        return { success: true };
      }
    } catch (error) {
      notify.error(
        "Submission Failed",
        error.response?.data?.message || "Could not submit your reimbursement.",
      );
      return { success: false, message: error.response?.data?.message };
    }
  };

  // ─── HELPER: STATUS BADGES ───
  const renderStatusBadge = (req) => {
    let style = "bg-gray-500/10 text-gray-400 border-gray-500/20";
    let text = req.status || "Pending";
    const status = text.toLowerCase();

    if (status.includes("approved")) {
      style = "bg-green-500/10 text-green-400 border-green-500/30";
      text = "Fully Approved";
    } else if (status.includes("reject")) {
      style = "bg-red-500/10 text-red-400 border-red-500/30";
      text = "Rejected";
    } else if (status.includes("pending_manager")) {
      style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      text = "Pending Manager";
    } else if (status.includes("pending")) {
      style = "bg-blue-500/10 text-blue-400 border-blue-500/30";
      text = "Pending Admin";
    } else {
      text = text.replace(/_/g, " ");
    }

    return (
      <span
        className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${style}`}
      >
        {text}
      </span>
    );
  };

  const totalPending = (stats.pendingManager || 0) + (stats.pendingAdmin || 0);

  return (
    <div className="py-2 pb-6 w-full h-full flex flex-col animate-in fade-in">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            My <span className="text-accent">Reimbursements</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Track your personal expense claims.
          </p>
        </div>
        <Button
          variant="custom"
          bg="#3B82F6"
          text="#FFF"
          icon={Plus}
          size="sm"
          onClick={() => setApplyModalOpen(true)}
        >
          Apply Reimbursement
        </Button>
      </div>

      {/* ─── Personal Stats Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={FileText}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          value={loading ? "..." : stats.totalRequests}
          label="Total Requests"
        />
        <StatsCard
          icon={Clock}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-400"
          value={loading ? "..." : totalPending}
          label="Total Pending"
        />
        <StatsCard
          icon={CheckCircle}
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
          value={loading ? "..." : stats.approved}
          label="Approved"
        />
        <StatsCard
          icon={DollarSign}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
          value={
            loading ? "..." : `$${stats.totalApprovedAmount?.toLocaleString()}`
          }
          label="Approved Amount"
        />
      </div>

      <div className="border-b border-card-border pb-3 mb-4">
        <h3 className="text-lg font-bold text-text-primary">My History</h3>
      </div>

      {/* ─── Requests List (No Admin Buttons) ─── */}
      <div className="flex-1">
        {loading ? (
          <div className="py-10 text-center text-text-secondary animate-pulse">
            Loading your requests...
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-card border border-card-border rounded-xl p-5 hover:border-btn/40 transition-colors flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-base font-bold text-text-primary">
                      {req.reimbursementType}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      Submitted on{" "}
                      {new Date(
                        req.createdAt || req.expenseDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-accent">
                    ${req.amount || 0}
                  </p>
                </div>

                <div className="mb-4 text-sm text-text-secondary line-clamp-2">
                  {req.description}
                </div>

                <div className="mt-auto pt-4 border-t border-card-border/50 flex items-center justify-between">
                  {renderStatusBadge(req)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-card border border-dashed border-card-border rounded-xl text-text-secondary mt-4">
            <Inbox size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-bold text-text-primary">No claims yet</p>
            <p className="text-sm mt-1">
              You haven't submitted any reimbursement requests.
            </p>
          </div>
        )}
      </div>

      <ApplyReimbursementModal
        key={isApplyModalOpen ? "open" : "closed"}
        open={isApplyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={handleApplyReimbursement}
      />
    </div>
  );
};

export default EmployeeReimbursements;
