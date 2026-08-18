(function () {
  const API_URL = "http://localhost:3000/api/contacts";

  async function request(path, options) {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        "Content-Type": "application/json"
      },
      ...options
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error((data && data.message) || "No se pudo completar la solicitud");
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
        body: JSON.stringify(contact)
      }).then((data) => data.contact);
    },

    updateContact(id, contact) {
      return request(`/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(contact)
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
    }
  };
})();
