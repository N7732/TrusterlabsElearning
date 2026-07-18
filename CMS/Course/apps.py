from django.apps import AppConfig


class CourseConfig(AppConfig):
    name = 'Course'

    def ready(self):
        import Course.signals
