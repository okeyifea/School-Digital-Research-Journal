export const buildDocumentUrl = (apiUrl, pdfPath) => {
  if (!pdfPath) return "";

  if (/^https?:\/\//i.test(pdfPath)) {
    return pdfPath;
  }

  const normalizedApiUrl = String(apiUrl || "").replace(/\/+$/, "");
  const normalizedPath = String(pdfPath)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  return `${normalizedApiUrl}/${normalizedPath}`;
};

export const downloadDocument = async (apiUrl, pdfPath, filename = "document.pdf") => {
  const url = buildDocumentUrl(apiUrl, pdfPath);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Document not found");
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};
