from calendar import Calendar
from datetime import date, timedelta
from pytz import common_timezones

from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout, get_user
from django.contrib import messages
from .models import Category, Task, Settings, Log, Note
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .utils import validate_username, get_current_tasks, check_unlogged, to_month, is_after_updated, to_weekday


# Create your views here.
def index(request):
    """Displays splash page if user is logged out, else, displays a menu."""

    # When the user is redirected or they follow a link
    if request.method == "GET":
        # Render a menu page if the user is logged in
        if request.user.is_authenticated:
            # Retrieve current date information for menu elements
            curr_date = timezone.localdate()
            curr_m = curr_date.month
            curr_y = curr_date.year
            return render(request, "tasks/menu.html", {"curr_m": curr_m, "curr_y": curr_y})
        # Render a splash page if the user is logged out or unregistered
        else:
            return render(request, "tasks/index.html")


def register(request):
    """Displays user registration form and registers a new user."""

    # When the user is redirected or they follow a link
    if request.method == "GET":
        # If the user is currently logged in
        if request.user.is_authenticated:
            messages.add_message(request, messages.WARNING, "You are logged in. Log out first to create a new account.")
        # Render registration page
        return render(request, "tasks/register.html")
    # When the user submits a form (POST)
    else:
        # If the user is currently logged in
        if request.user.is_authenticated:
            messages.add_message(request, messages.ERROR, "Please, log out before registering a new account.")
            return HttpResponseRedirect(reverse("register"))
        # Validate username
        username = request.POST["username"]
        validation = validate_username(username)
        if validation["result"] == False:
            messages.add_message(request, messages.ERROR, validation["message"])
            return HttpResponseRedirect(reverse("register"))
        # Validate optional first name
        first_name = request.POST["first_name"]
        if first_name:
            if len(first_name) > 150:
                messages.add_message(request, messages.ERROR, "Please, provide a first name with 150 characters or fewer.")
                return HttpResponseRedirect(reverse("register"))
        # Validate optional last name
        last_name = request.POST["last_name"]
        if last_name:
            if len(last_name) > 150:
                messages.add_message(request, messages.ERROR, "Please, provide a last name with 150 characters or fewer.")
                return HttpResponseRedirect(reverse("register"))
        # Validate email
        email = request.POST["email"]
        if not email:
            messages.add_message(request, messages.ERROR, "Please, provide an email.")
            return HttpResponseRedirect(reverse("register"))
        try:
            validate_email(email)
        except ValidationError:
            messages.add_message(request, messages.ERROR, "Invalid email.")
            return HttpResponseRedirect(reverse("register"))
        # Validate Password
        password = request.POST["password"]
        password_confirm = request.POST["password_confirm"]
        if not password:
            messages.add_message(request, messages.ERROR, "Please, provide a password.")
            return HttpResponseRedirect(reverse("register"))
        if not password_confirm:
            messages.add_message(request, messages.ERROR, "Please, provide a password confirmation.")
            return HttpResponseRedirect(reverse("register"))
        if password != password_confirm:
            messages.add_message(request, messages.ERROR, "Please, provide a password confirmation that matches the password.")
            return HttpResponseRedirect(reverse("register"))
        try:
            validate_password(password)
        except ValidationError as errors:
            for e in errors:
                messages.add_message(request, messages.ERROR, e)
            return HttpResponseRedirect(reverse("register"))
        # Check if the user already exists in the database
        try:
            if User.objects.get(username=username) or User.objects.get(email=email):
                messages.add_message(request, messages.ERROR, "That username or email have already been registered.")
                return HttpResponseRedirect(reverse("register"))
        except User.DoesNotExist:
            # Register new user
            newuser = User.objects.create_user(username, email, password)
            if first_name:
                newuser.first_name = first_name
            if last_name:
                newuser.last_name = last_name
            newuser.save()
            # Set default user settings
            user_settings = Settings(user=newuser, timezone="UTC")
            user_settings.save()
            # Log user in
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                # Redirect to timezone settings
                messages.add_message(request, messages.SUCCESS, "Registered succesfully! Please personalize your time zone settings.")
                return HttpResponseRedirect(reverse("timezone"))


def login_view(request):
    """Displays the login page and logs users in."""

    # When the user is redirected or they follow a link
    if request.method == "GET":
        return render(request, "tasks/login.html")
    # When the user submits a form (POST)
    else:
        # If the user is currently logged in
        if request.user.is_authenticated:
            messages.add_message(request, messages.ERROR, "Please, log out first.")
            return HttpResponseRedirect(reverse("login"))
        username = request.POST["username"]
        if not username:
            messages.add_message(request, messages.ERROR, "Please, provide a username.")
            return HttpResponseRedirect(reverse("login"))
        password = request.POST["password"]
        if not password:
            messages.add_message(request, messages.ERROR, "Please, provide a password.")
            return HttpResponseRedirect(reverse("login"))
        user = authenticate(request, username=username, password=password)
        if user is None:
            messages.add_message(request, messages.ERROR, "User could not be authenticated.")
            return HttpResponseRedirect(reverse("login"))
        else:
            login(request, user)
            # Query user settings
            user_settings = Settings.objects.get(user=user)
            # Set old timezone settings
            tz = user_settings.timezone
            # Update session timezone
            request.session["django_timezone"] = tz
            messages.add_message(request, messages.SUCCESS, "Logged in succesfully!")
            return HttpResponseRedirect(reverse("index"))


