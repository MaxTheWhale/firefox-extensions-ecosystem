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

function deleteFile(accessToken) {
  //Function list files, grab filename used by note, gets its id
    deleteRequest(accessToken, id).then(console.log).catch(console.log);
}

const deleteRequest = (accessToken, id) => {
  return new Promise(function (resolve, reject) {
    const requestURL = `https://www.googleapis.com/drive/v3/files/${id}`;
    var requestHeaders = new Headers();
    requestHeaders.append('Authorization', 'Bearer ' + accessToken);
    var driveRequest = new Request(requestURL, {
      method: "DELETE",
      headers: requestHeaders
    });

    fetch(driveRequest).then((response) => {
      if (response.status === 200) {
        console.log("yuh");
        resolve("File Deleted")
      } else {
        console.log("nuh");
        reject(response.status);
      }
    });

  });
}

//Need a way to store file IDs and names used (could use list to get all files in drive to allow developers to select what properties they want)
function uploadFile(accessToken, file, name) {
  return getID(accessToken).then((id) => {
    initUpload(accessToken, file, name, id)
    .then((response) => {
      upload(accessToken, file, response.headers.get('location'))
    })
  })
    .catch(console.log);
}

const getID = (accessToken) => {
  return new Promise(function (resolve, reject) {
    const requestURL = "https://www.googleapis.com/drive/v3/files/generateIds?count=1";
    var requestHeaders = new Headers();
    requestHeaders.append('Authorization', 'Bearer ' + accessToken);
    var driveRequest = new Request(requestURL, {
      method: "GET",
      headers: requestHeaders
    });

    fetch(driveRequest).then((response) => {
      if (response.status === 200) {
        console.log("yuh");
        response.json().then((data) => {
          resolve(data.ids[0]);
        });
      } else {
        console.log("nuh");
        reject(response.status);
      }
    });

  });
}

const initUpload = (accessToken, file, name, id) => {
  return new Promise(function (resolve, reject) {
    var n;
    var request = `{
    "id": "${id}",
    "name": "${name}"
  }`;
    n = request.length;
    const requestURL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable";
    var requestHeaders = new Headers();
    requestHeaders.append('Authorization', 'Bearer ' + accessToken);
    requestHeaders.append('Content-Type', 'application/json; charset=UTF-8');
    requestHeaders.append('Content-Length', n);
    requestHeaders.append('X-Upload-Content-Type', 'text/plain');
    requestHeaders.append('X-Upload-Content-Length', file.length);
    //Info on how to structure a resumable request: https://developers.google.com/drive/api/v3/resumable-upload
    //Helpful: http://chxo.com/be2/20050724_93bf.html (not so much now)
    var driveRequest = new Request(requestURL, {
      method: "POST",
      headers: requestHeaders,
      body: request
    });

    fetch(driveRequest).then((response) => {
      if (response.status === 200) {
        console.log("yuh");
        resolve(response);
      } else {
        console.log("nuh");
        reject(response.status);
      }
    });

  });
}

function upload(accessToken, file, url) {
  var requestHeaders = new Headers();
  requestHeaders.append('Authorization', 'Bearer ' + accessToken);
  requestHeaders.append('Content-Type', 'text/plain');
  requestHeaders.append('Content-Length', file.length);
  var driveRequest = new Request(url, {
    method: "PUT",
    headers: requestHeaders,
    body: file
  });

  return fetch(driveRequest).then((response) => {
    if (response.status === 200) {
      console.log("yuh");
      return response.json();
    } else {
      console.log("nuh");
      throw response.status;
    }
  });

}