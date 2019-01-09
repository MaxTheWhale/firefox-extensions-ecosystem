//Skeleton for files in background from: https://github.com/mdn/webextensions-examples/tree/master/google-userinfo
//Original modification for use with drive apis from: https://github.com/MaxTheWhale

/*global getAccessToken*/

function notifyUser(user) {
    browser.notifications.create({
      "type": "basic",
      "title": "Google info",
      "message": `Hi ${user.name}`
    });}
  
  function logError(error) {
    console.error(`Error: ${error}`);
  }
  
  /**
  When the button's clicked:
  - get an access token using the identity API
  - use it to get the user's info
  - show a notification containing some of it
  */
  browser.browserAction.onClicked.addListener(() => {
    getAccessToken()
      .then((token) => {uploadFile(token, "This is a test file.").then(console.log);})
      .catch(logError);
  });