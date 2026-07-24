import os
import sys
import time
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
    {
        "slug": "anavar-10mg-60-tablets",
        "name": "ANAVAR",
        "specs": "10MG • 60 TABLETS",
        "style": "amber_bottle",
        "sub": "Oxandrolone Oral Compound",
    },
    {
        "slug": "mk-677-10mg-50-tablets",
        "name": "MK-677",
        "specs": "10MG • 50 TABLETS",
        "style": "white_bottle",
        "sub": "Ibutamoren GH Secretagogue",
    },
    {
        "slug": "rad140-10mg-50-tablets",
        "name": "RAD140",
        "specs": "10MG • 50 TABLETS",
        "style": "black_bottle",
        "sub": "Testolone Selective Modulator",
    },
    {
        "slug": "gw-501516-10mg-50-tablets",
        "name": "GW-501516",
        "specs": "10MG • 50 TABLETS",
        "style": "blue_bottle",
        "sub": "Cardarine PPARδ Agonist",
    },
    {
        "slug": "cialis-25mg-50-tablets",
        "name": "CIALIS",
        "specs": "25MG • 50 TABLETS",
        "style": "white_bottle",
        "sub": "Tadalafil Research Compound",
    },
    {
        "slug": "methylene-blue",
        "name": "Methylene Blue",
        "specs": "1% SOLUTION • 50ML",
        "style": "dropper_bottle",
        "sub": "Pharmaceutical Grade Solute",
    },
    {
        "slug": "aicar-10mg-50-tablets",
        "name": "AICAR",
        "specs": "10MG • 50 TABLETS",
        "style": "white_bottle",
        "sub": "AMPK Activator Compound",
    },
    {
        "slug": "lipo-c",
        "name": "LIPO-C",
        "specs": "10ML MULTIDOSE VIAL",
        "style": "liquid_vial",
        "sub": "Lipotropic Injection Complex",
    },
    {
        "slug": "follistatin-344",
        "name": "Follistatin 344",
        "specs": "1MG LYOPHILIZED VIAL",
        "style": "silver_vial",
        "sub": "Myostatin Inhibitor Protein",
    },
    {
        "slug": "glow-bpc-157-ghk-cu-tb-500-blend",
        "name": "GLOW BLEND",
        "specs": "BPC-157 / GHK-Cu / TB-500",
        "style": "copper_vial",
        "sub": "Tri-Peptide Regenerative Matrix",
    },
]

BATCH_7_MAPPING = {}

def create_base_canvas():
    """Fast NumPy vectorized studio background creation."""
    Y, X = np.ogrid[:1024, :1024]
    dist = np.sqrt((X - 512) ** 2 + (Y - 450) ** 2) / 600.0
    vignette = np.clip(1.0 - 0.08 * (dist ** 1.5), 0.85, 1.0)
    canvas = (np.ones((1024, 1024, 3), dtype=np.float32) * 248 * vignette[..., None]).astype(np.uint8)
    return canvas

def render_amber_bottle(item):
    pil_img = Image.fromarray(create_base_canvas())
    draw = ImageDraw.Draw(pil_img)
    draw.ellipse([292, 805, 732, 895], fill=(215, 218, 222))
    draw.rounded_rectangle([360, 320, 664, 820], radius=40, fill=(120, 70, 20), outline=(90, 50, 10), width=3)
    draw.rounded_rectangle([380, 240, 644, 330], radius=15, fill=(245, 247, 250), outline=(200, 205, 210), width=3)
    for cx in range(395, 630, 15):
        draw.line([cx, 250, cx, 320], fill=(220, 225, 230), width=3)
    draw.rectangle([365, 420, 659, 740], fill=(255, 255, 255), outline=(220, 225, 230), width=2)
    draw.rectangle([365, 420, 659, 470], fill=(4, 120, 87))
    try:
        font_brand = ImageFont.truetype("georgiab.ttf", 22)
        font_name = ImageFont.truetype("arialbd.ttf", 32)
        font_sub = ImageFont.truetype("arial.ttf", 18)
        font_specs = ImageFont.truetype("arialbd.ttf", 22)
    except:
        font_brand = font_name = font_sub = font_specs = ImageFont.load_default()
    draw.text((512, 445), "MCPFAC BIOTECH", fill=(255, 255, 255), font=font_brand, anchor="mm")
    draw.text((512, 530), item["name"], fill=(4, 120, 87), font=font_name, anchor="mm")
    draw.text((512, 580), item["sub"], fill=(70, 80, 95), font=font_sub, anchor="mm")
    draw.text((512, 650), item["specs"], fill=(15, 23, 42), font=font_specs, anchor="mm")
    draw.text((512, 700), "RESEARCH USE ONLY", fill=(180, 80, 80), font=font_sub, anchor="mm")
    return pil_img

