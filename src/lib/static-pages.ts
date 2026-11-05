import type { Lang } from "./i18n";

export type PageKey = "about" | "contact" | "privacy" | "terms" | "editorial";

type Section = { heading?: string; body: string[]; bullets?: string[] };
type PageContent = { title: string; intro: string; sections: Section[] };

export const PAGES: Record<Lang, Record<PageKey, PageContent>> = {
  en: {
    about: {
      title: "About us",
      intro:
        "Global Wire is an automated news aggregation service. We continuously read public RSS and Atom feeds from established publishers and present their headlines in one fast, ad-light reading experience across English, Arabic and Chinese.",
      sections: [
        {
          heading: "How the technology works",
          body: [
            "Our ingestion engine polls a curated list of publisher feeds every 15 minutes. Each item is parsed for its title, summary, publication time and source, then de-duplicated so the same story never appears twice.",
            "Key concepts are extracted from the wording of each item using statistical keyword analysis on our own servers. No external language models are used, which keeps the service fast, private and free of API costs.",
          ],
        },
        {
          heading: "Our mission",
          body: [
            "We believe readers deserve a single, quick place to scan what the world's newsrooms are publishing right now — in their own language, without heavy pages or intrusive advertising.",
            "We never claim authorship of the reporting we surface. Every story credits its publisher and links directly to the original article.",
          ],
        },
      ],
    },
    contact: {
      title: "Contact us",
      intro:
        "Questions, corrections, takedown requests or advertising enquiries are welcome. We aim to reply within two business days.",
      sections: [
        {
          heading: "Business enquiries",
          body: [
            "For advertising, syndication partnerships and press matters, please use the form and select a clear subject line so your message reaches the right desk.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacy policy",
      intro:
        "This policy explains what data Global Wire processes and the choices available to you. It is written to meet GDPR requirements and the policies of advertising networks such as Google AdSense.",
      sections: [
        {
          heading: "Data we process",
          body: [
            "We do not require an account and we do not ask for personal data to read the site. If you contact us, we process the name, email address and message you provide solely to answer you.",
          ],
        },
        {
          heading: "Cookies and advertising",
          body: [
            "We may display advertising supplied by third-party networks. Those networks, including Google and its partners, may set cookies or use device identifiers to serve and measure ads, including personalised ads where you have consented.",
            "You can withdraw or change consent at any time through your browser settings or the consent controls shown to you, and you may opt out of personalised advertising via Google Ads Settings and www.aboutads.info.",
          ],
        },
        {
          heading: "Analytics and logs",
          body: [
            "Standard server logs may record IP address, user agent and requested page for security and abuse prevention. Logs are retained for a limited period and never sold.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You may request access to, correction of, or deletion of any personal data we hold about you, and you may lodge a complaint with your local data protection authority. Contact us via the contact page to exercise these rights.",
          ],
        },
      ],
    },
    terms: {
      title: "Terms of service",
      intro:
        "By using Global Wire you agree to these terms. The service aggregates publicly available syndicated content and links to external websites.",
      sections: [
        {
          heading: "Syndicated content",
          body: [
            "Headlines, summaries and thumbnails are supplied by publishers through their own public RSS or Atom feeds. Copyright remains with those publishers. We display an attributed extract and always link to the original article.",
            "If you are a rights holder and want your feed removed, contact us and we will remove it promptly.",
          ],
        },
        {
          heading: "External sources",
          body: [
            "Links marked as original sources lead to third-party websites that we do not control. We are not responsible for their content, accuracy, availability or privacy practices.",
          ],
        },
        {
          heading: "No warranty",
          body: [
            "The service is provided on an as-is basis. Feeds can be delayed, incomplete or temporarily unavailable, and nothing here constitutes professional, financial or legal advice.",
          ],
        },
        {
          heading: "Acceptable use",
          body: [
            "You agree not to scrape the service at a volume that degrades it, to bypass technical limits, or to reproduce aggregated pages wholesale without permission.",
          ],
        },
      ],
    },
    editorial: {
      title: "Editorial guidelines & source credits",
      intro:
        "Global Wire is an aggregator, not a newsroom. We do not write, rewrite or editorialise the reporting we display. These guidelines describe exactly how content reaches this site.",
      sections: [
        {
          heading: "Attribution",
          body: [
            "Every item shows the publisher name, publication time and a prominent link to the original article using rel=\"nofollow noopener noreferrer\". Summaries are limited extracts taken directly from the publisher's own feed.",
          ],
        },
        {
          heading: "Source selection",
          body: [
            "We include feeds from established news organisations with a public editorial policy and a track record of corrections. Sources currently include BBC, The Guardian, NPR, The Verge, TechCrunch, Sky News Arabia, RFI and The New York Times Chinese edition, among others.",
          ],
        },
        {
          heading: "Corrections and removals",
          body: [
            "Corrections are the responsibility of the originating publisher; once their feed updates, our copy follows. Removal or correction requests sent through our contact page are actioned as quickly as possible.",
          ],
        },
        {
          heading: "No AI-generated reporting",
          body: [
            "Categories, tags and related-story links are produced by deterministic keyword analysis. No generative AI writes or alters any headline or summary on this site.",
          ],
        },
      ],
    },
  },
  ar: {
    about: {
      title: "من نحن",
      intro:
        "غلوبال واير خدمة آلية لتجميع الأخبار. نقرأ باستمرار خلاصات RSS وAtom العامة من ناشرين معروفين ونعرض عناوينهم في تجربة قراءة سريعة بثلاث لغات: الإنجليزية والعربية والصينية.",
      sections: [
        {
          heading: "كيف تعمل التقنية",
          body: [
            "يقوم محرك التجميع بقراءة قائمة مختارة من الخلاصات كل 15 دقيقة، ويستخرج العنوان والملخص ووقت النشر والمصدر، ثم يمنع تكرار الخبر نفسه.",
            "تُستخرج الكلمات المفتاحية إحصائياً على خدماتنا الخاصة دون استخدام أي نماذج ذكاء اصطناعي خارجية، مما يحافظ على السرعة والخصوصية وانعدام تكاليف الواجهات البرمجية.",
          ],
        },
        {
          heading: "مهمتنا",
          body: [
            "نؤمن بأن القارئ يستحق مكاناً واحداً سريعاً لمتابعة ما تنشره غرف الأخبار حول العالم، بلغته ودون صفحات ثقيلة أو إعلانات مزعجة.",
            "لا ننسب إلى أنفسنا أي تقرير صحفي؛ كل خبر يذكر ناشره ويحيل إلى المقال الأصلي.",
          ],
        },
      ],
    },
    contact: {
      title: "اتصل بنا",
      intro:
        "نرحب بالأسئلة والتصحيحات وطلبات إزالة المحتوى واستفسارات الإعلان. نسعى للرد خلال يومي عمل.",
      sections: [
        {
          heading: "استفسارات الأعمال",
          body: [
            "للإعلان وشراكات النشر والمسائل الصحفية، استخدم النموذج واكتب موضوعاً واضحاً ليصل طلبك إلى الجهة المناسبة.",
          ],
        },
      ],
    },
    privacy: {
      title: "سياسة الخصوصية",
      intro:
        "توضح هذه السياسة البيانات التي نعالجها وخياراتك المتاحة، وهي مكتوبة بما يتوافق مع اللائحة الأوروبية GDPR وسياسات شبكات الإعلان مثل Google AdSense.",
      sections: [
        {
          heading: "البيانات التي نعالجها",
          body: [
            "لا يتطلب الموقع إنشاء حساب ولا نطلب بيانات شخصية للقراءة. وإذا تواصلت معنا نعالج الاسم والبريد والرسالة لغرض الرد فقط.",
          ],
        },
        {
          heading: "ملفات تعريف الارتباط والإعلانات",
          body: [
            "قد نعرض إعلانات من شبكات خارجية، وقد تستخدم هذه الشبكات ومن بينها Google وشركاؤها ملفات تعريف الارتباط أو معرّفات الجهاز لعرض الإعلانات وقياسها، بما في ذلك الإعلانات المخصصة عند موافقتك.",
            "يمكنك سحب الموافقة أو تعديلها في أي وقت من إعدادات المتصفح أو من أدوات الموافقة، كما يمكنك إلغاء تخصيص الإعلانات عبر إعدادات إعلانات Google وموقع www.aboutads.info.",
          ],
        },
        {
          heading: "السجلات والتحليلات",
          body: [
            "قد تسجل سجلات الخدمة عنوان IP ونوع المتصفح والصفحة المطلوبة لأغراض الأمان ومنع الإساءة، وتُحفظ لفترة محدودة ولا تُباع.",
          ],
        },
        {
          heading: "حقوقك",
          body: [
            "يحق لك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها، وتقديم شكوى إلى الجهة المختصة بحماية البيانات في بلدك. تواصل معنا لممارسة هذه الحقوق.",
          ],
        },
      ],
    },
    terms: {
      title: "شروط الاستخدام",
      intro:
        "باستخدامك غلوبال واير فإنك توافق على هذه الشروط. تجمع الخدمة محتوى منشوراً علناً وتحيل إلى مواقع خارجية.",
      sections: [
        {
          heading: "المحتوى المنقول",
          body: [
            "العناوين والملخصات والصور المصغرة تأتي من الناشرين عبر خلاصاتهم العامة، وحقوق النشر تبقى لهم. نعرض مقتطفاً منسوباً مع رابط دائم للمقال الأصلي.",
            "إذا كنت صاحب حقوق وترغب في إزالة خلاصتك، تواصل معنا وسنزيلها فوراً.",
          ],
        },
        {
          heading: "المصادر الخارجية",
          body: [
            "روابط المصدر الأصلي تؤدي إلى مواقع لا نتحكم بها، ولا نتحمل مسؤولية محتواها أو دقتها أو سياسات خصوصيتها.",
          ],
        },
        {
          heading: "إخلاء المسؤولية",
          body: [
            "تُقدَّم الخدمة كما هي، وقد تتأخر الخلاصات أو تكون ناقصة أو غير متاحة مؤقتاً، ولا يُعد أي محتوى هنا استشارة مهنية أو مالية أو قانونية.",
          ],
        },
        {
          heading: "الاستخدام المقبول",
          body: [
            "تتعهد بعدم استخراج المحتوى بكثافة تُضعف الخدمة، أو تجاوز القيود التقنية، أو إعادة نشر صفحات التجميع كاملة دون إذن.",
          ],
        },
      ],
    },
    editorial: {
      title: "السياسة التحريرية وحقوق المصادر",
      intro:
        "غلوبال واير خدمة تجميع وليست غرفة أخبار. لا نكتب التقارير ولا نعيد صياغتها. توضح هذه السياسة كيف يصل المحتوى إلى الموقع.",
      sections: [
        {
          heading: "النسبة إلى المصدر",
          body: [
            "يظهر مع كل خبر اسم الناشر ووقت النشر ورابط بارز للمقال الأصلي باستخدام rel=\"nofollow noopener noreferrer\"، والملخصات مقتطفات محدودة من خلاصة الناشر نفسها.",
          ],
        },
        {
          heading: "اختيار المصادر",
          body: [
            "نعتمد خلاصات مؤسسات إعلامية معروفة لها سياسة تحريرية معلنة، ومنها بي بي سي والغارديان وسكاي نيوز عربية ومونت كارلو الدولية ونيويورك تايمز بالصينية.",
          ],
        },
        {
          heading: "التصحيح والإزالة",
          body: [
            "التصحيح مسؤولية الناشر الأصلي، وبمجرد تحديث خلاصته تتحدث نسختنا. وتُنفَّذ طلبات الإزالة أو التصحيح الواردة عبر صفحة الاتصال بأسرع وقت.",
          ],
        },
        {
          heading: "لا تقارير مولّدة آلياً",
          body: [
            "التصنيفات والوسوم والأخبار ذات الصلة تُنتج بتحليل كلمات مفتاحية محدد سلفاً، ولا يشارك أي ذكاء اصطناعي توليدي في كتابة أو تعديل العناوين والملخصات.",
          ],
        },
      ],
    },
  },
  zh: {
    about: {
      title: "关于我们",
      intro:
        "环球通讯是一项自动化新闻聚合服务。我们持续读取知名媒体公开的 RSS 与 Atom 源，并以英文、阿拉伯文和中文三种语言提供快速、少广告的阅读体验。",
      sections: [
        {
          heading: "技术如何运作",
          body: [
            "采集引擎每 15 分钟读取一次精选媒体源，解析标题、摘要、发布时间与来源，并自动去重，避免同一条新闻重复出现。",
            "关键词由我们自有服务器上的统计分析得出，不调用任何外部大语言模型，因此速度快、隐私好且没有接口费用。",
          ],
        },
        {
          heading: "我们的使命",
          body: [
            "读者值得一个快速的入口，用自己的语言浏览全球新闻编辑室此刻发布的内容，而不必忍受沉重页面与干扰性广告。",
            "我们从不声称拥有所展示报道的著作权，每条新闻都标注出版方并直接链接原文。",
          ],
        },
      ],
    },
    contact: {
      title: "联系我们",
      intro: "欢迎提出问题、更正、内容移除请求或广告合作咨询，我们力争在两个工作日内回复。",
      sections: [
        {
          heading: "商务咨询",
          body: ["广告、内容合作与媒体事务请使用表单，并填写清晰主题，以便转交相应负责人。"],
        },
      ],
    },
    privacy: {
      title: "隐私政策",
      intro:
        "本政策说明环球通讯处理哪些数据以及您拥有的选择，内容遵循 GDPR 要求以及 Google AdSense 等广告网络的政策。",
      sections: [
        {
          heading: "我们处理的数据",
          body: ["阅读本站无需注册账号，也不需要提供个人信息。若您联系我们，我们仅为回复您而处理姓名、邮箱与留言内容。"],
        },
        {
          heading: "Cookie 与广告",
          body: [
            "本站可能展示第三方广告网络提供的广告。包括 Google 及其合作伙伴在内的网络可能使用 Cookie 或设备标识来投放和衡量广告，并在您同意的情况下投放个性化广告。",
            "您可随时通过浏览器设置或同意管理工具撤回或更改同意，也可通过 Google 广告设置及 www.aboutads.info 退出个性化广告。",
          ],
        },
        {
          heading: "日志与分析",
          body: ["服务器日志可能记录 IP 地址、浏览器信息与访问页面，用于安全与防滥用，保存期限有限且绝不出售。"],
        },
        {
          heading: "您的权利",
          body: ["您可要求访问、更正或删除我们持有的个人数据，并可向当地数据保护机构投诉。请通过联系页面行使这些权利。"],
        },
      ],
    },
    terms: {
      title: "服务条款",
      intro: "使用环球通讯即表示您同意本条款。本服务聚合公开发布的内容并链接至外部网站。",
      sections: [
        {
          heading: "聚合内容",
          body: [
            "标题、摘要与缩略图由出版方通过其公开 RSS 或 Atom 源提供，版权归其所有。我们仅展示标注来源的有限摘录，并始终链接原文。",
            "若您是权利人并希望移除您的源，请联系我们，我们将尽快处理。",
          ],
        },
        {
          heading: "外部来源",
          body: ["标注为原文的链接指向我们无法控制的第三方网站，其内容、准确性、可用性与隐私做法概不由我们负责。"],
        },
        {
          heading: "免责声明",
          body: ["服务按现状提供。新闻源可能延迟、不完整或暂时不可用，本站内容不构成专业、财务或法律建议。"],
        },
        {
          heading: "合理使用",
          body: ["您同意不以影响服务稳定的强度抓取本站、不绕过技术限制、不在未获许可的情况下整体转载聚合页面。"],
        },
      ],
    },
    editorial: {
      title: "编辑准则与来源署名",
      intro:
        "环球通讯是聚合平台而非新闻编辑室。我们不撰写、不改写所展示的报道。以下说明内容进入本站的确切方式。",
      sections: [
        {
          heading: "署名方式",
          body: [
            '每条内容都显示出版方名称、发布时间，并以 rel="nofollow noopener noreferrer" 的显著链接指向原文；摘要为出版方源中的有限摘录。',
          ],
        },
        {
          heading: "来源选择",
          body: [
            "我们仅收录具有公开编辑政策与更正记录的成熟新闻机构，目前包括 BBC、卫报、NPR、The Verge、TechCrunch、阿拉伯天空新闻、法国国际广播电台以及纽约时报中文网等。",
          ],
        },
        {
          heading: "更正与移除",
          body: ["更正由原出版方负责，其源更新后本站随之更新。通过联系页面提交的移除或更正请求将尽快处理。"],
        },
        {
          heading: "无 AI 生成报道",
          body: ["分类、标签与相关报道均由确定性关键词分析生成，本站任何标题或摘要都不由生成式 AI 撰写或修改。"],
        },
      ],
    },
  },
};
