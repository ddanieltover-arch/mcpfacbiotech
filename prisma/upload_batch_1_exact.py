import os
import sys
import json
import requests
from dotenv import load_dotenv

SUPABASE_URL = "https://yoojdbprdgjwzfmyjcif.supabase.co"
KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvb2pkYnByZGdqd3pmbXlqY2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDUzMzc0NiwiZXhwIjoyMTAwMTA5NzQ2fQ."
    "0epMtC8V3-bVzkdRvZ0Wb6JJQzoN7iga604d5LbHMgg"
)

BRAIN_DIR = r"C:\Users\User\.gemini\antigravity-ide\brain\828bb7e2-63b8-4e77-a9a9-e5137e69b1d6"
PUBLIC_DIR = r"C:\Users\User\Desktop\MCPFAC BIOTECH\apps\web\public\images\products"

BATCH_1_MAP = {
    "bpc-157-5mg": "bpc_157_5mg_1784728609257.png",
    "tb-500-5mg": "tb_500_5mg_1784728677341.png",
    "semaglutide-5mg": "semaglutide_5mg_1784728693452.png",
    "melanotan-ii-10mg": "melanotan_ii_10mg_1784728705918.png",
    "cjc-1295-with-dac": "cjc_1295_with_dac_exact_1784788365377.png",
    "cjc-1295-without-dac": "cjc_1295_without_dac_exact_1784788378460.png",
    "ghk-cu-50mg": "ghk_cu_50mg_exact_1784788399387.png",
    "ipamorelin-5mg": "ipamorelin_5mg_exact_1784788423978.png",
    "epithalon-50mg": "epithalon_50mg_exact_1784788437367.png",
}

def main():
    print("==================================================")
    print("Uploading Batch 1 Rebranded Images to Supabase")
    print("==================================================")

    results = {}
    for slug, filename in BATCH_1_MAP.items():
        src_path = os.path.join(BRAIN_DIR, filename)
        if not os.path.exists(src_path):
            print(f"[Warning] File not found: {src_path}")
            continue

        # Copy to public static dir
        public_dest = os.path.join(PUBLIC_DIR, f"{slug}.png")
        with open(src_path, "rb") as sf, open(public_dest, "wb") as df:
            df.write(sf.read())
        print(f"Copied {filename} -> {public_dest}")

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
            print(f"[Supabase OK] {slug} -> {pub_url}")
        else:
            print(f"[Supabase Fail] {slug}: {r.status_code} {r.text}")

    print("\nBatch 1 Upload Summary:")
    for slug, url in results.items():
        print(f"  {slug}: {url}")

if __name__ == "__main__":
    main()
