#!/usr/bin/env python3
"""Generate AEOrank Radar A brand assets from the selected mark geometry.

The source PNG is a geometric Radar A (mint scan arcs + white/mint chevron).
This script reconstructs it as SVG and rasterizes the favicon / OG set.
"""

from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ── Brand ────────────────────────────────────────────────────────────────
INK = (10, 11, 15, 255)  # #0A0B0F
MINT = (61, 255, 181, 255)  # #3DFFB5
WHITE = (242, 242, 243, 255)  # #F2F2F3
MINT_HEX = "#3DFFB5"
INK_HEX = "#0A0B0F"
WHITE_HEX = "#F2F2F3"

# Geometry measured from the selected 1280×720 PNG (pixel space).
ARC_CX, ARC_CY = 639.5, 341.4
OUTER_R, OUTER_SW = 179.01, 12.62
INNER_R, INNER_SW = 125.95, 9.50
A0_DEG, A1_DEG = 143.0, 318.0
DOT_CX, DOT_CY, DOT_R = 592.0, 315.0, 19.5
WHITE_POLY = [(639, 331), (639, 399), (491, 547), (491, 479)]
MINT_POLY = [(640, 331), (640, 399), (788, 547), (788, 479)]

# Square crop around the mark (centered, padded).
ORIGIN_X, ORIGIN_Y, SQUARE = 401.5, 132.5, 438.0

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "brand"
MARKETING_PUBLIC = ROOT / "apps/marketing/public"
WEB_PUBLIC = ROOT / "apps/web/public"
WEB_APP = ROOT / "apps/web/app"
DOCS_PUBLIC = ROOT / "apps/docs/public"
DOCS_ASSETS = ROOT / "apps/docs/src/assets"
GITHUB = ROOT / ".github"

INTER_BOLD = Path("/usr/share/fonts/truetype/macos/Inter-Bold.ttf")
INTER_SEMI = Path("/usr/share/fonts/truetype/macos/Inter-SemiBold.ttf")
JETBRAINS = Path("/usr/share/fonts/truetype/macos/JetBrainsMono-Regular.ttf")


def _t(x: float, y: float, size: float) -> tuple[float, float]:
    s = size / SQUARE
    return ((x - ORIGIN_X) * s, (y - ORIGIN_Y) * s)


def _ts(v: float, size: float) -> float:
    return v * size / SQUARE


def _poly(points: list[tuple[float, float]], size: float) -> list[tuple[float, float]]:
    return [_t(x, y, size) for x, y in points]


def _fmt_poly(points: list[tuple[float, float]], size: float) -> str:
    return " ".join(f"{x:.3f},{y:.3f}" for x, y in _poly(points, size))


def _arc_endpoints(r: float, size: float) -> tuple[tuple[float, float], tuple[float, float]]:
    a0, a1 = math.radians(A0_DEG), math.radians(A1_DEG)
    cx, cy = _t(ARC_CX, ARC_CY, size)
    rr = _ts(r, size)
    start = (cx + rr * math.cos(a0), cy + rr * math.sin(a0))
    end = (cx + rr * math.cos(a1), cy + rr * math.sin(a1))
    return start, end


