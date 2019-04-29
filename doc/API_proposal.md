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
| `createRemoteStorage(provider, client_id)` | This function takes your client ID and chosen cloud provider and creates an instance of a remote storage class that can then be used. Valid values for provider are "Google", "OneDrive" and "Mock" (case-insensitive) | A class instance for the selected cloud provider and client ID.

To obtain a client_id you will need to visit either [Google Developers Console](https://console.developers.google.com/) or the [Microsoft Application Registration Portal](https://apps.dev.microsoft.com/#/appList) and follow the provided instructions to register your application. The mock provider does not require a client ID, it is just a simple local implementation of a storage provider designed to help during development, and does not persist its contents between sessions.

## File Access
In order to simplify the use of the API, files are saved and retrieved based
only on their file name, with an optional parent folder ID that can be supplied to operate within a folder. This has some caveats; Files must have unique names, and you can't use paths to work with folders. If a file with the
same name is uploaded, it will overwrite the old file. If a folder with the same name is attempted to be created, the operation will fail.<br>
Currently, only files created by an extension can be accessed by that extension.
This is enforced either by permissions that the cloud provider supports, or
otherwise by the library itself. The idea behind this is that the cloud storage
acts as an extended storage space for the extension, bypassing the limits of the
existing [`storage.local`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local) and [`storage.sync`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync)
APIs. Therefore extensions should not be able to interfere with other
extensions' files or the users own files.

All the files and folders that an extension creates are stored in a folder named using the extensions' ID, inside a parent folder called storage.remote. This means that extensions shouldn't be able to interfere with either other files on the cloud as well as other extensions' files.

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

## Objects
The API defines two helper classes for passing file and folder information.

| `StoreFile` | Property description |
|-------------|------------|
| `StoreFile.id` | File ID |
| `StoreFile.name` | File name |
| `StoreFile.mimetype` | File MIME type |
| `StoreFile.store` | Cloud storage that the file came from (either 'google', 'onedrive' or 'mock') |

<br>

| `Folder` | Property description |
|-------------|------------|
| `Folder.id` | Folder ID (useful for supplying `parentID` arguments) |
| `Folder.name` | Folder name |
| `Folder.store` | Cloud storage that the folder came from (either 'google', 'onedrive' or 'mock') |

## Methods
The API provides classes for each cloud storage provider that are used as the
interface. All of the methods are asynchronous, meaning they return a Promise. Therefore it is recommended to call the methods with the `await` keyword from within an `async` function, to make sure the method completes before continuing. The following methods are available:

| Method    | Description | Returns |
|-----------|-------------|---------|
| `getItems(folderFlag, parentID)` | This method will list all the files in a location if folderFlag is false, otherwise it will list all the folders. If the request fails, an error will be thrown with the HTTP status code.| A filename indexed list of Folder/StoreFile objects described above
| `getInfo(fileName, parentID)` | When given a file name, it will retrieve the metadata for that file. If the file doesn't exist, it will throw an error. If the fileName is omitted, the metadata for all files in the folder will be retrieved. | Metadata object as described above
| `uploadFile(file, fileName, parentID)` | When given a file (as a Blob/File object) and a file name, it will attempt to upload the file to the cloud storage. If the file already exists, it will be overwritten. If the upload fails, an error will be thrown with the HTTP status code. | HTTP status code
| `downloadFile(fileName, parentID)` | When given a file name, it will attempt to download the file from the cloud storage. If successful, it will return the file. If the download fails, an error will be thrown with the HTTP status code. | Blob object containing the file
| `deleteFile(fileName, parentID)` | When given a file name, it will attempt to delete the file from the cloud storage. If the file doesn't exist, it will throw an error. If the delete fails for any other reason, an error will be thrown with the HTTP status code. | HTTP status code
| `createFolder(name, parentID)` | It will attempt to create a folder with the given name. If the folder already exists, it will throw an error. If the folder creation fails for any other reason, an error will be thrown with the HTTP status code. | HTTP status code

Note that all the methods have an optional `parentID` parameter. This can be supplied with a folder ID (obtained using `getItems(true)`) to allow the operation to take place within a specific folder. If the argument is omitted, the operation will take place in the extension's root folder.

## Limitations
- Google Drive requires the permission `*://www.googleapis.com/*` to be given in the manifest, or else authentication will fail due to CORS errors.
- OneDrive currently only supports uploads up to 60MB. This could be bypassed using multi-part uploads, but this is not currently implemented.
- OneDrive authentication currently needs to be performed every time the extension runs, as the session is not remembered due to some unknown issue.
- OneDrive does not support the permissions to only allow the extension to access files it creates. This could create the potential risk to modify the users other files on the cloud, although the library has been designed in a way that extensions' data is kept isolated.


