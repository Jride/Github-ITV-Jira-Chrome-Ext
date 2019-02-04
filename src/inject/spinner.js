function addSpinner() {
  var spinner = `<div class="BtnGroup btn-group-merge" id="circularG" style="margin-left: 30px; display: none">
<div id="circularG_1" class="circularG"></div>
<div id="circularG_2" class="circularG"></div>
<div id="circularG_3" class="circularG"></div>
<div id="circularG_4" class="circularG"></div>
<div id="circularG_5" class="circularG"></div>
<div id="circularG_6" class="circularG"></div>
<div id="circularG_7" class="circularG"></div>
<div id="circularG_8" class="circularG"></div>
</div>`

  $("#jiraTicketActions").after(spinner)
}

function showSpinner() {
  $("#circularG").show()
}

function hideSpinner() {
  $("#circularG").hide()
}
