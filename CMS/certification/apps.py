from django.apps import AppConfig


class CertificationConfig(AppConfig):
    name = 'certification'

    def ready(self):
        import certification.signals
