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

function insertButton() {
  var newButton = `<div id="jiraTicketDevCompleteButton" style="margin-left: 10px" class="BtnGroup btn-group-merge">
      <button class="btn btn-primary BtnGroup-item">
        Move to Dev Complete
      </button>
  </div>`

  var gitHubMergeButton = $( "button:contains('Merge pull request')" ).parent()
  gitHubMergeButton.after( newButton );
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

    insertButton()

    $( "#jiraTicketDevCompleteButton > button" ).click(function() {
      $("#jiraTicketDevCompleteButton").hide()
      $("#circularG").show()
      mergeTicket(ticket, "41")
    });

	}
	}, 10);
});
