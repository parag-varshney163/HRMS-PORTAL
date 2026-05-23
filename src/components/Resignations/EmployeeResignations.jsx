import React, { useState, useEffect, useCallback } from "react";
import { UserMinus, Calendar, Inbox } from "lucide-react";

import useNotification from "../../hooks/useNotification.jsx";
import ApplyResignationModal from "./ApplyResignationModal";
import axiosInstance from "../../api/axiosInstance.js";
import Button from "../../components/ui/Button.jsx";


const EmployeeResignations = () => {
  const notify = useNotification();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  // ─── FETCH EMPLOYEE DATA ───
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetches only the logged-in employee's resignations
      const { data } = await axiosInstance.get("/api/v1/resignation");
      if (data.success) {
        // Adjust this depending on your backend's exact response structure
        setRequests(data.data?.data || data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch resignations:", error);
      notify.error(
        "Loading Error",
        "Could not fetch your resignation history.",
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // ─── ACTION: APPLY ───
  const handleApply = async (formData) => {
    try {
      const { data } = await axiosInstance.post(
        "/api/v1/resignation/apply",
        formData,
      );
      if (data.success) {
        notify.success(
          "Resignation Submitted",
          "Your request has been submitted for review.",
        );
        fetchData();
        return { success: true };
      }
    } catch (error) {
      notify.error(
        "Submission Failed",
        error.response?.data?.message || "Failed to apply.",
      );
      return { success: false, message: error.response?.data?.message };
    }
  };
  // ─── HELPER: STATUS BADGES ───
  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase() || "";
    let style = "bg-gray-500/10 text-gray-400 border-gray-500/20";
    let text = "Pending";
    if (s.includes("admin_approved") || s === "approved") {
      style = "bg-green-500/10 text-green-400 border-green-500/30";
      text = "Fully Approved";
    } else if (s.includes("reject")) {
      style = "bg-red-500/10 text-red-400 border-red-500/30";
      text = "Rejected";
    } else if (
      s === "submitted" ||
      s.includes("pending_manager") ||
      s.includes("pendingmanager")
    ) {
      style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      text = "Pending Manager";
    } else if (
      s.includes("manager_approved") ||
      s.includes("pending_admin") ||
      s.includes("pendingadmin")
    ) {
      style = "bg-blue-500/10 text-blue-400 border-blue-500/30";
      text = "Pending Admin";
    }
    return (
      <span
        className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-md border uppercase tracking-wider ${style}`}
      >
        {text}
      </span>
    );
  };
  return (
    <div className="py-2 pb-6 w-full h-full flex flex-col animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            My <span className="text-accent">Resignation</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Track your offboarding request.
          </p>
        </div>
        <Button
          variant="custom"
          bg="#3B82F6"
          text="#FFF"
          icon={UserMinus}
          size="sm"
          onClick={() => setApplyModalOpen(true)}
        >
          Apply Resignation
        </Button>
      </div>
      <div className="flex-1 border-t border-card-border pt-6">
        {loading ? (
          <div className="py-10 text-center text-text-secondary animate-pulse">
            Loading request...
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-card border border-card-border rounded-xl p-5 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-text-primary">
                    Resignation Request
                  </h3>
                  {renderStatusBadge(req.status)}
                </div>
                <div className="bg-input/30 border border-card-border/50 rounded-xl p-4 mt-auto">
                  <div className="flex items-center justify-between mb-3 border-b border-card-border/50 pb-3">
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Calendar size={15} className="shrink-0 text-accent" />
                      <span className="text-xs font-semibold text-text-primary">
                        Last Working Day:
                      </span>
                    </div>
                    <span className="text-sm font-bold text-text-primary">
                      {new Date(req.lastWorkingDate).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold block mb-1">
                      Reason for leaving
                    </span>
                    <p className="text-sm text-text-primary italic line-clamp-3">
                      "
                      {req.reason === "string" || !req.reason
                        ? "No specific reason provided."
                        : req.reason}
                      "
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-card border border-dashed border-card-border rounded-xl text-text-secondary mt-4">
            <Inbox size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-bold text-text-primary">
              No request found
            </p>
            <p className="text-sm mt-1">
              You have not submitted a resignation request.
            </p>
          </div>
        )}
      </div>
      <ApplyResignationModal
        open={isApplyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={handleApply}
      />
    </div>
  );
};
export default EmployeeResignations;


// import React, { useState, useEffect, useCallback } from "react";
// import { UserMinus, Calendar, Inbox } from "lucide-react";

// import useNotification from "../../hooks/useNotification.jsx";
// import ApplyResignationModal from "./ApplyResignationModal";
// import axiosInstance from "../../api/axiosInstance.js";
// import Button from "../../components/ui/Button.jsx";


// const EmployeeResignations = () => {
//   const notify = useNotification();

//   const [request, setRequest] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isApplyModalOpen, setApplyModalOpen] = useState(false);

//   // ─── FETCH SINGLE RESIGNATION ───
//   const fetchData = useCallback(async (id) => {
//     if (!id) return;

//     try {
//       setLoading(true);

//       const { data } = await axiosInstance.get(
//         `/api/v1/resignation/${id}`
//       );

//       if (data.success) {
//         setRequest(data.data || null);
//       }
//     } catch (error) {
//       console.error("Failed to fetch resignation:", error);

//       notify.error(
//         "Loading Error",
//         "Could not fetch resignation details."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [notify]);

//   // ─── INITIAL FETCH ───
//   useEffect(() => {
//     const resignationId = localStorage.getItem("resignationId");

//     if (resignationId) {
//       fetchData(resignationId);
//     } else {
//       setLoading(false);
//     }
//   }, [fetchData]);

//   // ─── APPLY RESIGNATION ───
//   const handleApply = async (formData) => {
//     try {
//       // CHECK IF ALREADY APPLIED
//       const existingId = localStorage.getItem("resignationId");

//       // IF ALREADY EXISTS FETCH SAME DATA
//       if (existingId) {
//         fetchData(existingId);

//         notify.success(
//           "Already Submitted",
//           "You already have a resignation request."
//         );

//         return { success: true };
//       }

//       // CREATE NEW REQUEST
//       const { data } = await axiosInstance.post(
//         "/api/v1/resignation/apply",
//         formData
//       );

//       if (data.success) {
//         const resignationId = data.data?._id;

//         // SAVE ID
//         if (resignationId) {
//           localStorage.setItem("resignationId", resignationId);

//           // FETCH SINGLE API
//           fetchData(resignationId);
//         }

//         notify.success(
//           "Resignation Submitted",
//           "Your request has been submitted for review."
//         );

//         setApplyModalOpen(false);

//         return { success: true };
//       }
//     } catch (error) {
//       notify.error(
//         "Submission Failed",
//         error.response?.data?.message || "Failed to apply."
//       );

//       return {
//         success: false,
//         message: error.response?.data?.message,
//       };
//     }
//   };

//   // ─── STATUS BADGE ───
//   const renderStatusBadge = (status) => {
//     const s = status?.toLowerCase() || "";

//     let style = "bg-gray-500/10 text-gray-400 border-gray-500/20";
//     let text = "Pending";

//     if (s.includes("admin_approved") || s === "approved") {
//       style = "bg-green-500/10 text-green-400 border-green-500/30";
//       text = "Fully Approved";
//     } else if (s.includes("reject")) {
//       style = "bg-red-500/10 text-red-400 border-red-500/30";
//       text = "Rejected";
//     } else if (
//       s === "submitted" ||
//       s.includes("pending_manager") ||
//       s.includes("pendingmanager")
//     ) {
//       style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
//       text = "Pending Manager";
//     } else if (
//       s.includes("manager_approved") ||
//       s.includes("pending_admin") ||
//       s.includes("pendingadmin")
//     ) {
//       style = "bg-blue-500/10 text-blue-400 border-blue-500/30";
//       text = "Pending Admin";
//     }

//     return (
//       <span
//         className={`text-[10px] sm:text-xs font-bold px-3 py-1 rounded-md border uppercase tracking-wider ${style}`}
//       >
//         {text}
//       </span>
//     );
//   };

//   return (
//     <div className="py-2 pb-6 w-full h-full flex flex-col animate-in fade-in">
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-text-primary">
//             My <span className="text-accent">Resignation</span>
//           </h2>

//           <p className="text-sm text-text-secondary mt-1">
//             Track your offboarding request.
//           </p>
//         </div>

//         <Button
//           variant="custom"
//           bg="#3B82F6"
//           text="#FFF"
//           icon={UserMinus}
//           size="sm"
//           onClick={() => setApplyModalOpen(true)}
//         >
//           Apply Resignation
//         </Button>
//       </div>

//       <div className="flex-1 border-t border-card-border pt-6">
//         {loading ? (
//           <div className="py-10 text-center text-text-secondary animate-pulse">
//             Loading request...
//           </div>
//         ) : request ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col">
//               <div className="flex justify-between items-start mb-4">
//                 <h3 className="text-lg font-bold text-text-primary">
//                   Resignation Request
//                 </h3>

//                 {renderStatusBadge(request.status)}
//               </div>

//               <div className="bg-input/30 border border-card-border/50 rounded-xl p-4 mt-auto">
//                 <div className="flex items-center justify-between mb-3 border-b border-card-border/50 pb-3">
//                   <div className="flex items-center gap-2 text-text-secondary">
//                     <Calendar
//                       size={15}
//                       className="shrink-0 text-accent"
//                     />

//                     <span className="text-xs font-semibold text-text-primary">
//                       Last Working Day:
//                     </span>
//                   </div>

//                   <span className="text-sm font-bold text-text-primary">
//                     {new Date(request.lastWorkingDate).toLocaleDateString(
//                       "en-US",
//                       {
//                         month: "short",
//                         day: "numeric",
//                         year: "numeric",
//                       }
//                     )}
//                   </span>
//                 </div>

//                 <div>
//                   <span className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold block mb-1">
//                     Reason for leaving
//                   </span>

//                   <p className="text-sm text-text-primary italic line-clamp-3">
//                     "
//                     {request.reason === "string" || !request.reason
//                       ? "No specific reason provided."
//                       : request.reason}
//                     "
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center py-16 bg-card border border-dashed border-card-border rounded-xl text-text-secondary mt-4">
//             <Inbox size={48} className="mb-4 opacity-50" />

//             <p className="text-lg font-bold text-text-primary">
//               No request found
//             </p>

//             <p className="text-sm mt-1">
//               You have not submitted a resignation request.
//             </p>
//           </div>
//         )}
//       </div>

//       <ApplyResignationModal
//         open={isApplyModalOpen}
//         onClose={() => setApplyModalOpen(false)}
//         onSubmit={handleApply}
//       />
//     </div>
//   );
// };

// export default EmployeeResignations;