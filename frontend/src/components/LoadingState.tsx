export function LoadingState({ text = "Working gently…" }: { text?: string }) {
  return (
    <div className="state-box loading-state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
