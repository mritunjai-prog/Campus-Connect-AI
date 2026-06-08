/**
 * Robust helper to trigger file downloads inside iframes and cross-origin environments.
 * Fetches the document as a Blob and downloads it via a local object URL fallback.
 */
export const triggerFileDownload = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    
    console.log(`[DownloadUtility] Successfully downloaded "${filename}" via Blob Object URL`);
  } catch (error) {
    console.warn(`[DownloadUtility] Blob download failed, falling back to direct navigation:`, error);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
