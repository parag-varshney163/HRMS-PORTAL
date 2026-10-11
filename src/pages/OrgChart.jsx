// import { Users, Briefcase, UserCheck, Network, List, ChevronDown, ChevronRight, } from "lucide-react";
// import React, { useState, useEffect, useCallback } from "react";
// // 🚨 NEW IMPORT: Import the Modal we just created
// import CreateOrgNodeModal from "../components/OrgChart/CreateOrgNodeModal";
// import ProfileCard from "../components/ui/ProfileCard";
// import OrgNode from "../components/OrgChart/OrgNode";
// // Reusable UI Components
// import StatsCard from "../components/ui/StatsCard";
// import axiosInstance from "../api/axiosInstance";
// import Button from "../components/ui/Button";
// import colors from "../constants/colors";
// const OrgChart = () => {
//   // ─── STATE MANAGEMENT ───
//   const [activeView, setActiveView] = useState("department"); // 'department' | 'tree'
//   // Data States
//   const [stats, setStats] = useState({
//     totalEmployees: 0,
//     totalManagers: 0,
//     totalDepartments: 0,
//   });
//   const [departments, setDepartments] = useState([]);
//   const [treeData, setTreeData] = useState(null);
//   // Loading & Modal States
//   const [loadingInitial, setLoadingInitial] = useState(true);
//   const [loadingTree, setLoadingTree] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false); // 🚨 Modal State
//   // ─── API: FETCH INITIAL DATA ───
//   const fetchInitialData = useCallback(async () => {
//     try {
//       setLoadingInitial(true);
//       const [statsRes, deptRes] = await Promise.allSettled([
//         axiosInstance.get("/api/v1/organization-chart/stats"),
//         axiosInstance.get("/api/v1/organization-chart/department-view"),
//       ]);
//       if (statsRes.status === "fulfilled" && statsRes.value.data.success) {
//         setStats(statsRes.value.data.data);
//       }
//       if (deptRes.status === "fulfilled" && deptRes.value.data.success) {
//         setDepartments(deptRes.value.data.data);
//       }
//     } catch (error) {
//       console.error("Failed to fetch org chart data:", error);
//     } finally {
//       setLoadingInitial(false);
//     }
//   }, []);
//   // ─── API: FETCH TREE DATA ───
//   const fetchTreeData = async () => {
//     try {
//       setLoadingTree(true);
//       const { data } = await axiosInstance.get(
//         "/api/v1/organization-chart/tree",
//       );
//       if (data.success) {
//         setTreeData(data.data);
//       }
//     } catch (error) {
//       console.error("Failed to fetch tree:", error);
//     } finally {
//       setLoadingTree(false);
//     }
//   };
//   const managerMap = React.useMemo(() => {
//     if (!treeData) return {};
//     return treeData.reduce((acc, item) => {
//       acc[item.userId] = item;
//       return acc;
//     }, {});
//   }, [treeData]);
//   const handleToggleTree = () => {
//     setActiveView("tree");
//     if (!treeData) {
//       fetchTreeData();
//     }
//   };
//   // ─── REFRESH HANDLER AFTER CREATION ───
//   const handleNodeCreated = () => {
//     // Re-fetch department view & stats
//     fetchInitialData();
//     // If the user is currently looking at the Tree view (or has looked at it), refresh it too
//     if (activeView === "tree" || treeData) {
//       fetchTreeData();
//     }
//   };
//   useEffect(() => {
//     fetchInitialData();
//   }, [fetchInitialData]);
//   // ─── HELPER: MAP DATA TO PROFILE CARD ───
//   const mapMemberToProfile = (member, deptName) => {
//     return {
//       empId: member.employeeId || "N/A",
//       name: `${member.firstName || ""} ${member.lastName || ""}`.trim(),
//       email: member.email || "N/A",
//       phone: member.phoneNumber || "N/A",
//       department: deptName.replace("_", " "),
//       designation: member.role || "Employee",
//       status: member.status
//         ? member.status.charAt(0).toUpperCase() + member.status.slice(1)
//         : "Active",
//       avatar: member.avatar || null,
//     };
//   };
//   // ─── SUB-COMPONENT: RECURSIVE TREE NODE ───
//   const TreeNode = ({ node }) => {
//     const [isExpanded, setIsExpanded] = useState(true);
//     // 🚨 FIX: API uses 'reports' for children
//     const hasChildren = node.reports && node.reports.length > 0;
//     // Safely extract nested data using optional chaining
//     const firstName = node.user?.firstName || "Unknown";
//     const lastName = node.user?.lastName || "";
//     const initial = firstName.charAt(0).toUpperCase();
//     const displayRole = node.roleTitle || node.user?.role || "Employee";
//     const deptName = node.department?.name || "";
//     return (
//       <div className="pl-6 border-l-2 border-card-border relative mt-2">
//         <div className="absolute w-4 h-0.5 bg-card-border left-0 top-6" />
//         <div className="flex items-center gap-2 relative z-10 mb-2">
//           {hasChildren ? (
//             <button
//               onClick={() => setIsExpanded(!isExpanded)}
//               className="w-5 h-5 rounded bg-input flex items-center justify-center text-text-secondary hover:text-accent transition-colors"
//             >
//               {isExpanded ? (
//                 <ChevronDown size={14} />
//               ) : (
//                 <ChevronRight size={14} />
//               )}
//             </button>
//           ) : (
//             <div className="w-5 h-5" />
//           )}
//           <div className="flex items-center gap-3 bg-card border border-card-border rounded-lg p-2.5 min-w-[200px] shadow-sm">
//             <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold uppercase shrink-0">
//               {initial}
//             </div>
//             <div>
//               <p className="text-sm font-bold text-text-primary leading-tight">
//                 {firstName} {lastName}
//               </p>
//               <p className="text-[10px] text-text-secondary uppercase mt-0.5">
//                 <span className="font-semibold">{displayRole}</span>
//                 {deptName && (
//                   <span className="opacity-70">
//                     {" "}
//                     • {deptName.replace("_", " ")}
//                   </span>
//                 )}
//               </p>
//             </div>
//           </div>
//         </div>
//         {/* 🚨 FIX: Map over 'reports' instead of 'children' */}
//         {hasChildren && isExpanded && (
//           <div className="ml-2">
//             {node.reports.map((childNode, index) => (
//               <TreeNode key={childNode._id || index} node={childNode} />
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   };
//   return (
//     <div className="py-2 pb-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//         <div>
//           <h2
//             className="text-2xl font-bold"
//             style={{ color: colors.textPrimary }}
//           >
//             Organization <span style={{ color: colors.accent }}>Chart</span>
//           </h2>
//           <p
//             className="text-sm mt-1"
//             style={{ color: colors.textSecondary }}
//           >
//             View departments and structural hierarchy
//           </p>
//         </div>
//         {/* <Button
//           variant="custom"
//           bg={colors.blue}
//           text="#FFF"
//           icon={Network}
//           size="sm"
//           onClick={() => setIsModalOpen(true)}
//         >
//           Create Node
//         </Button> */}
//       </div>
//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//         <StatsCard
//           icon={Users}
//           iconBg={colors.blueLight}
//           iconColor={colors.blue}
//           value={loadingInitial ? "..." : stats.totalEmployees}
//           label="Total Employees"
//         />
//         <StatsCard
//           icon={UserCheck}
//           iconBg={colors.successLight}
//           iconColor={colors.success}
//           value={loadingInitial ? "..." : stats.totalManagers}
//           label="Total Managers"
//         />
//         <StatsCard
//           icon={Briefcase}
//           iconBg={colors.purpleLight}
//           iconColor={colors.purple}
//           value={loadingInitial ? "..." : stats.totalDepartments}
//           label="Total Departments"
//         />
//       </div>
//       {/* View Toggle */}
//       <div
//         className="flex items-center gap-2 mb-8 p-1 rounded-lg w-full sm:w-auto"
//         style={{
//           backgroundColor: colors.cardBg,
//           border: `1px solid ${colors.cardBorder}`,
//         }}
//       >
//         <button
//           onClick={() => setActiveView("department")}
//           className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
//           style={{
//             backgroundColor:
//               activeView === "department"
//                 ? colors.hover
//                 : "transparent",
//             color:
//               activeView === "department"
//                 ? colors.accent
//                 : colors.textSecondary,
//             boxShadow:
//               activeView === "department"
//                 ? "0 2px 8px rgba(0,0,0,0.08)"
//                 : "none",
//           }}
//         >
//           <List size={16} />
//           Department View
//         </button>
//         <button
//           onClick={handleToggleTree}
//           className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all"
//           style={{
//             backgroundColor:
//               activeView === "tree"
//                 ? colors.hover
//                 : "transparent",
//             color:
//               activeView === "tree"
//                 ? colors.accent
//                 : colors.textSecondary,
//             boxShadow:
//               activeView === "tree"
//                 ? "0 2px 8px rgba(0,0,0,0.08)"
//                 : "none",
//           }}
//         >
//           <Network size={16} />
//           Hierarchy Tree
//         </button>
//       </div>
//       {/* Content */}
//       {loadingInitial ? (
//         <div
//           className="py-20 text-center animate-pulse"
//           style={{ color: colors.textSecondary }}
//         >
//           Loading Organization Data...
//         </div>
//       ) : activeView === "department" ? (
//         <div className="space-y-10">
//           {departments.map((dept) => (
//             <div key={dept.departmentId}>
//               <div
//                 className="flex items-center justify-between mb-4 pb-3 border-b"
//                 style={{
//                   borderColor: colors.cardBorder,
//                 }}
//               >
//                 <div>
//                   <h3
//                     className="text-xl font-bold capitalize flex items-center gap-2"
//                     style={{ color: colors.textPrimary }}
//                   >
//                     <Briefcase
//                       size={20}
//                       style={{ color: colors.accent }}
//                     />
//                     {dept.departmentName.replace("_", " ")}
//                   </h3>
//                   <p
//                     className="text-sm mt-1"
//                     style={{ color: colors.textSecondary }}
//                   >
//                     {dept.description}
//                   </p>
//                 </div>
//                 <div
//                   className="px-3 py-1 rounded-full text-xs font-semibold"
//                   style={{
//                     backgroundColor: colors.blueLight,
//                     color: colors.blue,
//                   }}
//                 >
//                   {dept.totalMembers} Members
//                 </div>
//               </div>
//               {dept.members.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {dept.members.map((member) => (
//                     // <ProfileCard
//                     //   key={member._id}
//                     //   data={mapMemberToProfile(
//                     //     member,
//                     //     dept.departmentName
//                     //   )}
//                     //   variant="employee"
//                     //   onEdit={() =>
//                     //     console.log(
//                     //       "Edit clicked for",
//                     //       member.firstName
//                     //     )
//                     //   }
//                     //   onDelete={() =>
//                     //     console.log(
//                     //       "Delete clicked for",
//                     //       member.firstName
//                     //     )
//                     //   }
//                     // />
//                     <ProfileCard
//                       key={member._id}
//                       data={mapMemberToProfile(
//                         member,
//                         dept.departmentName
//                       )}
//                       variant="employee"
//                       hideActions={true}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div
//                   className="rounded-xl p-8 text-center italic"
//                   style={{
//                     backgroundColor: colors.cardBg,
//                     border: `1px solid ${colors.cardBorder}`,
//                     color: colors.textSecondary,
//                   }}
//                 >
//                   No active members in this department.
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div
//           className="rounded-xl p-6 overflow-x-auto custom-scrollbar"
//           style={{
//             backgroundColor: colors.cardBg,
//             border: `1px solid ${colors.cardBorder}`,
//           }}
//         >
//           {loadingTree ? (
//             <div
//               className="py-10 text-center animate-pulse"
//               style={{ color: colors.textSecondary }}
//             >
//               Fetching Hierarchy Tree...
//             </div>
//           ) : treeData && treeData.length > 0 ? (
//             // <div className="min-w-max pb-10">
//             //   {treeData.map((rootNode) => (
//             //     <TreeNode
//             //       key={rootNode._id}
//             //       node={rootNode}
//             //     />
//             //   ))}
//             // </div>
//             <div className="min-w-max flex flex-col gap-24 items-center pb-10">
//               {/* {treeData.map((rootNode) => (
//                 <OrgNode
//                   key={rootNode._id}
//                   node={rootNode}
//                 />
//               ))} */}
//               {treeData
//                 .filter((x) => x.level === 1)
//                 .map((rootNode) => (
//                   <OrgNode
//                     key={rootNode.userId}
//                     node={rootNode}
//                     managerMap={managerMap}
//                   />
//                 ))}
//             </div>
//           ) : (
//             <div
//               className="py-10 text-center"
//               style={{ color: colors.textSecondary }}
//             >
//               No hierarchy tree data available.
//             </div>
//           )}
//         </div>
//       )}
//       <CreateOrgNodeModal
//         open={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSuccess={handleNodeCreated}
//       />
//     </div>
//   );
// };
// export default OrgChart;
import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect, } from "react";
import { Users, Briefcase, UserCheck, Network, List, Search, ZoomIn, ZoomOut, RotateCcw, } from "lucide-react";

