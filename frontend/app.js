const API = localStorage.getItem("neurosafeApi") || "http://localhost:8000";
let suggestedSettings = {};
const $ = (id) => document.getElementById(id);
const show = (id, value, empty = false) => { const el = $(id); el.textContent = value; el.classList.toggle("empty", empty); };
const request = async (path, options = {}) => {
  const response = await fetch(`${API}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `Request failed (${response.status})`);
  return data;
};
const json = (path, body) => request(path, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
const action = (fn) => fn().catch((error) => { toast(error.message); });
const toast = (message) => { const el = $("toast"); el.textContent = message; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 3500); };

async function checkBackend() { try { await request("/health"); $("api-status").textContent = "Backend: connected"; } catch { $("api-status").textContent = "Backend: unavailable"; } }
function settingsFromSuggestion(suggestion) {
  return Object.fromEntries(Object.entries(suggestion).filter(([key, value]) => value && value.suggested_value !== undefined).map(([key, value]) => [key, value.suggested_value]));
}

$("suggest-profile").onclick = () => action(async () => {
  const data = await json("/api/profile/suggest", { user_input:$("profile-input").value });
  suggestedSettings = settingsFromSuggestion(data.suggestion);
  const detail = data.suggestion.message || JSON.stringify(data.suggestion, null, 2);
  show("profile-result", `${detail}\n\nSuggested settings: ${JSON.stringify(suggestedSettings, null, 2)}`);
  $("approve-profile").disabled = Object.keys(suggestedSettings).length === 0 || data.suggestion.status !== "suggestion";
});
$("approve-profile").onclick = () => action(async () => {
  const data = await json("/api/profile/approve", { approved_settings:suggestedSettings });
  show("profile-result", `Saved profile ${data.profile_id}\n${JSON.stringify(data.settings, null, 2)}`);
  $("approve-profile").disabled = true;
});
$("read-image").onclick = () => action(async () => {
  const file = $("image-input").files[0]; if (!file) throw new Error("Choose an image first.");
  const form = new FormData(); form.append("image", file);
  const data = await request("/api/read", { method:"POST", body:form }); show("read-result", data.text);
});
$("explain-text").onclick = () => action(async () => { const data = await json("/api/explain", {text:$("explain-input").value}); show("explain-result", data.text); });
$("say-message").onclick = () => action(async () => { const data = await json("/api/say", {intent:$("say-intent").value, context:$("say-context").value || null}); show("say-result", data.text); });
$("load-calm").onclick = () => action(async () => { const data = await request("/api/calm"); $("calm-result").innerHTML = data.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join(""); $("calm-result").classList.remove("empty"); });
$("break-task").onclick = () => action(async () => { const data = await json("/api/tasks/breakdown", {task:$("task-input").value}); show("task-result", data.text); });
async function findRoute(alternative) {
  const body = {origin:$("origin").value, destination:$("destination").value, mode:$("mode").value};
  if (alternative && $("avoid").value) body.avoid = $("avoid").value;
  const data = await json(alternative ? "/api/route/alternative" : "/api/route", body);
  show("route-result", JSON.stringify(data.routes, null, 2));
}
$("find-route").onclick = () => action(() => findRoute(false)); $("find-alternative").onclick = () => action(() => findRoute(true));
$("send-sos").onclick = () => action(async () => {
  if (!$("sos-confirm").checked) throw new Error("Check the confirmation box before requesting SOS.");
  const data = await json("/api/sos", {message:$("sos-message").value, contact:$("sos-contact").value || null, confirmed:true});
  show("sos-result", `SOS request confirmed.\n${JSON.stringify(data, null, 2)}`);
});
function escapeHtml(value) { return value.replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char])); }
checkBackend();
