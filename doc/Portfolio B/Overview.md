# Overview
## Client and Domain
Our client is Mozilla, the non-profit organisation known for mainly for its
Firefox web browser. Firefox was originally released in 2004, and remains one of
the most popular web browsers to this day, thanks to continued development and
innovation. We are working with Rob Wu and Luca Greco of Firefox's
_WebExtensions_ team. _WebExtensions_ is a collection JavaScript APIs for
developing browser extensions, that allows them to interface easily with the
different parts of the browser. Like Firefox itself, these APIs are entirely
open source, so any other browser is free to implement them, and they are
largely compatible with the extension infrastructure of other popular browsers
such as Chrome and Edge. The specific domain that we will be working with is the
storage API, which enables extensions to save persistent data.

## The Task
Currently, developers using the _WebExtensions_' storage API are able to save a
limited amount (5MB) of extension data to local storage. Our objective is to
implement new functionality into the API that allows developers to save their
extension data to a cloud storage provider (e.g. Google Drive, OneDrive,
DropBox) rather than to the user's local storage. This will give the benefit of
a larger storage area, as well as the posibillity of extension data being
accessible from any device, instead of being saved locally to one. Specific
implementation details have not been given to us, leaving it to us to figure out
the best way to realise this functionality.

## Planned Solution
The exact form of the solution is yet to be determined, but there are two main
approaches we could take. Firstly, we could simply write a JavaScript library
that implements the functionality, which could then be included in extensions.
Otherwise, the functionality could be implemented directly into Firefox's
codebase, a solution that would be more complicated but be more elegant to
interface with for developers. Our initial plan is to implement the
functionality as a library, as this will be easier to work with and debug. Then
after the cloud storage solution is working in this form, we can look at the
feasibility of implementing it directly into Firefox itself.

### Links
The GitHub for the project can be found here: https://github.com/MaxTheWhale/firefox-extensions-ecosystem<br>
The user documentation is contained in the [README](https://github.com/MaxTheWhale/firefox-extensions-ecosystem/blob/master/README.md) and [API Proposal](https://github.com/MaxTheWhale/firefox-extensions-ecosystem/blob/master/doc/API_proposal.md).