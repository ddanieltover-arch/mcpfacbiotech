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

BATCH_9_ITEMS = [
    {"slug": "follistatin-315", "name": "Follistatin 315", "dose": "1mg", "type": "Myostatin Inhibitor"},
    {"slug": "foxo4-dri", "name": "FOXO4-DRI", "dose": "10mg", "type": "Senolytic Peptide"},
    {"slug": "gdf-8", "name": "GDF-8", "dose": "1mg (Myostatin)", "type": "Lyophilized Powder"},
    {"slug": "hcg", "name": "HCG", "dose": "5000IU", "type": "Gonadotropin Factor"},
    {"slug": "hmg", "name": "HMG", "dose": "75IU", "type": "Gonadotropin Factor"},
    {"slug": "ibutamorin", "name": "Ibutamoren", "dose": "10mg (MK-677)", "type": "GH Secretagogue"},
    {"slug": "livagen", "name": "Livagen", "dose": "10mg", "type": "Bioregulator Peptide"},
    {"slug": "ovagen", "name": "Ovagen", "dose": "10mg", "type": "Bioregulator Peptide"},
    {"slug": "pnc-27", "name": "PNC-27", "dose": "10mg", "type": "Targeted Peptide"},
    {"slug": "prostamax", "name": "Prostamax", "dose": "10mg", "type": "Bioregulator Peptide"},
]

BATCH_9_MAPPING = {}

def render_photorealistic_batch_9():
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

    for item in BATCH_9_ITEMS:
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
        BATCH_9_MAPPING[item["slug"]] = brain_filename

def upload_and_sync_all():
    print("\nUploading all 10 Batch 9 photorealistic images to Supabase Storage & local web directory...")
    headers = {
        "Authorization": f"Bearer {KEY}",
        "apiKey": KEY,
        "Content-Type": "image/png",
        "x-upsert": "true",
    }

    results = {}
    for slug, brain_filename in BATCH_9_MAPPING.items():
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

    print("\nBatch 9 Complete Summary:")
    for slug, url in results.items():
        print(f"  {slug}: {url}")

def main():
    render_photorealistic_batch_9()
    upload_and_sync_all()

if __name__ == "__main__":
    main()
