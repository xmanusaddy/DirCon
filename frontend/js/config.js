(function () {
  window.DirConConfig = {
    avatarColors: [
      { bg: "#c8edea", text: "#1b8c83" },
      { bg: "#fde8e6", text: "#c94b3a" },
      { bg: "#fef3c4", text: "#966e0a" },
      { bg: "#d1f0e8", text: "#1e7a60" },
      { bg: "#ebe6f8", text: "#6040bb" },
      { bg: "#fde6d8", text: "#b84d22" }
    ],
    LANGUAGE_STORAGE_KEY: "dircon.language",
    THEME_STORAGE_KEY: "dircon.theme",
    ACCENT_STORAGE_KEY: "dircon.accent",
    accentOptions: [
      { value: "green", labelKey: "accentGreen" },
      { value: "blue", labelKey: "accentBlue" },
      { value: "purple", labelKey: "accentPurple" },
      { value: "orange", labelKey: "accentOrange" }
    ],
    themeOptions: [
      { value: "light", labelKey: "lightTheme" },
      { value: "dark", labelKey: "darkTheme" }
    ],
    languageOptions: [
      { value: "es", labelKey: "spanishLanguage" },
      { value: "en", labelKey: "englishLanguage" }
    ],
    sortOptions: [
      { value: "newest", labelKey: "sortNewest" },
      { value: "oldest", labelKey: "sortOldest" },
      { value: "nameAsc", labelKey: "sortAZ" },
      { value: "nameDesc", labelKey: "sortZA" }
    ],
    photoAllowedTypes: new Set([
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp"
    ]),
    photoMaxSize: 5 * 1024 * 1024,
    extraLinkTypes: [
      { value: "github", labelKey: "githubLink", placeholderKey: "githubPlaceholder" },
      { value: "discord", labelKey: "discordLink", placeholderKey: "discordPlaceholder" },
      { value: "linkedin", labelKey: "linkedinLink", placeholderKey: "linkedinPlaceholder" },
      { value: "instagram", labelKey: "instagramLink", placeholderKey: "instagramPlaceholder" },
      { value: "website", labelKey: "websiteLink", placeholderKey: "websitePlaceholder" },
      { value: "other", labelKey: "otherLink", placeholderKey: "otherLinkPlaceholder" }
    ],
    maxExtraLinks: 10
  };
})();
