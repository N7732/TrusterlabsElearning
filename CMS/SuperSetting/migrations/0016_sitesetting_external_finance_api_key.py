from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('SuperSetting', '0015_alter_sitesetting_top_announcements_charset'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesetting',
            name='external_finance_api_key',
            field=models.CharField(blank=True, help_text='API key for the external Trusterlabs financial department', max_length=100, null=True),
        ),
    ]
