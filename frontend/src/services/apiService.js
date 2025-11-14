const API_BASE_URL = "http://localhost:8000";

/**
 * Generate a unique session ID for the conversation.
 * Session ID is stored in sessionStorage and persists for the browser tab.
 */
function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem("chat_session_id");

  if (!sessionId) {
    // Generate new session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("chat_session_id", sessionId);
  }

  return sessionId;
}

/**
 * Clear the current session (start a new conversation).
 */
export function clearSession() {
  sessionStorage.removeItem("chat_session_id");
}

/**
 * Send a message to the chatbot (non-streaming, multi-turn conversation).
 *
 * @param {string} message - The user's message
 * @param {string} flowId - The flow to use (PRESENTATION, ROADMAP, DYNAMIC_CV)
 * @param {object} formData - Optional form data for multi-step flows
 * @returns {Promise<object>} Response object with type and data
 */
export async function sendMessage(
  message,
  flowId = "PRESENTATION",
  formData = null,
) {
  const sessionId = getOrCreateSessionId();

  const requestBody = {
    message,
    flow_id: flowId,
    session_id: sessionId,
  };

  // Add form_data if provided
  if (formData) {
    requestBody.form_data = formData;
  }

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `HTTP error! status: ${response.status}`,
    );
  }

  // Parse JSON response
  const data = await response.json();

  // Check if it's a widget response (DYNAMIC_CV flow)
  if (data.next_action) {
    return { type: "widget", data };
  }

  // Regular chat response
  return { type: "text", data: data.response };
}

/**
 * Scrape job information from URL.
 *
 * @param {string} jobUrl - The job posting URL
 * @returns {Promise<object>} Scraped job data
 */
export async function scrapeJobUrl(jobUrl) {
  const response = await fetch(`${API_BASE_URL}/scrape-job-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ job_url: jobUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `HTTP error! status: ${response.status}`,
    );
  }

  return await response.json();
}

/**
 * Generate resume from complete job data.
 *
 * @param {object} jobData - Complete job and recruiter data
 * @returns {Promise<object>} Resume generation result
 */
export async function generateResume(jobData) {
  const sessionId = getOrCreateSessionId();

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Generate resume",
      flow_id: "DYNAMIC_CV",
      session_id: sessionId,
      form_data: jobData,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `HTTP error! status: ${response.status}`,
    );
  }

  return await response.json();
}
