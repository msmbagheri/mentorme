// Generates on-brand placeholder images at the exact /uploads paths the DB references.
// Uses sharp to emit the correct format per file extension. Run with: npx tsx (node) this file.
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();
const ROOT = path.join(process.cwd(), "public");

// Brand palette
const MAGENTA = "#E4007F";
const PINK = "#FF40A3";
const ORANGE = "#FF8255";
const INK = "#09122C";

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Build an SVG: brand gradient + soft pattern + centered label + MentorMe mark.
function svg({ w, h, label, kind }) {
  const isLogo = kind === "logo";
  const isAvatar = kind === "avatar" || kind === "team" || kind === "founder";
  const grad =
    kind === "og" || kind === "hero" || kind === "cta"
      ? `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ORANGE}"/><stop offset="1" stop-color="${MAGENTA}"/></linearGradient>`
      : `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${MAGENTA}"/><stop offset="1" stop-color="${PINK}"/></linearGradient>`;
  const bg = isLogo ? "#FFFFFF" : `url(#g)`;
  const fg = isLogo ? MAGENTA : "#FFFFFF";
  const fontSize = Math.round(Math.min(w, h) * (isAvatar ? 0.26 : 0.09)) || 18;
  const markSize = Math.round(Math.min(w, h) * 0.05) || 12;
  const initials = isAvatar
    ? esc(
        (label || "MM")
          .split(/\s+/)
          .slice(0, 2)
          .map((x) => x[0] || "")
          .join("")
          .toUpperCase(),
      )
    : null;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${grad}
    <radialGradient id="soft" cx="0.8" cy="0.15" r="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${bg}"/>
  ${isLogo ? "" : `<rect width="${w}" height="${h}" fill="url(#soft)"/>`}
  ${isLogo ? "" : `<circle cx="${w * 0.12}" cy="${h * 0.85}" r="${Math.min(w, h) * 0.18}" fill="#FFFFFF" opacity="0.07"/>`}
  ${
    initials
      ? `<text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="${fontSize}" fill="${fg}">${initials}</text>`
      : `<text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="${fontSize}" fill="${fg}">${esc(label || "MentorMe")}</text>`
  }
  ${
    isLogo
      ? `<text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="${Math.round(h * 0.42)}" fill="${MAGENTA}">${esc(label || "MentorMe")}</text>`
      : `<text x="${w / 2}" y="${h - markSize * 1.4}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="600" font-size="${markSize}" fill="#FFFFFF" opacity="0.85">MentorMe</text>`
  }
</svg>`;
}

async function emit(urlPath, opts) {
  if (!urlPath || !urlPath.startsWith("/uploads/")) return false;
  const dest = path.join(ROOT, urlPath);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const ext = path.extname(urlPath).toLowerCase();
  const buf = Buffer.from(svg(opts));
  if (ext === ".svg") {
    await fs.writeFile(dest, buf);
  } else if (ext === ".png" || ext === ".ico") {
    await sharp(buf).png().toFile(dest);
  } else {
    await sharp(buf).jpeg({ quality: 82 }).toFile(dest);
  }
  return true;
}

const jobs = new Map(); // path -> opts (dedupe)
const add = (p, opts) => {
  if (p && p.startsWith("/uploads/") && !jobs.has(p)) jobs.set(p, opts);
};

const theme = await prisma.themeSetting.findFirst();
if (theme) {
  add(theme.primaryLogoUrl, { w: 320, h: 96, label: theme.brandName, kind: "logo" });
  add(theme.darkLogoUrl, { w: 320, h: 96, label: theme.brandName, kind: "logo" });
  add(theme.mobileLogoUrl, { w: 96, h: 96, label: "M", kind: "logo" });
  add(theme.faviconUrl, { w: 64, h: 64, label: "M", kind: "logo" });
}
for (const h of await prisma.heroSection.findMany())
  add(h.heroImageUrl, { w: 960, h: 1200, label: "Mentorship", kind: "hero" });
for (const l of await prisma.asSeenInLogo.findMany())
  add(l.imageUrl, { w: 240, h: 96, label: l.title_en, kind: "logo" });
for (const b of await prisma.brandPhilosophy.findMany())
  add(b.imageUrl, { w: 900, h: 1100, label: "Our Approach", kind: "hero" });
for (const f of await prisma.founderMessage.findMany()) {
  add(f.photoUrl, { w: 600, h: 600, label: f.name_en, kind: "founder" });
  add(f.signatureUrl, { w: 360, h: 120, label: f.name_en, kind: "logo" });
}
for (const c of await prisma.finalCta.findMany())
  add(c.backgroundImageUrl, { w: 1600, h: 800, label: "Your Future", kind: "cta" });
for (const s of await prisma.service.findMany())
  add(s.imageUrl, { w: 800, h: 500, label: s.title_en, kind: "service" });
for (const c of await prisma.caseStudy.findMany())
  add(c.imageUrl, { w: 600, h: 600, label: c.name, kind: "case" });
for (const m of await prisma.teamMember.findMany())
  add(m.photoUrl, { w: 600, h: 600, label: m.name_en, kind: "team" });
for (const e of await prisma.event.findMany())
  add(e.imageUrl, { w: 800, h: 450, label: e.title_en, kind: "event" });
for (const t of await prisma.testimonial.findMany())
  add(t.avatarUrl, { w: 200, h: 200, label: t.name, kind: "avatar" });
for (const p of await prisma.page.findMany())
  add(p.ogImageUrl, { w: 1200, h: 630, label: p.title_en, kind: "og" });
for (const s of await prisma.seoSetting.findMany())
  add(s.ogImageUrl, { w: 1200, h: 630, label: "MentorMe", kind: "og" });
for (const m of await prisma.mediaAsset.findMany())
  add(m.fileUrl, { w: 600, h: 400, label: m.fileName, kind: "service" });

let count = 0;
for (const [p, opts] of jobs) if (await emit(p, opts)) count++;
console.log(`Generated ${count} placeholder images for ${jobs.size} referenced paths.`);
await prisma.$disconnect();
