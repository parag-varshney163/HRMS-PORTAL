import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export default function useNotification() {
  const success = (title, description) =>
    toast.success(title, {
      description,
      icon: <CheckCircle size={18} strokeWidth={2.2} />,
    });

  const error = (title, description) =>
    toast.error(title, {
      description,
      icon: <XCircle size={18} strokeWidth={2.2} />,
    });

  const warning = (title, description) =>
    toast.warning(title, {
      description,
      icon: <AlertTriangle size={18} strokeWidth={2.2} />,
    });

  const info = (title, description) =>
    toast.info(title, {
      description,
      icon: <Info size={18} strokeWidth={2.2} />,
    });

  /**
   * Async promise toast — shows loading → success/error automatically.
   * @param {Promise} promise
   * @param {{ loading: string, success: string, error: string | ((err)=>string) }} msgs
   */
  const promise = (promiseFn, msgs) =>
    toast.promise(promiseFn, {
      loading: msgs.loading || "Processing…",
      success: msgs.success || "Done!",
      error: msgs.error || "Something went wrong",
    });

  return { success, error, warning, info, promise };
}
