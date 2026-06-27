# MentorMe — Content Spec (Seed Data + On-Page Copy)

> Source: `MASTER WEBSITE SPECIFICATION v2.0 FINAL`. The master spec defines **architecture only** — it contains **no actual marketing copy**. Therefore essentially all copy below is **(drafted)** as realistic premium student-mentorship / college-admissions content. Use it directly as `seed.ts` content.
>
> **Languages:** English (`_en`) + Persian (`_fa`). All copy below is English. Persian is **(translate)** — every public-facing string requires an `_fa` counterpart (RTL). Store bilingual scalar fields (`title_en`/`title_fa`), never JSON blobs.
>
> **Tone guardrails (from spec §3, §39, §40):** Trusted Advisor, Educational Mentor, Strategic Planning Partner, Long-Term Success Guide. NEVER aggressive sales, lead-factory, hype, or false urgency. Every line must raise Trust / Clarity / Credibility / Confidence.

---

## 1. Brand Voice & Core Messaging

| Field | Value |
|---|---|
| Brand name | **MentorMe** |
| Official tagline | **Your Future, Mentored** |
| Positioning | Trust-Based Conversion Platform — not a brochure, not a sales page |
| Voice | Calm, expert, warm, reassuring, educational, never pushy |
| Reading level | Clear and accessible; confident but humble |
| Persona | The advisor a family trusts with their child's future |

**Value props (the 3 used in "Why Clients Choose Us"):** *(drafted)*
1. **Proven Admissions Strategy** — A structured, evidence-based method refined across hundreds of student journeys.
2. **One-on-One Expert Mentorship** — Every student is paired with a dedicated mentor, not a call center.
3. **Outcomes That Last** — We build skills and confidence that carry beyond the acceptance letter.

**Key messaging pillars:** *(drafted)*
- We guide students from uncertainty to a clear, achievable plan.
- We educate families before we ever discuss services.
- Real mentors, real results, long-term partnership.

**Boilerplate / brand description (footer + Organization schema):** *(drafted)*
> MentorMe is a premium student-mentorship and college-admissions advisory. We pair ambitious students with expert mentors to build a clear, confident path to their best-fit universities — through strategy, guidance, and genuine partnership.

---

## 2. Homepage Sections — Copy

Order is **mandatory** (spec §5): Header → Hero → As Seen In → Methodology → Why Clients Choose Us → Brand Philosophy → Services → Success Stories → Founder Message → Team → Events → Final CTA → Footer.

### 2.1 Hero *(drafted)*
- **Headline (outcome-focused, transformation, NOT self-promotional):** *Your Future, Mentored — From Uncertainty to Acceptance.*
- **Subheadline:** *We pair ambitious students with expert mentors who turn big ambitions into a clear, step-by-step plan for the universities that fit them best.*
- **Primary CTA:** `Book a Free Consultation`
- **Secondary CTA:** `Explore Our Method`
- **Trust indicator / badge:** *Trusted by 500+ families · 4.9/5 average rating*
- **Hero image:** mentor + student in a warm, focused 1:1 session (alt: "MentorMe mentor guiding a student through their admissions plan").
- FA: **(translate)** — RTL layout.

### 2.2 As Seen In *(drafted)*
- **Section label:** *As Featured In*
- **Logos (≥6, CMS-controlled; image + alt + url + sort + active):** placeholder "as seen in" outlets — use neutral media/education names until real assets exist:
  1. EduWeek 2. The Scholar Review 3. College Insider 4. Future Forward 5. Academic Times 6. Global Student Journal
- Behavior: clickable if URL set, else static. FA: label **(translate)**; logos shared.

### 2.3 Methodology *(drafted)* — 4 steps (spec allows 3–5)
- **Section title:** *A Clear Path, From First Conversation to Acceptance*
- **Description:** *Admissions feels overwhelming. Our method removes the guesswork and replaces it with a confident, personalized plan.*
- **Steps (icon · number · title · description):**
  1. **Discover** — *We listen first. Through an in-depth assessment we map your strengths, goals, and best-fit options.*
  2. **Strategize** — *Together we build a tailored roadmap — target schools, timeline, and a standout application narrative.*
  3. **Build** — *Your mentor guides essays, profile-building, and test prep step by step, with feedback at every stage.*
  4. **Apply & Arrive** — *We refine, submit, and support you through decisions — all the way to enrollment.*
- FA: **(translate)**.

### 2.4 Why Clients Choose Us *(drafted)*
- **Section title:** *Why Families Trust MentorMe*
- **Featured review:** *"MentorMe didn't just help my daughter get in — they gave her the confidence to know she belonged there. The most caring, professional team we've worked with."* — **Sara M., Parent**
- **Aggregate rating:** **4.9 / 5** from **312 reviews**
- **Review CTA:** `Leave a Review` · **Read-more CTA:** `Read More Reviews`
- **3 Value Proposition cards:** use the 3 value props in §1.
- FA: **(translate)**.

