import os
import sys
import time
import cv2
import numpy as np
import requests
from PIL import Image, ImageDraw, ImageFont

SUPABASE_URL = "https://yoojdbprdgjwzfmyjcif.supabase.co"
KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvb2pkYnByZGdqd3pmbXlqY2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDUzMzc0NiwiZXhwIjoyMTAwMTA5NzQ2fQ."
    "0epMtC8V3-bVzkdRvZ0Wb6JJQzoN7iga604d5LbHMgg"
)

BRAIN_DIR = r"C:\Users\User\.gemini\antigravity-ide\brain\828bb7e2-63b8-4e77-a9a9-e5137e69b1d6"
PUBLIC_DIR = r"C:\Users\User\Desktop\MCPFAC BIOTECH\apps\web\public\images\products"

BATCH_7_ITEMS = [
    {"slug": "anavar-10mg-60-tablets", "name": "ANAVAR", "dose": "10mg (60 Tablets)", "type": "Research Compound"},
    {"slug": "mk-677-10mg-50-tablets", "name": "MK-677", "dose": "10mg (50 Tablets)", "type": "GH Secretagogue"},
    {"slug": "rad140-10mg-50-tablets", "name": "RAD140", "dose": "10mg (50 Tablets)", "type": "Selective Modulator"},
    {"slug": "gw-501516-10mg-50-tablets", "name": "GW-501516", "dose": "10mg (50 Tablets)", "type": "PPARδ Agonist"},
    {"slug": "cialis-25mg-50-tablets", "name": "CIALIS", "dose": "25mg (50 Tablets)", "type": "Research Compound"},
    {"slug": "methylene-blue", "name": "Methylene Blue", "dose": "1% Solution 50mL", "type": "Pharmaceutical Solute"},
    {"slug": "aicar-10mg-50-tablets", "name": "AICAR", "dose": "10mg (50 Tablets)", "type": "AMPK Activator"},
    {"slug": "lipo-c", "name": "LIPO-C", "dose": "10mL Multidose", "type": "Lipotropic Injection"},
    {"slug": "follistatin-344", "name": "Follistatin 344", "dose": "1mg", "type": "Lyophilized Powder"},
    {"slug": "glow-bpc-157-ghk-cu-tb-500-blend", "name": "GLOW Blend", "dose": "BPC / GHK-Cu / TB", "type": "Tri-Peptide Blend"},
]

BATCH_7_MAPPING = {}

def render_photorealistic_batch_7():
    base_path = os.path.join(BRAIN_DIR, "bpc_157_5mg_1784728609257.png")
    img = cv2.imread(base_path)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Exact label replacement patch region
    y1, y2 = 572, 704
    x1, x2 = 385, 635
    height = y2 - y1
    width = x2 - x1

    left_col = np.mean(img_rgb[y1:y2, 375:383], axis=1)
    right_col = np.mean(img_rgb[y1:y2, 637:645], axis=1)

    patch = np.zeros((height, width, 3), dtype=np.float32)
    for i in range(width):
        alpha = i / (width - 1.0)
        patch[:, i, :] = (1.0 - alpha) * left_col + alpha * right_col

    patch_uint8 = np.clip(patch, 0, 255).astype(np.uint8)

    clean_img = img_rgb.copy()
    clean_img[y1:y2, x1:x2] = patch_uint8

    try:
        font_title_lg = ImageFont.truetype("arialbd.ttf", 30)
        font_title_sm = ImageFont.truetype("arialbd.ttf", 24)
        font_dose = ImageFont.truetype("arialbd.ttf", 25)
        font_type = ImageFont.truetype("arial.ttf", 19)
    except:
        font_title_lg = font_title_sm = font_dose = font_type = ImageFont.load_default()

    title_color = (4, 120, 87)
    text_dark = (15, 23, 42)

    for item in BATCH_7_ITEMS:
        pil_img = Image.fromarray(clean_img.copy())
        draw = ImageDraw.Draw(pil_img)

        name = item["name"]
        font = font_title_sm if len(name) > 16 else font_title_lg

        draw.text((510, 606), name, fill=title_color, font=font, anchor="mm")
        draw.text((510, 646), item["dose"], fill=text_dark, font=font_dose, anchor="mm")
        draw.text((510, 680), item["type"], fill=text_dark, font=font_type, anchor="mm")

        brain_filename = f"{item['slug']}_photoreal.png"
        out_path = os.path.join(BRAIN_DIR, brain_filename)
        pil_img.save(out_path)
        print(f"Rendered photorealistic hero shot: {brain_filename}")
        BATCH_7_MAPPING[item["slug"]] = brain_filename

def upload_and_sync_all():
    print("\nUploading all 10 Batch 7 photorealistic images to Supabase Storage & local web directory...")
    headers = {
        "Authorization": f"Bearer {KEY}",
        "apiKey": KEY,
        "Content-Type": "image/png",
        "x-upsert": "true",
    }

    results = {}
    for slug, brain_filename in BATCH_7_MAPPING.items():
        src = os.path.join(BRAIN_DIR, brain_filename)
        dest = os.path.join(PUBLIC_DIR, f"{slug}.png")

        if not os.path.exists(src):
            print(f"[Error] Source file missing: {src}")
            continue

        with open(src, "rb") as sf, open(dest, "wb") as df:
            df.write(sf.read())

        upload_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{slug}.png"
        with open(src, "rb") as f:
            r = requests.post(upload_url, headers=headers, data=f.read())
        if r.status_code in (200, 201):
            pub_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{slug}.png"
            results[slug] = pub_url
            print(f"[Supabase OK] {slug} -> {pub_url}")
        else:
            print(f"[Supabase Fail] {slug}: {r.status_code} {r.text}")

    print("\nBatch 7 Photorealistic Redo Summary:")
    for slug, url in results.items():
        print(f"  {slug}: {url}")

def main():
    render_photorealistic_batch_7()
    upload_and_sync_all()

if __name__ == "__main__":
    main()
