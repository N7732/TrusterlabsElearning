import smtplib

email_host = 'mail.trusterlabsacademy.com'
email_port = 465
email_user = 'academic@trusterlabsacademy.com'
email_pass = 'TrueAca1049$'

try:
    print('Connecting to SMTP server...')
    server = smtplib.SMTP_SSL(email_host, email_port, timeout=10)
    print('Connected. Logging in...')
    server.login(email_user, email_pass)
    print('Logged in successfully!')
    server.quit()
except Exception as e:
    print(f'Error: {e}')
