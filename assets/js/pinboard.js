// Configuration
const username = "kwon"; // Your Pinboard username
const tag = "post"; // Tag to filter by
const count = 10; // Number of bookmarks to display
const containerId = "linkroll"; // ID of the container element for links

// Fetch and display Pinboard bookmarks
async function fetchAndDisplayPinboardLinks() {
    const url = `https://feeds.pinboard.in/json/v1/u:${username}/t:${tag}/?count=${count}`;
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Element with ID '${containerId}' not found.`);
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network error: ${response.status}`);
        }

        const bookmarks = await response.json();
        bookmarks.forEach(bookmark => {
            const listItem = document.createElement("li");
            listItem.className = "pinboard_link";

            const link = document.createElement("a");
            link.href = bookmark.u;
            link.textContent = bookmark.d || "Untitled";
            link.target = "_blank"; // Open in a new tab
            listItem.appendChild(link);

            if (bookmark.n) {
                const description = document.createElement("span");
                description.className = "pinboard_desc";
                description.textContent = ` - ${bookmark.n}`;
                listItem.appendChild(description);
            }

            container.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching Pinboard links:", error);
        container.textContent = "Failed to load bookmarks.";
    }
}

// Initialize
fetchAndDisplayPinboardLinks();