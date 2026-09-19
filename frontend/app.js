const API = localStorage.getItem("neurosafeApi") || "";
let sessionToken = localStorage.getItem("neurosafe_token") || sessionStorage.getItem("neurosafe_token") || null;
let currentUser = null;
let activeSettings = {
  low_stimulation_interface: true,
  plain_language_mode: true,
  step_by_step_tasks: true,
  read_aloud_enabled: true
};
let suggestedSettings = {};
let cameraStream = null;

const $ = (id) => document.getElementById(id);

const show = (id, value, empty = false) => {
  const el = $(id);
  if (!el) return;
  el.textContent = value;
  el.classList.toggle("empty", empty);
};

const toast = (message) => {
  const el = $("toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3600);
};

const action = (fn) => fn().catch((error) => {
  toast(error.message || "An error occurred");
  console.error(error);
});

// Authenticated fetch helper
const request = async (path, options = {}) => {
  const headers = options.headers || {};
  if (sessionToken && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }
  options.headers = headers;

  const response = await fetch(`${API}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || `Request failed (${response.status})`);
  }
  return data;
};

const json = (path, body) => request(path, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});

// View Navigation: 'login' | 'assessment' | 'app'
function showView(viewName) {
  const views = {
    login: $("login-view"),
    assessment: $("assessment-view"),
    app: $("app-view")
  };

  Object.entries(views).forEach(([name, el]) => {
    if (!el) return;
    if (name === viewName) {
      el.style.display = "block";
      el.classList.add("active");
    } else {
      el.style.display = "none";
      el.classList.remove("active");
    }
  });

  if (viewName === "app") {
    loadHabits();
    // Warm up camera stream safely if on camera mode
    const cameraContainer = $("camera-ocr-container");
    if (cameraContainer && cameraContainer.style.display !== "none" && typeof startCameraStream === "function") {
      startCameraStream();
    }
  } else {
    if (typeof stopCameraStream === "function") stopCameraStream();
  }

  window.scrollTo({ top: 0, behavior: activeSettings.low_stimulation_interface ? "auto" : "smooth" });
}

// ----------------------------------------------------
// 1. AUTHENTICATION & SESSION MANAGEMENT
// ----------------------------------------------------
let authMode = "login"; // 'login' | 'register'

function initAuthUI() {
  const tabLogin = $("tab-login");
  const tabRegister = $("tab-register");
  const groupName = $("group-name");
  const submitBtn = $("btn-auth-submit");
  const passwordInput = $("auth-password");
  const togglePassBtn = $("btn-toggle-password");
  const feedback = $("auth-message");

  tabLogin.onclick = () => {
    authMode = "login";
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    groupName.style.display = "none";
    submitBtn.textContent = "Sign In";
    if (feedback) feedback.style.display = "none";
  };

  tabRegister.onclick = () => {
    authMode = "register";
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    groupName.style.display = "block";
    submitBtn.textContent = "Create Account";
    if (feedback) feedback.style.display = "none";
  };

  togglePassBtn.onclick = () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassBtn.textContent = "Hide";
    } else {
      passwordInput.type = "password";
      togglePassBtn.textContent = "Show";
    }
  };

  submitBtn.onclick = () => handleAuthSubmit();
  $("btn-auth-demo").onclick = () => handleDemoAuth();
  $("btn-logout").onclick = () => handleLogout();
  $("btn-recustomize").onclick = () => showView("assessment");
}

async function handleAuthSubmit() {
  const email = $("auth-email").value.trim();
  const password = $("auth-password").value;
  const name = $("auth-name").value.trim();
  const remember = $("auth-remember").checked;
  const feedback = $("auth-message");

  if (!email || !password) {
    showAuthError("Please enter both email/username and password.");
    return;
  }

  try {
    feedback.style.display = "none";
    let data;
    if (authMode === "register") {
      data = await json("/api/auth/register", { email, password, name });
    } else {
      data = await json("/api/auth/login", { email, password });
    }

    sessionToken = data.token;
    currentUser = data.user;

    if (remember) {
      localStorage.setItem("neurosafe_token", sessionToken);
    } else {
      sessionStorage.setItem("neurosafe_token", sessionToken);
    }

    updateUserDisplay();
    toast(`Welcome, ${currentUser.name || "friend"}!`);

    // Check if user already has an active customized profile
    if (currentUser.accessibility_profile && Object.keys(currentUser.accessibility_profile).length > 0) {
      applyCustomization(
        currentUser.accessibility_profile,
        "Loaded your saved accessibility profile.",
        currentUser.problem_history || []
      );
      showView("app");
    } else {
      // Direct them to the problem assessment page
      showView("assessment");
    }
  } catch (err) {
    showAuthError(err.message);
  }
}

async function handleDemoAuth() {
  try {
    const remember = $("auth-remember").checked;
    const data = await json("/api/auth/demo", {});
    sessionToken = data.token;
    currentUser = data.user;

    if (remember) {
      localStorage.setItem("neurosafe_token", sessionToken);
    } else {
      sessionStorage.setItem("neurosafe_token", sessionToken);
    }

    updateUserDisplay();
    toast("Signed in as Demo User!");

    if (currentUser.accessibility_profile && Object.keys(currentUser.accessibility_profile).length > 0) {
      applyCustomization(
        currentUser.accessibility_profile,
        "Loaded your saved accessibility profile.",
        currentUser.problem_history || []
      );
      showView("app");
    } else {
      showView("assessment");
    }
  } catch (err) {
    showAuthError(err.message);
  }
}

async function handleLogout() {
  try {
    if (sessionToken) {
      await json("/api/auth/logout", {}).catch(() => {});
    }
  } finally {
    sessionToken = null;
    currentUser = null;
    localStorage.removeItem("neurosafe_token");
    sessionStorage.removeItem("neurosafe_token");
    toast("Logged out successfully");
    showView("login");
  }
}

function showAuthError(msg) {
  const feedback = $("auth-message");
  if (!feedback) return;
  feedback.textContent = msg;
  feedback.className = "auth-feedback error";
  feedback.style.display = "block";
}

function updateUserDisplay() {
  if (!currentUser) return;
  const displayName = currentUser.name || currentUser.email || "Friend";
  $("current-user-name").textContent = displayName;
  const greetingEl = $("assessment-greeting");
  if (greetingEl) {
    greetingEl.textContent = `Welcome, ${displayName}! Tell us what you are experiencing`;
  }
}

// ----------------------------------------------------
// 2. PROBLEM ASSESSMENT & AI CUSTOMIZATION
// ----------------------------------------------------
function initAssessmentUI() {
  // Problem cards interactive selection
  document.querySelectorAll(".problem-item").forEach((card) => {
    const check = card.querySelector(".problem-check");
    card.onclick = (e) => {
      if (e.target !== check) {
        check.checked = !check.checked;
      }
      card.classList.toggle("selected", check.checked);
    };
    check.onchange = () => {
      card.classList.toggle("selected", check.checked);
    };
  });

  // Quick suggestion chips
  document.querySelectorAll(".preset-chip").forEach((chip) => {
    chip.onclick = () => {
      const textarea = $("assessment-description");
      const current = textarea.value.trim();
      const text = chip.textContent.trim();
      if (current.includes(text)) return;
      textarea.value = current ? `${current}. ${text}` : text;
      textarea.focus();
    };
  });

  $("btn-submit-assessment").onclick = () => action(submitAssessment);
  $("btn-skip-assessment").onclick = () => {
    applyCustomization({
      low_stimulation_interface: true,
      plain_language_mode: true,
      step_by_step_tasks: true,
      read_aloud_enabled: true
    }, "Using default sensory-safe and cognitive accessibility profile.", []);
    showView("app");
  };
}

async function submitAssessment() {
  const selectedProblems = Array.from(document.querySelectorAll(".problem-check:checked")).map((c) => c.value);
  const description = $("assessment-description").value.trim();
  const loadingIndicator = $("assessment-loading");
  const submitBtn = $("btn-submit-assessment");

  loadingIndicator.style.display = "flex";
  submitBtn.disabled = true;

  try {
    const data = await json("/api/profile/customize", {
      problems: selectedProblems,
      description: description
    });

    applyCustomization(data.settings, data.customization_summary, selectedProblems);
    toast("✨ AI tailored your NeuroSafe experience!");
    showView("app");
  } finally {
    loadingIndicator.style.display = "none";
    submitBtn.disabled = false;
  }
}

// ----------------------------------------------------
// 3. APPLYING CUSTOMIZATION TO UI
// ----------------------------------------------------
function applyCustomization(settings, summary, problems = []) {
  if (settings) {
    activeSettings = {
      ...activeSettings,
      low_stimulation_interface: settings.low_stimulation_interface !== undefined ? Boolean(settings.low_stimulation_interface) : activeSettings.low_stimulation_interface,
      plain_language_mode: settings.plain_language_mode !== undefined ? Boolean(settings.plain_language_mode) : (settings.simplify_text !== undefined ? Boolean(settings.simplify_text) : activeSettings.plain_language_mode),
      step_by_step_tasks: settings.step_by_step_tasks !== undefined ? Boolean(settings.step_by_step_tasks) : (settings.step_by_step !== undefined ? Boolean(settings.step_by_step) : activeSettings.step_by_step_tasks),
      read_aloud_enabled: settings.read_aloud_enabled !== undefined ? Boolean(settings.read_aloud_enabled) : (settings.read_aloud !== undefined ? Boolean(settings.read_aloud) : activeSettings.read_aloud_enabled),
    };
  }

  // 1. Low stimulation interface class
  if (activeSettings.low_stimulation_interface) {
    document.body.classList.add("low-stimulation");
    $("toggle-low-stim").classList.add("active");
    $("toggle-low-stim").setAttribute("aria-pressed", "true");
  } else {
    document.body.classList.remove("low-stimulation");
    $("toggle-low-stim").classList.remove("active");
    $("toggle-low-stim").setAttribute("aria-pressed", "false");
  }

  // 2. Plain language / high legibility mode
  if (activeSettings.plain_language_mode) {
    document.body.classList.add("simplified-text");
    $("toggle-simplify").classList.add("active");
    $("toggle-simplify").setAttribute("aria-pressed", "true");
  } else {
    document.body.classList.remove("simplified-text");
    $("toggle-simplify").classList.remove("active");
    $("toggle-simplify").setAttribute("aria-pressed", "false");
  }

  // 3. Step-by-step task breakdown mode
  if (activeSettings.step_by_step_tasks) {
    $("toggle-step-by-step").classList.add("active");
    $("toggle-step-by-step").setAttribute("aria-pressed", "true");
  } else {
    $("toggle-step-by-step").classList.remove("active");
    $("toggle-step-by-step").setAttribute("aria-pressed", "false");
  }

  // 4. Read aloud (TTS) support
  if (activeSettings.read_aloud_enabled) {
    $("toggle-read-aloud").classList.add("active");
    $("toggle-read-aloud").setAttribute("aria-pressed", "true");
    document.querySelectorAll(".tts-button").forEach((btn) => (btn.style.display = "inline-flex"));
  } else {
    $("toggle-read-aloud").classList.remove("active");
    $("toggle-read-aloud").setAttribute("aria-pressed", "false");
    document.querySelectorAll(".tts-button").forEach((btn) => (btn.style.display = "none"));
  }

  // Summary Text
  if (summary) {
    $("customization-summary-text").textContent = summary;
  }

  // Focus mode tag
  const focusPill = $("customization-focus-pill");
  if (problems.length > 0) {
    const labels = {
      sensory_overload: "Sensory Calm",
      executive_function: "Executive Focus",
      reading_processing: "Reading Clarity",
      social_burnout: "Social Energy Shield",
      wayfinding_anxiety: "Calm Travel"
    };
    focusPill.textContent = `Active Mode: ${problems.map((p) => labels[p] || p).join(" • ")}`;
  } else {
    focusPill.textContent = "Mode: General Accessibility";
  }

  // Re-prioritize dashboard tool cards according to identified challenges
  prioritizeToolCards(problems);
}

function prioritizeToolCards(problems) {
  // Clear any existing highlights
  document.querySelectorAll(".tool-card").forEach((card) => {
    card.classList.remove("priority-highlight");
  });

  const grid = $("main-tools-grid");
  if (!grid) return;

  const targetCards = [];
  if (problems.includes("executive_function")) {
    targetCards.push($("tool-habits"));
    targetCards.push($("tool-tasks"));
  }
  if (problems.includes("sensory_overload")) {
    targetCards.push($("tool-habits"));
    targetCards.push($("tool-calm"));
  }
  if (problems.includes("reading_processing")) {
    targetCards.push($("tool-read"));
    targetCards.push($("tool-explain"));
  }
  if (problems.includes("social_burnout")) targetCards.push($("tool-say"));
  if (problems.includes("wayfinding_anxiety")) targetCards.push($("tool-route"));

  targetCards.forEach((card) => {
    if (card) {
      card.classList.add("priority-highlight");
      // Move to top of grid
      grid.prepend(card);
    }
  });
}

function initTogglePills() {
  $("toggle-low-stim").onclick = () => {
    activeSettings.low_stimulation_interface = !activeSettings.low_stimulation_interface;
    applyCustomization(activeSettings, "Updated sensory interface settings.");
  };

  $("toggle-simplify").onclick = () => {
    activeSettings.plain_language_mode = !activeSettings.plain_language_mode;
    applyCustomization(activeSettings, "Updated plain language settings.");
  };

  $("toggle-step-by-step").onclick = () => {
    activeSettings.step_by_step_tasks = !activeSettings.step_by_step_tasks;
    applyCustomization(activeSettings, "Updated task pacing settings.");
  };

  $("toggle-read-aloud").onclick = () => {
    activeSettings.read_aloud_enabled = !activeSettings.read_aloud_enabled;
    applyCustomization(activeSettings, "Updated audio read-aloud settings.");
  };
}

// ----------------------------------------------------
// 4. SPEECH SYNTHESIS (TTS READ ALOUD)
// ----------------------------------------------------
function speakText(text) {
  if (!("speechSynthesis" in window)) {
    toast("Text-to-speech is not supported on this browser.");
    return;
  }

  window.speechSynthesis.cancel();
  if (!text || text.trim().length === 0) {
    toast("No text available to read.");
    return;
  }

  const cleanText = text.replace(/<[^>]*>/g, " ").replace(/[*#_`]/g, "");
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 0.95; // slightly calmer rate for cognitive comfort
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
  toast("🔊 Reading aloud…");
}

