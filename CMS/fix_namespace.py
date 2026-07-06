import glob

# Replace in views.py
path = 'Auth/views.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("'accounts:", "'Auth:")
content = content.replace('"accounts:', '"Auth:')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

# Replace in templates
for file_path in glob.glob('Auth/templates/**/*.html', recursive=True):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content.replace("'accounts:", "'Auth:")
    new_content = new_content.replace('"accounts:', '"Auth:')
    
    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file_path}')

print('Done!')
