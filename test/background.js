function openMyPage() {
    browser.tabs.create({
        "url": "/test_page_integration.html"
    });
}
browser.browserAction.onClicked.addListener(openMyPage);