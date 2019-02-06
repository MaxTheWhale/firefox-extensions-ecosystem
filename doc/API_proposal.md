# Remote Storage API Proposal
**WARNING**: This API is a work in progress, anything mentioned here could be subject
to change.
## Overview
This API is designed to be used by browser extensions to access cloud storage
services (such as Google Drive and OneDrive). One of the main design goals is to
abstract away the platform dependent implementation, so the extension developer
can use the same code to interact with different cloud storages. This also means
that if support for a new cloud storage provider is added, it can work on
existing extensions with little to no changes.

## Interface
The cloud storages are interfaced with via a series of common methods implemented in a class for each cloud provider. To use these methods, a class instance must be created via the helper method below:
| Method | Description | Returns |
|--------|-----------|---------|
| `createRemoteStorage(provider, client_id)` | This function takes your client ID and chosen cloud provider and creates an instance of a remote storage class that can then be used. Valid values for provider are "Google" and "OneDrive" (case-insensitive) | A class instance for the selected cloud provider and client ID.

To obtain a client_id you will need to visit either [Google Developers Console](https://console.developers.google.com/) or the [Microsoft Application Registration Portal](https://apps.dev.microsoft.com/#/appList) and follow the provided instructions to register your application.

## File Access
In order to simplify the use of the API, files are saved and retrieved based
only on their file name. This has some obvious caveats; any kind of folder
hierarchy is unsupported, and files must have unique names. If a file with the
same name is uploaded, it will overwrite the old file.<br>
Currently, only files created by an extension can be accessed by that extension.
This is enforced either by permissions that the cloud provider supports, or
otherwise by the library itself. The idea behind this is that the cloud storage
acts as an extended storage space for the extension, bypassing the limits of the
existing [`storage.local`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local) and [`storage.sync`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync)
APIs. Therefore extensions should not be able to interfere with other
extensions' files or the users own files.

## Metadata
When retrieving metadata for files, it will be returned as an object with
key-value pairs for each field. Only the following fields are guaranteed to be
present across all storage providers:

| Field    | Description |
|-----------|-------------|
| `name` | The name of the file, including its extension
| `mimeType` | The MIME type of the file.

When retrieving metadata for all files, the object returned will have key-value
pairs for each file, where the key is the file name and the value is the
previously described metadata object.

### Storage-specific metadata
Note that other properties will be returned, but they are not supported by all
providers, so relying on them would prevent easy provider switching. Refer to the [Google Drive](https://developers.google.com/drive/api/v3/reference/files) and [OneDrive](https://docs.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0) metadata documentation for details.

## Methods
The API provides classes for each cloud storage provider that are used as the
interface. The following methods are available:

| Method    | Description | Returns |
|-----------|-------------|---------|
| `getInfo(fileName)` | When given a file name, it will retrieve the metadata for that file. If the file doesn't exist, it will throw an error. If the argument is omitted, the metadata for all files in the cloud store will be retrieved. | Metadata object as described above
| `uploadFile(file, fileName)` | When given a file (as a Blob/File object) and a file name, it will attempt to upload the file to the cloud storage. If the file already exists, it will be overwritten. If the upload fails, an error will be thrown with the HTTP status code. | HTTP status code
| `downloadFile(fileName)` | When given a file name, it will attempt to download the file from the cloud storage. If successful, it will return the file. If the download fails, an error will be thrown with the HTTP status code. | Blob object containing the file
| `deleteFile(fileName)` | When given a file name, it will attempt to delete the file from the cloud storage. If the file doesn't exist, it will throw an error. If the delete fails for any other reason, an error will be thrown with the HTTP status code. | HTTP status code