def render_white_bottle(item):
    pil_img = Image.fromarray(create_base_canvas())
    draw = ImageDraw.Draw(pil_img)
    draw.ellipse([292, 805, 732, 895], fill=(215, 218, 222))
    draw.rounded_rectangle([360, 320, 664, 820], radius=40, fill=(250, 252, 255), outline=(190, 200, 210), width=4)
    draw.rounded_rectangle([375, 240, 649, 330], radius=15, fill=(235, 240, 245), outline=(180, 190, 200), width=3)
    for cx in range(390, 635, 15):
        draw.line([cx, 250, cx, 320], fill=(210, 218, 226), width=3)
    draw.rectangle([362, 420, 662, 740], fill=(255, 255, 255), outline=(4, 120, 87), width=3)
    draw.rectangle([362, 420, 662, 480], fill=(4, 120, 87))
    try:
        font_brand = ImageFont.truetype("georgiab.ttf", 22)
        font_name = ImageFont.truetype("arialbd.ttf", 34)
        font_sub = ImageFont.truetype("arial.ttf", 18)
        font_specs = ImageFont.truetype("arialbd.ttf", 22)
    except:
        font_brand = font_name = font_sub = font_specs = ImageFont.load_default()
    draw.text((512, 450), "MCPFAC BIOTECH", fill=(255, 255, 255), font=font_brand, anchor="mm")
    draw.text((512, 535), item["name"], fill=(4, 120, 87), font=font_name, anchor="mm")
    draw.text((512, 585), item["sub"], fill=(70, 80, 95), font=font_sub, anchor="mm")
    draw.text((512, 655), item["specs"], fill=(15, 23, 42), font=font_specs, anchor="mm")
    draw.text((512, 705), "RESEARCH USE ONLY", fill=(180, 80, 80), font=font_sub, anchor="mm")
    return pil_img

def render_black_bottle(item):
    pil_img = Image.fromarray(create_base_canvas())
    draw = ImageDraw.Draw(pil_img)
    draw.ellipse([292, 805, 732, 895], fill=(215, 218, 222))
    draw.rounded_rectangle([360, 320, 664, 820], radius=40, fill=(35, 39, 47), outline=(20, 24, 30), width=4)
    draw.rounded_rectangle([375, 240, 649, 330], radius=15, fill=(45, 52, 64), outline=(30, 35, 45), width=3)
    draw.rectangle([375, 315, 649, 330], fill=(4, 120, 87))
    draw.rectangle([362, 420, 662, 740], fill=(255, 255, 255), outline=(4, 120, 87), width=3)
    draw.rectangle([362, 420, 662, 480], fill=(4, 120, 87))
    try:
        font_brand = ImageFont.truetype("georgiab.ttf", 22)
        font_name = ImageFont.truetype("arialbd.ttf", 34)
        font_sub = ImageFont.truetype("arial.ttf", 18)
        font_specs = ImageFont.truetype("arialbd.ttf", 22)
    except:
        font_brand = font_name = font_sub = font_specs = ImageFont.load_default()
    draw.text((512, 450), "MCPFAC BIOTECH", fill=(255, 255, 255), font=font_brand, anchor="mm")
    draw.text((512, 535), item["name"], fill=(4, 120, 87), font=font_name, anchor="mm")
    draw.text((512, 585), item["sub"], fill=(70, 80, 95), font=font_sub, anchor="mm")
    draw.text((512, 655), item["specs"], fill=(15, 23, 42), font=font_specs, anchor="mm")
    draw.text((512, 705), "RESEARCH USE ONLY", fill=(180, 80, 80), font=font_sub, anchor="mm")
    return pil_img

def render_blue_bottle(item):
    pil_img = Image.fromarray(create_base_canvas())
    draw = ImageDraw.Draw(pil_img)
    draw.ellipse([292, 805, 732, 895], fill=(215, 218, 222))
    draw.rounded_rectangle([360, 320, 664, 820], radius=40, fill=(30, 70, 140), outline=(20, 50, 110), width=4)
    draw.rounded_rectangle([375, 240, 649, 330], radius=15, fill=(210, 220, 230), outline=(170, 180, 190), width=3)
    for cx in range(390, 635, 15):
        draw.line([cx, 250, cx, 320], fill=(180, 190, 200), width=3)
    draw.rectangle([365, 420, 659, 740], fill=(255, 255, 255), outline=(220, 225, 230), width=2)
    draw.rectangle([365, 420, 659, 480], fill=(4, 120, 87))
    try:
        font_brand = ImageFont.truetype("georgiab.ttf", 22)
        font_name = ImageFont.truetype("arialbd.ttf", 32)
        font_sub = ImageFont.truetype("arial.ttf", 18)
        font_specs = ImageFont.truetype("arialbd.ttf", 22)
    except:
        font_brand = font_name = font_sub = font_specs = ImageFont.load_default()
    draw.text((512, 450), "MCPFAC BIOTECH", fill=(255, 255, 255), font=font_brand, anchor="mm")
    draw.text((512, 535), item["name"], fill=(4, 120, 87), font=font_name, anchor="mm")
    draw.text((512, 585), item["sub"], fill=(70, 80, 95), font=font_sub, anchor="mm")
    draw.text((512, 655), item["specs"], fill=(15, 23, 42), font=font_specs, anchor="mm")
    draw.text((512, 705), "RESEARCH USE ONLY", fill=(180, 80, 80), font=font_sub, anchor="mm")
    return pil_img

