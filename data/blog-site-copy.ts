const values: Record<string, string[]> = {
  tr: ["Blog", "Güncel", "Blog", "Mimarlık, tasarım ve yapılı çevre üzerine düşünceler.", "Devamını oku", "Henüz yayımlanmış yazı bulunmuyor.", "Bloga dön", "İlgili yazılar", "Yayın tarihi", "Kategori", "Etiketler"],
  en: ["Blog", "Journal", "Blog", "Thoughts on architecture, design and the built environment.", "Read more", "No published posts yet.", "Back to blog", "Related posts", "Published", "Category", "Tags"],
  de: ["Blog", "Journal", "Blog", "Gedanken zu Architektur, Design und gebauter Umwelt.", "Weiterlesen", "Noch keine Beiträge veröffentlicht.", "Zurück zum Blog", "Ähnliche Beiträge", "Veröffentlicht", "Kategorie", "Schlagwörter"],
  fr: ["Blog", "Journal", "Blog", "Réflexions sur l’architecture, le design et l’environnement bâti.", "Lire la suite", "Aucun article publié.", "Retour au blog", "Articles associés", "Publié le", "Catégorie", "Étiquettes"],
  es: ["Blog", "Diario", "Blog", "Reflexiones sobre arquitectura, diseño y entorno construido.", "Seguir leyendo", "Aún no hay artículos publicados.", "Volver al blog", "Artículos relacionados", "Publicado", "Categoría", "Etiquetas"],
  nl: ["Blog", "Journal", "Blog", "Gedachten over architectuur, ontwerp en de gebouwde omgeving.", "Lees verder", "Nog geen berichten gepubliceerd.", "Terug naar blog", "Gerelateerde artikelen", "Gepubliceerd", "Categorie", "Tags"],
  ja: ["ブログ", "ジャーナル", "ブログ", "建築、デザイン、都市環境についての考察。", "続きを読む", "公開中の記事はありません。", "ブログへ戻る", "関連記事", "公開日", "カテゴリー", "タグ"],
  zh: ["博客", "期刊", "博客", "关于建筑、设计与建成环境的思考。", "继续阅读", "暂无已发布文章。", "返回博客", "相关文章", "发布日期", "分类", "标签"],
  ko: ["블로그", "저널", "블로그", "건축, 디자인과 건조 환경에 대한 생각.", "더 읽기", "게시된 글이 없습니다.", "블로그로 돌아가기", "관련 글", "게시일", "카테고리", "태그"],
  ar: ["المدونة", "المجلة", "المدونة", "أفكار حول العمارة والتصميم والبيئة المبنية.", "متابعة القراءة", "لا توجد مقالات منشورة بعد.", "العودة إلى المدونة", "مقالات ذات صلة", "تاريخ النشر", "الفئة", "الوسوم"],
};

const keys = [
  "nav.blog",
  "blog.eyebrow",
  "blog.title",
  "blog.intro",
  "blog.readMore",
  "blog.empty",
  "blog.backToBlog",
  "blog.related",
  "blog.publishedAt",
  "blog.category",
  "blog.tags",
] as const;

export const blogSiteCopy = Object.fromEntries(
  Object.entries(values).map(([locale, translations]) => [
    locale,
    {
      ...Object.fromEntries(keys.map((key, index) => [key, translations[index]])),
      "Navbar.items.blog": translations[0],
      "Footer.links.blog": translations[0],
    },
  ]),
) as Record<string, Record<string, string>>;