let isCurrentlySpeaking = false;

function speakMessage(message) {
  if (!("speechSynthesis" in window)) {
    toast("Text-to-speech is not supported on this browser.");
    return;
  }
  if (!message || !message.trim()) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    isCurrentlySpeaking = true;
    const stopBtn = $("btn-stop-speaking");
    if (stopBtn) stopBtn.style.display = "inline-flex";
  document.querySelectorAll(".quick-speak-btn").forEach((b) => b.classList.remove("speaking"));
  };
  utterance.onend = () => {
    isCurrentlySpeaking = false;
    const stopBtn = $("btn-stop-speaking");
    if (stopBtn) stopBtn.style.display = "none";
    document.querySelectorAll(".quick-speak-btn").forEach((b) => b.classList.remove("speaking"));
  };

  window.speechSynthesis.speak(utterance);
  toast("🔊 Speaking…");
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  isCurrentlySpeaking = false;
  const stopBtn = $("btn-stop-speaking");
  if (stopBtn) stopBtn.style.display = "none";
  document.querySelectorAll(".quick-speak-btn").forEach((b) => b.classList.remove("speaking"));
}

function initQuickSpeak() {
  const stopBtn = $("btn-stop-speaking");
  if (stopBtn) {
    stopBtn.onclick = () => stopSpeaking();
  }

  document.querySelectorAll(".quick-speak-btn").forEach((btn) => {
    btn.onclick = () => {
      const message = btn.getAttribute("data-message") || btn.textContent.trim();
      document.querySelectorAll(".quick-speak-btn").forEach((b) => b.classList.remove("speaking"));
      btn.classList.add("speaking");
      speakMessage(message);
    };
  });
}

