import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Relation = { name?: string; display_name?: string } | { name?: string; display_name?: string }[] | null;
const fallbackArticles: Record<string, { title: string; excerpt: string; content: string; category: string }> = {
  "ekosistem-digital-indonesia-terus-tumbuh": { title: "Ekosistem digital Indonesia terus tumbuh, talenta lokal jadi kunci", excerpt: "Talenta lokal menjadi fondasi penting bagi pertumbuhan ekosistem digital Indonesia.", content: "Pertumbuhan ekosistem digital membuka ruang baru bagi talenta lokal dan pelaku usaha.", category: "Teknologi" },
  "umkm-mengandalkan-kanal-digital": { title: "Pelaku UMKM mulai mengandalkan kanal digital untuk memperluas pasar", excerpt: "Kanal digital membantu pelaku UMKM menjangkau pelanggan baru dengan cara yang lebih efisien.", content: "Digitalisasi membuat pelaku UMKM dapat mengelola pemasaran dan layanan pelanggan dengan lebih dekat.", category: "Ekonomi" },
  "kota-kecil-ruang-publik-ramah-warga": { title: "Kota-kota kecil menyiapkan ruang publik yang lebih ramah warga", excerpt: "Ruang publik yang nyaman kembali menjadi perhatian di berbagai kota kecil.", content: "Sejumlah kota mulai menata ruang publik agar lebih inklusif dan mudah digunakan warga.", category: "Daerah" },
  "berita-hari-ini-lebih-dekat": { title: "Berita hari ini, disajikan lebih dekat dengan apa yang penting.", excerpt: "Ringkasan berita pilihan dari berbagai penjuru Indonesia, dibuat untuk menemani langkahmu sepanjang hari.", content: "Menit.com merangkum kabar penting dengan bahasa yang ringkas, jernih, dan relevan.", category: "Nasional" },
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, content, published_at, categories(name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  const fallbackArticle = fallbackArticles[slug];
  if (!article && !fallbackArticle) notFound();

  const category = article?.categories as Relation;
  const categoryName = (Array.isArray(category) ? category[0]?.name : category?.name) ?? fallbackArticle?.category ?? "Berita";
  const title = article?.title ?? fallbackArticle?.title ?? "Berita Menit.com";
  const excerpt = article?.excerpt ?? fallbackArticle?.excerpt ?? "";
  const content = article?.content ?? fallbackArticle?.content ?? "";
  const published = article?.published_at
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(article.published_at))
    : "Baru saja";

  return (
    <main className="site-shell article-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Kembali ke Menit.com"><span className="brand-mark">M</span><span>menit<span className="brand-dot">.</span>com</span></a>
        <a className="back-link" href="/">← Kembali ke beranda</a>
      </header>
      <article className="article-page">
        <div className="article-kicker">{categoryName} <span>•</span> {published}</div>
        <h1>{title}</h1>
        <p className="article-lead">{excerpt}</p>
        <div className="article-meta"><span className="avatar">R</span><span><strong>Redaksi Menit</strong><small>Tim editorial Menit.com</small></span></div>
        <div className="article-visual"><span>Menit.com</span></div>
        <div className="article-content">
          {content.split(/\n{2,}/).map((paragraph: string, index: number) => <p key={index}>{paragraph}</p>)}
        </div>
      </article>
    </main>
  );
}
