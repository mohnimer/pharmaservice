#!/usr/bin/env python3
"""Import unchanged original photographs; reconcile evidence without publishing.

Usage: python3 tools/import-batch33-source.py EXTRACTED_BUILDER_PACK
Requires Pillow. Exact family/name matching only; every candidate remains HOLD.
"""
import csv
import hashlib
import json
import shutil
import sys
import unicodedata
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
norm = lambda s: " ".join(unicodedata.normalize("NFKC", str(s or "")).upper().split())
def read_csv(name):
    with (ROOT / "docs" / name).open(newline="") as f:
        return list(csv.DictReader(f))

def run(source):
    manifest_bytes = (source / "batch_manifest.json").read_bytes()
    products = json.loads(manifest_bytes)["products"]
    originals = source / "deduped_product_source_images"
    local = read_csv("local-catalogue-overlay-variant-audit-20261011.csv")
    live = read_csv("live-variant-audit-20261011.csv")
    assert len(products) == 150 and len(local) == 193 and len(live) == 719
    files, hashes, prepared = set(), set(), []
    # Validate the entire batch before writing anything.
    for p in products:
        name = p["Image Asset File"]
        assert Path(name).name == name and name.endswith(".jpg"), name
        raw = (originals / name).read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        assert name not in files and digest not in hashes, name
        files.add(name); hashes.add(digest)
        with Image.open(originals / name) as im:
            im.load()
            assert im.format == "JPEG" and im.size == (1200, 1200), name
        prepared.append((p, name, digest))
    assert files == {p.name for p in originals.glob("*.jpg")}
    destination = ROOT / "staging/catalogue-batch33/originals"
    destination.mkdir(parents=True, exist_ok=True)
    links, register = [], []
    for p, name, digest in prepared:
        family = p["PSC Family ID"]
        lm = [o for o in local if o["family_id"] == family and norm(o["exact_product_name"]) == norm(p["Product"])]
        # The source master identity is a separate exact key, never a fuzzy alias.
        dm = [o for o in live if o["family_id"] == family and p["Existing Master Product"] and norm(o["exact_product_name"]) == norm(p["Existing Master Product"])]
        shutil.copyfile(originals / name, destination / name)
        register.append(dict(source_name=p["Product"], family_id=family,
            existing_master_product=p["Existing Master Product"],
            file="staging/catalogue-batch33/originals/" + name, sha256=digest,
            width=1200, height=1200, source_pack_claim=p["Pack / Spec Status"],
            local_option_ids=[o["product_option_id"] for o in lm],
            database_option_ids=[o["product_option_id"] for o in dm],
            release_status="HOLD", image_verified=False, price_verified=False))
        for origin, matches in [("LOCAL", lm), ("DATABASE", dm)]:
            for o in matches:
                links.append(dict(origin=origin, family_id=family,
                    product_option_id=o["product_option_id"], exact_product_name=o["exact_product_name"],
                    brand=o["brand"], recorded_pack=o["pack"], source_name=p["Product"],
                    source_pack_claim=p["Pack / Spec Status"], image_file=register[-1]["file"],
                    image_sha256=digest, identity_status="EXACT_FAMILY_AND_NAME" if len(matches)==1 else "COLLISION",
                    listed_mrp=o.get("listed_mrp",""), price_status="UNAPPROVED_MRP" if float(o.get("listed_mrp") or 0)>0 else "MISSING",
                    release_status="HOLD"))
    (destination.parent / "source-manifest.json").write_bytes(manifest_bytes)
    (destination.parent / "candidate-image-register.json").write_text(json.dumps(register, indent=2)+"\n")
    with (ROOT / "docs/batch33-option-evidence-reconciliation.csv").open("w", newline="") as f:
        writer=csv.DictWriter(f, fieldnames=list(links[0])); writer.writeheader(); writer.writerows(links)
    linked={(r["origin"],r["product_option_id"]) for r in links}
    inventory=[]
    for origin, options in [("LOCAL",local),("DATABASE",live)]:
        for o in options:
            inventory.append(dict(origin=origin, product_option_id=o["product_option_id"],
                family_id=o["family_id"], exact_product_name=o["exact_product_name"], brand=o["brand"],
                pack=o["pack"], batch33_candidate=("YES" if (origin,o["product_option_id"]) in linked else "NO"),
                recorded_image=o["image_url"], listed_mrp=o.get("listed_mrp",""),
                image_status="NEEDS_VISUAL_IDENTITY_REVIEW", description_status="NEEDS_EXACT_SPEC_EVIDENCE",
                price_status="UNAPPROVED_MRP" if float(o.get("listed_mrp") or 0)>0 else "MISSING",
                release_status="HOLD"))
    with (ROOT / "docs/catalogue-option-release-inventory.csv").open("w",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=list(inventory[0]));writer.writeheader();writer.writerows(inventory)
    summary=dict(source_images=len(register),source_manifest_sha256=hashlib.sha256(manifest_bytes).hexdigest(),
        local_options=len(local),database_options=len(live),
        local_candidate_links=sum(r["origin"]=="LOCAL" for r in links),
        database_candidate_links=sum(r["origin"]=="DATABASE" for r in links),
        existing_master_local_links=sum(bool(r["existing_master_product"]) and bool(r["local_option_ids"]) for r in register),
        new_to_master_local_links=sum(not r["existing_master_product"] and bool(r["local_option_ids"]) for r in register),
        source_pack_uncertain=sum(r["source_pack_claim"]!="CONFIRMED FROM FRONT PACK / EXISTING SOURCE" for r in register),
        approved_images=0,approved_prices=0,production_changed=False)
    (destination.parent / "import-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
    print(json.dumps(summary,indent=2))

if __name__ == "__main__":
    run(Path(sys.argv[1]).resolve())
