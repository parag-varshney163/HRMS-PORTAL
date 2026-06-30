/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { Network, Users, Edit2, Trash2 } from "lucide-react";

import useNotification from "../../hooks/useNotification.jsx";
import EditDepartmentModal from "./EditDepartmentModal";
import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors.js";


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

  // return (
  //   <div>
  //     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-card-border">
  //       <div className="flex items-center gap-3">
  //         <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
  //           <Network size={24} />
  //         </div>
  //         <div>
  //           <h3 className="text-xl font-bold text-text-primary">Departments</h3>
  //           <p className="text-sm text-text-secondary">
  //             Manage structure and view employee distribution.
  //           </p>
  //         </div>
  //       </div>
  //       <button
  //         onClick={() => setIsCreateOpen(true)}
  //         className="px-4 py-2 bg-btn text-white rounded-xl hover:bg-btn-hover transition"
  //       >
  //         + Create Department
  //       </button>

  //     </div>

  //     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
  //       {departments.length > 0 ? (
  //         departments.map((dept) => (
  //           <div
  //             key={dept._id || dept.departmentId}
  //             className="bg-input/30 border border-card-border rounded-xl p-5 hover:border-btn/40 transition-colors flex flex-col"
  //           >
  //             {/* Header */}
  //             <div className="flex justify-between items-start mb-4">
  //               <div>
  //                 <h4 className="text-lg font-bold text-text-primary capitalize">
  //                   {(dept.departmentName || dept.name)
  //                     ?.replaceAll("_", " ")}
  //                 </h4>

  //                 <span
  //                   className={`inline-flex mt-2 px-2 py-1 rounded-full text-xs font-medium ${dept.status === "active"
  //                       ? "bg-green-500/10 text-green-400"
  //                       : "bg-red-500/10 text-red-400"
  //                     }`}
  //                 >
  //                   {dept.status}
  //                 </span>
  //               </div>

  //               <div className="flex gap-2">
  //                 <button
  //                   onClick={() => setEditingDept(dept)}
  //                   className="p-1.5 text-text-secondary hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
  //                 >
  //                   <Edit2 size={16} />
  //                 </button>

  //                 <button
  //                   onClick={() =>
  //                     handleDelete(
  //                       dept._id || dept.departmentId,
  //                       dept.departmentName || dept.name
  //                     )
  //                   }
  //                   className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
  //                 >
  //                   <Trash2 size={16} />
  //                 </button>
  //               </div>
  //             </div>

  //             {/* Description */}
  //             <p className="text-sm text-text-secondary mb-4">
  //               {dept.description || "No description provided."}
  //             </p>

  //             {/* Details */}
  //             <div className="space-y-2 text-sm mb-4">
  //               <div className="flex justify-between">
  //                 <span className="text-text-secondary">
  //                   Working Hours
  //                 </span>

  //                 <span className="text-text-primary">
  //                   {dept.workingStartTime &&
  //                     dept.workingEndTime
  //                     ? `${dept.workingStartTime} - ${dept.workingEndTime}`
  //                     : "Not Set"}
  //                 </span>
  //               </div>

  //               <div className="flex justify-between">
  //                 <span className="text-text-secondary">
  //                   Week Off
  //                 </span>

  //                 <span className="text-text-primary capitalize">
  //                   {dept.weekOff?.length
  //                     ? dept.weekOff.join(", ")
  //                     : "Not Set"}
  //                 </span>
  //               </div>

  //               <div className="flex justify-between">
  //                 <span className="text-text-secondary">
  //                   Created
  //                 </span>

  //                 <span className="text-text-primary">
  //                   {new Date(
  //                     dept.createdAt
  //                   ).toLocaleDateString()}
  //                 </span>
  //               </div>
  //             </div>

  //             {/* Employee Count */}
  //             {/* <div className="mt-auto pt-4 border-t border-card-border/50 flex items-center gap-3">
  //               <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center border border-card-border">
  //                 <Users size={16} />
  //               </div>

  //               <div>
  //                 <p className="text-text-primary font-semibold">
  //                   {dept.userCount ||
  //                     dept.totalMembers ||
  //                     0}
  //                 </p>

  //                 <p className="text-xs text-text-secondary">
  //                   Employees
  //                 </p>
  //               </div>
  //             </div> */}
  //           </div>
  //         ))
  //       ) : (
  //         <div className="col-span-full py-10 text-center text-text-secondary border border-dashed border-card-border rounded-xl">
  //           No departments found.
  //         </div>
  //       )}
  //     </div>
  //     <EditDepartmentModal
  //       open={isCreateOpen}
  //       mode="create"
  //       onClose={() => setIsCreateOpen(false)}
  //       onSuccess={fetchDepartments}
  //     />
  //     {/* Edit Modal */}
  //     <EditDepartmentModal
  //       key={
  //         editingDept ? editingDept._id || editingDept.departmentId : "closed"
  //       }
  //       mode="edit"
  //       open={!!editingDept}
  //       onClose={() => setEditingDept(null)}
  //       department={editingDept}
  //       onSuccess={fetchDepartments}
  //     />
  //   </div>
  // );

  return (
  <div className="animate-in fade-in">
    {/* HEADER */}
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-5"
      style={{
        borderBottom: `1px solid ${colors.cardBorder}`,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: colors.purpleLight,
            color: colors.purple,
          }}
        >
          <Network size={24} />
        </div>

        <div>
          <h3
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Departments
          </h3>

          <p
            className="text-sm mt-1"
            style={{ color: colors.textSecondary }}
          >
            Manage department structure and employee distribution.
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsCreateOpen(true)}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm"
        style={{
          backgroundColor: colors.buttonBg,
          color: "#fff",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = colors.buttonHover)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = colors.buttonBg)
        }
      >
        + Create Department
      </button>
    </div>

    {/* DEPARTMENT GRID */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {departments.length > 0 ? (
        departments.map((dept) => (
          <div
            key={dept._id || dept.departmentId}
            className="rounded-2xl p-5 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <h4
                  className="text-lg font-bold capitalize"
                  style={{ color: colors.textPrimary }}
                >
                  {(dept.departmentName || dept.name)?.replaceAll("_", " ")}
                </h4>

                <span
                  className="inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor:
                      dept.status === "active"
                        ? colors.successLight
                        : colors.dangerLight,
                    color:
                      dept.status === "active"
                        ? colors.success
                        : colors.danger,
                  }}
                >
                  {dept.status}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingDept(dept)}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: colors.blue,
                    backgroundColor: colors.blueLight,
                  }}
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
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: colors.danger,
                    backgroundColor: colors.dangerLight,
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Description */}
            <p
              className="text-sm mb-5 leading-6"
              style={{ color: colors.textSecondary }}
            >
              {dept.description || "No description provided."}
            </p>

            {/* Details */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                backgroundColor: colors.inputBg,
                border: `1px solid ${colors.cardBorder}`,
              }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>
                  Working Hours
                </span>

                <span
                  className="font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  {dept.workingStartTime && dept.workingEndTime
                    ? `${dept.workingStartTime} - ${dept.workingEndTime}`
                    : "Not Set"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>
                  Week Off
                </span>

                <span
                  className="capitalize font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  {dept.weekOff?.length
                    ? dept.weekOff.join(", ")
                    : "Not Set"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>
                  Created
                </span>

                <span
                  className="font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  {new Date(dept.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Employee Count */}
            {/* <div
              className="mt-5 pt-4 flex items-center gap-3"
              style={{
                borderTop: `1px solid ${colors.cardBorder}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.accentDark,
                }}
              >
                <Users size={18} />
              </div>

              <div>
                <p
                  className="font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  {dept.userCount || dept.totalMembers || 0}
                </p>

                <p
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Employees
                </p>
              </div>
            </div> */}
          </div>
        ))
      ) : (
        <div
          className="col-span-full py-16 rounded-2xl text-center"
          style={{
            border: `2px dashed ${colors.cardBorder}`,
            backgroundColor: colors.cardBg,
          }}
        >
          <Network
            size={42}
            className="mx-auto mb-3"
            style={{ color: colors.textMuted }}
          />

          <p
            className="font-semibold"
            style={{ color: colors.textPrimary }}
          >
            No Departments Found
          </p>

          <p
            className="text-sm mt-2"
            style={{ color: colors.textSecondary }}
          >
            Create your first department to organize employees.
          </p>
        </div>
      )}
    </div>

    <EditDepartmentModal
      open={isCreateOpen}
      mode="create"
      onClose={() => setIsCreateOpen(false)}
      onSuccess={fetchDepartments}
    />

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
