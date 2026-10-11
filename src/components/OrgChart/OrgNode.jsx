import { Crown, UserRound, Shield, Code, Palette, Headphones, ChevronDown, ChevronRight, } from "lucide-react";
// // import { Crown, UserRound, Shield, Code, Palette, Headphones, } from "lucide-react";
// // import colors from "../../constants/colors";
// // const getIcon = (role) => {
// //   const r = role?.toLowerCase() || "";
// //   if (r.includes("director"))
// //     return <Crown size={18} color="#fff" />;
// //   if (r.includes("manager"))
// //     return <UserRound size={18} color="#fff" />;
// //   if (r.includes("developer"))
// //     return <Code size={18} color="#fff" />;
// //   if (r.includes("designer"))
// //     return <Palette size={18} color="#fff" />;
// //   if (r.includes("operations"))
// //     return <Headphones size={18} color="#fff" />;
// //   return <Shield size={18} color="#fff" />;
// // };
// // const getCardColor = (dept) => {
// //   const name = dept?.toLowerCase() || "";
// //   if (name.includes("tech")) return "#4169B1";
// //   if (name.includes("design")) return "#5B50C8";
// //   if (name.includes("trust")) return "#A53F36";
// //   if (name.includes("creator")) return "#3D7B65";
// //   if (name.includes("human")) return "#8A5A20";
// //   return "#444";
// // };
// // export default function OrgNode({ node }) {
// //   if (!node) return null;
// //   const bg = getCardColor(node.department?.name);
// //   return (
// //     <div className="flex flex-col items-center w-full">
// //       {/* Card */}
// //       <div
// //         className="rounded-2xl px-4 py-4 w-[180px] shadow-md"
// //         style={{
// //           background: bg,
// //         }}
// //       >
// //         <div className="flex justify-center mb-2">
// //           {getIcon(node.roleTitle)}
// //         </div>
// //         <h3 className="text-white font-bold text-base text-center leading-5">
// //           {node.user
// //             ? `${node.user.firstName} ${node.user.lastName}`
// //             : "Vacant"}
// //         </h3>
// //         <p className="text-white/80 text-sm text-center mt-1">
// //           {node.roleTitle}
// //         </p>
// //       </div>
// //       {/* Children */}
// //       {node.reports?.length > 0 && (
// //         <>
// //           {/* Vertical Line */}
// //           <div
// //             className="w-[2px] h-8"
// //             style={{
// //               background: colors.cardBorder,
// //             }}
// //           />
// //           {/* Children Container */}
// //           <div className="relative flex flex-wrap justify-center gap-4 max-w-[1200px]">
// //             {/* Horizontal Line */}
// //             <div
// //               className="absolute top-0 left-6 right-6 h-[2px]"
// //               style={{
// //                 background: colors.cardBorder,
// //               }}
// //             />
// //             {node.reports.map((child) => (
// //               <div
// //                 key={child._id}
// //                 className="relative flex flex-col items-center pt-5"
// //               >
// //                 {/* Child Vertical Line */}
// //                 <div
// //                   className="absolute top-0 w-[2px] h-5"
// //                   style={{
// //                     background: colors.cardBorder,
// //                   }}
// //                 />
// //                 <OrgNode node={child} />
// //               </div>
// //             ))}
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );
// // }
// import { Crown, UserRound, Shield, Code, Palette, Headphones, } from "lucide-react";
// import colors from "../../constants/colors";
// const getIcon = (role = "") => {
//   const r = role.toLowerCase();
//   if (r.includes("director")) return <Crown size={18} color="#fff" />;
//   if (r.includes("manager")) return <UserRound size={18} color="#fff" />;
//   if (r.includes("developer")) return <Code size={18} color="#fff" />;
//   if (r.includes("designer")) return <Palette size={18} color="#fff" />;
//   if (r.includes("operations")) return <Headphones size={18} color="#fff" />;
//   return <Shield size={18} color="#fff" />;
// };
// const getCardColor = (dept = "") => {
//   const name = dept.toLowerCase();
//   if (name.includes("tech")) return "#4169B1";
//   if (name.includes("design")) return "#5B50C8";
//   if (name.includes("trust")) return "#A53F36";
//   if (name.includes("creator")) return "#3D7B65";
//   if (name.includes("human")) return "#8A5A20";
//   return "#444";
// };
// export default function OrgNode({ node, managerMap }) {
//   if (!node) return null;
//   const bg = getCardColor(node.department);
//   return (
//     <div className="flex flex-col items-center shrink-0">
//       <div
//         className="rounded-2xl px-4 py-4 w-[180px] shadow-md"
//         style={{ background: bg }}
//       >
//         <div className="flex justify-center mb-2">
//           {getIcon(node.roleTitle)}
//         </div>
//         <h3 className="text-white font-bold text-base text-center">
//           {node.name}
//         </h3>
//         <p className="text-white/80 text-sm text-center mt-1">
//           {node.roleTitle}
//         </p>
//       </div>
//       {node.reports?.length > 0 && (
//         <>
//           <div
//             className="w-[2px] h-8"
//             style={{ background: colors.cardBorder }}
//           />
//           <div className="relative flex items-start justify-center gap-6">
//             <div
//               className="absolute top-0 left-6 right-6 h-[2px]"
//               style={{
//                 background: colors.cardBorder,
//               }}
//             />
//             {node.reports.map((employee) => {
//               const childNode = employee.isManager
//                 ? managerMap[employee.userId]
//                 : null;
//               const bg = getCardColor(employee.department);
//               return (
//                 <div
//                   key={employee.id}
//                   className="relative flex flex-col items-center pt-5"
//                 >
//                   <div
//                     className="absolute top-0 w-[2px] h-5"
//                     style={{
//                       background: colors.cardBorder,
//                     }}
//                   />
//                   {childNode ? (
//                     <OrgNode
//                       node={childNode}
//                       managerMap={managerMap}
//                     />
//                   ) : (
//                     <div
//                       className="rounded-2xl px-4 py-4 w-[180px] shadow-md"
//                       style={{
//                         background: bg,
//                       }}
//                     >
//                       <div className="flex justify-center mb-2">
//                         {getIcon(employee.roleTitle)}
//                       </div>
//                       <h3 className="text-white font-bold text-base text-center">
//                         {employee.name}
//                       </h3>
//                       <p className="text-white/80 text-sm text-center mt-1">
//                         {employee.roleTitle}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
import React, { useMemo, useState } from "react";

