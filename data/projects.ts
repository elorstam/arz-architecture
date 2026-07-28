export type ProjectImage = {
  src: string;
  alt: string;
  contain?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  titleLines: string[];
  category: string;
  location: string;
  year: string;
  services: string[];
  cover: string;
  coverAlt: string;
  description: string;
  detailParagraphs: string[];
  images: ProjectImage[];
};

export const projects: Project[] = [
  {
    slug: "vespera-port",
    title: "VESPERA PORT",
    titleLines: ["VESPERA", "PORT"],
    category: "Commercial",
    location: "Ankara",
    year: "2026–2027",
    services: ["Mimari Tasarım", "Görselleştirme"],
    cover: "/images/vespera-port/cover.png",
    coverAlt: "VESPERA PORT kapak görseli",
    description:
      "VESPERA PORT, ticari kullanım ihtiyaçlarını çağdaş bir mimari kimlikle bir araya getiren, güçlü cephe karakterine sahip bir proje olarak tasarlandı.",
    detailParagraphs: [
      "Yapının kentsel çevreyle kurduğu ilişki; şeffaf yüzeyler, yatay hatlar ve dengeli cephe oranları üzerinden geliştirildi. Tasarımda işlevsel planlama ve güçlü dış cephe ifadesi birlikte ele alındı.",
      "Günün farklı saatlerinde değişen ışık koşulları, malzeme tercihleri ve cephe derinlikleriyle yapının gündüz ve gece algısının karakterli olması hedeflendi.",
    ],
    images: [
      {
        src: "/images/vespera-port/01.png",
        alt: "VESPERA PORT gündüz dış cephe görünümü",
      },
      {
        src: "/images/vespera-port/02.png",
        alt: "VESPERA PORT gece dış cephe görünümü",
      },
      {
        src: "/images/vespera-port/03.png",
        alt: "VESPERA PORT farklı açıdan gündüz görünümü",
      },
      {
        src: "/images/vespera-port/04.png",
        alt: "VESPERA PORT farklı açıdan gece görünümü",
      },
      {
        src: "/images/vespera-port/05.png",
        alt: "VESPERA PORT cephe tasarımı",
        contain: true,
      },
    ],
  },

  {
    slug: "eryilmaz-apartmani",
    title: "ERYILMAZ APARTMANI",
    titleLines: ["ERYILMAZ", "APARTMANI"],
    category: "Apartman",
    location: "Sancaktepe / İstanbul",
    year: "2026",
    services: ["Mimari Tasarım", "Cephe Tasarımı", "3D Görselleştirme"],
    cover: "/images/eryilmaz-apartmani/cover.png",
    coverAlt: "Eryılmaz Apartmanı gündüz dış cephe görünümü",
    description:
      "Eryılmaz Apartmanı, çağdaş mimari anlayışıyla estetik ve işlevselliği bir araya getiren butik bir konut projesi olarak tasarlandı.",
    detailParagraphs: [
      "Cephe tasarımında modern çizgiler, doğal malzeme dokuları ve dengeli kütle kompozisyonu bir arada ele alındı. Balkon boşlukları, yüzey derinlikleri ve malzeme geçişleriyle yapıya güçlü ve çağdaş bir mimari karakter kazandırıldı.",
      "Ferah yaşam alanları, doğal ışık kullanımı ve kullanıcı konforu projenin temel kararlarını oluşturdu. Yapının bulunduğu çevreyle uyum kurarken kendine özgü kimliğini koruyan nitelikli ve zamansız bir konut yapısı olması hedeflendi.",
    ],
    images: [
      {
        src: "/images/eryilmaz-apartmani/01.png",
        alt: "Eryılmaz Apartmanı gece görünümü",
      },
      {
        src: "/images/eryilmaz-apartmani/02.png",
        alt: "Eryılmaz Apartmanı ön cephe gece görünümü",
      },
      {
        src: "/images/eryilmaz-apartmani/03.png",
        alt: "Eryılmaz Apartmanı gündüz görünümü",
      },
    ],
  },

  {
    slug: "ozger-apartmani",
    title: "ÖZGER APARTMANI",
    titleLines: ["ÖZGER", "APARTMANI"],
    category: "Apartman",
    location: "Sancaktepe / İstanbul",
    year: "2026",
    services: ["Mimari Tasarım", "Cephe Tasarımı", "Görselleştirme"],
    cover: "/images/ozger-apartmani/cover.png",
    coverAlt: "Özger Apartmanı kapak görseli",
    description:
      "Özger Apartmanı, modern kent yaşamına uyum sağlayan işlevsel planlama kararları ile güçlü ve dengeli bir cephe karakterini bir araya getiren bir konut projesi olarak tasarlandı.",
    detailParagraphs: [
      "Yapının cephe kurgusunda yatay çizgiler, balkon boşlukları ve farklı yüzey derinlikleri kullanılarak dinamik ancak ölçülü bir mimari ifade oluşturuldu.",
      "Malzeme seçimleri, doğal ışık kullanımı ve yaşam alanlarının konforu birlikte değerlendirilerek çevresiyle uyumlu, çağdaş ve kalıcı bir yapı kimliği hedeflendi.",
    ],
    images: [
      {
        src: "/images/ozger-apartmani/01.png",
        alt: "Özger Apartmanı dış cephe görünümü",
      },
      {
        src: "/images/ozger-apartmani/02.png",
        alt: "Özger Apartmanı cephe tasarımı",
      },
    ],
  },

  {
    slug: "zeynep-hanim-2-apartmani",
    title: "ZEYNEP HANIM 2 APARTMANI",
    titleLines: ["ZEYNEP HANIM", "2 APARTMANI"],
    category: "Apartman",
    location: "Sancaktepe / İstanbul",
    year: "2025",
    services: ["Mimari Tasarım", "Cephe Tasarımı", "Görselleştirme"],
    cover: "/images/zeynep-hanim-2-apartmani/cover.png",
    coverAlt: "Zeynep Hanım 2 Apartmanı kapak görseli",
    description:
      "Zeynep Hanım 2 Apartmanı, çağdaş kent yaşamının ihtiyaçlarını sade, dengeli ve güçlü bir mimari kimlikle bir araya getiren bir konut projesi olarak tasarlandı.",
    detailParagraphs: [
      "Yapının cephe tasarımında yatay ve düşey mimari elemanlar dengeli bir kompozisyon içinde ele alındı. Malzeme geçişleri, balkon boşlukları ve cephe derinlikleri kullanılarak yapıya modern ve karakterli bir görünüm kazandırıldı.",
      "Projede işlevsel yaşam alanları, doğal ışık kullanımı ve kullanıcı konforu ön planda tutuldu. Yapının çevresiyle uyum kurması hedeflenirken kendine özgü mimari karakterini koruyan zamansız bir cephe yaklaşımı benimsendi.",
    ],
    images: [
      {
        src: "/images/zeynep-hanim-2-apartmani/01.png",
        alt: "Zeynep Hanım 2 Apartmanı dış cephe görünümü",
      },
      {
        src: "/images/zeynep-hanim-2-apartmani/02.png",
        alt: "Zeynep Hanım 2 Apartmanı cephe tasarımı",
      },
    ],
  },

  {
    slug: "zeynep-hanim-apartmani",
    title: "ZEYNEP HANIM APARTMANI",
    titleLines: ["ZEYNEP HANIM", "APARTMANI"],
    category: "Apartman",
    location: "Sancaktepe / İstanbul",
    year: "2023",
    services: ["Mimari Tasarım", "Cephe Tasarımı", "Görselleştirme"],
    cover: "/images/zeynep-hanim-apartmani/cover.png",
    coverAlt: "Zeynep Hanım Apartmanı kapak görseli",
    description:
      "Zeynep Hanım Apartmanı, kent yaşamının işlevsel gereksinimlerini çağdaş ve yalın bir cephe anlayışıyla bir araya getiren bir apartman projesidir.",
    detailParagraphs: [
      "Cephe kompozisyonunda balkonlar, pencere boşlukları ve malzeme geçişleri dengeli bir bütünlük içinde ele alındı. Yapının ölçülü mimari diliyle çevresine uyum sağlaması amaçlandı.",
      "Dairelerin doğal ışıktan verimli şekilde yararlanması, kullanışlı yaşam alanlarının oluşturulması ve cephede zamansız bir görünüm elde edilmesi tasarımın temel kararlarını oluşturdu.",
    ],
    images: [
      {
        src: "/images/zeynep-hanim-apartmani/01.png",
        alt: "Zeynep Hanım Apartmanı dış cephe görünümü",
      },
      {
        src: "/images/zeynep-hanim-apartmani/02.png",
        alt: "Zeynep Hanım Apartmanı cephe tasarımı",
      },
    ],
  },

  {
  slug: "barlas-antrepo-acik-calisma-alani",
  title: "BARLAS ANTREPO AÇIK ÇALIŞMA ALANI",
  titleLines: ["BARLAS ANTREPO", "AÇIK ÇALIŞMA ALANI"],
  category: "Ofis",
  location: "Sancaktepe / İstanbul",
  year: "2023",
  services: [
    "İç Mimarlık",
    "Ofis Tasarımı",
    "Uygulama Projesi",
  ],
  cover:
    "/images/barlas-antrepo-acik-calisma-alani/cover.jpg",
  coverAlt: "Barlas Antrepo Açık Çalışma Alanı kapak görseli",

  description:
    "Barlas Antrepo Açık Çalışma Alanı, ekipler arası iletişimi destekleyen, gün ışığından maksimum düzeyde yararlanan ve modern çalışma kültürüne uyum sağlayan çağdaş bir ofis projesi olarak tasarlandı.",

  detailParagraphs: [
    "Açık ofis kurgusunda çalışma alanları, toplantı noktaları ve ortak kullanım bölümleri bütüncül bir planlama anlayışıyla ele alındı. Mekânın ferahlığını artırmak amacıyla doğal ışık ön plana çıkarılırken sade renk paleti ve doğal ahşap yüzeyler modern bir atmosfer oluşturdu.",

    "Mobilya yerleşimi, aydınlatma tasarımı ve dolaşım aksları kullanıcı konforunu destekleyecek şekilde planlandı. İşlevsellik ile estetik yaklaşım dengelenerek uzun ömürlü, verimli ve çağdaş bir çalışma ortamı hedeflendi.",
  ],

  images: [
    {
      src: "/images/barlas-antrepo-acik-calisma-alani/01.jpg",
      alt: "Barlas Antrepo Açık Çalışma Alanı görünümü 01",
    },
    {
      src: "/images/barlas-antrepo-acik-calisma-alani/02.jpg",
      alt: "Barlas Antrepo Açık Çalışma Alanı görünümü 02",
    },
    {
      src: "/images/barlas-antrepo-acik-calisma-alani/03.jpg",
      alt: "Barlas Antrepo Açık Çalışma Alanı görünümü 03",
    },
    {
      src: "/images/barlas-antrepo-acik-calisma-alani/04.jpg",
      alt: "Barlas Antrepo Açık Çalışma Alanı görünümü 04",
    },
    {
      src: "/images/barlas-antrepo-acik-calisma-alani/05.jpg",
      alt: "Barlas Antrepo Açık Çalışma Alanı görünümü 05",
    },
    {
      src: "/images/barlas-antrepo-acik-calisma-alani/06.jpg",
      alt: "Barlas Antrepo Açık Çalışma Alanı görünümü 06",
    },
    {
      src: "/images/barlas-antrepo-acik-calisma-alani/07.jpg",
      alt: "Barlas Antrepo Açık Çalışma Alanı görünümü 07",
    },
  ],
},

  {
  slug: "barlas-antrepo-konsept-ofis-tasarimlari",
  title: "BARLAS ANTREPO KONSEPT OFİS TASARIMLARI",
  titleLines: [
    "BARLAS ANTREPO",
    "KONSEPT OFİS",
    "TASARIMLARI",
  ],
  category: "Ofis",
  location: "Sancaktepe / İstanbul",
  year: "2023",
  services: [
    "İç Mimarlık",
    "Konsept Tasarım",
    "3D Görselleştirme",
  ],
  cover:
    "/images/barlas-antrepo-konsept-ofis-tasarimlari/cover.jpg",
  coverAlt:
    "Barlas Antrepo Konsept Ofis Tasarımları kapak görseli",
  description:
    "Barlas Antrepo için geliştirilen konsept ofis tasarımları, modern çalışma kültürünü estetik, işlevsellik ve kurumsal kimlikle buluşturan çağdaş iç mimari çözümler sunmaktadır.",
  detailParagraphs: [
    "Projede yönetici ofisleri, karşılama alanları, toplantı odaları ve ortak çalışma mekânları bütüncül bir tasarım diliyle ele alındı. Doğal taş, ahşap ve metal detaylar bir araya getirilerek güçlü, zamansız ve prestijli bir çalışma atmosferi oluşturuldu.",

    "Aydınlatma tasarımı, malzeme seçimleri ve mekânsal organizasyon birlikte değerlendirilerek kullanıcı deneyimini ön plana çıkaran, estetik ve işlevselliği dengede tutan konsept ofis mekânları tasarlandı.",
  ],
  images: [
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/01.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 01",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/02.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 02",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/03.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 03",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/04.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 04",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/05.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 05",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/06.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 06",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/07.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 07",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/08.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 08",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/09.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 09",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/010.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 10",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/011.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 11",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/012.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 12",
    },
    {
      src: "/images/barlas-antrepo-konsept-ofis-tasarimlari/013.jpg",
      alt: "Barlas Antrepo Konsept Ofis Tasarımı 13",
    },
  ],
}
];