def render_dropper_bottle(item):
    pil_img = Image.fromarray(create_base_canvas())
    draw = ImageDraw.Draw(pil_img)
    draw.ellipse([292, 805, 732, 895], fill=(215, 218, 222))
    draw.rounded_rectangle([375, 380, 649, 830], radius=35, fill=(110, 60, 15), outline=(80, 40, 5), width=4)
    draw.ellipse([460, 180, 564, 260], fill=(30, 35, 42))
    draw.rounded_rectangle([430, 250, 594, 390], radius=12, fill=(40, 45, 55), outline=(25, 30, 38), width=3)
    draw.rectangle([380, 480, 644, 760], fill=(255, 255, 255), outline=(210, 215, 220), width=2)
    draw.rectangle([380, 480, 644, 535], fill=(4, 120, 87))
    try:
        font_brand = ImageFont.truetype("georgiab.ttf", 20)
        font_name = ImageFont.truetype("arialbd.ttf", 26)
        font_sub = ImageFont.truetype("arial.ttf", 16)
        font_specs = ImageFont.truetype("arialbd.ttf", 20)
    except:
        font_brand = font_name = font_sub = font_specs = ImageFont.load_default()
    draw.text((512, 508), "MCPFAC BIOTECH", fill=(255, 255, 255), font=font_brand, anchor="mm")
    draw.text((512, 575), item["name"], fill=(4, 120, 87), font=font_name, anchor="mm")
    draw.text((512, 620), item["sub"], fill=(70, 80, 95), font=font_sub, anchor="mm")
    draw.text((512, 680), item["specs"], fill=(15, 23, 42), font=font_specs, anchor="mm")
    draw.text((512, 730), "RESEARCH USE ONLY", fill=(180, 80, 80), font=font_sub, anchor="mm")
    return pil_img

def render_vial(item, cap_color, label_accent):
    pil_img = Image.fromarray(create_base_canvas())
    draw = ImageDraw.Draw(pil_img)
    draw.ellipse([292, 805, 732, 895], fill=(215, 218, 222))
    draw.rounded_rectangle([390, 360, 634, 820], radius=30, fill=(240, 245, 250), outline=(190, 200, 210), width=4)
    draw.rounded_rectangle([400, 680, 624, 810], radius=15, fill=(255, 255, 255), outline=(230, 235, 240), width=2)
    draw.rectangle([440, 290, 584, 360], fill=(210, 220, 230), outline=(170, 180, 190), width=3)
    draw.rounded_rectangle([420, 240, 604, 300], radius=10, fill=cap_color, outline=(10, 40, 20), width=3)
    draw.rectangle([395, 420, 629, 660], fill=(255, 255, 255), outline=(210, 215, 220), width=2)
    draw.rectangle([395, 420, 629, 475], fill=label_accent)
    try:
        font_brand = ImageFont.truetype("georgiab.ttf", 20)
        font_name = ImageFont.truetype("arialbd.ttf", 24)
        font_sub = ImageFont.truetype("arial.ttf", 15)
        font_specs = ImageFont.truetype("arialbd.ttf", 19)
    except:
        font_brand = font_name = font_sub = font_specs = ImageFont.load_default()
    draw.text((512, 448), "MCPFAC BIOTECH", fill=(255, 255, 255), font=font_brand, anchor="mm")
    draw.text((512, 510), item["name"], fill=(4, 120, 87), font=font_name, anchor="mm")
    draw.text((512, 550), item["sub"], fill=(70, 80, 95), font=font_sub, anchor="mm")
    draw.text((512, 600), item["specs"], fill=(15, 23, 42), font=font_specs, anchor="mm")
    draw.text((512, 640), "RESEARCH USE ONLY", fill=(180, 80, 80), font=font_sub, anchor="mm")
    return pil_img

def render_batch_7():
    for item in BATCH_7_ITEMS:
        style = item["style"]
        if style == "amber_bottle":
            img = render_amber_bottle(item)
        elif style == "white_bottle":
            img = render_white_bottle(item)
        elif style == "black_bottle":
            img = render_black_bottle(item)
        elif style == "blue_bottle":
            img = render_blue_bottle(item)
        elif style == "dropper_bottle":
            img = render_dropper_bottle(item)
        elif style == "silver_vial":
            img = render_vial(item, (200, 210, 220), (4, 120, 87))
        elif style == "copper_vial":
            img = render_vial(item, (184, 115, 51), (4, 120, 87))
        else:
            img = render_vial(item, (4, 120, 87), (4, 120, 87))

        brain_filename = f"{item['slug']}_custom.png"
        out_path = os.path.join(BRAIN_DIR, brain_filename)
        img.save(out_path)
        print(f"Rendered custom distinct design: {brain_filename}")
        BATCH_7_MAPPING[item["slug"]] = brain_filename

def upload_and_sync_all():
    print("\nUploading all 10 Batch 7 custom designed images to Supabase Storage & local web directory...")
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

    print("\nBatch 7 Complete Summary:")
    for slug, url in results.items():
        print(f"  {slug}: {url}")

def main():
    render_batch_7()
    upload_and_sync_all()

if __name__ == "__main__":
    main()
