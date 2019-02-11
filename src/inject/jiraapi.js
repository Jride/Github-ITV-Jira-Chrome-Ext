function getAuthToken() {
  setAuthTokenIfNeeded()
  return localStorage.jiraAuthToken
}

function setAuthTokenIfNeeded() {
  // If the authentication token hasn't been set yet then
  // this will prompt the user for their username and password.
  // Then it will use base64 encoding to and store the results
  // in the browsers local storage
  if (localStorage.jiraAuthToken) { return }

  addAuthModal()
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
  return processBranchName($('.commit-ref > .css-truncate-target').text().toLowerCase().trim())
}

function fetchTicketFromURL() {
  var browserUrlArr = window.location.href.split("...")
  console.log(browserUrlArr[1])
  return processBranchName(browserUrlArr[1])
}

function processBranchName(fullBranchName) {
  // Fetches the name of the branch. This could break if GitHub updates its
  // layout or css class names

  // This also will only work if we use the branch naming strategy which
  // includes the Jira Ticket number.
  // Example Supported Formats:
  // eg. feature/IPIA-XXXX-my-example-feature
  // eg. feature/XXXX_my_new_feature
  // eg. IPIA-XXXX_my_new_feature
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

  if (branchName.includes(projectKey)) {
    var ticketNum = branchNameArr[1]
    var ticket = projectKey.toUpperCase() + "-" + ticketNum
    return ticket

  } else {
    // No project key in branch name
    // console.log(branchNameArr)
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

  $.ajax({
    method: "POST",
    url: "https://github-jira-itv.herokuapp.com/ticketinfo",
    data: data
  }).done(function(msg) {
    hideSpinner()
    // console.log(msg)
    if (msg.status) {
      if (msg.status == 200) {
        callback(msg.body.name)
      } else {
        alert("Unable to get the ticket info: " + msg.message)
      }
    } else {
      alert("Unable to get the ticket info. Check the console logs")
      console.error(msg)
    }
  }).fail(function(resp) {
    hideSpinner()
    if (resp.responseJSON.message != undefined) {
      console.error(resp.responseJSON.message)
    } else if (resp.responseText != undefined) {
      console.error(resp.responseText)
    } else {
      console.error(resp)
    }
  });
}

function processTicketStatus(ticket, devComplete) {
  getTicketStatus(ticket, function(ticketStatus) {

    var status = ticketStatus.toLowerCase()

    if (devComplete) {
      if (['to do',
        'doing',
        'code review']
        .includes(status)) {
          // We only want to show the move to dev complete button if
          // the current status of the ticket is one of the above
          insertDevCompleteButton(ticket)
          return
      }
    } else {
      if (['to do', 'doing']
        .includes(status)) {
          insertCodeReviewButton(ticket)
          return
      }
    }

    insertTicketStatus(ticketStatus)

  })
}

function moveTicket(ticket, transition) {

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

  $.ajax({
    method: "POST",
    url: "https://github-jira-itv.herokuapp.com/moveticket",
    data: data
  }).done(function(msg) {
    hideSpinner()
    if (msg.status) {
      if (msg.status == 200) {
        processTicketStatus(ticket, transition.name == 'dev complete')
      } else {
        alert("Unable to update the ticket: " + msg.message)
      }
    } else {
      alert("Unable to update the ticket. Check the console logs")
      console.error(msg)
    }
  }).fail(function(resp) {
    hideSpinner()
    if (resp.responseJSON.message) {
      console.error(resp.responseJSON.message)
    } else {
      console.error(resp.responseText)
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

  $.ajax({
    method: "POST",
    url: "https://github-jira-itv.herokuapp.com/transitions",
    data: data
  }).done(function(msg) {
    if (msg.status) {
      if (msg.status == 200) {
        var key = getProjectKey() + "_transitions"
        localStorage.setItem(key, JSON.stringify(msg.transitions));
        getTransitionFromLocal(ticket, transitionName, callback)
      } else {
        alert("Unable to get transitions: " + msg.message)
        callback(null)
      }
    } else {
      alert("Unable to get transitions. Check the console logs")
      console.error(msg)
      callback(null)
    }
  }).fail(function(resp) {
    hideSpinner()
    if (resp.responseJSON.message) {
      console.error(resp.responseJSON.message)
    } else {
      console.error(resp.responseText)
    }
  });
}

function getTransitionFromLocal(ticket, transitionName, callback) {
  var key = getProjectKey() + "_transitions"
  var transitionList = JSON.parse(localStorage[key])

  if (transitionName in transitionList) {
    var response = {}
    response[transitionName] = transitionList[transitionName]
    callback({
      "name": transitionName,
      "id": transitionList[transitionName]
    })
  }
}

function getTransitionForTicket(ticket, transitionName, callback) {

  var key = getProjectKey() + "_transitions"
  if (localStorage[key]) {
    getTransitionFromLocal(ticket, transitionName, callback)
  } else {
    getTransitionFromRemote(ticket, transitionName, callback)
  }

}
