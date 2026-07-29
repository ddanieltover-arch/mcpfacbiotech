import requests

url = "https://tbgmkqklkshkjfhcqtzz.supabase.co/storage/v1/object/public/catalog-heroes/insulin-syringes-10-pack.png"
response = requests.get(url)
print("Insulin syringes response status:", response.status_code)
if response.status_code == 200:
    print("Success! Image is downloadable.")
else:
    print("Failed to download image.")
