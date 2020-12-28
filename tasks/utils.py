from datetime import datetime

from django.core.exceptions import ObjectDoesNotExist
from .models import Task, Log
from django.utils import timezone
from django.core.validators import validate_slug

def validate_username(username):
    """Checks the username string provided against Django's username specifications."""

    validation = {"result": None, "message": None}
    # If no username is provided in field
    if not username:
        validation["result"] = False
        validation["message"] = "Please, provide a username."
    # If username is longer than 150 characters
    elif len(username) > 150:
        validation["result"] = False
        validation["message"] = "Please, provide a username with 150 characters or fewer."
    # If the username has any invalid characters
    elif validate_slug(username) == False:
        validation["result"] = False
        validation["message"] = "Please, provide a username that contains only letters, numbers, underscores or hyphens."
    # If the username is valid
    else:
        validation["result"] = True
    return validation


def get_current_tasks(weekday, user):
    """Given a weekday number, returns the corresponding active tasks or None if
    there are none."""

    # Query db for the active tasks corresponding to weekday given
    if weekday == 0:
        try:
            tasks = Task.objects.filter(user=user, monday=True, is_active=True)
        except ObjectDoesNotExist as DoesNotExist:
            tasks = None
    elif weekday == 1:
        try:
            tasks = Task.objects.filter(user=user, tuesday=True, is_active=True)
        except ObjectDoesNotExist as DoesNotExist:
            tasks = None
    elif weekday == 2:
        try:
            tasks = Task.objects.filter(user=user, wednesday=True, is_active=True)
        except ObjectDoesNotExist as DoesNotExist:
            tasks = None
    elif weekday == 3:
        try:
            tasks = Task.objects.filter(user=user, thursday=True, is_active=True)
        except ObjectDoesNotExist as DoesNotExist:
            tasks = None
    elif weekday == 4:
        try:
            tasks = Task.objects.filter(user=user, friday=True, is_active=True)
        except ObjectDoesNotExist as DoesNotExist:
            tasks = None
    elif weekday == 5:
        try:
            tasks = Task.objects.filter(user=user, saturday=True, is_active=True)
        except ObjectDoesNotExist as DoesNotExist:
            tasks = None
    else:
        try:
            tasks = Task.objects.filter(user=user, sunday=True, is_active=True)
        except ObjectDoesNotExist as DoesNotExist:
            tasks = None
    # Returns tasks
    return tasks

def is_after_updated(log_date, task):
    """Checks whether a given log date is equal or after the date the given task
    was last updated."""

    # Declare task date
    task_date = task.last_updated
    # Convert given dates to naive datetime objects
    # Give task datetime the earliest representable time
    task_dt_naive = datetime.combine(task_date, datetime.min.time())
    # Give log datetime the latest representable time
    log_dt_naive = datetime.combine(log_date, datetime.max.time())
    # Convert naive datetime objects to aware datetime objects
    task_dt_aware = timezone.make_aware(task_dt_naive)
    log_dt_aware = timezone.make_aware(log_dt_naive)
    # If the date given is after the user joined
    if log_dt_aware > task_dt_aware:
        return True
    else:
        return False


def check_unlogged(tasks, logs, user, log_date):
    """Given a queryset of tasks, a queryset of logs and a log date, checks for
    unlogged tasks and creates new logs where needed, returning True.
    Returns False if no new logs are created."""

    unlogged = []
    # Check for unlogged tasks
    for task in tasks:
        is_in = False
        for log in logs:
            if task.name == log.task.name:
                is_in = True
                break
        if is_in == False:
            unlogged.append(task)
    # If there are tasks unlogged
    if unlogged:
        # Log tasks
        for task in unlogged:
            # If the log is for a date after the task was made
            if is_after_updated(log_date, task) == True:
                # Log task
                log = Log(user=user, task=task, date=log_date)
                log.save()
        return True
    else:
        return False


def to_month(n):
    """Returns a string with the name of the month, given its number."""

    months = ["January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December"]
    return months[n - 1]


def to_weekday(n):
    """Returns a string with the day of the week's name, given its number."""

    weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return weekdays[n]
