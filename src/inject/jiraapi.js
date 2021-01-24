function getAuthToken() {
  setAuthTokenIfNeeded()
  return localStorage.jiraAuthToken
}

function setAuthTokenIfNeeded(authError = false) {
  // If the authentication token hasn't been set yet then
  // this will prompt the user for their username and password.
  // Then it will use base64 encoding to and store the results
  // in the browsers local storage
  if (localStorage.jiraAuthToken) { return }

  addAuthModal(authError)
  showAuthModal()

  $("button#jiraAuthBtn").click(function() {

    var email = $("#jiraEmail").val()
    var pwd = $("#jiraPwd").val()

    var emailPattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i

    if (email != "" && pwd !== "" && emailPattern.test(email)) {
      hideAuthModal()
      var encodedToken = btoa(email + ":" + pwd)
      localStorage.jiraAuthToken = encodedToken

      location.reload();
    } else {
      showErrMessageAuthModal()
    }

  })

}

function getProjectKey() {
  var browserUrl = window.location.href

  if (browserUrl.includes("itvplayer-ios")) { return "ipia" }
  if (browserUrl.includes("itvhub-tvos")) { return "tvos" }
  if (browserUrl.includes("itvplayer_android")) { return "ipaa" }

  return null
}

function fetchTicketFromPage() {
  return processBranchName($('span.commit-ref.css-truncate.user-select-contain.head-ref').find( "a > span.css-truncate-target" ).text().toLowerCase().trim())
}

function fetchTicketFromURL() {
  var browserUrlArr = window.location.href.split("...")
  // console.log(browserUrlArr[1])
  return processBranchName(browserUrlArr[1])
}

function processBranchName(fullBranchName) {
  // Fetches the name of the branch. This could break if GitHub updates its
  // layout or css class names

  // This also will only work if we use the branch naming strategy which
  // includes the Jira Ticket number.
  // Example Supported Formats:
  // eg. feature/IHIA-XXXX-my-example-feature
  // eg. feature/XXXX_my_new_feature
  // eg. IHIA-XXXX_my_new_feature
  // console.log(fullBranchName)
  var projectKey = getProjectKey()

  // Strips newlines and empty spaces
  fullBranchName = fullBranchName.toLowerCase()
  fullBranchName = fullBranchName.replace(/(\r\n|\n|\r)/gm, "");

  if (fullBranchName.includes("/")) {
    var fullBranchNameArr = fullBranchName.split("/")
    var branchName = fullBranchNameArr[fullBranchNameArr.length - 1];
  } else {
    var branchName = fullBranchName
  }

  // Replacing all dashes with underscores
  branchName = branchName.replace(/-/g, '_');

  // console.log(branchName)

  var branchNameArr = branchName.split("_")

  // console.log("Branch Name Array: ")
  // console.log(branchNameArr)

  if (branchName.includes(projectKey)) {
    var ticketNum = branchNameArr[1]
    if(isNaN(ticketNum)) {
      return null
    }
    
    var ticket = projectKey.toUpperCase() + "-" + ticketNum
    return ticket

  } else {
    // No project key in branch name
    var ticketNum = branchNameArr[0]
    if(isNaN(ticketNum)) {
      return null
    }

    var ticket = projectKey.toUpperCase() + "-" + ticketNum
    // console.log(ticket)
    return ticket
  }
}

function getTicketStatus(ticket, callback) {

  var authToken = getAuthToken()

  if (authToken == undefined || authToken == null) {
    return
  }

  var data = {
    "auth": authToken,
    "ticket": ticket
  }

  showSpinner()

  var port = chrome.runtime.connect({name: "getTicketStatus"});
  port.postMessage({
    type: "request", 
    method: "post",
    url: "ticketinfo",
    data: data
  });
  port.onMessage.addListener(function(response) {

    if (response == null || response == undefined) {
      console.error("response was null or undefined")
      return
    }

    // console.log(response)

    var error = response.error
    var response = response.response

    hideSpinner()

    if (error != null) {
      handleError(error)
      return
    }

    if ("errorMessages" in response) {
      handleJiraError(response.errorMessages)
      return
    }

    if (!("message" in response)) {
      console.error("Did not get the correct response")
      return
    }

    if (response.status) {
      if (response.status == 200) {
        callback(response.body.name)
      } else {
        displayErrorMessage("Unable to get the ticket info: " + response.message)
      }
    } else {
      displayErrorMessage("Unable to get the ticket info. Check the console logs")
      console.error(response)
    }

  });

}

function processTicketStatus(ticket, pageSource) {
  
  getTicketStatus(ticket, function(ticketStatus) {

    var status = ticketStatus.toLowerCase()

    getAllTransitionsForTicket(ticket, function(allTransitions) {

      switch (pageSource) {
        case "pull_request":

          if (['to do', 'selected for development', 'doing', 'in progress', 'code review'].includes(status)) {

            if ("building" in allTransitions) {
              insertBuildingButton(ticket)
              return
            } else {
              insertDevCompleteButton(ticket)
              return
            }

          }
          break
          
        case "open_pull_request":

          if (['to do', 'selected for development', 'doing', 'in progress'].includes(status)) {
              insertCodeReviewButton(ticket)
              return
          }
          break
      }

      insertTicketStatus(ticketStatus)

    })

  })
}

