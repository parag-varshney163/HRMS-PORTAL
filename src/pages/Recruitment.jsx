import { Plus, Users, UserCheck, Clock, XCircle, Edit2, Trash2, Eye, X, } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

import CandidateModal from "../components/Recruitment/CandidateModal";
import useNotification from "../hooks/useNotification.jsx";
import StatsCard from "../components/ui/StatsCard";
import SearchBar from "../components/ui/SearchBar";
import DataTable from "../components/ui/DataTable";
import axiosInstance from "../api/axiosInstance";
// Components
import Button from "../components/ui/Button";


const Recruitment = () => {
  // ─── STATE ───
  const [stats, setStats] = useState({
    totalCandidates: 0,
    inProcess: 0,
    selected: 0,
    rejected: 0,
  });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const notify = useNotification();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState(null);

  // ─── DEBOUNCED SEARCH ───
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ─── FETCH DATA ───
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.allSettled([
        axiosInstance.get("/api/v1/recruitment/stats"),
        axiosInstance.get(
          `/api/v1/recruitment/filters?page=${page}&limit=10&search=${debouncedSearch}`,
        ),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      }

      if (listRes.status === "fulfilled" && listRes.value.data.success) {
        setCandidates(listRes.value.data.data.candidates);
        setTotalPages(listRes.value.data.data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch recruitment data:", error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── ACTIONS ───
  const handleSaveCandidate = async (formData) => {
    try {
      let response;
      if (editingCandidate) {
        // PUT request for edit
        response = await axiosInstance.put(
          `/api/v1/recruitment/${editingCandidate._id}`,
          formData,
        );
      } else {
        // POST request for new
        response = await axiosInstance.post("/api/v1/recruitment", formData);
      }

      if (response.data.success) {
        notify.success(
          editingCandidate ? "Candidate Updated" : "Candidate Added",
          editingCandidate ? "Candidate details updated successfully." : "New candidate added to pipeline."
        );
        setModalOpen(false);
        setEditingCandidate(null);
        fetchData();
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Operation failed",
      };
    }
  };
  const handleViewCandidate = async (id) => {
    try {
      setViewLoading(true);
      setViewModalOpen(true);

      const response = await axiosInstance.get(
        `/api/v1/recruitment/view/${id}`
      );

      if (response.data.success) {
        setCandidateDetails(response.data.data.candidate);
      }
    } catch (error) {
      console.error(error);

      notify.error(
        "Failed",
        "Unable to fetch candidate details"
      );

      setViewModalOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}'s profile?`))
      return;
    try {
      // Assuming standard DELETE endpoint
      const { data } = await axiosInstance.delete(`/api/v1/recruitment/${id}`);
      if (data.success) {
        notify.success("Candidate Removed", `${name}'s profile has been deleted.`);
        fetchData();
      }
    } catch (error) {
      notify.error("Delete Failed", "Failed to delete the candidate.");
    }
  };

  // ─── TABLE COLUMNS CONFIGURATION ───
  // ─── TABLE COLUMNS CONFIGURATION ───
  const columns = [
    {
      key: "candidate",
      label: "Candidate",
      width: "2fr", // Reduced slightly to make room for progress
      align: "left",
      render: (_, row) => (
        <div className="min-w-0 overflow-hidden">
          <p className="text-sm font-bold text-text-primary truncate">
            {row.fullName}
          </p>
          <p className="text-xs text-text-secondary truncate">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role & Experience",
      width: "1.5fr",
      align: "left",
      render: (_, row) => (
        <div className="min-w-0 overflow-hidden">
          <p className="text-sm font-medium text-text-primary truncate">
            {row.positionApplied}
          </p>
          <p className="text-xs text-text-secondary">{row.experience} Years</p>
        </div>
      ),
    },
    {
      key: "progress",
      label: "Interview Progress",
      width: "2fr", // New wider column for the visual timeline
      align: "left",
      render: (_, row) => {
        // Fallback if timeline doesn't exist yet
        if (!row.interviewTimeline || row.interviewTimeline.length === 0) {
          return (
            <span className="text-xs text-text-secondary">No timeline</span>
          );
        }

        // Find the current active stage (first one that is "Pending" or "In Progress")
        const currentStageIndex = row.interviewTimeline.findIndex(
          (stage) =>
            stage.status?.toLowerCase() === "pending" ||
            stage.status?.toLowerCase() === "in progress",
        );

        // If all are done, index is -1. Default to showing the first stage if something goes wrong.
        const activeIndex =
          currentStageIndex === -1
            ? row.interviewTimeline.length - 1
            : currentStageIndex;
        const currentStageName =
          row.interviewTimeline[activeIndex]?.stageName || "Unknown Stage";

        return (
          <div className="flex flex-col gap-1.5 w-full pr-4">
            <p className="text-xs font-semibold text-text-primary truncate">
              {currentStageName}
            </p>
            {/* Visual Dot Tracker */}
            <div className="flex items-center gap-1">
              {row.interviewTimeline.map((stage, idx) => {
                // Determine color based on position relative to current active stage
                let dotColor = "bg-card-border"; // Default / Future stages
                if (idx < activeIndex) dotColor = "bg-green-500"; // Passed
                if (idx === activeIndex) dotColor = "bg-blue-500"; // Current
                if (row.status === "rejected" && idx === activeIndex)
                  dotColor = "bg-red-500"; // Failed

                return (
                  <div
                    key={idx}
                    title={stage.stageName}
                    className={`h-1.5 flex-1 rounded-full ${dotColor}`}
                  />
                );
              })}
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Overall Status",
      width: "1.2fr",
      align: "center",
      render: (val) => {
        let style = "bg-gray-500/10 text-gray-400 border-gray-500/20";
        if (val === "selected")
          style = "bg-green-500/10 text-green-400 border-green-500/30";
        else if (val === "rejected")
          style = "bg-red-500/10 text-red-400 border-red-500/30";
        else if (val === "screening" || val === "interview")
          style = "bg-blue-500/10 text-blue-400 border-blue-500/30";

        return (
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${style}`}
          >
            {val || "Pending"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "0.8fr",
      align: "right",
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewCandidate(row._id);
            }}
            className="p-1.5 text-text-secondary hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-colors"
            title="View Candidate"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingCandidate(row);
              setModalOpen(true);
            }}
            className="p-1.5 text-text-secondary hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
            title="Edit Candidate"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id, row.fullName);
            }}
            className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            title="Delete Candidate"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="py-2 pb-6 w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Recruitment <span className="text-accent">Pipeline</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage candidates and track interview stages.
          </p>
        </div>
        <Button
          variant="custom"
          bg="#3B82F6"
          text="#FFF"
          icon={Plus}
          size="sm"
          onClick={() => {
            setEditingCandidate(null);
            setModalOpen(true);
          }}
        >
          Add Candidate
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={Users}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          value={loading ? "..." : stats.totalCandidates}
          label="Total Candidates"
        />
        <StatsCard
          icon={Clock}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-400"
          value={loading ? "..." : stats.inProcess}
          label="In Process"
        />
        <StatsCard
          icon={UserCheck}
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
          value={loading ? "..." : stats.selected}
          label="Selected"
        />
        <StatsCard
          icon={XCircle}
          iconBg="bg-red-500/10"
          iconColor="text-red-400"
          value={loading ? "..." : stats.rejected}
          label="Rejected"
        />
      </div>

      {/* List Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-text-primary">Candidates Data</h3>
        {/* <div className="w-full sm:w-64">
          <SearchBar
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div> */}
      </div>

      {/* Data Table */}
      <div className="flex-1 -mt-4">
        <DataTable
          columns={columns}
          data={candidates}
          loading={loading}
          paginationMode="server"
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Modal */}
      <CandidateModal
        key={
          isModalOpen
            ? editingCandidate
              ? editingCandidate._id
              : "create"
            : "closed"
        }
        open={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCandidate(null);
        }}
        onSave={handleSaveCandidate}
        initialData={editingCandidate}
      />
      {viewModalOpen && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl rounded-3xl border border-card-border bg-primary overflow-hidden">

            <div className="flex items-center justify-between px-6 py-5 border-b border-card-border">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  Candidate Details
                </h2>

                <p className="text-sm text-text-secondary mt-1">
                  Complete recruitment profile information
                </p>
              </div>

              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setCandidateDetails(null);
                }}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={22} className="text-text-secondary" />
              </button>
            </div>

            <div className="p-6 max-h-[85vh] overflow-y-auto">
              {viewLoading ? (
                <div className="text-center py-20 text-text-secondary">
                  Loading candidate details...
                </div>
              ) : candidateDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Full Name
                    </p>

                    <p className="text-sm font-semibold text-text-primary">
                      {candidateDetails.fullName || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Email
                    </p>

                    <p className="text-sm font-semibold text-text-primary">
                      {candidateDetails.email || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Phone Number
                    </p>

                    <p className="text-sm font-semibold text-text-primary">
                      {candidateDetails.phoneNumber || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Position Applied
                    </p>

                    <p className="text-sm font-semibold text-text-primary">
                      {candidateDetails.positionApplied || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Current Company
                    </p>

                    <p className="text-sm font-semibold text-text-primary">
                      {candidateDetails.currentCompany || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Experience
                    </p>

                    <p className="text-sm font-semibold text-text-primary">
                      {candidateDetails.experience || "-"} Years
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Employment Type
                    </p>

                    <p className="text-sm font-semibold text-text-primary">
                      {candidateDetails.employmentType || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Notice Period
                    </p>

                    <p className="text-sm font-semibold text-text-primary">
                      {candidateDetails.noticePeriod || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Current Salary
                    </p>

                    <p className="text-sm font-semibold text-text-primary">
                      ₹ {candidateDetails.currentSalary || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-secondary mb-1">
                      Expected Salary
                    </p>

                    <p className="text-sm font-semibold text-text-primary">
                      ₹ {candidateDetails.expectedSalary || "-"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-text-secondary mb-2">
                      Skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {candidateDetails.skills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-text-secondary mb-2">
                      Interview Timeline
                    </p>

                    <div className="space-y-3">
                      {candidateDetails.interviewTimeline?.map((stage, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-card-border bg-secondary"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-text-primary">
                              {stage.stageName}
                            </p>

                            <span className="text-xs px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400">
                              {stage.status}
                            </span>
                          </div>

                          <p className="text-sm text-text-secondary">
                            {stage.remarks || "No remarks"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-text-secondary mb-1">
                      HR Remarks
                    </p>

                    <div className="p-4 rounded-2xl border border-card-border bg-secondary text-sm text-text-primary">
                      {candidateDetails.hrRemarks || "No remarks available"}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;
