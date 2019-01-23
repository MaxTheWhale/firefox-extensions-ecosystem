# firefox-extensions-ecosystem
We will be creating a Firefox extension middleware API for cloud storage providers.
This new API will help cloud storage providers to connect Firefox to a cloud storage system. It would also help developers lift the cap of data that can be stored by `storage.local` and allow users to connect Firefox to systems like OneDrive, Dropbox, Google Drive, etc.

## Testing
There is an extension in the test folder. It can be loaded in Firefox, and when 
it is clicked it will open a page with a 'Test' button for each cloud provider.
Clicking this will prompt authentication and then run a suite of tests.
