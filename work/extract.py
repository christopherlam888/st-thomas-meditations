#!/usr/bin/env python3
"""Extract the full contents of the McEniry 1941 Meditations book into JSON."""
import json, re, difflib, os

def load_pages():
    """Extract the text layer of every PDF page (cached to work/pages.json)."""
    if os.path.exists('work/pages.json'):
        return json.load(open('work/pages.json'))
    import pypdf
    r = pypdf.PdfReader('upload/Saint Thomas Aquinas Meditations For Every day -- Father E_ C_ Mceniry -- 1941.pdf')
    pp = []
    for p in r.pages:
        try:
            pp.append(p.extract_text() or '')
        except Exception:
            pp.append('')
    os.makedirs('work', exist_ok=True)
    json.dump(pp, open('work/pages.json', 'w'))
    return pp

pages = load_pages()

MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
MONTH_IDX = {m: i+1 for i, m in enumerate(MONTHS)}

# ----------------------------------------------------------------------------
# Movable (liturgical) headers: (pdf_page, canonical_label, offset_from_easter)
# ----------------------------------------------------------------------------
MOVABLE = [
    (136, 'Septuagesima Sunday', -63),
    (138, 'Monday within Septuagesima', -62),
    (139, 'Tuesday within Septuagesima', -61),
    (141, 'Wednesday within Septuagesima', -60),
    (142, 'Thursday within Septuagesima', -59),
    (144, 'Friday within Septuagesima', -58),
    (146, 'Saturday within Septuagesima', -57),
    (147, 'Sexagesima Sunday', -56),
    (149, 'Monday within Sexagesima', -55),
    (150, 'Tuesday within Sexagesima', -54),
    (152, 'Wednesday within Sexagesima', -53),
    (153, 'Thursday within Sexagesima', -52),
    (155, 'Friday within Sexagesima', -51),
    (157, 'Saturday within Sexagesima', -50),
    (158, 'Quinquagesima Sunday', -49),
    (160, 'Monday within Quinquagesima', -48),
    (161, 'Tuesday within Quinquagesima', -47),
    (162, 'Ash Wednesday', -46),
    (163, 'Thursday after Ash Wednesday', -45),
    (164, 'Friday after Ash Wednesday', -44),
    (165, 'Saturday after Ash Wednesday', -43),
    (167, 'First Sunday of Lent', -42),
    (168, 'Monday of the First Week of Lent', -41),
    (169, 'Tuesday of the First Week of Lent', -40),
    (170, 'Wednesday of the First Week of Lent', -39),
    (171, 'Thursday of the First Week of Lent', -38),
    (173, 'Friday of the First Week of Lent', -37),
    (174, 'Saturday of the First Week of Lent', -36),
    (175, 'Second Sunday of Lent', -35),
    (176, 'Monday of the Second Week of Lent', -34),
    (177, 'Tuesday of the Second Week of Lent', -33),
    (178, 'Wednesday of the Second Week of Lent', -32),
    (180, 'Thursday of the Second Week of Lent', -31),
    (181, 'Friday of the Second Week of Lent', -30),
    (182, 'Saturday of the Second Week of Lent', -29),
    (184, 'Third Sunday of Lent', -28),
    (185, 'Monday of the Third Week of Lent', -27),
    (186, 'Tuesday of the Third Week of Lent', -26),
    (187, 'Wednesday of the Third Week of Lent', -25),
    (188, 'Thursday of the Third Week of Lent', -24),
    (190, 'Friday of the Third Week of Lent', -23),
    (191, 'Saturday of the Third Week of Lent', -22),
    (192, 'Fourth Sunday of Lent', -21),
    (193, 'Monday of the Fourth Week of Lent', -20),
    (195, 'Tuesday of the Fourth Week of Lent', -19),
    (196, 'Wednesday of the Fourth Week of Lent', -18),
    (197, 'Thursday of the Fourth Week of Lent', -17),
    (199, 'Friday of the Fourth Week of Lent', -16),
    (200, 'Saturday of the Fourth Week of Lent', -15),
    (201, 'Passion Sunday', -14),
    (203, 'Monday of Passion Week', -13),
    (205, 'Tuesday of Passion Week', -12),
    (206, 'Wednesday of Passion Week', -11),
    (207, 'Thursday of Passion Week', -10),
    (209, 'Friday of Passion Week', -9),
    (210, 'Saturday of Passion Week', -8),
    (211, 'Palm Sunday', -7),
    (213, 'Monday after Palm Sunday', -6),
    (214, 'Tuesday after Palm Sunday', -5),
    (215, 'Wednesday after Palm Sunday', -4),
    (217, 'Thursday of Holy Week', -3),
    (218, 'Good Friday', -2),
    (220, 'Holy Saturday', -1),
    (222, 'Easter Sunday', 0),
    (223, 'Easter Monday', 1),
    (224, 'Tuesday within the Octave of Easter', 2),
    (225, 'Wednesday within the Octave of Easter', 3),
    (226, 'Thursday within the Octave of Easter', 4),
    (228, 'Friday within the Octave of Easter', 5),
    (229, 'Saturday within the Octave of Easter', 6),
    (230, 'Sunday in the Octave of Easter', 7),
    (232, 'Monday after the Octave of Easter', 8),
    (233, 'Tuesday after the Octave of Easter', 9),
    (235, 'Wednesday after the Octave of Easter', 10),
    (236, 'Saturday after the Octave of Easter', 13),
    (238, 'Second Sunday after Easter', 14),
    (239, 'Monday within the Second Week after Easter', 15),
    (241, 'Thursday within the Second Week after Easter', 18),
    (242, 'Friday within the Second Week after Easter', 19),
    (244, 'Saturday within the Second Week after Easter', 20),
    (245, 'Third Sunday after Easter', 21),
    (246, 'Monday within the Third Week after Easter', 22),
    (247, 'Tuesday within the Third Week after Easter', 23),
    (249, 'Wednesday within the Third Week after Easter', 24),
    (251, 'Thursday within the Third Week after Easter', 25),
    (253, 'Friday within the Third Week after Easter', 26),
    (254, 'Saturday within the Third Week after Easter', 27),
    (256, 'Fourth Sunday after Easter', 28),
    (258, 'Monday within the Fourth Week after Easter', 29),
    (259, 'Tuesday within the Fourth Week after Easter', 30),
    (261, 'Wednesday within the Fourth Week after Easter', 31),
    (262, 'Thursday within the Fourth Week after Easter', 32),
    (263, 'Friday of the Fourth Week after Easter', 33),
    (264, 'Saturday within the Fourth Week after Easter', 34),
    (265, 'Fifth Sunday after Easter', 35),
    (266, 'Monday within the Fifth Week after Easter (Rogation Days)', 36),
    (268, 'Tuesday within the Fifth Week after Easter (Rogation Days)', 37),
    (269, 'Wednesday within the Fifth Week after Easter (Rogation Days)', 38),
    (271, 'The Ascension of Christ', 39),
    (272, 'Friday within the Octave of the Ascension', 40),
    (274, 'Saturday within the Octave of the Ascension', 41),
    (275, 'Sunday within the Octave of the Ascension', 42),
    (276, 'Monday within the Octave of the Ascension', 43),
    (278, 'Tuesday within the Octave of the Ascension', 44),
    (279, 'Wednesday within the Octave of the Ascension', 45),
    (281, 'Thursday within the Octave of the Ascension', 46),
    (282, 'Friday after the Octave of the Ascension', 47),
    (284, 'Saturday in the Vigil of Pentecost', 48),
    (285, 'The Feast of Pentecost', 49),
    (287, 'Monday within the Octave of Pentecost', 50),
    (288, 'Tuesday within the Octave of Pentecost', 51),
    (289, 'Wednesday within the Octave of Pentecost', 52),
    (291, 'Thursday within the Octave of Pentecost', 53),
    (292, 'Friday within the Octave of Pentecost', 54),
    (293, 'The Feast of the Blessed Trinity', 56),
    (295, 'Monday within the Octave of Trinity', 57),
    (296, 'Tuesday within the Octave of Trinity', 58),
    (297, 'Wednesday within the Octave of Trinity', 59),
    (299, 'The Feast of Corpus Christi', 60),
    (300, 'Friday within the Octave of Corpus Christi', 61),
    (301, 'Saturday within the Octave of Corpus Christi', 62),
    (302, 'Sunday within the Octave of Corpus Christi', 63),
    (303, 'Saturday after the Octave of Corpus Christi', 69),
    (305, 'Monday within the Octave of Corpus Christi', 64),
    (306, 'Tuesday within the Octave of Corpus Christi', 65),
    (307, 'Wednesday within the Octave of Corpus Christi', 66),
    (308, 'Thursday within the Octave of Corpus Christi', 67),
    (309, 'The Feast of the Sacred Heart of Jesus', 68),
    (310, 'Sunday after the Octave of Corpus Christi', 70),
]

