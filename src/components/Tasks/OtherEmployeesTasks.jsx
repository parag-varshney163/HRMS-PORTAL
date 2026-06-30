/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";

import axiosInstance from "../../api/axiosInstance";
import colors from "../../constants/colors";
import Button from "../ui/Button";


const OtherEmployeesTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTasks, setShowTasks] = useState(false); // 🔥 toggle state

  // 🔹 Fetch API (only when needed)
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/v1/task/others");

      if (res.data?.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching other employees tasks", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Toggle
  const handleToggle = () => {
    if (!showTasks) {
      fetchTasks(); // fetch only first time
    }
    setShowTasks((prev) => !prev);
  };

  // 🔹 Group by employee
  const employeeStats = useMemo(() => {
    const map = {};

    tasks.forEach((task) => {
      const user = task.assignTo;
      if (!user?._id) return;

      if (!map[user._id]) {
        map[user._id] = {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          pending: 0,
          completed: 0,
          tasks: [],
        };
      }

      map[user._id].tasks.push(task);

      if (task.status === "done") {
        map[user._id].completed++;
      } else {
        map[user._id].pending++;
      }
    });

    return Object.values(map).sort((a, b) => b.pending - a.pending);
  }, [tasks]);

  // return (
  //   <div className="p-4">
  //     {/* 🔥 TOGGLE BUTTON */}
  //     <div className="mb-4">
  //       <Button
  //         variant="custom"
  //         bg={showTasks ? "#EF4444" : "#3B82F6"}
  //         text="#FFFFFF"
  //         onClick={handleToggle}
  //       >
  //         {showTasks ? "Hide Other Employees Tasks" : "Show Other Employees Tasks"}
  //       </Button>
  //     </div>

  //     {/* 🔹 CONDITIONAL RENDER */}
  //     {!showTasks ? null : loading ? (
  //       <div className="text-center py-10">Loading...</div>
  //     ) : (
  //       <div className="space-y-6">
  //         {employeeStats.map((emp, idx) => (
  //           <div
  //             key={idx}
  //             className="bg-card border border-card-border rounded-2xl p-5"
  //           >
  //             {/* 🔷 Employee Header */}
  //             <div className="flex justify-between items-center mb-4">
  //               <div>
  //                 <h2 className="text-lg font-bold">{emp.name}</h2>
  //                 <p className="text-xs text-gray-400">{emp.email}</p>
  //               </div>

  //               <div className="text-sm flex gap-4">
  //                 <span className="text-yellow-400">
  //                   Pending: {emp.pending}
  //                 </span>
  //                 <span className="text-green-400">
  //                   Done: {emp.completed}
  //                 </span>
  //               </div>
  //             </div>

  //             {/* 🔥 Task List */}
  //             <div className="space-y-3">
  //               {emp.tasks.map((task) => (
  //                 <div
  //                   key={task._id}
  //                   className="border border-card-border rounded-xl p-3 bg-input/20"
  //                 >
  //                   <div className="flex justify-between items-center mb-2">
  //                     <h3 className="font-semibold text-sm">
  //                       {task.title}
  //                     </h3>

  //                     <span
  //                       className={`text-xs px-2 py-1 rounded ${
  //                         task.status === "done"
  //                           ? "bg-green-500/20 text-green-400"
  //                           : task.status === "in_progress"
  //                           ? "bg-yellow-500/20 text-yellow-400"
  //                           : "bg-blue-500/20 text-blue-400"
  //                       }`}
  //                     >
  //                       {task.status}
  //                     </span>
  //                   </div>

  //                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
  //                     <p><span className="text-gray-400">Priority:</span> {task.priority}</p>
  //                     <p><span className="text-gray-400">Team:</span> {task.team}</p>
  //                     <p><span className="text-gray-400">Dept:</span> {task.department?.name || "-"}</p>
  //                     <p><span className="text-gray-400">Due:</span> {new Date(task.due_date).toLocaleDateString()}</p>
  //                   </div>

  //                   <p className="text-xs text-gray-400 mt-2 line-clamp-2">
  //                     {task.description}
  //                   </p>

  //                   <div className="text-[10px] text-gray-500 mt-2">
  //                     💬 {task.commentsCount} comments
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     )}
  //   </div>
  // );

  return (
  <div className="p-4">
    {/* Toggle Button */}
    <div className="mb-4">
      <Button
        variant="custom"
        bg={showTasks ? colors.danger : colors.blue}
        text={colors.cardBg}
        onClick={handleToggle}
      >
        {showTasks
          ? "Hide Other Employees Tasks"
          : "Show Other Employees Tasks"}
      </Button>
    </div>

    {!showTasks ? null : loading ? (
      <div
        className="text-center py-10"
        style={{ color: colors.textSecondary }}
      >
        Loading...
      </div>
    ) : (
      <div className="space-y-6">
        {employeeStats.map((emp, idx) => (
          <div
            key={idx}
            className="rounded-2xl p-5 border"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: colors.cardBorder,
            }}
          >
            {/* Employee Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  {emp.name}
                </h2>

                <p
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  {emp.email}
                </p>
              </div>

              <div className="text-sm flex gap-4">
                <span style={{ color: colors.warning }}>
                  Pending: {emp.pending}
                </span>

                <span style={{ color: colors.success }}>
                  Done: {emp.completed}
                </span>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {emp.tasks.map((task) => {
                const statusStyles = {
                  done: {
                    backgroundColor: colors.successLight,
                    color: colors.success,
                  },
                  in_progress: {
                    backgroundColor: colors.warningLight,
                    color: colors.warning,
                  },
                  under_review: {
                    backgroundColor: colors.purpleLight,
                    color: colors.purple,
                  },
                  to_do: {
                    backgroundColor: colors.blueLight,
                    color: colors.blue,
                  },
                };

                const statusStyle =
                  statusStyles[task.status] || statusStyles.to_do;

                return (
                  <div
                    key={task._id}
                    className="rounded-xl p-3 border"
                    style={{
                      backgroundColor: colors.inputBg,
                      borderColor: colors.cardBorder,
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3
                        className="font-semibold text-sm"
                        style={{ color: colors.textPrimary }}
                      >
                        {task.title}
                      </h3>

                      <span
                        className="text-xs px-2 py-1 rounded capitalize"
                        style={statusStyle}
                      >
                        {task.status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div
                      className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs"
                      style={{ color: colors.textPrimary }}
                    >
                      <p>
                        <span style={{ color: colors.textSecondary }}>
                          Priority:
                        </span>{" "}
                        {task.priority}
                      </p>

                      <p>
                        <span style={{ color: colors.textSecondary }}>
                          Team:
                        </span>{" "}
                        {task.team}
                      </p>

                      <p>
                        <span style={{ color: colors.textSecondary }}>
                          Department:
                        </span>{" "}
                        {task.department?.name || "-"}
                      </p>

                      <p>
                        <span style={{ color: colors.textSecondary }}>
                          Due:
                        </span>{" "}
                        {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>

                    <p
                      className="text-xs mt-2 line-clamp-2"
                      style={{ color: colors.textSecondary }}
                    >
                      {task.description}
                    </p>

                    <div
                      className="text-[10px] mt-2"
                      style={{ color: colors.textMuted }}
                    >
                      💬 {task.commentsCount} comments
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
};

export default OtherEmployeesTasks;