function initTTSButtons() {
  $("btn-tts-read").onclick = () => speakText($("read-result").textContent);
  $("btn-tts-explain").onclick = () => speakText($("explain-result").textContent);
  $("btn-tts-say").onclick = () => speakText($("say-result").textContent);
  $("btn-tts-calm").onclick = () => speakText($("calm-result").innerText);
  $("btn-tts-task").onclick = () => speakText($("task-result").textContent);
}

// ----------------------------------------------------
// 5. CAMERA & SNAPSHOT OCR
// ----------------------------------------------------
// CAMERA OCR & VISION VIEWFINDER
// ----------------------------------------------------
let cameraFacingMode = "environment";
let isCameraPaused = false;

async function startCameraStream() {
  const video = $("camera-video");
  const statusMsg = $("camera-status-msg");
  if (!video) return;

  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (statusMsg) {
        statusMsg.style.display = "block";
        statusMsg.textContent = "Camera stream unavailable in iframe/browser. Use 'Phone Camera' or 'Upload Image File'.";
      }
      return;
    }

    if (statusMsg) {
      statusMsg.style.display = "block";
      statusMsg.textContent = "Starting camera viewfinder…";
    }

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: cameraFacingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    video.srcObject = cameraStream;
    await video.play();

    isCameraPaused = false;
    if ($("btn-camera-toggle-power")) $("btn-camera-toggle-power").textContent = "⏹️ Pause Camera";
    if (statusMsg) {
      statusMsg.textContent = "Camera active. Align text or signs inside frame.";
      setTimeout(() => { if (statusMsg) statusMsg.style.display = "none"; }, 3000);
    }
  } catch (err) {
    if (statusMsg) {
      statusMsg.style.display = "block";
      statusMsg.textContent = `Camera note: ${err.message}. You can still use 'Phone Camera' or file upload.`;
    }
  }
}

