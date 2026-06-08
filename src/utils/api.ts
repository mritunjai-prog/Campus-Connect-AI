/**
 * Robust, hardened API client / fetch wrapper to permanently prevent
 * "Unexpected token <" HTML parsing errors on the frontend.
 * Conforms exactly to Phase 6 requirements:
 * 1. Validate content-type before parsing.
 * 2. Handle non-JSON responses gracefully.
 * 3. Log detailed errors.
 * 4. Prevent UI crashes.
 * 5. Show user-friendly error messages.
 */

export async function safeFetch(url: string, options: RequestInit = {}): Promise<any> {
  console.log(`[API Request] ${options.method || "GET"} ${url}`);

  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err: any) {
    console.error(`[API Network Error] Connection to ${url} failed:`, err);
    throw new Error("Unable to connect to the server. Please check your network connection.");
  }

  const contentType = res.headers.get("content-type") || "";
  let data: any = null;
  let text = "";

  // 1. Read body text first to ensure we can inspect and safely parse it
  try {
    text = await res.text();
  } catch (readErr: any) {
    console.error(`[API Body Read Error] Failed to read stream from ${url}:`, readErr);
    throw new Error("Failed to read server response.");
  }

  // 2. Validate content-type and text content
  const isJson = contentType.includes("application/json");

  if (isJson && text.trim()) {
    try {
      data = JSON.parse(text);
    } catch (parseErr: any) {
      // JSON is corrupted or invalid, log details
      console.error(`[API Invalid JSON] Could not parse JSON from ${url}. Text snippet:`, text.substring(0, 300));
      console.error("Parse error details:", parseErr);
      throw new Error(`Invalid data format received from the server (Status ${res.status}).`);
    }
  } else {
    // Gracefully handle non-JSON or HTML responses
    if (text.toLowerCase().includes("<!doctype html>") || text.toLowerCase().includes("<html")) {
      // Capturing endpoint details, status, and response body for robust logging context
      console.error(`[API HTML Fallback Detected] Received HTML page instead of JSON!`);
      console.error(`- Endpoint: ${url}`);
      console.error(`- Method: ${options.method || "GET"}`);
      console.error(`- Status: ${res.status} ${res.statusText}`);
      console.error(`- Content-Type: ${contentType}`);
      console.error(`- Response body starts with:`, text.substring(0, 500));

      throw new Error(`The requested service is temporarily unavailable or returned a page. Please check that you are logged in and try again.`);
    }

    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        // Plain text fallback
        data = { success: false, message: text };
      }
    }
  }

  // 3. Handle non-ok status codes
  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `Server responded with status ${res.status}.`;
    console.warn(`[API Status Error] Endpoint ${url} returned code ${res.status}:`, errorMsg);
    
    // We can embed more structured error info if needed
    const customErr: any = new Error(errorMsg);
    customErr.status = res.status;
    customErr.data = data;
    throw customErr;
  }

  return data;
}
