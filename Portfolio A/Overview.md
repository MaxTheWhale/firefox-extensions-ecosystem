# Overview
## The Client
Our client is Mozilla, the non-profit organisation known for mainly for its
Firefox web browser. Firefox was originally released in 2004, and remains
one of the most popular web browsers to this day, thanks to continued
development and innovation. The domain we will be working with is Firefox's
_WebExtensions_ API, which is a cross-browser system for developing extensions.

## The Task
Currently, developers using the _WebExtensions_ API are able to save a limited
amount (5MB) of extension data to local storage. Our objective is to implement
new functionality into the API that allows developers to save their extension
data to a cloud storage provider (e.g. Google Drive, OneDrive, DropBox) rather
than to the user's local storage. This will give the benefit of a larger storage
area, as well as the posibillity of extension data being accessible from any
device, instead of being saved locally to one.

## Planned Solution
The exact form of the solution is yet to be determined, but there are two main
approaches we could take. Firstly, we could simply write an extension that
bridges the gap between the various cloud storage providers' APIs and allow
other extensions to talk to that. Otherwise, the functionality could be
implemented directly into Firefox's codebase, a solution that would be more
complicated but be more elegant to interface with for developers.

