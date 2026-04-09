import React, { useState, useEffect, useCallback } from "react";
import { Megaphone, Plus } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

// Components
import Button from "../components/ui/Button";
import AnnouncementCard from "../components/ui/AnnouncementCard";
import CreateTemplateModal from "../components/Announcements/CreateTemplateModal";
import PublishAnnouncementModal from "../components/Announcements/PublishAnnouncementModal";
import useNotification from "../hooks/useNotification.jsx";

const AnnouncementsPage = () => {
  // ─── STATE ───
  const [activeTab, setActiveTab] = useState("history"); // 'history' | 'templates'

  const [announcements, setAnnouncements] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [isPublishModalOpen, setPublishModalOpen] = useState(false);

  // Track which template we are currently editing
  const [editingTemplate, setEditingTemplate] = useState(null);
  const notify = useNotification();

  // ─── API: FETCH DATA (WITH FIX) ───
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [historyRes, templatesRes] = await Promise.allSettled([
        axiosInstance.get("/api/v1/announcements"),
        axiosInstance.get("/api/v1/announcement-template"),
      ]);

      let fetchedTemplates = [];

      // 1. Set Templates
      if (
        templatesRes.status === "fulfilled" &&
        templatesRes.value.data.success
      ) {
        fetchedTemplates = templatesRes.value.data.data;
        setTemplates(fetchedTemplates);
      }

      // 2. Set Announcements (Filtered)
      if (historyRes.status === "fulfilled" && historyRes.value.data.success) {
        const fetchedHistory = historyRes.value.data.data;

        // 🚨 FRONTEND FIX: Filter out templates from the live announcements list 🚨
        // We create a Set of template IDs for fast lookup
        const templateIds = new Set(fetchedTemplates.map((t) => t._id));

        // Keep only the announcements that are NOT in the templates list
        const liveAnnouncements = fetchedHistory.filter(
          (item) => !templateIds.has(item._id),
        );

        setAnnouncements(liveAnnouncements);
      }
    } catch (error) {
      console.error("Failed to fetch announcements data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── API: SAVE TEMPLATE ───
  const handleSaveTemplate = async (formData) => {
    try {
      let response;

      if (editingTemplate) {
        // UPDATE
        response = await axiosInstance.patch(
          `/api/v1/announcement-template/${editingTemplate._id}`,
          formData,
        );
      } else {
        // CREATE
        response = await axiosInstance.post(
          "/api/v1/announcement-template",
          formData,
        );
      }

      if (response.data.success) {
        notify.success(
          editingTemplate ? "Template Updated" : "Template Created",
          editingTemplate
            ? "Your template has been updated."
            : "New announcement template saved.",
        );
        handleCloseTemplateModal();
        fetchData();
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to save template",
      };
    }
  };

  // ─── API: DELETE TEMPLATE ───
  const handleDeleteTemplate = async (templateId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this template? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const { data } = await axiosInstance.delete(
        `/api/v1/announcement-template/${templateId}`,
      );
      if (data.success) {
        notify.success(
          "Template Deleted",
          "The announcement template has been removed.",
        );
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
      notify.error(
        "Delete Failed",
        error.response?.data?.message || "Failed to delete template.",
      );
    }
  };

  // ─── HELPERS FOR MODAL STATE ───
  const handleOpenEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateModalOpen(true);
  };

  const handleCloseTemplateModal = () => {
    setTemplateModalOpen(false);
    setEditingTemplate(null);
  };

  // ─── API: PUBLISH LIVE ANNOUNCEMENT ───
  const handlePublishAnnouncement = async (formData) => {
    try {
      const { data } = await axiosInstance.post(
        "/api/v1/announcements",
        formData,
      );
      if (data.success) {
        notify.success(
          "Announcement Sent",
          "Your announcement has been published to employees.",
        );
        setPublishModalOpen(false);
        setActiveTab("history");
        fetchData();
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to publish announcement",
      };
    }
  };

  return (
    <div className="py-2 pb-6 w-full h-full">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Company <span className="text-accent">Announcements</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage templates and broadcast messages to employees.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {activeTab === "templates" ? (
            <Button
              variant="outline"
              icon={Plus}
              onClick={() => {
                setEditingTemplate(null);
                setTemplateModalOpen(true);
              }}
            >
              Create Template
            </Button>
          ) : (
            <Button
              variant="custom"
              bg="#3B82F6"
              text="#FFF"
              icon={Megaphone}
              onClick={() => setPublishModalOpen(true)}
            >
              Send Announcement
            </Button>
          )}
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-6 border-b border-card-border mb-6">
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "text-accent border-b-2 border-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Sent Announcements
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "templates"
              ? "text-accent border-b-2 border-accent"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Message Templates
        </button>
      </div>

      {/* ─── Content Area ─── */}
      {loading ? (
        <div className="py-20 text-center text-text-secondary animate-pulse">
          Loading data...
        </div>
      ) : activeTab === "history" ? (
        // 🔹 HISTORY VIEW
        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement._id}
                data={announcement}
                isAdminView={true}
              />
            ))
          ) : (
            <div className="text-center py-10 text-text-secondary">
              No announcements sent yet.
            </div>
          )}
        </div>
      ) : (
        // 🔹 TEMPLATES VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {templates.length > 0 ? (
            templates.map((template) => (
              <AnnouncementCard
                key={template._id}
                data={template}
                isAdminView={true}
                onEdit={() => handleOpenEditTemplate(template)}
                onDelete={() => handleDeleteTemplate(template._id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-text-secondary">
              No templates created yet.
            </div>
          )}
        </div>
      )}

      {/* ─── Modals ─── */}
      <CreateTemplateModal
        key={
          isTemplateModalOpen
            ? editingTemplate
              ? editingTemplate._id
              : "create"
            : "closed"
        }
        open={isTemplateModalOpen}
        onClose={handleCloseTemplateModal}
        onSave={handleSaveTemplate}
        initialData={editingTemplate}
      />

      <PublishAnnouncementModal
        key={isPublishModalOpen ? "publish-open" : "publish-closed"}
        open={isPublishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onPublish={handlePublishAnnouncement}
        templates={templates}
      />
    </div>
  );
};

export default AnnouncementsPage;
