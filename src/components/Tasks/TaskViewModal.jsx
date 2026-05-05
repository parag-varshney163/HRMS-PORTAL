import React, { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance";


export default function TaskViewModal({ open, onClose, taskId }) {
  const [task, setTask] = useState(null);

  useEffect(() => {
    if (!open || !taskId) return;

    axiosInstance.get(`/api/v1/task/${taskId}`).then((res) => {
      if (res.data?.success) setTask(res.data.data);
    });
  }, [open, taskId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-card p-5 rounded-xl w-full max-w-lg">
        <div className="flex justify-between mb-4">
          <h3>Task Details</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {!task ? (
  "Loading..."
) : (
  <div className="space-y-2 text-sm">

    <p><b>Title:</b> {task.title}</p>

    <p><b>Description:</b> {task.description}</p>

    <p><b>Status:</b> 
      <span className="ml-1 capitalize">{task.status.replace("_", " ")}</span>
    </p>

    <p><b>Priority:</b> 
      <span className="ml-1 capitalize">{task.priority}</span>
    </p>

    <p><b>Team:</b> {task.team || "N/A"}</p>

    <p><b>Department:</b> {task.department?.name || "N/A"}</p>

    <p><b>Assigned To:</b> 
      {" "}
      {task.assignTo
        ? `${task.assignTo.firstName} ${task.assignTo.lastName}`
        : "Unassigned"}
    </p>

    <p><b>Created By:</b> 
      {" "}
      {task.createdBy
        ? `${task.createdBy.firstName} ${task.createdBy.lastName}`
        : "N/A"}
    </p>

    <p><b>Created At:</b> 
      {" "}
      {new Date(task.createdAt).toLocaleString()}
    </p>

    <p><b>Due Date:</b> 
      {" "}
      {task.due_date
        ? new Date(task.due_date).toLocaleDateString()
        : "No Date"}
    </p>

    <p><b>Attachments:</b> 
      {" "}
      {task.attachments ? "Available" : "None"}
    </p>

    <p><b>Total Comments:</b> {task.commentsCount || 0}</p>

  </div>
)}
      </div>
    </div>
  );
}
