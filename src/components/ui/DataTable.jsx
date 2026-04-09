// import React, { useState } from "react";

// const DataTable = ({
//   columns,
//   data = [],
//   loading = false,
//   error = null,
//   onRowClick = null,
//   rowStyle = {},

//   // Pagination (optional)
//   paginationMode = "client", // "client" | "server"
//   page = 1,                 // used in server mode
//   totalPages = 1,           // used in server mode
//   onPageChange = () => {},  // used in server mode
// }) => {
//   // Client-side pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 25;

//   const isServer = paginationMode === "server";

//   // Client-side total pages
//   const totalClientPages = Math.ceil(data.length / rowsPerPage);

//   // Decide what data to render
//   const displayData = isServer
//     ? data
//     : data.slice(
//         (currentPage - 1) * rowsPerPage,
//         currentPage * rowsPerPage
//       );

//   const gridTemplateColumns = columns
//     .map((c) => c.width || "1fr")
//     .join(" ");

//   const renderSkeleton = () => (
//     <div className="flex flex-col gap-3 mt-3">
//       {Array.from({ length: 4 }).map((_, i) => (
//         <div
//           key={i}
//           className="items-center rounded-xl bg-card border border-card-border"
//           style={{
//             display: "grid",
//             gridTemplateColumns,
//             columnGap: "24px",
//             padding: "16px 24px",
//           }}
//         >
//           {columns.map((_, j) => (
//             <div
//               key={j}
//               className="h-3 rounded-md bg-card-border w-4/5"
//             />
//           ))}
//         </div>
//       ))}
//     </div>
//   );

//   return (
//     <div
//       className="rounded-3xl p-6 mt-8 bg-gradient-to-b from-primary to-secondary border border-card-border"
//     >
//       {/* HEADER */}
//       <div
//         className="border-b border-card-border text-text-secondary uppercase text-[13px] font-bold text-center items-center"
//         style={{
//           display: "grid",
//           gridTemplateColumns,
//           columnGap: "24px",
//           padding: "16px 24px",
//         }}
//       >
//         {columns.map((col) => (
//           <div
//             key={col.key}
//             className="flex justify-center items-center whitespace-nowrap w-full text-xs"
//           >
//             {col.label}
//           </div>
//         ))}
//       </div>

//       {/* CONTENT */}
//       <div className="mt-3">
//         {loading && renderSkeleton()}

//         {!loading && error && (
//           <div className="p-6 text-danger text-center">
//             ⚠️ {error}
//           </div>
//         )}

//         {!loading && !error && (
//           <div className="flex flex-col gap-3 mt-3">
//             {displayData.length > 0 ? (
//               displayData.map((row, rowIndex) => (
//                 <div
//                   key={rowIndex}
//                   onClick={() => onRowClick && onRowClick(row)}
//                   className={`items-center rounded-xl bg-card border border-card-border transition-colors duration-150 hover:bg-hover ${
//                     onRowClick ? "cursor-pointer" : "cursor-default"
//                   }`}
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns,
//                     columnGap: "24px",
//                     padding: "16px 24px",
//                     ...rowStyle,
//                   }}
//                 >
//                   {columns.map((col) => (
//                     <div
//                       key={col.key}
//                       className={`text-text-primary flex items-center gap-3 min-w-0 ${
//                         col.align === "left"
//                           ? "justify-start"
//                           : col.align === "right"
//                           ? "justify-end"
//                           : "justify-center"
//                       }`}
//                     >
//                       {col.render ? (
//                         col.render(row[col.key], row, rowIndex)
//                       ) : (
//                         <span className="whitespace-nowrap overflow-hidden text-ellipsis">
//                           {row[col.key] ?? "-"}
//                         </span>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               ))
//             ) : (
//               <div className="p-6 text-text-secondary text-center">
//                 No records found
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* PAGINATION */}
//       {(isServer ? totalPages > 1 : data.length > rowsPerPage) && (
//         <div className="flex justify-end items-center gap-3 mt-6 text-text-secondary">
//           <button
//             disabled={isServer ? page === 1 : currentPage === 1}
//             onClick={() =>
//               isServer
//                 ? onPageChange(page - 1)
//                 : setCurrentPage((p) => p - 1)
//             }
//             className={`px-3 py-1.5 rounded-lg bg-card border border-card-border text-text-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
//           >
//             Prev
//           </button>

//           <span>
//             Page {isServer ? page : currentPage} of{" "}
//             {isServer ? totalPages : totalClientPages}
//           </span>

