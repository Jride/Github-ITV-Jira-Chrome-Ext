// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {

    sendResponse();
  }
);

chrome.runtime.onConnect.addListener(function(port) {

  port.onMessage.addListener(function(request) {
    
    if (request.type == "request") {

      fetch("https://github-jira-itv.herokuapp.com/" + request.url, {
        method: request.method,
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request.data)
      })
      .then(function(response) {
        return response.text()
      })
      .then(function(text) {
        console.log(text)

        try {
          var jsonResponse = JSON.parse(text);
          port.postMessage({response: jsonResponse, error: null})
        } catch (e) {

          if (text.indexOf("Unauthorized") !== -1) {
            var authError = { 'authError': 'Unauthorized 401' }
            port.postMessage({response: null, error: authError})
          } else {
            port.postMessage({response: null, error: error})
          }

        }
        
      })
      .catch(function(error) {
        port.postMessage({response: null, error: error})
      });

    }

  });

});

chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    // read changeInfo data and do something with it
    // like send the new url to contentscripts.js
    if (changeInfo.url) {
      chrome.tabs.sendMessage( tabId, {
        type: 'UPDATE_URL',
        url: changeInfo.url
      })
    }
  }
);
