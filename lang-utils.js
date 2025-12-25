function detectLanguage(storageKey) {
  const stored = localStorage.getItem(storageKey);
  if (stored) return stored;

  const browserLang = (navigator.language || "").toLowerCase();
  if (browserLang.startsWith("zh")) return "zh";
  if (browserLang.startsWith("ja")) return "ja";
  if (browserLang.startsWith("en")) return "en";
  return "en";
}
