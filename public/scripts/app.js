$(document).ready(() => {
   // listen for the submit function and override the default to validate user input

  // $('form').submit((event) => {
  //   event.preventDefault();
  //   console.log("Sending Ajax");
  //   $.ajax({
  //     url: '/:user_id/add-task',
  //     method: 'POST',
  //     data: $('textarea').serialize()
  //   })
  //   .then(function() {
  //   console.log("Successfully added");
  //   })
  //   .fail(function(err) {
  //     console.log("Failed to add.");
  //   });
  // });

  $.ajax({
    method: "GET",
    url: "/api/users"
  }).done((users) => {
    for(user of users) {
      $("<div>").text(user.name).appendTo($("body"));
    }
  });
});
