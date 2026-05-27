// import React, { useEffect, useState } from "react";
// import axiosInstance from "../../api/axiosInstance";
// import Button from "../ui/Button";
// export default function CommentsModal({ open, onClose, task }) {
//   const [comments, setComments] = useState([]);
//   const [content, setContent] = useState("");
//   const [loading, setLoading] = useState(false);
//   const fetchComments = async () => {
//     if (!task?._id) return;
//     try {
//       const res = await axiosInstance.get(
//         `/api/v1/comment/${task._id}/comments`
//       );
//       if (res.data?.success) {
//         setComments(res.data.data.comments || []);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };
//   useEffect(() => {
//     if (open) fetchComments();
//   }, [open]);
//   const handlePost = async () => {
//     if (!content.trim()) return;
//     try {
//       setLoading(true);
//       const formData = new FormData();
//       formData.append("content", content);
//       const res = await axiosInstance.post(
//         `/api/v1/comment/${task._id}/comments`,
//         formData
//       );
//       if (res.data?.success) {
//         setContent("");
//         fetchComments(); // refresh
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-card border border-card-border w-full max-w-lg rounded-2xl p-5">
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-bold text-text-primary">
//             Comments
//           </h3>
//           <button onClick={onClose} className="text-text-secondary">✕</button>
//         </div>
//         {/* LIST */}
//         <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
//           {comments.length === 0 ? (
//             <p className="text-sm text-text-secondary">No comments</p>
//           ) : (
//             comments.map((c) => (
//               <div
//                 key={c._id}
//                 className="bg-input p-3 rounded-xl border border-card-border"
//               >
//                 <p className="text-xs text-text-secondary mb-1">
//                   {c.commentedBy?.firstName} {c.commentedBy?.lastName}
//                 </p>
//                 <p className="text-sm text-text-primary">{c.content}</p>
//               </div>
//             ))
//           )}
//         </div>
//         {/* INPUT */}
//         <div className="flex gap-2">
//           <input
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             placeholder="Write a comment..."
//             className="flex-1 bg-input border border-card-border rounded-xl px-3 py-2 text-sm text-text-primary"
//           />
//           <Button onClick={handlePost} disabled={loading}>
//             Post
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance";
import Button from "../ui/Button";


export default function CommentsModal({ open, onClose, task }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ─── FETCH COMMENTS ───
  const fetchComments = async (pageNumber = 1) => {
    if (!task?._id) return;

    try {
      const res = await axiosInstance.get(
        `/api/v1/comment/${task._id}/comments?page=${pageNumber}&limit=5`
      );

      if (res.data?.success) {
        setComments(res.data.data.comments || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
        setPage(pageNumber);
      }
    } catch (err) {
      console.error("Fetch comments failed", err);
    }
  };

  // ─── LOAD WHEN MODAL OPENS ───
  useEffect(() => {
    if (open) {
      fetchComments(1); // reset to page 1
    }
  }, [open, task]);

  // ─── POST COMMENT ───
  const handlePost = async () => {
    if (!content.trim()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("content", content);

      const res = await axiosInstance.post(
        `/api/v1/comment/${task._id}/comments`,
        formData
      );

      if (res.data?.success) {
        setContent("");
        fetchComments(1); // reload first page after post
      }
    } catch (err) {
      console.error("Post comment failed", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card border border-card-border w-full max-w-lg rounded-2xl p-5">

        {/* ─── HEADER ─── */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-text-primary">
            Comments
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            ✕
          </button>
        </div>

        {/* ─── COMMENTS LIST ─── */}
        {/* <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-1">
          {comments.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">
              No comments yet
            </p>
          ) : (
            comments.map((c) => (
              <div
                key={c._id}
                className="bg-input p-3 rounded-xl border border-card-border"
              >
                <p className="text-xs text-text-secondary mb-1">
                  {c.commentedBy?.firstName} {c.commentedBy?.lastName}
                </p>
                <p className="text-sm text-text-primary break-words">
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div> */}
        {/* ─── COMMENTS LIST ─── */}
<div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-1">
  {comments.length === 0 ? (
    <p className="text-sm text-text-secondary text-center py-4">
      No comments yet
    </p>
  ) : (
    comments.map((c) => {
      // Adjust role key based on your API response
      const role =
        c.commentedBy?.role?.toLowerCase() || "employee";

      // Role based styles
      const roleStyles = {
        manager: {
          border: "border-blue-500/40",
          bg: "bg-blue-500/10",
          badge: "bg-blue-500 text-white",
          text: "text-blue-400",
        },
        hr: {
          border: "border-green-500/40",
          bg: "bg-green-500/10",
          badge: "bg-green-500 text-white",
          text: "text-green-400",
        },
        employee: {
          border: "border-gray-500/30",
          bg: "bg-gray-500/10",
          badge: "bg-gray-500 text-white",
          text: "text-gray-300",
        },
      };

      const style =
        roleStyles[role] || roleStyles.employee;

      return (
        <div
          key={c._id}
          className={`${style.bg} ${style.border} p-3 rounded-xl border transition-all`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-semibold ${style.text}`}>
              {c.commentedBy?.firstName}{" "}
              {c.commentedBy?.lastName}
            </p>

            <span
              className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wide ${style.badge}`}
            >
              {role}
            </span>
          </div>

          <p className="text-sm text-text-primary break-words leading-relaxed">
            {c.content}
          </p>
        </div>
      );
    })
  )}
</div>

        {/* ─── PAGINATION ─── */}
        <div className="flex justify-between items-center mb-4">
          <button
            disabled={page === 1}
            onClick={() => fetchComments(page - 1)}
            className="text-xs px-3 py-1 rounded bg-input border border-card-border disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-xs text-text-secondary">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => fetchComments(page + 1)}
            className="text-xs px-3 py-1 rounded bg-input border border-card-border disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* ─── INPUT ─── */}
        <div className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-input border border-card-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-btn"
          />
          <Button onClick={handlePost} disabled={loading}>
            {loading ? "..." : "Post"}
          </Button>
        </div>

      </div>
    </div>
  );
}
