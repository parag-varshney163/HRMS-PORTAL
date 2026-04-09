import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import DataTable from "../ui/DataTable";

export default function MyDocuments({ refreshTrigger }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/v1/documents");
      if (data.success) {
        // Fallback to empty array if data isn't structured as expected
        setDocuments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch personal documents", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch when refreshTrigger changes (e.g. after upload)
  useEffect(() => {
    fetchMyDocuments();
  }, [fetchMyDocuments, refreshTrigger]);

  const columns = [
    {
      key: "title",
      label: "Document",
      width: "2fr",
      align: "left",
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary truncate">
            {row.title}
          </p>
          <p className="text-xs text-text-secondary truncate">{row.type}</p>
        </div>
      ),
    },
    { key: "category", label: "Category", width: "1fr", align: "left" },
    {
      key: "status",
      label: "Status",
      width: "1fr",
      align: "center",
      render: (val) => {
        let style = "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"; // Pending default
        if (val === "verified")
          style = "bg-green-500/10 text-green-400 border-green-500/30";
        else if (val === "rejected")
          style = "bg-red-500/10 text-red-400 border-red-500/30";

        return (
          <span
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border uppercase tracking-wider ${style}`}
          >
            {val || "Pending"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Uploaded On",
      width: "1fr",
      align: "right",
      render: (val) => (
        <span className="text-sm text-text-secondary">
          {new Date(val).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-text-primary">My Documents</h3>
      </div>
      <DataTable
        columns={columns}
        data={documents}
        loading={loading}
        paginationMode="client"
      />
    </div>
  );
}
