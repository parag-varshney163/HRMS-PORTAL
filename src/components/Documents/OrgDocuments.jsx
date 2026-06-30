import { CheckCircle, XCircle, Clock, Files, Check, X, ExternalLink, } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

import useNotification from "../../hooks/useNotification.jsx";
import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors.js";
import StatsCard from "../ui/StatsCard";
import SearchBar from "../ui/SearchBar";
import DataTable from "../ui/DataTable";


export default function OrgDocuments({ refreshTrigger }) {
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();

  // Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
        axiosInstance.get("/api/v1/documents/stats"),
        axiosInstance.get(
          `/api/v1/documents/all?page=${page}&limit=10&search=${debouncedSearch}&status=${statusFilter}`,
        ),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data?.success) {
        setStats(statsRes.value.data.data);
      }
      if (listRes.status === "fulfilled" && listRes.value.data?.success) {
        // 🚨 CRITICAL FIX: Changed .records to .documents to match your JSON payload!
        setRecords(listRes.value.data.data.documents || []);
        setTotalPages(listRes.value.data.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch org documents", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, refreshTrigger]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Admin Action: Verify / Reject
  const handleUpdateStatus = async (id, newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to mark this document as ${newStatus}?`,
      )
    )
      return;
    try {
      const { data } = await axiosInstance.put(
        `/api/v1/documents/${id}/status`,
        { status: newStatus },
      );
      if (data.success) {
        notify.success(
          `Document ${newStatus === "verified" ? "Verified" : "Rejected"}`,
          `The document has been marked as ${newStatus}.`,
        );
        fetchData();
      }
    } catch (error) {
      notify.error(
        "Update Failed",
        error.response?.data?.message || "Failed to update status.",
      );
      fetchData();
    }
  };

  // const columns = [
  //   {
  //     key: "employee",
  //     label: "Employee",
  //     width: "1.5fr",
  //     align: "left",
  //     render: (_, row) => (
  //       <div className="min-w-0">
  //         <p className="text-sm font-bold text-text-primary truncate">
  //           {row.user?.firstName} {row.user?.lastName}
  //         </p>
  //         <p className="text-xs text-text-secondary font-mono truncate">
  //           {row.user?.employeeId}
  //         </p>
  //       </div>
  //     ),
  //   },
  //   {
  //     key: "document",
  //     label: "Document Info",
  //     width: "2fr",
  //     align: "left",
  //     render: (_, row) => (
  //       <div className="min-w-0">
  //         <p className="text-sm font-medium text-text-primary truncate">
  //           {row.title}
  //         </p>
  //         <p className="text-xs text-text-secondary truncate">
  //           {row.category} • {row.type}
  //         </p>
  //       </div>
  //     ),
  //   },
  //   {
  //     key: "status",
  //     label: "Status",
  //     width: "1fr",
  //     align: "center",
  //     render: (val) => {
  //       let style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  //       if (val === "verified")
  //         style = "bg-green-500/10 text-green-400 border-green-500/30";
  //       else if (val === "rejected")
  //         style = "bg-red-500/10 text-red-400 border-red-500/30";
  //       return (
  //         <span
  //           className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${style}`}
  //         >
  //           {val || "Pending"}
  //         </span>
  //       );
  //     },
  //   },
  //   {
  //     key: "actions",
  //     label: "Actions",
  //     width: "1.2fr", // 🚨 Widened slightly to fit 3 buttons nicely
  //     align: "right",
  //     render: (_, row) => (
  //       <div className="flex justify-end items-center gap-2">
  //         {/* 🚨 NEW FEATURE: View S3 Document Link */}
  //         {row.documentURL && (
  //           <a
  //             href={row.documentURL}
  //             target="_blank"
  //             rel="noopener noreferrer"
  //             onClick={(e) => e.stopPropagation()}
  //             className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-colors"
  //             title="View Document"
  //           >
  //             <ExternalLink size={16} />
  //           </a>
  //         )}

  //         {row.status !== "verified" && (
  //           <button
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               handleUpdateStatus(row._id, "verified");
  //             }}
  //             className="p-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-xl transition-colors"
  //             title="Verify"
  //           >
  //             <Check size={16} />
  //           </button>
  //         )}
  //         {row.status !== "rejected" && (
  //           <button
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               handleUpdateStatus(row._id, "rejected");
  //             }}
  //             className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
  //             title="Reject"
  //           >
  //             <X size={16} />
  //           </button>
  //         )}
  //       </div>
  //     ),
  //   },
  // ];

  // return (
  //   <div className="pt-8 border-t border-card-border w-full">
  //     <div className="mb-6">
  //       <h2 className="text-xl font-bold text-text-primary">
  //         Organization <span className="text-accent">Overview</span>
  //       </h2>
  //       <p className="text-sm text-text-secondary mt-1">
  //         Verify and manage employee compliance records.
  //       </p>
  //     </div>

  //     {/* Stats Grid */}
  //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  //       <StatsCard
  //         icon={Files}
  //         iconBg="bg-blue-500/10"
  //         iconColor="text-blue-400"
  //         value={loading ? "..." : stats.total}
  //         label="Total Documents"
  //       />
  //       <StatsCard
  //         icon={Clock}
  //         iconBg="bg-yellow-500/10"
  //         iconColor="text-yellow-400"
  //         value={loading ? "..." : stats.pending}
  //         label="Pending"
  //       />
  //       <StatsCard
  //         icon={CheckCircle}
  //         iconBg="bg-green-500/10"
  //         iconColor="text-green-400"
  //         value={loading ? "..." : stats.verified}
  //         label="Verified"
  //       />
  //       <StatsCard
  //         icon={XCircle}
  //         iconBg="bg-red-500/10"
  //         iconColor="text-red-400"
  //         value={loading ? "..." : stats.rejected}
  //         label="Rejected"
  //       />
  //     </div>

  //     {/* Enhanced Filter & Search Control Bar */}
  //     <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 bg-card/40 border border-card-border rounded-2xl mb-4">
  //       <div className="flex items-center gap-3 w-full xl:w-auto">
  //         <label className="text-sm font-medium text-text-secondary whitespace-nowrap">
  //           Filter Status:
  //         </label>
  //         <select
  //           value={statusFilter}
  //           onChange={(e) => setStatusFilter(e.target.value)}
  //           className="w-full sm:w-48 bg-input text-text-primary px-4 py-2.5 rounded-xl border border-card-border text-sm outline-none focus:border-btn transition-colors cursor-pointer"
  //         >
  //           <option value="">All Statuses</option>
  //           <option value="pending">Pending</option>
  //           <option value="verified">Verified</option>
  //           <option value="rejected">Rejected</option>
  //         </select>
  //       </div>

  //       <div className="w-full xl:w-112.5 flex justify-end">
  //         <SearchBar
  //           placeholder="Search name or ID..."
  //           value={searchQuery}
  //           onChange={(val) => setSearchQuery(val)}
  //           width="100%"
  //         />
  //       </div>
  //     </div>

  //     {/* Data Table */}
  //     <div className="flex-1">
  //       <DataTable
  //         columns={columns}
  //         data={records}
  //         loading={loading}
  //         paginationMode="server"
  //         page={page}
  //         totalPages={totalPages}
  //         onPageChange={setPage}
  //       />
  //     </div>
  //   </div>
  // );

  const columns = [
  {
    key: "employee",
    label: "Employee",
    width: "1.5fr",
    align: "left",
    render: (_, row) => (
      <div className="min-w-0">
        <p
          className="text-sm font-bold truncate"
          style={{ color: colors.textPrimary }}
        >
          {row.user?.firstName} {row.user?.lastName}
        </p>

        <p
          className="text-xs font-mono truncate"
          style={{ color: colors.textSecondary }}
        >
          {row.user?.employeeId}
        </p>
      </div>
    ),
  },

  {
    key: "document",
    label: "Document Info",
    width: "2fr",
    align: "left",
    render: (_, row) => (
      <div className="min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: colors.textPrimary }}
        >
          {row.title}
        </p>

        <p
          className="text-xs truncate"
          style={{ color: colors.textSecondary }}
        >
          {row.category} • {row.type}
        </p>
      </div>
    ),
  },

  {
    key: "status",
    label: "Status",
    width: "1fr",
    align: "center",
    render: (val) => {
      const status = (val || "pending").toLowerCase();

      let bg = colors.warningLight;
      let text = colors.warning;

      if (status === "verified") {
        bg = colors.successLight;
        text = colors.success;
      } else if (status === "rejected") {
        bg = colors.dangerLight;
        text = colors.danger;
      }

      return (
        <span
          className="text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider"
          style={{
            backgroundColor: bg,
            color: text,
            borderColor: text,
          }}
        >
          {val || "Pending"}
        </span>
      );
    },
  },

  {
    key: "actions",
    label: "Actions",
    width: "1.2fr",
    align: "right",
    render: (_, row) => (
      <div className="flex justify-end items-center gap-2">
        {/* View Document */}
        {row.documentURL && (
          <a
            href={row.documentURL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="View Document"
            className="p-1.5 rounded-xl transition-colors"
            style={{
              backgroundColor: colors.blueLight,
              color: colors.blue,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <ExternalLink size={16} />
          </a>
        )}

        {/* Verify */}
        {row.status !== "verified" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateStatus(row._id, "verified");
            }}
            title="Verify"
            className="p-1.5 rounded-xl transition-colors"
            style={{
              backgroundColor: colors.successLight,
              color: colors.success,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <Check size={16} />
          </button>
        )}

        {/* Reject */}
        {row.status !== "rejected" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateStatus(row._id, "rejected");
            }}
            title="Reject"
            className="p-1.5 rounded-xl transition-colors"
            style={{
              backgroundColor: colors.dangerLight,
              color: colors.danger,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    ),
  },
];


return (
  <div
    className="pt-8 border-t w-full"
    style={{ borderColor: colors.cardBorder }}
  >
    {/* Header */}
    <div className="mb-6">
      <h2
        className="text-xl font-bold"
        style={{ color: colors.textPrimary }}
      >
        Organization{" "}
        <span style={{ color: colors.accent }}>
          Overview
        </span>
      </h2>

      <p
        className="text-sm mt-1"
        style={{ color: colors.textSecondary }}
      >
        Verify and manage employee compliance records.
      </p>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard
        icon={Files}
        iconBg={colors.blueLight}
        iconColor={colors.blue}
        value={loading ? "..." : stats.total}
        label="Total Documents"
      />

      <StatsCard
        icon={Clock}
        iconBg={colors.warningLight}
        iconColor={colors.warning}
        value={loading ? "..." : stats.pending}
        label="Pending"
      />

      <StatsCard
        icon={CheckCircle}
        iconBg={colors.successLight}
        iconColor={colors.success}
        value={loading ? "..." : stats.verified}
        label="Verified"
      />

      <StatsCard
        icon={XCircle}
        iconBg={colors.dangerLight}
        iconColor={colors.danger}
        value={loading ? "..." : stats.rejected}
        label="Rejected"
      />
    </div>

    {/* Filter & Search */}
    <div
      className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 rounded-2xl mb-4 border"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: colors.cardBorder,
      }}
    >
      <div className="flex items-center gap-3 w-full xl:w-auto">
        <label
          className="text-sm font-medium whitespace-nowrap"
          style={{ color: colors.textSecondary }}
        >
          Filter Status:
        </label>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-4 py-2.5 rounded-xl border text-sm outline-none cursor-pointer"
          style={{
            backgroundColor: colors.inputBg,
            color: colors.textPrimary,
            borderColor: colors.cardBorder,
          }}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="w-full xl:w-[450px] flex justify-end">
        <SearchBar
          placeholder="Search name or ID..."
          value={searchQuery}
          onChange={setSearchQuery}
          width="100%"
        />
      </div>
    </div>

    {/* Data Table */}
    <div className="flex-1">
      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        paginationMode="server"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  </div>
);
}
