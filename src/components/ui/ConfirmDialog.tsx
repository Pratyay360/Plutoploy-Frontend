import { AlertTriangle, Loader2, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (open) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [open]);

  const variantStyles = {
    danger: {
      icon: "text-error bg-error/10",
      button: "btn-error",
    },
    warning: {
      icon: "text-warning bg-warning/10",
      button: "btn-warning",
    },
    default: {
      icon: "text-primary bg-primary/10",
      button: "btn-primary",
    },
  };

  const styles = variantStyles[variant];

  return (
    <dialog
      ref={dialogRef}
      className="modal backdrop:bg-black/60"
      onClose={onCancel}
    >
      <div className="modal-box max-w-sm p-0 overflow-hidden bg-base-200 border border-base-300/60">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.icon}`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost btn-square btn-xs text-base-content/30 hover:text-base-content"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <h3 className="text-sm font-bold mb-1">{title}</h3>
          <p className="text-xs text-base-content/40 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn btn-outline btn-sm flex-1"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`btn btn-sm flex-1 gap-1.5 ${styles.button}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
