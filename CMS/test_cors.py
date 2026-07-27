import requests

url = 'https://trusterlabselearning-production.up.railway.app/auth/api/auth/password/reset/'
headers = {
    'Origin': 'https://www.trusterlabsacademy.com',
    'Content-Type': 'application/json'
}
data = {'email': 'nshimyumuremyio228@gmail.com'}

try:
    response = requests.post(url, headers=headers, json=data)
    print(f'Status Code: {response.status_code}')
    print(f'Response: {response.text}')
    print(f'CORS Headers: {response.headers.get("Access-Control-Allow-Origin")}')
except Exception as e:
    print(f'Error: {e}')