# Fixed-date OCR specials: (page, exact_line_prefix) -> month/day
FIXED_SPECIALS = [
    (351, 'JULY 380', 7, 30),
    (382, "' AUGUST 24", 8, 24),
]

# Extra hidden meditations (no date header of their own):
# (pdf_page, match_text, label, kind, month, day, october_sunday_index)
EXTRA_HEADERS = [
    (41, 'Annunciation of the Blessed Virgin', 'December 11', 'fixed', 12, 11, None, 'Annunciation of the Blessed Virgin'),
    (42, 'Mary Help of Christians', 'December 11', 'fixed', 12, 11, None, 'Mary Help of Christians'),
    (434, 'FIRST SUNDAY IN OCTOBER', 'First Sunday in October', 'sunday', None, None, 1, None),
    (436, 'SECOND SUNDAY IN OCTOBER', 'Second Sunday in October', 'sunday', None, None, 2, None),
    (437, 'THIRD SUNDAY IN OCTOBER', 'Third Sunday in October', 'sunday', None, None, 3, None),
    (439, 'The Dedication of a Church', 'The Dedication of a Church', 'topic', None, None, None, 'The Dedication of a Church'),
]

# Retreat topics: (pdf_page, line_index, title)
RETREATS = [
    (522, 28, 'The Voice of God Calling Us'),
    (523, 33, 'The First Charity Which Must Be Regained'),
    (525, 17, 'The Second Death'),
    (527, 1, 'The State of Perfection'),
    (528, 7, 'The Usefulness of the Vows'),
    (529, 1, 'The Good Use of Time'),
    (530, 16, 'Is Poverty Required for Religious Perfection?'),
    (531, 23, 'Obedience Belongs to Religious Perfection'),
    (532, 25, 'It Is Required for Religious Perfection That Poverty, Continence and Obedience Should Come Under a Vow'),
    (533, 19, 'Is It Right to Say That Religious Perfection Consists in the Three Vows?'),
    (534, 18, 'The Vow of Obedience Is the Chief of the Three Religious Vows'),
    (535, 16, 'The Sin of Religious and of Priests'),
    (536, 23, 'The Works of the Active Life'),
    (537, 38, 'How a Religious Who Sins Slightly May Rise Quickly'),
    (538, 24, 'The Study of the Letters (or Sciences)'),
    (540, 1, 'The Works of Religious'),
    (541, 7, 'Faithfulness'),
]

