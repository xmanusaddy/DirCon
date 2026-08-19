(function () {
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

  function iconLink() {
    return `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M6.6 9.4a3 3 0 004.2 0l1.8-1.8a3 3 0 00-4.2-4.2l-.7.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M9.4 6.6a3 3 0 00-4.2 0L3.4 8.4a3 3 0 004.2 4.2l.7-.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `;
  }

  function iconPlusSmall() {
    return `
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
      </svg>
    `;
  }

  function iconCamera() {
    return `
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <path d="M5.2 3.2l.7-1.1h3.2l.7 1.1h2.1A1.6 1.6 0 0113.5 4.8v6.1a1.6 1.6 0 01-1.6 1.6H3.1a1.6 1.6 0 01-1.6-1.6V4.8a1.6 1.6 0 011.6-1.6h2.1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"></path>
        <circle cx="7.5" cy="8" r="2.4" stroke="currentColor" stroke-width="1.3"></circle>
      </svg>
    `;
  }

  function iconTrash() {
    return `
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
        <path d="M2.3 4h10.4M6 1.9h3M5.2 4v7.4M7.5 4v7.4M9.8 4v7.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path>
        <path d="M3.6 4l.5 8.2a1.3 1.3 0 001.3 1.2h4.2a1.3 1.3 0 001.3-1.2l.5-8.2" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"></path>
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

  window.DirConIcons = {
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
  };
})();
