import requests

url = 'http://127.0.0.1:8000/auth/api/auth/password/reset/'
headers = {
    'Origin': 'http://localhost:5173',
    'Content-Type': 'application/json'
}
data = {'email': 'nshimyumuremyio228@gmail.com'}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f'Status Code: {response.status_code}')
    print(f'Response: {response.text}')
except Exception as e:
    print(f'Error: {e}')
