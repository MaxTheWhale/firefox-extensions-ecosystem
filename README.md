# Remote storage library for browser extensions
This project implements a JavaScript library that allows developers to interface their browser extensions to cloud storage services such as Google Drive and OneDrive. The library is designed so that the interface is exactly the same no matter what cloud storage is being used, making supporting multiple cloud storage providers in an extension very simple.

The API used by the library is described in detail here:
[API Proposal](/doc/API_proposal.md)

## Usage
For each cloud storage provider that you are planning to support, you will need to register your extension as an application in order to obtain a client ID. Details are given below:
### Obtaining your redirect URL
In order to register your extension with cloud storages, you will need to get the redirect URL for your extension. The [identity](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity#Getting_the_redirect_URL) MDN page describes how to do this.
### Registering with cloud providers
#### Google Drive
- Visit https://console.developers.google.com/apis/credentials
- Click "Create credentials", and select "OAuth client ID".
- Select "Web application", and give it a name. The name is shown to the user to help them understand whether to authorize the add-on.
- Paste the redirect URL into the "Authorized redirect URIs" box.
Click "Create".
- You'll see a popup containing a client ID and a secret. Copy the client ID (the secret is not needed), and use it when calling `createRemoteStorage`.
#### OneDrive
- Visit https://apps.dev.microsoft.com/portal/register-app
- Choose a name for the application. The name is shown to the user to help them understand whether to authorize the add-on. Click "Create".
- Click "Add Platform", and choose Web.
- Paste your redirect URL into the Redirect URLs box.
- Save the changes.
- The Application Id will be shown near the top of the page. Use this ID when calling `createRemoteStorage`.

## Manifest
The library requires the `identity` permission to be given in `manifest.json`. In addition, Google Drive requires the permission `*://www.googleapis.com/*` to be given to prevent CORS errors.

## Testing
There is an extension in the test folder. It can be loaded in Firefox and will run through a series of tests for each cloud provider when the extension's icon is clicked.

Run `npm test` in the root of the package to run a suite of unit tests.
