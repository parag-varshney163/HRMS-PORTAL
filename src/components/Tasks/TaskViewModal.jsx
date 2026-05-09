import React, { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";


export default function TaskViewModal({ open, onClose, taskId }) {
  const [task, setTask] = useState(null);

  useEffect(() => {
    if (!open || !taskId) return;

    axiosInstance.get(`/api/v1/task/${taskId}`).then((res) => {
      if (res.data?.success) setTask(res.data.data);
    });
  }, [open, taskId]);

  if (!open) return null;

  // 🎨 Status Color Mapping
  const statusColor = (status) => {
    switch (status) {
      case "done":
        return colors.success;
      case "in_progress":
        return colors.warning;
      case "under_review":
        return colors.accent;
      default:
        return colors.Blue;
    }
  };

  // 🎨 Priority Color Mapping
  const priorityColor = (priority) => {
    switch (priority) {
      case "high":
        return colors.danger;
      case "medium":
        return colors.warning;
      default:
        return colors.Blue;
    }
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="p-6 rounded-2xl w-full max-w-xl shadow-xl"
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        {/* 🔷 Header */}
        <div className="flex justify-between items-center mb-4">
          <h3
            className="text-lg font-bold"
            style={{ color: colors.textPrimary }}
          >
            Task Details
          </h3>

          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded-md"
            style={{
              background: colors.hover,
              color: colors.textPrimary,
            }}
          >
            ✕
          </button>
        </div>

        {!task ? (
          <p style={{ color: colors.textSecondary }}>Loading...</p>
        ) : (
          <div className="space-y-3 text-sm">

            {/* 🔹 Title */}
            <h2
              className="text-base font-semibold"
              style={{ color: colors.accent }}
            >
              {task.title}
            </h2>

            {/* 🔹 Description */}
            <p style={{ color: colors.textSecondary }}>
              {task.description}
            </p>

            {/* 🔥 Status + Priority */}
            <div className="flex gap-3">
              <span
                className="px-2 py-1 rounded text-xs capitalize"
                style={{
                  background: statusColor(task.status) + "20",
                  color: statusColor(task.status),
                }}
              >
                {task.status.replace("_", " ")}
              </span>

              <span
                className="px-2 py-1 rounded text-xs capitalize"
                style={{
                  background: priorityColor(task.priority) + "20",
                  color: priorityColor(task.priority),
                }}
              >
                {task.priority}
              </span>
            </div>

            {/* 🔹 Info Grid */}
            <div className="grid grid-cols-2 gap-3 mt-3">

              <p style={{ color: colors.textSecondary }}>
                <b style={{ color: colors.textPrimary }}>Team:</b> {task.team || "N/A"}
              </p>

              <p style={{ color: colors.textSecondary }}>
                <b style={{ color: colors.textPrimary }}>Department:</b> {task.department?.name || "N/A"}
              </p>

              <p style={{ color: colors.textSecondary }}>
                <b style={{ color: colors.textPrimary }}>Assigned To:</b>{" "}
                {task.assignTo
                  ? `${task.assignTo.firstName} ${task.assignTo.lastName}`
                  : "Unassigned"}
              </p>

              <p style={{ color: colors.textSecondary }}>
                <b style={{ color: colors.textPrimary }}>Created By:</b>{" "}
                {task.createdBy
                  ? `${task.createdBy.firstName} ${task.createdBy.lastName}`
                  : "N/A"}
              </p>

              <p style={{ color: colors.textSecondary }}>
                <b style={{ color: colors.textPrimary }}>Due Date:</b>{" "}
                {task.due_date
                  ? new Date(task.due_date).toLocaleDateString()
                  : "No Date"}
              </p>

              <p style={{ color: colors.textSecondary }}>
                <b style={{ color: colors.textPrimary }}>Comments:</b>{" "}
                {task.commentsCount || 0}
              </p>
            </div>

            {/* 🔹 Footer Info */}
            <div
              className="mt-4 pt-3 border-t text-xs"
              style={{ borderColor: colors.cardBorder, color: colors.textSecondary }}
            >
              Created At: {new Date(task.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}