def norm(s):
    return re.sub(r'[^A-Z0-9 ]', '', s.upper()).strip()

def get_lines(p):
    """Raw lines of a page (with index), stripped."""
    return [(i, l.strip()) for i, l in enumerate(pages[p].split('\n'))]

def is_running_header(l):
    if 'MEDITATIONS OF' in l and 'THOMAS' in l.upper():
        return True
    if l == 'ADDENDA' or re.match(r'^\d{1,3}\s+ADDENDA$', l) or re.match(r'^ADDENDA\s+\d{1,3}$', l):
        return True
    return False

def page_body_lines(p):
    """Lines of a page with running header / standalone page numbers removed."""
    out = []
    for i, l in get_lines(p):
        if is_running_header(l):
            continue
        if re.match(r'^\d{1,3}\)?\.?$', l) and i <= 2:
            continue
        out.append((i, l))
    return out

# ----------------------------------------------------------------------------
# Locate all meditation headers
# ----------------------------------------------------------------------------
headers = []  # (page, line_idx, n_lines, kind, label, month, day, offset)

# fixed headers
for p in range(21, 521):
    for i, l in get_lines(p):
        m = re.match(r'^(' + '|'.join(MONTHS) + r')\s+(\d{1,2})\.?\s*$', l)
        if m:
            headers.append((p, i, 1, 'fixed', f"{m.group(1).title()} {int(m.group(2))}",
                            MONTH_IDX[m.group(1)], int(m.group(2)), None, None))

