// Fetch the RSS feed and parse it
fetch('https://letterboxd.com/kwon/rss/')
    .then(response => response.text())  // Get the feed data as text
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))  // Parse it into XML
    .then(data => {
        const items = data.querySelectorAll("item");  // Find all the <item> elements in the feed
        let html = "";  // Create an empty string for the HTML output

        // Loop over each <item> element and extract relevant info
        items.forEach(el => {
            const title = el.querySelector("title").textContent;
            const link = el.querySelector("link").textContent;
            const description = el.querySelector("description").textContent;
            const pubDate = el.querySelector("pubDate").textContent;

            // Append this data to the html string, creating HTML structure
            html += `
                <div class="rss-item">
                    <h3><a href="${link}" target="_blank">${title}</a></h3>
                    <p>${description}</p>
                    <small>Published on: ${pubDate}</small>
                </div>
            `;
        });

        // Insert the HTML content into the desired location in the DOM
        document.querySelector(".movies").innerHTML = html;
    })
    .catch(error => console.log('Error fetching the feed:', error));