### 2.5 Brand Philosophy *(drafted)*
- **Title:** *Mentorship Over Sales. Always.*
- **Body:** *We believe a student's future is too important to rush. Our role isn't to push a package — it's to understand each student deeply and walk beside them with honesty, patience, and expertise. We measure success not by signatures, but by the confident, capable young people our students become.*
- **CTA:** `Meet Our Mentors`
- **Image:** candid team/mentorship moment (alt: "The MentorMe team in a mentoring session").
- FA: **(translate)**.

### 2.6 Services (section wrapper) *(drafted)*
- **Title:** *How We Help You Succeed*
- **Subtitle:** *Comprehensive, mentor-led support across every stage of the admissions journey.*
- (Service cards listed in §4.)

### 2.7 Success Stories (section wrapper) *(drafted)*
- **Title:** *Real Students. Real Outcomes.*
- **Subtitle:** *Every story is a student who moved from uncertainty to acceptance — with a mentor beside them.*
- (Case studies listed in §4.)

### 2.8 Founder Message — see §4 (Founder).

### 2.9 Team (section wrapper) *(drafted)*
- **Title:** *Meet the Mentors Behind MentorMe*
- **Subtitle:** *Experienced advisors, former admissions insiders, and subject experts — all invested in your success.*

### 2.10 Events & Webinars (section wrapper) *(drafted)*
- **Title:** *Free Workshops & Webinars*
- **Subtitle:** *Learn directly from our mentors. Practical, no-pressure sessions for students and parents.*

### 2.11 Final CTA *(drafted)*
- **Headline:** *Your Future Deserves a Plan. Let's Build It Together.*
- **Description:** *Book a free, no-pressure consultation. We'll listen to your goals and show you a clear next step — no obligation, no sales pitch.*
- **Primary CTA:** `Book Your Free Consultation`
- **Secondary CTA:** `Talk to a Mentor`
- **Trust statement:** *Free consultation · No obligation · Your information stays private.*
- **Background image:** aspirational campus / student success (alt-controlled).
- FA: **(translate)**.

---

## 3. Navigation, Footer, Contact, Social

### Header navigation (CMS-controlled; spec §6) — labels **(drafted)** for FA
`About` · `Services` · `Results` · `Team` · `Events` · `Contact`
- **Header primary CTA:** `Book a Consultation`

### Footer columns (spec §18)
- **Col 1 — Brand:** logo + brand description (see §1 boilerplate).
- **Col 2 — Navigation:** About · Services · Results · Team · Events · Contact
- **Col 3 — Services:** (links to the 6 services in §4)
- **Col 4 — Contact info:** *(drafted)*
  - Email: `hello@mentorme.com`
  - Phone: `+1 (555) 012-3456`
  - Address: `100 Scholar Avenue, Suite 200, Boston, MA 02116`
  - Hours: `Mon–Fri, 9:00 AM – 6:00 PM`
- **Bottom footer:** © 2026 MentorMe. All rights reserved. · `Privacy Policy` · `Terms of Service`
- **Social links (CMS-editable):** LinkedIn, Instagram, YouTube, Facebook, X/Twitter — `https://…/mentorme` *(drafted placeholders)*

---

## 4. Repeater Seed Data

### Services (need ≥6) *(drafted)* — each needs a detail page (`/en/services/[slug]`)
| # | slug | Title | Short description | CTA |
|---|---|---|---|---|
| 1 | `college-admissions-strategy` | College Admissions Strategy | End-to-end planning to identify best-fit schools and build a winning application strategy. | Learn More |
| 2 | `application-essay-mentorship` | Application & Essay Mentorship | One-on-one guidance to craft authentic, standout personal statements and supplemental essays. | Learn More |
| 3 | `academic-test-prep` | Academic & Test Prep | Personalized SAT/ACT/IELTS/TOEFL preparation aligned to your target schools. | Learn More |
| 4 | `profile-extracurricular-building` | Profile & Extracurricular Building | Develop leadership, projects, and activities that make an application memorable. | Learn More |
| 5 | `scholarship-financial-aid` | Scholarship & Financial Aid Guidance | Navigate scholarships, aid forms, and funding strategies with expert support. | Learn More |
| 6 | `transfer-student-advising` | Transfer Student Advising | Specialized support for students transferring into their dream university. | Learn More |
| 7 | `interview-coaching` | Interview Coaching | Confidence-building mock interviews and personalized feedback for admissions interviews. | Learn More |

Each detail page body **(drafted)**: overview, who it's for, what's included (3–5 bullets), the process, and a closing CTA `Book a Consultation`. FA **(translate)**.