# fixed specials
for p, prefix, mo, d in FIXED_SPECIALS:
    for i, l in get_lines(p):
        if l == prefix:
            headers.append((p, i, 1, 'fixed', f"{MONTHS[mo-1].title()} {d}", mo, d, None, None))
            break
    else:
        raise SystemExit(f'Special fixed header not found on page {p}: {prefix}')

# movable headers - fuzzy locate
def locate_movable(p, label):
    target = norm(label)
    # strip parenthetical from label for matching
    target = norm(re.sub(r'\(.*?\)', '', label))
    lines = page_body_lines(p)
    candidates = []
    for idx in range(len(lines)):
        for span in (1, 2, 3):
            if idx + span > len(lines):
                continue
            cand = ' '.join(lines[idx + k][1] for k in range(span))
            ratio = difflib.SequenceMatcher(None, target, norm(cand)).ratio()
            candidates.append((ratio, span, lines[idx][0]))
    if not candidates:
        return None
    best = max(candidates, key=lambda c: c[0])
    # prefer the SMALLEST span among near-equal ratios (avoid swallowing titles)
    for ratio, span, li in candidates:
        if span == 1 and ratio >= best[0] - 0.05:
            return (ratio, li, 1)
    # prefer span 2 over 3 when close
    for ratio, span, li in sorted(candidates, key=lambda c: (-c[0], c[1])):
        if span == 2 and ratio >= best[0] - 0.05:
            return (ratio, li, 2)
    return best

for p, label, off in MOVABLE:
    best = locate_movable(p, label)
    if best is None or best[0] < 0.55:
        raise SystemExit(f'Movable header not located: p{p} "{label}" best={best}')
    headers.append((p, best[1], best[2], 'movable', label, None, None, off, None))

# extra hidden meditations
for p, match, label, kind, mo, d, octsun, title_override in EXTRA_HEADERS:
    best = locate_movable(p, match)
    if best is None or best[0] < 0.55:
        raise SystemExit(f'Extra header not located: p{p} "{match}" best={best}')
    headers.append((p, best[1], best[2], kind, label, mo, d, octsun, title_override))

# dedupe & sort
seen = {}
for h in headers:
    key = (h[0], h[1])
    if key in seen:
        raise SystemExit(f'Duplicate header position: {h} vs {seen[key]}')
    seen[key] = h
headers.sort(key=lambda h: (h[0], h[1]))

print(f'Total headers: {len(headers)} (fixed={sum(1 for h in headers if h[3]=="fixed")}, movable={sum(1 for h in headers if h[3]=="movable")})')

# ----------------------------------------------------------------------------
# Text helpers
# ----------------------------------------------------------------------------
def clean_text(s):
    s = s.replace('‘‘', '“').replace('““', '“').replace('’’', '”').replace('””', '”')
    s = s.replace('  ', ' ')
    return s.strip()

TERMINAL = tuple(['.', '!', '?', '.”', '’”', '.)', '.”’', ':', '.””'])

def looks_like_point(l):
    return bool(re.match(r'^_?\s*\d{1,2}\.\s+\S', l))