function moveTicket(ticket, transition, pageSource) {

  var authToken = getAuthToken()

  if (authToken == undefined || authToken == null) {
    return
  }

  // console.log(ticket)
  // console.log(authToken)

  var data = {
    "auth": authToken,
    "transition": transition.id,
    "ticket": ticket
  }


  var port = chrome.runtime.connect({name: "moveTicket"});
  port.postMessage({
    type: "request", 
    method: "post",
    url: "moveticket",
    data: data
  });
  port.onMessage.addListener(function(response) {

    if (response == null || response == undefined) {
      console.error("response was null or undefined")
      return
    }

    var error = response.error
    var response = response.response

    hideSpinner()

    if (error != null) {
      handleError(error)
      return
    }

    if ("errorMessages" in response) {
      handleJiraError(response.errorMessages)
      return
    }

    if (!("message" in response)) {
      console.error("Did not get the correct response")
      return
    }

    if (response.status) {
      if (response.status == 200) {
        processTicketStatus(ticket, pageSource)
      } else {
        displayErrorMessage("Unable to update the ticket: " + response.message)
      }
    } else {
      displayErrorMessage("Unable to update the ticket. Check the console logs")
      console.error(response)
    }

  });

}

function getAllTransitionsForTicket(ticket, callback) {

  if (!shouldFetchTransitions()) {
    var key = getProjectKey() + "_transitions"
    var transitionList = JSON.parse(localStorage[key])

    callback(transitionList)
    return
  }

  var authToken = getAuthToken()

  if (authToken == undefined || authToken == null) {
    callback(null)
    return
  }

  var data = {
    "auth": authToken,
    "ticket": ticket
  }

  var port = chrome.runtime.connect({name: "getTransitionFromRemote"});
  port.postMessage({
    type: "request", 
    method: "post",
    url: "transitions",
    data: data
  });
  port.onMessage.addListener(function(response) {

    if (response == null || response == undefined) {
      console.error("response was null or undefined")
      return
    }

    var error = response.error
    var response = response.response

    if (error != null) {
      handleError(error)
      return
    }

    if ("errorMessages" in response) {
      handleJiraError(response.errorMessages)
      return
    }

    if (!("message" in response)) {
      console.error("Did not get the correct response")
      return
    }

    if (response.status) {
      if (response.status == 200) {
        var key = getProjectKey() + "_transitions"
        localStorage.setItem(key, JSON.stringify(response.transitions));
        callback(response.transitions)
      } else {
        displayErrorMessage("Unable to get transitions: " + response.message)
        callback(null)
      }
    } else {
      displayErrorMessage("Unable to get transitions. Check the console logs")
      console.error(response)
      callback(null)
    }

  });
}

function getTransitionFromRemote(ticket, transitionName, callback) {
  var authToken = getAuthToken()

  if (authToken == undefined || authToken == null) {
    callback(null)
    return
  }

  var data = {
    "auth": authToken,
    "ticket": ticket
  }

  var port = chrome.runtime.connect({name: "getTransitionFromRemote"});
  port.postMessage({
    type: "request", 
    method: "post",
    url: "transitions",
    data: data
  });
  port.onMessage.addListener(function(response) {

    if (response == null || response == undefined) {
      console.error("response was null or undefined")
      return
    }

    var error = response.error
    var response = response.response

    hideSpinner()

    if (error != null) {
      handleError(error)
      return
    }

    if ("errorMessages" in response) {
      handleJiraError(response.errorMessages)
      return
    }

    if (!("message" in response)) {
      console.error("Did not get the correct response")
      return
    }

    if (response.status) {
      if (response.status == 200) {
        var key = getProjectKey() + "_transitions"
        localStorage.setItem(key, JSON.stringify(response.transitions));
        getTransitionFromLocal(ticket, transitionName, callback)
      } else {
        displayErrorMessage("Unable to get transitions: " + response.message)
        callback(null)
      }
    } else {
      displayErrorMessage("Unable to get transitions. Check the console logs")
      console.error(response)
      callback(null)
    }

  });

}

function getTransitionFromLocal(ticket, transitionName, callback) {
  var key = getProjectKey() + "_transitions"
  var transitionList = JSON.parse(localStorage[key])

  if (transitionName in transitionList) {
    callback({
      "name": transitionName,
      "id": transitionList[transitionName]
    })
  } else {
    callback(null)
  }
}

function shouldFetchTransitions() {
  const oneday = 60 * 60 * 24 * 1000

  let keys = {
    "transitions": getProjectKey() + "_transitions",
    "transitionsLastUpdated": getProjectKey() + "_transitions_last_update",
  }

  var shouldFetchTransitions = true

  var lastUpdated = localStorage[keys.transitionsLastUpdated]
  var now = new Date()
  if (lastUpdated) {
    lastUpdatedDate = Date.parse(lastUpdated)
    var now = new Date()

    if((now - lastUpdatedDate) < (oneDay*7)) {
      shouldFetchTransitions = false
    }
  }

  return shouldFetchTransitions
}

function getTransitionForTicket(ticket, transitionName, callback) {

  if (shouldFetchTransitions()) {
    getTransitionFromRemote(ticket, transitionName, callback)
  } else {
    getTransitionFromLocal(ticket, transitionName, callback)
  }

}

function handleError(error) {

  if(error.authError) {
    console.error("Auth error. Clearing token and presenting login modal.")
    localStorage.removeItem("jiraAuthToken")
    setAuthTokenIfNeeded(true)
    return
  }

  if (error.responseJSON.message != undefined) {
    console.error(error.responseJSON.message)
  } else if (error.responseText != undefined) {
    console.error(error.responseText)
  } else {
    console.error(error)
  }
}

function handleJiraError(errors) {

  if (errors.length == 0) { return }

  console.error(errors)

  var errorMessages = "The following errors occured when trying to fetch the JIRA ticket:"

  for (let index = 0; index < errors.length; ++index) {
    let error = errors[index];
    let num = index + 1
    errorMessages += "\n" + num + ".) " + error
  }

  displayErrorMessage(errorMessages)

}