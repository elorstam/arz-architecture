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
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}