def join_paragraph(lines, avg=58):
    """Join hard-wrapped lines into a paragraph; caller pre-merged hyphens."""
    t = re.sub(r'\s+', ' ', ' '.join(lines)).strip()
    t = re.sub(r'^_+\s*', '', t)   # OCR underscore before numbered points
    t = re.sub(r'^(\d{1,2})[,_]\s', r'. ', t)  # '4,' -> '4.'
    return t.strip()

def dehyphenate(lines):
    """Merge line-end hyphens: ['con-', 'descendeth'] -> ['condescendeth']."""
    out = []
    buf = None
    for l in lines:
        if buf is None:
            buf = l
        else:
            buf = buf + l
        if buf.endswith('-') and len(buf) > 1 and not buf.endswith('--'):
            # hold: merge with next line, dropping the hyphen
            buf = buf[:-1]
            continue
        out.append(buf)
        buf = None
    if buf:
        out.append(buf)
    return out

def paragraphs_from_lines(lines):
    """Split cleaned body lines into paragraphs."""
    # split into blocks at numbered points
    blocks, cur = [], []
    for l in lines:
        if looks_like_point(l) and cur:
            blocks.append(cur)
            cur = [l]
        else:
            cur.append(l)
    if cur:
        blocks.append(cur)
    paras = []
    for b in blocks:
        # within a block, break at short terminal lines
        pieces, cur = [], []
        for l in b:
            cur.append(l)
            if l.endswith(TERMINAL) and len(l) < 50:
                pieces.append(cur)
                cur = []
        if cur:
            pieces.append(cur)
        for pc in pieces:
            pc = dehyphenate(pc)
            t = join_paragraph(pc)
            if not t:
                continue
            words = re.findall(r'[A-Za-z]+', t)
            if not words:
                continue  # no letters at all
            if len(words) < 3 and max(len(w) for w in words) < 4:
                continue  # OCR junk fragment
            paras.append(t)
    return paras

SMALL = {'a','an','the','of','in','to','and','or','for','with','as','at','by','is','was','be','on','from','that','his','her','it','not','but','our','unto','into','over','through'}

def title_like(l):
    if not l or looks_like_point(l):
        return False
    if re.match(r'^\(', l):
        return False
    # all-caps lines are sub-headers (e.g. ROGATION), not titles
    letters = [c for c in l if c.isalpha()]
    if letters and sum(1 for c in letters if c.isupper()) / len(letters) > 0.8:
        return False
    body = l.strip('“”‘’ ')
    words = re.findall(r"[A-Za-z’']+", body)
    if not words:
        return False
    if not words[0][0].isupper():
        return False
    if len(words) == 1:
        return len(body) < 30 and not l.rstrip('. ').endswith('.')
    up = sum(1 for w in words if w[0].isupper())
    if up / len(words) < 0.5:
        return False
    if re.sub(r'\s*\.\.\.\s*$', '', l).endswith('.'):
        return False
    return True

CIT = re.compile(r'\(([A-Za-z0-9 .,:;IVXLC]+?)\)\s*$')

# ----------------------------------------------------------------------------
# Extract each meditation
# ----------------------------------------------------------------------------
def lines_between(start, end):
    """Yield (page, raw_line) strictly after header `start` and before `end`."""
    sp, si, sn = start
    ep, ei = (end[0], end[1]) if end else (10**6, 0)
    for p in range(sp, min(ep, 521) + 1):
        if p > 520:
            break
        for i, l in page_body_lines(p):
            if p == sp and i < si + sn:
                continue
            if p == ep and i >= ei:
                continue
            if not l:
                continue
            yield (p, i, l)

CAPTION = 'ST. THOMAS AQUINAS PRAYING BEFORE THE BLESSED SACRAMENT'
ROG = re.compile(r'^(MEDITATION FOR )?(ROGATION DAYS?\.? ?\d?)\s*$')

