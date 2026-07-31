from django.apps import AppConfig


class SupersettingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'SuperSetting'

    def ready(self):
        import SuperSetting.signals
        from . import tasks
        tasks.start_scheduler()