function stopCameraStream() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  isCameraPaused = true;
  if ($("btn-camera-toggle-power")) $("btn-camera-toggle-power").textContent = "▶️ Start Camera";
}

async function captureVideoFrameBlob(callback, quality = 0.92) {
  let video = $("camera-video");
  const statusMsg = $("camera-status-msg");

  // If camera isn't currently streaming frames, try to start it automatically
  if (!cameraStream || !video || !video.videoWidth) {
    if (statusMsg) {
      statusMsg.style.display = "block";
      statusMsg.textContent = "Connecting to camera viewfinder…";
    }
    try {
      await startCameraStream();
    } catch (err) {
      console.warn("Could not start camera stream automatically:", err);
    }

    // Wait briefly for video dimensions to become available
    let attempts = 0;
    while ((!video || !video.videoWidth) && attempts < 12) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      video = $("camera-video");
      attempts++;
    }
  }

  // If live camera is streaming frames, capture from the video element
  if (video && video.videoWidth > 0) {
    const canvas = $("camera-canvas") || document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Show captured frame preview
    const previewBox = $("camera-snapshot-preview");
    const previewImg = $("snapshot-img");
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (previewBox && previewImg) {
      previewImg.src = dataUrl;
      previewBox.style.display = "flex";
    }

    canvas.toBlob((blob) => {
      if (blob) {
        callback(blob);
      }
    }, "image/jpeg", quality);
    return;
  }

  // If direct stream is unavailable (e.g. iframe policy or device limitations),
  // seamlessly trigger the device/phone camera capture without throwing an error
  if (statusMsg) {
    statusMsg.style.display = "block";
    statusMsg.textContent = "Opening device camera/photo capture…";
  }
  toast("Opening photo capture…");

  const picker = $("mobile-direct-camera") || $("image-input");
  if (picker) {
    const originalOnChange = picker.onchange;
    picker.onchange = (e) => {
      if (typeof originalOnChange === "function") originalOnChange(e);
      const file = picker.files?.[0];
      if (file) {
        const previewBox = $("camera-snapshot-preview");
        const previewImg = $("snapshot-img");
        if (previewBox && previewImg) {
          previewImg.src = URL.createObjectURL(file);
          previewBox.style.display = "flex";
        }
        callback(file);
      }
    };
    picker.click();
  } else {
    show("read-result", "Camera viewfinder not ready. Click 'Upload Image File' or 'Start Camera'.");
  }
}

function formatOcrOutput(data) {
  if (!data) return "No text detected.";
  if (typeof data.text === "string" && data.text.trim()) {
    let output = data.text;
    if (data.plain_summary) {
      output += `\n\n📌 Plain Language Summary:\n${data.plain_summary}`;
    }
    return output;
  }
  return JSON.stringify(data, null, 2);
}

