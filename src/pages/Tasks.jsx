import { ListTodo, PlayCircle, Eye, CheckSquare, Plus, Inbox, } from "lucide-react";
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";

import OtherEmployeesTasks from "../components/Tasks/OtherEmployeesTasks.jsx";
import TaskViewModal from "../components/Tasks/TaskViewModal.jsx";
import CommentsModal from "../components/Tasks/CommentsModal.jsx";
import useNotification from "../hooks/useNotification.jsx";
import TaskModal from "../components/Tasks/TaskModal";
// Components
import StatsCard from "../components/ui/StatsCard";
import SearchBar from "../components/ui/SearchBar";
import TaskCard from "../components/ui/TaskCard";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/ui/Button";
import colors from "../constants/colors.js";


const COLUMNS_CONFIG = [
  {
    key: "to_do",
    label: "To Do",
    icon: ListTodo,
    color: colors.blue,
  },
  {
    key: "in_progress",
    label: "In Progress",
    icon: PlayCircle,
    color: colors.danger,
  },
  {
    key: "under_review",
    label: "Under Review",
    icon: Eye,
    color: colors.danger,
  },
  {
    key: "done",
    label: "Done",
    icon: CheckSquare,
    color: colors.success,
  },
];

export default function Tasks() {
  const notify = useNotification();

  // ─── STATE ───
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
  });
  const [boardData, setBoardData] = useState({
    to_do: [],
    in_progress: [],
    under_review: [],
    done: [],
  });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewTaskId, setViewTaskId] = useState(null);

  // ─── DEBOUNCE SEARCH ───
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // ─── FETCH DATA ORCHESTRATOR ───
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Summary Stats
      axiosInstance
        .get("/api/v1/task/summary")
        .then((res) => {
          if (res.data?.success) {
            setStats(
              res.data.data || {
                totalTasks: 0,
                inProgress: 0,
                completed: 0,
                overdue: 0,
              },
            );
          }
        })
        .catch((e) => console.warn("Stats API failed", e));

      // 2. Fetch Board Data
      let tasksRes;
      if (debouncedSearch.trim() !== "") {
        // Search API (Returns flat array)
        tasksRes = await axiosInstance.get(
          `/api/v1/task/search?search=${debouncedSearch}`,
        );
        if (tasksRes.data?.success && Array.isArray(tasksRes.data.data)) {
          const grouped = {
            to_do: [],
            in_progress: [],
            under_review: [],
            done: [],
          };
          tasksRes.data.data.forEach((task) => {
            if (grouped[task.status]) grouped[task.status].push(task);
          });
          setBoardData(grouped);
        } else {
          setBoardData({
            to_do: [],
            in_progress: [],
            under_review: [],
            done: [],
          });
        }
      } else {
        // Status-Wise API (Returns grouped object)
        // tasksRes = await axiosInstance.get("/api/v1/task/status-wise");
        // if (tasksRes.data?.success && tasksRes.data.data) {
        //   const d = tasksRes.data.data;
        //   setBoardData({
        //     to_do: d.to_do?.tasks || [],
        //     in_progress: d.in_progress?.tasks || [],
        //     under_review: d.under_review?.tasks || [],
        //     done: d.done?.tasks || [],
        //   });
        // }
        tasksRes = await axiosInstance.get("/api/v1/task");

        if (tasksRes.data?.success && tasksRes.data?.data?.tasks) {
          const tasks = tasksRes.data.data.tasks;

          const grouped = {
            to_do: [],
            in_progress: [],
            under_review: [],
            done: [],
          };

          tasks.forEach((task) => {
            if (grouped[task.status]) {
              grouped[task.status].push(task);
            }
          });

          setBoardData(grouped);
        } else {
          setBoardData({
            to_do: [],
            in_progress: [],
            under_review: [],
            done: [],
          });
        }
      }
    } catch (error) {
      console.error("Board API Failed:", error);
      setBoardData({ to_do: [], in_progress: [], under_review: [], done: [] });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ─── ACTIONS (CREATE / UPDATE / DELETE) ───
  const handleSaveTask = async (formData, taskId) => {
    try {
      let response;
      if (taskId) {
        response = await axiosInstance.put(`/api/v1/task/${taskId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await axiosInstance.post("/api/v1/task", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (response.data?.success) {
        notify.success(
          taskId ? "Task Updated" : "Task Created",
          "The board has been updated.",
        );
        fetchDashboardData();
        return { success: true };
      }
    } catch (error) {
      notify.error(
        "Action Failed",
        error.response?.data?.message || "Could not save task.",
      );
      return { success: false };
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const { data } = await axiosInstance.delete(`/api/v1/task/${taskId}`);
      if (data?.success) {
        notify.success("Deleted", "Task has been removed.");
        fetchDashboardData();
      }
    } catch (error) {
      notify.error("Delete Failed", "Unable to remove the task.");
    }
  };

  const isBoardEmpty = Object.values(boardData).every(
    (arr) => arr.length === 0,
  );
  const roleName = localStorage.getItem("roleName");
const isEmployee = roleName === "employee";

  return (
    <div className="py-2 pb-6 flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-black">
            Task <span className="text-accent">Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Organize and track your team's work.
          </p>
        </div>

        <Button
          variant="custom"
          bg={colors.blue}
          text={colors.cardBg}
          size="sm"
          icon={Plus}
          className="rounded-xl py-2.5 px-4 w-full sm:w-auto justify-center"
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
        >
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={ListTodo}
          iconBg={colors.blueLight}
          iconColor={colors.blue}
          label="Total Tasks"
          value={loading ? "..." : stats.totalTasks || 0}
        />

        <StatsCard
          icon={PlayCircle}
          iconBg={colors.warningLight}
          iconColor={colors.warning}
          label="In Progress"
          value={loading ? "..." : stats.inProgress || 0}
        />

        <StatsCard
          icon={CheckSquare}
          iconBg={colors.successLight}
          iconColor={colors.success}
          label="Completed"
          value={loading ? "..." : stats.completed || 0}
        />

        <StatsCard
          icon={Eye}
          iconBg={colors.dangerLight}
          iconColor={colors.danger}
          label="Overdue"
          value={loading ? "..." : stats.overdue || 0}
        />
      </div>

      <OtherEmployeesTasks />
      <div
        className="rounded-xl p-4 mb-6 shadow-sm"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <SearchBar
          placeholder="Search tasks by title, tag..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Board */}
      {loading ? (
        <div
          className="flex-1 flex items-center justify-center py-20 animate-pulse"
          style={{ color: colors.textSecondary }}
        >
          Loading tasks...
        </div>
      ) : isBoardEmpty ? (
        <div
          className="flex-1 flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{
            background: colors.cardBg,
            border: `2px dashed ${colors.cardBorder}`,
            color: colors.textSecondary,
          }}
        >
          <Inbox
            size={48}
            className="mb-4"
            style={{
              color: colors.textMuted,
              opacity: 0.5,
            }}
          />

          <p
            className="text-lg font-bold"
            style={{ color: colors.textPrimary }}
          >
            No tasks found
          </p>

          <p
            className="text-sm mt-1 mb-6"
            style={{ color: colors.textSecondary }}
          >
            Create a new task to get started.
          </p>

          <Button
            bg={colors.blue}
            text={colors.cardBg}
            icon={Plus}
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
          >
            Create Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pb-4 items-start">
          {COLUMNS_CONFIG.map((col) => {
            const columnTasks = boardData[col.key] || [];
            const ColIcon = col.icon;

            return (
              <div
                key={col.key}
                className="flex flex-col gap-4 p-3 rounded-2xl min-h-[300px]"
                style={{
                  background: colors.inputBg,
                  border: `1px solid ${colors.cardBorder}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <ColIcon
                    size={18}
                    style={{ color: col.color }}
                  />

                  <h3
                    className="font-bold text-sm"
                    style={{ color: col.color }}
                  >
                    {col.label}
                  </h3>

                  <span
                    className="text-xs px-2 py-0.5 rounded-full ml-auto font-medium"
                    style={{
                      backgroundColor: `${col.color}20`,
                      color: col.color,
                    }}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 h-full">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={() => {
                        setEditingTask(task);
                        setIsModalOpen(true);
                      }}
                      onDelete={() => handleDeleteTask(task._id)}
                      onCommentClick={(task) => {
                        setSelectedTask(task);
                        setIsCommentModalOpen(true);
                      }}
                      onView={() => {
                        setViewTaskId(task._id);
                        setIsViewModalOpen(true);
                      }}
                      isEmployee={isEmployee}
                    />
                  ))}

                  {columnTasks.length === 0 && (
                    <div
                      className="h-24 rounded-xl flex items-center justify-center text-xs"
                      style={{
                        background: colors.cardBg,
                        border: `2px dashed ${colors.cardBorder}`,
                        color: colors.textSecondary,
                      }}
                    >
                      No data found
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <TaskModal
        key={
          isModalOpen
            ? editingTask
              ? editingTask._id
              : "create"
            : "closed"
        }
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        isEmployee={isEmployee}
      />

      <CommentsModal
        open={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        task={selectedTask}
      />

      <TaskViewModal
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        taskId={viewTaskId}
      />
    </div>
  );
}
