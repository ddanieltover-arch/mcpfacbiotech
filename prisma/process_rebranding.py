import os
import sys
import json
import time
import requests
import re
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SUPABASE_URL = "https://yoojdbprdgjwzfmyjcif.supabase.co"
KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvb2pkYnByZGdqd3pmbXlqY2lmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDUzMzc0NiwiZXhwIjoyMTAwMTA5NzQ2fQ."
    "0epMtC8V3-bVzkdRvZ0Wb6JJQzoN7iga604d5LbHMgg"
)

BRAIN_DIR = r"C:\Users\User\.gemini\antigravity-ide\brain\828bb7e2-63b8-4e77-a9a9-e5137e69b1d6"
PUBLIC_DIR = r"C:\Users\User\Desktop\MCPFAC BIOTECH\apps\web\public\images\products"

def create_base_canvas():
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

def render_vial(item, cap_color=(27, 67, 50), label_accent=(4, 120, 87)):
    base_path = os.path.join(BRAIN_DIR, "bpc_157_5mg_1784728609257.png")
    if not os.path.exists(base_path):
        # Fallback if base canvas missing (draw simple vial on canvas)
        pil_img = Image.fromarray(create_base_canvas())
        draw = ImageDraw.Draw(pil_img)
        draw.ellipse([292, 805, 732, 895], fill=(215, 218, 222))
        draw.rounded_rectangle([390, 360, 634, 820], radius=30, fill=(240, 245, 250), outline=(190, 200, 210), width=4)
    else:
        img = cv2.imread(base_path)
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(img_rgb)
        
    draw = ImageDraw.Draw(pil_img)
    
    # Patch the label area on the pre-existing base image
    y1, y2 = 572, 704
    x1, x2 = 385, 635
    draw.rectangle([x1, y1, x2, y2], fill=(255, 255, 255))
    draw.rectangle([x1, y1, x2, y1 + 30], fill=label_accent)
    
    # Recoloring cap on base image if cap_color is different from green
    if cap_color != (27, 67, 50):
        # Apply cap overlay color (roughly bounding cap at 420, 240, 604, 300)
        draw.rounded_rectangle([420, 240, 604, 300], radius=10, fill=cap_color, outline=(20, 20, 20), width=2)
        
    try:
        font_brand = ImageFont.truetype("georgiab.ttf", 18)
        font_name = ImageFont.truetype("arialbd.ttf", 26)
        font_sub = ImageFont.truetype("arial.ttf", 16)
        font_specs = ImageFont.truetype("arialbd.ttf", 20)
    except:
        font_brand = font_name = font_sub = font_specs = ImageFont.load_default()
        
    # Draw text
    draw.text((510, y1 + 15), "MCPFAC BIOTECH", fill=(255, 255, 255), font=font_brand, anchor="mm")
    
    name = item["name"]
    font = font_name
    if len(name) > 16:
        try:
            font = ImageFont.truetype("arialbd.ttf", 20)
        except:
            font = font_name
            
    draw.text((510, y1 + 50), name, fill=(4, 120, 87), font=font, anchor="mm")
    draw.text((510, y1 + 80), item["specs"], fill=(15, 23, 42), font=font_specs, anchor="mm")
    draw.text((510, y1 + 110), item["sub"], fill=(70, 80, 95), font=font_sub, anchor="mm")
    return pil_img

def parse_product_details(name, category, slug):
    # Try to find specs inside parentheses first
    parentheses = re.findall(r'\(([^)]+)\)', name)
    clean_name = name
    for p in parentheses:
        clean_name = clean_name.replace(f"({p})", "")
    clean_name = clean_name.strip()
    clean_name = re.sub(r'\s+', ' ', clean_name)
    
    if parentheses:
        specs = " • ".join([p.upper() for p in parentheses])
    else:
        dose_match = re.search(r'\s+(\d+\s*(?:mg|mcg|ml|g|iu|pcs|pack|vial|tablets|pcs))\b', clean_name, re.IGNORECASE)
        if dose_match:
            specs = dose_match.group(1).upper()
            clean_name = clean_name.replace(dose_match.group(0), "").strip()
        else:
            specs = "RESEARCH GRADE"
            
    # Clean up double units if any
    specs = specs.replace("•", "•")
    
    if category in ['ORALS', 'SARMS', 'SKIN CARE', 'ANTI-ESTROGEN']:
        sub = "Oral Research Compound"
    elif 'peptide' in category.lower():
        sub = "Research Peptide"
    elif category == 'INJECTABLES':
        sub = "Lipotropic Injection Complex"
    else:
        sub = "Research Solution"
        
    return {
        "name": clean_name,
        "specs": specs,
        "sub": sub
    }

