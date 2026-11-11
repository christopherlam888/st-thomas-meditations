#!/usr/bin/env python3
"""Generate site data: public/book.json, src/data/index.ts, and page images."""
import json, os, re

data = json.load(open('work/book.json'))

os.makedirs('public/images', exist_ok=True)

# ---- extract cover + frontispiece + plate images from the PDF ----
import fitz
doc = fitz.open('upload/Saint Thomas Aquinas Meditations For Every day -- Father E_ C_ Mceniry -- 1941.pdf')

def render_page(idx, out, max_w=900):
    page = doc[idx]
    zoom = max_w / page.rect.width
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
    pix.save(out)
    print('saved', out, pix.width, 'x', pix.height)

render_page(0, 'public/images/cover.jpg', 700)      # book cover
render_page(545, 'public/images/frontispiece.jpg', 900)  # St. Thomas plate
render_page(312, 'public/images/blessed-sacrament.jpg', 900)  # praying before the Blessed Sacrament
doc.close()

# ---- book.json (full content) ----
book = {
    'meta': data['meta'],
    'meditations': data['meditations'],
    'retreats': data['retreats'],
    'prayers': data['prayers'],
    'referencesNote': data['referencesNote'],
}
with open('public/book.json', 'w') as f:
    json.dump(book, f, ensure_ascii=False, separators=(',', ':'))
print('public/book.json:', os.path.getsize('public/book.json') // 1024, 'KB')

# ---- lightweight index for instant UI ----
index = []
for m in data['meditations']:
    index.append({
        'id': m['id'], 'part': m['part'], 'section': m['section'], 'kind': m['kind'],
        'label': m['label'], 'title': m['title'], 'month': m['month'], 'day': m['day'],
        'easterOffset': m['easterOffset'], 'octoberSunday': m['octoberSunday'],
    })

retreat_index = [{'i': i, 'title': r['title']} for i, r in enumerate(data['retreats'])]

ts = '''// AUTO-GENERATED from the book extraction — do not edit by hand.
export interface MeditationMeta {
  id: number;
  part: 1 | 2;
  section: string;
  kind: "fixed" | "movable" | "sunday" | "topic";
  label: string;
  title: string | null;
  month: number | null;
  day: number | null;
  easterOffset: number | null;
  octoberSunday: number | null;
}

export const MEDITATION_INDEX: MeditationMeta[] = ''' + json.dumps(index, ensure_ascii=False, separators=(',', ':')) + ''';

export const RETREAT_INDEX: { i: number; title: string }[] = ''' + json.dumps(retreat_index, ensure_ascii=False, separators=(',', ':')) + ''';

export const SECTIONS: { key: string; name: string; part: 1 | 2 }[] = [
  { key: "advent", name: "During the Time of Advent", part: 1 },
  { key: "christmas", name: "The Time of Our Saviour\\u2019s Birth", part: 1 },
  { key: "septuagesima", name: "Septuagesima", part: 1 },
  { key: "lent", name: "Lent", part: 1 },
  { key: "paschal", name: "The Paschal Season", part: 1 },
  { key: "ascension", name: "Ascension Tide", part: 1 },
  { key: "god", name: "On God", part: 2 },
  { key: "purgative", name: "On the Purgative Life", part: 2 },
  { key: "illuminative", name: "On the Illuminative Life", part: 2 },
  { key: "unitive", name: "On the Unitive Life", part: 2 },
  { key: "perfect", name: "The Perfect Life", part: 2 },
  { key: "lastthings", name: "The Last Things", part: 2 },
];
'''
open('src/data/index.ts', 'w').write(ts)
print('src/data/index.ts:', os.path.getsize('src/data/index.ts') // 1024, 'KB')
