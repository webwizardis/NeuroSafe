import { useState } from "react";
import { api } from "../services/api";
import type { RouteData } from "../types";
import { LoadingState } from "../components/LoadingState";

function cleanInstructions(value = "") {
  return value.replace(/<[^>]*>/g, "");
}

export function JourneyPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("driving");
  const [avoid, setAvoid] = useState("");
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [alternative, setAlternative] = useState(false);
  const [error, setError] = useState("");

  async function find(useAlternative: boolean) {
    setLoading(true);
    setAlternative(useAlternative);
    setError("");
    try {
      setRoute(
        useAlternative
          ? await api.route.alternative(origin, destination, mode, avoid)
          : await api.route.find(origin, destination, mode),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find a route.");
      setRoute(null);
    } finally {
      setLoading(false);
    }
  }

  const first = route?.routes?.[0];

  return (
    <div className="page-content">
      <div className="page-heading">
        <span className="eyebrow">Journey</span>
        <h1>Safe Journey</h1>
        <p className="lead">Plan a route with a calm, readable presentation.</p>
      </div>

      <section className="panel">
        <div className="route-form-grid">
          <label className="field-label">Starting point<input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Where are you starting?" /></label>
          <label className="field-label">Destination<input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where are you going?" /></label>
          <label className="field-label">Travel mode<select value={mode} onChange={(e) => setMode(e.target.value)}><option value="driving">Driving</option><option value="walking">Walking</option><option value="transit">Transit</option><option value="bicycling">Bicycling</option></select></label>
          <label className="field-label">Avoid preferences <span className="optional">optional</span><input value={avoid} onChange={(e) => setAvoid(e.target.value)} placeholder="e.g. busy roads" /></label>
        </div>
        <div className="button-row">
          <button className="primary-button" disabled={loading || !origin || !destination} onClick={() => void find(false)}>Find route</button>
          <button className="secondary-button" disabled={loading || !origin || !destination} onClick={() => void find(true)}>Find alternative</button>
        </div>
      </section>

      <section className="panel">
        <span className="section-eyebrow">{alternative ? "Alternative route" : "Route information"}</span>
        <h2>Your journey</h2>
        {loading && <LoadingState text="Calculating your route…" />}
        {error && <div className="error-box">{error}</div>}
        {!loading && !error && !first && <div className="empty-state">Your route details will appear here.</div>}
        {first && (
          <div className="route-result">
            <span className="source-badge">{route?.source === "google_maps" ? "Google Maps" : "Safe Journey Planner"}</span>
            {first.summary && <h3>{first.summary}</h3>}
            {first.legs?.map((leg, li) => (
              <div className="route-leg" key={li}>
                <div className="route-meta"><strong>{leg.start_address} → {leg.end_address}</strong><span>{leg.distance?.text || ""} · {leg.duration?.text || ""}</span></div>
                {leg.steps?.length ? <ol className="route-steps">{leg.steps.map((step, i) => <li key={i}><span>{i + 1}</span><div>{cleanInstructions(step.html_instructions || step.instructions)}<small>{step.distance?.text}</small></div></li>)}</ol> : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