import CreateOrgNodeModal from "../components/OrgChart/CreateOrgNodeModal";
import ProfileCard from "../components/ui/ProfileCard";
import OrgNode from "../components/OrgChart/OrgNode";
import StatsCard from "../components/ui/StatsCard";
import axiosInstance from "../api/axiosInstance";
import colors from "../constants/colors";


const DEPARTMENTS = [
  "All Department",
  "Tech",
  "Marketing",
  "HR",
  "Operations",
];

const OrgChart = () => {
  const [activeView, setActiveView] = useState("department");

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalManagers: 0,
    totalDepartments: 0,
  });

  const [departments, setDepartments] = useState([]);
  const [treeData, setTreeData] = useState([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingTree, setLoadingTree] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // These controls are used only in Hierarchy Tree view.
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] =
    useState("All Department");
  const [zoom, setZoom] = useState(0.8);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const dragOrigin = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoadingInitial(true);

      const [statsRes, deptRes] = await Promise.allSettled([
        axiosInstance.get("/api/v1/organization-chart/stats"),
        axiosInstance.get("/api/v1/organization-chart/department-view"),
      ]);

      if (
        statsRes.status === "fulfilled" &&
        statsRes.value.data.success
      ) {
        setStats(statsRes.value.data.data);
      }

      if (
        deptRes.status === "fulfilled" &&
        deptRes.value.data.success
      ) {
        setDepartments(deptRes.value.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch organization data:", error);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  const fetchTreeData = useCallback(async () => {
    try {
      setLoadingTree(true);

      const { data } = await axiosInstance.get(
        "/api/v1/organization-chart/tree"
      );

      if (data.success) {
        setTreeData(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch hierarchy tree:", error);
    } finally {
      setLoadingTree(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Resolve managers by userId.
  // Example: an isManager report points to the full manager record.
  const managerMap = useMemo(() => {
    const map = {};

    treeData.forEach((item) => {
      if (item.userId) {
        map[item.userId] = item;
      }
    });

    return map;
  }, [treeData]);

  const handleToggleTree = () => {
    setActiveView("tree");

    if (treeData.length === 0) {
      fetchTreeData();
    }
  };

  const handleNodeCreated = async () => {
    await fetchInitialData();

    if (activeView === "tree" || treeData.length > 0) {
      await fetchTreeData();
    }
  };

  const mapMemberToProfile = (member, deptName) => ({
    empId: member.employeeId || "N/A",
    name: `${member.firstName || ""} ${member.lastName || ""}`.trim(),
    email: member.email || "N/A",
    phone: member.phoneNumber || "N/A",
    department: (deptName || "Other").replace(/_/g, " "),
    designation: member.role || "Employee",
    status: member.status
      ? member.status.charAt(0).toUpperCase() + member.status.slice(1)
      : "Active",
    avatar: member.avatar || member.profilePhoto || null,
  });

  const resetChart = () => {
    setZoom(0.8);
    setDragOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;

    // Clicking employee/manager cards should expand them,
    // not initiate dragging.
    if (event.target.closest("button, input")) return;

    dragMoved.current = false;
    setIsDragging(true);

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
    };

    dragOrigin.current = { ...dragOffset };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;

    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragMoved.current = true;
    }

    setDragOffset({
      x: dragOrigin.current.x + dx,
      y: dragOrigin.current.y + dy,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const rootNodes = useMemo(
    () => treeData.filter((node) => node.level === 1),
    [treeData]
  );
  const chartViewportRef = useRef(null);
const chartContentRef = useRef(null);
const [autoFit, setAutoFit] = useState(true);

const fitChartToScreen = useCallback(() => {
  const viewport = chartViewportRef.current;
  const content = chartContentRef.current;

  if (!viewport || !content) return;

  const availableWidth = viewport.clientWidth - 24;
  const availableHeight = viewport.clientHeight - 24;

  const contentWidth = content.scrollWidth;
  const contentHeight = content.scrollHeight;

  if (!contentWidth || !contentHeight) return;

  const fitScale = Math.min(
    availableWidth / contentWidth,
    availableHeight / contentHeight,
    1
  );

  setZoom(Math.max(0.15, fitScale));
  setDragOffset({ x: 0, y: 0 });
}, []);

useLayoutEffect(() => {
  if (activeView !== "tree" || loadingTree || !autoFit) return;

  const frame = requestAnimationFrame(fitChartToScreen);

  return () => cancelAnimationFrame(frame);
}, [
  activeView,
  loadingTree,
  treeData,
  searchTerm,
  departmentFilter,
  fitChartToScreen,
  autoFit,
]);

  return (
    <div className="py-2 pb-6">
      {/* Page header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Organization{" "}
            <span style={{ color: colors.accent }}>Chart</span>
          </h2>

          <p
            className="mt-1 text-sm"
            style={{ color: colors.textSecondary }}
          >
            View departments and reporting hierarchy
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* View selector */}
      <div
        className="mb-6 flex w-full items-center gap-2 rounded-lg p-1 sm:w-fit"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        <button
          onClick={() => setActiveView("department")}
          className="flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all sm:flex-none"
          style={{
            backgroundColor:
              activeView === "department" ? colors.hover : "transparent",
            color:
              activeView === "department"
                ? colors.accent
                : colors.textSecondary,
          }}
        >
          <List size={16} />
          Department View
        </button>

        <button
          onClick={handleToggleTree}
          className="flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all sm:flex-none"
          style={{
            backgroundColor:
              activeView === "tree" ? colors.hover : "transparent",
            color:
              activeView === "tree" ? colors.accent : colors.textSecondary,
          }}
        >
          <Network size={16} />
          Hierarchy Tree
        </button>
      </div>

      {/* Initial data loading */}
      {loadingInitial ? (
        <div
          className="animate-pulse py-20 text-center"
          style={{ color: colors.textSecondary }}
        >
          Loading organization data...
        </div>
      ) : (
        <>
          {/* Department View: no tree controls here */}
          {activeView === "department" && (
            <div className="space-y-10">
              {departments.map((dept) => (
                <div key={dept.departmentId || dept.departmentName}>
                  <div
                    className="mb-4 flex items-center justify-between gap-3 border-b pb-3"
                    style={{ borderColor: colors.cardBorder }}
                  >
                    <div>
                      <h3
                        className="flex items-center gap-2 text-xl font-bold capitalize"
                        style={{ color: colors.textPrimary }}
                      >
                        <Briefcase
                          size={20}
                          style={{ color: colors.accent }}
                        />
                        {(dept.departmentName || "Other").replace(/_/g, " ")}
                      </h3>

                      {dept.description && (
                        <p
                          className="mt-1 text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          {dept.description}
                        </p>
                      )}
                    </div>

                    <span
                      className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: colors.blueLight,
                        color: colors.blue,
                      }}
                    >
                      {dept.totalMembers ?? dept.members?.length ?? 0} Members
                    </span>
                  </div>

                  {dept.members?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {dept.members.map((member) => (
                        <ProfileCard
                          key={member._id || member.employeeId}
                          data={mapMemberToProfile(
                            member,
                            dept.departmentName
                          )}
                          variant="employee"
                          hideActions
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
          )}

          {/* Hierarchy Tree: all tree-only controls stay inside this block */}
          {activeView === "tree" && (
            <div className="space-y-4">
              {/* Department filters */}
              <div
                className="rounded-xl border p-4"
                style={{
                  backgroundColor: colors.cardBg,
                  borderColor: colors.cardBorder,
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {DEPARTMENTS.map((department) => {
                    const active = departmentFilter === department;

                    const dotColors = {
                      Tech: "#4169FF",
                      Marketing: "#36A852",
                      HR: "#9457F5",
                      Operations: "#F04483",
                    };

                    return (
                      <button
                        key={department}
                        onClick={() => setDepartmentFilter(department)}
                        className="rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
                        style={{
                          backgroundColor: active
                            ? colors.accent
                            : "transparent",
                          color: active
                            ? colors.buttonText
                            : colors.textPrimary,
                          borderColor: active
                            ? colors.accent
                            : colors.cardBorder,
                        }}
                      >
                        {department !== "All Department" && (
                          <span
                            className="mr-2 inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: dotColors[department] }}
                          />
                        )}
                        {department}
                      </button>
                    );
                  })}
                </div>

                {/* Search and zoom controls */}
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2 sm:max-w-md"
                    style={{
                      borderColor: colors.cardBorder,
                      backgroundColor: colors.pageBg,
                    }}
                  >
                    <Search
                      size={17}
                      style={{ color: colors.textSecondary }}
                    />

                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search name, designation, email..."
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                      style={{ color: colors.textPrimary }}
                    />

                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        setZoom((value) =>
                          Math.min(1.5, Number((value + 0.1).toFixed(2)))
                        )
                      }
                      className="rounded-lg border p-2"
                      style={{
                        borderColor: colors.cardBorder,
                        color: colors.textPrimary,
                      }}
                      title="Zoom in"
                    >
                      <ZoomIn size={18} />
                    </button>

                    <span
                      className="min-w-12 text-center text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {Math.round(zoom * 100)}%
                    </span>

                    <button
                      onClick={() =>
                        setZoom((value) =>
                          Math.max(0.4, Number((value - 0.1).toFixed(2)))
                        )
                      }
                      className="rounded-lg border p-2"
                      style={{
                        borderColor: colors.cardBorder,
                        color: colors.textPrimary,
                      }}
                      title="Zoom out"
                    >
                      <ZoomOut size={18} />
                    </button>

                    <button
                      onClick={resetChart}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
                      style={{
                        borderColor: colors.cardBorder,
                        color: colors.textPrimary,
                      }}
                    >
                      <RotateCcw size={15} />
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive tree canvas */}
             <div
  ref={chartViewportRef}
  className="relative overflow-hidden rounded-xl border"
  style={{
    height: "calc(100vh - 300px)",
    minHeight: 350,
    backgroundColor: colors.pageBg,
    borderColor: colors.cardBorder,
    cursor: isDragging ? "grabbing" : "grab",
  }}
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onPointerCancel={handlePointerUp}
>
  {!loadingTree && rootNodes.length > 0 && (
    <div
      ref={chartContentRef}
      className="absolute left-1/2 top-3 w-max"
      style={{
        transform: `translateX(-50%) translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${zoom})`,
        transformOrigin: "top center",
        transition: isDragging ? "none" : "transform 150ms ease-out",
      }}
    >
      <div className="flex items-start justify-center gap-8">
        {rootNodes.map((rootNode) => (
          <OrgNode
            key={rootNode.userId}
            node={rootNode}
            managerMap={managerMap}
            searchTerm={searchTerm}
            departmentFilter={departmentFilter}
            level={0}
          />
        ))}
      </div>
    </div>
  )}

  {loadingTree && (
    <p className="py-20 text-center">Loading hierarchy...</p>
  )}

  {!loadingTree && rootNodes.length === 0 && (
    <p className="py-20 text-center">
      No hierarchy data available.
    </p>
  )}
</div>

              <p
                className="text-xs"
                style={{ color: colors.textSecondary }}
              >
                Tip: Click a manager card to expand or collapse the team.
                Drag the empty chart area to navigate and use zoom controls
                to adjust the view.
              </p>
            </div>
          )}
        </>
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