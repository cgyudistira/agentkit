import re
import json
import os

def generate_bundles():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    bundles_md_path = os.path.join(base_dir, "docs", "BUNDLES.md")
    output_path = os.path.join(base_dir, "lib", "bundles.json")

    if not os.path.exists(bundles_md_path):
        print(f"❌ Could not find {bundles_md_path}")
        return

    with open(bundles_md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    bundles = {}
    current_bundle = None

    lines = content.split('\n')
    for line in lines:
        # Detect Bundle Header: ## 🚀 The "Essentials" Starter Pack
        header_match = re.match(r'^##\s+(.*)', line)
        if header_match:
            title = header_match.group(1).strip()
            # Generate ID from title (e.g., "essentials")
            # Remove emoji and quotes
            clean_title = re.sub(r'[^\w\s-]', '', title).strip()
            # Extract main name: "The Essentials Starter Pack" -> "Essentials"
            # Logic: simplistic approach, just kebab-case the whole clean title or try to extract "The X Pack"
            
            # Better logic: Use the part inside quotes if available
            quote_match = re.search(r'"([^"]+)"', title)
            if quote_match:
                bundle_id = quote_match.group(1).lower().replace(' ', '-')
            else:
                bundle_id = clean_title.lower().replace(' ', '-')

            current_bundle = bundle_id
            bundles[current_bundle] = {
                "title": title,
                "description": "",
                "skills": []
            }
            continue

        if current_bundle:
            # Detect Description: _For everyone. Install these first._
            desc_match = re.match(r'^_(.*)_$', line.strip())
            if desc_match and not bundles[current_bundle]["description"]:
                bundles[current_bundle]["description"] = desc_match.group(1).strip()
                continue

            # Detect Skill: - `concise-planning`: Description
            skill_match = re.match(r'-\s+`([^`]+)`', line.strip())
            if skill_match:
                skill_id = skill_match.group(1)
                bundles[current_bundle]["skills"].append(skill_id)

    # Ensure lib directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(bundles, f, indent=2)

    print(f"✅ Generated {len(bundles)} bundles into {output_path}")
    for b_id, b_data in bundles.items():
        print(f"  - {b_id}: {len(b_data['skills'])} skills")

if __name__ == "__main__":
    generate_bundles()