function initCamera() {
  const btnCapture = $("btn-camera-capture");
  const btnDescribe = $("btn-camera-describe");
  const btnFlip = $("btn-camera-flip");
  const btnTogglePower = $("btn-camera-toggle-power");
  const btnRetake = $("btn-retake-photo");
  const mobileInput = $("mobile-direct-camera");
  const btnModeCamera = $("btn-mode-camera");
  const btnModeUpload = $("btn-mode-upload");
  const cameraContainer = $("camera-ocr-container");
  const uploadContainer = $("file-upload-container");
  const btnCopy = $("btn-copy-ocr");

  // Mode Switcher: Live Camera vs Upload
  if (btnModeCamera && btnModeUpload) {
    btnModeCamera.onclick = () => {
      btnModeCamera.classList.add("active");
      btnModeUpload.classList.remove("active");
      if (cameraContainer) cameraContainer.style.display = "block";
      if (uploadContainer) uploadContainer.style.display = "none";
      if (!cameraStream) startCameraStream();
    };

    btnModeUpload.onclick = () => {
      btnModeUpload.classList.add("active");
      btnModeCamera.classList.remove("active");
      if (cameraContainer) cameraContainer.style.display = "none";
      if (uploadContainer) uploadContainer.style.display = "block";
    };
  }

  // Retake photo: dismiss snapshot preview and re-engage live stream
  if (btnRetake) {
    btnRetake.onclick = () => {
      const previewBox = $("camera-snapshot-preview");
      if (previewBox) previewBox.style.display = "none";
      if (!cameraStream) startCameraStream();
    };
  }

  // Camera Flip (environment <-> user)
  if (btnFlip) {
    btnFlip.onclick = () => {
      cameraFacingMode = cameraFacingMode === "environment" ? "user" : "environment";
      startCameraStream();
      toast(`Switched camera to ${cameraFacingMode === "environment" ? "Back" : "Front"}`);
    };
  }

  // Pause / Resume camera stream
  if (btnTogglePower) {
    btnTogglePower.onclick = () => {
      if (cameraStream && !isCameraPaused) {
        stopCameraStream();
        toast("Camera paused");
      } else {
        startCameraStream();
        toast("Camera resumed");
      }
    };
  }

  // Shutter: Capture & Read Text (OCR)
  if (btnCapture) {
    btnCapture.onclick = () => action(async () => {
      await captureVideoFrameBlob(async (blob) => {
        if (!blob) {
          toast("No image frame selected.");
          return;
        }

        show("read-result", "Transcribing camera capture with Gemini OCR…");
        const form = new FormData();
        form.append("image", blob, "camera_capture.jpg");

        try {
          const data = await request("/api/camera/capture", {
            method: "POST",
            body: form
          });

          const formattedResult = formatOcrOutput(data);
          show("read-result", formattedResult);
          if ($("btn-tts-read")) $("btn-tts-read").style.display = "inline-flex";
          if (btnCopy) btnCopy.style.display = "inline-flex";
          toast("Camera OCR transcribed successfully!");
        } catch (err) {
          // Fallback to /api/read
          try {
            const data = await request("/api/read", { method: "POST", body: form });
            show("read-result", formatOcrOutput(data));
            if ($("btn-tts-read")) $("btn-tts-read").style.display = "inline-flex";
            if (btnCopy) btnCopy.style.display = "inline-flex";
          } catch (innerErr) {
            show("read-result", `OCR Transcription Note: ${innerErr.message || "Please retry with a clear photo."}`);
          }
        }
      });
    });
  }

  // Describe Scene
  if (btnDescribe) {
    btnDescribe.onclick = () => action(async () => {
      await captureVideoFrameBlob(async (blob) => {
        if (!blob) {
          toast("No image frame selected.");
          return;
        }

        show("read-result", "Analyzing surroundings & sensory safety with Gemini…");
        const form = new FormData();
        form.append("image", blob, "scene_frame.jpg");

        try {
          const data = await request("/api/camera/describe", {
            method: "POST",
            body: form
          });

          const desc = data.description || data.text || JSON.stringify(data, null, 2);
          show("read-result", `👁️ SCENE & SURROUNDINGS DESCRIPTION:\n\n${desc}`);
          if ($("btn-tts-read")) $("btn-tts-read").style.display = "inline-flex";
          if (btnCopy) btnCopy.style.display = "inline-flex";
        } catch (err) {
          show("read-result", `Scene analysis note: ${err.message || "Could not analyze frame."}`);
        }
      });
    });
  }

  // Mobile native camera file input
  if (mobileInput) {
    mobileInput.onchange = async () => {
      const file = mobileInput.files[0];
      if (!file) return;

      show("read-result", "Transcribing photo from phone camera with Gemini OCR…");
      const form = new FormData();
      form.append("image", file);

      try {
        const data = await request("/api/camera/capture", {
          method: "POST",
          body: form
        });
        show("read-result", formatOcrOutput(data));
        if ($("btn-tts-read")) $("btn-tts-read").style.display = "inline-flex";
        if (btnCopy) btnCopy.style.display = "inline-flex";
        toast("Photo transcribed!");
      } catch (err) {
        toast(`OCR error: ${err.message}`);
      }
    };
  }

  // Copy button
  if (btnCopy) {
    btnCopy.onclick = async () => {
      const text = $("read-result").textContent;
      if (!text || $("read-result").classList.contains("empty")) {
        toast("No text to copy");
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        toast("Copied OCR text to clipboard! 📋");
      } catch {
        toast("Unable to copy to clipboard.");
      }
    };
  }

  // Drag and drop for upload zone
  const dropZone = $("ocr-drop-zone");
  const fileInput = $("image-input");
  if (dropZone && fileInput) {
    dropZone.ondragover = (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    };
    dropZone.ondragleave = () => {
      dropZone.classList.remove("dragover");
    };
    dropZone.ondrop = (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        toast(`Selected file: ${e.dataTransfer.files[0].name}`);
      }
    };
  }
}

// ----------------------------------------------------
// 6. CORE ACCESSIBILITY FEATURES
// ----------------------------------------------------
function settingsFromSuggestion(suggestion) {
  return Object.fromEntries(
    Object.entries(suggestion)
      .filter(([_, value]) => value && value.suggested_value !== undefined)
      .map(([key, value]) => [key, value.suggested_value])
  );
}

