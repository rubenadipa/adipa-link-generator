/**
 * Fingerprint simple (canvas + señales del navegador), sin librería externa.
 * Solo se ejecuta en el cliente (ver BRIEF.md, regla 14: 1 fingerprint = 1 device).
 */
export async function computeFingerprint(): Promise<string> {
  const parts: string[] = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ];

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("adipa-fp-" + navigator.userAgent, 2, 2);
      parts.push(canvas.toDataURL());
    }
  } catch {
    // Canvas no disponible: seguimos solo con las señales de navigator/screen.
  }

  const data = parts.join("||");
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
