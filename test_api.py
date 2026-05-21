import urllib.request
import urllib.error
import json

def test_api():
    try:
        # Register user
        req1 = urllib.request.Request("http://localhost:8080/api/auth/register", 
                                      data=json.dumps({"name":"T", "email":"test1337@example.com", "password":"password", "role":"TUTOR"}).encode(),
                                      headers={'Content-Type': 'application/json'}, method="POST")
        res1 = urllib.request.urlopen(req1)
        token = json.loads(res1.read())['token']

        # Initiate payment
        payload = {
            "qualifications": "BSc", "subjects": "Math", "hourlyRate": 500, "experienceYears": 2,
            "location": "KTM", "serviceArea": "KTM", "documentUrl": "small_base64_for_test",
            "mapLocation": "https://maps", "amount": 500
        }
        req2 = urllib.request.Request("http://localhost:8080/api/payments/initiate", 
                                      data=json.dumps(payload).encode(),
                                      headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}, method="POST")
        res2 = urllib.request.urlopen(req2)
        print("Success:", res2.read().decode())
    except urllib.error.HTTPError as e:
        print("HTTP Error:", e.code)
        print("Response:", e.read().decode())
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    test_api()
