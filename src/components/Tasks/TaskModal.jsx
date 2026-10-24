// import React, { useState, useRef, useEffect } from "react";
// import { X, UploadCloud, Loader2 } from "lucide-react";
// import axiosInstance from "../../api/axiosInstance";
// import FilterDropDown from "../ui/FilterDropDown";
// import colors from "../../constants/colors";
// import Button from "../ui/Button";
// export default function TaskModal({ open, onClose, onSubmit, initialData, isEmployee }) {
//   const modalRef = useRef(null);
//   // ─── STATE ───
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     assignTo: "", // MongoDB _id for User
//     priority: "high",
//     department: "", // MongoDB _id for Department
//     team: "Frontend",
//     status: "to_do",
//     due_date: "",
//   });
//   const [file, setFile] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   // ─── API DATA STATES ───
//   const [employees, setEmployees] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [loadingData, setLoadingData] = useState(false);
//   const isEditMode = !!initialData;
//   const employeeEditMode = isEmployee && isEditMode;
//   // ─── FETCH EMPLOYEES & DEPARTMENTS ───
//   useEffect(() => {
//     if (open) {
//       setLoadingData(true);
//       Promise.allSettled([
//         axiosInstance.get("/api/v1/user/all-users"),
//         axiosInstance.get("/api/v1/department"),
//       ])
//         .then(([usersRes, deptsRes]) => {
//           if (usersRes.status === "fulfilled" && usersRes.value.data?.success) {
//             setEmployees(usersRes.value.data.data || []);
//           }
//           if (deptsRes.status === "fulfilled" && deptsRes.value.data?.success) {
//             setDepartments(deptsRes.value.data.data || []);
//           }
//         })
//         .catch((err) => console.error("Failed to fetch modal data", err))
//         .finally(() => setLoadingData(false));
//     }
//   }, [open]);
//   // ─── POPULATE DATA ON EDIT ───
//   useEffect(() => {
//     if (initialData) {
//       setForm({
//         title: initialData.title || "",
//         description: initialData.description || "",
//         // Handle nested assignTo object safely during edit mode
//         assignTo: initialData.assignTo?._id || initialData.assignTo || "",
//         priority: initialData.priority || "high",
//         // Handle nested department safely if it comes populated as an object
//         department: initialData.department?._id || initialData.department || "",
//         team: initialData.team || "",
//         status: initialData.status || "to_do",
//         due_date: initialData.due_date
//           ? new Date(initialData.due_date).toISOString().split("T")[0]
//           : "",
//       });
//     } else {
//       setForm({
//         title: "",
//         description: "",
//         assignTo: "",
//         priority: "high",
//         department: "",
//         team: "Frontend",
//         status: "to_do",
//         due_date: "",
//       });
//     }
//     setFile(null);
//   }, [initialData, open]);
//   // ─── HANDLE CLICK OUTSIDE ───
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         onClose();
//       }
//     };
//     if (open) document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [open, onClose]);
//   // ─── HANDLERS ───
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };
//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   // Quick validation check for custom dropdowns
//   //   if (!form.assignTo) {
//   //     alert("Please select an employee.");
//   //     return;
//   //   }
//   //   if (!form.department) {
//   //     alert("Please select a department.");
//   //     return;
//   //   }
//   //   setIsSubmitting(true);
//   //   const formData = new FormData();
//   //   Object.keys(form).forEach((key) => {
//   //     if (form[key]) formData.append(key, form[key]);
//   //   });
//   //   if (file) formData.append("attachments", file);
//   //   const result = await onSubmit(formData, initialData?._id);
//   //   setIsSubmitting(false);
//   //   if (result?.success) onClose();
//   // };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!employeeEditMode) {
//       if (!form.assignTo) {
//         alert("Please select an employee.");
//         return;
//       }
//       if (!form.department) {
//         alert("Please select a department.");
//         return;
//       }
//     }
//     setIsSubmitting(true);
//     const formData = new FormData();
//     if (employeeEditMode) {
//       formData.append("status", form.status);
//     } else {
//       Object.keys(form).forEach((key) => {
//         if (form[key]) formData.append(key, form[key]);
//       });
//       if (file) {
//         formData.append("attachments", file);
//       }
//     }
//     const result = await onSubmit(formData, initialData?._id);
//     setIsSubmitting(false);
//     if (result?.success) {
//       onClose();
//     }
//   };
//   if (!open) return null;
//   // ─── MAPPERS FOR CUSTOM DROPDOWNS ───
//   // 1. Employees Mapper
//   const employeeOptions = employees.map((emp) => emp.name);
//   const selectedEmpObj = employees.find((e) => e._id === form.assignTo);
//   const employeeLabel = selectedEmpObj
//     ? selectedEmpObj.name
//     : "Select Employee...";
//   // 2. Departments Mapper (Formats names like "human_resource" -> "Human Resource")
//   const formatDeptName = (name) =>
//     name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
//   const departmentOptions = departments.map((dept) =>
//     formatDeptName(dept.name),
//   );
//   const selectedDeptObj = departments.find((d) => d._id === form.department);
//   const departmentLabel = selectedDeptObj
//     ? formatDeptName(selectedDeptObj.name)
//     : "Select Department...";
//   // 3. Priority Mapper
//   const priorityMap = { High: "high", Medium: "medium", Low: "low" };
//   const reversePriorityMap = { high: "High", medium: "Medium", low: "Low" };
//   // 4. Status Mapper
//   const statusMap = {
//     "To Do": "to_do",
//     "In Progress": "in_progress",
//     "Under Review": "under_review",
//     Done: "done",
//   };
//   const reverseStatusMap = {
//     to_do: "To Do",
//     in_progress: "In Progress",
//     under_review: "Under Review",
//     done: "Done",
//   };
//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{
//         backgroundColor: "rgba(0,0,0,0.6)",
//         backdropFilter: "blur(6px)",
//       }}
//     >
//       <div
//         ref={modalRef}
//         className="relative w-full max-w-lg rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]"
//         style={{
//           backgroundColor: colors.cardBg,
//           border: `1px solid ${colors.cardBorder}`,
//         }}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6 shrink-0">
//           <h2
//             className="text-xl font-bold"
//             style={{ color: colors.textPrimary }}
//           >
//             {isEditMode ? "Edit Task" : "Create New Task"}
//           </h2>
//           <button
//             onClick={onClose}
//             disabled={isSubmitting}
//             className="bg-transparent border-none cursor-pointer transition-colors disabled:opacity-50"
//             style={{ color: colors.textSecondary }}
//           >
//             <X size={20} />
//           </button>
//         </div>
//         {/* Scrollable Form */}
//         <div className="overflow-y-auto custom-scrollbar pr-2 pb-2">
//           <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
//             {/* Title */}
//             <div>
//               <label
//                 className="block text-sm font-semibold mb-1.5"
//                 style={{ color: colors.textPrimary }}
//               >
//                 Task Title <span style={{ color: colors.danger }}>*</span>
//               </label>
//               <input
//                 name="title"
//                 required
//                 value={form.title}
//                 onChange={handleChange}
//                 type="text"
//                 placeholder="e.g. Update Login UI"
//                 className="w-full rounded-[10px] p-2.5 text-sm focus:outline-none"
//                 style={{
//                   backgroundColor: colors.inputBg,
//                   border: `1px solid ${colors.cardBorder}`,
//                   color: colors.textPrimary,
//                 }}
//                 disabled={employeeEditMode}
//               />
//             </div>
//             {/* Description */}
//             <div>
//               <label
//                 className="block text-sm font-semibold mb-1.5"
//                 style={{ color: colors.textSecondary }}
//               >
//                 Description
//               </label>
//               <textarea
//                 name="description"
//                 value={form.description}
//                 onChange={handleChange}
//                 rows={3}
//                 placeholder="Enter task details..."
//                 className="w-full rounded-[10px] p-2.5 text-sm resize-none focus:outline-none"
//                 style={{
//                   backgroundColor: colors.inputBg,
//                   border: `1px solid ${colors.cardBorder}`,
//                   color: colors.textPrimary,
//                 }}
//                 disabled={employeeEditMode}
//               />
//             </div>
//             {/* Assign */}
//             <div>
//               <label
//                 className="block text-sm font-semibold mb-1.5 flex items-center gap-2"
//                 style={{ color: colors.textPrimary }}
//               >
//                 Assign To <span style={{ color: colors.danger }}>*</span>
//                 {loadingData && (
//                   <Loader2
//                     size={12}
//                     className="animate-spin"
//                     style={{ color: colors.accent }}
//                   />
//                 )}
//               </label>
//               {loadingData ? (
//                 <div
//                   className="w-full py-2.5 px-3.5 rounded-[10px] flex items-center justify-between text-sm"
//                   style={{
//                     backgroundColor: colors.inputBg,
//                     border: `1px solid ${colors.cardBorder}`,
//                     color: colors.textSecondary,
//                   }}
//                 >
//                   Loading...
//                 </div>
//               ) : (
//                 <FilterDropDown
//                   key={`emp-${employeeLabel}`}
//                   options={employeeOptions}
//                   defaultLabel={employeeLabel}
//                   disabled={employeeEditMode}
//                   width="100%"
//                   onSelect={(selectedName) => {
//                     const emp = employees.find((e) => e.name === selectedName);
//                     if (emp) {
//                       handleChange({
//                         target: {
//                           name: "assignTo",
//                           value: emp._id,
//                         },
//                       });
//                     }
//                   }}
//                 />
//               )}
//             </div>
//             {/* Priority & Status */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label
//                   className="block text-sm font-semibold mb-1.5"
//                   style={{ color: colors.textSecondary }}
//                 >
//                   Priority
//                 </label>
//                 <FilterDropDown
//                   key={`priority-${form.priority}`}
//                   options={["High", "Medium", "Low"]}
//                   disabled={employeeEditMode}
//                   defaultLabel={reversePriorityMap[form.priority] || "Medium"}
//                   width="100%"
//                   onSelect={(val) =>
//                     handleChange({
//                       target: {
//                         name: "priority",
//                         value: priorityMap[val],
//                       },
//                     })
//                   }
//                 />
//               </div>
//               <div>
//                 <label
//                   className="block text-sm font-semibold mb-1.5"
//                   style={{ color: colors.textSecondary }}
//                 >
//                   Status
//                 </label>
//                 <FilterDropDown
//                   key={`status-${form.status}`}
//                   options={[
//                     "To Do",
//                     "In Progress",
//                     "Under Review",
//                     "Done",
//                   ]}
//                   defaultLabel={reverseStatusMap[form.status] || "To Do"}
//                   width="100%"
//                   onSelect={(val) =>
//                     handleChange({
//                       target: {
//                         name: "status",
//                         value: statusMap[val],
//                       },
//                     })
//                   }
//                 />
//               </div>
//             </div>
//             {/* Department & Team */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label
//                   className="block text-sm font-semibold mb-1.5"
//                   style={{ color: colors.textSecondary }}
//                 >
//                   Department <span style={{ color: colors.danger }}>*</span>
//                 </label>
//                 {loadingData ? (
//                   <div
//                     className="w-full py-2.5 px-3.5 rounded-[10px]"
//                     style={{
//                       backgroundColor: colors.inputBg,
//                       border: `1px solid ${colors.cardBorder}`,
//                       color: colors.textSecondary,
//                     }}
//                   >
//                     Loading...
//                   </div>
//                 ) : (
//                   <FilterDropDown
//                     key={`dept-${departmentLabel}`}
//                     options={departmentOptions}
//                     disabled={employeeEditMode}
//                     defaultLabel={departmentLabel}
//                     width="100%"
//                     onSelect={(selectedFormattedName) => {
//                       const dept = departments.find(
//                         (d) =>
//                           formatDeptName(d.name) === selectedFormattedName
//                       );
//                       if (dept) {
//                         handleChange({
//                           target: {
//                             name: "department",
//                             value: dept._id,
//                           },
//                         });
//                       }
//                     }}
//                   />
//                 )}
//               </div>
//               <div>
//                 <label
//                   className="block text-sm font-semibold mb-1.5"
//                   style={{ color: colors.textSecondary }}
//                 >
//                   Team
//                 </label>
//                 <input
//                   name="team"
//                   value={form.team}
//                   onChange={handleChange}
//                   type="text"
//                   className="w-full rounded-[10px] p-2.5 text-sm focus:outline-none"
//                   style={{
//                     backgroundColor: colors.inputBg,
//                     border: `1px solid ${colors.cardBorder}`,
//                     color: colors.textPrimary,
//                   }}
//                   disabled={employeeEditMode}
//                 />
//               </div>
//             </div>
//             {/* Due Date */}
//             <div>
//               <label
//                 className="block text-sm font-semibold mb-1.5"
//                 style={{ color: colors.textPrimary }}
//               >
//                 Due Date <span style={{ color: colors.danger }}>*</span>
//               </label>
//               <input
//                 type="date"
//                 name="due_date"
//                 required
//                 value={form.due_date}
//                 onChange={handleChange}
//                 className="w-full rounded-[10px] p-2.5 text-sm focus:outline-none"
//                 style={{
//                   backgroundColor: colors.inputBg,
//                   border: `1px solid ${colors.cardBorder}`,
//                   color: colors.textPrimary,
//                 }}
//                 disabled={employeeEditMode}
//               />
//             </div>
//             {/* Upload */}
//             {!employeeEditMode && (<div>
//               <label
//                 className="block text-sm font-semibold mb-1.5"
//                 style={{ color: colors.textSecondary }}
//               >
//                 Attachments (Optional)
//               </label>
//               <div
//                 className="relative rounded-xl p-4 text-center group"
//                 style={{
//                   border: `2px dashed ${colors.cardBorder}`,
//                   backgroundColor: colors.inputBg,
//                 }}
//               >
//                 <input
//                   type="file"
//                   onChange={(e) => setFile(e.target.files[0])}
//                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                 />
//                 <div className="flex flex-col items-center gap-1">
//                   <UploadCloud
//                     size={20}
//                     style={{ color: colors.textSecondary }}
//                   />
//                   <span
//                     className="text-xs"
//                     style={{ color: colors.textSecondary }}
//                   >
//                     {file ? (
//                       <span
//                         style={{
//                           color: colors.textPrimary,
//                           fontWeight: 500,
//                         }}
//                       >
//                         {file.name}
//                       </span>
//                     ) : (
//                       "Click or drag file to attach"
//                     )}
//                   </span>
//                 </div>
//               </div>
//             </div>)}
//           </form>
//         </div>
//         {/* Footer */}
//         <div
//           className="flex items-center gap-3 mt-6 pt-4 shrink-0"
//           style={{
//             borderTop: `1px solid ${colors.cardBorder}`,
//           }}
//         >
//           <button
//             type="button"
//             onClick={onClose}
//             disabled={isSubmitting}
//             className="flex-1 py-2.5 rounded-[10px] text-sm font-medium cursor-pointer disabled:opacity-50"
//             style={{
//               backgroundColor: "transparent",
//               border: `1px solid ${colors.cardBorder}`,
//               color: colors.textPrimary,
//             }}
//           >
//             Cancel
//           </button>
//           <Button
//             type="submit"
//             form="task-form"
//             disabled={isSubmitting}
//             className="flex-1 justify-center py-2.5 font-medium rounded-[10px]"
//           >
//             {isSubmitting
//               ? "Saving..."
//               : isEditMode
//                 ? "Update Task"
//                 : "Create Task"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useRef, useEffect } from "react";
import { X, UploadCloud, Loader2 } from "lucide-react";

