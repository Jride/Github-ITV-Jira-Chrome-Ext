function addAuthModal(authError = false) {
  
  var errorMessage = ""
  if (authError) {
    errorMessage = `<p style="color: red;margin-top: 10px;">Sorry, but there was a authentication error when using the jira api.</p>`
  }

  var html = `<div id="authModal" class="modal">
  <div class="log-form">
  <h2>Jira API Authentication</h2>
  ${errorMessage}
  <p>Please enter your Jira Authentication token. <a href="https://id.atlassian.com/manage/api-tokens">Click here</a> to generate one if you haven't already done so</p>
  <div id="authLoginErr"></div>
  <div style="margin: 10px 0 10px 0">
  <div style="float: left; width: 100px"><label for="email">Email:</label></div>
  <input style="color: black !important;width: 60%" id="jiraEmail" type="text" name="email" title="email" placeholder="myjiraemail@example.com" />
  </div>
  <div style="margin: 0 0 10px 0; clear: both">
  <div style="float: left; width: 100px"><label for="token">Token:</label></div>
  <input style="color: black !important;width: 60%" id="jiraPwd" type="password" name="token" title="token" placeholder="auth token" />
  </div>
  <div>
  <button id="jiraAuthBtn" class="btn btn-primary">Login</button>
  </div>
</div>
</div>`

  $('#authModal').remove();

  $("body").append(html)
}

function showAuthModal() {
  $("#authModal").modal({
    closeClass: 'icon-remove',
    clickClose: false,
    closeText: 'x'
  });
}

function hideAuthModal() {
  $("#authModal .close-modal").click();
}

function showErrMessageAuthModal() {
  var html = `<h3>Please enter a valid email and your jira authentication token</h3>`
  $("#authLoginErr").html(html);
}
