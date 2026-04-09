/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import {
  ListTodo,
  PlayCircle,
  Eye,
  CheckSquare,
  Plus,
  Inbox,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import useNotification from "../hooks/useNotification.jsx";

// Components
import StatsCard from "../components/ui/StatsCard";
import SearchBar from "../components/ui/SearchBar";
import Button from "../components/ui/Button";
import TaskCard from "../components/ui/TaskCard";
import TaskModal from "../components/Tasks/TaskModal";

// ─── CONFIGURATION (Keys match API payload perfectly) ───
const COLUMNS_CONFIG = [
  { key: "to_do", label: "To Do", icon: ListTodo },
  { key: "in_progress", label: "In Progress", icon: PlayCircle },
  { key: "under_review", label: "Under Review", icon: Eye },
  { key: "done", label: "Done", icon: CheckSquare },
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
        tasksRes = await axiosInstance.get("/api/v1/task/status-wise");
        if (tasksRes.data?.success && tasksRes.data.data) {
          const d = tasksRes.data.data;
          setBoardData({
            to_do: d.to_do?.tasks || [],
            in_progress: d.in_progress?.tasks || [],
            under_review: d.under_review?.tasks || [],
            done: d.done?.tasks || [],
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

  return (
    <div className="py-2 pb-6 flex flex-col w-full">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            Task <span className="text-accent">Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Organize and track your team's work.
          </p>
        </div>
        <Button
          variant="custom"
          bg="#3B82F6"
          text="#FFFFFF"
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

      {/* ─── STATS GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          icon={ListTodo}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          label="Total Tasks"
          value={loading ? "..." : stats.totalTasks || 0}
        />
        <StatsCard
          icon={PlayCircle}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-400"
          label="In Progress"
          value={loading ? "..." : stats.inProgress || 0}
        />
        <StatsCard
          icon={CheckSquare}
          iconBg="bg-green-500/10"
          iconColor="text-green-400"
          label="Completed"
          value={loading ? "..." : stats.completed || 0}
        />
        <StatsCard
          icon={Eye}
          iconBg="bg-red-500/10"
          iconColor="text-red-400"
          label="Overdue"
          value={loading ? "..." : stats.overdue || 0}
        />
      </div>

      {/* ─── SEARCH BAR ─── */}
      <div className="bg-card border border-card-border rounded-xl p-4 mb-6">
        <SearchBar
          placeholder="Search tasks by title, tag..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* ─── KANBAN BOARD ─── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20 text-text-secondary animate-pulse">
          Loading tasks...
        </div>
      ) : isBoardEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-card border border-dashed border-card-border rounded-2xl text-text-secondary">
          <Inbox size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-bold text-text-primary">No tasks found</p>
          <p className="text-sm mt-1 mb-6">Create a new task to get started.</p>
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            icon={Plus}
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
                className="flex flex-col gap-4 bg-input/20 p-3 rounded-2xl border border-card-border/50 min-h-[300px]"
              >
                <div className="flex items-center gap-2 text-text-secondary mb-1 px-1">
                  <ColIcon size={18} />
                  <h3 className="font-semibold text-sm text-text-primary">
                    {col.label}
                  </h3>
                  <span className="text-xs bg-btn/10 text-btn px-2 py-0.5 rounded-full ml-auto">
                    {columnTasks.length || 0}
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
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-card-border rounded-xl flex items-center justify-center text-xs text-text-secondary bg-card/30">
                      No data found
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL ─── */}
      <TaskModal
        key={
          isModalOpen ? (editingTask ? editingTask._id : "create") : "closed"
        }
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
      />
    </div>
  );
}