import colors from "../../constants/colors";


const normalize = (value = "") =>
  String(value).toLowerCase().replace(/[_-]/g, " ").trim();

const getDepartment = (department = "", role = "") => {
  const dept = normalize(department);
  const designation = normalize(role);

  if (
    dept === "tech" ||
    dept.includes("technology") ||
    dept.includes("software") ||
    dept.includes("quality") ||
    dept.includes("engineering") ||
    dept.includes("developer")
  ) {
    return "Tech";
  }

  if (
    dept.includes("marketing") ||
    dept.includes("content") ||
    dept.includes("design") ||
    designation.includes("marketing") ||
    designation.includes("designer") ||
    designation.includes("content strategist") ||
    designation.includes("video editor")
  ) {
    return "Marketing";
  }

  if (
    dept === "hr" ||
    dept.includes("human resource") ||
    dept.includes("people")
  ) {
    return "HR";
  }

  if (
    dept.includes("operation") ||
    dept.includes("moderation") ||
    dept.includes("trust") ||
    dept.includes("safety") ||
    dept.includes("data analyst") ||
    designation.includes("operation") ||
    designation.includes("moderation") ||
    designation.includes("program manager")
  ) {
    return "Operations";
  }

  return "Other";
};

const departmentStyles = {
  Tech: {
    color: "#4169FF",
    background: "#F0F4FF",
    border: "#A8BEFF",
  },
  Marketing: {
    color: "#36A852",
    background: "#F0FAF0",
    border: "#9BD6A8",
  },
  HR: {
    color: "#9457F5",
    background: "#F7F1FF",
    border: "#C3A1FF",
  },
  Operations: {
    color: "#F04483",
    background: "#FFF1F5",
    border: "#FFADC9",
  },
  Other: {
    color: colors.accent,
    background: colors.cardBg,
    border: colors.cardBorder,
  },
};

const getIcon = (role = "") => {
  const value = normalize(role);

  if (
    value.includes("ceo") ||
    value.includes("chief executive")
  ) {
    return Crown;
  }

  if (
    value.includes("manager") ||
    value.includes("chief") ||
    value.includes("director")
  ) {
    return UserRound;
  }

  if (
    value.includes("developer") ||
    value.includes("engineer")
  ) {
    return Code;
  }

  if (
    value.includes("designer") ||
    value.includes("content")
  ) {
    return Palette;
  }

  if (
    value.includes("operation") ||
    value.includes("moderation")
  ) {
    return Headphones;
  }

  return Shield;
};

const getEmployeeDepartment = (employee) =>
  getDepartment(employee?.department, employee?.roleTitle);

const matchesEmployee = (
  employee,
  searchTerm,
  departmentFilter
) => {
  const matchesDepartment =
    departmentFilter === "All Department" ||
    getEmployeeDepartment(employee) === departmentFilter;

  const query = normalize(searchTerm);

  const matchesSearch =
    !query ||
    [
      employee?.name,
      employee?.roleTitle,
      employee?.department,
      employee?.email,
    ].some((value) => normalize(value).includes(query));

  return matchesDepartment && matchesSearch;
};

