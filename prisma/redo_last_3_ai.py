import os
import sys
import time
import requests
from dotenv import load_dotenv

load_dotenv(r"C:\Users\User\Desktop\openswarm\openswarm\.env", override=True)

SUPABASE_URL = "https://yoojdbprdgjwzfmyjcif.supabase.co"
KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvb2pkYnByZGdqd3pmbXlqY2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDUzMzc0NiwiZXhwIjoyMTAwMTA5NzQ2fQ."
    "0epMtC8V3-bVzkdRvZ0Wb6JJQzoN7iga604d5LbHMgg"
)

BRAIN_DIR = r"C:\Users\User\.gemini\antigravity-ide\brain\828bb7e2-63b8-4e77-a9a9-e5137e69b1d6"
PUBLIC_DIR = r"C:\Users\User\Desktop\MCPFAC BIOTECH\apps\web\public\images\products"

REDO_ITEMS = [
    {
        "slug": "vesugen-10mg",
        "brain_filename": "vesugen_10mg_exact.png",
        "prompt": "Commercial e-commerce 1:1 hero shot of a 10mg scientific research glass vial containing white lyophilized powder. The vial features a deep emerald green flip-off cap (#1B4332) and a clean white laboratory label with 'MCPFAC BIOTECH' printed in bold dark green typography alongside a sleek green leaf logo (#52B788) and 'Vesugen 10mg'. Set on a seamless minimalist white laboratory studio surface with soft natural shadows and diffuse studio lighting. High resolution commercial product shot.",
    },
    {
        "slug": "humanin-10mg",
        "brain_filename": "humanin_10mg_exact.png",
        "prompt": "Commercial e-commerce 1:1 hero shot of a 10mg scientific research glass vial containing white lyophilized powder. The vial features a deep emerald green flip-off cap (#1B4332) and a clean white laboratory label with 'MCPFAC BIOTECH' printed in bold dark green typography alongside a sleek green leaf logo (#52B788) and 'Humanin 10mg'. Set on a seamless minimalist white laboratory studio surface with soft natural shadows and diffuse studio lighting. High resolution commercial product shot.",
    },
    {
        "slug": "thymosin-a1-10mg",
        "brain_filename": "thymosin_a1_10mg_exact.png",
        "prompt": "Commercial e-commerce 1:1 hero shot of a 10mg scientific research glass vial containing white lyophilized powder. The vial features a deep emerald green flip-off cap (#1B4332) and a clean white laboratory label with 'MCPFAC BIOTECH' printed in bold dark green typography alongside a sleek green leaf logo (#52B788) and 'Thymosin-a1 10mg'. Set on a seamless minimalist white laboratory studio surface with soft natural shadows and diffuse studio lighting. High resolution commercial product shot.",
    },
]


def generate_single(prompt, out_path):
    from google import genai
    from google.genai.types import GenerateContentConfig, ImageConfig

    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

    attempt = 0
    while True:
        attempt += 1
        try:
            res = client.models.generate_content(
                model="gemini-2.5-flash-image",
                contents=prompt,
                config=GenerateContentConfig(image_config=ImageConfig(aspect_ratio="1:1")),
            )
            for part in res.candidates[0].content.parts:
                if part.inline_data:
                    with open(out_path, "wb") as f:
                        f.write(part.inline_data.data)
                    print(f"  [OK] Saved AI image: {out_path}", flush=True)
                    return True
        except Exception as e:
            err_msg = str(e)
            print(f"  [Attempt {attempt}] Rate limit / error: {err_msg[:90]}... Waiting 30s...", flush=True)
            time.sleep(30)


def main():
    for item in REDO_ITEMS:
        out_path = os.path.join(BRAIN_DIR, item["brain_filename"])
        print(f"\nGenerating crisp AI hero shot for '{item['slug']}'...", flush=True)

        generate_single(item["prompt"], out_path)

        # Copy to public folder
        public_dest = os.path.join(PUBLIC_DIR, f"{item['slug']}.png")
        with open(out_path, "rb") as sf, open(public_dest, "wb") as df:
            df.write(sf.read())

        # Upload to Supabase Storage
        upload_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{item['slug']}.png"
        headers = {
            "Authorization": f"Bearer {KEY}",
            "apiKey": KEY,
            "Content-Type": "image/png",
            "x-upsert": "true",
        }
        with open(out_path, "rb") as f:
            r = requests.post(upload_url, headers=headers, data=f.read())
        if r.status_code in (200, 201):
            pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{item['slug']}.png"
            print(f"  [Supabase Uploaded] {item['slug']} -> {pub_url}", flush=True)
        else:
            print(f"  [Supabase Upload Error] {r.status_code} {r.text}", flush=True)


if __name__ == "__main__":
    main()
