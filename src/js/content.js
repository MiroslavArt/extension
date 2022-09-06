window.onload = () => {
    chrome.tabs.executeScript(null, {
        file: "src/js/extension.js"
    });
};