/**
 * Resolves a report to its complete manager record when possible.
 * Regular employees remain leaf nodes.
 */
const resolveNode = (employee, managerMap) => {
  if (employee?.isManager && managerMap[employee.userId]) {
    return managerMap[employee.userId];
  }

  return employee;
};

/**
 * Returns true when a person or any of their descendants matches
 * the active search and department filter.
 */
const hasMatchingDescendant = (
  node,
  managerMap,
  searchTerm,
  departmentFilter,
  visited = new Set()
) => {
  if (!node) return false;

  const id = node.userId;

  // Prevent accidental infinite recursion from cyclic manager data.
  if (id && visited.has(id)) return false;

  const nextVisited = new Set(visited);

  if (id) nextVisited.add(id);

  if (matchesEmployee(node, searchTerm, departmentFilter)) {
    return true;
  }

  return (node.reports || []).some((employee) => {
    const child = resolveNode(employee, managerMap);

    return hasMatchingDescendant(
      child,
      managerMap,
      searchTerm,
      departmentFilter,
      nextVisited
    );
  });
};

function EmployeeCard({ employee }) {
  const department = getEmployeeDepartment(employee);
  const style = departmentStyles[department] || departmentStyles.Other;
  const Icon = getIcon(employee.roleTitle);

  const name = employee.name || "Unknown Employee";

  const avatar =
    employee.avatar ||
    employee.profilePhoto ||
    employee.profileImage ||
    employee.profilePicture ||
    employee.photo ||
    employee.image;

  return (
    <div
      className="flex w-[150px] shrink-0 flex-col items-center rounded-xl border p-3 text-center shadow-sm"
      style={{
        minHeight: 150,
        backgroundColor: colors.cardBg,
        borderColor: style.border,
      }}
      title={`${name} — ${employee.roleTitle || "Employee"}`}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white"
        style={{ borderColor: style.border }}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <Icon size={22} color={style.color} />
        )}
      </div>

      <p
        className="mt-2 w-full truncate text-sm font-bold"
        style={{ color: colors.textPrimary }}
      >
        {name}
      </p>

      <p
        className="mt-1 line-clamp-2 text-xs"
        style={{ color: colors.textSecondary }}
      >
        {employee.roleTitle || "Employee"}
      </p>

      <span
        className="mt-2 max-w-full truncate rounded-full border px-2 py-0.5 text-[10px]"
        style={{
          color: style.color,
          backgroundColor: style.background,
          borderColor: style.border,
        }}
      >
        {department === "Other"
          ? employee.department || "Other"
          : department}
      </span>
    </div>
  );
}

