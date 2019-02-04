function addAuthModal() {
  var html = `<div id="authModal" class="modal">
  <div class="log-form">
  <h2>Login to your Jira account</h2>
  <div id="authLoginErr"></div>
  <div style="margin: 10px 0 10px 0">
  <div style="float: left; width: 100px"><label for="email">Email:</label></div>
  <input style="color: black !important;" id="jiraEmail" type="text" name="email" title="email" placeholder="myjiraemail@example.com" />
  </div>
  <div style="margin: 0 0 10px 0; clear: both">
  <div style="float: left; width: 100px"><label for="pass">Password:</label></div>
  <input style="color: black !important;" id="jiraPwd" type="password" name="pass" title="username" placeholder="password" />
  </div>
  <div>
  <button id="jiraAuthBtn" class="btn btn-primary">Login</button>
  </div>
</div>
</div>`

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
  var html = `<h3>Please enter a valid email and password</h3>`
  $("#authLoginErr").html(html);
}
