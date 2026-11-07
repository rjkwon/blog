// Displays guestbook tickets w/embiggen on click, clickable url, and navigation.

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

  viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });

  document.addEventListener("keydown", (e) => {
    if (!viewer.open) return;
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  let startX = null;
  viewer.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();
