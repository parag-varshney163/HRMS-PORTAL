/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  SlidersHorizontal,
  Inbox,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import StatsCard from "../ui/StatsCard";
import DataTable from "../ui/DataTable";
import SearchBar from "../ui/SearchBar";
import Button from "../ui/Button";
import useNotification from "../../hooks/useNotification.jsx";

// 🚨 CRITICAL FIX: Ensure 'export default function' is exactly like this.
export default function OrgLeaves({ refreshTrigger, onOpenBalanceModal }) {
  const notify = useNotification();

  // ─── STATE ───
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ─── DEBOUNCE SEARCH ───
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ─── FETCH & SORT DATA ───
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.allSettled([
        axiosInstance.get("/api/v1/leave/stats"),
        axiosInstance.get(
          `/api/v1/leave/requests?page=${page}&limit=10&search=${debouncedSearch}&status=${statusFilter}`,
        ),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.data?.success) {
        setStats(
          statsRes.value.data.data || {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
          },
        );
      }

      if (listRes.status === "fulfilled" && listRes.value?.data?.success) {
        const fetchedRecords = listRes.value.data.data?.data || [];

        // 🚨 PRO-LEVEL SORTING: Force "pending" to the top, then sort by date
        const sortedRecords = fetchedRecords.sort((a, b) => {
          const statusA = a.status?.toLowerCase();
          const statusB = b.status?.toLowerCase();

          if (statusA === "pending" && statusB !== "pending") return -1;
          if (statusA !== "pending" && statusB === "pending") return 1;

          return (
            new Date(b.appliedOn || b.startDate) -
            new Date(a.appliedOn || a.startDate)
          );
        });

        setRecords(sortedRecords);
        setTotalPages(listRes.value.data.data?.totalPages || 1);
      }
    } catch (error) {
      console.warn("OrgLeaves API failed, but UI will render safely.", error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, statusFilter, refreshTrigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── ACTION: UPDATE STATUS ───
  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this request?`))
      return;
    try {
      const { data } = await axiosInstance.put(`/api/v1/leave/${id}/status`, {
        status: newStatus,
      });
      if (data?.success) {
        notify.success(
          `Leave ${newStatus === "approved" ? "Approved" : "Rejected"}`,
          `The leave request has been ${newStatus}.`,
        );
        fetchData();
      }
    } catch (error) {
      notify.error(
        "Status Update Failed",
        error.response?.data?.message || "Failed to update status.",
      );
    }
  };

  // ─── HELPER: STATUS BADGE ───
  const renderStatusBadge = (val) => {
    const s = val?.toLowerCase() || "pending";
    let style = "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";

    if (s === "approved")
      style = "bg-green-500/10 text-green-400 border-green-500/30";
    if (s === "rejected")
      style = "bg-red-500/10 text-red-400 border-red-500/30";

    return (
      <span
        className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${style}`}
      >
        {val || "Pending"}
      </span>
    );
  };

  // ─── DATATABLE COLUMNS ───
  const columns = [
    {
      key: "employee",
      label: "Employee",
      width: "1.5fr",
      align: "left",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary truncate">
            {row.employeeName || "Unknown"}
          </p>
          <p className="text-xs text-text-secondary font-mono truncate">
            {row.employeeId || "-"}
          </p>
        </div>
      ),
    },
    {
      key: "leaveInfo",
      label: "Leave Details",
      width: "1.5fr",
      align: "left",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate capitalize">
            {row.leaveType
              ? row.leaveType.replace(/([A-Z])/g, " $1").trim()
              : "Leave"}
          </p>
          <p className="text-xs text-text-secondary truncate mt-0.5">
            <span className="font-semibold text-accent">
              {row.totalDays || 0} Day(s)
            </span>{" "}
            •{" "}
            {row.startDate ? new Date(row.startDate).toLocaleDateString() : "-"}
          </p>
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      width: "1fr",
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
      render: (val) => renderStatusBadge(val),
    },
    {
      key: "actions",
      label: "Actions",
      width: "1.5fr",
      align: "right",
      render: (_, row) => {
        // 🚨 Hide buttons if the request is already processed
        if (row.status?.toLowerCase() !== "pending") {
          return (
            <span className="text-xs text-text-secondary italic">
              Processed
            </span>
          );
        }

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="custom"
              bg="#22C55E"
              text="#FFF"
              size="sm"
              icon={CheckCircle}
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(row._id || row.id, "approved");
              }}
              className="px-3"
            >
              Approve
            </Button>
            <Button
              variant="custom"
              bg="#EF4444"
              text="#FFF"
              size="sm"
              icon={XCircle}
              onClick={(e) => {
                e.stopPropagation();
                handleUpdateStatus(row._id || row.id, "rejected");
              }}
              className="px-3"
            >
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="pt-8 border-t border-card-border mt-6 w-full animate-in fade-in">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Organization <span className="text-accent">Requests</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage team leave applications.
          </p>
        </div>
        {/* Uncomment this when you want to use the Adjust Balances Modal */}
        {/* <Button
          variant="custom"
          bg="#eab308"
          text="#000"
          icon={SlidersHorizontal}
          size="sm"
          onClick={onOpenBalanceModal}
        >
          Adjust Balances
        </Button> */}
      </div>

      {/* ─── STATS GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={CalendarDays}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          value={loading ? "..." : stats.total || 0}
          label="Total Requests"
        />
        <StatsCard
          icon={Clock}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-400"
          value={loading ? "..." : stats.pending || 0}
          label="Pending Action"
        />
        <StatsCard
          icon={CheckCircle}
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
          value={loading ? "..." : stats.approved || 0}
          label="Approved"
        />
        <StatsCard
          icon={XCircle}
          iconBg="bg-red-500/10"
          iconColor="text-red-400"
          value={loading ? "..." : stats.rejected || 0}
          label="Rejected"
        />
      </div>

      {/* ─── FILTER BAR ─── */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 bg-card/40 border border-card-border rounded-2xl mb-4">
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <label className="text-sm font-medium text-text-secondary whitespace-nowrap">
            Filter Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="w-full xl:w-112.5 flex justify-end">
          <SearchBar
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            width="100%"
          />
        </div>
      </div>

      {/* ─── DATATABLE ─── */}
      <div className="flex-1 -mt-4">
        {records.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card border border-dashed border-card-border rounded-xl text-text-secondary mt-8">
            <Inbox size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-bold text-text-primary">
              No requests found
            </p>
            <p className="text-sm mt-1">
              Adjust your search or filter criteria.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={records}
            loading={loading}
            paginationMode="server"
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
