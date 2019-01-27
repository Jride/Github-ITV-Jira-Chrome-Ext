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
  if (browserUrl.includes("itvplayer_android")) { return "tvos" }

  return null
}

function getTicketNumber() {
  // Fetches the name of the branch. This could break if GitHub updates its
  // layout or css class names

  // This also will only work if we use the branch naming strategy which
  // includes the Jira Ticket number
  // eg. feature/IPIA-XXXX-my-example-feature
  // eg. feature/XXXX_my_new_feature

  var projectKey = getProjectKey()

  console.log(projectKey)

  var fullBranchName = $('.commit-ref > .css-truncate-target').text().toLowerCase().trim();
  // Strips newlines and empty spaces
  fullBranchName = fullBranchName.replace(/(\r\n|\n|\r)/gm, "");
  var fullBranchNameArr = fullBranchName.split("/")

  console.log(fullBranchName)
  console.log(fullBranchNameArr)

  if (fullBranchName.includes(projectKey)) {
    var fullBranchNameArr = fullBranchName.split("/")
    var branchName = fullBranchNameArr[fullBranchNameArr.length - 1];
    var branchNameArr = branchName.split("-")
    var ticketNum = branchNameArr[1]

    var ticket = branchNameArr[0].toUpperCase() + "-" + ticketNum
    return ticket
  } else {
    return null
  }
}

function mergeTicket(ticket, transition) {

  var authToken = getAuthToken()

  console.log(ticket)
  console.log(authToken)

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
    $("#circularG").hide()
    if (msg.status) {
      if (msg.status == 200) {
        // Success update the button
        console.log("move ticket was a success!!")
      } else {
        alert("Unable to update the ticket: " + msg.message)
      }
    } else {
      alert("Unable to update the ticket: " + msg)
    }
  }).fail(function(resp) {
    $("#circularG").hide()
    if (resp.responseJSON.message) {
      console.log(resp.responseJSON.message)
    } else {
      console.log(resp.responseText)
    }
  });
}
