import React, { useState } from "react";
import { api } from "../services/api";
import { RouteResponse } from "../types";
import { speak } from "../utils/speech";

interface SafeJourneyProps {
  onToast: (message: string, type?: "info" | "success" | "error") => void;
  readAloudDefault?: boolean;
}

export const SafeJourney: React.FC<SafeJourneyProps> = ({ onToast, readAloudDefault }) => {
  const [origin, setOrigin] = useState("Home");
  const [destination, setDestination] = useState("Central Library");
  const [mode, setMode] = useState("walking");
  const [avoid, setAvoid] = useState("crowded_intersections,loud_construction");
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);

  const handleFindRoute = async (isAlternative: boolean = false) => {
    if (!origin.trim() || !destination.trim()) {
      onToast("Please provide origin and destination.", "info");
      return;
    }

    setLoading(true);
    try {
      const fn = isAlternative ? api.findAlternativeRoute : api.findRoute;
      const res = await fn(origin.trim(), destination.trim(), mode, avoid);
      setRouteData(res);
      onToast(isAlternative ? "Calm alternative path loaded!" : "Sensory-safe route calculated!", "success");

      if (readAloudDefault && res.routes?.[0]?.legs?.[0]?.steps) {
        const stepsText = res.routes[0].legs[0].steps
          .map((s: any) => s.instructions || s.html_instructions?.replace(/<[^>]*>/g, ""))
          .filter(Boolean)
          .join(". ");
        if (stepsText) speak(stepsText);
      }
    } catch (err: any) {
      onToast(err.message || "Failed to calculate route.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakSteps = () => {
    if (!routeData?.routes?.[0]?.legs?.[0]) return;
    const leg = routeData.routes[0].legs[0];
    const stepsText = leg.steps
      ?.map((s: any) => s.instructions || s.html_instructions?.replace(/<[^>]*>/g, ""))
      .filter(Boolean)
      .join(". ");
    if (stepsText) {
      speak(`Route directions: ${stepsText}`);
      onToast("🔊 Reading route guidance…", "info");
    }
  };

  const firstRoute = routeData?.routes?.[0];
  const leg = firstRoute?.legs?.[0];

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid #bae6fd",
        borderTop: "4px solid #0284c7",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: "1.4rem" }}>🗺️</span>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#0369a1" }}>
          Safe Journey & Calm Wayfinding
        </h2>
      </div>

      <p style={{ margin: "0 0 16px 0", fontSize: "0.88rem", color: "var(--ink-secondary)" }}>
        Plan travel that reduces sensory distress, noisy crowds, and high-anxiety bottlenecks.
      </p>

      {/* Origin & Destination */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 14
        }}
      >
        <div>
          <label htmlFor="journey-origin" style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, marginBottom: 4, color: "var(--ink)" }}>
            Starting Location:
          </label>
          <input
            id="journey-origin"
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: "0.92rem"
            }}
          />
        </div>

        <div>
          <label htmlFor="journey-destination" style={{ display: "block", fontSize: "0.86rem", fontWeight: 600, marginBottom: 4, color: "var(--ink)" }}>
            Destination:
          </label>
          <input
            id="journey-destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontSize: "0.92rem"
            }}
          />
        </div>
      </div>

      {/* Mode & Avoidance Controls */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label htmlFor="journey-mode" style={{ fontSize: "0.86rem", color: "var(--ink-secondary)", margin: 0 }}>
            Mode:
          </label>
          <select
            id="journey-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{
              padding: "7px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--line)",
              background: "var(--card)",
              color: "var(--ink)",
              fontSize: "0.86rem"
            }}
          >
            <option value="walking">🚶 Walking (Quiet paths)</option>
            <option value="transit">🚌 Public Transit</option>
            <option value="bicycling">🚲 Bicycle</option>
            <option value="driving">🚗 Driving</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => handleFindRoute(false)}
            disabled={loading}
            style={{
              padding: "9px 16px",
              borderRadius: "var(--radius-md)",
              background: "#0284c7",
              color: "#ffffff",
              border: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)"
            }}
          >
            {loading ? "Routing…" : "Find Calm Route"}
          </button>
          <button
            type="button"
            onClick={() => handleFindRoute(true)}
            disabled={loading}
            style={{
              padding: "9px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--peach-100)",
              color: "var(--peach-900)",
              border: "1px solid var(--peach-300)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            🌿 Alternative Path
          </button>
        </div>
      </div>

      {/* Route Results Box */}
      {routeData && firstRoute && (
        <div
          style={{
            padding: "16px",
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
            <div>
              <strong style={{ fontSize: "0.95rem", color: "var(--spring-green-900)" }}>
                {firstRoute.summary || "Calm Route Overview"}
              </strong>
              {leg && (
                <div style={{ fontSize: "0.84rem", color: "var(--ink-secondary)", marginTop: 2 }}>
                  {leg.distance?.text || "Distance calculated"} • {leg.duration?.text || "Duration estimated"}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSpeakSteps}
              style={{
                padding: "5px 12px",
                borderRadius: "var(--radius-pill)",
                background: "var(--peach-200)",
                color: "var(--peach-900)",
                border: "none",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              🔊 Read Directions
            </button>
          </div>

          {/* Sensory Notes */}
          <div
            style={{
              padding: "10px 14px",
              background: "var(--spring-mint-100)",
              border: "1px solid var(--spring-mint-200)",
              borderRadius: "var(--radius-sm)",
              marginBottom: 14,
              fontSize: "0.85rem",
              color: "var(--spring-green-900)",
              lineHeight: 1.45
            }}
          >
            🌿 <strong>Sensory Profile:</strong> Prioritizes shaded sidewalks, minimizes heavy traffic noise, and steers away from construction alerts.
          </div>

          {/* Turn-by-Turn Steps */}
          {leg?.steps && leg.steps.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {leg.steps.map((step: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--card)",
                    border: "1px solid var(--line)"
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "var(--spring-mint-200)",
                      color: "var(--spring-green-900)",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span
                      style={{ fontSize: "0.9rem", color: "var(--ink)", lineHeight: 1.45 }}
                      dangerouslySetInnerHTML={{
                        __html: step.html_instructions || step.instructions || ""
                      }}
                    />
                    {step.distance?.text && (
                      <span style={{ display: "block", fontSize: "0.78rem", color: "var(--ink-secondary)" }}>
                        {step.distance.text}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