def mark_svg(
    size: int = 32,
    *,
    rounded: bool = True,
    background: bool = True,
    classes: bool = False,
) -> str:
    """Icon SVG in a square viewBox. Artwork is the Radar A on ink."""
    rx = size * 0.22 if rounded else 0
    cx, cy = _t(ARC_CX, ARC_CY, size)
    dx, dy = _t(DOT_CX, DOT_CY, size)
    outer_r = _ts(OUTER_R, size)
    inner_r = _ts(INNER_R, size)
    outer_sw = _ts(OUTER_SW, size)
    inner_sw = _ts(INNER_SW, size)
    dot_r = _ts(DOT_R, size)
    o0, o1 = _arc_endpoints(OUTER_R, size)
    i0, i1 = _arc_endpoints(INNER_R, size)

    def cls(name: str) -> str:
        return f' class="{name}"' if classes else ""

    bg = (
        f'  <rect width="{size}" height="{size}" rx="{rx:.3f}" fill="{INK_HEX}"/>\n'
        if background
        else ""
    )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" fill="none" role="img" aria-label="AEOrank">
{bg}  <path{cls("aeo-mark__arc aeo-mark__arc--outer")} d="M{o0[0]:.3f} {o0[1]:.3f} A{outer_r:.3f} {outer_r:.3f} 0 0 1 {o1[0]:.3f} {o1[1]:.3f}" stroke="{MINT_HEX}" stroke-width="{outer_sw:.3f}" stroke-linecap="butt"/>
  <path{cls("aeo-mark__arc aeo-mark__arc--inner")} d="M{i0[0]:.3f} {i0[1]:.3f} A{inner_r:.3f} {inner_r:.3f} 0 0 1 {i1[0]:.3f} {i1[1]:.3f}" stroke="{MINT_HEX}" stroke-width="{inner_sw:.3f}" stroke-linecap="butt"/>
  <circle{cls("aeo-mark__dot")} cx="{dx:.3f}" cy="{dy:.3f}" r="{dot_r:.3f}" fill="{MINT_HEX}"/>
  <polygon{cls("aeo-mark__arm aeo-mark__arm--light")} points="{_fmt_poly(WHITE_POLY, size)}" fill="{WHITE_HEX}"/>
  <polygon{cls("aeo-mark__arm aeo-mark__arm--mint")} points="{_fmt_poly(MINT_POLY, size)}" fill="{MINT_HEX}"/>
