import { UserMinus, CheckCircle, Clock, XCircle, Calendar, Check, X, ChevronLeft, ChevronRight, Inbox, } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

import useNotification from "../../hooks/useNotification.jsx";
import ResignationActionModal from "./ResignationActionModal";
import ApplyResignationModal from "./ApplyResignationModal";
import axiosInstance from "../../api/axiosInstance.js";
import Button from "../../components/ui/Button.jsx";
import StatsCard from "../ui/StatsCard.jsx";
import SearchBar from "../ui/SearchBar.jsx";


const AdminResignations = () => {
  const userRole = localStorage.getItem("roleName")?.toLowerCase() || "manager";
  const isManager = userRole === "manager";
  const isAdmin = userRole === "admin";
  const isHR = userRole === "hr";
  const notify = useNotification();

  const [stats, setStats] = useState({});
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState({
    open: false,
    type: "",
    resignationId: null,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.allSettled([
        axiosInstance.get("/api/v1/resignation/stats/data"),
        axiosInstance.get(
          `/api/v1/resignation?page=${page}&limit=10&search=${debouncedSearch}`,
        ),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        setStats(statsRes.value.data.data || {});
      }
      if (listRes.status === "fulfilled" && listRes.value.data.success) {
        setResignations(listRes.value.data.data.data || []);
        setTotalPages(listRes.value.data.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch resignations:", error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApply = async (formData) => {
    try {
      const { data } = await axiosInstance.post(
        "/api/v1/resignation/apply",
        formData,
      );
      if (data.success) {
        notify.success(
          "Resignation Submitted",
          "Request submitted for review.",
        );
        fetchData();
        return { success: true };
      }
    } catch (error) {
      notify.error(
        "Submission Failed",
        error.response?.data?.message || "Failed to apply.",
      );
      return { success: false, message: error.response?.data?.message };
    }
  };

  const handleConfirmAction = async ({ action, comments }) => {
    try {
      // const endpointRole = isAdmin ? "admin" : "manager";
      const endpointRole = isAdmin
        ? "admin"
        : isHR
          ? "hr"
          : "manager";
      const { data } = await axiosInstance.put(
        `/api/v1/resignation/${endpointRole}/${actionModal.resignationId}`,
        { action, comments },
      );

      if (data.success) {
        notify.success(
          `Resignation ${action === "approve" ? "Approved" : "Rejected"}`,
          "Request processed successfully.",
        );
        setActionModal({ open: false, type: "", resignationId: null });
        fetchData();
      }
    } catch (error) {
      notify.error(
        "Action Failed",
        error.response?.data?.message || "Failed to process request.",
      );
    }
  };

  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase() || "";
    let style = "bg-gray-500/10 text-gray-400 border-gray-500/20";
    let text = "Pending";

    if (s.includes("admin_approved") || s === "approved") {
      style = "bg-green-500/10 text-green-400 border-green-500/30";
      text = "Fully Approved";
    } else if (s.includes("reject")) {
      style = "bg-red-500/10 text-red-400 border-red-500/30";
      text = "Rejected";
    } else if (
      s === "submitted" ||
      s.includes("pending_manager") ||
      s.includes("pendingmanager")
    ) {
      style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      text = "Pending Manager";
    } else if (
      s.includes("manager_approved") ||
      s.includes("pending_admin") ||
      s.includes("pendingadmin")
    ) {
      style = "bg-blue-500/10 text-blue-400 border-blue-500/30";
      text = "Pending Admin";
    }

    return (
      <span
        className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-md border uppercase tracking-wider ${style}`}
      >
        {text}
      </span>
    );
  };

  return (
    <div className="py-2 pb-6 w-full h-full flex flex-col animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Employee <span className="text-accent">Resignations</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage offboarding requests and approvals.
          </p>
        </div>
        <Button
          variant="custom"
          bg="#3B82F6"
          text="#FFF"
          icon={UserMinus}
          size="sm"
          onClick={() => setApplyModalOpen(true)}
        >
          Apply Resignation
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={CheckCircle}
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
          value={loading ? "..." : stats.approved || 0}
          label="Approved"
        />
        <StatsCard
          icon={Clock}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-400"
          value={loading ? "..." : stats.pendingManager || 0}
          label="Pending Manager"
        />
        <StatsCard
          icon={Clock}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          value={loading ? "..." : stats.pendingAdmin || 0}
          label="Pending Admin"
        />
        <StatsCard
          icon={XCircle}
          iconBg="bg-red-500/10"
          iconColor="text-red-400"
          value={loading ? "..." : stats.rejected || 0}
          label="Rejected"
        />
      </div>

      <div className="flex justify-start border-b border-card-border pb-4 mb-4">
        <div className="w-full sm:w-auto">
          <SearchBar
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
          />
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="py-10 text-center text-text-secondary animate-pulse">
            Loading resignations...
          </div>
        ) : resignations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resignations.map((req) => {
              const statusStr = req.status?.toLowerCase() || "";
              const isPendingManager =
                statusStr === "submitted" ||
                statusStr.includes("pendingmanager") ||
                statusStr.includes("pending_manager");
              const isPendingAdmin =
                statusStr.includes("manager_approved") ||
                statusStr.includes("pendingadmin") ||
                statusStr.includes("pending_admin");
              const isPending = isPendingManager || isPendingAdmin;
              const isFullyResolved =
                statusStr.includes("admin_approved") ||
                statusStr === "approved" ||
                statusStr.includes("reject");

              return (
                <div
                  key={req._id}
                  className="bg-card border border-card-border rounded-xl p-5 flex flex-col group hover:border-btn/40 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-btn/20 border-2 border-card-border flex items-center justify-center text-sm font-semibold text-btn shrink-0 uppercase">
                        {req.employee?.firstName?.charAt(0)}
                        {req.employee?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-text-primary line-clamp-1">
                          {req.employee?.firstName} {req.employee?.lastName}
                        </h3>
                        <p className="text-xs text-text-secondary font-mono">
                          {req.employee?.employeeId}
                        </p>
                      </div>
                    </div>
                    {renderStatusBadge(req.status)}
                  </div>

                  <div className="bg-input/30 border border-card-border/50 rounded-xl p-4 mt-auto">
                    <div className="flex items-center justify-between mb-3 border-b border-card-border/50 pb-3">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Calendar size={15} className="shrink-0 text-accent" />
                        <span className="text-xs font-semibold text-text-primary">
                          Last Day:
                        </span>
                      </div>
                      <span className="text-sm font-bold text-text-primary">
                        {new Date(req.lastWorkingDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>

                    <div className="mb-4">
                      <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold block mb-1">
                        Reason for leaving
                      </span>
                      <p className="text-sm text-text-primary italic line-clamp-2">
                        "
                        {req.reason === "string" || !req.reason
                          ? "No specific reason provided."
                          : req.reason}
                        "
                      </p>
                    </div>

                    {/* 🚨 ROLE-BASED ACTION BUTTONS 🚨 */}
                    {!isFullyResolved && (
                      <div className="flex gap-3 mt-2">
                        {/* MANAGER: Can only see/act if it is strictly pending manager */}
                        {isManager && !isAdmin && isPendingManager && (
                          <>
                            <Button
                              variant="custom"
                              bg="#22C55E"
                              text="#FFF"
                              size="sm"
                              icon={Check}
                              onClick={() =>
                                setActionModal({
                                  open: true,
                                  type: "approve",
                                  resignationId: req._id,
                                })
                              }
                              className="flex-1 font-bold"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="custom"
                              bg="#EF4444"
                              text="#FFF"
                              size="sm"
                              icon={X}
                              onClick={() =>
                                setActionModal({
                                  open: true,
                                  type: "reject",
                                  resignationId: req._id,
                                })
                              }
                              className="flex-1 font-bold"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {/* ADMIN: GOD MODE. Can see/act on anything not yet fully resolved! */}
                        {(isAdmin || isHR) && isPending && (
                          <>
                            <Button
                              variant="custom"
                              bg="#22C55E"
                              text="#FFF"
                              size="sm"
                              icon={Check}
                              onClick={() =>
                                setActionModal({
                                  open: true,
                                  type: "approve",
                                  resignationId: req._id,
                                })
                              }
                              className="flex-1 font-bold"
                            >

                              {isAdmin
                                ? isPendingManager
                                  ? "Force Approve"
                                  : "Final Approve"
                                : isHR
                                  ? "HR Approve"
                                  : "Approve"}
                            </Button>
                            <Button
                              variant="custom"
                              bg="#EF4444"
                              text="#FFF"
                              size="sm"
                              icon={X}
                              onClick={() =>
                                setActionModal({
                                  open: true,
                                  type: "reject",
                                  resignationId: req._id,
                                })
                              }
                              className="flex-1 font-bold"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    )}
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
            <p className="text-sm mt-1">
              There are no resignation requests at the moment.
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

      {/* ─── Modals ─── */}
      <ApplyResignationModal
        open={isApplyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={handleApply}
      />
      <ResignationActionModal
        open={actionModal.open}
        onClose={() =>
          setActionModal({ open: false, type: "", resignationId: null })
        }
        actionType={actionModal.type}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default AdminResignations;
