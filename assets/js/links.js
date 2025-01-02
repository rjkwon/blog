document.addEventListener("DOMContentLoaded", function () {
  const feedUrl = "https://script.google.com/macros/s/AKfycbzjyQRiPiz2ejXyBD-68th_q-Mqe-oVQ4925VHfKsCCv7ROimh3fmNVbPujCF0F9nn0/exec?key=x5DA7Gxf8FnCFnDe";

  fetch(feedUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const container = document.getElementById("linkroll");

      container.innerHTML = "";

      const sortedLinks = data.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

      const latestLinks = sortedLinks.slice(0, 9);

      latestLinks.forEach(item => {
        const linkElement = document.createElement("div");
        linkElement.innerHTML = `
          <li class="pinboard_link">
            <a href="${item.url}">${item.title}</a>
            <span class="pinboard_desc">${item.description}</span>
          </li>
        `;
        container.appendChild(linkElement);
      });
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      document.getElementById("linkroll").innerHTML = "<p>Error loading links.</p>";
    });
});