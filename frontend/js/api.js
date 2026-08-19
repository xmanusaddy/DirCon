(function () {
  const API_BASE_URL = "http://localhost:3000";
  const API_URL = `${API_BASE_URL}/api/contacts`;

  async function request(path, options) {
    const headers = options.body instanceof FormData
      ? options.headers || {}
      : {
          "Content-Type": "application/json",
          ...(options.headers || {})
        };

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error((data && data.message) || "No se pudo completar la solicitud");
    }

    return data;
  }

  function cleanContact(contact) {
    return {
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      company: contact.company,
      notes: contact.notes,
      extraLinks: contact.extraLinks || []
    };
  }

  function contactBody(contact) {
    if (!contact.photoFile && !contact.removePhoto) {
      return JSON.stringify(cleanContact(contact));
    }

    const data = new FormData();
    const clean = cleanContact(contact);

    Object.entries(clean).forEach(([key, value]) => {
      data.append(key, key === "extraLinks" ? JSON.stringify(value || []) : value || "");
    });

    if (contact.photoFile) {
      data.append("photo", contact.photoFile);
    }

    if (contact.removePhoto) {
      data.append("removePhoto", "true");
    }

    return data;
  }

  window.DirConAPI = {
    getContacts() {
      return request("", { method: "GET" });
    },

    getContactById(id) {
      return request(`/${encodeURIComponent(id)}`, { method: "GET" });
    },

    createContact(contact) {
      return request("", {
        method: "POST",
        body: contactBody(contact)
      }).then((data) => data.contact);
    },

    updateContact(id, contact) {
      return request(`/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: contactBody(contact)
      }).then((data) => data.contact);
    },

    deleteContact(id) {
      return request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
    },

    searchContacts(search) {
      const query = search.trim();
      if (!query) {
        return this.getContacts();
      }

      return request(`?search=${encodeURIComponent(query)}`, { method: "GET" });
    },

    getAssetUrl(path) {
      if (!path) return "";
      if (/^https?:\/\//i.test(path)) return path;

      return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    }
  };
})();
