var username;

/*---------------------------------------------------------------------------
Function: logOut()
Purpose: Logs out user by sending logged in session_id to server.
Input:none
Return: return message.
-----------------------------------------------------------------------------*/


function logOut() {
    console.log('in logout function');
    $.ajax({
        url: 'http://s-apis.learningfuze.com/todo/logout',
        data: {
            username: username,
            sid: user.session_id
        },
        method: 'Post',
        success: function(response) {
            console.log('in logout: ', response);
            $('.task_list').remove();
        }
    })

}

/*---------------------------------------------------------------------------
Function: validateUser()
Purpose: sends login information to server to log in user
Input: username and password
Output: success or failure message, on success: appends user information to the top of the page
-----------------------------------------------------------------------------*/

function validateUser() {
    console.log('in validateUser function');
    username = $('#username').val();
    $.ajax({
        url: 'http://s-apis.learningfuze.com/todo/login',
        dataType: 'json',
        data: {
            username: $('#username').val(),
            password: $('#password').val()
        },
        method: 'POST',

        success: function(response) {
            window.user = response;
            if (response.success == false) {
                console.log('in failure');
                console.log('errors: ', response.errors);
            }
            var name_span = $('<span>', {
                text: response.firstName + ' ' + response.lastName,
                id: 'user_logged_in',
                class: 'col-xs-12'
            })
            var email_span = $('<span>', {
                text: response.email,
                id: 'email_logged_in',
                class: 'col-xs-12',
            })
            $('.user_info').empty();
            $('.user_info').append(name_span, email_span);
            getServerList();
            console.log('response: ', response);
            $('#logout_btn').click(function() {
                console.log('in logout btn click handler');
                logOut();
                $('.user_info').remove()

            });
            getServerList();
            generateList();
        }

    });

}

/***************************
 * FUNCTION:
 * PURPOSE:
 * INPUT:
 * OUTPUT:
 *********************************/
// function create_account() {
//     $.ajax({
//         url: "http://s-apis.learningfuze.com/todo/newAccount",
//         dataType: "json",
//         method: "post",
//         data: {
//             username: $('')
//         }

//     });

// }

/*---------------------------------------------------------------------------
Function: getServerList()
Purpose: task information from the server. task information is an array of objects.
Input: none 
Output: response, an array of task objects
-----------------------------------------------------------------------------*/

function getServerList() {
    console.log('in getServerList function');
    console.log('userid: ', user.id)
    $.ajax({

        url: 'http://s-apis.learningfuze.com/todo/get',
        dataType: 'json',
        data: {
            userId: user.id
        },
        crossDomain: true,
        cache: false,
        method: 'Post',
        success: function(response) {

            console.log('response: ', response);
            window.todo_objects = response;
            applyPastDue();
            sortByPastDue();
            markByPastDue();

            $('.task_list').click(function() {



                console.log('this: ', $(this));
                console.log("clicked");
                var target_id = $(this).attr('index_id');
                console.log(target_id);
                var target_details = '#task_details' + target_id;
                $(target_details).toggleClass('shown_task_details');
            })

        }


    });
}

/*---------------------------------------------------------------------------
Function: deleteTask()
Purpose: Deletes a task out of the object array, and removes its dom element.
Input: none
Output: none
-----------------------------------------------------------------------------*/
function deleteTask() {

        console.log('in deleteTask')
        $('.task_list_container').on('click', '.delete_task', function() {
            console.log('id of this: ', $(this));

            var current_index = $(this).attr('index_id');
            var target_id = '#task' + current_index;

            console.log('this: ' + $(this).attr('index_id'));
            $(target_id).remove();
            current_index = parseInt(current_index);
            console.log("user id", user.id);
            console.log("current_index", current_index);

            $.ajax({
                url: "http://s-apis.learningfuze.com/todo/delete",
                dataType: 'json',
                method: 'post',
                data: {
                    postId: current_index,
                    userId: user.id
                },
                success: function(response) {
                    console.log(response);
                }
            });
            delete todo_objects[current_index];


        });
    }
    /*---------------------------------------------------------------------------
    Function: taskComplete()
    Purpose: create an onlick handler that moves the task element to a new dom structure with the class .task_completed_container 
    Input: none
    Output: none
    -----------------------------------------------------------------------------*/

