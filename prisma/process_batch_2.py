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

REMAINING_BATCH_2 = [
    {
        "slug": "vesugen-10mg",
        "filename": "vesugen_10mg_exact.png",
        "prompt": "Commercial e-commerce 1:1 hero shot of a 10mg scientific research glass vial containing white lyophilized powder. The vial features a deep emerald green flip-off cap (#1B4332) and a clean white laboratory label with 'MCPFAC BIOTECH' printed in bold dark green typography alongside a sleek green leaf logo (#52B788) and 'Vesugen 10mg'. Set on a seamless minimalist white laboratory studio surface with soft natural shadows and diffuse studio lighting. High resolution commercial product shot.",
    },
    {
        "slug": "humanin-10mg",
        "filename": "humanin_10mg_exact.png",
        "prompt": "Commercial e-commerce 1:1 hero shot of a 10mg scientific research glass vial containing white lyophilized powder. The vial features a deep emerald green flip-off cap (#1B4332) and a clean white laboratory label with 'MCPFAC BIOTECH' printed in bold dark green typography alongside a sleek green leaf logo (#52B788) and 'Humanin 10mg'. Set on a seamless minimalist white laboratory studio surface with soft natural shadows and diffuse studio lighting. High resolution commercial product shot.",
    },
    {
        "slug": "thymosin-a1-10mg",
        "filename": "thymosin_a1_10mg_exact.png",
        "prompt": "Commercial e-commerce 1:1 hero shot of a 10mg scientific research glass vial containing white lyophilized powder. The vial features a deep emerald green flip-off cap (#1B4332) and a clean white laboratory label with 'MCPFAC BIOTECH' printed in bold dark green typography alongside a sleek green leaf logo (#52B788) and 'Thymosin-a1 10mg'. Set on a seamless minimalist white laboratory studio surface with soft natural shadows and diffuse studio lighting. High resolution commercial product shot.",
    },
]

ALL_BATCH_2_MAPPING = {
    "mots-c-10mg": "mots_c_10mg_exact_1784789858845.png",
    "aod-9604-5mg": "aod_9604_5mg_exact_1784789880443.png",
    "ll-37-5mg": "ll_37_5mg_exact_1784789926477.png",
    "semax-10mg": "semax_10mg_exact_1784789948322.png",
    "selank-10mg": "selank_10mg_exact_1784789975491.png",
    "oxytocin-5mg": "oxytocin_5mg_exact_1784789988686.png",
    "pinealon-10mg": "pinealon_10mg_exact_1784790000876.png",
    "vesugen-10mg": "vesugen_10mg_exact.png",
    "humanin-10mg": "humanin_10mg_exact.png",
    "thymosin-a1-10mg": "thymosin_a1_10mg_exact.png",
}

def generate_remaining():
    from google import genai
    from google.genai.types import GenerateContentConfig, ImageConfig

    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

    for item in REMAINING_BATCH_2:
        out_path = os.path.join(BRAIN_DIR, item["filename"])
        if os.path.exists(out_path):
            print(f"Already exists: {out_path}")
            continue

        print(f"Generating image for '{item['slug']}'...")
        while True:
            try:
                res = client.models.generate_content(
                    model="gemini-2.5-flash-image",
                    contents=item["prompt"],
                    config=GenerateContentConfig(image_config=ImageConfig(aspect_ratio="1:1")),
                )
                for part in res.candidates[0].content.parts:
                    if part.inline_data:
                        with open(out_path, "wb") as f:
                            f.write(part.inline_data.data)
                        print(f"Saved: {out_path}", flush=True)
                        break
                break
            except Exception as e:
                print(f"Error for {item['slug']}: {str(e)[:80]}... Waiting 30s...", flush=True)
                time.sleep(30)

def upload_all():
    print("\nUploading all Batch 2 images to Supabase & local public dir...")
    results = {}
    for slug, filename in ALL_BATCH_2_MAPPING.items():
        src_path = os.path.join(BRAIN_DIR, filename)
        if not os.path.exists(src_path):
            print(f"[Warning] File missing: {src_path}")
            continue

        # Copy to public folder
        public_dest = os.path.join(PUBLIC_DIR, f"{slug}.png")
        with open(src_path, "rb") as sf, open(public_dest, "wb") as df:
            df.write(sf.read())

        # Upload to Supabase Storage
        upload_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{slug}.png"
        headers = {
            "Authorization": f"Bearer {KEY}",
            "apiKey": KEY,
            "Content-Type": "image/png",
            "x-upsert": "true",
        }
        with open(src_path, "rb") as f:
            r = requests.post(upload_url, headers=headers, data=f.read())
        if r.status_code in (200, 201):
            pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{slug}.png"
            results[slug] = pub_url
            print(f"[Supabase OK] {slug} -> {pub_url}", flush=True)
        else:
            print(f"[Supabase Error] {slug}: {r.status_code} {r.text}", flush=True)

    print("\nBatch 2 Complete! Upload Summary:")
    for slug, url in results.items():
        print(f"  {slug}: {url}")

if __name__ == "__main__":
    generate_remaining()
    upload_all()
