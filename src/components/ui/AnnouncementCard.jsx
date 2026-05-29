import { Megaphone, Clock, User, CheckCircle2, CalendarClock, } from "lucide-react";
// import React, { useMemo } from "react";
// import { Megaphone, Clock, User, CheckCircle2 } from "lucide-react";
// const AnnouncementCard = ({
//   data,
//   onMarkRead,
//   onEdit,
//   onDelete,
//   isAdminView = false,
// }) => {
//   const formattedDate = useMemo(() => {
//     if (!data.createdAt) return "Unknown Date";
//     const date = new Date(data.createdAt);
//     return new Intl.DateTimeFormat("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     }).format(date);
//   }, [data.createdAt]);
//   const getAudienceBadge = (type) => {
//     switch (type) {
//       case "all":
//         return "bg-green-500/20 text-green-400";
//       case "department":
//         return "bg-blue-500/20 text-blue-400";
//       case "individual":
//         return "bg-purple-500/20 text-purple-400";
//       default:
//         return "bg-gray-500/20 text-gray-400";
//     }
//   };
//   return (
//     <div
//       className={`w-full bg-card border rounded-xl p-4 sm:p-5 transition-all duration-200 ${data.isRead ? "border-card-border opacity-70" : "border-accent/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]"}`}
//     >
//       <div className="flex items-start justify-between gap-3 mb-2">
//         <div className="flex items-start gap-3">
//           <div
//             className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${data.isRead ? "bg-input text-text-secondary" : "bg-accent/20 text-accent"}`}
//           >
//             <Megaphone size={18} />
//           </div>
//           <div>
//             <h3 className="text-sm sm:text-base font-bold text-text-primary line-clamp-2 leading-tight">
//               {data.title}
//             </h3>
//             <div className="flex items-center gap-2 mt-1.5 text-[10px] sm:text-xs text-text-secondary">
//               <span className="flex items-center gap-1">
//                 <User size={12} /> {data.createdBy?.firstName || "Admin"}
//               </span>
//               <span>•</span>
//               <span className="flex items-center gap-1">
//                 <Clock size={12} /> {formattedDate}
//               </span>
//             </div>
//           </div>
//         </div>
//         {isAdminView && data.audienceType && (
//           <span
//             className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${getAudienceBadge(data.audienceType)}`}
//           >
//             {data.audienceType}
//           </span>
//         )}
//       </div>
//       <div className="mt-3 pl-0 sm:pl-13">
//         <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
//           {data.message}
//         </p>
//       </div>
//       <div className="mt-4 pt-3 border-t border-card-border/50 flex items-center justify-between pl-0 sm:pl-13">
//         {!isAdminView && !data.isRead ? (
//           <button
//             onClick={() => onMarkRead?.(data._id)}
//             className="flex items-center gap-1.5 text-xs text-accent hover:text-blue-400 font-medium transition-colors"
//           >
//             <CheckCircle2 size={14} /> Mark as Read
//           </button>
//         ) : (
//           <span className="text-xs text-text-secondary italic">
//             {data.isRead ? "Read" : ""}
//           </span>
//         )}
//         {isAdminView && (
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => onEdit?.(data)}
//               className="text-xs text-text-secondary hover:text-text-primary transition-colors"
//             >
//               Edit
//             </button>
//             <button
//               onClick={() => onDelete?.(data._id)}
//               className="text-xs text-danger hover:text-red-400 transition-colors"
//             >
//               Delete
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
// export default React.memo(AnnouncementCard);
import React, { useMemo } from "react";


const AnnouncementCard = ({
  data,
  onMarkRead,
  onEdit,
  onDelete,
  isAdminView = false,
}) => {
  const formattedDate = useMemo(() => {
    if (!data.createdAt) return "Unknown Date";

    const date = new Date(data.createdAt);

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, [data.createdAt]);

  const formattedExpiryDate = useMemo(() => {
    if (!data.expiryDate) return null;

    const date = new Date(data.expiryDate);

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, [data.expiryDate]);

  const getAudienceBadge = (type) => {
    switch (type) {
      case "all":
        return "bg-green-500/20 text-green-400";

      case "department":
        return "bg-blue-500/20 text-blue-400";

      case "individual":
        return "bg-purple-500/20 text-purple-400";

      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div
      className={`w-full bg-card border rounded-xl p-4 sm:p-5 transition-all duration-200 ${
        data.isRead
          ? "border-card-border opacity-70"
          : "border-accent/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
              data.isRead
                ? "bg-input text-text-secondary"
                : "bg-accent/20 text-accent"
            }`}
          >
            <Megaphone size={18} />
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-primary line-clamp-2 leading-tight">
              {data.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] sm:text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <User size={12} />
                {data.createdBy?.firstName || "Admin"}
              </span>

              <span>•</span>

              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {isAdminView && data.audienceType && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${getAudienceBadge(
              data.audienceType,
            )}`}
          >
            {data.audienceType}
          </span>
        )}
      </div>

      {/* Message */}
      <div className="mt-3 pl-0 sm:pl-13">
        <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
          {data.message}
        </p>
      </div>

      {/* Expiry Date */}
      {formattedExpiryDate && (
        <div className="mt-3 pl-0 sm:pl-13">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium">
            <CalendarClock size={14} />
            Expires: {formattedExpiryDate}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-card-border/50 flex items-center justify-between pl-0 sm:pl-13">
        {!isAdminView && !data.isRead ? (
          <button
            onClick={() => onMarkRead?.(data._id)}
            className="flex items-center gap-1.5 text-xs text-accent hover:text-blue-400 font-medium transition-colors"
          >
            <CheckCircle2 size={14} />
            Mark as Read
          </button>
        ) : (
          <span className="text-xs text-text-secondary italic">
            {data.isRead ? "Read" : ""}
          </span>
        )}

        {isAdminView && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEdit?.(data)}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete?.(data._id)}
              className="text-xs text-danger hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(AnnouncementCard);