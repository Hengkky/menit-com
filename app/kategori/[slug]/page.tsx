import { createSupabaseServerClient } from "@/lib/supabase/server";

const fallbackArticles = [
  { slug: "berita-hari-ini-lebih-dekat", title: "Berita hari ini, disajikan lebih dekat dengan apa yang penting.", excerpt: "Ringkasan berita pilihan dari berbagai penjuru Indonesia, dibuat untuk menemani langkahmu sepanjang hari.", category: "Nasional", published_at: "2026-10-26T10:00:00.000Z", tone: "green" },
  { slug: "ekosistem-digital-indonesia-terus-tumbuh", title: "Ekosistem digital Indonesia terus tumbuh, talenta lokal jadi kunci", excerpt: "Talenta lokal menjadi fondasi penting bagi pertumbuhan ekosistem digital Indonesia.", category: "Teknologi", published_at: "2026-10-26T09:56:00.000Z", tone: "cyan" },
  { slug: "umkm-mengandalkan-kanal-digital", title: "Pelaku UMKM mulai mengandalkan kanal digital untuk memperluas pasar", excerpt: "Kanal digital membantu pelaku UMKM menjangkau pelanggan baru dengan cara yang lebih efisien.", category: "Ekonomi", published_at: "2026-10-26T09:40:00.000Z", tone: "amber" },
  { slug: "kota-kecil-ruang-publik-ramah-warga", title: "Kota-kota kecil menyiapkan ruang publik yang lebih ramah warga", excerpt: "Ruang publik yang nyaman kembali menjadi perhatian di berbagai kota kecil.", category: "Daerah", published_at: "2026-10-26T09:27:00.000Z", tone: "violet" },
];
const categoryDescriptions: Record<string, string> = { nasional: "Berita nasional terbaru dan terpercaya.", daerah: "Cerita dan kabar dari berbagai daerah Indonesia.", politik: "Kabar politik yang jernih dan berimbang.", ekonomi: "Ekonomi, bisnis, dan peluang usaha.", teknologi: "Teknologi yang dekat dengan kehidupan sehari-hari.", olahraga: "Berita olahraga dan kisah para atlet.", hiburan: "Film, musik, budaya, dan hiburan pilihan." };
function relativeTime(value: string) { const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000)); return minutes < 60 ? `${minutes} menit lalu` : `${Math.floor(minutes / 60)} jam lalu`; }

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallbackName = slug.charAt(0).toUpperCase() + slug.slice(1);
  let category = { name: fallbackName, description: categoryDescriptions[slug] ?? "Berita pilihan dari Menit.com." };
  let articles = fallbackArticles.filter((article) => article.category.toLowerCase() === slug);
  try {
    const supabase = await createSupabaseServerClient();
    const { data: categoryRow } = await supabase.from("categories").select("id, name, description").eq("slug", slug).eq("is_active", true).maybeSingle();
    if (categoryRow) {
      category = { name: categoryRow.name, description: categoryRow.description ?? category.description };
      const { data: articleRows } = await supabase.from("articles").select("slug, title, excerpt, published_at").eq("category_id", categoryRow.id).eq("status", "published").order("published_at", { ascending: false });
      if (articleRows) articles = articleRows.map((article, index) => ({ ...article, category: category.name, tone: ["green", "cyan", "amber", "violet"][index % 4] }));
    }
  } catch { /* Keep the category page useful while Supabase is unavailable. */ }

  return <main className="site-shell category-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="Menit.com home"><span className="brand-mark">M</span><span>menit<span className="brand-dot">.</span>com</span></a><nav className="main-nav" aria-label="Navigasi utama"><a href="/#terbaru">Terbaru</a><a className="active" href="/#kategori">Kategori</a><a href="/#terpopuler">Terpopuler</a></nav><a className="search-button" aria-label="Cari berita" href="/cari">⌕ <span>Cari berita</span></a></header>
    <section className="category-hero"><a className="back-link" href="/#kategori">← Semua kategori</a><span className="section-label">KATEGORI BERITA</span><h1>{category.name}</h1><p>{category.description}</p></section>
    <section className="category-results"><div className="section-heading compact"><div><span className="section-label">UPDATE TERKINI</span><h2>Berita {category.name}</h2></div><span className="updated">{articles.length} artikel</span></div>{articles.length ? <div className="news-list">{articles.map((article) => <article className="news-card" key={article.slug}><div className={`story-visual small-visual ${article.tone}`}><span>{category.name}</span></div><div className="news-copy"><span className="news-category">{category.name}</span><h3>{article.title}</h3><p>{relativeTime(article.published_at)} <span>•</span> 3 min read</p><p className="category-excerpt">{article.excerpt}</p></div><a className="card-arrow" href={`/berita/${article.slug}`} aria-label={`Baca ${article.title}`}>↗</a></article>)}</div> : <div className="empty-category"><strong>Belum ada berita di kategori ini.</strong><span>Konten baru akan muncul di sini saat redaksi menerbitkannya.</span></div>}</section>
  </main>;
}