function taskComplete() {
        var current_index;
        console.log('in taskComplete function');
        $('.task_list_container').on('click', '.completed_task', function() {
            console.log('id of this: ', $(this));

            current_index = $(this).attr('index_id');
            var target_id = '#task' + current_index;



            console.log('this: ' + $(this).attr('index_id'));
            $(target_id).addClass('task_details')
            $('.task_completed_container').append($(target_id));
            console.log('current index: ', current_index);
            $.ajax({
                url: 'http://s-apis.learningfuze.com/todo/updateCompleteStatus',
                method: 'Post',
                dataType: 'json',
                data: {
                    postId: current_index,
                    complete: 1
                },
                success: function(response) {
                    console.log('current_index: ', current_index)
                    console.log('updating task complete information');
                    console.log(response);
                }
            });
        });


    }
    /*---------------------------------------------------------------------------
    Function: showCompleted()
    Purpose: Creates an onclick handler on .task_completed_container that toggles a class to hide the list. 
    Input: None
    Output: None
    -----------------------------------------------------------------------------*/
function showCompleted() {
        console.log('in showCompleted');
        $('.task_completed_container').click(function() {
            $('.task_list').toggleClass('shown_task_details');
        })
    }
    /*---------------------------------------------------------------------------
    Function: generateList()
    Purpose: Iterates through task object array and creates dynamically creates dom elements to list the objects in the array
    Input: todo_obj_arr, array of task objects that is retrieved from the server
    Output: Dom elements
    -----------------------------------------------------------------------------*/
function generateList(todo_object_arr) {


    console.log('in generateList');
    console.log('todo_object_arr: ', todo_object_arr);
    console.log('todo_object_arr.length: ', todo_object_arr.data.length)
    for (var i = 0; i < todo_object_arr.data.length; i++) {
        console.log('in for loop: ', i);
        console.log('in for loop');
        var task_list_entry = $('<div>', {
            class: 'task_list col-xs-12',
            id: 'task' + todo_object_arr.data[i].id,
            index_id: todo_object_arr.data[i].id,
        });
        var task_title = $('<li>', {
            text: todo_object_arr.data[i].title,
            class: 'task_entry col-xs-6 list-unstyled',
            index_id: todo_object_arr.data[i].id,

        });
        var edit_button = $('<button>', {
            text: '',
            type: 'button',

            class: 'col-xs-1 col-sm-offset-1 edit_task glyphicon glyphicon-th-list',
            index_id: todo_object_arr.data[i].id,

        });
        var delete_button = $('<button>', {
            text: '',
            type: 'button',
            class: 'col-xs-1 col-sm-offset-1 delete_task glyphicon glyphicon-trash',
            id: 'delete' + todo_object_arr.data[i].id,
            index_id: todo_object_arr.data[i].id,

        });
        var task_complete = $('<button>', {
            text: '',
            type: 'button',
            class: 'col-xs-1 col-sm-offset-1 completed_task glyphicon glyphicon-ok',
            id: 'complete' + todo_object_arr.data[i].id,
            index_id: todo_object_arr.data[i].id,

        });


        var details_div = $('<div>', {
            id: 'task_details' + todo_object_arr.data[i].id,
            class: 'task_details col-xs-12',

        });

        var details_span = $('<span>', {
            text: todo_object_arr.data[i].details,
            class: 'col-xs-6',
            contenteditable: 'true',

        });

        var initial_time = $('<span>', {
            text: 'Made: ' + todo_object_arr.data[i].timeStamp,
            class: 'col-xs-2 col-xs-offset-1',
            contenteditable: 'true',
        });

        var due_time = $('<span>', {
            text: 'Due: time_due',
            class: 'col-xs-2 col-xs-offset-1',
            contenteditable: 'true',
        });


        details_div.append(details_span, initial_time, due_time);


        task_list_entry.append(task_title, edit_button, delete_button, task_complete);
        task_list_entry.append(details_div);
        $('.task_list_container').append(task_list_entry);


    }
}

/*---------------------------------------------------------------------------
Function: createTask()
Purpose: Creates new task object and pushes it to the task object array. Also creates and appends dom elements according to that task.
Input: None
Output: New dom elements and new object in the object array.
-----------------------------------------------------------------------------*/
function createTask() {
        console.log('in createTask function');
        $.ajax({
            url: 'http://s-apis.learningfuze.com/todo/create',
            dataType: 'json',
            method: 'Post',
            data: {
                title: $('#new_title').val(),
                dueDate: timeStamp(),
                details: $('#new_details').val(),
                userId: user.id,
            },
            success: function(response) {
                console.log('response: ', response);
                $('.task_list').remove();
                getServerList();

            }

        })

        $('#new_title').val(null);
        $('#new_details').val(null);
    }
    /*---------------------------------------------------------------------------
    Function: timeStamp()
     Purpose: Creates new timeStamp to apply to the new task object. 
     Input:none
     Output: timeStamp to add to the object.
    -----------------------------------------------------------------------------*/
