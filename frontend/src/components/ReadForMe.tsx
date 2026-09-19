import React, { useState, useRef, useEffect } from "react";
import { api } from "../services/api";
import { speak, stopSpeaking } from "../utils/speech";

interface ReadForMeProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  readAloudDefault?: boolean;
}

export const ReadForMe: React.FC<ReadForMeProps> = ({ onToast, readAloudDefault }) => {
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera");
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);
  const [plainSummary, setPlainSummary] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera stream not available in this browser context. Please use File Upload.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError(err.message || "Could not access camera device.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const captureFrameBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) {
        resolve(null);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setCapturedPreview(dataUrl);

      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg", 0.92);
    });
  };

  const handleCaptureOcr = async () => {
    setLoadingAction("Reading text with Gemini OCR…");
    try {
      let blob = await captureFrameBlob();
      if (!blob && mobileInputRef.current) {
        mobileInputRef.current.click();
        return;
      }
      if (!blob) {
        throw new Error("Unable to capture camera frame. Please try uploading an image.");
      }

      const form = new FormData();
      form.append("image", blob, "camera_capture.jpg");

      const res = await api.captureCamera(form);
      const text = res.text || "No text detected in capture.";
      setResultText(text);
      setPlainSummary(res.plain_summary || null);
      onToast("Text extracted successfully!", "success");

      if (readAloudDefault && text) {
        speak(text);
      }
    } catch (err: any) {
      onToast(err.message || "Capture OCR failed", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDescribeScene = async () => {
    setLoadingAction("Analyzing surroundings & sensory safety…");
    try {
      const blob = await captureFrameBlob();
      if (!blob) {
        throw new Error("Please ensure camera is active or select an image.");
      }

      const form = new FormData();
      form.append("image", blob, "scene_frame.jpg");

      const res = await api.describeCamera(form);
      const desc = res.description || res.text || "No surroundings description generated.";
      setResultText(desc);
      setPlainSummary(null);
      onToast("Scene analyzed!", "success");

      if (readAloudDefault && desc) {
        speak(desc);
      }
    } catch (err: any) {
      onToast(err.message || "Describe scene failed", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFileUpload = async (file: File) => {
    setCapturedPreview(URL.createObjectURL(file));
    setLoadingAction("Transcribing uploaded document with Gemini OCR…");
    try {
      const form = new FormData();
      form.append("image", file);

      const res = await api.readImage(form);
      const text = res.text || "No readable text found in document.";
      setResultText(text);
      setPlainSummary(res.plain_summary || null);
      onToast("Document transcribed!", "success");

      if (readAloudDefault && text) {
        speak(text);
      }
    } catch (err: any) {
      onToast(err.message || "Document read error", "error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(
      plainSummary ? `${resultText}\n\nSummary: ${plainSummary}` : resultText
    );
    onToast("Text copied to clipboard! 📋", "success");
  };

  const handleSpeak = () => {
    if (!resultText) return;
    speak(plainSummary ? `Summary: ${plainSummary}. Full text: ${resultText}` : resultText);
    onToast("🔊 Reading aloud…", "info");
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      {/* Title Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.4rem" }}>📖</span>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--ink)" }}>
              Read for Me & Live OCR
            </h2>
          </div>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "0.88rem",
              color: "var(--ink-secondary)"
            }}
          >
            Instantly read medication labels, dense paperwork, room signs, or menus aloud.
          </p>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "var(--paper)",
            padding: 4,
            borderRadius: "var(--radius-md)"
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("camera")}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              background: activeTab === "camera" ? "var(--card)" : "transparent",
              color: activeTab === "camera" ? "var(--spring-green-900)" : "var(--ink-secondary)",
              boxShadow: activeTab === "camera" ? "0 2px 6px rgba(0,0,0,0.05)" : "none"
            }}
          >
            📷 Live Camera
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              background: activeTab === "upload" ? "var(--card)" : "transparent",
              color: activeTab === "upload" ? "var(--spring-green-900)" : "var(--ink-secondary)",
              boxShadow: activeTab === "upload" ? "0 2px 6px rgba(0,0,0,0.05)" : "none"
            }}
          >
            📁 Upload Image
          </button>
        </div>
      </div>

      {/* Hidden Mobile camera fallback */}
      <input
        ref={mobileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {/* Active Tab Content */}
      {activeTab === "camera" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Camera Viewfinder */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "280px",
              background: "#111815",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {cameraActive ? (
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#eef5f1", padding: 20 }}>
                <p style={{ margin: "0 0 10px 0", fontSize: "0.95rem" }}>
                  {cameraError || "Camera is inactive."}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--spring-green-700)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Start Camera
                </button>
              </div>
            )}

            {/* Viewfinder Target Reticle */}
            {cameraActive && (
              <div
                style={{
                  position: "absolute",
                  inset: "24px",
                  border: "2px dashed rgba(255,255,255,0.45)",
                  borderRadius: "var(--radius-md)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <span
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: "0.78rem"
                  }}
                >
                  Align text or room signs inside
                </span>
              </div>
            )}

            {/* Camera Floating Controls */}
            {cameraActive && (
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  display: "flex",
                  gap: 8
                }}
              >
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  title="Switch Front/Back Camera"
                  style={{
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-pill)",
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  🔄 Flip
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  title="Pause Camera"
                  style={{
                    background: "rgba(0,0,0,0.65)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-pill)",
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  ⏸ Pause
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleCaptureOcr}
              disabled={Boolean(loadingAction)}
              style={{
                flex: 1,
                padding: "12px 18px",
                borderRadius: "var(--radius-md)",
                background: "var(--spring-green-700)",
                color: "#ffffff",
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: "0.95rem"
              }}
            >
              <span>📸</span>
              <span>Capture & Read Text</span>
            </button>

            <button
              type="button"
              onClick={handleDescribeScene}
              disabled={Boolean(loadingAction)}
              style={{
                padding: "12px 18px",
                borderRadius: "var(--radius-md)",
                background: "var(--peach-100)",
                color: "var(--peach-900)",
                border: "1px solid var(--peach-300)",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.95rem"
              }}
            >
              <span>👁️</span>
              <span>Describe Space</span>
            </button>

            <button
              type="button"
              onClick={() => mobileInputRef.current?.click()}
              style={{
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                border: "1px solid var(--line)",
                color: "var(--ink-secondary)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              📱 Phone Camera
            </button>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed var(--line)",
              borderRadius: "var(--radius-md)",
              padding: "36px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: "var(--paper-peach)",
              transition: "border-color 0.15s ease"
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <span style={{ fontSize: "2rem", display: "block", marginBottom: 8 }}>📄</span>
            <strong style={{ fontSize: "1rem", color: "var(--ink)" }}>
              Choose or drag & drop an image or document
            </strong>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--ink-secondary)" }}>
              PNG, JPG, WebP, or screenshots of forms, letters, and labels
            </p>
          </div>
        </div>
      )}

      {/* Captured Preview & Loading Status */}
      {loadingAction && (
        <div
          role="status"
          style={{
            marginTop: 16,
            padding: "12px 16px",
            background: "var(--spring-mint-100)",
            color: "var(--spring-green-900)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.92rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          <span style={{ animation: "pulse 1.5s infinite" }}>✨</span>
          <span>{loadingAction}</span>
        </div>
      )}

      {/* Results Display */}
      {resultText && (
        <div
          style={{
            marginTop: 20,
            padding: "18px",
            borderRadius: "var(--radius-md)",
            background: "var(--paper)",
            border: "1px solid var(--line)"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              flexWrap: "wrap",
              gap: 8
            }}
          >
            <strong style={{ fontSize: "0.95rem", color: "var(--ink)" }}>
              Extracted Information
            </strong>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={handleSpeak}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--peach-200)",
                  color: "var(--peach-900)",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <span>🔊</span>
                <span>Read Aloud</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--card)",
                  color: "var(--ink)",
                  border: "1px solid var(--line)",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer"
                }}
              >
                📋 Copy
              </button>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setResultText(null);
                  setPlainSummary(null);
                  setCapturedPreview(null);
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: "var(--radius-pill)",
                  background: "transparent",
                  border: "none",
                  color: "var(--ink-secondary)",
                  fontSize: "0.82rem",
                  cursor: "pointer"
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {plainSummary && (
            <div
              style={{
                marginBottom: 14,
                padding: "12px 14px",
                background: "var(--peach-100)",
                border: "1px solid var(--peach-200)",
                borderRadius: "var(--radius-sm)"
              }}
            >
              <strong style={{ display: "block", fontSize: "0.86rem", color: "var(--peach-900)", marginBottom: 4 }}>
                📌 Plain Language Summary:
              </strong>
              <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--ink)", lineHeight: 1.5 }}>
                {plainSummary}
              </p>
            </div>
          )}

          <div
            style={{
              maxHeight: "240px",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
              fontSize: "0.92rem",
              lineHeight: 1.6,
              color: "var(--ink)",
              padding: "10px",
              background: "var(--card)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--line)"
            }}
          >
            {resultText}
          </div>
        </div>
      )}
    </div>
  );
};
