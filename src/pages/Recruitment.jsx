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
import colors from "../constants/colors.js";


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

  const closeViewModal = () => {
    setViewModalOpen(false);
    setCandidateDetails(null);
  };

  const getStatusStyle = (status) => {
    const value = status?.toLowerCase();

    if (value === "selected") {
      return {
        backgroundColor: colors.successLight,
        color: colors.success,
        borderColor: colors.success,
      };
    }

    if (value === "rejected") {
      return {
        backgroundColor: colors.dangerLight,
        color: colors.danger,
        borderColor: colors.danger,
      };
    }

    if (value === "screening" || value === "interview") {
      return {
        backgroundColor: colors.blueLight,
        color: colors.blue,
        borderColor: colors.blue,
      };
    }

    return {
      backgroundColor: colors.warningLight,
      color: colors.warning,
      borderColor: colors.warning,
    };
  };

  const getTimelineStatusStyle = (status) => {
    const value = status?.toLowerCase();

    if (
      value === "completed" ||
      value === "selected" ||
      value === "passed"
    ) {
      return {
        backgroundColor: colors.successLight,
        color: colors.success,
      };
    }

    if (value === "rejected" || value === "failed") {
      return {
        backgroundColor: colors.dangerLight,
        color: colors.danger,
      };
    }

    if (value === "in progress" || value === "interview") {
      return {
        backgroundColor: colors.blueLight,
        color: colors.blue,
      };
    }

    return {
      backgroundColor: colors.warningLight,
      color: colors.warning,
    };
  };

  const DetailItem = ({ label, value }) => (
    <div>
      <p
        className="text-xs mb-1"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </p>

      <p
        className="text-sm font-semibold"
        style={{ color: colors.textPrimary }}
      >
        {value || "-"}
      </p>
    </div>
  );

  const columns = [
    {
      key: "candidate",
      label: "Candidate",
      width: "2fr",
      align: "left",
      render: (_, row) => (
        <div className="min-w-0 overflow-hidden">
          <p
            className="text-sm font-bold truncate"
            style={{ color: colors.textPrimary }}
          >
            {row.fullName}
          </p>

          <p
            className="text-xs truncate"
            style={{ color: colors.textSecondary }}
          >
            {row.email}
          </p>
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
          <p
            className="text-sm font-medium truncate"
            style={{ color: colors.textPrimary }}
          >
            {row.positionApplied}
          </p>

          <p
            className="text-xs"
            style={{ color: colors.textSecondary }}
          >
            {row.experience || 0} Years
          </p>
        </div>
      ),
    },
    // {
    //   key: "progress",
    //   label: "Interview Progress",
    //   width: "2fr",
    //   align: "left",
    //   render: (_, row) => {
    //     if (!row.interviewTimeline?.length) {
    //       return (
    //         <span
    //           className="text-xs"
    //           style={{ color: colors.textSecondary }}
    //         >
    //           No timeline
    //         </span>
    //       );
    //     }

    //     const currentStageIndex = row.interviewTimeline.findIndex(
    //       (stage) =>
    //         stage.status?.toLowerCase() === "pending" ||
    //         stage.status?.toLowerCase() === "in progress",
    //     );

    //     const activeIndex =
    //       currentStageIndex === -1
    //         ? row.interviewTimeline.length - 1
    //         : currentStageIndex;

    //     const currentStageName =
    //       row.interviewTimeline[activeIndex]?.stageName || "Unknown Stage";

    //     return (
    //       <div className="flex flex-col gap-1.5 w-full pr-4">
    //         <p
    //           className="text-xs font-semibold truncate"
    //           style={{ color: colors.textPrimary }}
    //         >
    //           {currentStageName}
    //         </p>

    //         <div className="flex items-center gap-1">
    //           {row.interviewTimeline.map((stage, idx) => {
    //             let dotColor = colors.cardBorder;

    //             if (idx < activeIndex) dotColor = colors.success;
    //             if (idx === activeIndex) dotColor = colors.blue;

    //             if (
    //               row.status?.toLowerCase() === "rejected" &&
    //               idx === activeIndex
    //             ) {
    //               dotColor = colors.danger;
    //             }

    //             return (
    //               <div
    //                 key={idx}
    //                 title={stage.stageName}
    //                 className="h-1.5 flex-1 rounded-full"
    //                 style={{ backgroundColor: dotColor }}
    //               />
    //             );
    //           })}
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    {
      key: "progress",
      label: "Interview Progress",
      width: "2fr",
      render: (_, row) => {

        const timeline = row.interviewTimeline || [];

        if (!timeline.length) {
          return (
            <span
              className="text-xs"
              style={{ color: colors.textSecondary }}
            >
              No Timeline
            </span>
          );
        }

        let completedCount = timeline.filter(
          s => s.status === "Completed"
        ).length;

        // Candidate selected -> force complete
        if (row.status === "selected") {
          completedCount = timeline.length;
        }

        const percentage =
          (completedCount / timeline.length) * 100;

        let currentStage =
          timeline.find(s => s.status === "In Progress") ||
          timeline.find(s => s.status === "Pending");

        if (!currentStage) {
          currentStage = timeline[timeline.length - 1];
        }

        return (
          <div className="w-full">

            <div className="flex justify-between mb-1">

              <span
                className="text-xs font-semibold"
                style={{ color: colors.textPrimary }}
              >
                {row.status === "selected"
                  ? "Completed"
                  : row.status === "rejected"
                    ? "Rejected"
                    : currentStage.stageName}
              </span>

              <span
                className="text-xs"
                style={{ color: colors.textSecondary }}
              >
                {completedCount}/{timeline.length}
              </span>

            </div>

            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: colors.cardBorder }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  background:
                    row.status === "selected"
                      ? colors.success
                      : row.status === "rejected"
                        ? colors.danger
                        : colors.blue,
                }}
              />
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
        const statusStyle = getStatusStyle(val);

        return (
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider"
            style={statusStyle}
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
            className="p-1.5 rounded transition-colors"
            style={{ color: colors.blue }}
            title="View Candidate"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.blueLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Eye size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingCandidate(row);
              setModalOpen(true);
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: colors.warning }}
            title="Edit Candidate"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.warningLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Edit2 size={16} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id, row.fullName);
            }}
            className="p-1.5 rounded transition-colors"
            style={{ color: colors.danger }}
            title="Delete Candidate"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.dangerLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];
  return (
    <div
      className="py-2 pb-6 w-full h-full flex flex-col"
      style={{ background: colors.pageGradient }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Recruitment{" "}
            <span style={{ color: colors.accent }}>Pipeline</span>
          </h2>

          <p
            className="text-sm mt-1"
            style={{ color: colors.textSecondary }}
          >
            Manage candidates and track interview stages.
          </p>
        </div>

        <Button
          variant="custom"
          bg={colors.buttonBg}
          text={colors.textPrimary}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          icon={Users}
          iconBg={colors.blueLight}
          iconColor={colors.blue}
          value={loading ? "..." : stats.totalCandidates}
          label="Total Candidates"
        />

        <StatsCard
          icon={Clock}
          iconBg={colors.warningLight}
          iconColor={colors.warning}
          value={loading ? "..." : stats.inProcess}
          label="In Process"
        />

        <StatsCard
          icon={UserCheck}
          iconBg={colors.successLight}
          iconColor={colors.success}
          value={loading ? "..." : stats.selected}
          label="Selected"
        />

        <StatsCard
          icon={XCircle}
          iconBg={colors.dangerLight}
          iconColor={colors.danger}
          value={loading ? "..." : stats.rejected}
          label="Rejected"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <h3
          className="text-lg font-bold"
          style={{ color: colors.textPrimary }}
        >
          Candidates Data
        </h3>

        <div className="w-full sm:w-72">
          <SearchBar
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(value) => setSearchQuery(value)}
          />
        </div>
      </div>

      <div className="flex-1">
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
        <div
          className="fixed inset-0 z-[999] backdrop-blur-sm flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(31, 41, 55, 0.55)" }}
          onClick={closeViewModal}
        >
          <div
            className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl"
            style={{
              backgroundColor: colors.primary,
              border: `1px solid ${colors.cardBorder}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: `1px solid ${colors.cardBorder}` }}
            >
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  Candidate Details
                </h2>

                <p
                  className="text-sm mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  Complete recruitment profile information
                </p>
              </div>

              <button
                type="button"
                onClick={closeViewModal}
                className="p-2 rounded-xl transition-colors"
                style={{ color: colors.textSecondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.inputBg;
                  e.currentTarget.style.color = colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = colors.textSecondary;
                }}
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 max-h-[85vh] overflow-y-auto">
              {viewLoading ? (
                <div
                  className="text-center py-20"
                  style={{ color: colors.textSecondary }}
                >
                  Loading candidate details...
                </div>
              ) : candidateDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem
                    label="Full Name"
                    value={candidateDetails.fullName}
                  />
                  <DetailItem label="Email" value={candidateDetails.email} />
                  <DetailItem
                    label="Phone Number"
                    value={candidateDetails.phoneNumber}
                  />
                  <DetailItem
                    label="Position Applied"
                    value={candidateDetails.positionApplied}
                  />
                  <DetailItem
                    label="Current Company"
                    value={candidateDetails.currentCompany}
                  />
                  <DetailItem
                    label="Experience"
                    value={
                      candidateDetails.experience
                        ? `${candidateDetails.experience} Years`
                        : "-"
                    }
                  />
                  <DetailItem
                    label="Employment Type"
                    value={candidateDetails.employmentType}
                  />
                  <DetailItem
                    label="Notice Period"
                    value={candidateDetails.noticePeriod}
                  />
                  <DetailItem
                    label="Current Salary"
                    value={
                      candidateDetails.currentSalary
                        ? `₹ ${candidateDetails.currentSalary}`
                        : "-"
                    }
                  />
                  <DetailItem
                    label="Expected Salary"
                    value={
                      candidateDetails.expectedSalary
                        ? `₹ ${candidateDetails.expectedSalary}`
                        : "-"
                    }
                  />

                  <div className="md:col-span-2">
                    <p
                      className="text-xs mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Skills
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {candidateDetails.skills?.length ? (
                        candidateDetails.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg text-xs font-medium"
                            style={{
                              backgroundColor: colors.blueLight,
                              color: colors.blue,
                            }}
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span
                          className="text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          No skills available
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <p
                      className="text-xs mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Interview Timeline
                    </p>

                    <div className="space-y-3">
                      {candidateDetails.interviewTimeline?.length ? (
                        candidateDetails.interviewTimeline.map((stage, idx) => {
                          const stageStyle = getTimelineStatusStyle(
                            stage.status,
                          );

                          return (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl"
                              style={{
                                backgroundColor: colors.secondary,
                                border: `1px solid ${colors.cardBorder}`,
                              }}
                            >
                              <div className="flex items-center justify-between mb-2 gap-3">
                                <p
                                  className="font-semibold"
                                  style={{ color: colors.textPrimary }}
                                >
                                  {stage.stageName}
                                </p>

                                <span
                                  className="text-xs px-2 py-1 rounded-lg capitalize"
                                  style={stageStyle}
                                >
                                  {stage.status || "Pending"}
                                </span>
                              </div>

                              <p
                                className="text-sm"
                                style={{ color: colors.textSecondary }}
                              >
                                {stage.remarks || "No remarks"}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          className="p-4 rounded-xl text-sm"
                          style={{
                            backgroundColor: colors.secondary,
                            color: colors.textSecondary,
                            border: `1px solid ${colors.cardBorder}`,
                          }}
                        >
                          No interview timeline available.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <p
                      className="text-xs mb-1"
                      style={{ color: colors.textSecondary }}
                    >
                      HR Remarks
                    </p>

                    <div
                      className="p-4 rounded-2xl text-sm"
                      style={{
                        backgroundColor: colors.secondary,
                        color: colors.textPrimary,
                        border: `1px solid ${colors.cardBorder}`,
                      }}
                    >
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
