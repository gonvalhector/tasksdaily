from django.conf import settings
from django.db import models
from django.utils import timezone

# Create your models here.
class Task(models.Model):
    name = models.CharField(max_length=64)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    monday = models.BooleanField()
    tuesday = models.BooleanField()
    wednesday = models.BooleanField()
    thursday = models.BooleanField()
    friday = models.BooleanField()
    saturday = models.BooleanField()
    sunday = models.BooleanField()
    is_active = models.BooleanField(default=True)
    last_updated = models.DateField(default=timezone.localdate)

class Category(models.Model):
    name = models.CharField(max_length=64)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories")
    tasks = models.ManyToManyField(Task, blank=True, related_name="category")
    last_updated = models.DateField(default=timezone.localdate)

class Settings(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="settings")
    timezone = models.CharField(max_length=30)

class Log(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="logs")
    date = models.DateField(default=timezone.localdate)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="logs")
    status = models.SmallIntegerField(default=0)

class Note(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes")
    date = models.DateField(default=timezone.localdate)
    text = models.TextField()