</svg>
'''


def _ring_sector(
    cx: float, cy: float, r_in: float, r_out: float, a0: float, a1: float, n: int = 128
) -> list[tuple[float, float]]:
    fwd = [a0 + (a1 - a0) * i / (n - 1) for i in range(n)]
    outer = [(cx + r_out * math.cos(a), cy + r_out * math.sin(a)) for a in fwd]
    inner = [(cx + r_in * math.cos(a), cy + r_in * math.sin(a)) for a in reversed(fwd)]
    return outer + inner


def render_icon(px: int, *, rounded: bool = True, scale: int = 4) -> Image.Image:
    """Rasterize the Radar A icon at `px` square, supersampled."""
    hi = px * scale
    img = Image.new("RGBA", (hi, hi), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    rx = hi * 0.22 if rounded else 0
    draw.rounded_rectangle((0, 0, hi - 1, hi - 1), radius=rx, fill=INK)

    cx, cy = _t(ARC_CX, ARC_CY, hi)
    a0, a1 = math.radians(A0_DEG), math.radians(A1_DEG)

    def band(r: float, sw: float) -> None:
        pts = _ring_sector(cx, cy, r - sw / 2, r + sw / 2, a0, a1)
        draw.polygon(pts, fill=MINT)

    band(_ts(OUTER_R, hi), _ts(OUTER_SW, hi))
    band(_ts(INNER_R, hi), _ts(INNER_SW, hi))

    dx, dy = _t(DOT_CX, DOT_CY, hi)
    dr = _ts(DOT_R, hi)
    draw.ellipse((dx - dr, dy - dr, dx + dr, dy + dr), fill=MINT)
    draw.polygon(_poly(WHITE_POLY, hi), fill=WHITE)
    draw.polygon(_poly(MINT_POLY, hi), fill=MINT)

    return img.resize((px, px), Image.Resampling.LANCZOS)


def _font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size=size)


def render_og(width: int = 1200, height: int = 630) -> Image.Image:
    img = Image.new("RGBA", (width, height), INK)
    mark_size = 280
    gap = 48

    word = _font(INTER_BOLD, 92)
    sub = _font(JETBRAINS, 20)
    word_text = "AEOrank"
    # Measure before compositing so the cluster can be centered.
    probe = ImageDraw.Draw(img)
    wb = probe.textbbox((0, 0), word_text, font=word)
    tw, th = wb[2] - wb[0], wb[3] - wb[1]
    sb = probe.textbbox((0, 0), "aeorank.dev", font=sub)
    cluster_w = mark_size + gap + tw
    x0 = (width - cluster_w) // 2
    y0 = (height - mark_size) // 2

    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse(
        (x0 - 80, y0 - 80, x0 + mark_size + 80, y0 + mark_size + 80),
        fill=(61, 255, 181, 40),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=72))
    img = Image.alpha_composite(img, glow)

    mark = render_icon(mark_size, rounded=True, scale=3)
    img.paste(mark, (x0, y0), mark)

    draw = ImageDraw.Draw(img)
    tx = x0 + mark_size + gap
    # Vertically center wordmark + rule + url as a stack against the mark.
    stack_h = th + 18 + 2 + 16 + (sb[3] - sb[1])
    ty = y0 + (mark_size - stack_h) // 2 - wb[1]
    draw.text((tx, ty), word_text, font=word, fill=WHITE)
    rule_y = ty + wb[3] + 16
    draw.rectangle((tx, rule_y, tx + min(tw, 220), rule_y + 2), fill=MINT)
    draw.text((tx, rule_y + 16 - sb[1]), "aeorank.dev", font=sub, fill=MINT)
    return img


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rgb = Image.new("RGBA", img.size, INK)
    rgb = Image.alpha_composite(rgb, img.convert("RGBA"))
    rgb.convert("RGB").save(path, "PNG", optimize=True)
    print(f"  wrote {path.relative_to(ROOT)} ({path.stat().st_size} bytes)")


def write_text(path: Path, contents: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(contents)
    print(f"  wrote {path.relative_to(ROOT)}")


def main() -> None:
    for d in (BRAND, MARKETING_PUBLIC, WEB_PUBLIC, WEB_APP, DOCS_PUBLIC, DOCS_ASSETS, GITHUB):
        d.mkdir(parents=True, exist_ok=True)

    icon_svg = mark_svg(32, rounded=True, background=True)
    ui_svg = mark_svg(32, rounded=True, background=True, classes=True)

    write_text(BRAND / "radar-a.svg", icon_svg)
    write_text(BRAND / "radar-a-ui.svg", ui_svg)
    write_text(MARKETING_PUBLIC / "favicon.svg", icon_svg)
    write_text(WEB_PUBLIC / "favicon.svg", icon_svg)
    write_text(WEB_APP / "icon.svg", icon_svg)
    write_text(DOCS_PUBLIC / "favicon.svg", icon_svg)
    write_text(DOCS_ASSETS / "logo-light.svg", icon_svg)
    write_text(DOCS_ASSETS / "logo-dark.svg", icon_svg)

    # Raster set
    icon_512 = render_icon(512, rounded=True)
    icon_180_round = render_icon(180, rounded=True)
    icon_180_square = render_icon(180, rounded=False)
    icon_32 = render_icon(32, rounded=True)
    icon_16 = render_icon(16, rounded=True)

    png_specs = [
        (MARKETING_PUBLIC / "favicon-16.png", icon_16),
        (MARKETING_PUBLIC / "favicon-32.png", icon_32),
        (MARKETING_PUBLIC / "apple-touch-icon.png", icon_180_square),
        (MARKETING_PUBLIC / "icon-512.png", icon_512),
        (WEB_PUBLIC / "favicon-16.png", icon_16),
        (WEB_PUBLIC / "favicon-32.png", icon_32),
        (WEB_PUBLIC / "apple-touch-icon.png", icon_180_square),
        (WEB_PUBLIC / "icon-512.png", icon_512),
        (WEB_APP / "apple-icon.png", icon_180_square),
        (DOCS_PUBLIC / "favicon-32.png", icon_32),
        (DOCS_PUBLIC / "apple-touch-icon.png", icon_180_square),
        (BRAND / "radar-a-512.png", icon_512),
        (BRAND / "radar-a-180.png", icon_180_round),
    ]
    for path, im in png_specs:
        save_png(im, path)

    # Multi-size ICO for legacy browsers
    ico_path = MARKETING_PUBLIC / "favicon.ico"
    icon_32.convert("RGBA").save(
        ico_path,
        format="ICO",
        sizes=[(16, 16), (32, 32)],
    )
    shutil.copy2(ico_path, WEB_PUBLIC / "favicon.ico")
    print(f"  wrote {ico_path.relative_to(ROOT)}")

    og = render_og(1200, 630)
    save_png(og, MARKETING_PUBLIC / "og-image.png")
    save_png(og, WEB_PUBLIC / "og-image.png")
    save_png(og, WEB_APP / "opengraph-image.png")
    save_png(og, BRAND / "og-image.png")

    social = render_og(1280, 640)
    save_png(social, GITHUB / "social-preview.png")

    print("done")


if __name__ == "__main__":
    main()
