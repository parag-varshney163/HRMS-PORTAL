import { Plus, DollarSign, Clock, CheckCircle, FileText, User, ChevronLeft, ChevronRight, Inbox, } from "lucide-react";
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";

import ApplyReimbursementModal from "../Reimbursements/ApplyReimbursementModal.jsx";
import useNotification from "../../hooks/useNotification.jsx";
import axiosInstance from "../../api/axiosInstance.js";
import FilterDropDown from "../ui/FilterDropDown.jsx";
import Button from "../../components/ui/Button.jsx";
import StatsCard from "../ui/StatsCard.jsx";


const AdminReimbursements = () => {
  const userRole = localStorage.getItem("roleName")?.toLowerCase() || "manager";
  const isManager = userRole === "manager";
  const isAdmin = userRole === "admin";
  const notify = useNotification();

  const [stats, setStats] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  /* Update fetchData API */
  /* Update fetchData API */
  const fetchData = async () => {
    try {
      setLoading(true);

      const statusQuery = statusFilter
        ? `&status=${statusFilter}`
        : "";

      const [statsRes, listRes] = await Promise.allSettled([
        axiosInstance.get("/api/v1/reimbursement/stats"),
        axiosInstance.get(
          `/api/v1/reimbursement/pagination?page=${page}&limit=10&search=${debouncedSearch}${statusQuery}`,
        ),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        setStats(statsRes.value.data.data || {});
      }

      if (listRes.status === "fulfilled" && listRes.value.data.success) {
        setRequests(
          listRes.value.data.data.reimbursements ||
          listRes.value.data.data.docs ||
          listRes.value.data.data ||
          [],
        );

        setTotalPages(listRes.value.data.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch reimbursements:", error);
      notify.error("Loading Failed", "Could not load reimbursement data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, debouncedSearch, statusFilter]);

  const handleApplyReimbursement = async (formData) => {
    try {
      const { data } = await axiosInstance.post(
        "/api/v1/reimbursement",
        formData,
      );
      if (data.success) {
        notify.success("Submitted", "Expense claim submitted.");
        fetchData();
        return { success: true };
      }
    } catch (error) {
      notify.error(
        "Submission Failed",
        error.response?.data?.message || "Could not submit reimbursement.",
      );
      return { success: false, message: error.response?.data?.message };
    }
  };

  const handleManagerApprove = async (id) => {
    try {
      const { data } = await axiosInstance.put(
        `/api/v1/reimbursement/manager/${id}/approve`,
      );
      if (data.success) {
        notify.success(
          "Approved",
          "Reimbursement approved. Waiting for Admin.",
        );
        fetchData();
      }
    } catch (error) {
      notify.error(
        "Approval Failed",
        error.response?.data?.message || "Unable to approve request.",
      );
    }
  };

  const handleAdminAction = async (id, action) => {
    try {
      const { data } = await axiosInstance.put(
        `/api/v1/reimbursement/admin/${id}/approve`,
        { status: action },
      );
      if (data.success) {
        const isApproval = action === "approved";
        notify.success(
          isApproval ? "Approved" : "Rejected",
          isApproval ? "Expense fully approved." : "Expense rejected.",
        );
        fetchData();
      }
    } catch (error) {
      notify.error(
        "Action Failed",
        error.response?.data?.message || `Unable to ${action} request.`,
      );
    }
  };

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Expense <span className="text-accent">Approvals</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage and approve employee expenses.
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={FileText}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          value={loading ? "..." : stats.totalRequests || 0}
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
          value={loading ? "..." : stats.approved || 0}
          label="Approved"
        />
        <StatsCard
          icon={DollarSign}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
          value={
            loading
              ? "..."
              : `$${(stats.totalApprovedAmount || 0).toLocaleString()}`
          }
          label="Approved Amount"
        />
      </div>



      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-card-border pb-3 mb-4">
        <h3 className="text-lg font-bold text-text-primary">
          All Team Requests
        </h3>

        <div className="w-[220px]">
          <FilterDropDown
            width="220px"
            defaultLabel="Pending"
            options={[
              "Pending",
              "Approved",
              "Rejected",
              "All Requests",
            ]}
            onSelect={(value) => {
              const statusMap = {
                Pending: "pending",
                Approved: "approved",
                Rejected: "rejected",
                "All Requests": "",
              };

              setStatusFilter(statusMap[value] || "");
              setPage(1);
            }}
          />
        </div>
      </div>


      <div className="flex-1">
        {loading ? (
          <div className="py-10 text-center text-text-secondary animate-pulse">
            Loading requests...
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => {
              const reqStatus = req.status?.toLowerCase() || "";
              const isPending = reqStatus.includes("pending");

              return (
                <div
                  key={req._id}
                  className="bg-card border border-card-border rounded-xl p-5 hover:border-btn/40 transition-colors flex flex-col"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-base font-bold text-text-primary">
                        {req.reimbursementType}
                      </h4>
                      <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                        <User size={12} />{" "}
                        {req.user?.firstName ||
                          req.employee?.firstName ||
                          "Unknown"}{" "}
                        • {new Date(req.expenseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-accent">
                        ${req.amount || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 text-sm text-text-secondary line-clamp-2">
                    {req.description}
                  </div>

                  {(req.approvedByManager || req.approvedByAdmin) && (
                    <div className="mb-3 p-2 rounded-lg bg-input/20 border border-card-border/50 flex flex-col gap-1 text-[10px] text-text-secondary">
                      {req.approvedByManager && (
                        <p>
                          Manager:{" "}
                          <span className="font-medium text-text-primary">
                            {req.approvedByManager.firstName}
                          </span>
                        </p>
                      )}
                      {req.approvedByAdmin && (
                        <p>
                          Admin:{" "}
                          <span className="font-medium text-text-primary">
                            {req.approvedByAdmin.firstName}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-card-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {renderStatusBadge(req)}

                    <div className="flex gap-2 w-full sm:w-auto">
                      {isManager &&
                        !isAdmin &&
                        reqStatus.includes("pending_manager") && (
                          <Button
                            variant="custom"
                            bg="#3B82F6"
                            text="#FFF"
                            size="sm"
                            onClick={() => handleManagerApprove(req._id)}
                            className="flex-1 sm:flex-none font-bold"
                          >
                            Approve Request
                          </Button>
                        )}

                      {isAdmin && isPending && (
                        <>
                          <Button
                            variant="custom"
                            bg="#22C55E"
                            text="#FFF"
                            size="sm"
                            onClick={() =>
                              handleAdminAction(req._id, "approved")
                            }
                            className="flex-1 sm:flex-none font-bold"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="custom"
                            bg="#EF4444"
                            text="#FFF"
                            size="sm"
                            onClick={() =>
                              handleAdminAction(req._id, "rejected")
                            }
                            className="flex-1 sm:flex-none font-bold"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-card border border-dashed border-card-border rounded-xl text-text-secondary mt-4">
            <Inbox size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-bold text-text-primary">
              No pending approvals
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-card-border mt-6 pt-4">
          <p className="text-sm text-text-secondary">
            Page <span className="font-semibold text-text-primary">{page}</span>{" "}
            of{" "}
            <span className="font-semibold text-text-primary">
              {totalPages}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-input text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded bg-input text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      <ApplyReimbursementModal
        key={isApplyModalOpen ? "open" : "closed"}
        open={isApplyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={handleApplyReimbursement}
      />
    </div>
  );
};

export default AdminReimbursements;