### Case Studies / Success Stories (need ≥6) *(drafted)* — detail page `/en/case-studies/[slug]`
| Student | Outcome | University | Highlight | slug |
|---|---|---|---|---|
| Aria N. | Accepted, full-tuition merit scholarship | Stanford University | First-gen student, engineering | `aria-n-stanford` |
| David K. | Accepted to top-3 choice | University of Toronto | Transfer student, +1.2 GPA growth | `david-k-toronto` |
| Leila R. | 4 Ivy acceptances | Yale University | Pre-med, research distinction | `leila-r-yale` |
| Marcus T. | $40k/yr scholarship | NYU | Arts portfolio + essays | `marcus-t-nyu` |
| Sophie L. | Accepted, Dean's Scholarship | University of Michigan | Business, leadership profile | `sophie-l-michigan` |
| Omid B. | International admit + visa support | UC Berkeley | CS, IELTS 8.0 | `omid-b-berkeley` |
| Hannah W. | Accepted to honors program | UCLA | Late-start, 6-month turnaround | `hannah-w-ucla` |

Each story: short story (2–3 sentences on the transformation, outcome-focused, authentic, non-promotional), photo, optional university/scholarship/results fields, CTA `Read the Full Story`. FA **(translate)**.

### Team Members (need ≥8) *(drafted)* — detail page `/en/team/[slug]`; each: photo, name, role, short bio, LinkedIn, optional email/specialties/location. Categorize by role.
| Name | Role (category) | Specialties | Location | slug |
|---|---|---|---|---|
| Dr. Elena Hart | Founder & Lead Mentor (Leadership) | Admissions strategy, Ivy League | Boston, USA | `elena-hart` |
| James O'Connor | Director of Admissions Strategy (Strategy) | School fit, application planning | Boston, USA | `james-oconnor` |
| Priya Sharma | Senior Essay Mentor (Essays) | Personal statements, storytelling | Toronto, Canada | `priya-sharma` |
| Daniel Roth | Test Prep Lead (Academics) | SAT/ACT, GRE | Remote | `daniel-roth` |
| Maryam Ahmadi | International Admissions Advisor (International) | IELTS/TOEFL, visas, F-1 | Dubai, UAE | `maryam-ahmadi` |
| Thomas Lee | Scholarship & Financial Aid Advisor (Finance) | FAFSA, merit aid | Boston, USA | `thomas-lee` |
| Nadia Petrova | Profile & Extracurricular Coach (Mentoring) | Leadership, projects | London, UK | `nadia-petrova` |
| Carlos Mendez | Interview & Confidence Coach (Mentoring) | Mock interviews, communication | Remote | `carlos-mendez` |
| Yuki Tanaka | STEM Admissions Specialist (Strategy) | Engineering, CS programs | Remote | `yuki-tanaka` |

Bios **(drafted)**: 2–3 sentence warm, credential-led bios (e.g. "Former admissions reader at … with 10+ years guiding students into top programs."). FA **(translate)**.

### Events / Webinars (need ≥4) *(drafted)* — detail page `/en/events/[slug]`; each: image, title, date, time, location, description, Register CTA + View Details CTA.
| Title | Date | Time | Location | slug |
|---|---|---|---|---|
| Cracking the College Essay (Live Workshop) | 2026-07-15 | 6:00 PM EST | Online (Zoom) | `college-essay-workshop` |
| Building a Standout Application: Parent & Student Night | 2026-07-29 | 7:00 PM EST | Online (Zoom) | `standout-application-night` |
| Scholarships & Financial Aid Decoded | 2026-08-12 | 6:30 PM EST | Online (Webinar) | `scholarships-decoded` |
| Transfer Student Roadmap Session | 2026-08-26 | 6:00 PM EST | Boston Office + Online | `transfer-roadmap-session` |
| Test Prep Bootcamp: SAT in 90 Days | 2026-09-09 | 5:30 PM EST | Online (Zoom) | `sat-90-day-bootcamp` |

Descriptions **(drafted)**: 2–3 sentence value-focused summary + "Free to attend." Registration supports lead capture / Calendly / external URL. FA **(translate)**.

### Testimonials / Reviews *(drafted)* (for Why-Choose-Us + Reviews CMS)
1. *"The most caring, professional guidance we could have hoped for."* — Sara M., Parent — ⭐5
2. *"My mentor believed in me before I believed in myself. I got into my dream school."* — Aria N., Student — ⭐5
3. *"Clear, honest, and never pushy. They earned our trust completely."* — Reza T., Parent — ⭐5
4. *"They turned a stressful process into a confident plan."* — Hannah W., Student — ⭐5
- **Aggregate:** 4.9/5 · 312 reviews (for AggregateRating schema).

### Methodology steps — see §2.3.

### Success metrics / stats *(drafted)* (for hero badge, schema, trust)
- **500+** families guided · **4.9/5** average rating · **95%** acceptance to a top-choice school · **$2M+** in scholarships secured · **10+** years of experience.

