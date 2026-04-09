// /* eslint-disable react-hooks/set-state-in-effect */
// import React, { useState, useRef, useEffect } from "react";
// import { X, UploadCloud } from "lucide-react";
// import Button from "../ui/Button";

// export default function TaskModal({ open, onClose, onSubmit, initialData }) {
//   const modalRef = useRef(null);

//   // ─── STATE ───
//   // 🚨 CRITICAL FIX: Added `assignTo` to the state to satisfy backend validation
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     assignTo: "", // Will hold the MongoDB _id of the user
//     priority: "high",
//     department: "",
//     team: "Frontend",
//     status: "to_do",
//     due_date: "",
//   });
//   const [file, setFile] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const isEditMode = !!initialData;

//   // ─── POPULATE DATA ON EDIT ───
//   useEffect(() => {
//     if (initialData) {
//       setForm({
//         title: initialData.title || "",
//         description: initialData.description || "",
//         // 🚨 Handle nested assignTo object safely during edit mode
//         assignTo: initialData.assignTo?._id || initialData.assignTo || "",
//         priority: initialData.priority || "high",
//         department: initialData.department || "",
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
//         assignTo: "", // Reset on close
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

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     const formData = new FormData();
//     Object.keys(form).forEach((key) => {
//       // Only append if the value exists
//       if (form[key]) formData.append(key, form[key]);
//     });

//     if (file) {
//       formData.append("attachments", file);
//     }

//     const result = await onSubmit(formData, initialData?._id);

//     setIsSubmitting(false);
//     if (result?.success) {
//       onClose();
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 p-4">
//       <div
//         ref={modalRef}
//         className="relative w-full max-w-lg bg-card border border-card-border rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]"
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6 shrink-0">
//           <h2 className="text-xl font-bold text-text-primary">
//             {isEditMode ? "Edit Task" : "Create New Task"}
//           </h2>
//           <button
//             onClick={onClose}
//             disabled={isSubmitting}
//             className="text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Scrollable Form */}
//         <div className="overflow-y-auto custom-scrollbar pr-2 pb-2">
//           <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-semibold text-text-primary mb-1.5">
//                 Task Title <span className="text-red-500">*</span>
//               </label>
//               <input
//                 name="title"
//                 required
//                 value={form.title}
//                 onChange={handleChange}
//                 type="text"
//                 placeholder="e.g. Update Login UI"
//                 className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn transition-colors"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-text-secondary mb-1.5">
//                 Description
//               </label>
//               <textarea
//                 name="description"
//                 value={form.description}
//                 onChange={handleChange}
//                 rows={3}
//                 placeholder="Enter task details..."
//                 className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn resize-none transition-colors"
//               />
//             </div>

//             {/* 🚨 CRITICAL FIX: ADDED ASSIGN TO FIELD */}
//             <div>
//               <label className="block text-sm font-semibold text-text-primary mb-1.5">
//                 Assign To (User ID) <span className="text-red-500">*</span>
//               </label>
//               <input
//                 name="assignTo"
//                 required
//                 value={form.assignTo}
//                 onChange={handleChange}
//                 type="text"
//                 placeholder="Paste MongoDB User ID (e.g. 64bfc...)"
//                 className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn transition-colors"
//               />
//               <p className="text-[10px] text-text-secondary mt-1">
//                 temporary until we did not create all employee list from the
//                 API.
//               </p>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-semibold text-text-secondary mb-1.5">
//                   Priority
//                 </label>
//                 <select
//                   name="priority"
//                   value={form.priority}
//                   onChange={handleChange}
//                   className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn cursor-pointer"
//                 >
//                   <option value="high">High</option>
//                   <option value="medium">Medium</option>
//                   <option value="low">Low</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-text-secondary mb-1.5">
//                   Status
//                 </label>
//                 <select
//                   name="status"
//                   value={form.status}
//                   onChange={handleChange}
//                   className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn cursor-pointer"
//                 >
//                   <option value="to_do">To Do</option>
//                   <option value="in_progress">In Progress</option>
//                   <option value="under_review">Under Review</option>
//                   <option value="done">Done</option>
//                 </select>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-semibold text-text-secondary mb-1.5">
//                   Department (ID)
//                 </label>
//                 <input
//                   name="department"
//                   value={form.department}
//                   onChange={handleChange}
//                   type="text"
//                   placeholder="Dept ID..."
//                   className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn transition-colors"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-text-secondary mb-1.5">
//                   Team
//                 </label>
//                 <input
//                   name="team"
//                   value={form.team}
//                   onChange={handleChange}
//                   type="text"
//                   placeholder="e.g. Frontend"
//                   className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn transition-colors"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-text-primary mb-1.5">
//                 Due Date <span className="text-red-500">*</span>
//               </label>
//               <input
//                 name="due_date"
//                 required
//                 value={form.due_date}
//                 onChange={handleChange}
//                 type="date"
//                 className="w-full bg-input border border-card-border rounded-lg p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
//               />
//             </div>