export default function OrgNode({
  node,
  managerMap = {},
  searchTerm = "",
  departmentFilter = "All Department",
  level = 0,
}) {
  const [expanded, setExpanded] = useState(true);

  const isRoot = level === 0;
  const reports = node?.reports || [];
  const hasChildren = reports.length > 0;

  const department = getEmployeeDepartment(node);
  const style = departmentStyles[department] || departmentStyles.Other;
  const Icon = getIcon(node?.roleTitle);

  const name = node?.name || "Unknown Employee";

  const avatar =
    node?.avatar ||
    node?.profilePhoto ||
    node?.profileImage ||
    node?.profilePicture ||
    node?.photo ||
    node?.image;

  const hasActiveFilter =
    Boolean(searchTerm.trim()) ||
    departmentFilter !== "All Department";

  const visibleChildren = useMemo(() => {
    return reports.filter((employee) => {
      const child = resolveNode(employee, managerMap);

      // Show all employees when no filter is active.
      if (!hasActiveFilter) return true;

      // Always preserve a path to employees matching the filter.
      return hasMatchingDescendant(
        child,
        managerMap,
        searchTerm,
        departmentFilter
      );
    });
  }, [
    reports,
    managerMap,
    searchTerm,
    departmentFilter,
    hasActiveFilter,
  ]);

  // Keep the top-level leadership visible while filtering.
  // Hide unrelated managers and employees.
  const nodeMatches = matchesEmployee(
    node,
    searchTerm,
    departmentFilter
  );

  const shouldRender =
    isRoot ||
    !hasActiveFilter ||
    nodeMatches ||
    visibleChildren.length > 0;

  if (!node || !shouldRender) return null;

  // const cardWidth = isRoot ? 306 : level === 1 ? 272 : 190;
  // const cardHeight = level <= 1 ? 112 : 140;
  const cardWidth = isRoot ? 230 : level === 1 ? 210 : 145;
const cardHeight = level <= 1 ? 82 : 105;

  return (
    <div className="org-node flex shrink-0 flex-col items-center">
      {/* Employee / Manager Card */}
      <button
        type="button"
        onClick={() => {
          if (hasChildren) {
            setExpanded((previous) => !previous);
          }
        }}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-label={
          hasChildren
            ? `${expanded ? "Collapse" : "Expand"} team of ${name}`
            : name
        }
        className="relative flex shrink-0 items-center gap-4 rounded-xl border-2 p-3 text-left transition-shadow duration-200 hover:shadow-lg"
        style={{
          width: cardWidth,
          minHeight: cardHeight,
          backgroundColor: style.background,
          borderColor: isRoot ? colors.accent : style.border,
          cursor: hasChildren ? "pointer" : "default",
        }}
      >
        <div
          className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-white"
          style={{
            width: level <= 1 ? 70 : 48,
            height: level <= 1 ? 70 : 48,
            borderColor: style.border,
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Icon size={level <= 1 ? 26 : 21} color={style.color} />
          )}
        </div>

        <div className="min-w-0 flex-1 pb-1">
          <p
            className="truncate font-bold"
            style={{
              fontSize: isRoot ? 19 : level === 1 ? 17 : 14,
              color: colors.textPrimary,
            }}
            title={name}
          >
            {name}
          </p>

          <p
            className="mt-1 line-clamp-2 text-xs"
            style={{ color: colors.textSecondary }}
          >
            {node.roleTitle || "Employee"}
          </p>

          <span
            className="mt-2 inline-block max-w-full truncate rounded-full border px-2 py-0.5 text-[11px] font-medium"
            style={{
              color: style.color,
              backgroundColor: style.background,
              borderColor: style.border,
            }}
          >
            {department === "Other"
              ? node.department || "Other"
              : department}
          </span>
        </div>

        {hasChildren && (
          <span
            className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full border bg-white"
            style={{
              borderColor: colors.cardBorder,
              color: colors.textSecondary,
            }}
          >
            {expanded ? (
              <ChevronDown size={13} />
            ) : (
              <ChevronRight size={13} />
            )}
          </span>
        )}
      </button>

      {/* Reporting team */}
      {/* {hasChildren && expanded && visibleChildren.length > 0 && (
        <>
          
          <div
            className="h-6 w-px shrink-0"
            style={{ backgroundColor: style.border }}
          />

          <div className="org-children relative flex items-start justify-center gap-5 pt-5">
            
            {visibleChildren.length > 1 && (
              <div
                className="absolute top-0 h-px"
                style={{
                  left: "calc(50% - 75px)",
                  right: "calc(50% - 75px)",
                  backgroundColor: style.border,
                }}
              />
            )}

            {visibleChildren.map((employee) => {
              const childNode = resolveNode(employee, managerMap);

              return (
                <div
                  key={employee.userId || employee.id}
                  className="relative flex shrink-0 flex-col items-center"
                >
                  
                  <div
                    className="absolute top-0 h-5 w-px"
                    style={{ backgroundColor: style.border }}
                  />

                  {employee.isManager &&
                  managerMap[employee.userId] ? (
                    <OrgNode
                      node={childNode}
                      managerMap={managerMap}
                      searchTerm={searchTerm}
                      departmentFilter={departmentFilter}
                      level={level + 1}
                    />
                  ) : (
                    <EmployeeCard employee={employee} />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )} */}
      {/* Vertical Reporting Tree */}
{hasChildren && expanded && visibleChildren.length > 0 && (
  <>
    {/* Parent to children vertical line */}
    <div
      className="h-8 w-px"
      style={{ backgroundColor: style.border }}
    />

    <div className="relative flex flex-col items-center gap-6">

      {/* Horizontal connector */}
      {visibleChildren.length > 1 && (
        <div
          className="absolute top-0 h-px"
          style={{
            width: `${visibleChildren.length * 180}px`,
            backgroundColor: style.border,
          }}
        />
      )}

      <div className="flex justify-center gap-10 pt-5">

        {visibleChildren.map((employee) => {
          const childNode = resolveNode(employee, managerMap);

          return (
            <div
              key={employee.userId || employee.id}
              className="relative flex flex-col items-center"
            >

              {/* Vertical connector */}
              <div
                className="absolute -top-5 h-5 w-px"
                style={{
                  backgroundColor: style.border,
                }}
              />

              {employee.isManager &&
              managerMap[employee.userId] ? (
                <OrgNode
                  node={childNode}
                  managerMap={managerMap}
                  searchTerm={searchTerm}
                  departmentFilter={departmentFilter}
                  level={level + 1}
                />
              ) : (
                <EmployeeCard employee={employee} />
              )}

            </div>
          );
        })}

      </div>
    </div>
  </>
)}
    </div>
  );
}