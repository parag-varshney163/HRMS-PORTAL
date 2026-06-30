import React, { useState, Suspense, lazy } from "react";
import { Plus, Loader2 } from "lucide-react";

import UploadDocumentModal from "../components/Documents/UploadDocumentModal";
import MyDocuments from "../components/Documents/MyDocuments";
import axiosInstance from "../api/axiosInstance";
// Components
import Button from "../components/ui/Button";
import colors from "../constants/colors";


// ─── LAZY LOAD ADMIN COMPONENT ───
const OrgDocuments = lazy(() => import("../components/Documents/OrgDocuments"));

export default function Documents() {
  const userRole =
    localStorage.getItem("roleName")?.toLowerCase() || "employee";
  const isAdminOrHR = ["admin", "hr", "manager"].includes(userRole);

  const [isModalOpen, setModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ─── UPLOAD ORCHESTRATOR ───
  const handleUpload = async ({ formData, userId }) => {
    try {
      let response;
      if (isAdminOrHR && userId) {
        response = await axiosInstance.post(
          `/api/v1/documents/admin-upload/${userId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        response = await axiosInstance.post(
          "/api/v1/documents/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      }

      if (response.data.success) {
        setRefreshTrigger((prev) => prev + 1);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Upload failed.",
      };
    }
  };

  // return (
  //   // 🚨 FIX: Removed h-full and overflow-y-auto to eliminate the double scrollbar!
  //   <div className="py-2 flex flex-col gap-8 w-full pb-10">
  //     {/* ─── PAGE HEADER ─── */}
  //     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-card-border pb-6">
  //       <div>
  //         <h2 className="text-2xl font-bold text-text-primary">
  //           Document <span className="text-accent">Center</span>
  //         </h2>
  //         <p className="text-sm text-text-secondary mt-1">
  //           Manage compliance, identity, and academic records.
  //         </p>
  //       </div>

  //       <Button
  //         variant="custom"
  //         bg="#3B82F6"
  //         text="#FFF"
  //         icon={Plus}
  //         size="sm"
  //         onClick={() => setModalOpen(true)}
  //       >
  //         Upload Document
  //       </Button>
  //     </div>

  //     {/* ─── SECTION 1: MY DOCUMENTS (Everyone) ─── */}
  //     <MyDocuments refreshTrigger={refreshTrigger} />

  //     {/* ─── SECTION 2: ORG DOCUMENTS (Admin Only) ─── */}
  //     {isAdminOrHR && (
  //       <Suspense
  //         fallback={
  //           <div className="flex flex-col items-center justify-center pt-20 text-text-secondary gap-3">
  //             <Loader2 className="animate-spin text-accent" size={32} />
  //             <p className="text-sm font-medium">
  //               Loading organization documents...
  //             </p>
  //           </div>
  //         }
  //       >
  //         <OrgDocuments refreshTrigger={refreshTrigger} />
  //       </Suspense>
  //     )}

  //     {/* ─── MODAL ─── */}
  //     <UploadDocumentModal
  //       open={isModalOpen}
  //       onClose={() => setModalOpen(false)}
  //       onSubmit={handleUpload}
  //       isAdmin={isAdminOrHR}
  //     />
  //   </div>
  // );

  

return (
  // 🚨 Removed h-full and overflow-y-auto to eliminate the double scrollbar
  <div className="py-2 flex flex-col gap-8 w-full pb-10">
    {/* ─── PAGE HEADER ─── */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-card-border pb-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ color: colors.textPrimary }}
        >
          Document{" "}
          <span style={{ color: colors.accent }}>
            Center
          </span>
        </h2>

        <p
          className="text-sm mt-1"
          style={{ color: colors.textSecondary }}
        >
          Manage compliance, identity, and academic records.
        </p>
      </div>

      <Button
        variant="custom"
        bg={colors.blue}
        text={colors.cardBg}
        icon={Plus}
        size="sm"
        onClick={() => setModalOpen(true)}
      >
        Upload Document
      </Button>
    </div>

    {/* ─── SECTION 1: MY DOCUMENTS ─── */}
    <MyDocuments refreshTrigger={refreshTrigger} />

    {/* ─── SECTION 2: ORG DOCUMENTS (Admin/HR Only) ─── */}
    {isAdminOrHR && (
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center pt-20 gap-3">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: colors.accent }}
            />

            <p
              className="text-sm font-medium"
              style={{ color: colors.textSecondary }}
            >
              Loading organization documents...
            </p>
          </div>
        }
      >
        <OrgDocuments refreshTrigger={refreshTrigger} />
      </Suspense>
    )}

    {/* ─── Upload Modal ─── */}
    <UploadDocumentModal
      open={isModalOpen}
      onClose={() => setModalOpen(false)}
      onSubmit={handleUpload}
      isAdmin={isAdminOrHR}
    />
  </div>
);
}
