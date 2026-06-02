/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { Network, Users, Edit2, Trash2 } from "lucide-react";

import useNotification from "../../hooks/useNotification.jsx";
import EditDepartmentModal from "./EditDepartmentModal";
import axiosInstance from "../../api/axiosInstance";


export default function DepartmentsManager() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDept, setEditingDept] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const notify = useNotification();

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/v1/department");
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the ${name} department? This might affect users assigned to it.`,
      )
    )
      return;
    try {
      const { data } = await axiosInstance.delete(`/api/v1/department/${id}`);
      if (data.success) {
        notify.success("Department Deleted", `${name} department has been removed.`);
        fetchDepartments();
      }
    } catch (error) {
      notify.error("Delete Failed", error.response?.data?.message || "Failed to delete department.");
    }
  };

  if (loading)
    return (
      <div className="animate-pulse text-text-secondary">
        Loading departments...
      </div>
    );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-card-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Network size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-primary">Departments</h3>
            <p className="text-sm text-text-secondary">
              Manage structure and view employee distribution.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-btn text-white rounded-xl hover:bg-btn-hover transition"
        >
          + Create Department
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.length > 0 ? (
          departments.map((dept) => (
            // <div
            //   key={dept._id || dept.departmentId}
            //   className="bg-input/30 border border-card-border rounded-xl p-5 hover:border-btn/40 transition-colors flex flex-col"
            // >
            //   <div className="flex justify-between items-start mb-4">
            //     <h4 className="text-lg font-bold text-text-primary capitalize">
            //       {dept.departmentName?.replace("_", " ") || dept.name}
            //     </h4>
            //     <div className="flex gap-2">
            //       <button
            //         onClick={() => setEditingDept(dept)}
            //         className="p-1.5 text-text-secondary hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
            //         title="Edit"
            //       >
            //         <Edit2 size={16} />
            //       </button>
            //       <button
            //         onClick={() =>
            //           handleDelete(
            //             dept._id || dept.departmentId,
            //             dept.departmentName || dept.name,
            //           )
            //         }
            //         className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
            //         title="Delete"
            //       >
            //         <Trash2 size={16} />
            //       </button>
            //     </div>
            //   </div>

            //   <p className="text-sm text-text-secondary mb-4 flex-1 line-clamp-2">
            //     {dept.description || "No description provided."}
            //   </p>

            //   <div className="mt-auto pt-4 border-t border-card-border/50 flex items-center gap-2 text-sm font-medium text-text-primary">
            //     <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-card-border text-text-secondary">
            //       <Users size={14} />
            //     </div>
            //     <span>
            //       {dept.userCount || dept.totalMembers || 0} Employees
            //     </span>
            //   </div>
            // </div>
            <div
              key={dept._id || dept.departmentId}
              className="bg-input/30 border border-card-border rounded-xl p-5 hover:border-btn/40 transition-colors flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-text-primary capitalize">
                    {(dept.departmentName || dept.name)
                      ?.replaceAll("_", " ")}
                  </h4>

                  <span
                    className={`inline-flex mt-2 px-2 py-1 rounded-full text-xs font-medium ${dept.status === "active"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                      }`}
                  >
                    {dept.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingDept(dept)}
                    className="p-1.5 text-text-secondary hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        dept._id || dept.departmentId,
                        dept.departmentName || dept.name
                      )
                    }
                    className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary mb-4">
                {dept.description || "No description provided."}
              </p>

              {/* Details */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    Working Hours
                  </span>

                  <span className="text-text-primary">
                    {dept.workingStartTime &&
                      dept.workingEndTime
                      ? `${dept.workingStartTime} - ${dept.workingEndTime}`
                      : "Not Set"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    Week Off
                  </span>

                  <span className="text-text-primary capitalize">
                    {dept.weekOff?.length
                      ? dept.weekOff.join(", ")
                      : "Not Set"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-text-secondary">
                    Created
                  </span>

                  <span className="text-text-primary">
                    {new Date(
                      dept.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Employee Count */}
              {/* <div className="mt-auto pt-4 border-t border-card-border/50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center border border-card-border">
                  <Users size={16} />
                </div>

                <div>
                  <p className="text-text-primary font-semibold">
                    {dept.userCount ||
                      dept.totalMembers ||
                      0}
                  </p>

                  <p className="text-xs text-text-secondary">
                    Employees
                  </p>
                </div>
              </div> */}
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-text-secondary border border-dashed border-card-border rounded-xl">
            No departments found.
          </div>
        )}
      </div>
      <EditDepartmentModal
        open={isCreateOpen}
        mode="create"
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchDepartments}
      />
      {/* Edit Modal */}
      <EditDepartmentModal
        key={
          editingDept ? editingDept._id || editingDept.departmentId : "closed"
        }
        mode="edit"
        open={!!editingDept}
        onClose={() => setEditingDept(null)}
        department={editingDept}
        onSuccess={fetchDepartments}
      />
    </div>
  );
}
