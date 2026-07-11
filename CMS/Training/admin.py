from django.contrib import admin
from .models import (
    Training,
    TrainingCourses,
    TrainingParticipants,
    TrainingClasswork,
    TrainingClassworkSubmission,
    TrainingFinalExam,
    TrainingFinalExamSubmission,
    CustomTrainingRequest
)

class TrainingCoursesInline(admin.TabularInline):
    model = TrainingCourses
    extra = 1

class TrainingParticipantsInline(admin.TabularInline):
    model = TrainingParticipants
    extra = 1

@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ('title', 'starting_date', 'ending_date', 'date_created')
    inlines = [TrainingCoursesInline, TrainingParticipantsInline]

@admin.register(TrainingParticipants)
class TrainingParticipantsAdmin(admin.ModelAdmin):
    list_display = ('participant', 'training', 'admission_status', 'date_applied')
    list_filter = ('admission_status', 'training')

@admin.register(TrainingClasswork)
class TrainingClassworkAdmin(admin.ModelAdmin):
    list_display = ('title', 'training', 'due_date')
    list_filter = ('training',)

@admin.register(TrainingClassworkSubmission)
class TrainingClassworkSubmissionAdmin(admin.ModelAdmin):
    list_display = ('participant', 'classwork', 'submission_date')
    list_filter = ('classwork__training', 'classwork')

@admin.register(TrainingFinalExam)
class TrainingFinalExamAdmin(admin.ModelAdmin):
    list_display = ('title', 'training', 'exam_date')
    list_filter = ('training',)

@admin.register(TrainingFinalExamSubmission)
class TrainingFinalExamSubmissionAdmin(admin.ModelAdmin):
    list_display = ('participant', 'exam', 'score', 'submission_date')
    list_filter = ('exam__training', 'exam')

@admin.register(CustomTrainingRequest)
class CustomTrainingRequestAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'training_type', 'status', 'created_at')
    list_filter = ('status', 'training_type')
    search_fields = ('full_name', 'email', 'phone_number')