meditations = []
for n, h in enumerate(headers):
    nxt = headers[n + 1] if n + 1 < len(headers) else None
    p, si, sn, kind, label, mo, d, off, title_override = h
    raw = [l for (_, _, l) in lines_between((p, si, sn), nxt)]
    # drop image caption + rogation sub-headers + junk
    body_lines = []
    for l in raw:
        if l == CAPTION:
            continue
        if ROG.match(l):
            continue
        if l == '; .' or l == '—':
            continue
        body_lines.append(l)

    # title extraction
    title = title_override
    idx = 0

    def title_cont(l):
        """Strict rule for a *continuation* line of a multi-line title."""
        if not l or l.startswith('“') or l.startswith('‘') or looks_like_point(l):
            return False
        if ':' in l or '(' in l:
            return False
        letters = [c for c in l if c.isalpha()]
        if letters and sum(1 for c in letters if c.isupper()) / len(letters) > 0.85:
            return False  # all caps -> sub-header
        words = re.findall(r"[A-Za-z’']+", l)
        if len(words) < 2:
            return len(l.strip()) < 20 and bool(letters) and letters[0].isupper()
        if not words[0][0].isupper():
            return False
        up = sum(1 for w in words if w[0].isupper())
        return up / len(words) >= 0.7 and not l.rstrip('. ').endswith('.')

    if title is None and body_lines and body_lines[0].startswith('“'):
        l0 = body_lines[0]
        l1 = body_lines[1] if len(body_lines) > 1 else ''
        if l0.endswith('”') and len(l0) < 80 and title_like(l0[1:-1]) and not CIT.search(l0):
            title = l0
            idx = 1
        elif ('”' not in l0 and l1.endswith('”') and len(l0) + len(l1) < 90
              and title_like((l0 + ' ' + l1)[1:-1])):
            title = l0 + ' ' + l1
            idx = 2
    if title is None and body_lines and title_like(body_lines[0]):
        title = body_lines[0]
        idx = 1
        if (len(body_lines) > 1 and title_cont(body_lines[1])
                and not body_lines[0].endswith(TERMINAL)
                and len(title) + len(body_lines[1]) < 105):
            title = title + ' ' + body_lines[1]
            idx = 2
            if (len(body_lines) > 2 and title_cont(body_lines[2])
                    and len(title) + len(body_lines[2]) < 145):
                title = title + ' ' + body_lines[2]
                idx = 3


    def clean_title(t):
        t = re.sub(r'\s*\.\.\.\s*$', '', t).strip()
        t = re.sub(r'\s*\.\s*$', '', t).strip()
        if t.startswith('“') and t.endswith('”') and '"' not in t[1:-1]:
            t = t[1:-1]
        return t

    if title:
        title = clean_title(title)

    rest = body_lines[idx:]

    # epigraph: leading pure quoted block ending with a scripture citation
    FRAG = re.compile(r'^[IVXLCDM]+,?\s*[\d\s,.\-]+\)?\.?$')
    epigraph = None
    if rest and rest[0][:1] in '“‘':
        acc, end_found, strip_dangle, split_done = [], False, False, False
        k = 0
        while k < min(8, len(rest)):
            l = rest[k]
            # citation + trailing text on the same line -> split line
            if k == 0 and not acc:
                msp = re.search(r'\([^()]*\d[^()]*\)\.?(?=\s+\S)', l)
                if msp:
                    acc.append(l[:msp.end()].strip())
                    rest = [l[msp.end():].strip()] + list(rest[1:])
                    end_found = split_done = True
                    break
            acc.append(l)
            joined = ' '.join(dehyphenate(acc))
            if not (joined.count('“') == 1 and 'said' not in joined[:60]) or len(joined) > 340:
                break
            nxt = rest[k + 1].strip() if k + 1 < len(rest) else ''
            mc = re.search(r'\(([^()]*)\)\s*\.?$', joined)
            if mc and (any(c.isdigit() for c in mc.group(1)) or mc.group(1).rstrip().endswith('.')):
                end_found = True
                break
            md = re.search(r'\(([^()]*)$', joined)
            if md:  # dangling citation start, e.g. "(Luke" or "(Phil."
                if FRAG.match(nxt):
                    acc.append(rest[k + 1])
                    k += 1
                else:
                    strip_dangle = True
                end_found = True
                break
            if l.rstrip().endswith('”'):
                if k > 0 or len(joined) < 90:
                    if re.match(r'^\([^()]*\d[^()]*\)\.?$', nxt):  # citation on next line
                        acc.append(rest[k + 1])
                        k += 1
                    end_found = True
                    break
            if k > 0 and FRAG.match(l.strip()):
                end_found = True
                break
            k += 1
        if end_found:
            epi = ' '.join(dehyphenate(acc))
            if strip_dangle:
                epi = re.sub(r'\s*\([^()]*$', '', epi)
            epigraph = clean_text(epi)
            if not split_done:
                rest = rest[k + 1:]

    def clean_epigraph(t):
        t = clean_text(t)
        t = t.replace('”’', '”').replace('“‘', '“').replace('‘“', '“')
        return t.strip()

    paras = paragraphs_from_lines([clean_text(x) for x in rest if clean_text(x)])

    meditations.append({
        'part': 1 if p < 314 else 2,
        'label': label,
        'kind': kind,
        'month': mo,
        'day': d,
        'easterOffset': off if kind == 'movable' else None,
        'octoberSunday': off if kind == 'sunday' else None,
        'title': clean_text(title) if title else None,
        'epigraph': clean_epigraph(epigraph) if epigraph else None,
        'paragraphs': paras,
        'page': p + 1,  # 1-based pdf page for reference
    })