function initDashboardActions() {
  $("suggest-profile").onclick = () => action(async () => {
    const data = await json("/api/profile/suggest", { user_input: $("profile-input").value });
    suggestedSettings = settingsFromSuggestion(data.suggestion);
    const detail = data.suggestion.message || JSON.stringify(data.suggestion, null, 2);
    show("profile-result", `${detail}\n\nSuggested settings: ${JSON.stringify(suggestedSettings, null, 2)}`);
    $("approve-profile").disabled = Object.keys(suggestedSettings).length === 0 || data.suggestion.status !== "suggestion";
  });

  $("approve-profile").onclick = () => action(async () => {
    const data = await json("/api/profile/approve", { approved_settings: suggestedSettings });
    show("profile-result", `Saved profile ${data.profile_id}\n${JSON.stringify(data.settings, null, 2)}`);
    $("approve-profile").disabled = true;
    applyCustomization(data.settings, "Updated with newly approved profile settings.");
  });

  $("read-image").onclick = () => action(async () => {
    const file = $("image-input").files[0];
    if (!file) {
      $("image-input").click();
      toast("Please select an image file to transcribe");
      return;
    }
    const form = new FormData();
    form.append("image", file);
    show("read-result", "Processing image with Gemini Multimodal OCR…");
    const data = await request("/api/read", { method: "POST", body: form });
    show("read-result", formatOcrOutput(data));
    if ($("btn-tts-read")) $("btn-tts-read").style.display = "inline-flex";
    if ($("btn-copy-ocr")) $("btn-copy-ocr").style.display = "inline-flex";
  });

  $("explain-text").onclick = () => action(async () => {
    show("explain-result", "Simplifying text…");
    const data = await json("/api/explain", { text: $("explain-input").value });
    show("explain-result", data.text);
    $("btn-tts-explain").style.display = "inline-flex";
  });

  $("say-message").onclick = () => action(async () => {
    show("say-result", "Drafting supportive message…");
    const data = await json("/api/say", {
      intent: $("say-intent").value,
      context: $("say-context").value || null
    });
    show("say-result", data.text);
    $("btn-tts-say").style.display = "inline-flex";
  });

  $("load-calm").onclick = () => action(async () => {
    const data = await request("/api/calm");
    $("calm-result").innerHTML = data.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
    $("calm-result").classList.remove("empty");
  });

  $("break-task").onclick = () => action(async () => {
    show("task-result", "Breaking task into manageable micro-steps…");
    const data = await json("/api/tasks/breakdown", { task: $("task-input").value });
    show("task-result", data.text);
    $("btn-tts-task").style.display = "inline-flex";
  });

  async function findRoute(alternative) {
    const body = { origin: $("origin").value, destination: $("destination").value, mode: $("mode").value };
    if (alternative && $("avoid").value) body.avoid = $("avoid").value;
    show("route-result", "Calculating sensory-safe path…");
    const data = await json(alternative ? "/api/route/alternative" : "/api/route", body);
    show("route-result", JSON.stringify(data.routes, null, 2));
  }

  $("find-route").onclick = () => action(() => findRoute(false));
  $("find-alternative").onclick = () => action(() => findRoute(true));

  const sosConfirm = $("sos-confirm");
  const sendSosBtn = $("send-sos");

  if (sosConfirm && sendSosBtn) {
    sosConfirm.onchange = () => {
      sendSosBtn.textContent = sosConfirm.checked ? "🚨 Send Confirmed SOS Request" : "Request SOS";
    };
  }

  if (sendSosBtn) {
    sendSosBtn.onclick = () => action(async () => {
      if (sosConfirm && !sosConfirm.checked) {
        sosConfirm.checked = true;
        sendSosBtn.textContent = "🚨 Send Confirmed SOS Request";
        toast("Safety check acknowledged. Sending SOS beacon…");
      }

      show("sos-result", "Sending SOS urgent support beacon…");
      const data = await json("/api/sos", {
        message: $("sos-message").value || "I need help.",
        contact: $("sos-contact").value || null,
        confirmed: true
      });
      show("sos-result", `🚨 SOS REQUEST CONFIRMED & SENT:\n\nTimestamp: ${data.timestamp}\nStatus: ${data.status}\nMessage: "${data.message}"\nContact: ${data.contact || "Default Emergency Support"}\n\nCalm assistance is on the way.`);
      toast("🚨 SOS beacon sent successfully!");
    });
  }
}

// ----------------------------------------------------
// DAILY HABIT & ROUTINE SECTION
// ----------------------------------------------------
let userHabits = [];
let habitFilter = "all";
let habitStats = { total: 0, completed: 0, percent: 0, all_completed: false };

async function loadHabits() {
  try {
    const data = await request("/api/habits");
    if (data && Array.isArray(data.habits)) {
      userHabits = data.habits;
      habitStats = data.stats || {
        total: userHabits.length,
        completed: userHabits.filter((h) => h.completed_today).length,
        percent: Math.round((userHabits.filter((h) => h.completed_today).length / (userHabits.length || 1)) * 100),
        all_completed: userHabits.length > 0 && userHabits.every((h) => h.completed_today)
      };
      renderHabits();
    }
  } catch (err) {
    console.warn("Failed to load habits from server:", err);
  }
}

