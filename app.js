/**
 * Single-file app script:
 * - language detection (localStorage > browser language > en)
 * - loads language/language-<lang>.json with English fallback
 * - renders section content (policy/cookies)
 * - fills UI text via [data-i18n="dot.path"]
 *
 * HTML contract (on <body>):
 * - data-i18n-section: "policy" | "cookies" (must exist in language JSON)
 * - data-storage-key: localStorage key to persist language
 * - data-content-id: id of the container to inject HTML content into
 */
(function () {
  const DEFAULT_LANG = "en";
  const cache = {};

  function detectLanguage(storageKey) {
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored;

    const browserLang = (navigator.language || "").toLowerCase();
    if (browserLang.startsWith("zh")) return "zh";
    if (browserLang.startsWith("ja")) return "ja";
    if (browserLang.startsWith("en")) return "en";
    return "en";
  }

  const getByPath = (obj, path) => {
    if (!obj || !path) return undefined;
    return path
      .split(".")
      .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  };

  const loadLanguage = (lang) => {
    if (cache[lang]) return Promise.resolve(cache[lang]);
    const path = `./language/language-${lang}.json`;
    return fetch(path)
      .then((res) =>
        res.ok
          ? res.json()
          : Promise.reject(new Error(`Failed to load ${path}`))
      )
      .then((data) => {
        cache[lang] = data;
        return data;
      });
  };

  const loadWithFallback = async (preferredLang) => {
    const order =
      preferredLang === DEFAULT_LANG
        ? [DEFAULT_LANG]
        : [preferredLang, DEFAULT_LANG];
    let lastErr;
    for (const lang of order) {
      try {
        const data = await loadLanguage(lang);
        return { lang, data };
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("No language files available");
  };

  const applyUiText = ({ preferred, fallback }) => {
    const nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const v = getByPath(preferred, key);
      const fv = getByPath(fallback, key);
      const text = v ?? fv;
      if (typeof text === "string") el.textContent = text;
    });
  };

  const sectionToHtml = (section) => {
    if (!section) return "";
    if (typeof section.content === "string") return section.content;
    if (Array.isArray(section.content)) return section.content.join("\n");
    if (Array.isArray(section.contentParts))
      return section.contentParts.join("\n");
    return "";
  };

  const applySection = ({ section, lang }) => {
    const contentId = document.body.dataset.contentId;
    const contentEl = contentId ? document.getElementById(contentId) : null;
    const langButtons = document.querySelectorAll("[data-lang]");

    if (section?.langAttr) document.documentElement.lang = section.langAttr;
    if (section?.title) document.title = section.title;
    if (contentEl) contentEl.innerHTML = sectionToHtml(section);

    langButtons.forEach((btn) => {
      btn.classList.toggle("lang-active", btn.dataset.lang === lang);
    });
  };

  const render = async (targetLang) => {
    const sectionKey = document.body.dataset.i18nSection;
    const storageKey = document.body.dataset.storageKey || "siteLang";
    if (!sectionKey) return;

    const [{ lang: loadedLang, data: preferredData }, { data: fallbackData }] =
      await Promise.all([
        loadWithFallback(targetLang),
        loadWithFallback(DEFAULT_LANG),
      ]);

    applyUiText({ preferred: preferredData, fallback: fallbackData });

    const preferredSection = preferredData?.[sectionKey];
    const fallbackSection = fallbackData?.[sectionKey];
    const section = preferredSection || fallbackSection || {};

    applySection({
      section,
      lang: preferredSection ? loadedLang : DEFAULT_LANG,
    });

    // persist
    localStorage.setItem(storageKey, targetLang);
  };

  const boot = async () => {
    const storageKey = document.body.dataset.storageKey || "siteLang";
    const preferredLang = detectLanguage(storageKey);

    try {
      await render(preferredLang);
    } catch (_) {
      // ignore
    }

    const langButtons = document.querySelectorAll("[data-lang]");
    langButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const targetLang = btn.dataset.lang || DEFAULT_LANG;
        try {
          await render(targetLang);
        } catch (_) {
          // ignore
        }
      });
    });
  };

  boot();
})();
