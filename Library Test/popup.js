/*// Get the saved stats and render the data in the popup window.

// Number of hosts to show before expanding
const MAX_ITEMS = 5;

function sorter(array) {
  return Object.keys(array).sort((a, b) => {
    return array[a] <= array[b];
  });
}

// Add the list of hosts to the popup
function addHosts(hosts) {
  const hostElem = document.getElementById("hosts");
  while(hostElem.firstChild) {
    hostElem.removeChild(hostElem.firstChild);
  }
  let sortedHosts = sorter(hosts);

  for (let i=0; i < sortedHosts.length; i++) {
    if (i >= MAX_ITEMS) {
      const seeAllBtn = document.createElement("button");
      seeAllBtn.textContent = "See all items";
      seeAllBtn.onclick = function () {showAll(hosts);};
      hostElem.appendChild(seeAllBtn);
      break;
    }

    const listItem = document.createElement("li");
    listItem.textContent = `${sortedHosts[i]}: ${hosts[sortedHosts[i]]} visit(s)`
    hostElem.appendChild(listItem);
  }
}

// Expand the host list to show all the hosts
function showAll(hosts) {
  const hostElem = document.getElementById("hosts");
  hostElem.removeChild(hostElem.lastChild);
  let sortedHosts = sorter(hosts);
  for (let i=5; i < sortedHosts.length; i++) {
    const listItem = document.createElement("li");
    listItem.textContent = `${sortedHosts[i]}: ${hosts[sortedHosts[i]]} visit(s)`
    hostElem.appendChild(listItem);
  }
}

// Add the different navigation types to the popup
function addNavTypes(types) {
  const typeElem = document.getElementById("types");
  while(typeElem.firstChild) {
    typeElem.removeChild(typeElem.firstChild);
  }
  // I'm sure there's a nicer way to do this, will look into it at somepoint
  const linkItem = document.createElement("li");
  const typedItem = document.createElement("li");
  const generateItem = document.createElement("li");
  const refreshItem = document.createElement("li");
  if (types.link !== 0) linkItem.textContent = `Links clicked: ${types.link}`
  if (types.typed !== 0) typedItem.textContent = `Addresses typed: ${types.typed}`
  if (types.generated !== 0) generateItem.textContent = `Pages generated: ${types.generated}`
  if (types.reload !== 0) refreshItem.textContent = `Pages refreshed: ${types.reload}`
  typeElem.appendChild(linkItem);
  typeElem.appendChild(typedItem);
  typeElem.appendChild(generateItem);
  typeElem.appendChild(refreshItem);
}

// Add the HTTPS percentage to the popup
function addHTTPSPercentage(protocols) {
  let percentage = (protocols.https * 100) / (protocols.https + protocols.http);
  const protocolElem = document.getElementById("protocols");
  protocolElem.textContent = `${percentage.toFixed(1)}% of page requests sent over HTTPS`;
}

var gettingStoredStats = browser.storage.local.get();
gettingStoredStats.then(results => {
  if (results.type.length === 0 || results.host.length === 0 || results.protocol.length === 0) {
    return;
  }
  addHosts(results.host);
  addNavTypes(results.type);
  addHTTPSPercentage(results.protocol);
});*/

console.log(browser.identity.getRedirectURL());
const hostElem = document.getElementById("googleDrive");
const authBtn = document.createElement("button");
authBtn.textContent = "Authorise";
var remoteStore;
authBtn.onclick = async function() {
  let background = await browser.runtime.getBackgroundPage();
  let remoteStore = await background.createRemoteStorage("Google", "887401722713-n61d7cl8o92cjol2sid7q31t9gs28uqs.apps.googleusercontent.com");
  //let token = await remoteStore.getAccessToken();
  //console.log(token);
  await remoteStore.uploadFile("This is a test file", "test.txt");
  await remoteStore.uploadFile("This should have replaced it", "test.txt");
};
hostElem.appendChild(authBtn);
