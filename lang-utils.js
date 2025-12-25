/**
 * Detects the preferred language using localStorage when available,
 * otherwise falls back to the browser language or English.
 *
 * @param {string} storageKey - localStorage key for persisted language.
 * @returns {string} language code (en|zh|ja).
 */
function detectLanguage(storageKey) {
  const stored = localStorage.getItem(storageKey);
  if (stored) return stored;

  const browserLang = (navigator.language || "").toLowerCase();
  if (browserLang.startsWith("zh")) return "zh";
  if (browserLang.startsWith("ja")) return "ja";
  if (browserLang.startsWith("en")) return "en";
  return "en";
}
