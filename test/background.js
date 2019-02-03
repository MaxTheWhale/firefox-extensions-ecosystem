function openMyPage() {
  browser.tabs.create({
    "url": "/test_page.html"
  });
}
browser.browserAction.onClicked.addListener(openMyPage);