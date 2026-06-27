import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding MentorMe database...");

  // ---------------------------------------------------------------
  // 1. CLEANUP (FK-safe order: children → parents)
  // ---------------------------------------------------------------
  await prisma.leadActivity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.contentVersion.deleteMany();

  await prisma.heroSection.deleteMany();
  await prisma.brandPhilosophy.deleteMany();
  await prisma.founderMessage.deleteMany();
  await prisma.finalCta.deleteMany();
  await prisma.footerSetting.deleteMany();
  await prisma.methodologyStep.deleteMany();
  await prisma.successMetric.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.seoSetting.deleteMany();

  await prisma.service.deleteMany();
  await prisma.caseStudy.deleteMany();
  await prisma.event.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.teamCategory.deleteMany();

  await prisma.asSeenInLogo.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.valueProposition.deleteMany();
  await prisma.mediaAsset.deleteMany();

  await prisma.menuItem.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.gradeOption.deleteMany();
  await prisma.ctaConfig.deleteMany();
  await prisma.themeSetting.deleteMany();

  await prisma.page.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // ---------------------------------------------------------------
  // 2. USERS
  // ---------------------------------------------------------------
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: await bcrypt.hash("Admin12345!", 12),
      role: "ADMIN",
      isActive: true,
    },
  });
  const editorUser = await prisma.user.create({
    data: {
      name: "Editor User",
      email: "editor@example.com",
      passwordHash: await bcrypt.hash("Editor12345!", 12),
      role: "EDITOR",
      isActive: true,
    },
  });
  const viewerUser = await prisma.user.create({
    data: {
      name: "Viewer User",
      email: "viewer@example.com",
      passwordHash: await bcrypt.hash("Viewer12345!", 12),
      role: "VIEWER",
      isActive: true,
    },
  });
  const userCount = 3;

  // ---------------------------------------------------------------
  // 3. THEME SETTING
  // ---------------------------------------------------------------
  await prisma.themeSetting.create({
    data: {
      brandName: "MentorMe",
      tagline_en: "Your Future, Mentored",
      tagline_fa: "آینده‌ی شما، با راهنمایی",
      primaryLogoUrl: "/uploads/logo-mentorme.svg",
      faviconUrl: "/uploads/favicon.ico",
      primaryColor: "#E4007F",
      accentColor: "#C7156F",
      ctaGradientStart: "#E4007F",
      ctaGradientEnd: "#FF40A3",
      socialLinks: [
        { platform: "linkedin", url: "https://linkedin.com/company/mentorme" },
        { platform: "instagram", url: "https://instagram.com/mentorme" },
        { platform: "youtube", url: "https://youtube.com/@mentorme" },
        { platform: "facebook", url: "https://facebook.com/mentorme" },
        { platform: "x", url: "https://x.com/mentorme" },
      ],
      contactInformation: {
        email: "hello@mentorme.com",
        phone: "+1 (555) 012-3456",
        address: "100 Scholar Avenue, Suite 200, Boston, MA 02116",
        hours: "Mon–Fri, 9:00 AM – 6:00 PM",
      },
    },
  });

  // ---------------------------------------------------------------
  // 4. CTA CONFIGS
  // ---------------------------------------------------------------
  const ctaBook = await prisma.ctaConfig.create({
    data: {
      internalName: "book-consultation",
      label_en: "Book a Free Consultation",
      label_fa: "رزرو مشاوره‌ی رایگان",
      actionType: "OPEN_LEAD_FORM",
    },
  });
  const ctaExplore = await prisma.ctaConfig.create({
    data: {
      internalName: "explore-method",
      label_en: "Explore Our Method",
      label_fa: "آشنایی با روش ما",
      actionType: "INTERNAL_URL",
      internalUrl: "/#methodology",
    },
  });
  const ctaSchedule = await prisma.ctaConfig.create({
    data: {
      internalName: "schedule-call",
      label_en: "Talk to a Mentor",
      label_fa: "گفت‌وگو با یک منتور",
      actionType: "OPEN_CALENDLY",
      calendlyUrl: "https://calendly.com/mentorme/consultation",
    },
  });
  const ctaMeetMentors = await prisma.ctaConfig.create({
    data: {
      internalName: "meet-mentors",
      label_en: "Meet Our Mentors",
      label_fa: "با منتورهای ما آشنا شوید",
      actionType: "INTERNAL_URL",
      internalUrl: "/#team",
    },
  });
  const ctaRegisterEvent = await prisma.ctaConfig.create({
    data: {
      internalName: "register-event",
      label_en: "Register Now",
      label_fa: "ثبت‌نام کنید",
      actionType: "OPEN_LEAD_FORM",
    },
  });
  const ctaConfigCount = 5;

  // ---------------------------------------------------------------
  // 5. GRADE OPTIONS
  // ---------------------------------------------------------------
  const gradeData: {
    grade: "GRADE_6" | "GRADE_7" | "GRADE_8" | "GRADE_9" | "GRADE_10" | "GRADE_11" | "GRADE_12" | "TRANSFER";
    label_en: string;
    label_fa: string;
    ctaLabel_en: string;
    ctaLabel_fa: string;
  }[] = [
    { grade: "GRADE_6", label_en: "Grade 6", label_fa: "پایه ششم", ctaLabel_en: "Start Early — Book a Consultation", ctaLabel_fa: "زود شروع کنید — رزرو مشاوره" },
    { grade: "GRADE_7", label_en: "Grade 7", label_fa: "پایه هفتم", ctaLabel_en: "Plan Ahead — Book a Consultation", ctaLabel_fa: "از پیش برنامه‌ریزی کنید — رزرو مشاوره" },
    { grade: "GRADE_8", label_en: "Grade 8", label_fa: "پایه هشتم", ctaLabel_en: "Build Your Foundation — Book a Consultation", ctaLabel_fa: "پایه‌های خود را بسازید — رزرو مشاوره" },
    { grade: "GRADE_9", label_en: "Grade 9", label_fa: "پایه نهم", ctaLabel_en: "Begin Your Roadmap — Book a Consultation", ctaLabel_fa: "نقشه‌ی راه خود را آغاز کنید — رزرو مشاوره" },
    { grade: "GRADE_10", label_en: "Grade 10", label_fa: "پایه دهم", ctaLabel_en: "Shape Your Profile — Book a Consultation", ctaLabel_fa: "پروفایل خود را شکل دهید — رزرو مشاوره" },
    { grade: "GRADE_11", label_en: "Grade 11", label_fa: "پایه یازدهم", ctaLabel_en: "Get Application-Ready — Book a Consultation", ctaLabel_fa: "برای پذیرش آماده شوید — رزرو مشاوره" },
    { grade: "GRADE_12", label_en: "Grade 12", label_fa: "پایه دوازدهم", ctaLabel_en: "Finalize & Apply — Book a Consultation", ctaLabel_fa: "نهایی‌سازی و درخواست — رزرو مشاوره" },
    { grade: "TRANSFER", label_en: "Transfer Student", label_fa: "دانشجوی انتقالی", ctaLabel_en: "Map Your Transfer — Book a Consultation", ctaLabel_fa: "مسیر انتقال خود را ترسیم کنید — رزرو مشاوره" },
  ];
  for (let i = 0; i < gradeData.length; i++) {
    const g = gradeData[i];
    await prisma.gradeOption.create({
      data: {
        grade: g.grade,
        label_en: g.label_en,
        label_fa: g.label_fa,
        ctaLabel_en: g.ctaLabel_en,
        ctaLabel_fa: g.ctaLabel_fa,
        funnelMode: "consultation",
        leadSource: "grade_funnel",
        sortOrder: i,
        isActive: true,
      },
    });
  }
  const gradeOptionCount = gradeData.length;

  // ---------------------------------------------------------------
  // 6. MENUS + MENU ITEMS
  // ---------------------------------------------------------------
  const headerMenu = await prisma.menu.create({ data: { internalName: "header" } });
  const footerMenu = await prisma.menu.create({ data: { internalName: "footer" } });

  const headerItems = [
    { label_en: "About", label_fa: "درباره ما", type: "SCROLL_TO_SECTION" as const, sectionAnchor: "brand_philosophy" },
    { label_en: "Services", label_fa: "خدمات", type: "SCROLL_TO_SECTION" as const, sectionAnchor: "services" },
    { label_en: "Results", label_fa: "نتایج", type: "SCROLL_TO_SECTION" as const, sectionAnchor: "success_stories" },
    { label_en: "Team", label_fa: "تیم", type: "SCROLL_TO_SECTION" as const, sectionAnchor: "team" },
    { label_en: "Events", label_fa: "رویدادها", type: "SCROLL_TO_SECTION" as const, sectionAnchor: "events" },
    { label_en: "Contact", label_fa: "تماس با ما", type: "INTERNAL_PAGE" as const, internalUrl: "/contact" },
  ];
  for (let i = 0; i < headerItems.length; i++) {
    const it = headerItems[i];
    await prisma.menuItem.create({
      data: {
        menuId: headerMenu.id,
        label_en: it.label_en,
        label_fa: it.label_fa,
        type: it.type,
        sectionAnchor: it.sectionAnchor ?? null,
        internalUrl: it.internalUrl ?? null,
        sortOrder: i,
        isActive: true,
      },
    });
  }

  const footerItems = [
    { label_en: "About", label_fa: "درباره ما", type: "SCROLL_TO_SECTION" as const, sectionAnchor: "brand_philosophy" },
    { label_en: "Services", label_fa: "خدمات", type: "SCROLL_TO_SECTION" as const, sectionAnchor: "services" },
    { label_en: "Results", label_fa: "نتایج", type: "SCROLL_TO_SECTION" as const, sectionAnchor: "success_stories" },
    { label_en: "Team", label_fa: "تیم", type: "SCROLL_TO_SECTION" as const, sectionAnchor: "team" },
    { label_en: "Events", label_fa: "رویدادها", type: "SCROLL_TO_SECTION" as const, sectionAnchor: "events" },
    { label_en: "Contact", label_fa: "تماس با ما", type: "INTERNAL_PAGE" as const, internalUrl: "/contact" },
    { label_en: "Privacy Policy", label_fa: "سیاست حفظ حریم خصوصی", type: "INTERNAL_PAGE" as const, internalUrl: "/privacy" },
    { label_en: "Terms of Service", label_fa: "شرایط استفاده از خدمات", type: "INTERNAL_PAGE" as const, internalUrl: "/terms" },
  ];
  for (let i = 0; i < footerItems.length; i++) {
    const it = footerItems[i];
    await prisma.menuItem.create({
      data: {
        menuId: footerMenu.id,
        label_en: it.label_en,
        label_fa: it.label_fa,
        type: it.type,
        sectionAnchor: it.sectionAnchor ?? null,
        internalUrl: it.internalUrl ?? null,
        sortOrder: i,
        isActive: true,
      },
    });
  }
  const menuCount = 2;
  const menuItemCount = headerItems.length + footerItems.length;

  // ---------------------------------------------------------------
  // 7. PAGES
  // ---------------------------------------------------------------
  const homePage = await prisma.page.create({
    data: {
      slug: "home",
      title_en: "MentorMe — Your Future, Mentored",
      title_fa: "MentorMe — آینده‌ی شما، با راهنمایی",
      meta_title_en: "MentorMe — Your Future, Mentored",
      meta_title_fa: "MentorMe — آینده‌ی شما، با راهنمایی",
      meta_description_en:
        "Expert one-on-one college admissions mentorship. From uncertainty to acceptance — trusted by 500+ families.",
      meta_description_fa:
        "راهنمایی تخصصی و فردی برای پذیرش دانشگاه. از تردید تا پذیرش — مورد اعتماد بیش از ۵۰۰ خانواده.",
      ogImageUrl: "/uploads/og-home.jpg",
      canonicalUrl: "https://mentorme.com/",
      status: "PUBLISHED",
      isIndexed: true,
    },
  });

  const contactPage = await prisma.page.create({
    data: {
      slug: "contact",
      title_en: "Book a Consultation",
      title_fa: "رزرو مشاوره",
      meta_title_en: "Book a Consultation | MentorMe",
      meta_title_fa: "رزرو مشاوره | MentorMe",
      meta_description_en:
        "Book a free, no-pressure consultation with a MentorMe mentor. We'll map your next step.",
      meta_description_fa:
        "یک مشاوره‌ی رایگان و بدون فشار با یک منتور MentorMe رزرو کنید. ما گام بعدی شما را ترسیم می‌کنیم.",
      ogImageUrl: "/uploads/og-contact.jpg",
      canonicalUrl: "https://mentorme.com/contact",
      status: "PUBLISHED",
      isIndexed: true,
    },
  });
  const pageCount = 2;

  // ---------------------------------------------------------------
  // 8. HOMEPAGE SECTIONS (12, ordered)
  // ---------------------------------------------------------------
  type SectionHeaderSeed = {
    eyebrow_en?: string;
    eyebrow_fa?: string;
    title_en?: string;
    title_fa?: string;
    description_en?: string;
    description_fa?: string;
  };
  const sections: {
    sectionType: string;
    stageGroup: "TRUST" | "METHOD" | "PROOF" | "HUMAN" | "CONVERSION" | "FOOTER";
    header?: SectionHeaderSeed;
  }[] = [
    { sectionType: "hero", stageGroup: "TRUST" },
    {
      sectionType: "as_seen_in",
      stageGroup: "TRUST",
      header: {
        title_en: "As Seen In",
        title_fa: "ما را اینجا دیده‌اید",
      },
    },
    {
      sectionType: "methodology",
      stageGroup: "METHOD",
      header: {
        eyebrow_en: "How It Works",
        eyebrow_fa: "چگونه کار می‌کند",
        title_en: "Our Methodology",
        title_fa: "روش ما",
        description_en:
          "Admissions feels overwhelming. Our method replaces guesswork with a confident, personalized plan.",
        description_fa:
          "پذیرش می‌تواند طاقت‌فرسا باشد. روش ما حدس و گمان را با برنامه‌ای مطمئن و شخصی‌سازی‌شده جایگزین می‌کند.",
      },
    },
    {
      sectionType: "why_choose_us",
      stageGroup: "PROOF",
      header: {
        eyebrow_en: "Why Us",
        eyebrow_fa: "چرا ما",
        title_en: "Why Clients Choose Us",
        title_fa: "چرا ما را انتخاب می‌کنند",
        description_en:
          "Families trust us for honest guidance and results that speak for themselves.",
        description_fa:
          "خانواده‌ها برای راهنمایی صادقانه و نتایجی که خود گویای کیفیت کارند به ما اعتماد می‌کنند.",
      },
    },
    { sectionType: "brand_philosophy", stageGroup: "TRUST" },
    {
      sectionType: "services",
      stageGroup: "METHOD",
      header: {
        eyebrow_en: "What We Offer",
        eyebrow_fa: "آنچه ارائه می‌دهیم",
        title_en: "Our Services",
        title_fa: "خدمات ما",
        description_en:
          "End-to-end support tailored to every stage of your admissions journey.",
        description_fa:
          "پشتیبانی کامل و متناسب با هر مرحله از مسیر پذیرش شما.",
      },
    },
    {
      sectionType: "success_stories",
      stageGroup: "PROOF",
      header: {
        eyebrow_en: "Real Results",
        eyebrow_fa: "نتایج واقعی",
        title_en: "Success Stories",
        title_fa: "داستان‌های موفقیت",
        description_en:
          "See how students like you earned offers from their dream schools.",
        description_fa:
          "ببینید دانش‌آموزانی مانند شما چگونه از مدارس رویایی‌شان پذیرش گرفتند.",
      },
    },
    { sectionType: "founder_message", stageGroup: "HUMAN" },
    {
      sectionType: "team",
      stageGroup: "HUMAN",
      header: {
        eyebrow_en: "The People",
        eyebrow_fa: "تیم",
        title_en: "Meet The Team",
        title_fa: "تیم ما",
        description_en:
          "Experienced mentors and advisors dedicated to your success.",
        description_fa:
          "مشاوران و منتورهای باتجربه که به موفقیت شما متعهد هستند.",
      },
    },
    {
      sectionType: "events",
      stageGroup: "CONVERSION",
      header: {
        eyebrow_en: "Join Us",
        eyebrow_fa: "به ما بپیوندید",
        title_en: "Events & Webinars",
        title_fa: "رویدادها و وبینارها",
        description_en:
          "Live sessions and workshops to guide you through every step.",
        description_fa:
          "جلسات زنده و کارگاه‌هایی برای راهنمایی شما در هر مرحله.",
      },
    },
    { sectionType: "final_cta", stageGroup: "CONVERSION" },
    { sectionType: "footer", stageGroup: "FOOTER" },
  ];
  for (let i = 0; i < sections.length; i++) {
    await prisma.homepageSection.create({
      data: {
        pageId: homePage.id,
        sectionType: sections[i].sectionType,
        stageGroup: sections[i].stageGroup,
        orderIndex: i,
        isActive: true,
        isDeleted: false,
        ...sections[i].header,
      },
    });
  }
  const homepageSectionCount = sections.length;

  // ---------------------------------------------------------------
  // 9. HERO SECTION
  // ---------------------------------------------------------------
  await prisma.heroSection.create({
    data: {
      pageId: homePage.id,
      eyebrow_en: "Your Future, Mentored",
      eyebrow_fa: "آینده‌ی شما، با راهنمایی",
      headline_en: "Your Future, Mentored — From Uncertainty to Acceptance.",
      headline_fa: "آینده‌ی شما، با راهنمایی — از تردید تا پذیرش.",
      subheadline_en:
        "We pair ambitious students with expert mentors who turn big ambitions into a clear, step-by-step plan for the universities that fit them best.",
      subheadline_fa:
        "ما دانش‌آموزان جاه‌طلب را با منتورهای متخصص همراه می‌کنیم؛ منتورهایی که آرزوهای بزرگ را به برنامه‌ای روشن و گام‌به‌گام برای بهترین دانشگاه‌های متناسب با آن‌ها تبدیل می‌کنند.",
      primaryCtaId: ctaBook.id,
      secondaryCtaId: ctaExplore.id,
      heroImageUrl: "/uploads/placeholder-hero.jpg",
      heroImageAlt_en: "MentorMe mentor guiding a student through their admissions plan",
      heroImageAlt_fa: "منتور MentorMe در حال راهنمایی یک دانش‌آموز در برنامه‌ی پذیرش او",
      trustBadgeText_en: "Trusted by 500+ families · 4.9/5 average rating",
      trustBadgeText_fa: "مورد اعتماد بیش از ۵۰۰ خانواده · میانگین امتیاز ۴٫۹ از ۵",
      isActive: true,
    },
  });

  // ---------------------------------------------------------------
  // 10. AS SEEN IN LOGOS
  // ---------------------------------------------------------------
  const logos = [
    { en: "EduWeek", fa: "اِدوویک" },
    { en: "The Scholar Review", fa: "بازنگری اسکالر" },
    { en: "College Insider", fa: "کالج اینسایدر" },
    { en: "Future Forward", fa: "فیوچر فوروارد" },
    { en: "Academic Times", fa: "آکادمیک تایمز" },
    { en: "Global Student Journal", fa: "نشریه‌ی جهانی دانشجو" },
  ];
  for (let i = 0; i < logos.length; i++) {
    await prisma.asSeenInLogo.create({
      data: {
        title_en: logos[i].en,
        title_fa: logos[i].fa,
        imageUrl: `/uploads/logo-${i + 1}.svg`,
        altText_en: `${logos[i].en} logo`,
        altText_fa: `لوگوی ${logos[i].fa}`,
        url: null,
        sortOrder: i,
        isActive: true,
      },
    });
  }
  const asSeenInCount = logos.length;

  // ---------------------------------------------------------------
  // 11. METHODOLOGY STEPS
  // ---------------------------------------------------------------
  const steps = [
    {
      icon: "Search",
      title_en: "Discover",
      title_fa: "کشف",
      description_en:
        "We listen first. Through an in-depth assessment we map your strengths, goals, and best-fit options.",
      description_fa:
        "ابتدا گوش می‌دهیم. از طریق یک ارزیابی عمیق، نقاط قوت، اهداف و بهترین گزینه‌های متناسب با شما را ترسیم می‌کنیم.",
    },
    {
      icon: "Map",
      title_en: "Strategize",
      title_fa: "راهبرد",
      description_en:
        "Together we build a tailored roadmap — target schools, timeline, and a standout application narrative.",
      description_fa:
        "با هم یک نقشه‌ی راه اختصاصی می‌سازیم — دانشگاه‌های هدف، جدول زمانی و یک روایت برجسته برای درخواست شما.",
    },
    {
      icon: "Hammer",
      title_en: "Build",
      title_fa: "ساخت",
      description_en:
        "Your mentor guides essays, profile-building, and test prep step by step, with feedback at every stage.",
      description_fa:
        "منتور شما گام‌به‌گام در نگارش مقالات، ساخت پروفایل و آمادگی آزمون‌ها شما را راهنمایی می‌کند و در هر مرحله بازخورد می‌دهد.",
    },
    {
      icon: "GraduationCap",
      title_en: "Apply & Arrive",
      title_fa: "درخواست و رسیدن",
      description_en:
        "We refine, submit, and support you through decisions — all the way to enrollment.",
      description_fa:
        "ما درخواست شما را پالایش و ارسال می‌کنیم و در طول تصمیم‌گیری‌ها — تا لحظه‌ی ثبت‌نام — کنار شما هستیم.",
    },
  ];
  for (let i = 0; i < steps.length; i++) {
    await prisma.methodologyStep.create({
      data: {
        pageId: homePage.id,
        stepNumber: i + 1,
        icon: steps[i].icon,
        title_en: steps[i].title_en,
        title_fa: steps[i].title_fa,
        description_en: steps[i].description_en,
        description_fa: steps[i].description_fa,
        sortOrder: i,
        isActive: true,
      },
    });
  }
  const methodologyStepCount = steps.length;

  // ---------------------------------------------------------------
  // 12. TESTIMONIALS
  // ---------------------------------------------------------------
  const testimonials = [
    {
      name: "Sara M.",
      role_en: "Parent",
      role_fa: "والد",
      content_en: "The most caring, professional guidance we could have hoped for.",
      content_fa: "دلسوزانه‌ترین و حرفه‌ای‌ترین راهنمایی‌ای که می‌توانستیم آرزویش را داشته باشیم.",
      isFeatured: true,
    },
    {
      name: "Aria N.",
      role_en: "Student",
      role_fa: "دانش‌آموز",
      content_en: "My mentor believed in me before I believed in myself. I got into my dream school.",
      content_fa: "منتور من پیش از آنکه خودم به خودم باور داشته باشم، به من باور داشت. به دانشگاه رؤیایی‌ام راه یافتم.",
      isFeatured: false,
    },
    {
      name: "Reza T.",
      role_en: "Parent",
      role_fa: "والد",
      content_en: "Clear, honest, and never pushy. They earned our trust completely.",
      content_fa: "شفاف، صادق و هرگز سمج. آن‌ها اعتماد ما را به‌طور کامل به دست آوردند.",
      isFeatured: false,
    },
    {
      name: "Hannah W.",
      role_en: "Student",
      role_fa: "دانش‌آموز",
      content_en: "They turned a stressful process into a confident plan.",
      content_fa: "آن‌ها یک فرایند پراسترس را به یک برنامه‌ی مطمئن تبدیل کردند.",
      isFeatured: false,
    },
  ];
  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i];
    await prisma.testimonial.create({
      data: {
        name: t.name,
        role_en: t.role_en,
        role_fa: t.role_fa,
        content_en: t.content_en,
        content_fa: t.content_fa,
        rating: 5,
        avatarUrl: `/uploads/avatar-${i + 1}.jpg`,
        isFeatured: t.isFeatured,
        sortOrder: i,
        isActive: true,
      },
    });
  }
  const testimonialCount = testimonials.length;

  // ---------------------------------------------------------------
  // 13. VALUE PROPOSITIONS
  // ---------------------------------------------------------------
  const valueProps = [
    {
      icon: "Target",
      title_en: "Proven Admissions Strategy",
      title_fa: "راهبرد اثبات‌شده‌ی پذیرش",
      description_en: "A structured, evidence-based method refined across hundreds of student journeys.",
      description_fa: "روشی ساختارمند و مبتنی بر شواهد که در طول صدها مسیر دانش‌آموزی پالایش شده است.",
    },
    {
      icon: "Users",
      title_en: "One-on-One Expert Mentorship",
      title_fa: "منتورینگ تخصصی و فردی",
      description_en: "Every student is paired with a dedicated mentor, not a call center.",
      description_fa: "هر دانش‌آموز با یک منتور اختصاصی همراه می‌شود، نه یک مرکز تماس.",
    },
    {
      icon: "TrendingUp",
      title_en: "Outcomes That Last",
      title_fa: "نتایجی که ماندگارند",
      description_en: "We build skills and confidence that carry beyond the acceptance letter.",
      description_fa: "ما مهارت‌ها و اعتمادبه‌نفسی می‌سازیم که فراتر از نامه‌ی پذیرش همراه دانش‌آموز می‌مانند.",
    },
  ];
  for (let i = 0; i < valueProps.length; i++) {
    const v = valueProps[i];
    await prisma.valueProposition.create({
      data: {
        icon: v.icon,
        title_en: v.title_en,
        title_fa: v.title_fa,
        description_en: v.description_en,
        description_fa: v.description_fa,
        sortOrder: i,
        isActive: true,
      },
    });
  }
  const valuePropositionCount = valueProps.length;

  // ---------------------------------------------------------------
  // 14. BRAND PHILOSOPHY
  // ---------------------------------------------------------------
  await prisma.brandPhilosophy.create({
    data: {
      pageId: homePage.id,
      eyebrow_en: "Our Philosophy",
      eyebrow_fa: "فلسفه‌ی ما",
      title_en: "Mentorship Over Sales. Always.",
      title_fa: "منتورینگ مقدم بر فروش. همیشه.",
      content_en:
        "We believe a student's future is too important to rush. Our role isn't to push a package — it's to understand each student deeply and walk beside them with honesty, patience, and expertise. We measure success not by signatures, but by the confident, capable young people our students become.",
      content_fa:
        "ما باور داریم که آینده‌ی یک دانش‌آموز آن‌قدر مهم است که نباید با شتاب با آن برخورد کرد. نقش ما فروش یک بسته نیست — بلکه درک عمیق هر دانش‌آموز و همراهی صادقانه، صبورانه و متخصصانه در کنار اوست. ما موفقیت را نه با امضاها، بلکه با جوانان مطمئن و توانمندی که دانش‌آموزانمان به آن‌ها تبدیل می‌شوند، می‌سنجیم.",
      imageUrl: "/uploads/placeholder-philosophy.jpg",
      imageAlt_en: "The MentorMe team in a mentoring session",
      imageAlt_fa: "تیم MentorMe در یک جلسه‌ی منتورینگ",
      ctaId: ctaMeetMentors.id,
      isActive: true,
    },
  });

  // ---------------------------------------------------------------
  // 15. SUCCESS METRICS
  // ---------------------------------------------------------------
  const metrics = [
    { metricValue: "500+", metricLabel_en: "Families guided", metricLabel_fa: "خانواده راهنمایی‌شده" },
    { metricValue: "4.9/5", metricLabel_en: "Average rating", metricLabel_fa: "میانگین امتیاز" },
    { metricValue: "95%", metricLabel_en: "Top-choice acceptance", metricLabel_fa: "پذیرش در گزینه‌ی نخست" },
    { metricValue: "$2M+", metricLabel_en: "Scholarships secured", metricLabel_fa: "بورسیه‌ی تأمین‌شده" },
  ];
  for (let i = 0; i < metrics.length; i++) {
    await prisma.successMetric.create({
      data: {
        pageId: homePage.id,
        metricValue: metrics[i].metricValue,
        metricLabel_en: metrics[i].metricLabel_en,
        metricLabel_fa: metrics[i].metricLabel_fa,
        sortOrder: i,
        isActive: true,
      },
    });
  }
  const successMetricCount = metrics.length;

  // ---------------------------------------------------------------
  // 16. FOUNDER MESSAGE
  // ---------------------------------------------------------------
  await prisma.founderMessage.create({
    data: {
      pageId: homePage.id,
      name_en: "Dr. Elena Hart",
      name_fa: "دکتر اِلِنا هارت",
      title_en: "Founder & Lead Mentor",
      title_fa: "بنیان‌گذار و منتور ارشد",
      message_en:
        "When I founded MentorMe, I made one promise: to treat every student as if they were my own. I've sat on both sides of the admissions desk, and I know how overwhelming this journey can feel. Our work isn't about packaging students to look impressive — it's about helping them discover who they are and where they truly belong. That's the kind of mentorship I wish I'd had, and it's the one we give every family who trusts us.",
      message_fa:
        "هنگامی که MentorMe را بنیان نهادم، یک قول دادم: با هر دانش‌آموز چنان رفتار کنم که گویی فرزند خودم است. من در هر دو سوی میز پذیرش نشسته‌ام و می‌دانم این مسیر چقدر می‌تواند طاقت‌فرسا باشد. کار ما بسته‌بندی دانش‌آموزان برای تأثیرگذار جلوه دادن نیست — بلکه کمک به آن‌هاست تا کشف کنند که چه کسی هستند و واقعاً به کجا تعلق دارند. این همان نوع منتورینگی است که آرزو داشتم خودم دریافت کرده بودم و همان چیزی است که به هر خانواده‌ای که به ما اعتماد می‌کند ارائه می‌دهیم.",
      photoUrl: "/uploads/founder-elena-hart.jpg",
      photoAlt_en: "Dr. Elena Hart, Founder of MentorMe",
      photoAlt_fa: "دکتر اِلِنا هارت، بنیان‌گذار MentorMe",
      signatureUrl: "/uploads/signature-elena-hart.png",
      isActive: true,
    },
  });

  // ---------------------------------------------------------------
  // 17. FINAL CTA
  // ---------------------------------------------------------------
  await prisma.finalCta.create({
    data: {
      pageId: homePage.id,
      eyebrow_en: "Let's Begin",
      eyebrow_fa: "بیایید آغاز کنیم",
      headline_en: "Your Future Deserves a Plan. Let's Build It Together.",
      headline_fa: "آینده‌ی شما سزاوار یک برنامه است. بیایید با هم آن را بسازیم.",
      subheadline_en:
        "Book a free, no-pressure consultation. We'll listen to your goals and show you a clear next step — no obligation, no sales pitch.",
      subheadline_fa:
        "یک مشاوره‌ی رایگان و بدون فشار رزرو کنید. ما به اهداف شما گوش می‌دهیم و یک گام بعدی روشن به شما نشان می‌دهیم — بدون هیچ تعهد و بدون هیچ فروش اجباری.",
      trustStatement_en: "Free consultation · No obligation · Your information stays private.",
      trustStatement_fa: "مشاوره‌ی رایگان · بدون تعهد · اطلاعات شما محرمانه می‌ماند.",
      primaryCtaId: ctaBook.id,
      secondaryCtaId: ctaSchedule.id,
      backgroundImageUrl: "/uploads/placeholder-final-cta.jpg",
      isActive: true,
    },
  });

  // ---------------------------------------------------------------
  // 18. FOOTER SETTING
  // ---------------------------------------------------------------
  await prisma.footerSetting.create({
    data: {
      pageId: homePage.id,
      tagline_en: "Your Future, Mentored",
      tagline_fa: "آینده‌ی شما، با راهنمایی",
      description_en:
        "MentorMe is a premium student-mentorship and college-admissions advisory. We pair ambitious students with expert mentors to build a clear, confident path to their best-fit universities — through strategy, guidance, and genuine partnership.",
      description_fa:
        "MentorMe یک مشاوره‌ی ممتاز در زمینه‌ی منتورینگ دانش‌آموزی و پذیرش دانشگاه است. ما دانش‌آموزان جاه‌طلب را با منتورهای متخصص همراه می‌کنیم تا مسیری روشن و مطمئن به سوی بهترین دانشگاه‌های متناسب با آن‌ها بسازند — از طریق راهبرد، راهنمایی و همراهی صادقانه.",
      copyright_en: "© 2026 MentorMe. All rights reserved.",
      copyright_fa: "© ۲۰۲۶ MentorMe. تمامی حقوق محفوظ است.",
      address_en: "100 Scholar Avenue, Suite 200, Boston, MA 02116",
      address_fa: "خیابان اسکالر ۱۰۰، واحد ۲۰۰، بوستون، ماساچوست ۰۲۱۱۶",
      contactEmail: "hello@mentorme.com",
      contactPhone: "+1 (555) 012-3456",
      businessHours_en: "Mon–Fri, 9:00 AM – 6:00 PM",
      businessHours_fa: "دوشنبه تا جمعه، ۹:۰۰ صبح تا ۶:۰۰ بعدازظهر",
      socialLinks: [
        { platform: "linkedin", url: "https://linkedin.com/company/mentorme" },
        { platform: "instagram", url: "https://instagram.com/mentorme" },
        { platform: "youtube", url: "https://youtube.com/@mentorme" },
        { platform: "facebook", url: "https://facebook.com/mentorme" },
        { platform: "x", url: "https://x.com/mentorme" },
      ],
      footerMenuId: footerMenu.id,
      isActive: true,
    },
  });

  // ---------------------------------------------------------------
  // 19. SERVICES
  // ---------------------------------------------------------------
  const services = [
    {
      slug: "college-admissions-strategy",
      title_en: "College Admissions Strategy",
      title_fa: "راهبرد پذیرش دانشگاه",
      short_en: "End-to-end planning to identify best-fit schools and build a winning application strategy.",
      short_fa: "برنامه‌ریزی جامع برای شناسایی بهترین دانشگاه‌های متناسب و ساخت یک راهبرد برنده برای درخواست.",
      full_en:
        "College admissions has never been more competitive, and a strong application begins long before the first essay is written. Our College Admissions Strategy service gives your student a clear, personalized plan from day one.\n\nWe start with a deep assessment of academic profile, interests, and ambitions, then translate that into a realistic list of reach, match, and safety schools. Every recommendation is grounded in evidence — admissions trends, program fit, and the unique strengths your student brings.\n\nFrom there, your dedicated mentor maps a term-by-term timeline covering coursework, testing, activities, and application milestones, so nothing is left to chance. You always know what comes next and why it matters.\n\nThe result is confidence: a family that understands the path ahead and a student who applies from a position of strength, not stress.",
      full_fa:
        "پذیرش دانشگاه هرگز به این اندازه رقابتی نبوده است و یک درخواست قوی مدت‌ها پیش از نوشتن نخستین مقاله آغاز می‌شود. خدمت راهبرد پذیرش دانشگاه ما از همان روز نخست یک برنامه‌ی روشن و اختصاصی در اختیار دانش‌آموز شما قرار می‌دهد.\n\nما با یک ارزیابی عمیق از پروفایل تحصیلی، علایق و آرزوها آغاز می‌کنیم و سپس آن را به فهرستی واقع‌بینانه از دانشگاه‌های آرمانی، متناسب و مطمئن تبدیل می‌کنیم. هر توصیه بر پایه‌ی شواهد استوار است — روندهای پذیرش، تناسب رشته و نقاط قوت منحصربه‌فرد دانش‌آموز شما.\n\nسپس منتور اختصاصی شما یک جدول زمانی ترم‌به‌ترم شامل دروس، آزمون‌ها، فعالیت‌ها و نقاط عطف درخواست را ترسیم می‌کند تا هیچ چیز به شانس واگذار نشود. شما همواره می‌دانید گام بعدی چیست و چرا اهمیت دارد.\n\nنتیجه، اطمینان است: خانواده‌ای که مسیر پیش‌رو را درک می‌کند و دانش‌آموزی که از موضع قدرت درخواست می‌دهد، نه از سر استرس.",
    },
    {
      slug: "application-essay-mentorship",
      title_en: "Application & Essay Mentorship",
      title_fa: "منتورینگ درخواست و مقاله",
      short_en: "One-on-one guidance to craft authentic, standout personal statements and supplemental essays.",
      short_fa: "راهنمایی فردی برای نگارش بیانیه‌های شخصی و مقالات تکمیلی اصیل و برجسته.",
      full_en:
        "The personal statement is where a student stops being a list of numbers and becomes a person. Our Application & Essay Mentorship helps your student find and tell that story with honesty and craft.\n\nWe never write essays for students — we mentor them to discover what truly matters to them and shape it into a narrative that admissions readers remember. Through guided brainstorming, your student uncovers the moments and ideas that make their application unmistakably their own.\n\nEvery draft receives detailed, constructive feedback from an experienced essay mentor, focusing on voice, structure, and authenticity. We also support each supplemental essay, tailoring it to the specific values of each school.\n\nThe outcome is a set of essays that feel genuine, read beautifully, and let your student's real character come through.",
      full_fa:
        "بیانیه‌ی شخصی جایی است که دانش‌آموز از یک فهرست اعداد فراتر می‌رود و به یک انسان تبدیل می‌شود. منتورینگ درخواست و مقاله‌ی ما به دانش‌آموز شما کمک می‌کند آن داستان را با صداقت و مهارت بیابد و بازگو کند.\n\nما هرگز مقالات را به‌جای دانش‌آموزان نمی‌نویسیم — بلکه به آن‌ها منتورینگ می‌دهیم تا کشف کنند چه چیزی واقعاً برایشان مهم است و آن را به روایتی تبدیل کنند که خوانندگان پذیرش به یاد بسپارند. از طریق طوفان فکری هدایت‌شده، دانش‌آموز شما لحظه‌ها و ایده‌هایی را کشف می‌کند که درخواستش را به‌روشنی از آنِ خود او می‌سازد.\n\nهر پیش‌نویس بازخوردی دقیق و سازنده از یک منتور باتجربه‌ی مقاله دریافت می‌کند که بر صدا، ساختار و اصالت تمرکز دارد. ما همچنین از هر مقاله‌ی تکمیلی پشتیبانی می‌کنیم و آن را با ارزش‌های ویژه‌ی هر دانشگاه هماهنگ می‌سازیم.\n\nنتیجه مجموعه‌ای از مقالات است که اصیل به نظر می‌رسند، زیبا خوانده می‌شوند و به شخصیت واقعی دانش‌آموز شما اجازه می‌دهند نمایان شود.",
    },
    {
      slug: "academic-test-prep",
      title_en: "Academic & Test Prep",
      title_fa: "آمادگی تحصیلی و آزمون",
      short_en: "Personalized SAT/ACT/IELTS/TOEFL preparation aligned to your target schools.",
      short_fa: "آمادگی شخصی‌سازی‌شده برای SAT/ACT/IELTS/TOEFL متناسب با دانشگاه‌های هدف شما.",
      full_en:
        "Strong test scores open doors — but generic prep wastes time. Our Academic & Test Prep service builds a focused plan around your student's goals, target schools, and current level.\n\nWe begin with a diagnostic to identify exact strengths and gaps, then design a study plan that targets the highest-impact areas first. Whether the goal is the SAT, ACT, IELTS, or TOEFL, your student practices with real strategies, not just drills.\n\nA dedicated prep mentor tracks progress, adjusts the plan as scores improve, and keeps motivation high with clear milestones. Students learn how to manage timing, reduce test anxiety, and approach each section with confidence.\n\nThe result is a meaningful score gain — and a student who walks into the exam prepared and calm.",
      full_fa:
        "نمرات قوی آزمون درها را می‌گشایند — اما آمادگی کلیشه‌ای وقت را تلف می‌کند. خدمت آمادگی تحصیلی و آزمون ما یک برنامه‌ی متمرکز پیرامون اهداف دانش‌آموز، دانشگاه‌های هدف و سطح فعلی او می‌سازد.\n\nما با یک آزمون تشخیصی آغاز می‌کنیم تا نقاط قوت و کاستی‌های دقیق را شناسایی کنیم، سپس برنامه‌ی مطالعه‌ای طراحی می‌کنیم که ابتدا پرتأثیرترین حوزه‌ها را هدف می‌گیرد. خواه هدف SAT، ACT، IELTS یا TOEFL باشد، دانش‌آموز شما با راهبردهای واقعی تمرین می‌کند، نه صرفاً تمرین‌های تکراری.\n\nیک منتور اختصاصی آمادگی، پیشرفت را پیگیری می‌کند، با بهبود نمرات برنامه را تنظیم می‌کند و با نقاط عطف روشن، انگیزه را بالا نگه می‌دارد. دانش‌آموزان یاد می‌گیرند چگونه زمان را مدیریت کنند، اضطراب آزمون را کاهش دهند و با اطمینان به هر بخش بپردازند.\n\nنتیجه یک افزایش معنادار در نمره است — و دانش‌آموزی که آماده و آرام وارد آزمون می‌شود.",
    },
    {
      slug: "profile-extracurricular-building",
      title_en: "Profile & Extracurricular Building",
      title_fa: "ساخت پروفایل و فعالیت‌های فوق‌برنامه",
      short_en: "Develop leadership, projects, and activities that make an application memorable.",
      short_fa: "پرورش رهبری، پروژه‌ها و فعالیت‌هایی که یک درخواست را به‌یادماندنی می‌کنند.",
      full_en:
        "Top universities look beyond grades — they look for impact. Our Profile & Extracurricular Building service helps your student develop genuine, meaningful involvement that strengthens their application and their character.\n\nWe start by exploring your student's authentic interests, then identify opportunities to deepen them through projects, leadership roles, research, or community initiatives. The goal is depth and purpose, not a long list of shallow activities.\n\nYour mentor guides your student to take initiative, build something real, and reflect on what they learn. Over time, a coherent personal narrative emerges — one that admissions committees find compelling because it is true.\n\nThe result is a standout profile rooted in real passion, plus the leadership and self-knowledge that serve students well beyond admissions.",
      full_fa:
        "دانشگاه‌های برتر فراتر از نمرات می‌نگرند — آن‌ها به دنبال تأثیرگذاری هستند. خدمت ساخت پروفایل و فعالیت‌های فوق‌برنامه‌ی ما به دانش‌آموز شما کمک می‌کند تا مشارکتی اصیل و معنادار را پرورش دهد که هم درخواست و هم شخصیت او را تقویت می‌کند.\n\nما با کاوش در علایق راستین دانش‌آموز شما آغاز می‌کنیم، سپس فرصت‌هایی را برای عمیق‌تر کردن آن‌ها از طریق پروژه‌ها، نقش‌های رهبری، پژوهش یا ابتکارات اجتماعی شناسایی می‌کنیم. هدف، عمق و هدفمندی است، نه فهرستی بلند از فعالیت‌های سطحی.\n\nمنتور شما دانش‌آموز را راهنمایی می‌کند تا ابتکار عمل به دست بگیرد، چیزی واقعی بسازد و درباره‌ی آموخته‌هایش بیندیشد. به‌مرور، یک روایت شخصی منسجم پدیدار می‌شود — روایتی که کمیته‌های پذیرش آن را گیرا می‌یابند، چون حقیقی است.\n\nنتیجه یک پروفایل برجسته‌ی ریشه‌دار در اشتیاق واقعی است، به‌علاوه‌ی رهبری و خودشناسی‌ای که فراتر از پذیرش به دانش‌آموزان خدمت می‌کند.",
    },
    {
      slug: "scholarship-financial-aid",
      title_en: "Scholarship & Financial Aid Guidance",
      title_fa: "راهنمایی بورسیه و کمک‌هزینه‌ی مالی",
      short_en: "Navigate scholarships, aid forms, and funding strategies with expert support.",
      short_fa: "پیمایش بورسیه‌ها، فرم‌های کمک‌هزینه و راهبردهای تأمین مالی با پشتیبانی تخصصی.",
      full_en:
        "Paying for university shouldn't stand between a student and their best-fit school. Our Scholarship & Financial Aid Guidance helps families find and secure the funding they deserve.\n\nWe map the full landscape of opportunities — merit scholarships, need-based aid, institutional grants, and outside awards — and match them to your student's profile. Then we build a strategy to maximize total funding across every application.\n\nYour mentor walks your family through aid forms like the FAFSA and CSS Profile, explaining each step in plain language and helping you avoid the costly mistakes that trip up so many applicants.\n\nThe result is a clear funding plan, fewer surprises, and in many cases, thousands of dollars in scholarships that might otherwise have been missed.",
      full_fa:
        "هزینه‌ی دانشگاه نباید مانع رسیدن دانش‌آموز به بهترین دانشگاه متناسب با او شود. راهنمایی بورسیه و کمک‌هزینه‌ی مالی ما به خانواده‌ها کمک می‌کند تا بودجه‌ای را که سزاوارش هستند بیابند و تأمین کنند.\n\nما کل چشم‌انداز فرصت‌ها را ترسیم می‌کنیم — بورسیه‌های شایستگی، کمک‌هزینه‌های مبتنی بر نیاز، گرنت‌های دانشگاهی و جوایز بیرونی — و آن‌ها را با پروفایل دانش‌آموز شما تطبیق می‌دهیم. سپس راهبردی برای بیشینه‌سازی کل بودجه در سراسر درخواست‌ها می‌سازیم.\n\nمنتور شما خانواده‌ی شما را در فرم‌های کمک‌هزینه مانند FAFSA و CSS Profile همراهی می‌کند، هر گام را به زبانی ساده توضیح می‌دهد و به شما کمک می‌کند از اشتباهات پرهزینه‌ای که بسیاری از متقاضیان را زمین می‌زند، دوری کنید.\n\nنتیجه یک برنامه‌ی تأمین مالی روشن، شگفتی‌های کمتر و در بسیاری موارد، هزاران دلار بورسیه‌ای است که در غیر این صورت ممکن بود از دست برود.",
    },
    {
      slug: "transfer-student-advising",
      title_en: "Transfer Student Advising",
      title_fa: "مشاوره‌ی دانشجوی انتقالی",
      short_en: "Specialized support for students transferring into their dream university.",
      short_fa: "پشتیبانی تخصصی برای دانشجویانی که به دانشگاه رؤیایی خود منتقل می‌شوند.",
      full_en:
        "Transferring is a different game with its own rules — and most general advice doesn't apply. Our Transfer Student Advising gives you specialist guidance built specifically for the transfer path.\n\nWe assess your current standing, credit transferability, and target programs to build a realistic plan that maximizes your chances. Transfer admissions reward a clear reason for moving and a strong recent record, and we help you present both.\n\nYour mentor guides essays that explain your journey compellingly, helps align coursework so credits carry over, and clarifies timelines that differ from first-year admissions.\n\nThe result is a focused, confident transfer application — and a smoother path into the university where you truly belong.",
      full_fa:
        "انتقال یک بازی متفاوت با قواعد خاص خود است — و بیشتر توصیه‌های عمومی در آن کاربرد ندارند. مشاوره‌ی دانشجوی انتقالی ما راهنمایی تخصصی را که به‌طور ویژه برای مسیر انتقال ساخته شده است، در اختیار شما قرار می‌دهد.\n\nما وضعیت کنونی، قابلیت انتقال واحدها و رشته‌های هدف شما را ارزیابی می‌کنیم تا برنامه‌ای واقع‌بینانه بسازیم که شانس شما را بیشینه کند. پذیرش انتقالی به یک دلیل روشن برای جابجایی و یک کارنامه‌ی اخیر قوی پاداش می‌دهد و ما به شما کمک می‌کنیم هر دو را ارائه دهید.\n\nمنتور شما مقالاتی را راهنمایی می‌کند که مسیر شما را گیرا توضیح می‌دهند، به هماهنگ‌سازی دروس کمک می‌کند تا واحدها منتقل شوند و جدول‌های زمانی متفاوت از پذیرش سال اول را روشن می‌سازد.\n\nنتیجه یک درخواست انتقالی متمرکز و مطمئن است — و مسیری هموارتر به سوی دانشگاهی که واقعاً به آن تعلق دارید.",
    },
    {
      slug: "interview-coaching",
      title_en: "Interview Coaching",
      title_fa: "مربیگری مصاحبه",
      short_en: "Confidence-building mock interviews and personalized feedback for admissions interviews.",
      short_fa: "مصاحبه‌های آزمایشی اعتمادساز و بازخورد شخصی‌سازی‌شده برای مصاحبه‌های پذیرش.",
      full_en:
        "An interview can turn a strong application into an offer — or surface nerves that hide a student's best self. Our Interview Coaching builds the confidence and clarity to make the conversation work in your favor.\n\nThrough realistic mock interviews, your student practices common and curveball questions in a supportive setting. We record, review, and refine — covering body language, pacing, and how to tell stories that stick.\n\nYour mentor gives honest, specific feedback after every session, helping your student replace anxiety with genuine ease. Students learn to listen well, answer authentically, and ask thoughtful questions of their own.\n\nThe result is a student who walks into any admissions or scholarship interview prepared, relaxed, and ready to be themselves.",
      full_fa:
        "یک مصاحبه می‌تواند یک درخواست قوی را به یک پیشنهاد پذیرش تبدیل کند — یا اضطرابی را آشکار سازد که بهترین چهره‌ی دانش‌آموز را پنهان می‌کند. مربیگری مصاحبه‌ی ما اعتمادبه‌نفس و وضوحی می‌سازد که گفت‌وگو را به سود شما رقم می‌زند.\n\nاز طریق مصاحبه‌های آزمایشی واقع‌گرایانه، دانش‌آموز شما پرسش‌های رایج و غیرمنتظره را در فضایی حمایتگر تمرین می‌کند. ما ضبط، بازبینی و پالایش می‌کنیم — شامل زبان بدن، ضرب‌آهنگ گفتار و چگونگی بازگویی داستان‌هایی که ماندگار می‌شوند.\n\nمنتور شما پس از هر جلسه بازخوردی صادقانه و دقیق می‌دهد و به دانش‌آموز شما کمک می‌کند اضطراب را با آرامشی راستین جایگزین کند. دانش‌آموزان یاد می‌گیرند خوب گوش دهند، اصیل پاسخ دهند و پرسش‌های اندیشمندانه‌ی خود را مطرح کنند.\n\nنتیجه دانش‌آموزی است که آماده، آرام و آماده‌ی خود بودن، وارد هر مصاحبه‌ی پذیرش یا بورسیه می‌شود.",
    },
  ];
  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    await prisma.service.create({
      data: {
        slug: s.slug,
        title_en: s.title_en,
        title_fa: s.title_fa,
        shortDescription_en: s.short_en,
        shortDescription_fa: s.short_fa,
        fullDescription_en: s.full_en,
        fullDescription_fa: s.full_fa,
        imageUrl: `/uploads/service-${s.slug}.jpg`,
        imageAlt_en: `${s.title_en} at MentorMe`,
        imageAlt_fa: `${s.title_fa} در MentorMe`,
        ctaId: ctaBook.id,
        metaTitle_en: `${s.title_en} | MentorMe`,
        metaTitle_fa: `${s.title_fa} | MentorMe`,
        metaDescription_en: `${s.short_en} Mentor-led support from MentorMe.`,
        metaDescription_fa: `${s.short_fa} پشتیبانی منتورمحور از MentorMe.`,
        status: "PUBLISHED",
        isFeatured: i < 6,
        isActive: true,
        sortOrder: i,
      },
    });
  }
  const serviceCount = services.length;

  // ---------------------------------------------------------------
  // 20. CASE STUDIES
  // ---------------------------------------------------------------
  const caseStudies = [
    {
      slug: "aria-n-stanford",
      name: "Aria N.",
      university: "Stanford University",
      badge_en: "Accepted · Full-Tuition Merit Scholarship",
      badge_fa: "پذیرفته‌شده · بورسیه‌ی کامل شهریه بر پایه‌ی شایستگی",
      title_en: "First-Gen Engineer to Stanford on Full Scholarship",
      title_fa: "از مهندس نسل‌اول تا استنفورد با بورسیه‌ی کامل",
      story_en:
        "Aria was a first-generation student who loved engineering but had no roadmap for elite admissions. With her mentor, she built a focused profile and a story only she could tell — and earned a full-tuition merit scholarship to Stanford.",
      story_fa:
        "آریا یک دانش‌آموز نسل‌اول بود که عاشق مهندسی بود اما هیچ نقشه‌ی راهی برای پذیرش در دانشگاه‌های برتر نداشت. او با منتورش یک پروفایل متمرکز و داستانی ساخت که فقط خودش می‌توانست بازگو کند — و بورسیه‌ی کامل شهریه بر پایه‌ی شایستگی استنفورد را به دست آورد.",
      full_en:
        "When Aria first reached out, she was bright and driven but completely unsure how to navigate top-tier admissions as a first-generation applicant. She had strong grades and a genuine love of engineering, yet no clear sense of how to translate that into a competitive application.\n\nHer mentor began with strategy: identifying a balanced school list, deepening one signature engineering project, and shaping a narrative around her resilience and curiosity. Over several months, Aria refined her essays, strengthened her profile, and prepared for interviews with growing confidence.\n\nThe payoff was extraordinary — admission to Stanford University with a full-tuition merit scholarship. More importantly, Aria arrived on campus certain that she belonged there.",
      full_fa:
        "هنگامی که آریا برای نخستین بار با ما تماس گرفت، باهوش و پرانگیزه بود اما به‌عنوان یک متقاضی نسل‌اول، کاملاً مطمئن نبود چگونه باید پذیرش در دانشگاه‌های رده‌بالا را پیمایش کند. نمرات قوی و عشقی راستین به مهندسی داشت، اما هیچ درک روشنی از چگونگی تبدیل آن به یک درخواست رقابتی نداشت.\n\nمنتور او با راهبرد آغاز کرد: شناسایی یک فهرست متعادل از دانشگاه‌ها، عمیق‌تر کردن یک پروژه‌ی شاخص مهندسی و شکل‌دهی روایتی پیرامون تاب‌آوری و کنجکاوی او. در طول چند ماه، آریا مقالاتش را پالایش کرد، پروفایلش را تقویت کرد و با اعتمادبه‌نفسی فزاینده برای مصاحبه‌ها آماده شد.\n\nنتیجه خارق‌العاده بود — پذیرش در دانشگاه استنفورد با بورسیه‌ی کامل شهریه بر پایه‌ی شایستگی. مهم‌تر از آن، آریا با این اطمینان وارد دانشگاه شد که به آنجا تعلق دارد.",
    },
    {
      slug: "david-k-toronto",
      name: "David K.",
      university: "University of Toronto",
      badge_en: "Accepted to Top-3 Choice",
      badge_fa: "پذیرفته‌شده در گزینه‌ی جزو سه گزینه‌ی برتر",
      title_en: "Transfer Student Lifts GPA and Lands Top-3 Choice",
      title_fa: "دانشجوی انتقالی معدلش را بالا برد و به گزینه‌ی برتر راه یافت",
      story_en:
        "David wanted to transfer but worried his early record would hold him back. With a clear plan and +1.2 GPA growth, his mentor helped him present a compelling case — and he was accepted to his top-3 choice, the University of Toronto.",
      story_fa:
        "دیوید می‌خواست انتقالی بگیرد اما نگران بود که کارنامه‌ی اولیه‌اش او را عقب نگه دارد. با یک برنامه‌ی روشن و رشد ۱٫۲ معدلی، منتورش به او کمک کرد تا پرونده‌ای متقاعدکننده ارائه دهد — و او در گزینه‌ی جزو سه گزینه‌ی برترش، دانشگاه تورنتو، پذیرفته شد.",
      full_en:
        "David came to MentorMe midway through community college, determined to transfer but anxious that a rocky first year would define him. He needed both an academic turnaround and a strategy to tell his story honestly.\n\nHis mentor built a focused plan: targeted course selection to lift his GPA, a clear transfer rationale, and essays that framed his growth as a strength rather than an excuse. Over two semesters David raised his GPA by 1.2 points and assembled a credible, forward-looking application.\n\nThe result was acceptance to the University of Toronto — one of his top-three choices — and a renewed belief that his earlier setbacks were just the start of his story, not the end.",
      full_fa:
        "دیوید در میانه‌ی دوران کالج محلی به MentorMe پیوست، مصمم به انتقال اما نگران از اینکه یک سال اول پرفرازونشیب او را تعریف کند. او هم به یک چرخش تحصیلی و هم به راهبردی برای بازگویی صادقانه‌ی داستانش نیاز داشت.\n\nمنتور او یک برنامه‌ی متمرکز ساخت: انتخاب هدفمند دروس برای بالا بردن معدل، یک دلیل روشن برای انتقال و مقالاتی که رشد او را به‌جای بهانه، به‌عنوان یک نقطه‌ی قوت قاب می‌گرفتند. در طول دو نیم‌سال، دیوید معدلش را ۱٫۲ نمره بالا برد و یک درخواست معتبر و آینده‌نگر گرد آورد.\n\nنتیجه پذیرش در دانشگاه تورنتو بود — یکی از سه گزینه‌ی برتر او — و باوری تازه به اینکه ناکامی‌های پیشین او تنها آغاز داستانش بودند، نه پایان آن.",
    },
    {
      slug: "leila-r-yale",
      name: "Leila R.",
      university: "Yale University",
      badge_en: "4 Ivy Acceptances",
      badge_fa: "۴ پذیرش از دانشگاه‌های آیوی‌لیگ",
      title_en: "Pre-Med Researcher Earns Four Ivy Acceptances",
      title_fa: "پژوهشگر پیش‌پزشکی چهار پذیرش آیوی‌لیگ گرفت",
      story_en:
        "Leila was a talented pre-med student whose research distinction wasn't coming through on paper. Her mentor helped sharpen her narrative and applications — leading to four Ivy League acceptances, with Yale as her choice.",
      story_fa:
        "لیلا یک دانش‌آموز بااستعداد پیش‌پزشکی بود که برجستگی پژوهشی‌اش روی کاغذ نمایان نمی‌شد. منتورش به او کمک کرد روایت و درخواست‌هایش را تیزتر کند — که به چهار پذیرش از دانشگاه‌های آیوی‌لیگ انجامید و او ییل را برگزید.",
      full_en:
        "Leila had everything admissions committees say they want — research distinction, strong academics, real intellectual curiosity — yet her early drafts buried these strengths under modesty and a scattered narrative.\n\nHer mentor's first job was clarity: distilling her research journey into a focused, vivid story and aligning each application with the specific character of every school. They tightened her activities list, sharpened her recommendations strategy, and rehearsed interviews until her passion came through naturally.\n\nThe results spoke for themselves — four Ivy League acceptances. Leila chose Yale University, where she's now pursuing the pre-med path she'd dreamed of, finally seen for the researcher and person she truly is.",
      full_fa:
        "لیلا همه‌ی آنچه را کمیته‌های پذیرش می‌گویند می‌خواهند داشت — برجستگی پژوهشی، کارنامه‌ی تحصیلی قوی و کنجکاوی فکری راستین — اما پیش‌نویس‌های اولیه‌اش این نقاط قوت را زیر فروتنی و روایتی پراکنده پنهان می‌کردند.\n\nنخستین وظیفه‌ی منتور او وضوح بود: تقطیر مسیر پژوهشی او به یک داستان متمرکز و زنده و هماهنگ‌سازی هر درخواست با ویژگی خاص هر دانشگاه. آن‌ها فهرست فعالیت‌های او را فشرده‌تر کردند، راهبرد توصیه‌نامه‌هایش را تیزتر ساختند و مصاحبه‌ها را تمرین کردند تا اشتیاق او به‌طور طبیعی نمایان شود.\n\nنتایج خود گویا بودند — چهار پذیرش از دانشگاه‌های آیوی‌لیگ. لیلا دانشگاه ییل را برگزید، جایی که اکنون مسیر پیش‌پزشکی‌ای را که آرزویش را داشت دنبال می‌کند و سرانجام به‌عنوان پژوهشگر و انسانی که واقعاً هست، دیده می‌شود.",
    },
    {
      slug: "marcus-t-nyu",
      name: "Marcus T.",
      university: "NYU",
      badge_en: "$40k/yr Scholarship",
      badge_fa: "بورسیه‌ی ۴۰ هزار دلار در سال",
      title_en: "Arts Portfolio and Essays Win a $40k Scholarship",
      title_fa: "نمونه‌کار هنری و مقالات، بورسیه‌ی ۴۰ هزار دلاری به ارمغان آوردند",
      story_en:
        "Marcus had real artistic talent but a portfolio that didn't yet tell a story. His mentor helped him curate his work and write essays that connected the dots — earning him a $40,000-per-year scholarship to NYU.",
      story_fa:
        "مارکوس استعداد هنری واقعی داشت اما نمونه‌کاری که هنوز داستانی را روایت نمی‌کرد. منتورش به او کمک کرد آثارش را گزینش کند و مقالاتی بنویسد که نقاط را به هم وصل کنند — که برایش بورسیه‌ی ۴۰ هزار دلار در سال در NYU به همراه آورد.",
      full_en:
        "Marcus arrived with undeniable creative talent but a portfolio that read as a collection of pieces rather than a point of view. He also struggled to articulate, in words, why his art mattered.\n\nHis mentor helped him curate ruthlessly — selecting work that revealed a clear artistic identity — and guided essays that connected his creative process to his goals and values. Together they shaped an application that felt as intentional as his best work.\n\nThe outcome was admission to NYU with a $40,000-per-year scholarship. Marcus learned not only how to present his art, but how to talk about it with the confidence of an artist who knows exactly what he's trying to say.",
      full_fa:
        "مارکوس با استعداد خلاقانه‌ای انکارناپذیر آمد اما با نمونه‌کاری که بیشتر به مجموعه‌ای از قطعات می‌مانست تا یک دیدگاه. او همچنین در بیان اینکه چرا هنرش اهمیت دارد، با کلمات دست‌وپنجه نرم می‌کرد.\n\nمنتور او کمک کرد بی‌رحمانه گزینش کند — انتخاب آثاری که یک هویت هنری روشن را آشکار می‌کردند — و مقالاتی را راهنمایی کرد که فرایند خلاقانه‌ی او را به اهداف و ارزش‌هایش پیوند می‌زدند. آن‌ها با هم درخواستی را شکل دادند که به اندازه‌ی بهترین آثار او هدفمند به نظر می‌رسید.\n\nنتیجه پذیرش در NYU با بورسیه‌ی ۴۰ هزار دلار در سال بود. مارکوس نه‌تنها آموخت چگونه هنرش را ارائه دهد، بلکه یاد گرفت چگونه با اعتمادبه‌نفس هنرمندی که دقیقاً می‌داند چه می‌خواهد بگوید، درباره‌ی آن سخن بگوید.",
    },
    {
      slug: "sophie-l-michigan",
      name: "Sophie L.",
      university: "University of Michigan",
      badge_en: "Accepted · Dean's Scholarship",
      badge_fa: "پذیرفته‌شده · بورسیه‌ی رئیس دانشکده",
      title_en: "Business Leader Wins the Dean's Scholarship at Michigan",
      title_fa: "رهبر کسب‌وکار، بورسیه‌ی رئیس دانشکده را در میشیگان گرفت",
      story_en:
        "Sophie had a strong leadership profile but applications that read like a résumé. Her mentor helped her show the person behind the achievements — earning her admission and a Dean's Scholarship at the University of Michigan.",
      story_fa:
        "سوفی یک پروفایل رهبری قوی داشت اما درخواست‌هایی که مانند یک رزومه خوانده می‌شدند. منتورش به او کمک کرد فردِ پشت دستاوردها را نشان دهد — که پذیرش و بورسیه‌ی رئیس دانشکده‌ی دانشگاه میشیگان را برایش به ارمغان آورد.",
      full_en:
        "Sophie was an accomplished student leader, but her early application read like a list of titles and awards with little of the person behind them. Admissions officers couldn't yet feel why her leadership mattered.\n\nHer mentor helped her move from listing to storytelling — choosing a few defining moments and reflecting on what they taught her about herself and the people she led. They aligned her business ambitions with Michigan's specific programs and culture.\n\nThe result was admission to the University of Michigan with a Dean's Scholarship. Sophie's application finally matched the thoughtful, capable leader her mentors and peers already knew.",
      full_fa:
        "سوفی یک رهبر دانش‌آموزی موفق بود، اما درخواست اولیه‌اش مانند فهرستی از عناوین و جوایز خوانده می‌شد، با اندکی از فردِ پشت آن‌ها. مأموران پذیرش هنوز نمی‌توانستند حس کنند چرا رهبری او اهمیت دارد.\n\nمنتور او کمک کرد از فهرست‌سازی به داستان‌گویی حرکت کند — انتخاب چند لحظه‌ی تعیین‌کننده و اندیشیدن درباره‌ی آنچه آن‌ها درباره‌ی خودش و افرادی که رهبری می‌کرد به او آموختند. آن‌ها جاه‌طلبی‌های کسب‌وکار او را با رشته‌ها و فرهنگ ویژه‌ی میشیگان هماهنگ کردند.\n\nنتیجه پذیرش در دانشگاه میشیگان با بورسیه‌ی رئیس دانشکده بود. درخواست سوفی سرانجام با رهبر اندیشمند و توانمندی که منتورها و همتایانش از پیش می‌شناختند، هم‌خوان شد.",
    },
    {
      slug: "omid-b-berkeley",
      name: "Omid B.",
      university: "UC Berkeley",
      badge_en: "International Admit + Visa Support",
      badge_fa: "پذیرش بین‌المللی + پشتیبانی ویزا",
      title_en: "International CS Student Reaches UC Berkeley",
      title_fa: "دانشجوی بین‌المللی علوم کامپیوتر به برکلی رسید",
      story_en:
        "Omid dreamed of studying computer science abroad but faced the maze of international admissions. With IELTS 8.0 and end-to-end mentorship — including visa support — he was admitted to UC Berkeley.",
      story_fa:
        "امید آرزوی تحصیل علوم کامپیوتر در خارج را داشت اما با هزارتوی پذیرش بین‌المللی روبه‌رو بود. با آیلتس ۸٫۰ و منتورینگ جامع — از جمله پشتیبانی ویزا — او در دانشگاه برکلی پذیرفته شد.",
      full_en:
        "Omid was a gifted computer-science student abroad, but the international admissions process felt like an impenetrable maze — different deadlines, testing requirements, and visa steps with little room for error.\n\nHis mentor built a complete roadmap: an IELTS prep plan that took him to a band 8.0, a school list tuned to international-friendly CS programs, and essays that highlighted his technical depth and global perspective. They also guided every visa and documentation step.\n\nThe result was admission to UC Berkeley, with the visa support he needed to actually get there. Omid moved from overwhelmed to enrolled, ready to study computer science at one of the world's best programs.",
      full_fa:
        "امید یک دانشجوی بااستعداد علوم کامپیوتر در خارج بود، اما فرایند پذیرش بین‌المللی مانند هزارتویی نفوذناپذیر به نظر می‌رسید — مهلت‌های متفاوت، الزامات آزمون و گام‌های ویزا با اندک جایی برای خطا.\n\nمنتور او یک نقشه‌ی راه کامل ساخت: یک برنامه‌ی آمادگی آیلتس که او را به نمره‌ی ۸٫۰ رساند، یک فهرست دانشگاهی متناسب با رشته‌های علوم کامپیوتر دوستدار دانشجوی بین‌المللی و مقالاتی که عمق فنی و دیدگاه جهانی او را برجسته می‌کردند. آن‌ها همچنین هر گام ویزا و مدارک را راهنمایی کردند.\n\nنتیجه پذیرش در دانشگاه برکلی بود، با پشتیبانی ویزایی که برای رسیدن به آنجا نیاز داشت. امید از سردرگمی به ثبت‌نام رسید، آماده‌ی تحصیل علوم کامپیوتر در یکی از بهترین رشته‌های جهان.",
    },
    {
      slug: "hannah-w-ucla",
      name: "Hannah W.",
      university: "UCLA",
      badge_en: "Accepted to Honors Program",
      badge_fa: "پذیرفته‌شده در برنامه‌ی ممتازان",
      title_en: "Six-Month Turnaround Lands an Honors Spot at UCLA",
      title_fa: "چرخش شش‌ماهه، جایگاهی در برنامه‌ی ممتازان UCLA به ارمغان آورد",
      story_en:
        "Hannah started late and feared she'd run out of time. In a focused six-month sprint, her mentor helped her build a standout application — and she was accepted into UCLA's honors program.",
      story_fa:
        "هانا دیر شروع کرد و می‌ترسید که زمان کم بیاورد. در یک دوی سرعت متمرکز شش‌ماهه، منتورش به او کمک کرد یک درخواست برجسته بسازد — و او در برنامه‌ی ممتازان UCLA پذیرفته شد.",
      full_en:
        "Hannah came to MentorMe later than most — just six months before deadlines — and was convinced it was too late to put together a competitive application. She had strong potential but no plan and little time.\n\nHer mentor designed an intensive, prioritized sprint: lock the school list fast, focus on the highest-impact essays, and build a tight activities narrative from what she'd already done. Every week had clear goals so no time was wasted.\n\nThe payoff was acceptance into UCLA's honors program. Hannah proved that with the right strategy and a dedicated mentor, even a late start can end in an outcome she once thought was out of reach.",
      full_fa:
        "هانا دیرتر از بیشتر دانش‌آموزان به MentorMe پیوست — تنها شش ماه پیش از مهلت‌ها — و مطمئن بود که برای گردآوری یک درخواست رقابتی خیلی دیر شده است. او پتانسیل قوی داشت اما نه برنامه‌ای و نه زمان چندانی.\n\nمنتور او یک دوی سرعت فشرده و اولویت‌بندی‌شده طراحی کرد: تثبیت سریع فهرست دانشگاه‌ها، تمرکز بر پرتأثیرترین مقالات و ساخت یک روایت فشرده‌ی فعالیت‌ها از آنچه پیش‌تر انجام داده بود. هر هفته اهداف روشنی داشت تا هیچ زمانی هدر نرود.\n\nنتیجه پذیرش در برنامه‌ی ممتازان UCLA بود. هانا ثابت کرد که با راهبرد درست و یک منتور اختصاصی، حتی یک شروع دیرهنگام هم می‌تواند به نتیجه‌ای ختم شود که او زمانی آن را دست‌نیافتنی می‌پنداشت.",
    },
  ];
  for (let i = 0; i < caseStudies.length; i++) {
    const c = caseStudies[i];
    await prisma.caseStudy.create({
      data: {
        slug: c.slug,
        name: c.name,
        title_en: c.title_en,
        title_fa: c.title_fa,
        outcomeBadge_en: c.badge_en,
        outcomeBadge_fa: c.badge_fa,
        story_en: c.story_en,
        story_fa: c.story_fa,
        fullStory_en: c.full_en,
        fullStory_fa: c.full_fa,
        university: c.university,
        imageUrl: `/uploads/case-${c.slug}.jpg`,
        imageAlt_en: `${c.name} — MentorMe success story`,
        imageAlt_fa: `${c.name} — داستان موفقیت MentorMe`,
        ctaId: ctaBook.id,
        metaTitle_en: `${c.name} → ${c.university} | MentorMe Success Story`,
        metaTitle_fa: `${c.name} → ${c.university} | داستان موفقیت MentorMe`,
        metaDescription_en: `How ${c.name} earned admission to ${c.university} with MentorMe mentorship.`,
        metaDescription_fa: `چگونه ${c.name} با منتورینگ MentorMe در ${c.university} پذیرفته شد.`,
        status: "PUBLISHED",
        isFeatured: i < 6,
        isActive: true,
        sortOrder: i,
      },
    });
  }
  const caseStudyCount = caseStudies.length;

  // ---------------------------------------------------------------
  // 21. TEAM CATEGORIES + MEMBERS
  // ---------------------------------------------------------------
  const categories = [
    { slug: "leadership", title_en: "Leadership", title_fa: "رهبری" },
    { slug: "strategy", title_en: "Strategy", title_fa: "راهبرد" },
    { slug: "essays", title_en: "Essays", title_fa: "مقالات" },
    { slug: "academics", title_en: "Academics", title_fa: "تحصیلی" },
    { slug: "international", title_en: "International", title_fa: "بین‌المللی" },
    { slug: "finance", title_en: "Finance", title_fa: "مالی" },
    { slug: "mentoring", title_en: "Mentoring", title_fa: "منتورینگ" },
  ];
  const categoryIds: Record<string, string> = {};
  for (let i = 0; i < categories.length; i++) {
    const cat = await prisma.teamCategory.create({
      data: {
        slug: categories[i].slug,
        title_en: categories[i].title_en,
        title_fa: categories[i].title_fa,
        sortOrder: i,
        isActive: true,
      },
    });
    categoryIds[categories[i].slug] = cat.id;
  }
  const teamCategoryCount = categories.length;

  const members = [
    {
      slug: "elena-hart", cat: "leadership", name_en: "Dr. Elena Hart", name_fa: "دکتر اِلِنا هارت",
      role_en: "Founder & Lead Mentor", role_fa: "بنیان‌گذار و منتور ارشد", location: "Boston, USA",
      tags: ["Admissions strategy", "Ivy League"],
      bio_en: "Dr. Elena Hart is the founder of MentorMe and a former Ivy League admissions reader with over a decade guiding students into top programs. She believes mentorship, not packaging, is what changes a student's trajectory.",
      bio_fa: "دکتر اِلِنا هارت بنیان‌گذار MentorMe و خواننده‌ی سابق پذیرش آیوی‌لیگ است که بیش از یک دهه دانش‌آموزان را به رشته‌های برتر راهنمایی کرده است. او باور دارد که منتورینگ، نه بسته‌بندی، چیزی است که مسیر یک دانش‌آموز را تغییر می‌دهد.",
    },
    {
      slug: "james-oconnor", cat: "strategy", name_en: "James O'Connor", name_fa: "جیمز اوکانر",
      role_en: "Director of Admissions Strategy", role_fa: "مدیر راهبرد پذیرش", location: "Boston, USA",
      tags: ["School fit", "Application planning"],
      bio_en: "James leads admissions strategy at MentorMe, helping students build balanced school lists and clear application plans. With years inside the admissions world, he excels at matching students to where they'll truly thrive.",
      bio_fa: "جیمز راهبرد پذیرش را در MentorMe رهبری می‌کند و به دانش‌آموزان کمک می‌کند فهرست‌های متعادل دانشگاهی و برنامه‌های روشن درخواست بسازند. با سال‌ها حضور در دنیای پذیرش، او در تطبیق دانش‌آموزان با جایی که واقعاً در آن شکوفا می‌شوند، مهارت دارد.",
    },
    {
      slug: "priya-sharma", cat: "essays", name_en: "Priya Sharma", name_fa: "پریا شارما",
      role_en: "Senior Essay Mentor", role_fa: "منتور ارشد مقاله", location: "Toronto, Canada",
      tags: ["Personal statements", "Storytelling"],
      bio_en: "Priya is a senior essay mentor who helps students find their authentic voice and tell stories that resonate. She has guided hundreds of personal statements from blank page to admissions-ready.",
      bio_fa: "پریا یک منتور ارشد مقاله است که به دانش‌آموزان کمک می‌کند صدای اصیل خود را بیابند و داستان‌هایی بگویند که اثرگذارند. او صدها بیانیه‌ی شخصی را از صفحه‌ی سفید تا آمادگی برای پذیرش راهنمایی کرده است.",
    },
    {
      slug: "daniel-roth", cat: "academics", name_en: "Daniel Roth", name_fa: "دنیل راث",
      role_en: "Test Prep Lead", role_fa: "سرپرست آمادگی آزمون", location: "Remote",
      tags: ["SAT/ACT", "GRE"],
      bio_en: "Daniel leads MentorMe's test prep, turning anxious test-takers into confident ones. His data-driven approach focuses each student's effort where it raises scores the most.",
      bio_fa: "دنیل آمادگی آزمون MentorMe را رهبری می‌کند و آزمون‌دهندگان مضطرب را به افرادی مطمئن تبدیل می‌کند. رویکرد داده‌محور او تلاش هر دانش‌آموز را جایی متمرکز می‌کند که بیشترین افزایش نمره را به همراه دارد.",
    },
    {
      slug: "maryam-ahmadi", cat: "international", name_en: "Maryam Ahmadi", name_fa: "مریم احمدی",
      role_en: "International Admissions Advisor", role_fa: "مشاور پذیرش بین‌المللی", location: "Dubai, UAE",
      tags: ["IELTS/TOEFL", "Visas", "F-1"],
      bio_en: "Maryam guides international students through the full journey — from English proficiency tests to visa and F-1 documentation. She makes a complex, high-stakes process feel clear and manageable.",
      bio_fa: "مریم دانشجویان بین‌المللی را در سراسر مسیر راهنمایی می‌کند — از آزمون‌های مهارت زبان انگلیسی تا مدارک ویزا و F-1. او یک فرایند پیچیده و پراهمیت را روشن و قابل‌مدیریت می‌سازد.",
    },
    {
      slug: "thomas-lee", cat: "finance", name_en: "Thomas Lee", name_fa: "توماس لی",
      role_en: "Scholarship & Financial Aid Advisor", role_fa: "مشاور بورسیه و کمک‌هزینه‌ی مالی", location: "Boston, USA",
      tags: ["FAFSA", "Merit aid"],
      bio_en: "Thomas helps families navigate scholarships and financial aid with confidence. He has helped students unlock significant funding through smart, well-timed aid strategies.",
      bio_fa: "توماس به خانواده‌ها کمک می‌کند تا با اطمینان بورسیه‌ها و کمک‌هزینه‌ی مالی را پیمایش کنند. او به دانش‌آموزان کمک کرده است تا از طریق راهبردهای هوشمندانه و به‌موقع کمک‌هزینه، بودجه‌ی چشمگیری را باز کنند.",
    },
    {
      slug: "nadia-petrova", cat: "mentoring", name_en: "Nadia Petrova", name_fa: "نادیا پتروا",
      role_en: "Profile & Extracurricular Coach", role_fa: "مربی پروفایل و فعالیت‌های فوق‌برنامه", location: "London, UK",
      tags: ["Leadership", "Projects"],
      bio_en: "Nadia helps students turn interests into meaningful leadership and projects. She coaches young people to build real impact — the kind that strengthens both an application and a character.",
      bio_fa: "نادیا به دانش‌آموزان کمک می‌کند علایق را به رهبری و پروژه‌های معنادار تبدیل کنند. او به جوانان مربیگری می‌دهد تا تأثیری واقعی بسازند — از آن نوع که هم یک درخواست و هم یک شخصیت را تقویت می‌کند.",
    },
    {
      slug: "carlos-mendez", cat: "mentoring", name_en: "Carlos Mendez", name_fa: "کارلوس مندز",
      role_en: "Interview & Confidence Coach", role_fa: "مربی مصاحبه و اعتمادبه‌نفس", location: "Remote",
      tags: ["Mock interviews", "Communication"],
      bio_en: "Carlos coaches students to interview with confidence and authenticity. Through realistic practice and warm feedback, he helps them turn nerves into genuine presence.",
      bio_fa: "کارلوس به دانش‌آموزان مربیگری می‌دهد تا با اطمینان و اصالت مصاحبه کنند. از طریق تمرین واقع‌گرایانه و بازخورد گرم، او به آن‌ها کمک می‌کند اضطراب را به حضوری راستین تبدیل کنند.",
    },
    {
      slug: "yuki-tanaka", cat: "strategy", name_en: "Yuki Tanaka", name_fa: "یوکی تاناکا",
      role_en: "STEM Admissions Specialist", role_fa: "متخصص پذیرش STEM", location: "Remote",
      tags: ["Engineering", "CS programs"],
      bio_en: "Yuki specializes in STEM admissions, guiding aspiring engineers and computer scientists into competitive programs. She knows what top STEM departments look for and how to help students stand out.",
      bio_fa: "یوکی در پذیرش STEM تخصص دارد و مهندسان و دانشمندان علوم کامپیوتر مشتاق را به رشته‌های رقابتی راهنمایی می‌کند. او می‌داند دانشکده‌های برتر STEM به دنبال چه هستند و چگونه می‌توان به دانش‌آموزان کمک کرد تا برجسته شوند.",
    },
  ];
  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    await prisma.teamMember.create({
      data: {
        categoryId: categoryIds[m.cat],
        slug: m.slug,
        name_en: m.name_en,
        name_fa: m.name_fa,
        role_en: m.role_en,
        role_fa: m.role_fa,
        bio_en: m.bio_en,
        bio_fa: m.bio_fa,
        fullBio_en: `${m.bio_en} At MentorMe, ${m.name_en.split(" ")[0]} brings this expertise to every student they mentor, combining deep experience with genuine care for each family's goals.`,
        fullBio_fa: `${m.bio_fa} در MentorMe، ${m.name_fa.split(" ")[0]} این تخصص را به هر دانش‌آموزی که منتورینگ می‌کند می‌آورد و تجربه‌ی عمیق را با دلسوزی راستین برای اهداف هر خانواده درمی‌آمیزد.`,
        photoUrl: `/uploads/team-${m.slug}.jpg`,
        photoAlt_en: `${m.name_en}, ${m.role_en} at MentorMe`,
        photoAlt_fa: `${m.name_fa}، ${m.role_fa} در MentorMe`,
        linkedinUrl: `https://linkedin.com/in/${m.slug}`,
        email: `${m.slug.replace(/-/g, ".")}@mentorme.com`,
        location: m.location,
        specialtyTags: m.tags,
        isFeatured: true,
        isActive: true,
        sortOrder: i,
      },
    });
  }
  const teamMemberCount = members.length;

  // ---------------------------------------------------------------
  // 22. EVENTS
  // ---------------------------------------------------------------
  const events = [
    {
      slug: "college-essay-workshop",
      title_en: "Cracking the College Essay (Live Workshop)",
      title_fa: "رمزگشایی از مقاله‌ی دانشگاه (کارگاه زنده)",
      short_en: "A hands-on live workshop on writing personal statements that stand out. Free to attend.",
      short_fa: "یک کارگاه زنده و عملی درباره‌ی نگارش بیانیه‌های شخصی برجسته. شرکت رایگان است.",
      content_en:
        "Join MentorMe's senior essay mentors for a practical, hands-on workshop on the college personal statement. We'll break down what makes an essay memorable, work through real examples, and share a framework you can use immediately.\n\nWhether your student is staring at a blank page or stuck on a tenth draft, this session offers clarity and momentum. Bring questions — there will be time for live Q&A. Free to attend.",
      content_fa:
        "به منتورهای ارشد مقاله‌ی MentorMe در یک کارگاه عملی و کاربردی درباره‌ی بیانیه‌ی شخصی دانشگاه بپیوندید. ما واکاوی می‌کنیم چه چیزی یک مقاله را به‌یادماندنی می‌کند، نمونه‌های واقعی را بررسی می‌کنیم و چارچوبی به اشتراک می‌گذاریم که می‌توانید بی‌درنگ از آن استفاده کنید.\n\nخواه دانش‌آموز شما به یک صفحه‌ی سفید خیره شده باشد یا در پیش‌نویس دهم گیر کرده باشد، این جلسه وضوح و حرکت به همراه می‌آورد. پرسش‌هایتان را بیاورید — زمانی برای پرسش‌وپاسخ زنده خواهد بود. شرکت رایگان است.",
      location_en: "Online (Zoom)", location_fa: "آنلاین (زوم)",
      startDate: "2026-07-15T22:00:00.000Z",
    },
    {
      slug: "standout-application-night",
      title_en: "Building a Standout Application: Parent & Student Night",
      title_fa: "ساخت یک درخواست برجسته: شب والدین و دانش‌آموزان",
      short_en: "An evening session for families on what makes an application truly stand out. Free to attend.",
      short_fa: "یک جلسه‌ی عصرگاهی برای خانواده‌ها درباره‌ی اینکه چه چیزی یک درخواست را واقعاً برجسته می‌کند. شرکت رایگان است.",
      content_en:
        "This parent-and-student evening covers the big picture: how admissions committees read applications, what truly moves the needle, and how families can support the journey without adding stress.\n\nOur mentors will walk through the elements of a standout application — academics, activities, essays, and fit — and answer your questions live. A relaxed, informative session for the whole family. Free to attend.",
      content_fa:
        "این جلسه‌ی عصرگاهی والدین و دانش‌آموزان تصویر کلی را پوشش می‌دهد: اینکه کمیته‌های پذیرش چگونه درخواست‌ها را می‌خوانند، چه چیزی واقعاً تأثیرگذار است و خانواده‌ها چگونه می‌توانند بدون افزودن استرس از این مسیر پشتیبانی کنند.\n\nمنتورهای ما عناصر یک درخواست برجسته را مرور می‌کنند — تحصیل، فعالیت‌ها، مقالات و تناسب — و به پرسش‌های شما به‌صورت زنده پاسخ می‌دهند. جلسه‌ای آرام و آموزنده برای کل خانواده. شرکت رایگان است.",
      location_en: "Online (Zoom)", location_fa: "آنلاین (زوم)",
      startDate: "2026-07-29T23:00:00.000Z",
    },
    {
      slug: "scholarships-decoded",
      title_en: "Scholarships & Financial Aid Decoded",
      title_fa: "رمزگشایی از بورسیه و کمک‌هزینه‌ی مالی",
      short_en: "A clear, practical webinar on finding and winning scholarships and aid. Free to attend.",
      short_fa: "یک وبینار روشن و کاربردی درباره‌ی یافتن و کسب بورسیه‌ها و کمک‌هزینه‌ها. شرکت رایگان است.",
      content_en:
        "Funding college can feel overwhelming, but it doesn't have to be. In this webinar, MentorMe's financial aid advisor demystifies scholarships, the FAFSA, the CSS Profile, and the strategies that maximize your total aid.\n\nYou'll leave knowing what to apply for, when, and how to avoid the common mistakes that cost families thousands. Practical, jargon-free, and open to your questions. Free to attend.",
      content_fa:
        "تأمین هزینه‌ی دانشگاه می‌تواند طاقت‌فرسا به نظر برسد، اما نباید چنین باشد. در این وبینار، مشاور کمک‌هزینه‌ی مالی MentorMe بورسیه‌ها، FAFSA، CSS Profile و راهبردهایی را که کل کمک‌هزینه‌ی شما را بیشینه می‌کنند، شفاف می‌سازد.\n\nشما با دانستن اینکه برای چه چیزی، چه زمانی و چگونه درخواست دهید و چگونه از اشتباهات رایجی که برای خانواده‌ها هزاران دلار هزینه دارد دوری کنید، این جلسه را ترک خواهید کرد. کاربردی، بدون اصطلاحات پیچیده و پذیرای پرسش‌های شما. شرکت رایگان است.",
      location_en: "Online (Webinar)", location_fa: "آنلاین (وبینار)",
      startDate: "2026-08-12T22:30:00.000Z",
    },
    {
      slug: "transfer-roadmap-session",
      title_en: "Transfer Student Roadmap Session",
      title_fa: "جلسه‌ی نقشه‌ی راه دانشجوی انتقالی",
      short_en: "A focused session on planning a successful university transfer. Free to attend.",
      short_fa: "یک جلسه‌ی متمرکز درباره‌ی برنامه‌ریزی یک انتقال موفق به دانشگاه. شرکت رایگان است.",
      content_en:
        "Transferring has its own rules, deadlines, and essays — and this session covers all of them. Our transfer specialist explains how to build a strong case, align your credits, and time your application for the best outcome.\n\nJoin us in person at our Boston office or online. Ideal for community college students and anyone considering a move to a better-fit university. Free to attend.",
      content_fa:
        "انتقال قواعد، مهلت‌ها و مقالات خاص خود را دارد — و این جلسه همه‌ی آن‌ها را پوشش می‌دهد. متخصص انتقال ما توضیح می‌دهد چگونه یک پرونده‌ی قوی بسازید، واحدهای خود را هماهنگ کنید و زمان درخواست خود را برای بهترین نتیجه تنظیم کنید.\n\nبه‌صورت حضوری در دفتر بوستون ما یا آنلاین به ما بپیوندید. ایده‌آل برای دانشجویان کالج محلی و هر کسی که به جابجایی به دانشگاهی متناسب‌تر می‌اندیشد. شرکت رایگان است.",
      location_en: "Boston Office + Online", location_fa: "دفتر بوستون + آنلاین",
      startDate: "2026-08-26T22:00:00.000Z",
    },
    {
      slug: "sat-90-day-bootcamp",
      title_en: "Test Prep Bootcamp: SAT in 90 Days",
      title_fa: "بوت‌کمپ آمادگی آزمون: SAT در ۹۰ روز",
      short_en: "A kickoff session for a focused 90-day SAT preparation plan. Free to attend.",
      short_fa: "یک جلسه‌ی آغازین برای یک برنامه‌ی متمرکز ۹۰ روزه‌ی آمادگی SAT. شرکت رایگان است.",
      content_en:
        "Can you meaningfully raise your SAT score in 90 days? With the right plan, yes. This kickoff session lays out a realistic, high-impact study roadmap and the habits that turn practice into points.\n\nMentorMe's test prep lead shares the strategies top scorers use and answers your questions about timing, materials, and managing test-day nerves. Free to attend.",
      content_fa:
        "آیا می‌توانید نمره‌ی SAT خود را در ۹۰ روز به‌طور معنادار بالا ببرید؟ با برنامه‌ی درست، بله. این جلسه‌ی آغازین یک نقشه‌ی راه مطالعه‌ی واقع‌بینانه و پرتأثیر و عادت‌هایی را که تمرین را به امتیاز تبدیل می‌کنند، تشریح می‌کند.\n\nسرپرست آمادگی آزمون MentorMe راهبردهایی را که برترین‌ها به کار می‌برند به اشتراک می‌گذارد و به پرسش‌های شما درباره‌ی زمان‌بندی، منابع و مدیریت اضطراب روز آزمون پاسخ می‌دهد. شرکت رایگان است.",
      location_en: "Online (Zoom)", location_fa: "آنلاین (زوم)",
      startDate: "2026-09-09T21:30:00.000Z",
    },
  ];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    await prisma.event.create({
      data: {
        slug: e.slug,
        title_en: e.title_en,
        title_fa: e.title_fa,
        shortDescription_en: e.short_en,
        shortDescription_fa: e.short_fa,
        content_en: e.content_en,
        content_fa: e.content_fa,
        imageUrl: `/uploads/event-${e.slug}.jpg`,
        imageAlt_en: `${e.title_en} — MentorMe event`,
        imageAlt_fa: `${e.title_fa} — رویداد MentorMe`,
        location_en: e.location_en,
        location_fa: e.location_fa,
        startDate: new Date(e.startDate),
        timezone: "America/New_York",
        registrationCtaId: ctaRegisterEvent.id,
        capacity: 100,
        eventStatus: "PUBLISHED",
        isFeatured: i < 4,
        metaTitle_en: `${e.title_en} | MentorMe Webinar`,
        metaTitle_fa: `${e.title_fa} | وبینار MentorMe`,
        metaDescription_en: `Join MentorMe's free ${e.title_en}. Practical guidance for students and parents.`,
        metaDescription_fa: `به ${e.title_fa} رایگان MentorMe بپیوندید. راهنمایی کاربردی برای دانش‌آموزان و والدین.`,
      },
    });
  }
  const eventCount = events.length;

  // ---------------------------------------------------------------
  // 23. SEO SETTINGS
  // ---------------------------------------------------------------
  await prisma.seoSetting.create({
    data: {
      pageId: homePage.id,
      metaTitle_en: "MentorMe — Your Future, Mentored",
      metaTitle_fa: "MentorMe — آینده‌ی شما، با راهنمایی",
      metaDescription_en:
        "Expert one-on-one college admissions mentorship. From uncertainty to acceptance — trusted by 500+ families.",
      metaDescription_fa:
        "راهنمایی تخصصی و فردی برای پذیرش دانشگاه. از تردید تا پذیرش — مورد اعتماد بیش از ۵۰۰ خانواده.",
      canonicalUrl: "https://mentorme.com/",
      ogImageUrl: "/uploads/og-home.jpg",
      noIndex: false,
      noFollow: false,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "MentorMe",
        url: "https://mentorme.com",
        email: "hello@mentorme.com",
        telephone: "+1 (555) 012-3456",
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "312" },
      },
    },
  });
  await prisma.seoSetting.create({
    data: {
      pageId: contactPage.id,
      metaTitle_en: "Book a Consultation | MentorMe",
      metaTitle_fa: "رزرو مشاوره | MentorMe",
      metaDescription_en:
        "Book a free, no-pressure consultation with a MentorMe mentor. We'll map your next step.",
      metaDescription_fa:
        "یک مشاوره‌ی رایگان و بدون فشار با یک منتور MentorMe رزرو کنید. ما گام بعدی شما را ترسیم می‌کنیم.",
      canonicalUrl: "https://mentorme.com/contact",
      ogImageUrl: "/uploads/og-contact.jpg",
      noIndex: false,
      noFollow: false,
      structuredData: Prisma.JsonNull,
    },
  });
  const seoSettingCount = 2;

  // ---------------------------------------------------------------
  // 24. LEADS + ACTIVITIES
  // ---------------------------------------------------------------
  const leads: {
    firstName: string; lastName: string; email: string; phone: string;
    grade: "GRADE_6" | "GRADE_7" | "GRADE_8" | "GRADE_9" | "GRADE_10" | "GRADE_11" | "GRADE_12" | "TRANSFER";
    country: string; source: string; status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "CLOSED";
    notes: string; assignedToId: string | null;
    activities?: { activityType: string; description: string }[];
  }[] = [
    { firstName: "Emma", lastName: "Johnson", email: "emma.johnson@example.com", phone: "+1 555 100 0001", grade: "GRADE_11", country: "USA", source: "homepage_cta", status: "NEW", notes: "Submitted via hero consultation form.", assignedToId: null,
      activities: [{ activityType: "created", description: "Lead created from homepage consultation CTA." }] },
    { firstName: "Liam", lastName: "Smith", email: "liam.smith@example.com", phone: "+1 555 100 0002", grade: "GRADE_12", country: "Canada", source: "contact_form", status: "CONTACTED", notes: "Replied to intro email, interested in essay mentorship.", assignedToId: editorUser.id,
      activities: [
        { activityType: "created", description: "Lead created from contact form." },
        { activityType: "email_sent", description: "Sent introductory email and consultation scheduling link." },
      ] },
    { firstName: "Olivia", lastName: "Brown", email: "olivia.brown@example.com", phone: "+1 555 100 0003", grade: "GRADE_10", country: "UK", source: "event", status: "QUALIFIED", notes: "Attended essay workshop, strong fit for full strategy package.", assignedToId: editorUser.id,
      activities: [
        { activityType: "created", description: "Lead captured at College Essay Workshop." },
        { activityType: "call", description: "Discovery call completed; goals and timeline aligned." },
        { activityType: "qualified", description: "Marked qualified — budget and timeline confirmed." },
      ] },
    { firstName: "Noah", lastName: "Davis", email: "noah.davis@example.com", phone: "+1 555 100 0004", grade: "TRANSFER", country: "USA", source: "homepage_cta", status: "CONVERTED", notes: "Signed up for Transfer Student Advising.", assignedToId: adminUser.id,
      activities: [
        { activityType: "created", description: "Lead created from homepage CTA." },
        { activityType: "converted", description: "Converted to client — enrolled in transfer advising." },
      ] },
    { firstName: "Ava", lastName: "Wilson", email: "ava.wilson@example.com", phone: "+1 555 100 0005", grade: "GRADE_9", country: "UAE", source: "contact_form", status: "CLOSED", notes: "Decided to revisit next year.", assignedToId: editorUser.id,
      activities: [{ activityType: "closed", description: "Closed — family chose to start next year." }] },
    { firstName: "Sophia", lastName: "Martinez", email: "sophia.martinez@example.com", phone: "+1 555 100 0006", grade: "GRADE_8", country: "USA", source: "homepage_cta", status: "NEW", notes: "Early-start inquiry.", assignedToId: null },
    { firstName: "Mason", lastName: "Anderson", email: "mason.anderson@example.com", phone: "+1 555 100 0007", grade: "GRADE_12", country: "Canada", source: "event", status: "CONTACTED", notes: "Attended application night, awaiting reply.", assignedToId: adminUser.id },
    { firstName: "Isabella", lastName: "Taylor", email: "isabella.taylor@example.com", phone: "+1 555 100 0008", grade: "GRADE_11", country: "UK", source: "contact_form", status: "QUALIFIED", notes: "Interested in scholarship guidance.", assignedToId: editorUser.id },
    { firstName: "Ethan", lastName: "Thomas", email: "ethan.thomas@example.com", phone: "+1 555 100 0009", grade: "GRADE_10", country: "USA", source: "homepage_cta", status: "CONVERTED", notes: "Enrolled in admissions strategy.", assignedToId: adminUser.id,
      activities: [{ activityType: "converted", description: "Converted — enrolled in College Admissions Strategy." }] },
    { firstName: "Mia", lastName: "Hernandez", email: "mia.hernandez@example.com", phone: "+1 555 100 0010", grade: "GRADE_7", country: "USA", source: "event", status: "CLOSED", notes: "Not ready to start; keep nurturing.", assignedToId: null },
  ];
  let leadActivityCount = 0;
  for (const l of leads) {
    const created = await prisma.lead.create({
      data: {
        firstName: l.firstName,
        lastName: l.lastName,
        email: l.email,
        phone: l.phone,
        grade: l.grade,
        country: l.country,
        source: l.source,
        status: l.status,
        notes: l.notes,
        assignedToId: l.assignedToId,
        campaignData: { utm_source: l.source, utm_medium: "web" },
      },
    });
    if (l.activities) {
      for (const a of l.activities) {
        await prisma.leadActivity.create({
          data: {
            leadId: created.id,
            activityType: a.activityType,
            description: a.description,
            createdBy: l.assignedToId ?? adminUser.id,
          },
        });
        leadActivityCount++;
      }
    }
  }
  const leadCount = leads.length;

  // ---------------------------------------------------------------
  // 25. MEDIA ASSETS
  // ---------------------------------------------------------------
  const media = [
    { fileName: "placeholder-hero.jpg", fileUrl: "/uploads/placeholder-hero.jpg", altText_en: "Mentor guiding a student", altText_fa: "منتور در حال راهنمایی یک دانش‌آموز" },
    { fileName: "placeholder-philosophy.jpg", fileUrl: "/uploads/placeholder-philosophy.jpg", altText_en: "The MentorMe team mentoring", altText_fa: "تیم MentorMe در حال منتورینگ" },
    { fileName: "placeholder-final-cta.jpg", fileUrl: "/uploads/placeholder-final-cta.jpg", altText_en: "Aspirational campus scene", altText_fa: "نمای الهام‌بخش دانشگاه" },
    { fileName: "founder-elena-hart.jpg", fileUrl: "/uploads/founder-elena-hart.jpg", altText_en: "Dr. Elena Hart", altText_fa: "دکتر اِلِنا هارت" },
  ];
  for (const m of media) {
    await prisma.mediaAsset.create({
      data: {
        fileName: m.fileName,
        fileUrl: m.fileUrl,
        mediaType: "IMAGE",
        mimeType: "image/jpeg",
        fileSize: 204800,
        width: 1600,
        height: 900,
        altText_en: m.altText_en,
        altText_fa: m.altText_fa,
        createdBy: adminUser.id,
      },
    });
  }
  const mediaAssetCount = media.length;

  // ---------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------
  console.log("\n✅ Seed complete. Row counts:");
  const summary: Record<string, number> = {
    User: userCount,
    ThemeSetting: 1,
    CtaConfig: ctaConfigCount,
    GradeOption: gradeOptionCount,
    Menu: menuCount,
    MenuItem: menuItemCount,
    Page: pageCount,
    HomepageSection: homepageSectionCount,
    HeroSection: 1,
    AsSeenInLogo: asSeenInCount,
    MethodologyStep: methodologyStepCount,
    Testimonial: testimonialCount,
    ValueProposition: valuePropositionCount,
    BrandPhilosophy: 1,
    SuccessMetric: successMetricCount,
    FounderMessage: 1,
    FinalCta: 1,
    FooterSetting: 1,
    Service: serviceCount,
    CaseStudy: caseStudyCount,
    TeamCategory: teamCategoryCount,
    TeamMember: teamMemberCount,
    Event: eventCount,
    SeoSetting: seoSettingCount,
    Lead: leadCount,
    LeadActivity: leadActivityCount,
    MediaAsset: mediaAssetCount,
  };
  for (const [k, v] of Object.entries(summary)) {
    console.log(`  ${k}: ${v}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
