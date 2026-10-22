// Guestbook tickets: click ticket to embiggen, navigate with arrows/swipes.
// URL is clickable if present in both grid and enlarged view.

(() => {
  const tickets = [...document.querySelectorAll(".ticket")];
  const viewer = document.getElementById("ticket-viewer");
  if (!tickets.length || !viewer) return;

  const img = document.getElementById("ticket-viewer-img");
  const url = document.getElementById("ticket-viewer-url");
  let current = 0;

  const show = (i) => {
    current = (i + tickets.length) % tickets.length;
    const t = tickets[current];
    img.src = t.dataset.full;
    img.alt = t.querySelector("img").alt;

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
  viewer.querySelector("[data-close]").addEventListener("click", () => viewer.close());

  // Click outside the ticket (on the backdrop) to close
  viewer.addEventListener("click", (e) => { if (e.target === viewer) viewer.close(); });

  // navigate w/arrow keys
  viewer.addEventListener("keydown", (e) => {
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
