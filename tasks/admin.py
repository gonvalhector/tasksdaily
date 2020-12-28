from django.contrib import admin
from .models import Category, Task, Settings, Log, Note

# Register your models here.
admin.site.register(Category)
admin.site.register(Task)
admin.site.register(Log)
admin.site.register(Settings)
admin.site.register(Note)
