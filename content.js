// ---------------- DOM HELPER ----------------
// Remove every match, or only matches accepted by the optional predicate.
function removeMatching(selector, checkFn = null) {
    document.querySelectorAll(selector).forEach(el => {
        if (!checkFn || checkFn(el)) el.remove();
    });
}

// --------------- PAGE CLEANUP RULES ----------------
// Apply the selected YouTube interface and description cleanup options.
function runCleaner(settings) {
    // Home feed and search header.
    if (settings.uiCleanup) {
        removeMatching('iron-selector#chips');

        const setStyles = (el, styles) => {
            for (const [prop, value] of Object.entries(styles)) {
                el.style.setProperty(prop, value, "important");
            }
        };

        const renderer = document.querySelector("ytd-feed-filter-chip-bar-renderer");
        if (renderer) {
            setStyles(renderer, {
                "height": "1px",
                "min-height": "1px",
                "max-height": "1px",
                "overflow": "hidden",
                "padding": "0",
                "margin": "0"
            });
        }

        const fg = document.querySelector("#frosted-glass.with-chipbar.ytd-app");
        if (fg) {
            setStyles(fg, {
                "height": "1px",
                "min-height": "1px",
                "max-height": "1px",
                "overflow": "hidden",
                "padding": "0",
                "margin": "0"
            });
        }

        removeMatching(".ytSearchboxComponentSearchButtonDark", el => {
            el.style.setProperty("background-color", "hsl(0, 0%, 18.82%)", "important");
            return false;
        });

        removeMatching("#voice-search-button button", el => {
            el.style.setProperty("background-color", "hsl(0, 0%, 18.82%)", "important");
            return false;
        });
    }

    // Navigation sidebar.
    if (settings.removeMoreFromYouTube) {
        removeMatching("ytd-guide-section-renderer", el => {
            const t = el.querySelector("#guide-section-title");
            return t && ["więcej z youtube", "more from youtube"]
                .includes(t.textContent.trim().toLowerCase());
        });
    }

    if (settings.removeExplore) {
        removeMatching("ytd-guide-section-renderer", el => {
            const t = el.querySelector("#guide-section-title");
            return t && ["odkrywaj", "explore"]
                .includes(t.textContent.trim().toLowerCase());
        });
    }

    // Video page sections and metadata.
    if (settings.removeMentionedPeople) {
        removeMatching(".videoAttributesSectionViewModelHost", el => {
            const t = el.querySelector(".videoAttributesSectionViewModelTitle");
            if (!t) return false;
            const txt = t.textContent.trim().toLowerCase();
            return [
                "wspomniane osoby",
                "mentioned people",
                "featured people",
                "people in this video"
            ].includes(txt);
        });
    }

    if (settings.removeMusicShelf) {
        removeMatching(
            "ytd-rich-shelf-renderer, ytd-guide-entry-renderer, ytd-guide-section-renderer",
            el => el.innerText.trim().toLowerCase().includes("muzyka") ||
                  el.innerText.trim().toLowerCase().includes("music")
        );

        removeMatching("ytd-horizontal-card-list-renderer", el => {
            const title = el.querySelector("#title-text #title, #header yt-formatted-string#title");
            return title && (
                title.textContent.trim().toLowerCase().includes("muzyka") ||
                title.textContent.trim().toLowerCase().includes("music")
            );
        });
    }

    if (settings.removeFooter) {
        removeMatching("ytd-guide-renderer #footer");
    }

    if (settings.removeShortsFromFeed) {
        removeMatching(
            'ytd-browse ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]), ytd-browse ytd-reel-shelf-renderer, ytd-browse ytd-rich-item-renderer:has(a[href^="/shorts/"])'
        );
    }

    if (settings.removeShortsShelf) {
        removeMatching("ytd-reel-shelf-renderer", el => {
            const title = el.querySelector("#title, #title-text, h2");
            return title && ["shorts", "zremiksowano", "remix", "remixed"]
                .some(str => title.textContent.toLowerCase().includes(str));
        });
    }

    if (settings.removeStructuredDescription) {
        removeMatching("ytd-structured-description-content-renderer#structured-description");
    }

    if (settings.removeTeaserCarousel) {
        removeMatching("div#teaser-carousel");
    }

    if (settings.removeTranscriptSection) {
        removeMatching("ytd-video-description-transcript-section-renderer");
    }

    if (settings.removeAISummary) {
        removeMatching("ytd-expandable-metadata-renderer #header");
    }

    if (settings.removeRichMetadata) {
        removeMatching("ytd-metadata-row-container-renderer");
    }

    if (settings.removeYouTubePlayables) {
        removeMatching(
            'ytd-rich-section-renderer:has(ytd-rich-item-renderer[is-mini-game-card-shelf], ytd-mini-game-card-view-model, mini-game-card-view-model, a[href^="/playables"]), ytd-rich-item-renderer[is-mini-game-card-shelf], ytd-rich-item-renderer:has(ytd-mini-game-card-view-model, mini-game-card-view-model), ytd-guide-entry-renderer:has(a[href^="/playables"])'
        );
    }
}

// ----------------- INITIAL LOAD AND OBSERVER -----------------
// Reapply saved settings as YouTube adds or replaces page elements.
function loadAndRun() {
  chrome.storage.sync.get(["settings"], data =>
    runCleaner(data.settings || {})
  );
}

loadAndRun();

const obs = new MutationObserver(loadAndRun);
obs.observe(document.body, { childList: true, subtree: true });

// ---------------- RUNTIME MESSAGE HANDLING ----------------
// Accept settings updates from the popup.
chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === "updateSettings") {
        runCleaner(msg.settings);
    }
});
