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

  var username = prompt("Enter Jira Username");
  var password = prompt("Enter Jira Password");

  var encodedToken = btoa(username + ":" + password)
  localStorage.jiraAuthToken = encodedToken
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
    console.log(msg)
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
    if (resp.responseJSON.message) {
      console.error(resp.responseJSON.message)
    } else {
      console.error(resp.responseText)
    }
  });
}

function moveTicket(ticket, transition) {

  var authToken = getAuthToken()

  // console.log(ticket)
  // console.log(authToken)

  // transitions
  // 11 To Do
  // 21 In Progress
  // 101 Code Review
  // 41 Dev Complete
  // 61 Blocked
  // 31 Done

  var data = {
    "auth": authToken,
    "transition": transition,
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
        // Success update the button
        // console.log("move ticket was a success!!")
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
