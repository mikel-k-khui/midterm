$(document).ready(() => {
  //  listen for the submit function and override the default to validate user input

  $('#newtask').submit((event) => {
    event.preventDefault();
    const $form = $(this);
    // const task = $(this).children('div').children('#task-to-add').val(); // get task input
    const task = $('#task-to-add').val();
    console.log("Sending Ajax with task", task);
    $.ajax({
      url: '/user_id/add-task',
      method: 'PUT',
      data: {task: task}
    })
      .then(function(response) {
        // show post-submission form here with category corrections
        // console.log("Successfully added to category", response);
        $('#task-to-add').val(''); // clear form (could use better DOM tree traversal)
        $('#added-item').text(response.task);
        $('#added-list').text(response.category);

        const $editButtons = $('.changecat');
        $editButtons.empty();
        $editButtons.append(response.button1);
        $editButtons.append(response.button2);
        $editButtons.append(response.button3);
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

  $(document).delegate('.modal-toggle', 'click', function(e) {
    let modal = $(this).attr('data-modal');

    $(modal).addClass('active');

    e.preventDefault();
  });

  $(document).delegate('.modal-close', 'click', function(e) {
    $(this).closest('.modal').removeClass('active');
    e.preventDefault();
  });
});
