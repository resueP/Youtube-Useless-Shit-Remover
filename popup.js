// Checkbox IDs shared with popup.html and the content script.
const toggles = [
    "uiCleanup",
    "removeMoreFromYouTube",
    "removeExplore",
    "removeMentionedPeople",
    "removeMusicShelf",
    "removeFooter",
    "removeShortsFromFeed",
    "removeShortsShelf",
    "removeStructuredDescription",
    "removeTeaserCarousel",
    "removeTranscriptSection",
    "removeAISummary",
    "removeRichMetadata",
    "removeYouTubePlayables"
];

// Notify the content script after a saved setting changes.
function sendSettingsToContent(settings) {
    chrome.runtime.sendMessage({ type: "updateSettings", settings });
}

// Initialize popup controls after the document is parsed.
document.addEventListener("DOMContentLoaded", () => {
    const selectAllBtn = document.getElementById("selectAll");
    const deselectAllBtn = document.getElementById("deselectAll");

    chrome.storage.sync.get(["settings"], data => {
        const settings = data.settings || {};

        // Load saved values and attach handlers to each cleanup option.
        toggles.forEach(key => {
            const checkbox = document.getElementById(key);
            if (!checkbox) return;

            checkbox.checked = settings[key] ?? false;

            checkbox.addEventListener("change", () => {
                settings[key] = checkbox.checked;
                chrome.storage.sync.set({ settings }, () => {
                    sendSettingsToContent(settings);
                });
            });

            // Clicking the row toggles the option; labels and checkboxes keep native behavior.
            const row = checkbox.closest(".switch-row");
            if (row) {
                row.addEventListener("click", event => {
                    try {
                        if (event.target === checkbox || event.target.closest("label")) return;

                        checkbox.checked = !checkbox.checked;
                        settings[key] = checkbox.checked;
                        chrome.storage.sync.set({ settings }, () => {
                            sendSettingsToContent(settings);
                        });
                    } catch (error) {
                        console.error("Row click handler error for", key, error);
                    }
                });
            }
        });

        // Bulk controls update the visible checkboxes and saved settings.
        if (selectAllBtn) {
            selectAllBtn.addEventListener("click", () => {
                toggles.forEach(key => {
                    const checkbox = document.getElementById(key);
                    if (!checkbox) return;

                    checkbox.checked = true;
                    settings[key] = true;
                });

                chrome.storage.sync.set({ settings }, () => {
                    sendSettingsToContent(settings);
                });
            });
        }

        if (deselectAllBtn) {
            deselectAllBtn.addEventListener("click", () => {
                toggles.forEach(key => {
                    const checkbox = document.getElementById(key);
                    if (!checkbox) return;

                    checkbox.checked = false;
                    settings[key] = false;
                });

                chrome.storage.sync.set({ settings }, () => {
                    sendSettingsToContent(settings);
                });
            });
        }
    });
});
