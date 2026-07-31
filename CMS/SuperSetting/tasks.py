import os
import psutil
from django.db import connections
from django.db.utils import OperationalError
from apscheduler.schedulers.background import BackgroundScheduler
import time
import smtplib
from django.conf import settings

def check_system_health():
    from .models import SystemHealthSnapshot, ErrorLog
    from django.utils import timezone
    from datetime import timedelta

    # CPU & Memory
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory().percent
    disk = psutil.disk_usage(str(settings.BASE_DIR) if hasattr(settings, 'BASE_DIR') else '/').percent
    
    # DB Status
    db_conn = connections['default']
    db_status = True
    response_time = 0.0
    try:
        start_time = time.time()
        c = db_conn.cursor()
        c.execute('SELECT 1')
        response_time = (time.time() - start_time) * 1000  # ms
    except OperationalError:
        db_status = False

    # SMTP Status
    smtp_status = True
    try:
        if getattr(settings, 'EMAIL_HOST', None) and getattr(settings, 'EMAIL_PORT', None):
            server = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=5) if getattr(settings, 'EMAIL_USE_SSL', False) else smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=5)
            if getattr(settings, 'EMAIL_USE_TLS', False):
                server.starttls()
            if getattr(settings, 'EMAIL_HOST_USER', None) and getattr(settings, 'EMAIL_HOST_PASSWORD', None):
                server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            server.quit()
    except Exception:
        smtp_status = False

    # Errors in last 5 mins
    five_mins_ago = timezone.now() - timedelta(minutes=5)
    recent_errors = ErrorLog.objects.filter(created_at__gte=five_mins_ago).count()

    SystemHealthSnapshot.objects.create(
        cpu_usage=cpu,
        memory_usage=memory,
        disk_usage=disk,
        db_status=db_status,
        db_response_time=response_time,
        smtp_status=smtp_status,
        failed_tasks=recent_errors
    )

def start_scheduler():
    scheduler = BackgroundScheduler()
    # Prevent duplicate jobs in dev environment with auto-reload
    if os.environ.get('RUN_MAIN', None) != 'true' and os.environ.get('DJANGO_SETTINGS_MODULE'):
        pass
    else:
        return
    scheduler.add_job(check_system_health, 'interval', minutes=5, id='system_health_job', replace_existing=True)
    scheduler.start()
