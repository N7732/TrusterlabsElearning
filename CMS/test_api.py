import requests

url = 'https://trusterlabselearning-production.up.railway.app/auth/api/auth/password/reset/'
headers = {
    'Origin': 'https://www.trusterlabsacademy.com',
}
try:
    response = requests.get(url, headers=headers)
    print(f'Status Code: {response.status_code}')
    print(f'Response snippet: {response.text[:200]}')
    print(f'CORS Headers: {response.headers.get("Access-Control-Allow-Origin")}')
except Exception as e:
    print(f'Error: {e}')
