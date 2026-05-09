import { Calendar, MessageSquare, Paperclip, Edit2, Trash2, Eye, } from "lucide-react";
import React from "react";


export default function TaskCard({ task, onEdit, onDelete, onCommentClick, onView }) {
  // ─── 1. SAFE DATA FALLBACKS ───
  const title = task?.title || "Untitled Task";
  const description = task?.description || "No description provided.";

  // Handle assigned user gracefully if it is null
  const assigneeName = task?.assignTo?.firstName
    ? `${task.assignTo.firstName} ${task.assignTo.lastName || ""}`.trim()
    : "Unassigned";

  // Handle dates safely
  const dueDate = task?.due_date
    ? new Date(task.due_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    : "No Date";

  // Handle numerical fallbacks safely (0 if null)
  const attachmentCount = task?.attachments ? 1 : 0;
  const commentCount = task?.commentsCount || 0;

  // Priority styling
  const priority = (task?.priority || "medium").toLowerCase();
  let priorityStyle = "bg-yellow-500/10 text-yellow-500"; // Medium default
  if (priority === "high") priorityStyle = "bg-red-500/10 text-red-500";
  if (priority === "low") priorityStyle = "bg-green-500/10 text-green-500";

  return (
    <div className="bg-card border border-card-border rounded-xl p-4 hover:border-btn/50 transition-colors flex flex-col relative">
      {/* ─── HEADER ROW: Labels & Actions ─── */}
      <div className="flex items-start justify-between mb-3">
        {/* Left: Labels */}
        <div className="flex flex-wrap items-center gap-2 pr-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${priorityStyle}`}
          >
            {priority}
          </span>
          {task?.team && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-input text-text-secondary uppercase tracking-wider truncate max-w-[100px]">
              {task.team}
            </span>
          )}
        </div>

        {/* Right: ALWAYS VISIBLE Edit & Delete Buttons */}
        <div className="flex items-center gap-1 shrink-0 bg-card border border-card-border/50 rounded-lg p-0.5 shadow-sm">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView?.(task);
            }}
            className="p-1.5 text-text-secondary hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors"
            title="View Task"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1.5 text-text-secondary hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
            title="Edit Task"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete?.();
            }}
            className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
            title="Delete Task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ─── TITLE & DESC ─── */}
      <h4 className="text-sm font-bold text-text-primary mb-1 line-clamp-1">
        {title}
      </h4>
      <p className="text-xs text-text-secondary line-clamp-2 mb-4 min-h-[32px]">
        {description}
      </p>

      {/* ─── FOOTER INFO ─── */}
      <div className="flex items-center justify-between pt-3 border-t border-card-border/50 mt-auto">
        {/* Assignee Avatar / Name */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-btn/20 text-btn flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
            {assigneeName !== "Unassigned" ? assigneeName.charAt(0) : "?"}
          </div>
          <span className="text-xs font-medium text-text-primary truncate max-w-[80px]">
            {assigneeName}
          </span>
        </div>

        {/* Metrics (Safely defaults to 0) */}
        <div className="flex items-center gap-3 text-text-secondary">
          <div className="flex items-center gap-1 text-xs" title="Due Date">
            <Calendar size={12} />
            <span
              className={
                new Date(task?.due_date) < new Date()
                  ? "text-red-400 font-semibold"
                  : ""
              }
            >
              {dueDate}
            </span>
          </div>
          {/* <div className="flex items-center gap-1 text-xs" title="Comments">
            <MessageSquare size={12} />
            <span>{commentCount}</span>
          </div> */}
          <div
            className="flex items-center gap-1 text-xs cursor-pointer hover:text-btn"
            title="Comments"
            onClick={() => onCommentClick?.(task)}
          >
            <MessageSquare size={12} />
            <span>{commentCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs" title="Attachments">
            <Paperclip size={12} />
            <span>{attachmentCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
