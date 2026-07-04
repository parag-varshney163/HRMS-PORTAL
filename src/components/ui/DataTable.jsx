import React, { useState } from "react";

import colors from "../../constants/colors";


const DataTable = ({
  columns,
  data = [],
  loading = false,
  error = null,
  onRowClick = null,
  rowStyle = {},

  paginationMode = "client",
  page = 1,
  totalPages = 1,
  onPageChange = () => {},
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  const isServer = paginationMode === "server";

  const totalClientPages = Math.ceil(data.length / rowsPerPage);

  const displayData = isServer
    ? data
    : data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const gridTemplateColumns = columns.map((c) => c.width || "1fr").join(" ");

  const renderSkeleton = () => (
    <div className="flex flex-col gap-3 mt-3 min-w-[800px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="items-center rounded-xl"
          style={{
            display: "grid",
            gridTemplateColumns,
            columnGap: "24px",
            padding: "16px 24px",
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
          }}
        >
          {columns.map((_, j) => (
            <div
              key={j}
              className="h-3 rounded-md w-4/5 animate-pulse"
              style={{
                backgroundColor: colors.cardBorder,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="rounded-3xl p-6 mt-8 overflow-hidden"
      style={{
        background: colors.pageGradient,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div className="min-w-[800px]">
          {/* HEADER */}
          <div
            className="uppercase text-[13px] font-bold items-center"
            style={{
              display: "grid",
              gridTemplateColumns,
              columnGap: "24px",
              padding: "16px 24px",
              borderBottom: `1px solid ${colors.cardBorder}`,
              color: colors.textSecondary,
            }}
          >
            {columns.map((col) => (
              <div
                key={col.key}
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
              <div
                className="p-6 text-center rounded-xl"
                style={{
                  color: colors.danger,
                  backgroundColor: colors.dangerLight,
                  border: `1px solid ${colors.danger}`,
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {!loading && !error && (
              <div className="flex flex-col gap-3 mt-3">
                {displayData.length > 0 ? (
                  displayData.map((row, rowIndex) => (
                    <div
                      key={row._id || rowIndex}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`items-center rounded-xl transition-colors duration-150 ${
                        onRowClick ? "cursor-pointer" : "cursor-default"
                      }`}
                      style={{
                        display: "grid",
                        gridTemplateColumns,
                        columnGap: "24px",
                        padding: "16px 24px",
                        backgroundColor: colors.cardBg,
                        border: `1px solid ${colors.cardBorder}`,
                        color: colors.textPrimary,
                        ...rowStyle,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          colors.cardHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.cardBg;
                      }}
                    >
                      {columns.map((col) => (
                        <div
                          key={col.key}
                          className={`flex items-center gap-3 min-w-0 ${
                            col.align === "left"
                              ? "justify-start"
                              : col.align === "right"
                                ? "justify-end"
                                : "justify-center"
                          }`}
                          style={{
                            color: colors.textPrimary,
                          }}
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
                  <div
                    className="p-6 text-center border border-dashed rounded-xl"
                    style={{
                      color: colors.textSecondary,
                      borderColor: colors.cardBorder,
                      backgroundColor: colors.cardBg,
                    }}
                  >
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
        <div
          className="flex justify-end items-center gap-3 mt-6"
          style={{ color: colors.textSecondary }}
        >
          <button
            disabled={isServer ? page === 1 : currentPage === 1}
            onClick={() =>
              isServer ? onPageChange(page - 1) : setCurrentPage((p) => p - 1)
            }
            className="px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textSecondary,
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = colors.hover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.cardBg;
            }}
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
            className="px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              color: colors.textSecondary,
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = colors.hover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.cardBg;
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;