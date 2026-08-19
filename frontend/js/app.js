(function () {
  const api = window.DirConAPI;
  const {
    avatarColors,
    LANGUAGE_STORAGE_KEY,
    THEME_STORAGE_KEY,
    ACCENT_STORAGE_KEY,
    accentOptions,
    themeOptions,
    languageOptions,
    sortOptions,
    photoAllowedTypes,
    photoMaxSize,
    extraLinkTypes,
    maxExtraLinks
  } = window.DirConConfig;
  const {
    iconClose,
    iconPhone,
    iconMail,
    iconLink,
    iconPlusSmall,
    iconCamera,
    iconTrash,
    iconCopy,
    iconCheck,
    iconCheckTiny,
    iconWarningTiny
  } = window.DirConIcons;
  const extraLinkTypeValues = extraLinkTypes.map((type) => type.value);

  const { translations, apiErrorTranslations } = window.DirConI18n;

  const state = {
    contacts: [],
    status: "loading",
    errorMessage: "",
    currentSearch: "",
    sortOrder: "newest",
    language: getStoredLanguage(),
    theme: getStoredTheme(),
    accent: getStoredAccent(),
    selectedContact: null,
    drawerAnimationUntil: 0,
    drawerIsClosing: false,
    drawerCloseTimer: null,
    modal: null,
    modalShouldAnimate: false,
    formMode: "create",
    formDraft: emptyForm(),
    formErrors: {},
    formPhotoObjectUrl: "",
    formShouldFocus: false,
    saving: false,
    searchTimer: null
  };

  const dom = {
    count: document.querySelector("#contactCount"),
    searchInput: document.querySelector("#searchInput"),
    clearSearch: document.querySelector("#clearSearchButton"),
    sortLabel: document.querySelector("#sortLabel"),
    sortSelect: document.querySelector("#sortSelect"),
    content: document.querySelector("#contentArea"),
    drawerRoot: document.querySelector("#drawerRoot"),
    modalRoot: document.querySelector("#modalRoot"),
    toastRoot: document.querySelector("#toastRoot"),
    newContactButton: document.querySelector("#newContactButton"),
    newContactLabelFull: document.querySelector("#newContactLabelFull"),
    newContactLabelShort: document.querySelector("#newContactLabelShort"),
    preferencesMenu: document.querySelector("#preferencesMenu"),
    preferencesTrigger: document.querySelector("#preferencesTrigger"),
    preferencesTitle: document.querySelector("#preferencesTitle"),
    appearancePreferencesTitle: document.querySelector("#appearancePreferencesTitle"),
    themePreferenceLabel: document.querySelector("#themePreferenceLabel"),
    themeOptions: document.querySelector("#themeOptions"),
    accentPreferenceLabel: document.querySelector("#accentPreferenceLabel"),
    accentOptions: document.querySelector("#accentOptions"),
    languagePreferencesTitle: document.querySelector("#languagePreferencesTitle"),
    languageOptions: document.querySelector("#languageOptions"),
    pageTitle: document.querySelector("#pageTitle"),
    pageSubtitle: document.querySelector("#pageSubtitle"),
    searchPanel: document.querySelector("#searchPanel"),
    brand: document.querySelector(".brand")
  };

  let preferencesCloseTimer = null;

  function getStoredLanguage() {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLanguage === "en" ? "en" : "es";
  }

  function getStoredTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "dark" ? "dark" : "light";
  }

  function getStoredAccent() {
    const storedAccent = localStorage.getItem(ACCENT_STORAGE_KEY);
    return accentOptions.some((option) => option.value === storedAccent)
      ? storedAccent
      : "green";
  }

  function closePreferencesMenu() {
    if (!dom.preferencesMenu.open || dom.preferencesMenu.classList.contains("is-closing")) return;

    if (preferencesCloseTimer) {
      clearTimeout(preferencesCloseTimer);
    }

    dom.preferencesMenu.classList.add("is-closing");
    preferencesCloseTimer = setTimeout(() => {
      dom.preferencesMenu.open = false;
      dom.preferencesMenu.classList.remove("is-closing");
      preferencesCloseTimer = null;
    }, 170);
  }

  function t(key, values = {}) {
    const text = translations[state.language][key] || translations.es[key] || key;
    return Object.entries(values).reduce(
      (current, [name, value]) => current.replaceAll(`{${name}}`, value),
      text
    );
  }

  function translateErrorMessage(message) {
    const key = apiErrorTranslations[message];
    return key ? t(key) : message;
  }

  function updateStaticTexts() {
    document.documentElement.lang = state.language;
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.dataset.accent = state.accent;
    document.title = "DirCon";
    dom.brand.setAttribute("aria-label", t("brandAria"));
    dom.preferencesTrigger.setAttribute("aria-label", t("preferencesLabel"));
    dom.preferencesTrigger.title = t("preferencesLabel");
    dom.preferencesTitle.textContent = t("preferencesLabel");
    dom.appearancePreferencesTitle.textContent = t("appearanceLabel");
    dom.themePreferenceLabel.textContent = t("themeLabel");
    dom.accentPreferenceLabel.textContent = t("accentColor");
    dom.languagePreferencesTitle.textContent = t("languageLabel");
    renderThemePicker();
    dom.accentOptions.setAttribute("aria-label", t("accentColor"));
    renderAccentPicker();
    renderLanguagePicker();
    dom.newContactLabelFull.textContent = t("newContactFull");
    dom.newContactLabelShort.textContent = t("newContactShort");
    dom.pageTitle.textContent = t("pageTitle");
    dom.pageSubtitle.textContent = t("pageSubtitle");
    dom.searchPanel.setAttribute("aria-label", t("searchRegion"));
    dom.searchInput.placeholder = t("searchPlaceholder");
    dom.clearSearch.setAttribute("aria-label", t("clearSearch"));
    dom.sortLabel.textContent = t("sortLabel");
    dom.sortSelect.setAttribute("aria-label", t("sortAria"));
    renderSortOptions();
  }

  function renderThemePicker() {
    dom.themeOptions.innerHTML = themeOptions.map((option) => {
      const isSelected = option.value === state.theme;
      const label = t(option.labelKey);
      return `
        <button class="segment-button ${isSelected ? "is-selected" : ""}" type="button" data-action="set-theme" data-theme-option="${option.value}" role="radio" aria-checked="${isSelected}">
          ${escapeHtml(label)}
        </button>
      `;
    }).join("");
  }

  function renderAccentPicker() {
    dom.accentOptions.innerHTML = accentOptions.map((option) => {
      const isSelected = option.value === state.accent;
      const label = t(option.labelKey);
      return `
        <button class="accent-option ${isSelected ? "is-selected" : ""}" type="button" data-action="set-accent" data-accent-option="${option.value}" role="radio" aria-checked="${isSelected}">
          <span class="accent-dot accent-dot--${option.value}" aria-hidden="true"></span>
          <span>${escapeHtml(label)}</span>
        </button>
      `;
    }).join("");
  }

  function renderLanguagePicker() {
    dom.languageOptions.innerHTML = languageOptions.map((option) => {
      const isSelected = option.value === state.language;
      const label = t(option.labelKey);
      return `
        <button class="segment-button ${isSelected ? "is-selected" : ""}" type="button" data-action="set-language" data-language-option="${option.value}" role="radio" aria-checked="${isSelected}">
          ${escapeHtml(label)}
        </button>
      `;
    }).join("");
  }

  function renderSortOptions() {
    dom.sortSelect.innerHTML = sortOptions.map((option) => `
      <option value="${option.value}">${escapeHtml(t(option.labelKey))}</option>
    `).join("");
    dom.sortSelect.value = state.sortOrder;
  }

  function emptyForm() {
    return {
      name: "",
      phone: "",
      email: "",
      company: "",
      notes: "",
      photoFile: null,
      photoPreviewUrl: "",
      existingPhotoUrl: "",
      photoError: "",
      removePhoto: false,
      extraLinks: []
    };
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getInitials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return String(name || "?").slice(0, 2).toUpperCase();
  }

  function getAvatarColor(name) {
    const safeName = String(name || "");
    const code = (safeName.charCodeAt(0) || 0) + (safeName.charCodeAt(1) || 0);
    return avatarColors[code % avatarColors.length];
  }

  function getContactPhotoUrl(contact) {
    return contact && contact.photoUrl ? api.getAssetUrl(contact.photoUrl) : "";
  }

  function defaultExtraLink() {
    return {
      type: "github",
      label: "",
      value: ""
    };
  }

  function getExtraLinkType(type) {
    return extraLinkTypes.find((option) => option.value === type) || extraLinkTypes[0];
  }

  function getExtraLinkLabel(link) {
    const type = getExtraLinkType(link.type);
    const customLabel = String(link.label || "").trim();

    return link.type === "other" && customLabel ? customLabel : t(type.labelKey);
  }

  function normalizeProfileHandle(value, pattern) {
    return String(value || "")
      .trim()
      .replace(/^@+/, "")
      .replace(pattern, "")
      .replace(/\/.*$/, "");
  }

  function buildExtraLinkUrl(link) {
    const value = String(link.value || "").trim();
    const type = link.type;

    if (!value || type === "discord") return "";
    if (/^https?:\/\//i.test(value)) return value;

    if (type === "github") {
      const handle = normalizeProfileHandle(value, /^https?:\/\/(www\.)?github\.com\//i);
      return handle ? `https://github.com/${encodeURIComponent(handle)}` : "";
    }

    if (type === "linkedin") {
      const handle = normalizeProfileHandle(value, /^https?:\/\/(www\.)?linkedin\.com\/in\//i);
      return handle ? `https://www.linkedin.com/in/${encodeURIComponent(handle)}` : "";
    }

    if (type === "instagram") {
      const handle = normalizeProfileHandle(value, /^https?:\/\/(www\.)?instagram\.com\//i);
      return handle ? `https://instagram.com/${encodeURIComponent(handle)}` : "";
    }

    if (type === "website") {
      return `https://${value.replace(/^\/+/, "")}`;
    }

    if (!/\s/.test(value) && value.includes(".")) {
      return `https://${value.replace(/^\/+/, "")}`;
    }

    return "";
  }

  function normalizeExtraLinks(links) {
    return links.map((link) => {
      const type = extraLinkTypeValues.includes(link.type) ? link.type : "other";
      const normalized = {
        type,
        label: String(link.label || "").trim(),
        value: String(link.value || "").trim()
      };

      return {
        ...normalized,
        label: normalized.label || getExtraLinkLabel(normalized),
        url: buildExtraLinkUrl(normalized)
      };
    }).filter((link) => link.value);
  }

  function avatar(name, size, photoUrl = "") {
    const color = getAvatarColor(name);
    const safePhotoUrl = photoUrl ? escapeHtml(photoUrl) : "";

    return `
      <span class="avatar avatar--${size} ${safePhotoUrl ? "avatar--image" : ""}" style="background:${color.bg};color:${color.text};" aria-label="${escapeHtml(name)}">
        <span class="avatar__initials">${escapeHtml(getInitials(name))}</span>
        ${safePhotoUrl ? `<img class="avatar__image" src="${safePhotoUrl}" alt="">` : ""}
      </span>
    `;
  }

  function plural(count) {
    return `${count} ${count === 1 ? t("contactSingular") : t("contactPlural")}`;
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString(state.language === "en" ? "en-US" : "es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return "";
    }
  }

  function getContactTime(contact) {
    const time = Date.parse(contact.createdAt || "");
    return Number.isNaN(time) ? 0 : time;
  }

  function getSortedContacts(contacts) {
    const collator = new Intl.Collator(state.language === "en" ? "en" : "es", {
      numeric: true,
      sensitivity: "base"
    });

    return [...contacts].sort((a, b) => {
      const nameCompare = collator.compare(a.name || "", b.name || "");
      const newestCompare = getContactTime(b) - getContactTime(a);

      if (state.sortOrder === "nameAsc") return nameCompare || newestCompare;
      if (state.sortOrder === "nameDesc") return -nameCompare || newestCompare;
      if (state.sortOrder === "oldest") return getContactTime(a) - getContactTime(b) || nameCompare;

      return newestCompare || nameCompare;
    });
  }

  function setOverlayState() {
    const hasOverlay = Boolean(state.selectedContact || state.modal);
    document.body.classList.toggle("has-overlay", hasOverlay);
  }

  async function loadContacts(searchText) {
    const search = typeof searchText === "string" ? searchText : state.currentSearch;
    state.currentSearch = search;
    state.status = "loading";
    state.errorMessage = "";
    render();

    try {
      state.contacts = search.trim()
        ? await api.searchContacts(search)
        : await api.getContacts();
      state.status = "ready";
    } catch (error) {
      state.status = "error";
      state.errorMessage = error.message === "Failed to fetch"
        ? t("errorFallback")
        : translateErrorMessage(error.message) || t("errorTitle");
    }

    render();
  }

  function render() {
    updateStaticTexts();
    renderCount();
    renderSearch();
    renderContent();
    renderDrawer();
    renderModal();
    setOverlayState();
  }

  function renderCount() {
    if (state.status === "ready") {
      dom.count.textContent = plural(state.contacts.length);
      return;
    }

    if (state.status === "loading") {
      dom.count.textContent = t("loadingContacts");
      return;
    }

    dom.count.textContent = "";
  }

  function renderSearch() {
    if (document.activeElement !== dom.searchInput) {
      dom.searchInput.value = state.currentSearch;
    }

    dom.searchInput.disabled = state.status === "loading";
    dom.clearSearch.hidden = !state.currentSearch;
    dom.sortSelect.disabled = state.status === "loading";
  }

  function renderContent() {
    if (state.status === "loading") {
      dom.content.innerHTML = `<div class="contacts-grid">${Array.from({ length: 8 }).map(skeletonCard).join("")}</div>`;
      return;
    }

    if (state.status === "error") {
      dom.content.innerHTML = errorState();
      return;
    }

    if (state.currentSearch.trim() && state.contacts.length === 0) {
      dom.content.innerHTML = noResultsState(state.currentSearch);
      return;
    }

    if (state.contacts.length === 0) {
      dom.content.innerHTML = emptyState();
      return;
    }

    const sortedContacts = getSortedContacts(state.contacts);

    dom.content.innerHTML = `
      <div class="contacts-grid">
        ${sortedContacts.map(contactCard).join("")}
      </div>
    `;
  }

  function skeletonCard() {
    return `
      <article class="skeleton-card" aria-hidden="true">
        <span class="skeleton skeleton--avatar"></span>
        <span class="skeleton-stack">
          <span class="skeleton" style="width:70%;height:14px;"></span>
          <span class="skeleton" style="width:50%;height:12px;animation-delay:.1s;"></span>
        </span>
        <span class="skeleton" style="width:55%;height:12px;animation-delay:.2s;"></span>
        <span class="skeleton" style="width:45%;height:12px;background:var(--c-teal-light);animation-delay:.3s;"></span>
      </article>
    `;
  }

  function contactCard(contact) {
    const isSelected = state.selectedContact && state.selectedContact._id === contact._id;
    return `
      <button class="contact-card ${isSelected ? "is-selected" : ""}" type="button" data-action="open-contact" data-id="${escapeHtml(contact._id)}">
        ${avatar(contact.name, "lg", getContactPhotoUrl(contact))}
        <span class="contact-card__body">
          <span class="contact-card__name">${escapeHtml(contact.name)}</span>
          ${contact.company ? `<span class="contact-card__company">${escapeHtml(contact.company)}</span>` : ""}
        </span>
        <span class="contact-card__phone">${escapeHtml(contact.phone)}</span>
        <span class="contact-card__link">
          ${t("viewContact")}
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
            <path d="M1.5 5.5h8M6 2l3.5 3.5L6 9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </span>
      </button>
    `;
  }

  function emptyState() {
    return `
      <div class="state">
        <span class="state__icon state__icon--teal" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="12" cy="10" r="5" stroke="currentColor" stroke-width="2"></circle>
            <path d="M3 27c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            <circle cx="23" cy="13" r="3.5" stroke="currentColor" stroke-width="1.8" stroke-opacity="0.5"></circle>
            <path d="M19.5 27c0-3.038 1.567-5.5 3.5-5.5s3.5 2.462 3.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-opacity="0.5"></path>
          </svg>
        </span>
        <h2>${t("emptyTitle")}</h2>
        <p>${t("emptyBody")}</p>
        <button class="btn btn--primary" type="button" data-action="new-contact">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          </svg>
          ${t("newContactFull")}
        </button>
      </div>
    `;
  }

  function noResultsState(query) {
    return `
      <div class="state">
        <span class="state__icon state__icon--cream" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"></circle>
            <path d="M19 19l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            <path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.5"></path>
          </svg>
        </span>
        <h2>${t("noResultsTitle")} <span class="highlight">"${escapeHtml(query)}"</span></h2>
        <p>${t("noResultsBody")}</p>
      </div>
    `;
  }

  function errorState() {
    return `
      <div class="state">
        <span class="state__icon state__icon--coral" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M15 4a11 11 0 100 22A11 11 0 0015 4z" stroke="currentColor" stroke-width="2"></path>
            <path d="M10 10c1.2-1.2 2.8-2 4.5-2a6.5 6.5 0 014.5 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            <circle cx="15" cy="21" r="1" fill="currentColor"></circle>
            <path d="M15 13v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          </svg>
        </span>
        <h2>${t("errorTitle")}</h2>
        <p>${escapeHtml(state.errorMessage || t("errorFallback"))}</p>
        <button class="btn btn--outline" type="button" data-action="retry">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7a5 5 0 019.5-2.2M12 7a5 5 0 01-9.5 2.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
            <path d="M11.5 2v2.5H9M2.5 12V9.5H5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          ${t("retry")}
        </button>
      </div>
    `;
  }

  async function openContact(id) {
    const local = state.contacts.find((contact) => contact._id === id);
    if (state.drawerCloseTimer) {
      clearTimeout(state.drawerCloseTimer);
      state.drawerCloseTimer = null;
    }

    state.drawerIsClosing = false;
    state.drawerAnimationUntil = Date.now() + 340;

    if (local) {
      state.selectedContact = local;
      render();
    }

    try {
      state.selectedContact = await api.getContactById(id);
      render();
    } catch (error) {
      showToast(error.message ? translateErrorMessage(error.message) : t("loadContactError"), "error");
      state.selectedContact = null;
      state.drawerAnimationUntil = 0;
      state.drawerIsClosing = false;
      render();
      loadContacts(state.currentSearch);
    }
  }

  function closeDrawer() {
    if (!state.selectedContact || state.drawerIsClosing) return;

    state.drawerIsClosing = true;
    state.drawerAnimationUntil = 0;
    if (state.modal === "delete") {
      state.modal = null;
    }
    render();

    state.drawerCloseTimer = setTimeout(() => {
      state.selectedContact = null;
      state.drawerIsClosing = false;
      state.drawerCloseTimer = null;
      render();
    }, 340);
  }

  function renderDrawer() {
    const contact = state.selectedContact;
    if (!contact) {
      dom.drawerRoot.innerHTML = "";
      return;
    }

    const shouldAnimateDrawer = Date.now() < state.drawerAnimationUntil;
    const drawerAnimationClass = state.drawerIsClosing
      ? "animate-slide-out-right"
      : shouldAnimateDrawer
        ? "animate-slide-in-right"
        : "";
    const backdropAnimationClass = state.drawerIsClosing
      ? "animate-fade-out"
      : shouldAnimateDrawer
        ? "animate-fade-in"
        : "";

    dom.drawerRoot.innerHTML = `
      <div class="backdrop ${backdropAnimationClass}" data-action="close-drawer"></div>
      <aside class="drawer ${drawerAnimationClass}" role="dialog" aria-label="${escapeHtml(t("drawerAria", { name: contact.name }))}">
        <div class="drawer__header">
          <span class="drawer__eyebrow">${t("drawerLabel")}</span>
          <button class="icon-button" type="button" data-action="close-drawer" aria-label="${t("closePanel")}">
            ${iconClose(18)}
          </button>
        </div>

        <div class="drawer__hero">
          ${avatar(contact.name, "xl", getContactPhotoUrl(contact))}
          <h2>${escapeHtml(contact.name)}</h2>
          ${contact.company ? `<p>${escapeHtml(contact.company)}</p>` : ""}
        </div>

        <div class="drawer__details">
          ${contactField(t("phoneLabel"), contact.phone, iconPhone(), `tel:${contact.phone}`, "phone")}
          ${contactField(t("emailLabel"), contact.email, iconMail(), `mailto:${contact.email}`, "email")}
          ${extraLinksList(contact.extraLinks || [])}
          ${contact.notes ? `
            <div class="notes-block">
              <p class="notes-block__label">${t("notesLabel")}</p>
              <p class="notes-block__text">${escapeHtml(contact.notes)}</p>
            </div>
          ` : ""}
          ${contact.createdAt ? `<p class="drawer__date">${escapeHtml(t("addedOn", { date: formatDate(contact.createdAt) }))}</p>` : ""}
        </div>

        <div class="drawer__actions">
          <button class="btn btn--primary" type="button" data-action="edit-contact">${t("editContact")}</button>
          <button class="drawer__delete" type="button" data-action="confirm-delete">${t("deleteContact")}</button>
        </div>
      </aside>
    `;

  }

  function contactField(label, value, icon, href, copyType) {
    const copyLabel = copyType === "phone" ? t("copyPhone") : t("copyEmail");

    return `
      <div class="detail-field">
        <p class="detail-field__label">${escapeHtml(label)}</p>
        <div class="detail-field__row">
          <span class="detail-field__icon" aria-hidden="true">${icon}</span>
          <a href="${escapeHtml(href)}">${escapeHtml(value)}</a>
          <button class="icon-button copy-button" type="button" data-action="copy" data-copy="${copyType}" data-value="${escapeHtml(value)}" aria-label="${escapeHtml(copyLabel)}" title="${t("copy")}">
            ${iconCopy()}
          </button>
        </div>
      </div>
    `;
  }

  function extraLinksList(links) {
    const normalizedLinks = normalizeExtraLinks(links);
    if (normalizedLinks.length === 0) return "";

    return `
      <section class="extra-links-list" aria-label="${escapeHtml(t("contactLinksLabel"))}">
        <p class="extra-links-list__label">${escapeHtml(t("contactLinksLabel"))}</p>
        <div class="extra-links-list__items">
          ${normalizedLinks.map(extraLinkField).join("")}
        </div>
      </section>
    `;
  }

  function extraLinkField(link) {
    const label = getExtraLinkLabel(link);
    const href = link.url || buildExtraLinkUrl(link);
    const value = link.value || "";

    return `
      <div class="extra-link-field">
        <span class="detail-field__icon" aria-hidden="true">${iconLink()}</span>
        <div class="extra-link-field__body">
          <span class="extra-link-field__label">${escapeHtml(label)}</span>
          ${href ? `
            <a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>
          ` : `
            <span class="extra-link-field__value">${escapeHtml(value)}</span>
          `}
        </div>
        <button class="icon-button copy-button" type="button" data-action="copy" data-value="${escapeHtml(value)}" aria-label="${escapeHtml(`${t("copy")} ${label}`)}" title="${t("copy")}">
          ${iconCopy()}
        </button>
      </div>
    `;
  }

  function renderModal() {
    if (state.modal === "form") {
      const shouldAnimate = state.modalShouldAnimate;
      dom.modalRoot.innerHTML = formModal(shouldAnimate);
      state.modalShouldAnimate = false;
      if (state.formShouldFocus) {
        state.formShouldFocus = false;
        setTimeout(() => {
          const target = state.formErrors.name
            ? "#name"
            : state.formErrors.phone
              ? "#phone"
              : state.formErrors.email
                ? "#email"
                : state.formErrors.photo
                  ? "#photo"
                  : state.formErrors.extraLinks
                    ? "#extraLinkValue0, #addExtraLinkButton"
                  : "#name";
          const input = document.querySelector(target);
          if (input && !state.saving) input.focus();
        }, 0);
      }
      return;
    }

    if (state.modal === "delete" && state.selectedContact) {
      const shouldAnimate = state.modalShouldAnimate;
      dom.modalRoot.innerHTML = deleteModal(state.selectedContact, shouldAnimate);
      state.modalShouldAnimate = false;
      return;
    }

    dom.modalRoot.innerHTML = "";
  }

  function formModal(shouldAnimate) {
    const isEdit = state.formMode === "edit";
    const title = isEdit ? t("editTitle") : t("createTitle");
    const submitLabel = isEdit ? t("saveChanges") : t("saveContact");
    const contact = state.selectedContact;
    const backdropClass = shouldAnimate ? " animate-fade-in" : "";
    const modalClass = shouldAnimate ? " animate-scale-in" : "";

    return `
      <div class="backdrop backdrop--modal${backdropClass}" data-action="close-modal"></div>
      <div class="modal-layer" role="dialog" aria-modal="true" aria-label="${title}">
        <section class="modal${modalClass}">
          <header class="modal__header">
            ${isEdit && contact ? avatar(contact.name, "md", getContactPhotoUrl(contact)) : ""}
            <div class="modal__title">
              <h2>${title}</h2>
              ${!isEdit ? `<p>${t("createHelp")}</p>` : ""}
            </div>
            <button class="icon-button" type="button" data-action="close-modal" aria-label="${t("close")}">
              ${iconClose(18)}
            </button>
          </header>

          <form class="contact-form" id="contactForm" novalidate>
            <div class="form-stack">
              ${photoField(isEdit, contact)}
              ${fieldInput("name", t("nameLabel"), "text", t("namePlaceholder"), true, "name")}
              <div class="form-grid">
                ${fieldInput("phone", t("phoneLabel"), "tel", t("phonePlaceholder"), true, "tel")}
                ${fieldInput("email", t("emailLabel"), "email", t("emailPlaceholder"), true, "email")}
              </div>
              ${fieldInput("company", t("companyLabel"), "text", t("companyPlaceholder"), false, "organization")}
              ${fieldTextarea("notes", t("notesLabel"), t("notesPlaceholder"))}
              ${extraLinksField()}
            </div>

            <div class="form-actions">
              <button class="btn btn--ghost" type="button" data-action="close-modal" ${state.saving ? "disabled" : ""}>${t("cancel")}</button>
              <button class="btn btn--primary" type="submit" ${state.saving ? "disabled" : ""}>
                ${state.saving ? `<span class="spinner" aria-hidden="true"></span> ${t("saving")}` : submitLabel}
              </button>
            </div>
          </form>
        </section>
      </div>
    `;
  }

  function fieldInput(id, label, type, placeholder, required, autocomplete) {
    const error = state.formErrors[id] || "";
    return `
      <div class="field ${error ? "has-error" : ""}">
        <label for="${id}">${label}${required ? "<span>*</span>" : ""}</label>
        <input id="${id}" name="${id}" type="${type}" value="${escapeHtml(state.formDraft[id])}" placeholder="${placeholder}" autocomplete="${autocomplete}" ${error ? 'aria-invalid="true"' : ""} ${error ? `aria-describedby="${id}Error"` : ""}>
        ${fieldError(id, error)}
      </div>
    `;
  }

  function photoField(isEdit, contact) {
    const error = state.formErrors.photo || "";
    const existingPhotoUrl = state.formDraft.removePhoto
      ? ""
      : api.getAssetUrl(state.formDraft.existingPhotoUrl);
    const previewUrl = state.formDraft.photoPreviewUrl || existingPhotoUrl;
    const fallbackName = state.formDraft.name || (contact && contact.name) || "";
    const hasCurrentPhoto = Boolean(state.formDraft.photoFile || (isEdit && state.formDraft.existingPhotoUrl && !state.formDraft.removePhoto));
    const status = state.formDraft.photoFile
      ? t("photoSelected")
      : state.formDraft.removePhoto
        ? t("photoWillBeRemoved")
        : t("photoHelp");

    return `
      <div class="photo-picker ${error ? "has-error" : ""}">
        <label class="photo-picker__label" for="photo">${t("photoLabel")}</label>
        <div class="photo-picker__content">
          <div class="photo-picker__preview">
            ${previewUrl ? `<img src="${escapeHtml(previewUrl)}" alt="">` : avatar(fallbackName, "lg")}
          </div>

          <div class="photo-picker__controls">
            <label class="btn btn--ghost photo-picker__button" for="photo">
              ${iconCamera()}
              ${previewUrl ? t("changePhoto") : t("choosePhoto")}
            </label>
            <input class="sr-only" id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/gif,image/webp" ${state.saving ? "disabled" : ""}>
            ${hasCurrentPhoto ? `
              <button class="btn btn--ghost photo-picker__remove" type="button" data-action="remove-photo" ${state.saving ? "disabled" : ""}>
                ${iconTrash()}
                ${t("removePhoto")}
              </button>
            ` : ""}
            <p class="photo-picker__hint">${escapeHtml(status)}</p>
            ${fieldError("photo", error)}
          </div>
        </div>
      </div>
    `;
  }

  function extraLinksField() {
    const links = state.formDraft.extraLinks || [];
    const error = state.formErrors.extraLinks || "";

    return `
      <section class="extra-links-editor ${error ? "has-error" : ""}" aria-labelledby="extraLinksTitle">
        <div class="extra-links-editor__header">
          <div>
            <h3 id="extraLinksTitle">${escapeHtml(t("extraLinksLabel"))}</h3>
            <p>${escapeHtml(t("extraLinksHelp"))}</p>
          </div>
          <button class="btn btn--ghost extra-links-editor__add" id="addExtraLinkButton" type="button" data-action="add-extra-link" ${links.length >= maxExtraLinks || state.saving ? "disabled" : ""}>
            ${iconPlusSmall()}
            ${t("addExtraLink")}
          </button>
        </div>

        ${links.length ? `
          <div class="extra-links-editor__rows">
            ${links.map(extraLinkRow).join("")}
          </div>
        ` : ""}

        ${fieldError("extraLinks", error)}
      </section>
    `;
  }

  function extraLinkRow(link, index) {
    const type = getExtraLinkType(link.type);
    const customLabel = String(link.label || "");
    const value = String(link.value || "");

    return `
      <div class="extra-link-row" data-extra-link-index="${index}">
        <label class="extra-link-row__type">
          <span>${escapeHtml(t("extraLinkTypeLabel"))}</span>
          <select name="extraLinkType${index}" data-extra-link-field="type" data-extra-link-index="${index}" ${state.saving ? "disabled" : ""}>
            ${extraLinkTypes.map((option) => `
              <option value="${option.value}" ${option.value === type.value ? "selected" : ""}>${escapeHtml(t(option.labelKey))}</option>
            `).join("")}
          </select>
        </label>

        ${type.value === "other" ? `
          <label class="extra-link-row__label">
            <span>${escapeHtml(t("extraLinkCustomLabel"))}</span>
            <input name="extraLinkLabel${index}" type="text" value="${escapeHtml(customLabel)}" placeholder="${escapeHtml(t("otherLabelPlaceholder"))}" data-extra-link-field="label" data-extra-link-index="${index}" ${state.saving ? "disabled" : ""}>
          </label>
        ` : ""}

        <label class="extra-link-row__value">
          <span>${escapeHtml(t("extraLinkValueLabel"))}</span>
          <input id="extraLinkValue${index}" name="extraLinkValue${index}" type="text" value="${escapeHtml(value)}" placeholder="${escapeHtml(t(type.placeholderKey))}" data-extra-link-field="value" data-extra-link-index="${index}" ${state.saving ? "disabled" : ""}>
        </label>

        <button class="icon-button extra-link-row__remove" type="button" data-action="remove-extra-link" data-extra-link-index="${index}" aria-label="${escapeHtml(t("removeExtraLink"))}" title="${escapeHtml(t("removeExtraLink"))}" ${state.saving ? "disabled" : ""}>
          ${iconTrash()}
        </button>
      </div>
    `;
  }

  function fieldTextarea(id, label, placeholder) {
    const error = state.formErrors[id] || "";
    return `
      <div class="field ${error ? "has-error" : ""}">
        <label for="${id}">${label}</label>
        <textarea id="${id}" name="${id}" rows="3" placeholder="${placeholder}" ${error ? 'aria-invalid="true"' : ""} ${error ? `aria-describedby="${id}Error"` : ""}>${escapeHtml(state.formDraft[id])}</textarea>
        ${fieldError(id, error)}
      </div>
    `;
  }

  function fieldError(id, error) {
    if (!error) return "";
    return `
      <p class="field__error" id="${id}Error" role="alert">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.2"></circle>
          <path d="M6 3.5v3M6 8.5v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"></path>
        </svg>
        ${escapeHtml(error)}
      </p>
    `;
  }

  function deleteModal(contact, shouldAnimate) {
    const backdropClass = shouldAnimate ? " animate-fade-in" : "";
    const modalClass = shouldAnimate ? " animate-scale-in" : "";

    return `
      <div class="backdrop backdrop--danger${backdropClass}" data-action="close-modal"></div>
      <div class="modal-layer modal-layer--danger" role="dialog" aria-modal="true" aria-label="${t("deleteDialogAria")}">
        <section class="modal modal--delete${modalClass}">
          <span class="delete-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 8v5M11 15.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
              <path d="M9.35 3.07L1.62 16.5A1.87 1.87 0 003.27 19h15.46a1.87 1.87 0 001.65-2.5L12.65 3.07a1.87 1.87 0 00-3.3 0z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path>
            </svg>
          </span>
          <div class="delete-contact-heading">
            ${avatar(contact.name, "sm", getContactPhotoUrl(contact))}
            <h2>${escapeHtml(contact.name)}</h2>
          </div>
          <p>${t("deleteWarning")}</p>
          <div class="delete-actions">
            <button class="btn btn--ghost" type="button" data-action="close-modal" ${state.saving ? "disabled" : ""}>${t("cancel")}</button>
            <button class="btn btn--danger" type="button" data-action="delete-contact" ${state.saving ? "disabled" : ""}>
              ${state.saving ? `<span class="spinner" aria-hidden="true"></span> ${t("deleting")}` : t("deleteAction")}
            </button>
          </div>
        </section>
      </div>
    `;
  }

  function revokePhotoPreview() {
    if (!state.formPhotoObjectUrl) return;

    URL.revokeObjectURL(state.formPhotoObjectUrl);
    state.formPhotoObjectUrl = "";
  }

  function setFormPhoto(file) {
    if (!file) return;

    if (!photoAllowedTypes.has(file.type)) {
      revokePhotoPreview();
      state.formDraft.photoFile = null;
      state.formDraft.photoPreviewUrl = "";
      state.formDraft.photoError = t("photoTypeError");
      state.formErrors.photo = t("photoTypeError");
      render();
      return;
    }

    if (file.size > photoMaxSize) {
      revokePhotoPreview();
      state.formDraft.photoFile = null;
      state.formDraft.photoPreviewUrl = "";
      state.formDraft.photoError = t("photoSizeError");
      state.formErrors.photo = t("photoSizeError");
      render();
      return;
    }

    revokePhotoPreview();
    state.formPhotoObjectUrl = URL.createObjectURL(file);
    state.formDraft.photoFile = file;
    state.formDraft.photoPreviewUrl = state.formPhotoObjectUrl;
    state.formDraft.photoError = "";
    state.formDraft.removePhoto = false;
    delete state.formErrors.photo;
    render();
  }

  function removeFormPhoto() {
    revokePhotoPreview();
    state.formDraft.photoFile = null;
    state.formDraft.photoPreviewUrl = "";
    state.formDraft.photoError = "";
    state.formDraft.removePhoto = Boolean(state.formDraft.existingPhotoUrl);
    delete state.formErrors.photo;
    render();
  }

  function addExtraLink() {
    if (state.saving) return;

    const links = state.formDraft.extraLinks || [];

    if (links.length >= maxExtraLinks) {
      state.formErrors.extraLinks = t("extraLinkMaxError");
      state.formShouldFocus = true;
      render();
      return;
    }

    state.formDraft.extraLinks = [...links, defaultExtraLink()];
    delete state.formErrors.extraLinks;
    render();
  }

  function removeExtraLink(index) {
    if (state.saving) return;

    state.formDraft.extraLinks = (state.formDraft.extraLinks || []).filter((_, currentIndex) => currentIndex !== index);
    delete state.formErrors.extraLinks;
    render();
  }

  function updateExtraLink(index, field, value, shouldRender = false) {
    const links = [...(state.formDraft.extraLinks || [])];
    const current = links[index];

    if (!current) return;

    if (field === "type") {
      current.type = extraLinkTypeValues.includes(value) ? value : "other";
      if (current.type !== "other") current.label = "";
    } else if (field === "label" || field === "value") {
      current[field] = value;
    }

    links[index] = current;
    state.formDraft.extraLinks = links;
    delete state.formErrors.extraLinks;

    const errorNode = document.querySelector("#extraLinksError");
    if (errorNode) errorNode.remove();
    const editor = document.querySelector(".extra-links-editor");
    if (editor) editor.classList.remove("has-error");

    if (shouldRender) render();
  }

  function openForm(mode) {
    const contact = state.selectedContact;
    revokePhotoPreview();
    state.modal = "form";
    state.modalShouldAnimate = true;
    state.formMode = mode;
    state.formErrors = {};
    state.formShouldFocus = true;
    state.formDraft = mode === "edit" && contact
      ? {
          name: contact.name || "",
          phone: contact.phone || "",
          email: contact.email || "",
          company: contact.company || "",
          notes: contact.notes || "",
          photoFile: null,
          photoPreviewUrl: "",
          existingPhotoUrl: contact.photoUrl || "",
          photoError: "",
          removePhoto: false,
          extraLinks: (contact.extraLinks || []).map((link) => ({
            type: extraLinkTypeValues.includes(link.type) ? link.type : "other",
            label: link.label || "",
            value: link.value || link.url || ""
          }))
        }
      : emptyForm();
    render();
  }

  function closeModal() {
    if (state.saving) return;
    revokePhotoPreview();
    state.modal = null;
    state.modalShouldAnimate = false;
    state.formErrors = {};
    state.formShouldFocus = false;
    state.formDraft = emptyForm();
    render();
  }

  function getFormData() {
    const form = document.querySelector("#contactForm");
    const data = new FormData(form);
    return {
      name: String(data.get("name") || ""),
      phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""),
      company: String(data.get("company") || ""),
      notes: String(data.get("notes") || ""),
      photoFile: state.formDraft.photoFile,
      photoPreviewUrl: state.formDraft.photoPreviewUrl,
      existingPhotoUrl: state.formDraft.existingPhotoUrl,
      photoError: state.formDraft.photoError,
      removePhoto: state.formDraft.removePhoto,
      extraLinks: state.formDraft.extraLinks || []
    };
  }

  function validateForm(data) {
    const errors = {};
    if (!data.name.trim()) errors.name = t("nameRequired");
    if (!data.phone.trim()) errors.phone = t("phoneRequired");
    if (!data.email.trim()) {
      errors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = t("invalidEmail");
    }

    if (data.photoError) {
      errors.photo = data.photoError;
    } else if (data.photoFile && !photoAllowedTypes.has(data.photoFile.type)) {
      errors.photo = t("photoTypeError");
    } else if (data.photoFile && data.photoFile.size > photoMaxSize) {
      errors.photo = t("photoSizeError");
    }

    if ((data.extraLinks || []).length > maxExtraLinks) {
      errors.extraLinks = t("extraLinkMaxError");
    } else if ((data.extraLinks || []).some((link) => !String(link.value || "").trim())) {
      errors.extraLinks = t("extraLinkValueRequired");
    }

    return errors;
  }

  function normalizeForm(data) {
    return {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      company: data.company.trim(),
      notes: data.notes.trim(),
      photoFile: data.photoFile,
      removePhoto: data.removePhoto,
      extraLinks: normalizeExtraLinks(data.extraLinks || [])
    };
  }

  function applyApiError(message) {
    const normalizedMessage = message.toLowerCase();
    const translatedMessage = translateErrorMessage(message);
    const field = normalizedMessage.includes("nombre") || normalizedMessage.includes("name") ? "name"
      : normalizedMessage.includes("telefono") || normalizedMessage.includes("teléfono") || normalizedMessage.includes("phone") ? "phone"
        : normalizedMessage.includes("correo") || normalizedMessage.includes("email") ? "email"
          : normalizedMessage.includes("empresa") || normalizedMessage.includes("company") ? "company"
            : normalizedMessage.includes("notas") || normalizedMessage.includes("notes") ? "notes"
              : normalizedMessage.includes("imagen") || normalizedMessage.includes("image") || normalizedMessage.includes("jpg") || normalizedMessage.includes("png") || normalizedMessage.includes("webp") ? "photo"
                : normalizedMessage.includes("link") || normalizedMessage.includes("url") ? "extraLinks"
                  : null;

    if (field) {
      state.formErrors = { [field]: translatedMessage };
      state.formShouldFocus = true;
      render();
    }

    showToast(translatedMessage, "error");
  }

  async function saveContact(event) {
    event.preventDefault();
    if (state.saving) return;

    const raw = getFormData();
    state.formDraft = raw;
    state.formErrors = validateForm(raw);

    if (Object.keys(state.formErrors).length > 0) {
      state.formShouldFocus = true;
      render();
      return;
    }

    state.saving = true;
    render();

    try {
      const payload = normalizeForm(raw);
      if (state.formMode === "create") {
        await api.createContact(payload);
        showToast(t("createdToast"));
      } else if (state.selectedContact) {
        state.selectedContact = await api.updateContact(state.selectedContact._id, payload);
        showToast(t("updatedToast"));
      }

      revokePhotoPreview();
      state.modal = null;
      state.modalShouldAnimate = false;
      state.formErrors = {};
      state.formShouldFocus = false;
      state.formDraft = emptyForm();
      await loadContacts(state.currentSearch);
    } catch (error) {
      state.saving = false;
      applyApiError(error.message || t("saveContactError"));
      return;
    }

    state.saving = false;
    render();
  }

  async function deleteSelectedContact() {
    if (!state.selectedContact || state.saving) return;

    state.saving = true;
    render();

    try {
      const id = state.selectedContact._id;
      await api.deleteContact(id);
      state.selectedContact = null;
      state.drawerAnimationUntil = 0;
      state.drawerIsClosing = false;
      state.modal = null;
      state.modalShouldAnimate = false;
      showToast(t("deletedToast"));
      await loadContacts(state.currentSearch);
    } catch (error) {
      showToast(error.message ? translateErrorMessage(error.message) : t("deleteContactError"), "error");
    }

    state.saving = false;
    render();
  }

  function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast toast--${type === "error" ? "error" : "success"} animate-slide-up`;
    toast.setAttribute("role", "status");
    toast.innerHTML = `
      <span class="toast__icon" aria-hidden="true">
        ${type === "error" ? iconWarningTiny() : iconCheckTiny()}
      </span>
      <span>${escapeHtml(message)}</span>
    `;
    dom.toastRoot.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      setTimeout(() => toast.remove(), 220);
    }, 4200);
  }

  async function copyValue(button) {
    const value = button.dataset.value || "";
    try {
      await navigator.clipboard.writeText(value);
      button.classList.add("is-copied");
      button.innerHTML = iconCheck();
      button.title = t("copied");
      setTimeout(() => {
        button.classList.remove("is-copied");
        button.innerHTML = iconCopy();
        button.title = t("copy");
      }, 2000);
    } catch {
      showToast(t("copyError"), "error");
    }
  }

  dom.newContactButton.addEventListener("click", () => {
    closePreferencesMenu();
    openForm("create");
  });

  dom.preferencesTrigger.addEventListener("click", (event) => {
    if (!dom.preferencesMenu.open) return;

    event.preventDefault();
    closePreferencesMenu();
  });

  dom.clearSearch.addEventListener("click", () => {
    state.currentSearch = "";
    dom.searchInput.value = "";
    loadContacts("");
  });

  dom.searchInput.addEventListener("input", (event) => {
    state.currentSearch = event.target.value;
    dom.clearSearch.hidden = !state.currentSearch;
    clearTimeout(state.searchTimer);
    state.searchTimer = setTimeout(() => loadContacts(state.currentSearch), 300);
  });

  dom.sortSelect.addEventListener("change", (event) => {
    const sortOrder = event.target.value;
    if (sortOptions.some((option) => option.value === sortOrder)) {
      state.sortOrder = sortOrder;
      render();
    }
  });

  dom.content.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    if (action === "open-contact") openContact(actionTarget.dataset.id);
    if (action === "new-contact") openForm("create");
    if (action === "retry") loadContacts(state.currentSearch);
  });

  document.addEventListener("click", (event) => {
    if (dom.preferencesMenu.open && !dom.preferencesMenu.contains(event.target)) {
      closePreferencesMenu();
    }

    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    if (action === "set-theme") {
      const theme = actionTarget.dataset.themeOption;
      if (themeOptions.some((option) => option.value === theme)) {
        state.theme = theme;
        localStorage.setItem(THEME_STORAGE_KEY, state.theme);
        render();
      }
    }
    if (action === "set-accent") {
      const accent = actionTarget.dataset.accentOption;
      if (accentOptions.some((option) => option.value === accent)) {
        state.accent = accent;
        localStorage.setItem(ACCENT_STORAGE_KEY, state.accent);
        render();
      }
    }
    if (action === "set-language") {
      const language = actionTarget.dataset.languageOption;
      if (languageOptions.some((option) => option.value === language)) {
        state.language = language;
        localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language);
        render();
      }
    }
    if (action === "close-drawer") closeDrawer();
    if (action === "edit-contact") openForm("edit");
    if (action === "confirm-delete") {
      state.modal = "delete";
      state.modalShouldAnimate = true;
      render();
    }
    if (action === "close-modal") closeModal();
    if (action === "remove-photo") removeFormPhoto();
    if (action === "add-extra-link") addExtraLink();
    if (action === "remove-extra-link") removeExtraLink(Number(actionTarget.dataset.extraLinkIndex));
    if (action === "delete-contact") deleteSelectedContact();
    if (action === "copy") copyValue(actionTarget);
  });

  document.addEventListener("submit", (event) => {
    if (event.target.matches("#contactForm")) {
      saveContact(event);
    }
  });

  document.addEventListener("input", (event) => {
    const field = event.target.closest("#contactForm [name]");
    if (!field) return;
    if (field.type === "file") return;

    if (field.dataset.extraLinkField) {
      updateExtraLink(
        Number(field.dataset.extraLinkIndex),
        field.dataset.extraLinkField,
        field.value
      );
      return;
    }

    state.formDraft[field.name] = field.value;
    if (state.formErrors[field.name]) {
      delete state.formErrors[field.name];
      field.closest(".field").classList.remove("has-error");
      const errorNode = document.querySelector(`#${field.name}Error`);
      if (errorNode) errorNode.remove();
    }
  });

  document.addEventListener("change", (event) => {
    const photoInput = event.target.closest("#contactForm input[type='file'][name='photo']");
    if (photoInput) {
      setFormPhoto(photoInput.files[0]);
      return;
    }

    const extraLinkSelect = event.target.closest("#contactForm select[data-extra-link-field='type']");
    if (!extraLinkSelect) return;

    updateExtraLink(
      Number(extraLinkSelect.dataset.extraLinkIndex),
      "type",
      extraLinkSelect.value,
      true
    );
  });

  document.addEventListener("error", (event) => {
    if (event.target instanceof Element && event.target.matches(".avatar__image")) {
      const avatarNode = event.target.closest(".avatar");
      if (avatarNode) avatarNode.classList.remove("avatar--image");
      event.target.remove();
    }
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.modal) {
      closeModal();
    } else if (dom.preferencesMenu.open) {
      closePreferencesMenu();
    } else if (state.selectedContact) {
      closeDrawer();
    }
  });

  loadContacts("");
})();