### Founder message *(drafted)*
- **Name:** Dr. Elena Hart · **Title:** Founder & Lead Mentor
- **Message:** *"When I founded MentorMe, I made one promise: to treat every student as if they were my own. I've sat on both sides of the admissions desk, and I know how overwhelming this journey can feel. Our work isn't about packaging students to look impressive — it's about helping them discover who they are and where they truly belong. That's the kind of mentorship I wish I'd had, and it's the one we give every family who trusts us."*
- **Signature image:** handwritten "Elena Hart" (CMS asset).
- FA **(translate)**.

---

## 5. Grade Options & CTA Labels *(drafted — Grade Configuration, spec §19)*
Selector used in lead capture / consultation flow. Grade 6–12 + Transfer Student.
| Value | Label | CTA label |
|---|---|---|
| `grade-6` | Grade 6 | Start Early — Book a Consultation |
| `grade-7` | Grade 7 | Plan Ahead — Book a Consultation |
| `grade-8` | Grade 8 | Build Your Foundation — Book a Consultation |
| `grade-9` | Grade 9 | Begin Your Roadmap — Book a Consultation |
| `grade-10` | Grade 10 | Shape Your Profile — Book a Consultation |
| `grade-11` | Grade 11 | Get Application-Ready — Book a Consultation |
| `grade-12` | Grade 12 | Finalize & Apply — Book a Consultation |
| `transfer` | Transfer Student | Map Your Transfer — Book a Consultation |

FA labels **(translate)**.

---

## 6. SEO Meta Guidance per Page Type *(drafted; CMS-managed, spec §21–22)*
Brand suffix on titles: ` | MentorMe`. Keep titles ≤60 chars, descriptions ≤155 chars. Each page bilingual (`metaTitle_en/_fa`, `metaDescription_en/_fa`).

| Page type | Meta title pattern | Meta description pattern | Schema |
|---|---|---|---|
| Homepage | `MentorMe — Your Future, Mentored` | `Expert one-on-one college admissions mentorship. From uncertainty to acceptance — trusted by 500+ families.` | Organization, WebPage, AggregateRating, FAQPage |
| Service detail | `{Service} \| MentorMe` | `{One-line value prop for the service}. Mentor-led support from MentorMe.` | Service |
| Case study | `{Student} → {University} \| MentorMe Success Story` | `How {Student} earned admission to {University} with MentorMe mentorship.` | Article |
| Team profile | `{Name}, {Role} \| MentorMe` | `Meet {Name}, {Role} at MentorMe. {Specialty} mentorship for students.` | ProfilePage |
| Event detail | `{Event} — {Date} \| MentorMe Webinar` | `Join MentorMe's free {Event} on {Date}. Practical guidance for students and parents.` | Event |
| Contact | `Book a Consultation \| MentorMe` | `Book a free, no-pressure consultation with a MentorMe mentor. We'll map your next step.` | WebPage |

Each page also needs: Open Graph + Twitter Card (title/desc/image), canonical URL, robots control, JSON-LD. FAQPage schema on homepage — draft 4–6 Q&As **(drafted)**:
- *Is the first consultation really free?* Yes — no obligation, no sales pitch.
- *What grades do you work with?* Grade 6 through 12, plus transfer students.
- *Do you support international students?* Yes — including test prep and visa guidance.
- *How are mentors matched?* By your goals, target schools, and subject focus.

---

## 7. Business Facts *(drafted — replace with real data before launch)*
- **Location / HQ:** 100 Scholar Avenue, Suite 200, Boston, MA 02116, USA (additional advisors: Toronto, London, Dubai, remote).
- **Hours:** Mon–Fri 9:00 AM – 6:00 PM (EST).
- **Email:** hello@mentorme.com · **Phone:** +1 (555) 012-3456
- **Stats:** 500+ families · 4.9/5 (312 reviews) · 95% top-choice acceptance · $2M+ scholarships · 10+ years.
- **"As Seen In" logos:** 6 placeholder media outlets (§2.2) — swap for real licensed logos.
- **Social:** LinkedIn, Instagram, YouTube, Facebook, X — placeholder URLs.

---

## 8. Implementation Notes for seed.ts
- Every public string ships **bilingual** (`*_en` + `*_fa`); FA marked **(translate)** here must be filled.
- All copy above is **(drafted)** — the master spec supplied no real copy. Flag for client sign-off before launch.
- Counts satisfied: Services 7 (≥6), Case Studies 7 (≥6), Team 9 (≥8), Events 5 (≥4), Methodology 4 steps (3–5), Value Props 3, As-Seen-In logos 6 (≥6), Testimonials 4.
- Slugs are lowercase-kebab and locale-agnostic (shared across `/en` and `/fa`).
