import { Toaster } from "sonner";

export default function Sonner() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      // closeButton
      gap={10}
      toastOptions={{
        duration: 4000,
        className: "hrms-toast",
        style: {
          // Base card styling — matches the app's dark card surface
          background: "var(--color-card, #1f1f2e)",
          border: "1px solid var(--color-card-border, #2a2a3b)",
          color: "var(--color-text-primary, #fff)",
          borderRadius: "14px",
          padding: "14px 18px",
          fontSize: "13.5px",
          fontFamily: "inherit",
          boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25)",
          gap: "12px",
          minWidth: "340px",
          maxWidth: "420px",
        },
        // ── Per-type accent overrides ──
        classNames: {
          success: "hrms-toast-success",
          error: "hrms-toast-error",
          warning: "hrms-toast-warning",
          info: "hrms-toast-info",
          title: "hrms-toast-title",
          description: "hrms-toast-desc",
          closeButton: "hrms-toast-close",
        },
      }}
    />
  );
}