function timeStamp() {
    // Create a date object with the current time
    var now = new Date();

    // Create an array with the current month, day and time


    var date = [now.getFullYear(), now.getMonth() + 1, now.getDate()];

    // Create an array with the current hour, minute and second
    var time = [now.getHours(), now.getMinutes() + 1, now.getSeconds()];



    // Convert hour from military time
    time[0] = (time[0] < 12) ? time[0] : time[0] - 12;

    // If hour is 0, set it to 12
    time[0] = time[0] || 12;

    // If seconds and minutes are less than 10, add a zero
    for (var i = 1; i < 3; i++) {
        if (time[i] < 10) {
            time[i] = "0" + time[i];
        }
    }

    // Return the formatted string
    return date.join("-") + ' ' + time.join(':') + 'PM';
}


/*---------------------------------------------------------------------------
Function: 
Purpose: 
Input: 
Output: 
-----------------------------------------------------------------------------*/
function toggleButtons() {
    $('.login_logout_container').click(function() {
        console.log('in login_logout click handler')
        $('.login_logout_btn').toggleClass('clicked_btn')
    })

}


/*---------------------------------------------------------------------------
Function: 
Purpose: 
Input: 
Output: 
-----------------------------------------------------------------------------*/
function applyPastDue() {
    console.log('in past due');
    for (var i = 0; i < todo_objects.data.length; i++) {
        console.log('todo_objects.data: ', todo_objects.data);
        if (todo_objects.data[i].timeStamp > timeStamp()) {
            todo_objects.data[i].pastDue = true;
        } else if (todo_objects.data[i].timeStamp < timeStamp()) {
            todo_objects.data[i].pastDue = false;
        }
    }
}

/*---------------------------------------------------------------------------
Function: 
Purpose: 
Input: 
Output: 
-----------------------------------------------------------------------------*/
function sortByPastDue() {
    console.log('sortAndMarkByPastDue');
    for (var i = 1; i < todo_objects.data.length; i++) {
        if (todo_objects.data[i].pastDue < todo_objects.data[i - 1].pastDue) {
            var more = todo_objects.data[i - 1];
            todo_objects.data[i - 1] = todo_objects.data[i];
            todo_objects.data[i] = more;


            i = 0;
        }
    }
    console.log(todo_objects);
    $('.task_list').remove();
    generateList(todo_objects);
}


function markByPastDue() {
    console.log('in markByPastDue')
    for (var i = 0; i < todo_objects.data.length; i++) {
        if (todo_objects.data[i].pastDue) {
            var target_div = '#task' + todo_objects.data[i].id;
            console.log('target_div: ', target_div);
            $(target_div).removeClass('col-xs-12').addClass('col-xs-10 col-xs-offset-2');
            console.log($(target_div));
        }
    }
}

/*---------------------------------------------------------------------------
Function: 
Purpose: 
Input: 
Output: 
-----------------------------------------------------------------------------*/
// function completeItem(){
//     $.ajax({
//             url: 'http://s-apis.learningfuze.com/todo/update',
//             dataType: 'json',
//             method: 'Post',
//             data:{  postId: $(this).attr(index_id),
//                     title: 
//                     dueDate: string - any valid date format as specified in the PHP strtotime specs
//                     details: string - todo list details
//                     userId: number - Users ID
//                     complete: boolean - whether the task has been completed or not}
//     })
// }





/*---------------------------------------------------------------------------
Function: document.ready
Purpose: On load creates the list of objects from the server. And creates the click handlers via getServerList(), taskComplete(), deleteTask(), and showCompleted()
also applies validateUser() the submit button click.
Input: none
Output: none  
-----------------------------------------------------------------------------*/

$(document).ready(function() {

    taskComplete();
    deleteTask();
    showCompleted();
    toggleButtons();

    $('.login_submit_button').click(function() {
        console.log('in login submit handler');
        if ($('.user_login').css('display') === 'none') {
            validateUser();
        }
        else
        {
            // create_account();
        }
    })
    $('.create_task_button').click(function() {
        createTask();
    });
    $('.user_create_btn').click(function() {

        $('.user_login').toggle();
        $('.user_create').toggle();


    });

});
