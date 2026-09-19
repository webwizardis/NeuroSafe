import React from "react";

interface ToastProps {
  message: string | null;
  type?: "info" | "success" | "error";
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  if (!message) return null;

  const bgStyle =
    type === "error"
      ? { background: "var(--danger)", color: "#ffffff" }
      : type === "success"
      ? { background: "var(--spring-green-700)", color: "#ffffff" }
      : { background: "var(--spring-green-800)", color: "#ffffff" };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "12px 24px",
        borderRadius: "var(--radius-pill)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontWeight: 600,
        fontSize: "0.95rem",
        ...bgStyle
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss message"
          style={{
            background: "transparent",
            border: "none",
            color: "currentColor",
            cursor: "pointer",
            padding: "2px 6px",
            fontSize: "1rem",
            lineHeight: 1,
            opacity: 0.85
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};
