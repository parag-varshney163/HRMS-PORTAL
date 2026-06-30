import { Users, Briefcase, UserCheck, Network, List, ChevronDown, ChevronRight, } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

// 🚨 NEW IMPORT: Import the Modal we just created
import CreateOrgNodeModal from "../components/OrgChart/CreateOrgNodeModal";
import ProfileCard from "../components/ui/ProfileCard";
// Reusable UI Components
import StatsCard from "../components/ui/StatsCard";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/ui/Button";
import colors from "../constants/colors";


const OrgChart = () => {
  // ─── STATE MANAGEMENT ───
  const [activeView, setActiveView] = useState("department"); // 'department' | 'tree'

  // Data States
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalManagers: 0,
    totalDepartments: 0,
  });
  const [departments, setDepartments] = useState([]);
  const [treeData, setTreeData] = useState(null);

  // Loading & Modal States
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingTree, setLoadingTree] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 🚨 Modal State

  // ─── API: FETCH INITIAL DATA ───
  const fetchInitialData = useCallback(async () => {
    try {
      setLoadingInitial(true);
      const [statsRes, deptRes] = await Promise.allSettled([
        axiosInstance.get("/api/v1/organization-chart/stats"),
        axiosInstance.get("/api/v1/organization-chart/department-view"),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      }
      if (deptRes.status === "fulfilled" && deptRes.value.data.success) {
        setDepartments(deptRes.value.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch org chart data:", error);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  // ─── API: FETCH TREE DATA ───
  const fetchTreeData = async () => {
    try {
      setLoadingTree(true);
      const { data } = await axiosInstance.get(
        "/api/v1/organization-chart/tree",
      );
      if (data.success) {
        setTreeData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tree:", error);
    } finally {
      setLoadingTree(false);
    }
  };

  const handleToggleTree = () => {
    setActiveView("tree");
    if (!treeData) {
      fetchTreeData();
    }
  };

  // ─── REFRESH HANDLER AFTER CREATION ───
  const handleNodeCreated = () => {
    // Re-fetch department view & stats
    fetchInitialData();
    // If the user is currently looking at the Tree view (or has looked at it), refresh it too
    if (activeView === "tree" || treeData) {
      fetchTreeData();
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // ─── HELPER: MAP DATA TO PROFILE CARD ───
  const mapMemberToProfile = (member, deptName) => {
    return {
      empId: member.employeeId || "N/A",
      name: `${member.firstName || ""} ${member.lastName || ""}`.trim(),
      email: member.email || "N/A",
      phone: member.phoneNumber || "N/A",
      department: deptName.replace("_", " "),
      designation: member.role || "Employee",
      status: member.status
        ? member.status.charAt(0).toUpperCase() + member.status.slice(1)
        : "Active",
      avatar: member.avatar || null,
    };
  };

  // ─── SUB-COMPONENT: RECURSIVE TREE NODE ───
  // const TreeNode = ({ node }) => {
  //   const [isExpanded, setIsExpanded] = useState(true);
  //   const hasChildren = node.children && node.children.length > 0;

  //   return (
  //     <div className="pl-6 border-l-2 border-card-border relative mt-2">
  //       <div className="absolute w-4 h-0.5 bg-card-border left-0 top-6" />

  //       <div className="flex items-center gap-2 relative z-10 mb-2">
  //         {hasChildren ? (
  //           <button
  //             onClick={() => setIsExpanded(!isExpanded)}
  //             className="w-5 h-5 rounded bg-input flex items-center justify-center text-text-secondary hover:text-accent transition-colors"
  //           >
  //             {isExpanded ? (
  //               <ChevronDown size={14} />
  //             ) : (
  //               <ChevronRight size={14} />
  //             )}
  //           </button>
  //         ) : (
  //           <div className="w-5 h-5" />
  //         )}

  //         <div className="flex items-center gap-3 bg-card border border-card-border rounded-lg p-2.5 min-w-[200px] shadow-sm">
  //           <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold uppercase">
  //             {node.firstName ? node.firstName.charAt(0) : "N"}
  //           </div>
  //           <div>
  //             <p className="text-sm font-bold text-text-primary leading-tight">
  //               {node.firstName} {node.lastName}
  //             </p>
  //             <p className="text-[10px] text-text-secondary uppercase">
  //               {node.designation || node.role}
  //             </p>
  //           </div>
  //         </div>
  //       </div>

  //       {hasChildren && isExpanded && (
  //         <div className="ml-2">
  //           {node.children.map((child, index) => (
  //             <TreeNode key={index} node={child} />
  //           ))}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  // ─── SUB-COMPONENT: RECURSIVE TREE NODE ───
  const TreeNode = ({ node }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // 🚨 FIX: API uses 'reports' for children
    const hasChildren = node.reports && node.reports.length > 0;

    // Safely extract nested data using optional chaining
    const firstName = node.user?.firstName || "Unknown";
    const lastName = node.user?.lastName || "";
    const initial = firstName.charAt(0).toUpperCase();
    const displayRole = node.roleTitle || node.user?.role || "Employee";
    const deptName = node.department?.name || "";

    return (
      <div className="pl-6 border-l-2 border-card-border relative mt-2">
        <div className="absolute w-4 h-0.5 bg-card-border left-0 top-6" />

        <div className="flex items-center gap-2 relative z-10 mb-2">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-5 h-5 rounded bg-input flex items-center justify-center text-text-secondary hover:text-accent transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          ) : (
            <div className="w-5 h-5" />
          )}

          <div className="flex items-center gap-3 bg-card border border-card-border rounded-lg p-2.5 min-w-[200px] shadow-sm">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold uppercase shrink-0">
              {initial}
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary leading-tight">
                {firstName} {lastName}
              </p>
              <p className="text-[10px] text-text-secondary uppercase mt-0.5">
                <span className="font-semibold">{displayRole}</span>
                {deptName && (
                  <span className="opacity-70">
                    {" "}
                    • {deptName.replace("_", " ")}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 🚨 FIX: Map over 'reports' instead of 'children' */}
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.reports.map((childNode, index) => (
              <TreeNode key={childNode._id || index} node={childNode} />
            ))}
          </div>
        )}
      </div>
    );
  };
  // return (
  //   <div className="py-2 pb-6">
  //     {/* ─── Header ─── */}
  //     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
  //       <div>
  //         <h2 className="text-2xl font-bold text-text-primary">
  //           Organization <span className="text-accent">Chart</span>
  //         </h2>
  //         <p className="text-sm text-text-secondary mt-1">
  //           View departments and structural hierarchy
  //         </p>
  //       </div>
  //       <Button
  //         variant="custom"
  //         bg="#3B82F6"
  //         text="#FFF"
  //         icon={Network}
  //         size="sm"
  //         onClick={() => setIsModalOpen(true)} // 🚨 Trigger Modal
  //       >
  //         Create Node
  //       </Button>
  //     </div>

  //     {/* ─── Stacked Stats Rows ─── */}
  //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
  //       <StatsCard
  //         icon={Users}
  //         iconBg="bg-blue-500/20"
  //         iconColor="text-blue-400"
  //         value={loadingInitial ? "..." : stats.totalEmployees}
  //         label="Total Employees"
  //       />
  //       <StatsCard
  //         icon={UserCheck}
  //         iconBg="bg-green-500/20"
  //         iconColor="text-green-400"
  //         value={loadingInitial ? "..." : stats.totalManagers}
  //         label="Total Managers"
  //       />
  //       <StatsCard
  //         icon={Briefcase}
  //         iconBg="bg-purple-500/20"
  //         iconColor="text-purple-400"
  //         value={loadingInitial ? "..." : stats.totalDepartments}
  //         label="Total Departments"
  //       />
  //     </div>

  //     {/* ─── View Toggle ─── */}
  //     <div className="flex items-center gap-2 mb-8 bg-card border border-card-border p-1 rounded-lg w-full sm:w-auto">
  //       <button
  //         onClick={() => setActiveView("department")}
  //         className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
  //           activeView === "department"
  //             ? "bg-hover text-accent shadow"
  //             : "text-text-secondary hover:text-text-primary"
  //         }`}
  //       >
  //         <List size={16} /> Department View
  //       </button>
  //       <button
  //         onClick={handleToggleTree}
  //         className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
  //           activeView === "tree"
  //             ? "bg-hover text-accent shadow"
  //             : "text-text-secondary hover:text-text-primary"
  //         }`}
  //       >
  //         <Network size={16} /> Hierarchy Tree
  //       </button>
  //     </div>

  //     {/* ─── Main Content Area ─── */}
  //     {loadingInitial ? (
  //       <div className="py-20 text-center text-text-secondary animate-pulse">
  //         Loading Organization Data...
  //       </div>
  //     ) : activeView === "department" ? (
  //       // 🔹 DEPARTMENT VIEW
  //       <div className="space-y-10">
  //         {departments.map((dept) => (
  //           <div key={dept.departmentId} className="w-full">
  //             <div className="flex items-center justify-between mb-4 border-b border-card-border/50 pb-3">
  //               <div>
  //                 <h3 className="text-xl font-bold text-text-primary capitalize flex items-center gap-2">
  //                   <Briefcase size={20} className="text-accent" />
  //                   {dept.departmentName.replace("_", " ")}
  //                 </h3>
  //                 <p className="text-sm text-text-secondary mt-1">
  //                   {dept.description}
  //                 </p>
  //               </div>
  //               <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
  //                 {dept.totalMembers} Members
  //               </div>
  //             </div>

  //             {dept.members.length > 0 ? (
  //               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //                 {dept.members.map((member) => (
  //                   <ProfileCard
  //                     key={member._id}
  //                     data={mapMemberToProfile(member, dept.departmentName)}
  //                     variant="employee"
  //                     onEdit={() =>
  //                       console.log("Edit clicked for", member.firstName)
  //                     }
  //                     onDelete={() =>
  //                       console.log("Delete clicked for", member.firstName)
  //                     }
  //                   />
  //                 ))}
  //               </div>
  //             ) : (
  //               <div className="bg-card border border-card-border rounded-xl p-8 text-center text-text-secondary italic opacity-80">
  //                 No active members in this department.
  //               </div>
  //             )}
  //           </div>
  //         ))}
  //       </div>
  //     ) : (
  //       // 🔹 TREE VIEW
  //       <div className="bg-card border border-card-border rounded-xl p-6 overflow-x-auto custom-scrollbar">
  //         {loadingTree ? (
  //           <div className="py-10 text-center text-text-secondary animate-pulse">
  //             Fetching Hierarchy Tree...
  //           </div>
  //         ) : treeData && treeData.length > 0 ? (
  //           <div className="min-w-max pb-10">
  //             {/* 🚨 FIX: treeData is an Array, so we map over the top-level nodes */}
  //             {treeData.map((rootNode) => (
  //               <TreeNode key={rootNode._id} node={rootNode} />
  //             ))}
  //           </div>
  //         ) : (
  //           <div className="py-10 text-center text-text-secondary">
  //             No hierarchy tree data available.
  //           </div>
  //         )}
  //       </div>
  //     )}

  //     {/* 🚨 MOUNT THE MODAL HERE 🚨 */}
  //     <CreateOrgNodeModal
  //       open={isModalOpen}
  //       onClose={() => setIsModalOpen(false)}
  //       onSuccess={handleNodeCreated}
  //     />
  //   </div>
  // );

  return (
  <div className="py-2 pb-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: colors.textPrimary }}
        >
          Organization <span style={{ color: colors.accent }}>Chart</span>
        </h2>

        <p
          className="text-sm mt-1"
          style={{ color: colors.textSecondary }}
        >
          View departments and structural hierarchy
        </p>
      </div>

      <Button
        variant="custom"
        bg={colors.blue}
        text="#FFF"
        icon={Network}
        size="sm"
        onClick={() => setIsModalOpen(true)}
      >
        Create Node
      </Button>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <StatsCard
        icon={Users}
        iconBg={colors.blueLight}
        iconColor={colors.blue}
        value={loadingInitial ? "..." : stats.totalEmployees}
        label="Total Employees"
      />

      <StatsCard
        icon={UserCheck}
        iconBg={colors.successLight}
        iconColor={colors.success}
        value={loadingInitial ? "..." : stats.totalManagers}
        label="Total Managers"
      />

      <StatsCard
        icon={Briefcase}
        iconBg={colors.purpleLight}
        iconColor={colors.purple}
        value={loadingInitial ? "..." : stats.totalDepartments}
        label="Total Departments"
      />
    </div>

    {/* View Toggle */}
    <div
      className="flex items-center gap-2 mb-8 p-1 rounded-lg w-full sm:w-auto"
      style={{
        backgroundColor: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      <button
        onClick={() => setActiveView("department")}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
        style={{
          backgroundColor:
            activeView === "department"
              ? colors.hover
              : "transparent",
          color:
            activeView === "department"
              ? colors.accent
              : colors.textSecondary,
          boxShadow:
            activeView === "department"
              ? "0 2px 8px rgba(0,0,0,0.08)"
              : "none",
        }}
      >
        <List size={16} />
        Department View
      </button>

      <button
        onClick={handleToggleTree}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
        style={{
          backgroundColor:
            activeView === "tree"
              ? colors.hover
              : "transparent",
          color:
            activeView === "tree"
              ? colors.accent
              : colors.textSecondary,
          boxShadow:
            activeView === "tree"
              ? "0 2px 8px rgba(0,0,0,0.08)"
              : "none",
        }}
      >
        <Network size={16} />
        Hierarchy Tree
      </button>
    </div>

    {/* Content */}
    {loadingInitial ? (
      <div
        className="py-20 text-center animate-pulse"
        style={{ color: colors.textSecondary }}
      >
        Loading Organization Data...
      </div>
    ) : activeView === "department" ? (
      <div className="space-y-10">
        {departments.map((dept) => (
          <div key={dept.departmentId}>
            <div
              className="flex items-center justify-between mb-4 pb-3 border-b"
              style={{
                borderColor: colors.cardBorder,
              }}
            >
              <div>
                <h3
                  className="text-xl font-bold capitalize flex items-center gap-2"
                  style={{ color: colors.textPrimary }}
                >
                  <Briefcase
                    size={20}
                    style={{ color: colors.accent }}
                  />
                  {dept.departmentName.replace("_", " ")}
                </h3>

                <p
                  className="text-sm mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  {dept.description}
                </p>
              </div>

              <div
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: colors.blueLight,
                  color: colors.blue,
                }}
              >
                {dept.totalMembers} Members
              </div>
            </div>

            {dept.members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dept.members.map((member) => (
                  <ProfileCard
                    key={member._id}
                    data={mapMemberToProfile(
                      member,
                      dept.departmentName
                    )}
                    variant="employee"
                    onEdit={() =>
                      console.log(
                        "Edit clicked for",
                        member.firstName
                      )
                    }
                    onDelete={() =>
                      console.log(
                        "Delete clicked for",
                        member.firstName
                      )
                    }
                  />
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl p-8 text-center italic"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textSecondary,
                }}
              >
                No active members in this department.
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div
        className="rounded-xl p-6 overflow-x-auto custom-scrollbar"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        {loadingTree ? (
          <div
            className="py-10 text-center animate-pulse"
            style={{ color: colors.textSecondary }}
          >
            Fetching Hierarchy Tree...
          </div>
        ) : treeData && treeData.length > 0 ? (
          <div className="min-w-max pb-10">
            {treeData.map((rootNode) => (
              <TreeNode
                key={rootNode._id}
                node={rootNode}
              />
            ))}
          </div>
        ) : (
          <div
            className="py-10 text-center"
            style={{ color: colors.textSecondary }}
          >
            No hierarchy tree data available.
          </div>
        )}
      </div>
    )}

    <CreateOrgNodeModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSuccess={handleNodeCreated}
    />
  </div>
);
};

export default OrgChart;
