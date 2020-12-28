# TasksDaily

**TasksDaily** is a [Django](https://www.djangoproject.com/) web application that lets registered users improve their habits by adding tasks, logging their status of completion daily and tracking their progress.

# Functionality

Progress is tracked by changing the status of completion (***Complete***, ***Incomplete***, ***Ignored*** and ***Pending***) of a logged task, over multiple dates.  
Tasks are organized by category. New tasks and categories can be created within the ***add_task*** view.  
When a user opens either ***daily_log***, ***weekly_log*** or ***monthly***, a new log is automatically created for every task pertaining to the relevant dates, up until the current date.  
The default status of completion of a new task log is ***Pending***.  A task's status of completion can only be changed within the ***daily_log*** and ***edit_log***'s views.  
The status of any log older than a week will not be modifiable, with the exception of logs with a status of ***Pending***.
Any log older than a week with a status of ***Pending*** will be automatically changed to the ***Incomplete*** status.  
Users are allowed to change data about a task, like ***Name***, ***Category***, ***Active*** status and ***Days*** to perform the task in, within the ***tasks_overview*** view. The ***Name*** of a category can also be changed within the same view.  
Users are allowed to delete a task within the ***delete_task*** view, which also deletes every log associated with the task.  
Users are allowed to delete a category within the ***delete_category*** view, which also deletes every task and log associated with the category.  
If a user wishes to stop logging a task without deleting the task itself and previous logs, unchecking the ***Active*** status of a task will stop the task from being logged in future dates.  
Users can check their progress within the ***progress*** view.  
If the user has JavaScript enabled, the log statistics will be represented in a **[Google Charts](https://developers.google.com/chart)** **[Column Chart](https://developers.google.com/chart/interactive/docs/gallery/columnchart)**, otherwise, the raw statistics are represented within a list, sorted by task.

# Views

## views.py

Declares every possible view that **TasksDaily** uses (like register, login, daily, progress, etc.).

### index

Displays a splash page with general information about the app if the user is unregistered or logged out. Else, it displays a menu with elements that, when clicked, redirect the user to other views.

### register

Displays a user registration form and registers a new user.  
For the **GET** request method, if the user is logged in, it displays a warning message telling the user to log out first to create a new account.  
Else, it displays a registration form with the username, first name, last name, email address, password and password confirmation form fields (first and last name are optional fields).  
For the **POST** request method, if the user is logged in, it displays an error message telling the user to log out first to register a new account. Else, it validates the following fields:

#### username

It uses the custom **validate_username** function (found in ***utils.py***), which expects usernames to be less than 150 characters long and consist of letters, numbers, underscores or hyphens only. If the validation is unsuccessful, it displays an error message.

#### first_name

This is an optional field. It expects first names to be less than 150 characters long.

#### last_name

This is an optional field. It expects last names to be less than 150 characters long.

#### email

It first checks that an email was provided. If not, it displays an error message.  
Else, it then uses **Django**'s **[validate_email](https://docs.djangoproject.com/en/3.1/ref/validators/#validate-email)** function, which raises a validation error if the validation is unsuccessful.

#### password and password_confirm

It first checks that a password has been provided in the ***password*** and ***password_confirm*** fields, returning corresponding error messages if not.  
It then checks that the password provided is the same as the password confirmation, returning an error message if not.  
After that, it uses **Django**'s **[validate_password](https://docs.djangoproject.com/en/3.1/topics/auth/passwords/#django.contrib.auth.password_validation.validate_password)** function, which returns none if the validation is successful, or raises a validation error with all the errors found in message form.

If all the fields are validated successfully, it proceeds to query the database for a user by username or email.  
If the database retrieves a user, it returns an error message indicating that a user with that information is in the database already.  
Else, it creates a new user with the information provided in the fields.  
Then, the user settings (using the custom ***Settings*** model) are set with a **UTC** timezone by default.  
After that, the user is authenticated using the **Django**'s **[authenticate](https://docs.djangoproject.com/en/3.1/topics/auth/default/#django.contrib.auth.authenticate)** function, logged in using the **Django**'s **[login](https://docs.djangoproject.com/en/3.1/topics/auth/default/#django.contrib.auth.login)** function and finally redirected to the ***timezone*** view in order to customize the timezone settings.

### login_view

Displays the login page and logs users in.  
For the **GET** request method, the user is displayed a page with a login form.  
For the **POST** request method, if the user is logged in, an error message will be displayed asking for the user to log out first.  
Else, it checks that the user has filled the required fields, those being ***username*** and ***password***, returning an error message if not.  
Then it tries to authenticate the user with **Django**'s **[authenticate](https://docs.djangoproject.com/en/3.1/topics/auth/default/#django.contrib.auth.authenticate)** function, returning an error message if the user could not be authenticated.  
After that, it logs the user in with **Django**'s **[login](https://docs.djangoproject.com/en/3.1/topics/auth/default/#django.contrib.auth.login)** function and queries the database for the user's timezone from the custom ***Settings*** model and updates the session's timezone with it.  
Finally, it redirects the user to the index page.

### logout_view

logs users out using **Django**'s **[logout](https://docs.djangoproject.com/en/3.1/topics/auth/default/#django.contrib.auth.logout)** function.

### add_task

Displays a page that let's users add a new task and/or category.  
If the user is unlogged, it redirects the user to the login page with an error message.  
For the **GET** request method, it queries the database for the user's categories from the custom ***Category*** model, rendering a page with a form to add a new task, afterwards.  
For the **POST** request method, it requests and validates the value from the following form fields:

#### category_select

The form may or may not contain this field, depending on whether or not the database retrieved any user categories for the **GET** method.  
If the field is present in the form and a value was returned from the request, it queries the database for a category object, using its value in the **id** field of the ***Category*** model. It displays an error message if unsuccessful.

#### category_name

Its value is only validated if the ***category_select*** field is not present or if it did not return a value.  
It validates for a non-empty string that is less than 64 characters long and that is not equal to the name of another category from the user.

#### task_name

It validates for a non-empty string that is less than 64 characters long and that is not equal to the name of another task from the user.

#### day{i}

Seven check boxes corresponding to each day of the week.  
It checks whether a weekday checkbox is checked and for which day.  
At least one must be checked for a new task to be added.  
The view counts how many of the days are unchecked, returning an error message if not a single day is checked.

If ***category_name*** is successfully validated, a new category is created.  
A new task is created with the validated values from the form fields, setting the ***is_active*** model field to true by default, indicating that the new task can be logged in other views.  
The new task is added to the ***tasks*** model field of either the new category or the selected category.  
Finally, the user is displayed a success message.

### tasks_overview

Displays a page that lets users modify their tasks and categories.  
If the user is unlogged, it redirects the user to the login page with an error message.  
For the **GET** request method, it queries the database for the user's categories from the custom ***Category*** model and the user's tasks from the custom ***Tasks*** model, rendering a page with a form to modify those tasks and categories, afterwards.  
For the **POST** request method, it first gets the current date according to the user's local timezone, using **Django**'s [localdate](https://docs.djangoproject.com/en/3.1/ref/utils/#django.utils.timezone.localdate) function.  
Then, it proceeds to look for information to update, task by task, by comparing the data from the model fields as they currently are in the database with the data retrieved from the request object. If a change has been found in a field, specific validations (as seen on the ***add_task*** view) are run on the new data, returning error messages if needed.  
After running validations, if any field data differs from the one found in database, the task is updated.  
The ***last_updated*** field of a task will be updated with the current date to avoid a bug where, because new logs would be created for previous dates (when browsing ***daily_log***, ***weekly_log*** or ***monthly*** views), if the user changed the days of the week a task was performed in, new logs would eventually flood the old dates, even if the task was not originally performed on that date.

### delete_task

Displays a confirmation page that lets users delete a task.  
If the user is unlogged, it redirects the user to the login page with an error message.  
It takes an Integer as an argument, which needs to be the ***id*** of a task object.  
For the **GET** request method, it uses the argument provided to query the database for a task from the user that matches the ***id***, returning an error message if unsuccessful.  
It proceeds to retrieve all logs of that task. If there are any, it counts the number of logs retrieved, and it gets the earliest and latest log dates. Else, it sets the log count to 0 and sets the earliest and latest log dates as None.  
Then it renders the confirmation page with a warning message and the previously defined variables for usage within the template.  
The confirmation page contains a single-field (***task_select***) form with a select element with just one option, already selected, which has a value that matches the task's ***id***.  
For the **POST** request method, the value from the ***task_select*** field is retrieved and then used to query the database for a task object. If no task is retrieved, an error message is displayed, else, it deletes the task and a success message is displayed.

### delete_category

Displays a confirmation page that lets users delete a category.  
If the user is unlogged, it redirects the user to the login page with an error message.  
It takes an Integer as an argument, which needs to be the ***id*** of a category object.  
For the **GET** request method, it uses the argument provided to query the database for a category from the user that matches the ***id***, returning an error message if unsuccessful.  
It proceeds to counts the number of tasks associated with the category.  
Then it renders the confirmation page with a warning message and the previously defined variable for usage within the template.  
The confirmation page contains a single-field (***category_select***) form with a select element with just one option, already selected, which has a value that matches the category's ***id***.  
For the **POST** request method, the value from the ***category_select*** field is retrieved and then used to query the database for a category object. If no category is retrieved, an error message is displayed, else, it iterates over every task associated with the category, deleting each one. It then deletes the category and a success message is displayed.

### daily_log

Displays tasks corresponding to the current day and logs their state of completion.  
If the user is unlogged, it redirects the user to the login page with an error message.  
It gets the current date and obtains the current day of the week as an integer for future use.  
For the **GET** request method, it first gets the active tasks corresponding to the current weekday using the custom ***get_current_tasks*** function from ***utils.py***.  
If there are no tasks assigned for the day, it queries the database for any previous logs corresponding to the current date and then it filters the categories that are relevant to the logs found. This is done because all logs are sorted by category within the ***daily.html*** template itself.  
If there are tasks assigned for the day, it queries the database for any previous logs corresponding to the current date. If there are no logs, it creates new ones by logging the tasks assigned.  
If there are logs, it checks for any unlogged tasks (in the case of new tasks added, or other tasks being modified) and creates new logs where needed with the custom ***check_unlogged*** function from ***utils.py***. Then it updates the logs queryset, and filters the categories that are relevant to the logs found.  
Finally it defines all possible statuses of completion in a list of dictionaries, queries the database for the note corresponding to the current date, and renders the page with categories, logs, weekday, statuses and note defined in the context.  
For the **POST** request method, it queries the database for any previous logs corresponding to the current date. If there are no logs, an error message is displayed.
Else, it iterates over every log and uses their ***id*** to request the value (***Status*** of completion) from the pertinent form fields if they exist.
If the ***Status*** retrieved from the form field is not equal to the one in the log and is a valid value (Integer with a range from 0 to 3), it updates the log with the new ***Status*** of completion.
Else, it moves on to the next log without updating.
Finally, it requests the note from the textfield in the form, compares it to the note found if there is one and updates it if necessary, or creates a new one if there was no note found (if the note in the textfield was not an empty string), displaying a success message.

### weekly_log

Displays tasks corresponding to the current week and logs their state of completion.  
If the user is unlogged, it redirects the user to the login page with an error message.    
For the **GET** request method, it gets the current date and converts it to a week object with the ***[isocalendar](https://docs.python.org/3/library/datetime.html?highlight=isocalendar#datetime.date.isocalendar)*** function, then gets the current year, current week and current weekday from it.
It defines a list of dictionaries to store the log's data by day of the week, and then it iterates over each day in a week.  
Within the for loop, it first gets the active tasks corresponding to the current weekday using the custom ***get_current_tasks*** function from ***utils.py***. Then it creates a date object with the current year, current week and weekday number, retrieving all logs and notes for that date.
If no logs are retrieved and the day of the current iteration is before or equal to the current day, all unlogged tasks are logged. It uses the custom ***is_after_updated*** function from ***utils.py*** to ensure that no logs are created for dates before a task's ***last_updated*** date.
Else, if logs are retrieved, it uses the custom ***check_unlogged*** function from ***utils.py*** to log any tasks that now require logging.  
Finally, it filters every pertinent user category, and sorts all the previous data into a dictionary that corresponds to a day of the week, which is then appended into a list corresponding to the whole list, for usage within the ***weekly.html*** template.

### monthly

Displays tasks corresponding to the given month and year, and logs their state of completion.  
If the user is unlogged, it redirects the user to the login page with an error message.    
For the **GET** request method, it gets the current date and then gets the current year from it.
To prevent users from browsing dates that are yet to pass or dates before the year the app was made, it checks that the year given is not greater than the current year or prior to 2020.  
Then it tries to get the name of the given month with the custom ***to_month*** function from ***utils.py***, returning an error message if the month given is invalid.  
It proceeds to define the last month and next month variables that will be used for navigation purposes within the ***monthly.html*** template. After that it gets the current week object with the ***[isocalendar](https://docs.python.org/3/library/datetime.html?highlight=isocalendar#datetime.date.isocalendar)*** function, then gets the current week number and current weekday from it. Then it queries the database for all the notes and logs of the month, counting how many it retrieved and returning an error message if nothing was retrieved.  
It then creates a calendar object using the ***[Calendar](https://docs.python.org/3/library/calendar.html?highlight=calendar#calendar.Calendar)*** function, then, obtaining a list of all dates of the month as weeks (lists of seven date objects) with the ***[monthdatescalendar](https://docs.python.org/3/library/calendar.html?highlight=calendar#calendar.Calendar.monthdatescalendar)***, it sorts every logs and note object with its date within the month.  
It also checks for logs more than a week old, with a ***Pending(0)*** ***Status*** and changes it to ***Incomplete(2)***.  
Finally, it renders the ***monthly.html*** template.

### past_log

Displays months with existing logs, sorted by year.  
If the user is unlogged, it redirects the user to the login page with an error message.    
For the **GET** request method, it first gets the current year.
Then it queries the database for all of the user's logs, sorted by date, in descending order.
After that, it iterates over each log to make a set with all the years found in the logs.
Then it iterates over the years in the set and sorts the months that have logs inside these years.  
This ends up creating in the ***past.html*** template a list of months, sorted by year, that contain links to their equivalent route in the ***monthly*** view.

### edit_log

Displays tasks corresponding to the given day of the week and updates their state of completion.  
If the user is unlogged, it redirects the user to the login page with an error message.  
It gets the current date and converts it to a week object with the ***[isocalendar](https://docs.python.org/3/library/datetime.html?highlight=isocalendar#datetime.date.isocalendar)*** function, then gets the current year, current week and current weekday from it and tries to create a valid date object with those arguments, returning an error message is unsuccessful.  
For the **GET** request method, it first checks that the given day is not later than the current day, returning an error message if so. It also redirects the user to the ***daily_log*** view if the day given is equal to the current day.  
Then, it gets the active tasks corresponding to the given day using the custom ***get_current_tasks*** function from ***utils.py***.  
If there are no tasks assigned for the day, it queries the database for any previous logs corresponding to the current date and then it filters the categories that are relevant to the logs found. This is done because all logs are sorted by category within the ***edit.html*** template itself.  
If there are tasks assigned for the day, it queries the database for any previous logs corresponding to the current date. If there are no logs, it creates new ones by logging the tasks assigned.  
If there are logs, it checks for any unlogged tasks (in the case of new tasks added, or other tasks being modified) and creates new logs where needed with the custom ***check_unlogged*** function from ***utils.py***. Then it updates the logs queryset, and filters the categories that are relevant to the logs found.  
Finally it defines all possible statuses of completion in a list of dictionaries, queries the database for the note corresponding to the current date, and renders the page with categories, logs, weekday, statuses, note and weekday Number defined in the context.  
For the **POST** request method, it queries the database for any previous logs corresponding to the current date. If there are no logs, an error message is displayed.
Else, it iterates over every log and uses their ***id*** to request the value (***Status*** of completion) from the pertinent form fields if they exist.
If the ***Status*** retrieved from the form field is not equal to the one in the log and is a valid value (Integer with a range from 0 to 3), it updates the log with the new ***Status*** of completion.
Else, it moves on to the next log without updating.
Finally, it requests the note from the textfield in the form, compares it to the note found if there is one and updates it if necessary, or creates a new one if there was no note found (if the note in the textfield was not an empty string), displaying a success message.

### progress

Displays a page that shows log statistics.  
If the user is unlogged, it redirects the user to the login page with an error message.   
For the **GET** request method, it renders the ***progress.html*** template which contains a single-field form with a select that offers multiple queries to retrieve logs information.  
For the **POST** request method, it retrieves the value of the query select, returning an error message if there is no value. Then it converts the value of string type (corresponding to a number of days) to integer. Using this integer, a range of dates is created to query the database for logs within that range. The range excludes the current day, so in the case of a 7 days range, it would only consider 7 days from yesterday.  
It then sorts all tasks corresponding to the logs by category. Then it creates a dictionary that filters the logs by status and task, counting the logs. This creates a list of statistics that indicate the number of logs marked as ***Complete***, ***Incomplete***, ***Ignored*** and ***Pending***, by task.

### about

Displays a page that shows general information about the app.

### settings_profile

Displays profile related settings that lets user change their ***Username***, ***First Name***, ***Last Name*** and ***Email***.

### settings_timezone

Displays time zone related settings that let the users change their time zone.  

### redir

Redirects users to a proper view from a broken route.  

# Utils

## utils.py

Declares a handful of helper functions that are used in ***views.py***.

### validate_username

Checks the username string provided against **Django**'s [username specifications](https://docs.djangoproject.com/en/3.1/ref/contrib/auth/#django.contrib.auth.models.User.username), returning a dictionary with a result of false and a error message if the username is invalid, or a result of true and no message if is valid.

### get_current_tasks

Given a weekday number, returns the corresponding active tasks or None if there are none.  

### is_after_updated

Checks whether a given log date is equal or after the date the given task was last updated.  
This ensures within the pertinent views that no new logs will be created for a past date if a task has been modified after that date.  

### check_unlogged

Given a queryset of tasks, a queryset of logs and a log date, checks for unlogged tasks and creates new logs where needed, returning true. Returns false if no new logs are created.  

### to_month

Returns a string with the name of the month, given its number.  

### to_weekday

Returns a string with the day of the week's name, given its number.  

# Models

## models.py

### Task

- **name**: A CharField with a maximum length of 64 characters that represents the name of the task.
- **user**: A ForeignKey that is related to the AUTH_USER_MODEL model and represents the user the task belongs to.
- **monday**: A BooleanField that represents whether the task is performed on Mondays.
- **tuesday**: A BooleanField that represents whether the task is performed on Tuesdays.
- **wednesday**: A BooleanField that represents whether the task is performed on Wednesdays.
- **thursday**: A BooleanField that represents whether the task is performed on Thursdays.
- **friday**: A BooleanField that represents whether the task is performed on Fridays.
- **saturday**: A BooleanField that represents whether the task is performed on Saturdays.
- **sunday**: A BooleanField that represents whether the task is performed on Sundays.
- **is_active**: A BooleanField that represents whether the task is active and should be able to be logged. Is set to true by default.
- **last_updated**: A DateField that represents the date that the task was last updated. Is set to the users local date. according to their timezone, by default.

### Category

- **name**: A CharField with a maximum length of 64 characters that represent the name of the category.
- **user**: A ForeignKey that is related to the AUTH_USER_MODEL model and represents the user the category belongs to.
- **tasks**: A ManyToManyField that is related to the task model and indicates the tasks that belong to the category.
- **last_updated**: A DateField that represents the date that the category was last updated. Is set to the users local date. according to their timezone, by default.

### Settings

- **user**: A ForeignKey that is related to the AUTH_USER_MODEL model and represents the user the Settings belong to.
- **timezone**: A CharField with a maximum length of 30 characters that represents the name of a time zone.

### Log

- **user**: A ForeignKey that is related to the AUTH_USER_MODEL model and represents the user the log belongs to.
- **date**: A DateField that represents the date that the log was created. Is set to the users local date. according to their timezone, by default.
- **task**: A ForeignKey that is related to the task model and represents the task the log belongs to.
- **status**: A SmallIntegerField that represents the status of completion of the log. Is set to ***Pending (0)***  by default.

### Note

- **user**: A ForeignKey that is related to the AUTH_USER_MODEL model and represents the user the note belongs to.
- **date**: A DateField that represents the date that the log was created. Is set to the users local date. according to their timezone, by default.
- **text**: A TextField that represents the note's text.

# Templates

## layout.html

Template file that contains the header elements, navigation bar and overall structure that will be used by every other HTML file with the help of **[Django](https://www.djangoproject.com/)**'s ***[templating language](https://docs.djangoproject.com/en/3.1/ref/templates/language/)***.

## index.html

Extends ***layout.html*** and displays a splash page with information about the usage and credits of **TasksDaily**.

## menu.html

Extends ***layout.html*** and displays a page with elements that link the user to other useful views.

## register.html

Extends ***layout.html*** and displays a form that the user can fill with their desired Username, Email, First Name (optionally), Last Name (optionally), Password and a Password Confirmation.  
It sends the submitted data to the ***register*** view via POST method.

## login.html

Extends ***layout.html*** and displays a form that lets users log in to the app with a Username and Password if their account information is in the database.  
It sends the submitted data to the ***login_view*** view via **POST** method.

## add.html

Extends ***layout.html*** and displays a form that lets user create a new task and either create a new category, or select an existing one.  
It sends the submitted data to the ***add_task*** view via **POST** method.

## overview.html

Extends ***layout.html*** and displays a table of tasks and a table of categories within a form that lets users modify information about their tasks and categories.  
It sends the submitted data to the ***tasks_overview*** view via **POST** method.

## delete_task.html

Extends ***layout.html*** and displays a form that lets users confirm that they want to delete a task.  
It sends the submitted data to the ***delete_task*** view via **POST** method.

## delete_category.html

Extends ***layout.html*** and displays a form that lets users confirm that they want to delete a category.  
It sends the submitted data to the ***delete_category*** view via **POST** method.

## daily.html

Extends ***layout.html*** and displays a form that lets users change the status of completion of the logs from the current day.  
It sends the submitted data to the ***daily_log*** view via **POST** method.

## weekly.html

Extends ***layout.html*** and displays all logs (sorted by category) from the current week, sorted by day of the week.

## monthly.html

Extends ***layout.html*** and displays all logs (sorted by category) from the current month, sorted by day.

## past.html

Extends ***layout.html*** and displays a list of years that each contain a list of months with logs, which are links that redirect the user to a valid ***monthly*** view route.

## edit.html

Extends ***layout.html*** and displays a form that lets users change the status of completion of the logs from the given day.  
It sends the submitted data to the ***edit_log*** view via **POST** method.

## progress.html

Extends ***layout.html*** and displays a form that lets users choose a range of days to query the database with.  
It sends the submitted data to the ***progress*** view via **POST** method.

## progress_result.html

Extends ***layout.html*** and displays a list of statistics sorted by task. If users have JavaScript enabled in their browser, the list is removed and a number of **[Google Charts](https://developers.google.com/chart)** ***[Column Chart](https://developers.google.com/chart/interactive/docs/gallery/columnchart)*** replace it, using the data.

## about.html

Extends ***layout.html*** and displays a splash page with information about the usage and credits of **TasksDaily**.

## settings.html

Extends ***layout.html*** and displays the sidebar items that will be used by ***profile.html*** and ***timezone.html***.

## profile.html

Extends ***layout.html*** and ***settings.html***. It displays a form that lets users modify their ***Username***, ***First Name***, ***Last Name*** and ***Email*** information.  
It sends the submitted data to the ***settings_profile*** view via **POST** method.

## timezone.html

Extends ***layout.html*** and ***settings.html***. It displays a form that lets users modify their ***timezone*** information.  
It sends the submitted data to the ***settings_timezone*** view via **POST** method.

# Static Files

## JavaScript

### expandable.js

Changes the image button or icon for the collapsible elements when clicked.

### register.js

Disables the submit button until basic form field validation is passed and shows helpful tips when a field is focused.

### login.js

Disables the submit button until basic form field validation is passed.

### add.js

Disables the submit button until basic form field validation is passed and shows helpful tips when a field is focused.

### overview.js

Disables the submit button until basic form field validation is passed.

### daily.js

Disables the submit button until basic form field validation is passed and hides the select elements, replacing them with clickable icons that change the status of completion of a task.

### progress.js

Disables the submit button until basic form field validation is passed.

### progress_result.js

Removes the list of statistics and replaces it with a **[Google Charts](https://developers.google.com/chart)**'s ***[Column Chart](https://developers.google.com/chart/interactive/docs/gallery/columnchart)*** for each task.

### profile.js

Disables the submit button until basic form field validation is passed and shows helpful tips when a field is focused.

### timezone.js

Disables the submit button until basic form field validation is passed.

## CSS

### default.scss

Customizes bootstrap classes and elements used within the HTML files with the Sass language.

### default.css

Compiled version of the ***default.scss*** file.

# Credits and Resources

- **CSS Library:** [Bootstrap 4](https://getbootstrap.com/)
- **Color Scheme:** [Coolors](https://coolors.co/)
- **Icons:** [Iconmonstr](https://iconmonstr.com/)
- **Filter Generation:** [CSS Filter Generator](https://codepen.io/sosuke/pen/Pjoqqp)

Made by: **[Hector Gonzalez](https://gonvalhector.github.io/)**
