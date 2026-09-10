from django.db import migrations

def alter_charset(apps, schema_editor):
    if schema_editor.connection.vendor == 'mysql':
        # Convert the entire table and columns to utf8mb4 to support emojis
        schema_editor.execute("ALTER TABLE SuperSetting_sitesetting CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        schema_editor.execute("ALTER TABLE SuperSetting_sitesetting MODIFY top_announcements LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")

def reverse_alter_charset(apps, schema_editor):
    if schema_editor.connection.vendor == 'mysql':
        # Revert back to utf8 (optional, may cause data loss if emojis exist)
        pass

class Migration(migrations.Migration):

    dependencies = [
        ('SuperSetting', '0014_alter_systemlog_options_and_more'),
    ]

    operations = [
        migrations.RunPython(alter_charset, reverse_alter_charset),
    ]
