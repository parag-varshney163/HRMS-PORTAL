/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";

import axiosInstance from "../../api/axiosInstance";
import FilterDropDown from "./FilterDropDown";
import useNotification from "../../hooks/useNotification.jsx";

export default function ActionModal({
  open,
  onClose,
  title,
  subTitle,
  description,
  confirmLabel,
  userId,
  reportId,
  actionType,
  onSuccess,
}) {
  const [classification, setClassification] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const notify = useNotification();

  const classificationOptions = [
    "Genuine Report",
    "Fake Report",
    "Incorrect Report",
  ];

  useEffect(() => {
    if (open) {
      setClassification("");
      setReason("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  /* ================= HELPERS ================= */
  const normalizeClassification = () => {
    if (classification === "Genuine Report") return "genuine";
    if (classification === "Fake Report") return "fake";
    return "incorrect_reason_but_violation";
  };

  /* ================= API CALL ================= */
  const handleConfirm = async () => {
    try {
      setLoading(true);

      const payload = {
        userId,
        reportId,
        note: reason,
        reportClassification: normalizeClassification(),
      };

      const res = await axiosInstance.post(
        "/api/v1/customer/user/offline",
        payload,
      );
      if (res?.data?.message) {
        notify.success("Action Completed", res.data.message);
      }

      if (res.data?.success) {
        onSuccess?.(res.data.data);
        onClose();
      }
    } catch (err) {
      console.error("Action failed:", err);
      notify.error("Action Failed", err?.response?.data?.errors || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55">
      <div className="rounded-2xl p-6 relative w-[550px] bg-card border-2 border-accent">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xl text-text-secondary bg-transparent border-none cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-center text-accent">
          {title}
        </h2>

        <p className="text-center mt-1 text-text-secondary">{subTitle}</p>

        <p className="text-center mt-4 text-red-400 text-sm">{description}</p>

        {/* ================= CLASSIFICATION ================= */}
        <div className="mt-5">
          <label className="text-sm text-accent">Report Classification</label>

          <FilterDropDown
            options={classificationOptions}
            value={classification}
            placeholder="Select classification"
            onSelect={setClassification}
          />
        </div>

        {/* ================= REASON ================= */}
        <div className="mt-4">
          <label className="text-sm text-accent">Reason</label>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full mt-2 p-3 rounded-xl bg-input text-text-primary border border-card-border outline-none resize-y"
            rows={5}
          />
        </div>

        {/* ================= BUTTONS ================= */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-input px-5 py-2.5 rounded-xl text-text-secondary border-none cursor-pointer hover:opacity-80 transition-opacity"
          >
            Cancel
          </button>

          <button
            disabled={loading || !classification || !reason}
            onClick={handleConfirm}
            className="bg-danger px-5 py-2.5 rounded-xl text-white border-none cursor-pointer disabled:opacity-60 transition-opacity"
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