function renderHabits() {
  const listEl = $("habits-list");
  if (!listEl) return;

  // Update progress bar
  const percentEl = $("habit-progress-percent");
  const fillEl = $("habit-progress-fill");
  const textEl = $("habit-progress-text");
  const pillEl = $("habit-summary-pill");
  const bannerEl = $("habit-completion-banner");

  const completed = habitStats.completed || 0;
  const total = habitStats.total || 0;
  const percent = habitStats.percent || (total > 0 ? Math.round((completed / total) * 100) : 0);

  if (percentEl) percentEl.textContent = `${percent}%`;
  if (fillEl) fillEl.style.width = `${percent}%`;
  if (textEl) {
    textEl.innerHTML = `Today's Routine Progress: <strong>${completed} of ${total} completed</strong>`;
  }
  if (pillEl) {
    pillEl.textContent = `${completed} of ${total} completed`;
    pillEl.className = completed === total && total > 0 ? "tag success" : "tag";
  }

  // Completion banner
  if (bannerEl) {
    bannerEl.style.display = total > 0 && completed === total ? "flex" : "none";
  }

  // Calculate filter counts
  const countAll = userHabits.length;
  const countMorning = userHabits.filter((h) => h.time_of_day === "morning").length;
  const countAfternoon = userHabits.filter((h) => h.time_of_day === "afternoon").length;
  const countEvening = userHabits.filter((h) => h.time_of_day === "evening").length;

  if ($("count-all")) $("count-all").textContent = countAll;
  if ($("count-morning")) $("count-morning").textContent = countMorning;
  if ($("count-afternoon")) $("count-afternoon").textContent = countAfternoon;
  if ($("count-evening")) $("count-evening").textContent = countEvening;

  // Filter items
  const filtered = habitFilter === "all"
    ? userHabits
    : userHabits.filter((h) => h.time_of_day === habitFilter || h.time_of_day === "anytime");

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="habit-empty-msg">No routine goals in this section yet. Add a simple anchor below!</div>`;
    return;
  }

  listEl.innerHTML = filtered.map((habit) => {
    const isCompleted = Boolean(habit.completed_today);
    const streak = habit.streak || 0;
    let streakText = "🌱 1st day";
    if (streak > 1) {
      streakText = `🔥 ${streak}d streak`;
    } else if (streak === 1) {
      streakText = `✨ 1d streak`;
    }

    const timeLabel = habit.time_of_day === "morning"
      ? "🌅 Morning"
      : habit.time_of_day === "afternoon"
      ? "☀️ Afternoon"
      : habit.time_of_day === "evening"
      ? "🌙 Evening"
      : "✨ Anytime";

    return `
      <div class="habit-item ${isCompleted ? "completed" : ""}" data-id="${escapeHtml(habit.id)}">
        <div class="habit-left">
          <button
            class="habit-checkbox-btn"
            type="button"
            data-action="toggle"
            data-id="${escapeHtml(habit.id)}"
            aria-label="${isCompleted ? "Mark incomplete: " : "Complete: "}${escapeHtml(habit.title)}"
          >${isCompleted ? "✓" : ""}</button>
          <div class="habit-item-info">
            <div class="habit-title-row">
              <span class="habit-emoji">${escapeHtml(habit.icon || "✨")}</span>
              <span class="habit-title">${escapeHtml(habit.title)}</span>
            </div>
            ${habit.notes ? `<span class="habit-notes">${escapeHtml(habit.notes)}</span>` : ""}
          </div>
        </div>
        <div class="habit-right">
          <span class="habit-time-tag">${escapeHtml(timeLabel)}</span>
          <span class="habit-streak-badge" title="Consecutive days completed without pressure">${escapeHtml(streakText)}</span>
          <button
            class="habit-delete-btn"
            type="button"
            data-action="delete"
            data-id="${escapeHtml(habit.id)}"
            title="Remove habit"
            aria-label="Remove habit"
          >✕</button>
        </div>
      </div>
    `;
  }).join("");

  // Attach event delegation for checkboxes and delete buttons
  listEl.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      if (id) toggleHabit(id);
    };
  });

  listEl.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      if (id) deleteHabit(id);
    };
  });
}

async function toggleHabit(id) {
  const habit = userHabits.find((h) => h.id === id);
  if (!habit) return;

  const previousState = habit.completed_today;
  // Optimistic update
  habit.completed_today = !previousState;
  if (habit.completed_today) {
    habit.streak = (habit.streak || 0) + 1;
  } else {
    habit.streak = Math.max(0, (habit.streak || 1) - 1);
  }

  const completed = userHabits.filter((h) => h.completed_today).length;
  habitStats.completed = completed;
  habitStats.total = userHabits.length;
  habitStats.percent = habitStats.total > 0 ? Math.round((completed / habitStats.total) * 100) : 0;
  habitStats.all_completed = habitStats.total > 0 && completed === habitStats.total;

  renderHabits();

  if (habit.completed_today) {
    if (habitStats.all_completed) {
      toast("🎉 All daily routine goals completed! Wonderful care today.");
    } else {
      toast(`Completed: ${habit.title}`);
    }
  }

  try {
    const data = await json(`/api/habits/${encodeURIComponent(id)}/toggle`, {});
    if (data && data.stats) {
      habitStats = data.stats;
      if (data.habit) {
        const idx = userHabits.findIndex((h) => h.id === id);
        if (idx !== -1) userHabits[idx] = data.habit;
      }
      renderHabits();
    }
  } catch (err) {
    // Revert
    habit.completed_today = previousState;
    renderHabits();
    toast(err.message || "Failed to update habit.");
  }
}

async function addHabit(title, timeOfDay = "anytime", icon = "✨", notes = "") {
  if (!title || !title.trim()) {
    toast("Please enter a habit title.");
    return;
  }

  try {
    const data = await json("/api/habits", {
      title: title.trim(),
      time_of_day: timeOfDay,
      icon: icon || "✨",
      notes: notes || ""
    });

    if (data && data.habit) {
      userHabits.push(data.habit);
      if (data.stats) habitStats = data.stats;
      renderHabits();
      toast(`Added habit: ${data.habit.title}`);
    }
  } catch (err) {
    toast(err.message || "Failed to add habit.");
  }
}

async function deleteHabit(id) {
  try {
    const res = await request(`/api/habits/${encodeURIComponent(id)}`, { method: "DELETE" });
    userHabits = userHabits.filter((h) => h.id !== id);
    if (res && res.stats) habitStats = res.stats;
    renderHabits();
    toast("Habit removed.");
  } catch (err) {
    toast(err.message || "Failed to delete habit.");
  }
}

async function resetRoutineChecks() {
  try {
    await json("/api/habits/reset", {});
    userHabits.forEach((h) => {
      h.completed_today = false;
    });
    habitStats.completed = 0;
    habitStats.percent = 0;
    habitStats.all_completed = false;
    renderHabits();
    toast("Today's routine checks have been reset.");
  } catch (err) {
    toast(err.message || "Failed to reset routine.");
  }
}

async function suggestGentleHabits() {
  const panel = $("habit-ai-suggestions");
  if (!panel) return;

  panel.style.display = "block";
  panel.innerHTML = `<p class="muted">Thinking with Gemini… tailoring calm, low-pressure micro-habits…</p>`;

  try {
    const problems = currentUser?.problem_history || [];
    const focus = problems.length > 0 ? problems.join(", ") : "sensory comfort, daily executive function anchors";
    const data = await json("/api/habits/suggest", { focus, problems });

    if (data && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
      panel.innerHTML = `
        <h4>✨ Recommended Gentle Routines:</h4>
        <div class="ai-suggestion-cards">
          ${data.suggestions.map((s, idx) => `
            <div class="ai-suggest-card">
              <div class="ai-suggest-card-top">
                <span class="suggest-emoji">${escapeHtml(s.icon || "✨")}</span>
                <div class="ai-suggest-card-text">
                  <strong>${escapeHtml(s.title)}</strong>
                  <p>${escapeHtml(s.notes || "")}</p>
                </div>
              </div>
              <button
                class="btn-add-suggested"
                type="button"
                id="btn-add-sug-${idx}"
              >+ Add to My Routine</button>
            </div>
          `).join("")}
        </div>
      `;

      // Attach button clicks
      data.suggestions.forEach((s, idx) => {
        const btn = $(`btn-add-sug-${idx}`);
        if (btn) {
          btn.onclick = async () => {
            await addHabit(s.title, s.time_of_day || "anytime", s.icon || "✨", s.notes || "");
            btn.textContent = "Added ✓";
            btn.disabled = true;
            btn.style.opacity = "0.7";
          };
        }
      });
    } else {
      panel.innerHTML = `<p class="muted">No suggestions generated right now. Try again shortly.</p>`;
    }
  } catch (err) {
    panel.innerHTML = `<p class="muted">Error suggesting habits: ${escapeHtml(err.message || String(err))}</p>`;
  }
}

function initHabitsUI() {
  // Filter chips
  const chips = [
    { id: "habit-filter-all", filter: "all" },
    { id: "habit-filter-morning", filter: "morning" },
    { id: "habit-filter-afternoon", filter: "afternoon" },
    { id: "habit-filter-evening", filter: "evening" }
  ];

  chips.forEach(({ id, filter }) => {
    const el = $(id);
    if (!el) return;
    el.onclick = () => {
      habitFilter = filter;
      chips.forEach((c) => {
        const chipEl = $(c.id);
        if (chipEl) chipEl.classList.toggle("active", c.filter === filter);
      });
      renderHabits();
    };
  });

  // Add form submission
  const form = $("add-habit-form");
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const titleInput = $("new-habit-title");
      const timeSelect = $("new-habit-time");
      const iconSelect = $("new-habit-icon");

      const title = titleInput ? titleInput.value : "";
      const time = timeSelect ? timeSelect.value : "anytime";
      const icon = iconSelect ? iconSelect.value : "✨";

      if (title.trim()) {
        addHabit(title, time, icon);
        if (titleInput) titleInput.value = "";
      } else {
        toast("Please enter a goal description.");
      }
    };
  }

  // Preset pill clicks
  document.querySelectorAll(".preset-pill").forEach((pill) => {
    pill.onclick = () => {
      const title = pill.getAttribute("data-title");
      const time = pill.getAttribute("data-time") || "anytime";
      const icon = pill.getAttribute("data-icon") || "✨";
      if (title) {
        addHabit(title, time, icon);
      }
    };
  });

  // Suggest habits button
  const suggestBtn = $("btn-suggest-habits");
  if (suggestBtn) {
    suggestBtn.onclick = () => suggestGentleHabits();
  }

  // Reset routine button
  const resetBtn = $("btn-reset-routine");
  if (resetBtn) {
    resetBtn.onclick = () => resetRoutineChecks();
  }

  // TTS Read Aloud for habits
  const ttsBtn = $("btn-tts-habits");
  if (ttsBtn) {
    ttsBtn.onclick = () => {
      const completed = userHabits.filter((h) => h.completed_today);
      const pending = userHabits.filter((h) => !h.completed_today);
      let speech = `Daily Habit and Routine. You have completed ${completed.length} of ${userHabits.length} goals today.`;
      if (pending.length > 0) {
        speech += ` Remaining goals: ${pending.map((p) => p.title).join(". ")}. Take your time.`;
      } else if (userHabits.length > 0) {
        speech += ` All goals completed! You did wonderfully taking care of yourself today.`;
      }
      speakText(speech);
    };
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

async function checkBackend() {
  try {
    await request("/health");
    $("api-status").textContent = "Backend: connected";
  } catch {
    $("api-status").textContent = "Backend: unavailable";
  }
}

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------
async function initializeApp() {
  initAuthUI();
  initAssessmentUI();
  initTogglePills();
  initTTSButtons();
  initQuickSpeak();
  initCamera();
  initDashboardActions();
  initHabitsUI();
  checkBackend();

  // Check existing session
  if (sessionToken) {
    try {
      const data = await request("/api/auth/me");
      currentUser = data.user;
      updateUserDisplay();

      if (currentUser.accessibility_profile && Object.keys(currentUser.accessibility_profile).length > 0) {
        applyCustomization(
          currentUser.accessibility_profile,
          "Restored your saved accessibility profile.",
          currentUser.problem_history || []
        );
        showView("app");
      } else {
        showView("assessment");
      }
      return;
    } catch {
      // Invalid/expired token
      sessionToken = null;
      localStorage.removeItem("neurosafe_token");
    }
  }

  // Default to login view
  showView("login");
}

initializeApp();

