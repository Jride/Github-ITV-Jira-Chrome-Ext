function isITVGithubProject() {
  var browserUrl = window.location.href

  if (browserUrl.includes("/itvplayer-ios/")
  || browserUrl.includes("/itvhub-tvos/")
  || browserUrl.includes("/itvplayer_android/")) {
    return true
  } else {
    return false
  }
}

function isITVPullRequestPage() {
  var browserUrl = window.location.href

  if (browserUrl.includes("/pull/") && isITVGithubProject()) {
    return true
  } else {
    return false
  }
}

function isITVCompareBranchPage() {
  var browserUrl = window.location.href

  if (browserUrl.includes("/compare/") && isITVGithubProject()) {
    return true
  } else {
    return false
  }
}

function insertDevCompleteButton(ticket) {
  var newButton = `<div id="jiraTicketDevCompleteButton" style="margin-left: 10px" class="BtnGroup btn-group-merge">
      <button class="btn btn-primary BtnGroup-item">
        Move to Dev Complete
      </button>
  </div>`

  $("#jiraTicketActions").after(newButton)

  $( "#jiraTicketDevCompleteButton > button" ).click(function() {
    $("#jiraTicketDevCompleteButton").hide()
    showSpinner()

    getTransitionForTicket(ticket, "dev complete", function(transition) {
      if (transition == null) {
        hideSpinner()
        return
      }
      moveTicket(ticket, transition);
    });

  });
}

function insertCodeReviewButton(ticket) {
  var newButton = `<div id="jiraTicketCodeReviewButton" style="margin-left: 10px" class="BtnGroup btn-group-merge">
      <button class="btn btn-primary BtnGroup-item">
        Open Pull Request & Move to Code Review
      </button>
  </div>`

  $("#jiraTicketActions").after(newButton)

  $( "#jiraTicketCodeReviewButton > button" ).click(function() {
    $("#jiraTicketCodeReviewButton").hide()
    showSpinner()

    getTransitionForTicket(ticket, "code review", function(transition) {
      if (transition == null) {
        hideSpinner()
        return
      }
      moveTicket(ticket, transition);
    });

  });
}

function handlePullRequestPage() {
  var ticket = fetchTicketFromPage()
  if (ticket == null) { return }

  addJiraActionsBlock()

  addSpinner()

  processTicketStatus(ticket, true)
}

function handleCreatePullRequestPage() {
  var ticket = fetchTicketFromURL()
  if (ticket == null) { return }

  addJiraActionsBlockToCreatePR()

  addSpinner()

  processTicketStatus(ticket, false)

}

var previousWindowLocation = ""

function runScript() {

  if (isITVPullRequestPage()) {
    handlePullRequestPage()
  }

  if (isITVCompareBranchPage()) {
    handleCreatePullRequestPage()
  }
}

chrome.extension.sendMessage({}, function(response) {

  previousWindowLocation = window.location
  runScript()

});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // listen for messages sent from background.js
    if (request.message === 'UPDATE_URL') {
      if (previousWindowLocation !== request.url) {
        previousWindowLocation = request.url
        setTimeout(function(){ runScript() }, 3000);
      }
    }
});