# ----------------------------------------------------------------------------
# Sections
# ----------------------------------------------------------------------------
def section_for(m):
    if m['part'] == 1:
        if m['kind'] == 'fixed':
            mo, d = m['month'], m['day']
            if (mo, d) <= (12, 24):
                return 'advent'
            return 'christmas'
        off = m['easterOffset']
        if off is not None and off <= -46:
            return 'septuagesima'
        if off is not None and off <= -1:
            return 'lent'
        if off is not None and off < 39:
            return 'paschal'
        return 'ascension'
    else:
        if m['kind'] in ('sunday', 'topic'):
            return 'illuminative'
        mo, d = m['month'], m['day']
        if (mo, d) <= (7, 11):
            return 'god'
        if (mo, d) <= (8, 19):
            return 'purgative'
        if (mo, d) <= (10, 3):
            return 'illuminative'
        if (mo, d) <= (10, 26):
            return 'unitive'
        if (mo, d) <= (10, 31):
            return 'perfect'
        return 'lastthings'

for m in meditations:
    m['section'] = section_for(m)
    m['id'] = meditations.index(m)

# ----------------------------------------------------------------------------
# Retreat topics
# ----------------------------------------------------------------------------
retreats = []
for n, (p, li, title) in enumerate(RETREATS):
    nxt = RETREATS[n + 1] if n + 1 < len(RETREATS) else (543, 0, None)
    lines = []
    for pp in range(p, nxt[0] + 1):
        for i, l in page_body_lines(pp):
            if pp == p and i <= li:
                continue
            if pp == nxt[0] and i >= nxt[1]:
                continue
            lines.append(l)
    paras = paragraphs_from_lines([clean_text(x) for x in lines if clean_text(x)])
    epi = None
    if paras and paras[0].startswith('“') and re.search(r'\)\s*\.?\s*$', paras[0]) and len(paras[0]) < 340 and paras[0].count('“') == 1:
        epi = paras[0]
        paras = paras[1:]
    retreats.append({'title': title, 'epigraph': epi, 'paragraphs': paras})

# ----------------------------------------------------------------------------
# Prayers (pages 546-551, verse lines preserved as line groups)
# ----------------------------------------------------------------------------
PRAYER_STARTS = [
    (546, 'Prayer Before Holy Communion', 'before'),
    (546, 'Lauda Sion', 'before'),
    (547, 'Verbum Supernum', 'before'),
    (548, 'Pange Lingua', 'before'),
    (548, 'A Short Prayer Which St. Thomas Said Daily', 'before'),
    (548, 'Thanksgiving After Holy Communion', 'after'),
    (549, 'Adoro Te', 'after'),
    (549, 'Prayer of St. Thomas to Obtain the Virtues', 'after'),
    (550, 'A Frequent Prayer of St. Thomas', 'after'),
    (550, 'Prayer of St. Thomas for the Proper Choice of a State of Life', 'after'),
    (551, 'Prayer of St. Thomas to the Blessed Virgin', 'after'),
]
PRAYER_TITLES_RAW = [
    'PRAYER BEFORE HOLY COMMUNION',
    'LAUDA SION',
    'VERBUM SUPERNUM',
    'PANGE LINGUA',
    'A SHORT PRAYER WHICH',
    'PRAYERS OF ST THOMAS AQUINAS',
    'ADORO TE',
    'PRAYER OF ST. THOMAS TO',
    'A FREQUENT PRAYER OF',
    'PRAYER TO ST. THOMAS FOR',
    'PRAYER.OF ST. THOMAS TO',
]

