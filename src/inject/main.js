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

function isCompareBranchPage() {
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
    moveTicket(ticket, "41")
  });
}

function insertCodeReviewButton(ticket) {
  var newButton = `<div id="jiraTicketCodeReviewButton" style="margin-left: 10px" class="BtnGroup btn-group-merge">
      <button class="btn btn-primary BtnGroup-item">
        Move to Code Review
      </button>
  </div>`

  $("#jiraTicketActions").after(newButton)

  $( "#jiraTicketCodeReviewButton > button" ).click(function() {
    $("#jiraTicketCodeReviewButton").hide()
    showSpinner()
    moveTicket(ticket, "101")
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

  $(".compare-pr-placeholder > button").click(function() {

    addJiraActionsBlockToCreatePR()

    addSpinner()

    processTicketStatus(ticket, false)

  });

}

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

    if (isITVPullRequestPage()) {
      handlePullRequestPage()
    }

    if (isCompareBranchPage()) {
      handleCreatePullRequestPage()
    }

	}
	}, 10);
});
