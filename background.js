chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchNews") {
        const rssUrl = request.url;
        
        if (!rssUrl) {
            sendResponse({ success: false, error: "URLが指定されていません。" });
            return false; // No need to keep the channel open
        }

        fetch(rssUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`ネットワークエラー: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                sendResponse({ success: true, data: text });
            })
            .catch(error => {
                console.error('RSSフィードの取得に失敗しました:', error);
                sendResponse({ success: false, error: error.message });
            });
        
        return true; // Keep the message channel open for the asynchronous response
    }
});
