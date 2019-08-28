$(document).ready(() => {
  //  listen for the submit function and override the default to validate user input

  $('#newtask').submit((event) => {
    event.preventDefault();
    const form = $(this);
    // const task = $(this).children('div').children('#task-to-add').val(); // get task input
    const task = $('#task-to-add').val();
    console.log("Sending Ajax with task", task);
    $.ajax({
      url: '/user_id/add-task',
      method: 'PUT',
      data: {task: task}
    })
      .then(function(response) {
        // show submission form here with category!
        // .toggle(200, 'swing')
        console.log("Successfully added to category", response);
        // $(this)
        //   .children('div')
        //   .find('input[type=text], textarea')
        //   .val(''); // clear form (needs work)
        $('#added-item').text(response.task);
        $('#added-list').text(response.category);

        // $('.changecat').empty();
        $('.changecat').append(response.button1);
        $('.changecat').append(response.button2);
        $('.changecat').append(response.button3);
        $('#submitted-item').slideDown();
      })
      .fail(function(err) {
        console.log("Failed to add:", err);
      });
  });

  // $.ajax({
  //   method: "GET",
  //   url: "/api/users"
  // }).done((users) => {
  //   for(user in users) {
  //     $("<div>").text(user.name).appendTo($("body"));
  //   }
  // });
});