//           <button
//             disabled={
//               isServer
//                 ? page === totalPages
//                 : currentPage === totalClientPages
//             }
//             onClick={() =>
//               isServer
//                 ? onPageChange(page + 1)
//                 : setCurrentPage((p) => p + 1)
//             }
//             className={`px-3 py-1.5 rounded-lg bg-card border border-card-border text-text-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DataTable;

import React, { useState } from "react";

const DataTable = ({
  columns,
  data = [],
  loading = false,
  error = null,
  onRowClick = null,
  rowStyle = {},

  // Pagination (optional)
  paginationMode = "client", // "client" | "server"
  page = 1, // used in server mode
  totalPages = 1, // used in server mode
  onPageChange = () => {}, // used in server mode
}) => {
  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  const isServer = paginationMode === "server";

  // Client-side total pages
  const totalClientPages = Math.ceil(data.length / rowsPerPage);

  // Decide what data to render
  const displayData = isServer
    ? data
    : data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const gridTemplateColumns = columns.map((c) => c.width || "1fr").join(" ");

  const renderSkeleton = () => (
    <div className="flex flex-col gap-3 mt-3 min-w-[800px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="items-center rounded-xl bg-card border border-card-border"
          style={{
            display: "grid",
            gridTemplateColumns,
            columnGap: "24px",
            padding: "16px 24px",
          }}
        >
          {columns.map((_, j) => (
            <div
              key={j}
              // Added animate-pulse for a better loading effect
              className="h-3 rounded-md bg-card-border w-4/5 animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="rounded-3xl p-6 mt-8 bg-gradient-to-b from-primary to-secondary border border-card-border overflow-hidden">
      {/* 🚨 NEW: Responsive Scroll Wrapper to prevent layout breaking on small screens */}
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div className="min-w-[800px]">
          {" "}
          {/* Forces table to maintain a minimum width */}
          {/* HEADER */}
          <div
            className="border-b border-card-border text-text-secondary uppercase text-[13px] font-bold items-center"
            style={{
              display: "grid",
              gridTemplateColumns,
              columnGap: "24px",
              padding: "16px 24px",
            }}
          >
            {columns.map((col) => (
              <div
                key={col.key}
                // 🚨 FIX: Dynamic alignment added here so headers perfectly match row alignment
                className={`flex items-center whitespace-nowrap w-full text-xs ${
                  col.align === "left"
                    ? "justify-start"
                    : col.align === "right"
                      ? "justify-end"
                      : "justify-center"
                }`}
              >
                {col.label}
              </div>
            ))}
          </div>
          {/* CONTENT */}
          <div className="mt-3">
            {loading && renderSkeleton()}

            {!loading && error && (
              <div className="p-6 text-danger text-center bg-danger/10 rounded-xl border border-danger/20">
                ⚠️ {error}
              </div>
            )}

            {!loading && !error && (
              <div className="flex flex-col gap-3 mt-3">
                {displayData.length > 0 ? (
                  displayData.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`items-center rounded-xl bg-card border border-card-border transition-colors duration-150 hover:bg-hover ${
                        onRowClick ? "cursor-pointer" : "cursor-default"
                      }`}
                      style={{
                        display: "grid",
                        gridTemplateColumns,
                        columnGap: "24px",
                        padding: "16px 24px",
                        ...rowStyle,
                      }}
                    >
                      {columns.map((col) => (
                        <div
                          key={col.key}
                          className={`text-text-primary flex items-center gap-3 min-w-0 ${
                            col.align === "left"
                              ? "justify-start"
                              : col.align === "right"
                                ? "justify-end"
                                : "justify-center"
                          }`}
                        >
                          {col.render ? (
                            col.render(row[col.key], row, rowIndex)
                          ) : (
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                              {row[col.key] ?? "-"}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-text-secondary text-center border border-dashed border-card-border rounded-xl">
                    No records found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAGINATION */}
      {(isServer ? totalPages > 1 : data.length > rowsPerPage) && (
        <div className="flex justify-end items-center gap-3 mt-6 text-text-secondary">
          <button
            disabled={isServer ? page === 1 : currentPage === 1}
            onClick={() =>
              isServer ? onPageChange(page - 1) : setCurrentPage((p) => p - 1)
            }
            className="px-3 py-1.5 rounded-lg bg-card border border-card-border text-text-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hover transition-colors"
          >
            Prev
          </button>

          <span className="text-sm font-medium">
            Page {isServer ? page : currentPage} of{" "}
            {isServer ? totalPages : totalClientPages}
          </span>

          <button
            disabled={
              isServer ? page === totalPages : currentPage === totalClientPages
            }
            onClick={() =>
              isServer ? onPageChange(page + 1) : setCurrentPage((p) => p + 1)
            }
            className="px-3 py-1.5 rounded-lg bg-card border border-card-border text-text-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hover transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;
