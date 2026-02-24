import requests

resp = requests.get('http://localhost:8000/dashboard/summary')
print(resp.status_code)
print(resp.headers.get('Content-Type'))
print(resp.text)
