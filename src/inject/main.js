function isITVPullRequestPage() {
  var browserUrl = window.location.href

  if (browserUrl.includes("/pull/")
  && (browserUrl.includes("itvplayer-ios")
  || browserUrl.includes("itvhub-tvos")
  || browserUrl.includes("itvplayer_android"))) {
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

  var gitHubMergeButton = $( "button:contains('Merge pull request')" ).parent()
  gitHubMergeButton.after( newButton );

  $( "#jiraTicketDevCompleteButton > button" ).click(function() {
    $("#jiraTicketDevCompleteButton").hide()
    showSpinner()
    moveTicket(ticket, "41")
  });
}

function insertTicketStatus() {

}

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		if (!isITVPullRequestPage()) { return }

    var ticket = getTicketNumber()
    if (ticket == null) { return }

    addSpinnerCSS()

    addSpinner()

    getTicketStatus(ticket, function(ticketStatus) {
      console.log("Ticket Status: " + ticketStatus)
      switch (ticketStatus) {
        case 'To Do':
        case 'Doing':
        case 'Code Review':
        // We only want to show the move to dev complete button if
        // the current status of the ticket is one of the above
          insertDevCompleteButton(ticket)
        default:
          insertTicketStatus()
      }
    })

	}
	}, 10);
});