import axiosInstance from "../../api/axiosInstance";
import FilterDropDown from "../ui/FilterDropDown";
import colors from "../../constants/colors";
import Button from "../ui/Button";


export default function TaskModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isEmployee,
}) {
  const modalRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignTo: [],
    priority: "high",
    department: "",
    team: "Frontend",
    status: "to_do",
    due_date: "",
  });

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API data
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const isEditMode = !!initialData;
  const employeeEditMode = isEmployee && isEditMode;

  // Normalize assigned employees into an array of IDs
  const normalizeAssignees = (assignees) => {
    if (!assignees) return [];

    const list = Array.isArray(assignees) ? assignees : [assignees];

    return list
      .map((user) =>
        typeof user === "object" && user !== null ? user._id : user
      )
      .filter(Boolean)
      .map(String);
  };

  // Fetch employees and departments
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const fetchModalData = async () => {
      setLoadingData(true);

      try {
        const results = await Promise.allSettled([
          axiosInstance.get("/api/v1/user/all-users"),
          axiosInstance.get("/api/v1/department"),
        ]);

        if (cancelled) return;

        const [usersRes, deptsRes] = results;

        if (
          usersRes.status === "fulfilled" &&
          usersRes.value.data?.success
        ) {
          setEmployees(usersRes.value.data.data || []);
        } else {
          console.error(
            "Failed to fetch employees:",
            usersRes.status === "rejected"
              ? usersRes.reason
              : "Employee API returned an unsuccessful response"
          );
        }

        if (
          deptsRes.status === "fulfilled" &&
          deptsRes.value.data?.success
        ) {
          setDepartments(deptsRes.value.data.data || []);
        } else {
          console.error(
            "Failed to fetch departments:",
            deptsRes.status === "rejected"
              ? deptsRes.reason
              : "Department API returned an unsuccessful response"
          );
        }
      } catch (error) {
        console.error("Failed to fetch modal data:", error);
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    };

    fetchModalData();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Populate form on edit or reset for create
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        assignTo: normalizeAssignees(initialData.assignTo),
        priority: initialData.priority || "high",
        department:
          typeof initialData.department === "object"
            ? initialData.department?._id || ""
            : initialData.department || "",
        team: initialData.team || "",
        status: initialData.status || "to_do",
        due_date: initialData.due_date
          ? new Date(initialData.due_date).toISOString().split("T")[0]
          : "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        assignTo: [],
        priority: "high",
        department: "",
        team: "Frontend",
        status: "to_do",
        due_date: "",
      });
    }

    setFile(null);
  }, [initialData, open]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  // Generic form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Multi-select employee handler
  const handleAssignToChange = (employeeId) => {
    setForm((prev) => ({
      ...prev,
      assignTo: prev.assignTo.includes(employeeId)
        ? prev.assignTo.filter((id) => id !== employeeId)
        : [...prev.assignTo, employeeId],
    }));
  };

  // Submit task
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!employeeEditMode) {
      if (!form.assignTo.length) {
        alert("Please select at least one employee.");
        return;
      }

      if (!form.department) {
        alert("Please select a department.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      if (employeeEditMode) {
        // Employees can only update task status
        formData.append("status", form.status);
      } else {
        Object.entries(form).forEach(([key, value]) => {
          if (key === "assignTo") {
            // Append once per employee ID for multipart/form-data
            value.forEach((userId) => {
              formData.append("assignTo", userId);
            });
          } else if (value !== "" && value != null) {
            formData.append(key, value);
          }
        });

        if (file) {
          formData.append("attachments", file);
        }
      }

      const result = await onSubmit(formData, initialData?._id);

      if (result?.success) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to submit task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  // Department name formatter
  const formatDeptName = (name = "") =>
    name.replace(/_/g, " ").replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

  // Priority mapping
  const priorityMap = {
    High: "high",
    Medium: "medium",
    Low: "low",
  };

  const reversePriorityMap = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  // Status mapping
  const statusMap = {
    "To Do": "to_do",
    "In Progress": "in_progress",
    "Under Review": "under_review",
    Done: "done",
  };

  const reverseStatusMap = {
    to_do: "To Do",
    in_progress: "In Progress",
    under_review: "Under Review",
    done: "Done",
  };

  const selectedEmployees = employees.filter((employee) =>
    form.assignTo.includes(String(employee._id))
  );

  const departmentOptions = departments.map((department) =>
    formatDeptName(department.name)
  );

  const selectedDepartment = departments.find(
    (department) => department._id === form.department
  );

  const departmentLabel = selectedDepartment
    ? formatDeptName(selectedDepartment.name)
    : "Select Department...";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        ref={modalRef}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl p-6 shadow-2xl"
        style={{
          backgroundColor: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
        }}
      >
        {/* Header */}
        <div className="mb-6 flex shrink-0 items-center justify-between">
          <h2
            className="text-xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            {isEditMode ? "Edit Task" : "Create New Task"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer border-none bg-transparent transition-colors disabled:opacity-50"
            style={{ color: colors.textSecondary }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="custom-scrollbar overflow-y-auto pr-2 pb-2">
          <form
            id="task-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Title */}
            <div>
              <label
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Task Title{" "}
                <span style={{ color: colors.danger }}>*</span>
              </label>

              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                type="text"
                placeholder="e.g. Update Login UI"
                disabled={employeeEditMode}
                className="w-full rounded-[10px] p-2.5 text-sm focus:outline-none"
                style={{
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: colors.textSecondary }}
              >
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Enter task details..."
                disabled={employeeEditMode}
                className="w-full resize-none rounded-[10px] p-2.5 text-sm focus:outline-none"
                style={{
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                }}
              />
            </div>

            {/* Assign To - Multi Employee Selection */}
            <div>
              <label
                className="mb-1.5 flex items-center gap-2 text-sm font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Assign To{" "}
                <span style={{ color: colors.danger }}>*</span>

                {loadingData && (
                  <Loader2
                    size={13}
                    className="animate-spin"
                    style={{ color: colors.accent }}
                  />
                )}
              </label>

              {loadingData ? (
                <div
                  className="w-full rounded-[10px] px-3.5 py-2.5 text-sm"
                  style={{
                    backgroundColor: colors.inputBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textSecondary,
                  }}
                >
                  Loading employees...
                </div>
              ) : (
                <div
                  className="max-h-48 space-y-1 overflow-y-auto rounded-[10px] p-3"
                  style={{
                    backgroundColor: colors.inputBg,
                    border: `1px solid ${colors.cardBorder}`,
                  }}
                >
                  {employees.map((employee) => {
                    const employeeId = String(employee._id);
                    const checked = form.assignTo.includes(employeeId);

                    return (
                      <label
                        key={employee._id}
                        className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm ${
                          employeeEditMode
                            ? "cursor-not-allowed opacity-60"
                            : "cursor-pointer"
                        }`}
                        style={{ color: colors.textPrimary }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={employeeEditMode}
                          onChange={() =>
                            handleAssignToChange(employeeId)
                          }
                          className="h-4 w-4 shrink-0 accent-blue-600"
                        />

                        <span>{employee.name || "Unnamed Employee"}</span>
                      </label>
                    );
                  })}

                  {employees.length === 0 && (
                    <p
                      className="py-2 text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      No employees found.
                    </p>
                  )}
                </div>
              )}

              {/* Selected employees */}
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedEmployees.map((employee) => (
                  <span
                    key={employee._id}
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: colors.blueLight,
                      color: colors.blue,
                    }}
                  >
                    {employee.name}
                  </span>
                ))}
              </div>

              <p
                className="mt-1.5 text-xs"
                style={{ color: colors.textSecondary }}
              >
                {form.assignTo.length} employee(s) selected
              </p>
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: colors.textSecondary }}
                >
                  Priority
                </label>

                <FilterDropDown
                  key={`priority-${form.priority}`}
                  options={["High", "Medium", "Low"]}
                  disabled={employeeEditMode}
                  defaultLabel={
                    reversePriorityMap[form.priority] || "Medium"
                  }
                  width="100%"
                  onSelect={(value) =>
                    handleChange({
                      target: {
                        name: "priority",
                        value: priorityMap[value],
                      },
                    })
                  }
                />
              </div>

              <div>
                <label
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: colors.textSecondary }}
                >
                  Status
                </label>

                <FilterDropDown
                  key={`status-${form.status}`}
                  options={[
                    "To Do",
                    "In Progress",
                    "Under Review",
                    "Done",
                  ]}
                  defaultLabel={
                    reverseStatusMap[form.status] || "To Do"
                  }
                  width="100%"
                  onSelect={(value) =>
                    handleChange({
                      target: {
                        name: "status",
                        value: statusMap[value],
                      },
                    })
                  }
                />
              </div>
            </div>

            {/* Department and Team */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: colors.textSecondary }}
                >
                  Department{" "}
                  {!employeeEditMode && (
                    <span style={{ color: colors.danger }}>*</span>
                  )}
                </label>

                {loadingData ? (
                  <div
                    className="w-full rounded-[10px] px-3.5 py-2.5 text-sm"
                    style={{
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.cardBorder}`,
                      color: colors.textSecondary,
                    }}
                  >
                    Loading...
                  </div>
                ) : (
                  <FilterDropDown
                    key={`dept-${departmentLabel}`}
                    options={departmentOptions}
                    disabled={employeeEditMode}
                    defaultLabel={departmentLabel}
                    width="100%"
                    onSelect={(selectedName) => {
                      const department = departments.find(
                        (item) =>
                          formatDeptName(item.name) === selectedName
                      );

                      if (department) {
                        handleChange({
                          target: {
                            name: "department",
                            value: department._id,
                          },
                        });
                      }
                    }}
                  />
                )}
              </div>

              <div>
                <label
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: colors.textSecondary }}
                >
                  Team
                </label>

                <input
                  name="team"
                  value={form.team}
                  onChange={handleChange}
                  type="text"
                  disabled={employeeEditMode}
                  className="w-full rounded-[10px] p-2.5 text-sm focus:outline-none"
                  style={{
                    backgroundColor: colors.inputBg,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.textPrimary,
                  }}
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Due Date{" "}
                {!employeeEditMode && (
                  <span style={{ color: colors.danger }}>*</span>
                )}
              </label>

              <input
                type="date"
                name="due_date"
                required={!employeeEditMode}
                value={form.due_date}
                onChange={handleChange}
                disabled={employeeEditMode}
                className="w-full rounded-[10px] p-2.5 text-sm focus:outline-none"
                style={{
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                }}
              />
            </div>

            {/* Attachments */}
            {!employeeEditMode && (
              <div>
                <label
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: colors.textSecondary }}
                >
                  Attachments (Optional)
                </label>

                <div
                  className="group relative rounded-xl p-4 text-center"
                  style={{
                    border: `2px dashed ${colors.cardBorder}`,
                    backgroundColor: colors.inputBg,
                  }}
                >
                  <input
                    type="file"
                    onChange={(event) =>
                      setFile(event.target.files?.[0] || null)
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />

                  <div className="flex flex-col items-center gap-1">
                    <UploadCloud
                      size={20}
                      style={{ color: colors.textSecondary }}
                    />

                    <span
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {file ? (
                        <span
                          style={{
                            color: colors.textPrimary,
                            fontWeight: 500,
                          }}
                        >
                          {file.name}
                        </span>
                      ) : (
                        "Click or drag file to attach"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div
          className="mt-6 flex shrink-0 items-center gap-3 border-t pt-4"
          style={{ borderColor: colors.cardBorder }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 cursor-pointer rounded-[10px] py-2.5 text-sm font-medium disabled:opacity-50"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textPrimary,
            }}
          >
            Cancel
          </button>

          <Button
            type="submit"
            form="task-form"
            disabled={isSubmitting || loadingData}
            className="flex-1 justify-center rounded-[10px] py-2.5 font-medium"
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
                ? "Update Task"
                : "Create Task"}
          </Button>
        </div>
      </div>
    </div>
  );
}
