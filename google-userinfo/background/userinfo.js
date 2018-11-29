/**
Fetch the user's info, passing in the access token in the Authorization
HTTP request header.
*/

/* exported getUserInfo */

function getUserInfo(accessToken) {
    const requestURL = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json";
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', 'Bearer ' + accessToken);
    const driveRequest = new Request(requestURL, {
      method: "GET",
      headers: requestHeaders
    });
  
    return fetch(driveRequest).then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw response.status;
      }
    });
  
  }

  // I'm just calling this from the debug console at the moment
  // getAccessToken().then(token => {uploadFile(token, "This is a test file.").then(data => {console.log(data);});})
  function uploadFile(accessToken, file) {
    const requestURL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=media";
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', 'Bearer ' + accessToken);
    requestHeaders.append('Content-Type', 'text/plain');
    requestHeaders.append('Content-Length', file.length);
    const driveRequest = new Request(requestURL, {
      method: "POST",
      body: file,
      headers: requestHeaders
    });
  
    return fetch(driveRequest).then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw response.status;
      }
    });
  
  }