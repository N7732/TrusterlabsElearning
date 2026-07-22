import os
import sys

try:
    # Replace with the actual path to your project on cPanel
    sys.path.insert(0, "/home/trusteracademy/Trusterlabs")
    
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "CMS.settings")
    
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()

except Exception as e:
    import traceback
    error_msg = traceback.format_exc()
    def application(environ, start_response):
        status = '500 Internal Server Error'
        output = b"Startup error:\n" + error_msg.encode('utf-8')
        response_headers = [('Content-type', 'text/plain'),
                            ('Content-Length', str(len(output)))]
        start_response(status, response_headers)
        return [output]
