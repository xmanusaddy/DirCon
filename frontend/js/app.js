(function () {
  const api = window.DirConAPI;
  const avatarColors = [
    { bg: "#c8edea", text: "#1b8c83" },
    { bg: "#fde8e6", text: "#c94b3a" },
    { bg: "#fef3c4", text: "#966e0a" },
    { bg: "#d1f0e8", text: "#1e7a60" },
    { bg: "#ebe6f8", text: "#6040bb" },
    { bg: "#fde6d8", text: "#b84d22" }
  ];

  const state = {
    contacts: [],
    status: "loading",
    errorMessage: "",
    currentSearch: "",
    selectedContact: null,
    drawerAnimationUntil: 0,
    drawerIsClosing: false,
    drawerCloseTimer: null,
    modal: null,
    formMode: "create",
    formDraft: emptyForm(),
    formErrors: {},
    saving: false,
    searchTimer: null
  };

  const dom = {
    count: document.querySelector("#contactCount"),
    searchInput: document.querySelector("#searchInput"),
    clearSearch: document.querySelector("#clearSearchButton"),
    content: document.querySelector("#contentArea"),
    drawerRoot: document.querySelector("#drawerRoot"),
    modalRoot: document.querySelector("#modalRoot"),
    toastRoot: document.querySelector("#toastRoot"),
    newContactButton: document.querySelector("#newContactButton")
  };

  function emptyForm() {
    return {
      name: "",
      phone: "",
      email: "",
      company: "",
      notes: ""
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

  function avatar(name, size) {
    const color = getAvatarColor(name);
    return `
      <span class="avatar avatar--${size}" style="background:${color.bg};color:${color.text};" aria-label="${escapeHtml(name)}">
        ${escapeHtml(getInitials(name))}
      </span>
    `;
  }

  function plural(count) {
    return `${count} ${count === 1 ? "contacto" : "contactos"}`;
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return "";
    }
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
        ? "Comprueba que el backend esté encendido e inténtalo nuevamente."
        : error.message || "No pudimos conectar con DirCon";
    }

    render();
  }

  function render() {
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
      dom.count.textContent = "Cargando contactos...";
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

    dom.content.innerHTML = `
      <div class="contacts-grid">
        ${state.contacts.map(contactCard).join("")}
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
        ${avatar(contact.name, "lg")}
        <span class="contact-card__body">
          <span class="contact-card__name">${escapeHtml(contact.name)}</span>
          ${contact.company ? `<span class="contact-card__company">${escapeHtml(contact.company)}</span>` : ""}
        </span>
        <span class="contact-card__phone">${escapeHtml(contact.phone)}</span>
        <span class="contact-card__link">
          Ver contacto
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
        <h2>Todavía no tienes contactos</h2>
        <p>Agrega tu primer contacto para comenzar a organizar tu directorio.</p>
        <button class="btn btn--primary" type="button" data-action="new-contact">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          </svg>
          Nuevo contacto
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
        <h2>No encontramos <span class="highlight">"${escapeHtml(query)}"</span></h2>
        <p>Prueba buscando con un nombre diferente o revisa la ortografía.</p>
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
        <h2>No pudimos conectar con DirCon</h2>
        <p>${escapeHtml(state.errorMessage || "Comprueba que el backend esté encendido e inténtalo nuevamente.")}</p>
        <button class="btn btn--outline" type="button" data-action="retry">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7a5 5 0 019.5-2.2M12 7a5 5 0 01-9.5 2.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
            <path d="M11.5 2v2.5H9M2.5 12V9.5H5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          Reintentar
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
      showToast(error.message || "No se pudo cargar el contacto", "error");
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
      <aside class="drawer ${drawerAnimationClass}" role="dialog" aria-label="Detalles de ${escapeHtml(contact.name)}">
        <div class="drawer__header">
          <span class="drawer__eyebrow">Contacto</span>
          <button class="icon-button" type="button" data-action="close-drawer" aria-label="Cerrar panel">
            ${iconClose(18)}
          </button>
        </div>

        <div class="drawer__hero">
          ${avatar(contact.name, "xl")}
          <h2>${escapeHtml(contact.name)}</h2>
          ${contact.company ? `<p>${escapeHtml(contact.company)}</p>` : ""}
        </div>

        <div class="drawer__details">
          ${contactField("Teléfono", contact.phone, iconPhone(), `tel:${contact.phone}`, "phone")}
          ${contactField("Correo electrónico", contact.email, iconMail(), `mailto:${contact.email}`, "email")}
          ${contact.notes ? `
            <div class="notes-block">
              <p class="notes-block__label">Notas</p>
              <p class="notes-block__text">${escapeHtml(contact.notes)}</p>
            </div>
          ` : ""}
          ${contact.createdAt ? `<p class="drawer__date">Agregado el ${escapeHtml(formatDate(contact.createdAt))}</p>` : ""}
        </div>

        <div class="drawer__actions">
          <button class="btn btn--primary" type="button" data-action="edit-contact">Editar contacto</button>
          <button class="drawer__delete" type="button" data-action="confirm-delete">Eliminar contacto</button>
        </div>
      </aside>
    `;

  }

  function contactField(label, value, icon, href, copyType) {
    return `
      <div class="detail-field">
        <p class="detail-field__label">${escapeHtml(label)}</p>
        <div class="detail-field__row">
          <span class="detail-field__icon" aria-hidden="true">${icon}</span>
          <a href="${escapeHtml(href)}">${escapeHtml(value)}</a>
          <button class="icon-button copy-button" type="button" data-action="copy" data-copy="${copyType}" data-value="${escapeHtml(value)}" aria-label="Copiar ${escapeHtml(label.toLowerCase())}" title="Copiar">
            ${iconCopy()}
          </button>
        </div>
      </div>
    `;
  }

  function renderModal() {
    if (state.modal === "form") {
      dom.modalRoot.innerHTML = formModal();
      setTimeout(() => {
        const target = state.formErrors.name
          ? "#name"
          : state.formErrors.phone
            ? "#phone"
            : state.formErrors.email
              ? "#email"
              : "#name";
        const input = document.querySelector(target);
        if (input && !state.saving) input.focus();
      }, 0);
      return;
    }

    if (state.modal === "delete" && state.selectedContact) {
      dom.modalRoot.innerHTML = deleteModal(state.selectedContact);
      return;
    }

    dom.modalRoot.innerHTML = "";
  }

  function formModal() {
    const isEdit = state.formMode === "edit";
    const title = isEdit ? "Editar contacto" : "Nuevo contacto";
    const submitLabel = isEdit ? "Guardar cambios" : "Guardar contacto";
    const contact = state.selectedContact;

    return `
      <div class="backdrop backdrop--modal animate-fade-in" data-action="close-modal"></div>
      <div class="modal-layer" role="dialog" aria-modal="true" aria-label="${title}">
        <section class="modal animate-scale-in">
          <header class="modal__header">
            ${isEdit && contact ? avatar(contact.name, "md") : ""}
            <div class="modal__title">
              <h2>${title}</h2>
              ${!isEdit ? "<p>Los campos marcados con * son obligatorios.</p>" : ""}
            </div>
            <button class="icon-button" type="button" data-action="close-modal" aria-label="Cerrar">
              ${iconClose(18)}
            </button>
          </header>

          <form class="contact-form" id="contactForm" novalidate>
            <div class="form-stack">
              ${fieldInput("name", "Nombre", "text", "Ana Martinez", true, "name")}
              <div class="form-grid">
                ${fieldInput("phone", "Teléfono", "tel", "809-555-0100", true, "tel")}
                ${fieldInput("email", "Correo electrónico", "email", "ana@email.com", true, "email")}
              </div>
              ${fieldInput("company", "Empresa", "text", "Nombre de la empresa", false, "organization")}
              ${fieldTextarea("notes", "Notas", "Agrega una nota sobre este contacto...")}
            </div>

            <div class="form-actions">
              <button class="btn btn--ghost" type="button" data-action="close-modal" ${state.saving ? "disabled" : ""}>Cancelar</button>
              <button class="btn btn--primary" type="submit" ${state.saving ? "disabled" : ""}>
                ${state.saving ? '<span class="spinner" aria-hidden="true"></span> Guardando...' : submitLabel}
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

  function deleteModal(contact) {
    return `
      <div class="backdrop backdrop--danger animate-fade-in" data-action="close-modal"></div>
      <div class="modal-layer modal-layer--danger" role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
        <section class="modal modal--delete animate-scale-in">
          <span class="delete-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 8v5M11 15.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
              <path d="M9.35 3.07L1.62 16.5A1.87 1.87 0 003.27 19h15.46a1.87 1.87 0 001.65-2.5L12.65 3.07a1.87 1.87 0 00-3.3 0z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path>
            </svg>
          </span>
          <div class="delete-contact-heading">
            ${avatar(contact.name, "sm")}
            <h2>${escapeHtml(contact.name)}</h2>
          </div>
          <p>Esta acción eliminará el contacto de forma permanente y no se puede deshacer.</p>
          <div class="delete-actions">
            <button class="btn btn--ghost" type="button" data-action="close-modal" ${state.saving ? "disabled" : ""}>Cancelar</button>
            <button class="btn btn--danger" type="button" data-action="delete-contact" ${state.saving ? "disabled" : ""}>
              ${state.saving ? '<span class="spinner" aria-hidden="true"></span> Eliminando...' : "Eliminar"}
            </button>
          </div>
        </section>
      </div>
    `;
  }

  function openForm(mode) {
    const contact = state.selectedContact;
    state.modal = "form";
    state.formMode = mode;
    state.formErrors = {};
    state.formDraft = mode === "edit" && contact
      ? {
          name: contact.name || "",
          phone: contact.phone || "",
          email: contact.email || "",
          company: contact.company || "",
          notes: contact.notes || ""
        }
      : emptyForm();
    render();
  }

  function closeModal() {
    if (state.saving) return;
    state.modal = null;
    state.formErrors = {};
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
      notes: String(data.get("notes") || "")
    };
  }

  function validateForm(data) {
    const errors = {};
    if (!data.name.trim()) errors.name = "El nombre es obligatorio";
    if (!data.phone.trim()) errors.phone = "El teléfono es obligatorio";
    if (!data.email.trim()) {
      errors.email = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = "El correo no tiene un formato válido";
    }
    return errors;
  }

  function normalizeForm(data) {
    return {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      company: data.company.trim(),
      notes: data.notes.trim()
    };
  }

  function applyApiError(message) {
    const field = message.includes("nombre") ? "name"
      : message.includes("telefono") ? "phone"
        : message.includes("correo") ? "email"
          : message.includes("empresa") ? "company"
            : message.includes("notas") ? "notes"
              : null;

    if (field) {
      state.formErrors = { [field]: message };
      render();
    }

    showToast(message, "error");
  }

  async function saveContact(event) {
    event.preventDefault();
    if (state.saving) return;

    const raw = getFormData();
    state.formDraft = raw;
    state.formErrors = validateForm(raw);

    if (Object.keys(state.formErrors).length > 0) {
      render();
      return;
    }

    state.saving = true;
    render();

    try {
      const payload = normalizeForm(raw);
      if (state.formMode === "create") {
        await api.createContact(payload);
        showToast("Contacto creado correctamente");
      } else if (state.selectedContact) {
        state.selectedContact = await api.updateContact(state.selectedContact._id, payload);
        showToast("Contacto actualizado correctamente");
      }

      state.modal = null;
      state.formErrors = {};
      await loadContacts(state.currentSearch);
    } catch (error) {
      state.saving = false;
      applyApiError(error.message || "No se pudo guardar el contacto");
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
      showToast("Contacto eliminado correctamente");
      await loadContacts(state.currentSearch);
    } catch (error) {
      showToast(error.message || "No se pudo eliminar el contacto", "error");
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
      button.title = "Copiado";
      setTimeout(() => {
        button.classList.remove("is-copied");
        button.innerHTML = iconCopy();
        button.title = "Copiar";
      }, 2000);
    } catch {
      showToast("No se pudo copiar", "error");
    }
  }

  function iconClose(size) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
      </svg>
    `;
  }

  function iconPhone() {
    return `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M5.2 2H3a1 1 0 00-1 1c0 6.075 4.925 11 11 11a1 1 0 001-1v-2.2a1 1 0 00-.726-.962l-2.1-.6a1 1 0 00-1.046.302l-.748.898A8.008 8.008 0 015.36 6.62l.898-.748a1 1 0 00.303-1.046l-.6-2.1A1 1 0 005.2 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"></path>
      </svg>
    `;
  }

  function iconMail() {
    return `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"></rect>
        <path d="M1.5 5l6.5 4.5L14.5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;
  }

  function iconCopy() {
    return `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="4.5" y="4.5" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.3"></rect>
        <path d="M4.5 9.5H3a1.5 1.5 0 01-1.5-1.5V3A1.5 1.5 0 013 1.5h5A1.5 1.5 0 019.5 3v1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path>
      </svg>
    `;
  }

  function iconCheck() {
    return `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;
  }

  function iconCheckTiny() {
    return `
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M1.5 5.5l3 3 5-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;
  }

  function iconWarningTiny() {
    return `
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
        <path d="M5.5 2v4M5.5 8v.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path>
      </svg>
    `;
  }

  dom.newContactButton.addEventListener("click", () => openForm("create"));

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

  dom.content.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    if (action === "open-contact") openContact(actionTarget.dataset.id);
    if (action === "new-contact") openForm("create");
    if (action === "retry") loadContacts(state.currentSearch);
  });

  document.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    if (action === "close-drawer") closeDrawer();
    if (action === "edit-contact") openForm("edit");
    if (action === "confirm-delete") {
      state.modal = "delete";
      render();
    }
    if (action === "close-modal") closeModal();
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

    state.formDraft[field.name] = field.value;
    if (state.formErrors[field.name]) {
      delete state.formErrors[field.name];
      field.closest(".field").classList.remove("has-error");
      const errorNode = document.querySelector(`#${field.name}Error`);
      if (errorNode) errorNode.remove();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.modal) {
      closeModal();
    } else if (state.selectedContact) {
      closeDrawer();
    }
  });

  loadContacts("");
})();