def dump_range(p0, i0, p1, i1):
    lines = []
    for p in range(p0, p1 + 1):
        for i, l in page_body_lines(p):
            if p == p0 and i < i0:
                continue
            if p == p1 and i >= i1:
                continue
            lines.append((p, i, l))
    return lines

# locate each raw title in the prayers section
positions = []
for (p, title, cat), raw in zip(PRAYER_STARTS, PRAYER_TITLES_RAW):
    found = None
    for pp in range(546, 552):
        for i, l in page_body_lines(pp):
            if norm(l).startswith(norm(raw.split()[0])) and norm(l) == norm(raw) or (norm(raw) in norm(l)):
                found = (pp, i)
                break
        if found:
            break
    if not found:
        raise SystemExit(f'Prayer title not found: {title} ({raw})')
    positions.append((found[0], found[1], title, cat))

prayers = []
for n, (p, i, title, cat) in enumerate(positions):
    nxt = positions[n + 1] if n + 1 < len(positions) else (552, 0)
    lines = dump_range(p, i + 1, nxt[0], nxt[1])
    # drop page numbers and stray ADDENDA, join into stanzas (blank-ish separation lost; keep lines)
    keep = [clean_text(l) for (_, _, l) in lines]
    keep = [l for l in keep if l and not re.match(r'^\d{1,3}\)?\.?$', l) and l != 'ADDENDA'
            and not re.match(r'^(BEFORE|AFTER)\s+HOLY\s+COMMUNION$', l)]
    # split into verse lines vs prose note
    prayers.append({'title': title, 'category': cat, 'lines': keep})

# ----------------------------------------------------------------------------
# Front matter
# ----------------------------------------------------------------------------
meta = {
    'title': 'Saint Thomas Aquinas — Meditations for Every Day',
    'bookTitle': 'Meditations of St. Thomas Aquinas, O.P.',
    'subtitle': 'For Every Day',
    'author': 'Father E. C. McEniry, O.P.',
    'adaptedFrom': 'Adapted from the Latin of Father Mezard, O.P. (1905)',
    'publisher': 'College Book Company, Columbus, Ohio',
    'year': '1941',
    'copyright': 'Copyright 1938, 1940, by Father E. C. McEniry, O.P.',
    'nihilObstat': 'Nihil Obstat: Fr. H. J. McManus, O.P., S.T.Lr.; Fr. J. S. Considine, O.P., S.T.Lr.\nImprimi Potest: Fr. I. S. McDermon(t), O.P., S.T.L., LL.D., Provincial.',
    'dedication': 'To my mother, the late Mrs. Mary McEniry, who died in Ireland, May 11th, 1934, aged 86 years — the mother of ten children; these meditations are gratefully and affectionately dedicated.',
}

data = {'meta': meta, 'meditations': meditations, 'retreats': retreats, 'prayers': prayers,
        'referencesNote': paragraphs_from_lines([clean_text(x) for x in pages[544].split('\n') if clean_text(x) and not is_running_header(x.strip())])}

json.dump(data, open('work/book.json', 'w'), ensure_ascii=False, indent=1)

print(f"Meditations: {len(meditations)}")
print(f"Retreats: {len(retreats)}")
print(f"Prayers: {len(prayers)}")
print('Sample:', json.dumps(meditations[0], indent=1)[:800])
