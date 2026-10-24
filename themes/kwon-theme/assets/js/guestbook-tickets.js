// Guestbook tickets: click ticket to embiggen, navigate with arrows/swipes.
// URL is clickable if present in both grid and enlarged view.

(() => {
  const tickets = [...document.querySelectorAll(".ticket")];
  const viewer = document.getElementById("ticket-viewer");
  if (!tickets.length || !viewer) return;

  const img = document.getElementById("ticket-viewer-img");
  const url = document.getElementById("ticket-viewer-url");
  const closeButton = viewer.querySelector("[data-close]");
  let current = 0;

  const show = (i) => {
    current = (i + tickets.length) % tickets.length;
    const t = tickets[current];
    img.src = t.dataset.full;
    img.alt = t.querySelector("img").alt;

    // Hiding the link while it has focus would drop focus out of the viewer, so move it to Close first
    if (!t.dataset.url && document.activeElement === url) closeButton.focus();
    url.hidden = !t.dataset.url;
    if (t.dataset.url) {
      url.href = t.dataset.url;
      url.style.cssText = t.dataset.linkBox;
      url.setAttribute("aria-label", t.nextElementSibling.getAttribute("aria-label"));
    }
  };

  tickets.forEach((t, i) => t.addEventListener("click", () => { show(i); viewer.showModal(); }));
  viewer.querySelectorAll("[data-step]").forEach((b) =>
    b.addEventListener("click", () => show(current + Number(b.dataset.step))));
  closeButton.addEventListener("click", () => viewer.close());

  // Click outside the ticket (on the backdrop) to close
  viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });

  // navigate w/arrow keys. Listens on the whole page (while the viewer is open), so the keys
  // keep working wherever focus ends up
  document.addEventListener("keydown", (e) => {
    if (!viewer.open) return;
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  // Swipe to navigate on mobile
  let startX = null;
  viewer.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