def main():
    print("Starting process_rebranding.py...")
    plan_path = os.path.join(os.path.dirname(__file__), "rebranding_plan.json")
    if not os.path.exists(plan_path):
        print(f"Error: {plan_path} not found!")
        sys.exit(1)
        
    with open(plan_path, "r", encoding="utf-8") as f:
        plan = json.load(f)
        
    print(f"Loaded plan with {len(plan)} products.")
    
    headers = {
        "Authorization": f"Bearer {KEY}",
        "apiKey": KEY,
        "Content-Type": "image/png",
        "x-upsert": "true",
    }
    
    final_urls = []
    
    # Loop over plan items
    for idx, item in enumerate(plan):
        slug = item["slug"]
        action = item["action"]
        category = item["category"]
        name = item["name"]
        productId = item["id"]
        
        print(f"[{idx+1}/{len(plan)}] Processing '{slug}' (Action: {action})")
        
        local_path = os.path.join(PUBLIC_DIR, f"{slug}.png")
        supabase_url = f"{SUPABASE_URL}/storage/v1/object/public/product-images/{slug}.png"
        
        parsed = parse_product_details(name, category, slug)
        
        success = False
        
        if action == "DOWNLOAD_LEGACY":
            legacy_url = item["legacyUrl"]
            try:
                print(f"  Downloading legacy asset from {legacy_url}...")
                r = requests.get(legacy_url, timeout=15)
                if r.status_code == 200:
                    # Save to local path
                    # Note: We convert any legacy formats (.jpg) to .png locally to keep extensions unified, or keep as is.
                    # Let's save as .png since we write to local_path.
                    # We can use PIL to open the downloaded bytes and save as PNG.
                    from io import BytesIO
                    pil_img = Image.open(BytesIO(r.content))
                    pil_img.save(local_path, "PNG")
                    success = True
                else:
                    print(f"  Failed legacy download: {r.status_code}. Falling back to render.")
            except Exception as e:
                print(f"  Legacy download exception: {e}. Falling back to render.")
                
            if not success:
                # Fallback to render based on category
                if category in ORAL_CATEGORIES:
                    action = "RENDER_BOTTLE"
                else:
                    action = "RENDER_VIAL"
                    
        if action == "USE_INSULIN_SYRINGE_IMAGE":
            # Copy from insulin-syringes-10-pack.png if it exists
            src_syringe = os.path.join(PUBLIC_DIR, "insulin-syringes-10-pack.png")
            if os.path.exists(src_syringe):
                shutil_copy(src_syringe, local_path)
                success = True
            else:
                action = "RENDER_VIAL" # absolute fallback
                
        if action == "USE_COOLER_IMAGE":
            src_cooler = os.path.join(PUBLIC_DIR, "portable-insulin-cooler-case.png")
            if os.path.exists(src_cooler):
                shutil_copy(src_cooler, local_path)
                success = True
            else:
                action = "RENDER_VIAL"
                
        if action == "USE_TRAVEL_CASE_IMAGE":
            src_case = os.path.join(PUBLIC_DIR, "travel-cold-case.png")
            if os.path.exists(src_case):
                shutil_copy(src_case, local_path)
                success = True
            else:
                action = "RENDER_VIAL"
                
        if action == "RENDER_VIAL" or action == "RENDER_VIAL_FALLBACK":
            # Assign cap colors dynamically for premium looks
            # Round robin colors based on index
            cap_colors = [
                (27, 67, 50),   # Emerald green
                (60, 20, 70),   # Deep Purple
                (20, 50, 90),   # Deep Blue
                (80, 45, 15),   # Copper/Amber
            ]
            label_accents = [
                (4, 120, 87),   # Emerald
                (120, 4, 87),   # Magenta
                (4, 87, 120),   # Slate blue
                (120, 87, 4),   # Ochre
            ]
            color_idx = idx % len(cap_colors)
            pil_img = render_vial(parsed, cap_color=cap_colors[color_idx], label_accent=label_accents[color_idx])
            pil_img.save(local_path, "PNG")
            success = True
            
        elif action == "RENDER_BOTTLE":
            # Round robin bottle styles
            bottle_style = idx % 4
            if "dropper" in slug or "liquid" in slug or "solution" in slug:
                pil_img = render_dropper_bottle(parsed)
            elif bottle_style == 0:
                pil_img = render_amber_bottle(parsed)
            elif bottle_style == 1:
                pil_img = render_white_bottle(parsed)
            elif bottle_style == 2:
                pil_img = render_black_bottle(parsed)
            else:
                pil_img = render_blue_bottle(parsed)
            pil_img.save(local_path, "PNG")
            success = True
            
        # Upload to Supabase Storage
        if success and os.path.exists(local_path):
            upload_url = f"{SUPABASE_URL}/storage/v1/object/product-images/{slug}.png"
            try:
                with open(local_path, "rb") as f:
                    r = requests.post(upload_url, headers=headers, data=f.read(), timeout=15)
                if r.status_code in (200, 201):
                    print(f"  Uploaded to Supabase: {supabase_url}")
                else:
                    print(f"  Supabase upload failed: {r.status_code} {r.text}")
            except Exception as e:
                print(f"  Supabase upload exception: {e}")
                
            final_urls.append({
                "productId": productId,
                "url": supabase_url
            })
            
    # Write final rebranded URLs to json
    out_json = os.path.join(os.path.dirname(__file__), "final_rebranded_urls.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(final_urls, f, indent=2)
        
    print(f"Successfully processed all products! Wrote {len(final_urls)} URLs to final_rebranded_urls.json")

def shutil_copy(src, dest):
    import shutil
    shutil.copy(src, dest)

ORAL_CATEGORIES = ORAL_CATEGORIES = [
  'ORALS',
  'SARMS',
  'SKIN CARE',
  'ANTI-ESTROGEN',
]

if __name__ == "__main__":
    main()