def logout_view(request):
    """Logs users out."""

    # When the user is redirected or they follow a link
    if request.method == "GET":
        logout(request)
        messages.add_message(request, messages.SUCCESS, "Logged out succesfully.")
        return HttpResponseRedirect(reverse("login"))


def add_task(request):
    """Displays a page with a form to add a new task and/or category."""

    # If the user is logged in
    if request.user.is_authenticated:
        # Get User object
        user = get_user(request)
        # When the user is redirected or they follow a link
        if request.method == "GET":
            categories = Category.objects.filter(user=user)
            return render(request, "tasks/add.html", {"categories": categories})
        # When the user submits a form (POST)
        else:
            # Request input from form fields
            category_select = None
            new_category = False
            # If the user has already made categories
            if request.POST.get("category_select", None):
                # Request value from category_select
                category_select = request.POST.get("category_select", None)
            # Request value from category_name
            category_name = request.POST["category_name"]
            # Request value from task_name
            task_name = request.POST["task_name"]
            # If the user selects a category
            if category_select:
                # Query the db for the category by user and category selected
                category = Category.objects.get(user=user, id=category_select)
                if not category:
                    messages.add_message(request, messages.ERROR, "The category selected was not found.")
                    return HttpResponseRedirect(reverse("add_task"))
            # If the user creates a new category
            else:
                # Validate the name of the new category
                # If there is no category name
                if category_name == "":
                    messages.add_message(request, messages.ERROR, "Please, write the name for a new category.")
                    return HttpResponseRedirect(reverse("add_task"))
                # If the category name is more than 64 characters
                elif len(category_name) > 64:
                    messages.add_message(request, messages.ERROR, "Please, do not exceed the 64 character limit for the new category's name.")
                    return HttpResponseRedirect(reverse("add_task"))
                # Check if the user has a category with that name already
                try:
                    category = Category.objects.get(user=user, name=category_name)
                except ObjectDoesNotExist as DoesNotExist:
                    category = None
                if category:
                    messages.add_message(request, messages.ERROR, "There is already a category with that name.")
                    return HttpResponseRedirect(reverse("add_task"))
                else:
                    # Create new category
                    new_category = True
            # Validate new task
            # If there is no task name
            if task_name == "":
                messages.add_message(request, messages.ERROR, "Please, write the name for a new task.")
                return HttpResponseRedirect(reverse("add_task"))
            # If the task name is more than 64 characters
            elif len(task_name) > 64:
                messages.add_message(request, messages.ERROR, "Please, do not exceed the 64 character limit for the new task's name.")
                return HttpResponseRedirect(reverse("add_task"))
            # Check if the user has a task with that name already
            try:
                task = Task.objects.get(user=user, name=task_name)
            except ObjectDoesNotExist as DoesNotExist:
                task = None
            if task:
                messages.add_message(request, messages.ERROR, "There is already a task with that name.")
                return HttpResponseRedirect(reverse("add_task"))
             # Get days of the week
            else:
                # List to hold booleans
                days_bools = []
                # Count the number of days set to false
                f_counter = 0
                # Iterate over checkbox fields
                days_n = 7
                for i in range(days_n):
                    # If the checbox is checked
                    if request.POST.get(f"day{i}", None) == "checked":
                        day_bool = True
                    # If the checkbox is unchecked
                    else:
                        day_bool = False
                        # Add 1 to false counter
                        f_counter += 1
                    # Add boolean to list
                    days_bools.append(day_bool)
                # If all days are set to False
                if f_counter == days_n:
                    messages.add_message(request, messages.ERROR, "You must assign the new task to at least one day of the week.")
                    return HttpResponseRedirect(reverse("add_task"))
                else:
                    # If the user created a new category
                    if new_category == True:
                        # Add new category
                        category = Category(user=user, name=category_name)
                        category.save()
                    # Add task to db
                    task = Task(user=user, name=task_name, monday=days_bools[0],
                    tuesday=days_bools[1], wednesday=days_bools[2],
                    thursday=days_bools[3], friday=days_bools[4], saturday=days_bools[5],
                    sunday=days_bools[6], is_active=True)
                    task.save()
                    # Add task to category in db
                    category.tasks.add(task)
                    category.save()
                    messages.add_message(request, messages.SUCCESS, "New task added succesfully!")
                    return HttpResponseRedirect(reverse("add_task"))
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def tasks_overview(request):
    """Displays a page that lets users modify their tasks and categories."""

    # When the user is logged in
    if request.user.is_authenticated:
        user = get_user(request)
        tasks = Task.objects.filter(user=user)
        categories = Category.objects.filter(user=user)
        # When the user is redirected or they follow a link
        if request.method == "POST":
            # Get current date
            curr_date = timezone.localdate()
            # Determine wheter any updates were made at all
            any_updated = False
            # Update tasks
            for task in tasks:
                task_updated = False
                # Define task values as they are currently set in db
                og_task_name = task.name
                og_category = task.category.first().id
                og_weekday_values = [task.monday, task.tuesday, task.wednesday, task.thursday, task.friday, task.saturday, task.sunday]
                og_is_active = task.is_active
                # Get the new task name from the request object
                new_task_name = request.POST.get(f"task_{task.id}_name", None)
                if not new_task_name == og_task_name:
                    # If there is no new task name
                    if new_task_name == "":
                        messages.add_message(request, messages.ERROR, "Please, write a new name for the task.")
                        return HttpResponseRedirect(reverse("tasks_overview"))
                    # If the new task name is more than 64 characters
                    elif len(new_task_name) > 64:
                        messages.add_message(request, messages.ERROR, "Please, do not exceed the 64 character limit for the new name of the task.")
                        return HttpResponseRedirect(reverse("tasks_overview"))
                    # Update task
                    task.name = new_task_name
                    task_updated = True
                # Get the new task category from the request object
                new_category = request.POST.get(f"task_{task.id}_category", None)
                if not new_category == og_category:
                    task.category.set([categories.get(id=new_category)])
                    task_updated = True
                # Get the new weekday checkbox values from the request object
                new_weekday_values = []
                days_n = 7
                # Declare unchecked checkboxes counter
                f_counter = 0
                # Iterate over checkboxes
                for i in range(days_n):
                    # Determine whether weekday checkbox is checked
                    weekday_check = True if request.POST.get(f"task_{task.id}_day{i}", None) == "checked" else False
                    # If the checkbox is unchecked
                    if weekday_check == False:
                        # Add to the f_counter
                        f_counter += 1
                    # If the checkbox is checked
                    new_weekday_values.append(weekday_check)
                    # Update weekday in task if the value differs
                    if not new_weekday_values[i] == og_weekday_values[i]:
                        if i == 0:
                            task.monday = new_weekday_values[i]
                        elif i == 1:
                            task.tuesday = new_weekday_values[i]
                        elif i == 2:
                            task.wednesday = new_weekday_values[i]
                        elif i == 3:
                            task.thursday = new_weekday_values[i]
                        elif i == 4:
                            task.friday = new_weekday_values[i]
                        elif i == 5:
                            task.saturday = new_weekday_values[i]
                        else:
                            task.sunday = new_weekday_values[i]
                        task_updated = True
                # If there are no days where the task is performed and the task is active
                if f_counter == days_n and task.is_active == True:
                    messages.add_message(request, messages.ERROR, "Active tasks must be performed at least one day of the week.")
                    return HttpResponseRedirect(reverse("tasks_overview"))
                # Determine whether the task is active checkbox is checked or unchecked
                new_is_active = True if request.POST.get(f"task_{task.id}_is_active", None) == "checked" else False
                # Update task is active field if the value differs
                if not new_is_active == og_is_active:
                    task.is_active = new_is_active
                    task_updated = True
                # Update task
                if task_updated:
                    # Update last time task was updated
                    task.last_updated = curr_date
                    task.save()
                    any_updated = True
            # Update categories
            for category in categories:
                # Define category values as they are currently set in db
                og_category_name = category.name
                # Get the category values from the request object
                new_category_name = request.POST.get(f"category_{category.id}_name", None)
                if not new_category_name == og_category_name:
                    # If there is no new category name
                    if new_category_name == "":
                        messages.add_message(request, messages.ERROR, "Please, write a new name for the category.")
                        return HttpResponseRedirect(reverse("tasks_overview"))
                    # If the new category name is more than 64 characters
                    elif len(new_category_name) > 64:
                        messages.add_message(request, messages.ERROR, "Please, do not exceed the 64 character limit for the new name of the category.")
                        return HttpResponseRedirect(reverse("tasks_overview"))
                    # Update category
                    category.name = new_category_name
                    category.last_updated = curr_date
                    category.save()
                    any_updated = True
            if any_updated:
                messages.add_message(request, messages.SUCCESS, "Tasks updated succesfully.")
            else:
                messages.add_message(request, messages.INFO, "Tasks were not updated.")
        return render(request, "tasks/overview.html", {"tasks": tasks, "categories": categories})
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def delete_task(request, task_id):
    """Display a confirmation page that lets users delete a task."""

    # If the user is logged in
    if request.user.is_authenticated:
        # Get User object
        user = get_user(request)
        # When the user is redirected or they follow a link
        if request.method == "GET":
            try:
                task = Task.objects.get(user=user, id=task_id)
            except ObjectDoesNotExist as DoesNotExist:
                task = None
            if not task:
                messages.add_message(request, messages.ERROR, "Task could not be found.")
                return HttpResponseRedirect(reverse("index"))
            logs = Log.objects.filter(task=task)
            if logs:
                logs_n = logs.count()
                range_start = logs.earliest("date").date
                range_end = logs.latest("date").date
            else:
                logs_n = 0
                range_start = None
                range_end = None
            messages.add_message(request, messages.WARNING, "Deleting a task deletes all logs and data associated with it.")
            return render(request, "tasks/delete_task.html", {"task": task, "task_id": task_id, "logs_n": logs_n, "range_start": range_start, "range_end": range_end})
        # When the user submits a form (POST)
        else:
            task_id = request.POST.get("task_select", None)
            try:
                task = Task.objects.get(user=user, id=task_id)
            except ObjectDoesNotExist as DoesNotExist:
                task = None
            if not task:
                messages.add_message(request, messages.ERROR, "Task could not be deleted.")
                return HttpResponseRedirect(reverse("index"))
            task.delete()
            messages.add_message(request, messages.SUCCESS, "Task deleted succesfully!")
            return HttpResponseRedirect(reverse("tasks_overview"))
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def delete_category(request, category_id):
    """Display a confirmation page that lets users delete a category."""

    # If the user is logged in
    if request.user.is_authenticated:
        # Get User object
        user = get_user(request)
        # When the user is redirected or they follow a link
        if request.method == "GET":
            try:
                category = Category.objects.get(user=user, id=category_id)
            except ObjectDoesNotExist as DoesNotExist:
                category = None
            if not category:
                messages.add_message(request, messages.ERROR, "Category could not be found.")
                return HttpResponseRedirect(reverse("index"))
            tasks_n = category.tasks.all().count()
            messages.add_message(request, messages.WARNING, "Deleting a category deletes all tasks, logs and data associated with it.")
            return render(request, "tasks/delete_category.html", {"category": category, "category_id": category_id, "tasks_n": tasks_n})
        # When the user submits a form (POST)
        else:
            category_id = request.POST.get("category_select", None)
            try:
                category = Category.objects.get(user=user, id=category_id)
            except ObjectDoesNotExist as DoesNotExist:
                category = None
            if not category:
                messages.add_message(request, messages.ERROR, "Category could not be deleted.")
                return HttpResponseRedirect(reverse("index"))
            # Delete tasks associated with the category
            for task in category.tasks.all():
                task.delete()
            category.delete()
            messages.add_message(request, messages.SUCCESS, "Category deleted succesfully!")
            return HttpResponseRedirect(reverse("tasks_overview"))
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def daily_log(request):
    """Displays tasks corresponding to the current day and logs their state of completion."""

    # If the user is logged in
    if request.user.is_authenticated:
        # Get user
        user = get_user(request)
        # Get current date
        curr_date = timezone.localdate()
        # Get current weekday
        today = curr_date.today().weekday()
        # When the user is redirected or they follow a link
        if request.method == "GET":
            # Query db for the active tasks corresponding to current weekday
            tasks = get_current_tasks(today, user)
            # If there a no tasks assigned for the day
            if not tasks:
                categories = []
                # Query db for logs of the day
                try:
                    logs = Log.objects.filter(user=user, date=curr_date)
                except ObjectDoesNotExist as DoesNotExist:
                    logs = None
                # If there are logs
                if logs:
                    # Query db for user categories
                    try:
                        all_categories = Category.objects.filter(user=user)
                    except ObjectDoesNotExist as DoesNotExist:
                        all_categories = None
                    if all_categories:
                        # Filter pertinent categories
                        for category in all_categories:
                            for log in logs:
                                if log.task in category.tasks.all():
                                    categories.append(category)
                                    break
            # If there are tasks assigned for the day
            else:
                # Query db for logs of the day
                try:
                    logs = Log.objects.filter(user=user, date=curr_date)
                except ObjectDoesNotExist as DoesNotExist:
                    logs = None
                # If there are no logs for today
                if not logs:
                    # Create new logs
                    logs = []
                    for task in tasks:
                        log = Log(user=user, task=task)
                        log.save()
                        logs.append(log)
                # If there are logs
                else:
                    if check_unlogged(tasks, logs, user, curr_date) == True:
                        # Update logs
                        logs = Log.objects.filter(user=user, date=curr_date)
                # Query db for user categories
                try:
                    all_categories = Category.objects.filter(user=user)
                except ObjectDoesNotExist as DoesNotExist:
                    all_categories = None
                if all_categories:
                    # Filter pertinent categories
                    categories = []
                    for category in all_categories:
                        for log in logs:
                            if log.task in category.tasks.all():
                                categories.append(category)
                                break
            # Define possible statuses
            statuses = [
            {"value": 0, "name": "Pending"},
            {"value": 1, "name": "Complete"},
            {"value": 2, "name": "Incomplete"},
            {"value": 3, "name": "Ignored"}
            ]
            # Query db for note of the day
            try:
                note = Note.objects.get(user=user, date=curr_date)
            except ObjectDoesNotExist as DoesNotExist:
                note = None
            # Define context
            context = {
            "categories": categories,
            "weekday": curr_date.today(),
            "logs": logs,
            "statuses": statuses,
            "note": note
            }
            return render(request, "tasks/daily.html", context)
        # When the user submits a form (POST)
        else:
            # Query db for logs of the day
            try:
                logs = Log.objects.filter(user=user, date=curr_date)
            except ObjectDoesNotExist as DoesNotExist:
                logs = None
            # If there are no logs for today
            if not logs:
                messages.add_message(request, messages.ERROR, "Could not find any logs to update.")
                return HttpResponseRedirect(reverse("daily"))
            # Get field values
            for log in logs:
                # If the form field exists
                if request.POST.get(f"{log.task.id}", None):
                    # Request status of task
                    status = request.POST.get(f"{log.task.id}", None)
                    # If new status of task that is not equal to last status or out of range
                    if status and not status == log.status and not int(status) > 3 and not int(status) < 0 :
                        # Update status of task in log
                        log.status = status
                        log.save()
                    # If status is the same
                    else:
                        # Continue to next task in log
                        continue
                # If the form field does not exist
                else:
                    messages.add_message(request, messages.ERROR, "Could not update tasks.")
                    return HttpResponseRedirect(reverse("daily"))
            # Get note if form field exists and it is not empty
            if request.POST.get("note", None) and request.POST.get("note", None) != "":
                # Get note from textfield
                note = request.POST.get("note", None)
                # Query db for note of the day
                try:
                    db_note = Note.objects.get(user=user, date=curr_date)
                except ObjectDoesNotExist as DoesNotExist:
                    db_note = None
                # If no note in db
                if not db_note:
                    Note.objects.create(user=user, date=curr_date, text=note)
                # If note in db is unlike note in textfield
                elif db_note != note:
                    db_note.text = note
                    db_note.save()
            # Redirect user to daily log
            messages.add_message(request, messages.SUCCESS, "Daily log updated succesfully!")
            return HttpResponseRedirect(reverse("daily"))
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def weekly_log(request):
    """Displays tasks corresponding to the current week and logs their state of completion."""

    # If the user is logged in
    if request.user.is_authenticated:
        # When the user is redirected or they follow a link
        if request.method == "GET":
            # Get user
            user = get_user(request)
            # Get current date
            curr_date = timezone.localdate()
            # Get current week object
            week_obj = curr_date.isocalendar()
            # Define current year
            curr_y = week_obj[0]
            # Define current week
            curr_w = week_obj[1]
            # Define current day
            curr_d = curr_date.weekday()
            # Define list of dicts to store log data by day of the week
            week_logs = []
            for i in range(7):
                # Get tasks for weekday
                tasks = get_current_tasks(i, user)
                # Get the date for each day of the current week
                weekday_date = date.fromisocalendar(curr_y, curr_w, i + 1)
                # Query db for logs
                try:
                    logs = Log.objects.filter(user=user, date=weekday_date)
                except ObjectDoesNotExist as DoesNotExist:
                    logs = None
                # Query db for notes
                try:
                    note = Note.objects.get(user=user, date=weekday_date)
                except ObjectDoesNotExist as DoesNotExist:
                    note = None
                # If there are no logs at all from date
                if not logs and i <= curr_d:
                    # If there are tasks that need logging
                    if tasks:
                        logs = []
                        for task in tasks:
                            if is_after_updated(weekday_date, task) == True:
                                log = Log(user=user, task=task, date=weekday_date)
                                log.save()
                                logs.append(log)
                # If there are logs from date
                elif logs and i <= curr_d:
                        # If there were tasks that needed updating
                        if check_unlogged(tasks, logs, user, weekday_date) == True:
                            # Update logs
                            logs = Log.objects.filter(user=user, date=weekday_date)
                # Filter pertinent categories
                categories = []
                # Query db for user categories
                all_categories = Category.objects.filter(user=user)
                 # Filter pertinent categories
                for category in all_categories:
                    for log in logs:
                        if log.task in category.tasks.all():
                            categories.append(category)
                            break
                day = {"day": to_weekday(i), "logs": logs, "note": note, "date": weekday_date, "weekday_n": i, "categories": categories}
                week_logs.append(day)
            return render(request, "tasks/weekly.html", {"week_logs": week_logs, "curr_d": curr_d})

    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def monthly(request, year_n, month_n):
    """Displays tasks corresponding to the given month and year, and logs their state of completion."""

    # If the user is logged in
    if request.user.is_authenticated:
        # When the user is redirected or they follow a link
        if request.method == "GET":
            # Get user object and current date
            user = get_user(request)
            # Get current date
            curr_date = timezone.localdate()
            curr_y = curr_date.year
            # Prevent the user from browsing future dates
            if year_n > curr_y:
                messages.add_message(request, messages.ERROR, "That date is yet to pass.")
                return HttpResponseRedirect(reverse("index"))
            elif year_n < 2020:
                messages.add_message(request, messages.ERROR, "That date is long gone.")
                return HttpResponseRedirect(reverse("index"))
            # Get month's name
            try:
                month = to_month(month_n)
            except IndexError:
                messages.add_message(request, messages.ERROR, "That month does not exist.")
                return HttpResponseRedirect(reverse("index"))
            # Define last and next month variables
            if month_n == 1:
                last_y = year_n - 1
                last_m = 12
                next_y = year_n
                next_m = month_n + 1
            elif month_n > 1 and month_n < 12:
                last_y = year_n
                last_m = month_n - 1
                next_y = year_n
                next_m = month_n + 1
            elif month_n == 12:
                last_y = year_n
                last_m = month_n - 1
                next_y = year_n + 1
                next_m = 1
            last_month = to_month(last_m)
            next_month = to_month(next_m)
            # Get current week object
            week_obj = curr_date.isocalendar()
            # Define current week number
            curr_w = week_obj[1]
            # Define current day
            curr_d = curr_date.weekday()
            # Request logs and notes from month
            all_logs = Log.objects.filter(user=user, date__year=year_n).filter(date__month=month_n).order_by("date")
            all_notes = Note.objects.filter(user=user, date__year=year_n).filter(date__month=month_n).order_by("date")
            # Define original number of logs and notes obtained
            try:
                all_logs_n = len(all_logs)
            except ValueError:
                messages.add_message(request, messages.ERROR, "Could not retrieve logs from that date.")
                return HttpResponseRedirect(reverse("index"))
            try:
                all_notes_n = len(all_notes)
            except ValueError:
                messages.add_message(request, messages.ERROR, "Could not retrieve notes from that date.")
                return HttpResponseRedirect(reverse("index"))
            # Create calendar object with Monday as the first day of the week
            c = Calendar(0)
            # Get list of all dates of the month as weeks
            mdc = c.monthdatescalendar(year_n, month_n)
            # Correspond logs and notes to list of dates
            new_mdc = []
            # Iterate over weeks in list
            for week in mdc:
                new_week = []
                # Check if week number iterated is the current week number
                new_week_obj = week[0].isocalendar()
                new_w_n = new_week_obj[1]
                # Define as being this week or not
                this_week = True if new_w_n == curr_w else False
                # Iterate over days in week
                for i in range(len(week)):
                    # Get tasks corresponding to the weekday
                    tasks = get_current_tasks(i, user)
                    # If week iterated is the current week
                    weekday_n = i if this_week else None
                    new_day = {"date": week[i], "logs": [], "note": None, "weekday_n": weekday_n, "categories": None}
                    log_counter = 0
                    # Iterate over logs
                    for log in all_logs:
                        # If the log corresponds to the date
                        if log.date == new_day["date"]:
                            # If the log date is from a previous week and the log status is pending
                            if not this_week and log.status == 0:
                                # Update state from pending to incomplete
                                log.status = 2
                                log.save()
                            new_day["logs"].append(log)
                        # If it doesn't
                        else:
                            log_counter += 1
                    # If no log corresponded to the date
                    if log_counter == all_logs_n and new_day["date"].month == month_n and new_w_n <= curr_w and year_n == curr_y:
                        # Check that we don't log anything past the current day
                        if new_w_n == curr_w and i > curr_d:
                            new_day["logs"] = None
                        else:
                            if tasks:
                                for task in tasks:
                                    # If the task can be logged
                                    if is_after_updated(new_day["date"], task) == True:
                                        # Log task
                                        status = 2 if new_w_n < curr_w else 0
                                        log = Log(user=user, task=task, date=new_day["date"], status=status)
                                        log.save()
                                        new_day["logs"].append(log)
                    # Check for unlogged tasks anyway
                    elif log_counter != all_logs_n and new_day["date"].month == month_n and new_w_n <= curr_w and year_n == curr_y:
                        # Check that we don't log anything past the current day
                        if new_w_n == curr_w and i > curr_d:
                            logs = None
                        else:
                            # If there were tasks that needed updating
                            if check_unlogged(tasks, all_logs, user, new_day["date"]) == True:
                                # Get updated logs
                                logs = Log.objects.filter(user=user, date=new_day["date"])
                                new_day["logs"] = logs
                    # Iterate over notes
                    for note in all_notes:
                        if note.date == new_day["date"]:
                            new_day["note"] = note.text
                    # Filter pertinent categories
                    categories = []
                    if new_day["logs"]:
                        # Query db for user categories
                        all_categories = Category.objects.filter(user=user)
                        for category in all_categories:
                            for log in new_day["logs"]:
                                if log.task in category.tasks.all():
                                    categories.append(category)
                                    break
                    new_day["categories"] = categories
                    new_week.append(new_day)
                new_mdc.append(new_week)

            context = {
                "curr_d": curr_d,
                "curr_y": curr_y,
                "year_n": year_n,
                "month": month,
                "month_n": month_n,
                "last_y": last_y,
                "last_m": last_m,
                "last_month": last_month,
                "next_y": next_y,
                "next_m": next_m,
                "next_month": next_month,
                "new_mdc": new_mdc
            }
            return render(request, "tasks/monthly.html", context)
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def past_log(request):
    """Displays months with existing logs, sorted by year."""

    # If the user is logged in
    if request.user.is_authenticated:
        # When the user is redirected or they follow a link
        if request.method == "GET":
            # Get user
            user = get_user(request)
            now = timezone.now()
            curr_y = now.year
            # Query all logs
            all_logs = Log.objects.filter(user=user).order_by("-date")
            logs = []
            years = set()
            # Make set with all years from logs
            for log in all_logs:
                d = log.date
                years.add(d.year)
            # Iterate over years set
            for year in years:
                # Make dict with year related info
                by_year = {"year_n": year, "months": []}
                # Iterate over logs again
                for log in all_logs:
                    d = log.date
                    # If the year corresponds
                    if d.year == year:
                        # Make dict with month related info
                        by_month = {"month_n": d.month, "name": to_month(d.month)}
                        # Add month dict to year dict
                        if not by_month in by_year["months"]:
                            by_year["months"].append(by_month)
                logs.append(by_year)
            return render(request, "tasks/past.html", {"logs": logs, "curr_y": curr_y})
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def edit_log(request, weekday_n):
    """Displays tasks corresponding to the given day of the week and updates their state of completion."""

    # If the user is logged in
    if request.user.is_authenticated:
        # Get user
        user = get_user(request)
        # Get current date
        curr_date = timezone.localdate()
        # Get current week object
        week_obj = curr_date.isocalendar()
        # Define current year
        curr_y = week_obj[0]
        # Define current week
        curr_w = week_obj[1]
        # Define current day
        curr_d = curr_date.weekday()
        # Define date of given day
        try:
            weekday_date = date.fromisocalendar(curr_y, curr_w, weekday_n + 1)
        except ValueError:
            messages.add_message(request, messages.ERROR, "That is not a valid day of the week.")
            return HttpResponseRedirect(reverse("weekly"))
        # When the user is redirected or they follow a link
        if request.method == "GET":
            # If the day given has yet to pass or is not a proper day
            if weekday_n > curr_d or weekday_n < 0:
                messages.add_message(request, messages.ERROR, "Could not edit the log for that day of the week.")
                return HttpResponseRedirect(reverse("weekly"))
            # If the day given is the current day
            elif weekday_n == curr_d:
                return HttpResponseRedirect(reverse("daily"))
            # Query db for the active tasks corresponding to given day
            tasks = get_current_tasks(weekday_n, user)
            # If there a no tasks assigned for the day
            if not tasks:
                categories = []
                try:
                    logs = Log.objects.filter(user=user, date=weekday_date)
                except ObjectDoesNotExist as DoesNotExist:
                    logs = None
                if logs:
                    try:
                        all_categories = Category.objects.filter(user=user)
                    except ObjectDoesNotExist as DoesNotExist:
                        all_categories = None
                    if all_categories:
                        for category in all_categories:
                            for log in logs:
                                if log.task in category.tasks.all():
                                    categories.append(category)
                                    break
            # If there are tasks assigned for the day
            else:
                # Query db for log of the day
                try:
                    logs = Log.objects.filter(user=user, date=weekday_date)
                except ObjectDoesNotExist as DoesNotExist:
                    logs = None
                # If there are no logs for today
                if not logs:
                    # Create new logs
                    logs = []
                    for task in tasks:
                        log = Log(user=user, task=task)
                        log.save()
                        logs.append(log)
                # If there are logs
                else:
                    if check_unlogged(tasks, logs, user, weekday_date) == True:
                        # Update logs
                        logs = Log.objects.filter(user=user, date=weekday_date)
                # Query db for user categories
                all_categories = Category.objects.filter(user=user)
                # Filter pertinent categories
                categories = []
                for category in all_categories:
                    for log in logs:
                        if log.task in category.tasks.all():
                            categories.append(category)
                            break
            # Define possible statuses
            statuses = [
            {"value": 0, "name": "Pending"},
            {"value": 1, "name": "Complete"},
            {"value": 2, "name": "Incomplete"},
            {"value": 3, "name": "Ignored"}
            ]
            # Query db for note of the day
            try:
                note = Note.objects.get(user=user, date=weekday_date)
            except ObjectDoesNotExist as DoesNotExist:
                note = None

            # Define context
            context = {
            "categories": categories,
            "weekday": weekday_date,
            "logs": logs,
            "statuses": statuses,
            "note": note,
            "weekday_n": weekday_n
            }
            return render(request, "tasks/edit.html", context)
        # When the user submits a form (POST)
        else:
            # Query db for log of the day
            try:
                logs = Log.objects.filter(user=user, date=weekday_date)
            except ObjectDoesNotExist as DoesNotExist:
                logs = None
            # If there are no logs for today
            if not logs:
                messages.add_message(request, messages.ERROR, "Could not find any logs to update.")
                return HttpResponseRedirect(reverse("edit"))
            # Get field values
            for log in logs:
                # If the form field exists
                if request.POST.get(f"{log.task.id}", None):
                    # Request status of task
                    status = request.POST.get(f"{log.task.id}", None)
                    # If new status of task that is not equal to last status or out of range
                    if status and not status == log.status and not int(status) > 3 and not int(status) < 0 :
                        # Update status of task in log
                        log.status = status
                        log.save()
                    # If status is the same
                    else:
                        # Continue to next task in log
                        continue
                # If the form field does not exist
                else:
                    messages.add_message(request, messages.ERROR, "Could not update tasks.")
                    return HttpResponseRedirect(reverse("edit"))
            # Get note if form field exists and it is not empty
            if request.POST.get("note", None) and request.POST.get("note", None) != "":
                # Get note from textfield
                note = request.POST.get("note", None)
                # Query db for note of the day
                try:
                    db_note = Note.objects.get(user=user, date=weekday_date)
                except ObjectDoesNotExist as DoesNotExist:
                    db_note = None
                # If no note in db
                if not db_note:
                    Note.objects.create(user=user, date=weekday_date, text=note)
                # If note in db is unlike note in textfield
                elif db_note != note:
                    db_note.text = note
                    db_note.save()
            # Define days of the week
            weekday = to_weekday(weekday_n)
            # Redirect user to daily log
            messages.add_message(request, messages.SUCCESS, f"{weekday}'s log updated succesfully!")
            return HttpResponseRedirect(reverse("weekly"))
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def progress(request):
    """Displays a page that shows log statistics."""

    # If the user is logged in
    if request.user.is_authenticated:
        # When the user is redirected or they follow a link
        if request.method == "GET":
            return render(request, "tasks/progress.html")
        # When the user submits a form (POST)
        else:
            # Get user object
            user = get_user(request)
            # Get user Categories
            all_categories = Category.objects.filter(user=user)
            # Get current date
            curr_date = timezone.localdate()
            # Get value from query
            query = request.POST.get("query", None)
            if not query:
                messages.add_message(request, messages.ERROR, "Please, select a valid option.")
                return HttpResponseRedirect(reverse("progress"))
            # Convert number of days from string to integer
            elif query:
                days = int(query)
            # Create a range of dates that exclude the current day
            end_date = curr_date - timedelta(days=1)
            start_date = end_date - timedelta(days=days-1)
            # Query the db with the range created
            logs = Log.objects.filter(user=user, date__range=(start_date, end_date))
            # Sort pertinent categories and tasks
            tasks = []
            for log in logs:
                if log.task not in tasks:
                    tasks.append(log.task)
            stats = []
            for category in all_categories:
                for log in logs:
                    if log.task in category.tasks.all():
                        data = {"category": category, "tasks": []}
                        stats.append(data)
                        break
            for stat in stats:
                for task in tasks:
                    # Filter logs information by status
                    if task in stat["category"].tasks.all():
                        data = {
                            "name": task.name,
                            "pending": logs.filter(status=0, task=task).count(),
                            "complete": logs.filter(status=1, task=task).count(),
                            "incomplete": logs.filter(status=2, task=task).count(),
                            "ignored": logs.filter(status=3, task=task).count()
                        }
                        stat["tasks"].append(data)
            context = {
                "days": days,
                "stats": stats
            }
            return render(request, "tasks/progress_result.html", context)
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def about(request):
    """Displays a page that shows general information about the app."""

    # If the user is logged in
    if request.user.is_authenticated:
        return render(request, "tasks/about.html")
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def settings_profile(request):
    """Displays profile related settings."""

    # If the user is logged in
    if request.user.is_authenticated:
        # When the user is redirected or they follow a link
        if request.method == "GET":
            return render(request, "tasks/profile.html")
        # When the user submits a form (POST)
        else:
            # Determine whether any field was updated
            updated = False
            # Query user data
            user = get_user(request)
            # Request fields
            new_username = request.POST["username"]
            new_first_name = request.POST["first_name"]
            new_last_name = request.POST["last_name"]
            new_email = request.POST["email"]
            # If changes in username
            if not new_username == user.username:
                # Validate new username
                validation = validate_username(new_username)
                if validation["result"] == False:
                    messages.add_message(request, messages.ERROR, "Could not update your username.\n" + validation["message"])
                    return HttpResponseRedirect(reverse("profile"))
                else:
                    user.username = new_username
                    updated = True
            # If changes in first name
            if not new_first_name == user.first_name:
                # Validate new first name
                if len(new_first_name) > 150:
                    messages.add_message(request, messages.ERROR, "Could not update your first name.\n Please, provide a first name with 150 characters or fewer.")
                    return HttpResponseRedirect(reverse("profile"))
                else:
                    user.first_name = new_first_name
                    updated = True
            # If changes in last name
            if not new_last_name == user.last_name:
                # Validate new first name
                if len(new_last_name) > 150:
                    messages.add_message(request, messages.ERROR, "Could not update your last name.\n Please, provide a last name with 150 characters or fewer.")
                    return HttpResponseRedirect(reverse("profile"))
                else:
                    user.last_name = new_last_name
                    updated = True
            # If changes in email
            if not new_email == user.email:
                # Validate email
                try:
                    validate_email(new_email)
                except ValidationError:
                    messages.add_message(request, messages.ERROR, "Could not update your email.")
                    return HttpResponseRedirect(reverse("profile"))
                user.email = new_email
                updated = True
            # If no field has been updated
            if not updated:
                messages.add_message(request, messages.INFO, "Profile was not updated.")
                return HttpResponseRedirect(reverse("profile"))
            # Save changes
            user.save()
            messages.add_message(request, messages.SUCCESS, "Profile updated succesfully!")
            return HttpResponseRedirect(reverse("profile"))
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def settings_timezone(request):
    """Displays time zone related settings."""

    # If the user is logged in
    if request.user.is_authenticated:
        # Query user data
        user = get_user(request)
        # When the user is redirected or they follow a link
        if request.method == "GET":
            # Query user settings
            try:
                user_settings = Settings.objects.get(user=user)
            # If user settings are not found
            except ObjectDoesNotExist as DoesNotExist:
                # Save default settings
                user_settings = Settings(user=user, timezone="UTC")
                user_settings.save()
            return render(request, "tasks/timezone.html", {"timezones": common_timezones, "user_tz": user_settings.timezone, "now": timezone.now()})
        # When the user submits a form (POST)
        else:
            # Query user settings
            user_settings = Settings.objects.get(user=user)
            # Set old timezone settings
            old_tz = user_settings.timezone
            # Get new timezone settings
            new_tz = request.POST["timezone"]
            # Update session timezone
            request.session["django_timezone"] = new_tz
            # If the timezone is the same
            if new_tz == old_tz:
                # Redirect user
                messages.add_message(request, messages.INFO, f"Time zone was not updated.")
                return HttpResponseRedirect(reverse("timezone"))
            #  Update timezone in db
            user_settings.timezone = new_tz
            user_settings.save()
            # Redirect user
            messages.add_message(request, messages.SUCCESS, f"Time zone changed from {old_tz} to {new_tz} succesfully!")
            return HttpResponseRedirect(reverse("timezone"))
    # If the user is logged out
    else:
        messages.add_message(request, messages.ERROR, "You must be logged in.")
        return HttpResponseRedirect(reverse("login"))


def redir(request):
    """Redirects user to a proper view from a broken route."""

    view_name = request.resolver_match.view_name
    if view_name == "broken_tasks":
        return HttpResponseRedirect(reverse("tasks_overview"))
    elif view_name == "broken_daily":
        return HttpResponseRedirect(reverse("daily"))
    elif view_name == "broken_settings":
        return HttpResponseRedirect(reverse("profile"))
    elif view_name == "broken_weekly":
        return HttpResponseRedirect(reverse("weekly"))
    elif view_name == "broken_past":
        return HttpResponseRedirect(reverse("past"))