export const projectEnglishSlugs: Record<string, string> = {
  "vespera-port": "vespera-port",
  "eryilmaz-apartmani": "eryilmaz-apartment",
  "ozger-apartmani": "ozger-apartment",
  "zeynep-hanim-2-apartmani": "zeynep-hanim-2-apartment",
  "zeynep-hanim-apartmani": "zeynep-hanim-apartment",
  "barlas-antrepo-acik-calisma-alani": "barlas-warehouse-open-workspace",
  "barlas-antrepo-konsept-ofis-tasarimlari": "barlas-warehouse-concept-office-designs",
};

export function getProjectSlug(project: Project, locale: string) {
  return locale === "en" ? (projectEnglishSlugs[project.slug] ?? project.slug) : project.slug;
}

export function getTurkishSlug(slug: string) {
  return Object.entries(projectEnglishSlugs).find(([, englishSlug]) => englishSlug === slug)?.[0] ?? slug;
}

const projectEnglish: Record<string, Partial<Project>> = {
  "vespera-port": {
    category: "Commercial",
    services: ["Architectural Design", "3D Visualization"],
    coverAlt: "VESPERA PORT project cover",
    description: "VESPERA PORT was designed as a commercial project with a strong facade identity, combining contemporary architecture with the functional needs of modern business life.",
    detailParagraphs: [
      "The building's relationship with its urban context was developed through transparent surfaces, horizontal lines and balanced facade proportions. Functional planning and a distinctive exterior expression were considered as a unified design approach.",
      "Material choices, facade depth and changing light conditions throughout the day were carefully coordinated to give the building a memorable character both by day and by night."
    ],
    images: [
      {src: "/images/vespera-port/01.png", alt: "VESPERA PORT daytime exterior"},
      {src: "/images/vespera-port/02.png", alt: "VESPERA PORT night exterior"},
      {src: "/images/vespera-port/03.png", alt: "VESPERA PORT front facade"},
      {src: "/images/vespera-port/04.png", alt: "VESPERA PORT perspective view"},
      {src: "/images/vespera-port/05.png", alt: "VESPERA PORT facade design", contain: true}
    ]
  },
  "eryilmaz-apartmani": {
    title: "ERYILMAZ APARTMENT", titleLines: ["ERYILMAZ", "APARTMENT"], category: "Residential", location: "Sancaktepe / Istanbul",
    services: ["Architectural Design", "Facade Design", "3D Visualization"], coverAlt: "Eryilmaz Apartment daytime exterior",
    description: "Eryilmaz Apartment was conceived as a boutique residential project that brings aesthetics and functionality together through a contemporary architectural approach.",
    detailParagraphs: ["Modern lines, natural material textures and a balanced mass composition define the facade. Balcony voids, surface depth and material transitions give the building a strong contemporary identity.", "Generous living spaces, natural daylight and user comfort shaped the key design decisions. The aim was to create a timeless residential building that responds to its surroundings while retaining a distinctive character."],
    images: [{src:"/images/eryilmaz-apartmani/01.png",alt:"Eryilmaz Apartment night view"},{src:"/images/eryilmaz-apartmani/02.png",alt:"Eryilmaz Apartment front facade at night"},{src:"/images/eryilmaz-apartmani/03.png",alt:"Eryilmaz Apartment daytime view"}]
  },
  "ozger-apartmani": {
    title:"OZGER APARTMENT", titleLines:["OZGER","APARTMENT"], category:"Residential", location:"Sancaktepe / Istanbul", services:["Architectural Design","Facade Design","3D Visualization"], coverAlt:"Ozger Apartment project cover",
    description:"Ozger Apartment combines functional planning for contemporary urban life with a strong and balanced facade character.",
    detailParagraphs:["Horizontal lines, balcony voids and varied surface depths create a dynamic yet measured architectural expression.","Material choices, daylight and residential comfort were considered together to establish a contemporary, enduring identity that fits naturally into its context."],
    images:[{src:"/images/ozger-apartmani/01.png",alt:"Ozger Apartment exterior"},{src:"/images/ozger-apartmani/02.png",alt:"Ozger Apartment facade design"}]
  },
  "zeynep-hanim-2-apartmani": {
    title:"ZEYNEP HANIM 2 APARTMENT", titleLines:["ZEYNEP HANIM","2 APARTMENT"], category:"Residential", location:"Sancaktepe / Istanbul", services:["Architectural Design","Facade Design","3D Visualization"], coverAlt:"Zeynep Hanim 2 Apartment project cover",
    description:"Zeynep Hanim 2 Apartment brings the needs of contemporary urban living together with a simple, balanced and confident architectural identity.",
    detailParagraphs:["Horizontal and vertical facade elements were composed in careful balance. Material transitions, balcony voids and facade depth give the building a modern and distinctive appearance.","Functional living spaces, daylight and user comfort were prioritised, while a timeless facade language allows the building to relate to its surroundings without losing its own identity."],
    images:[{src:"/images/zeynep-hanim-2-apartmani/01.png",alt:"Zeynep Hanim 2 Apartment exterior"},{src:"/images/zeynep-hanim-2-apartmani/02.png",alt:"Zeynep Hanim 2 Apartment facade design"}]
  },
  "zeynep-hanim-apartmani": {
    title:"ZEYNEP HANIM APARTMENT", titleLines:["ZEYNEP HANIM","APARTMENT"], category:"Residential", location:"Sancaktepe / Istanbul", services:["Architectural Design","Facade Design","3D Visualization"], coverAlt:"Zeynep Hanim Apartment project cover",
    description:"Zeynep Hanim Apartment combines the functional requirements of urban living with a contemporary and restrained facade approach.",
    detailParagraphs:["Balconies, window openings and material transitions were organised as a balanced composition, allowing the building's measured architectural language to sit comfortably within its surroundings.","Efficient daylight, practical living spaces and a timeless exterior expression formed the central design decisions."],
    images:[{src:"/images/zeynep-hanim-apartmani/01.png",alt:"Zeynep Hanim Apartment exterior"},{src:"/images/zeynep-hanim-apartmani/02.png",alt:"Zeynep Hanim Apartment facade design"}]
  },
  "barlas-antrepo-acik-calisma-alani": {
    title:"BARLAS WAREHOUSE OPEN WORKSPACE", titleLines:["BARLAS WAREHOUSE","OPEN WORKSPACE"], category:"Office", location:"Sancaktepe / Istanbul", services:["Interior Architecture","Office Design","Construction Documentation"], coverAlt:"Barlas Warehouse Open Workspace project cover",
    description:"The Barlas Warehouse Open Workspace was designed as a contemporary office that supports communication between teams, maximises daylight and responds to modern working culture.",
    detailParagraphs:["Workstations, meeting points and shared spaces were planned as an integrated open-office environment. Natural daylight, a restrained colour palette and timber surfaces create a bright and modern atmosphere.","Furniture layout, lighting and circulation were developed around user comfort. Function and aesthetics were balanced to create an efficient, durable and contemporary workplace."],
    images: Array.from({length:7},(_,i)=>({src:`/images/barlas-antrepo-acik-calisma-alani/0${i+1}.jpg`,alt:`Barlas Warehouse Open Workspace view ${String(i+1).padStart(2,"0")}`}))
  },
  "barlas-antrepo-konsept-ofis-tasarimlari": {
    title:"BARLAS WAREHOUSE CONCEPT OFFICE DESIGNS", titleLines:["BARLAS WAREHOUSE","CONCEPT OFFICE","DESIGNS"], category:"Office", location:"Sancaktepe / Istanbul", services:["Interior Architecture","Concept Design","3D Visualization"], coverAlt:"Barlas Warehouse Concept Office Designs project cover",
    description:"The concept office designs developed for Barlas Warehouse offer contemporary interior solutions that unite modern working culture with aesthetics, functionality and corporate identity.",
    detailParagraphs:["Executive offices, reception areas, meeting rooms and shared workspaces were developed through a consistent design language. Natural stone, timber and metal details create a strong, timeless and prestigious atmosphere.","Lighting, furniture and material choices were coordinated to support both visual continuity and day-to-day use, resulting in flexible, comfortable and representative office environments."],
    images: Array.from({length:13},(_,i)=>{const n=i+1; const file=n<10?`0${n}.jpg`:`0${n}.jpg`; return {src:`/images/barlas-antrepo-konsept-ofis-tasarimlari/${file}`,alt:`Barlas Warehouse Concept Office Design ${String(n).padStart(2,"0")}`}})
  }
};

export function localizeProject(project: Project, locale: string): Project {
  return locale === "en" ? {...project, ...projectEnglish[project.slug], slug: getProjectSlug(project, locale)} : project;
}

export function getLocalizedProjects(locale: string): Project[] {
  return projects.map((project) => localizeProject(project, locale));
}

export function getProjectBySlug(slug: string) {
  const turkishSlug = getTurkishSlug(slug);
  return projects.find((project) => project.slug === turkishSlug);
}