//             {/* File Upload Zone */}
//             <div>
//               <label className="block text-sm font-semibold text-text-secondary mb-1.5">
//                 Attachments (Optional)
//               </label>
//               <div className="relative border-2 border-dashed border-card-border rounded-xl p-4 text-center hover:border-btn/50 transition-colors bg-input/30 group">
//                 <input
//                   type="file"
//                   onChange={(e) => setFile(e.target.files[0])}
//                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                 />
//                 <div className="flex flex-col items-center gap-1">
//                   <UploadCloud
//                     size={20}
//                     className="text-text-secondary group-hover:text-btn transition-colors"
//                   />
//                   <span className="text-xs text-text-secondary">
//                     {file ? (
//                       <span className="text-text-primary font-medium">
//                         {file.name}
//                       </span>
//                     ) : (
//                       "Click or drag file to attach"
//                     )}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>

//         {/* Footer Buttons */}
//         <div className="flex items-center gap-3 mt-6 pt-4 border-t border-card-border shrink-0">
//           <button
//             type="button"
//             onClick={onClose}
//             disabled={isSubmitting}
//             className="flex-1 py-2.5 rounded-xl border border-card-border text-sm font-medium text-text-primary hover:bg-input transition-colors bg-transparent cursor-pointer disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <Button
//             type="submit"
//             form="task-form"
//             disabled={isSubmitting}
//             className="flex-1 justify-center py-2.5 font-medium"
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

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useRef, useEffect } from "react";
import { X, UploadCloud, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import axiosInstance from "../../api/axiosInstance";
import FilterDropDown from "../ui/FilterDropDown";

export default function TaskModal({ open, onClose, onSubmit, initialData }) {
  const modalRef = useRef(null);

  // ─── STATE ───
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignTo: "", // MongoDB _id for User
    priority: "high",
    department: "", // MongoDB _id for Department
    team: "Frontend",
    status: "to_do",
    due_date: "",
  });

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── API DATA STATES ───
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const isEditMode = !!initialData;

  // ─── FETCH EMPLOYEES & DEPARTMENTS ───
  useEffect(() => {
    if (open) {
      setLoadingData(true);
      Promise.allSettled([
        axiosInstance.get("/api/v1/user/all-users"),
        axiosInstance.get("/api/v1/department"),
      ])
        .then(([usersRes, deptsRes]) => {
          if (usersRes.status === "fulfilled" && usersRes.value.data?.success) {
            setEmployees(usersRes.value.data.data || []);
          }
          if (deptsRes.status === "fulfilled" && deptsRes.value.data?.success) {
            setDepartments(deptsRes.value.data.data || []);
          }
        })
        .catch((err) => console.error("Failed to fetch modal data", err))
        .finally(() => setLoadingData(false));
    }
  }, [open]);

  // ─── POPULATE DATA ON EDIT ───
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        // Handle nested assignTo object safely during edit mode
        assignTo: initialData.assignTo?._id || initialData.assignTo || "",
        priority: initialData.priority || "high",
        // Handle nested department safely if it comes populated as an object
        department: initialData.department?._id || initialData.department || "",
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
        assignTo: "",
        priority: "high",
        department: "",
        team: "Frontend",
        status: "to_do",
        due_date: "",
      });
    }
    setFile(null);
  }, [initialData, open]);

  // ─── HANDLE CLICK OUTSIDE ───
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  // ─── HANDLERS ───
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Quick validation check for custom dropdowns
    if (!form.assignTo) {
      alert("Please select an employee.");
      return;
    }
    if (!form.department) {
      alert("Please select a department.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });

    if (file) formData.append("attachments", file);

    const result = await onSubmit(formData, initialData?._id);
    setIsSubmitting(false);
    if (result?.success) onClose();
  };

  if (!open) return null;

  // ─── MAPPERS FOR CUSTOM DROPDOWNS ───

  // 1. Employees Mapper
  const employeeOptions = employees.map((emp) => emp.name);
  const selectedEmpObj = employees.find((e) => e._id === form.assignTo);
  const employeeLabel = selectedEmpObj
    ? selectedEmpObj.name
    : "Select Employee...";

  // 2. Departments Mapper (Formats names like "human_resource" -> "Human Resource")
  const formatDeptName = (name) =>
    name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const departmentOptions = departments.map((dept) =>
    formatDeptName(dept.name),
  );
  const selectedDeptObj = departments.find((d) => d._id === form.department);
  const departmentLabel = selectedDeptObj
    ? formatDeptName(selectedDeptObj.name)
    : "Select Department...";

  // 3. Priority Mapper
  const priorityMap = { High: "high", Medium: "medium", Low: "low" };
  const reversePriorityMap = { high: "High", medium: "Medium", low: "Low" };

  // 4. Status Mapper
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 p-4">
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-card border border-card-border rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-xl font-bold text-text-primary">
            {isEditMode ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-text-secondary hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto custom-scrollbar pr-2 pb-2">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                required
                value={form.title}
                onChange={handleChange}
                type="text"
                placeholder="e.g. Update Login UI"
                className="w-full bg-input border border-card-border rounded-[10px] p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Enter task details..."
                className="w-full bg-input border border-card-border rounded-[10px] p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn resize-none transition-colors"
              />
            </div>

            {/* 🚨 CUSTOM DROPDOWN: ASSIGN TO */}
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5 flex items-center gap-2">
                Assign To <span className="text-red-500">*</span>
                {loadingData && (
                  <Loader2 size={12} className="animate-spin text-accent" />
                )}
              </label>
              {loadingData ? (
                <div className="w-full py-2.5 px-3.5 bg-input text-text-secondary rounded-[10px] border border-card-border flex items-center justify-between text-sm">
                  Loading...
                </div>
              ) : (
                <FilterDropDown
                  key={`emp-${employeeLabel}`} // Forces re-render when employee maps
                  options={employeeOptions}
                  defaultLabel={employeeLabel}
                  width="100%"
                  onSelect={(selectedName) => {
                    // Reverse map the selected Name back into the MongoDB _id
                    const emp = employees.find((e) => e.name === selectedName);
                    if (emp)
                      handleChange({
                        target: { name: "assignTo", value: emp._id },
                      });
                  }}
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 🚨 CUSTOM DROPDOWN: PRIORITY */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  Priority
                </label>
                <FilterDropDown
                  key={`priority-${form.priority}`}
                  options={["High", "Medium", "Low"]}
                  defaultLabel={reversePriorityMap[form.priority] || "Medium"}
                  width="100%"
                  onSelect={(val) =>
                    handleChange({
                      target: { name: "priority", value: priorityMap[val] },
                    })
                  }
                />
              </div>

              {/* 🚨 CUSTOM DROPDOWN: STATUS */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  Status
                </label>
                <FilterDropDown
                  key={`status-${form.status}`}
                  options={["To Do", "In Progress", "Under Review", "Done"]}
                  defaultLabel={reverseStatusMap[form.status] || "To Do"}
                  width="100%"
                  onSelect={(val) =>
                    handleChange({
                      target: { name: "status", value: statusMap[val] },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 🚨 CUSTOM DROPDOWN: DEPARTMENT */}
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5 flex items-center gap-2">
                  Department <span className="text-red-500">*</span>
                </label>
                {loadingData ? (
                  <div className="w-full py-2.5 px-3.5 bg-input text-text-secondary rounded-[10px] border border-card-border flex items-center justify-between text-sm">
                    Loading...
                  </div>
                ) : (
                  <FilterDropDown
                    key={`dept-${departmentLabel}`}
                    options={departmentOptions}
                    defaultLabel={departmentLabel}
                    width="100%"
                    onSelect={(selectedFormattedName) => {
                      // Reverse map the formatted name back to the original _id
                      const dept = departments.find(
                        (d) => formatDeptName(d.name) === selectedFormattedName,
                      );
                      if (dept)
                        handleChange({
                          target: { name: "department", value: dept._id },
                        });
                    }}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                  Team
                </label>
                <input
                  name="team"
                  value={form.team}
                  onChange={handleChange}
                  type="text"
                  placeholder="e.g. Frontend"
                  className="w-full bg-input border border-card-border rounded-[10px] p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                name="due_date"
                required
                value={form.due_date}
                onChange={handleChange}
                type="date"
                className="w-full bg-input border border-card-border rounded-[10px] p-2.5 text-text-primary text-sm focus:outline-none focus:border-btn [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50"
              />
            </div>

            {/* File Upload Zone */}
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                Attachments (Optional)
              </label>
              <div className="relative border-2 border-dashed border-card-border rounded-xl p-4 text-center hover:border-btn/50 transition-colors bg-input/30 group">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-1">
                  <UploadCloud
                    size={20}
                    className="text-text-secondary group-hover:text-btn transition-colors"
                  />
                  <span className="text-xs text-text-secondary">
                    {file ? (
                      <span className="text-text-primary font-medium">
                        {file.name}
                      </span>
                    ) : (
                      "Click or drag file to attach"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-card-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-[10px] border border-card-border text-sm font-medium text-text-primary hover:bg-input transition-colors bg-transparent cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            type="submit"
            form="task-form"
            disabled={isSubmitting}
            className="flex-1 justify-center py-2.5 font-medium rounded-[10px]"
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
