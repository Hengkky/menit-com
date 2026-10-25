import { createSupabaseServerClient } from "@/lib/supabase/server";

const fallbackCategories = ["Nasional", "Daerah", "Politik", "Ekonomi", "Teknologi", "Olahraga", "Hiburan"];
const fallbackNews = [
  { slug: "ekosistem-digital-indonesia-terus-tumbuh", category: "Teknologi", title: "Ekosistem digital Indonesia terus tumbuh, talenta lokal jadi kunci", time: "12 menit lalu", tone: "cyan" },
  { slug: "umkm-mengandalkan-kanal-digital", category: "Ekonomi", title: "Pelaku UMKM mulai mengandalkan kanal digital untuk memperluas pasar", time: "28 menit lalu", tone: "amber" },
  { slug: "kota-kecil-ruang-publik-ramah-warga", category: "Daerah", title: "Kota-kota kecil menyiapkan ruang publik yang lebih ramah warga", time: "41 menit lalu", tone: "violet" },
];

function relativeTime(value?: string | null) {
  if (!value) return "Baru saja";
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  return minutes < 60 ? `${minutes} menit lalu` : `${Math.floor(minutes / 60)} jam lalu`;
}

export default async function HomePage() {
  let categories = fallbackCategories;
  let latestNews = fallbackNews;
  let hero = {
    slug: "berita-hari-ini-lebih-dekat",
    category: "Nasional",
    title: "Berita hari ini, disajikan lebih dekat dengan apa yang penting.",
    excerpt: "Ringkasan berita pilihan dari berbagai penjuru Indonesia, dibuat untuk menemani langkahmu sepanjang hari.",
    time: "8 menit lalu",
  };

  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: categoryRows }, { data: articleRows }] = await Promise.all([
      supabase.from("categories").select("name").eq("is_active", true).order("name"),
      supabase.from("articles").select("slug, title, excerpt, published_at, categories(name)").eq("status", "published").order("published_at", { ascending: false }).limit(8),
    ]);

    if (categoryRows?.length) categories = categoryRows.map((row) => row.name);
    if (articleRows?.length) {
      const articles = articleRows.map((row, index) => {
        const categoryRelation = row.categories as { name?: string } | { name?: string }[] | null;
        return {
        slug: row.slug,
        category: (Array.isArray(categoryRelation) ? categoryRelation[0]?.name : categoryRelation?.name) ?? "Berita",
        title: row.title,
        excerpt: row.excerpt,
        time: relativeTime(row.published_at),
        tone: ["cyan", "amber", "violet", "rose"][index % 4],
        };
      });
      hero = articles[0];
      latestNews = articles.slice(1, 4).map(({ excerpt: _excerpt, ...article }) => article);
    }
  } catch {
    // Keep the editorial fallback visible if Supabase is temporarily unavailable.
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Menit.com home"><span className="brand-mark">M</span><span>menit<span className="brand-dot">.</span>com</span></a>
        <nav className="main-nav" aria-label="Navigasi utama"><a className="active" href="#terbaru">Terbaru</a><a href="#kategori">Kategori</a><a href="#terpopuler">Terpopuler</a></nav>
        <a className="search-button" aria-label="Cari berita" href="/cari">⌕ <span>Cari berita</span></a>
      </header>
      <div className="ticker" id="top"><span className="ticker-label">BREAKING</span><span>Menit.com hadir membawa berita yang ringkas, jernih, dan relevan.</span><span className="ticker-arrow">→</span></div>

      <section className="hero-grid">
        <article className="hero-story"><div className="story-visual hero-visual"><span>Fokus Utama</span></div><div className="story-copy"><div className="eyebrow"><span className="live-dot" /> {hero.category} <span>•</span> {hero.time}</div><h1>{hero.title}</h1><p>{hero.excerpt}</p><a className="read-link" href={`/berita/${hero.slug}`}>Baca berita utama <span>↗</span></a></div></article>
        <aside className="editor-note"><span className="note-kicker">CATATAN REDAKSI</span><p>“Jurnalisme yang baik membantu kita melihat lebih jelas, bukan sekadar lebih banyak.”</p><div className="note-author"><span className="avatar">R</span><span><strong>Redaksi Menit</strong><small>Setiap hari, sejak pagi</small></span></div></aside>
      </section>

      <section className="section-block" id="kategori"><div className="section-heading"><div><span className="section-label">JELAJAHI</span><h2>Kategori berita</h2></div><a href="#semua">Lihat semua <span>→</span></a></div><div className="category-row">{categories.map((category, index) => <a href={`#${category.toLowerCase()}`} className={`category-pill pill-${index % 4}`} key={category}>{category}<span>↗</span></a>)}</div></section>

      <section className="content-grid" id="terbaru"><div className="latest-column"><div className="section-heading compact"><div><span className="section-label">UPDATE TERKINI</span><h2>Berita terbaru</h2></div><span className="updated">Diperbarui beberapa detik lalu</span></div><div className="news-list">{latestNews.map((news) => <article className="news-card" key={news.title}><div className={`story-visual small-visual ${news.tone}`}><span>{news.category}</span></div><div className="news-copy"><span className="news-category">{news.category}</span><h3>{news.title}</h3><p>{news.time} <span>•</span> 3 min read</p></div><a className="card-arrow" href={`/berita/${news.slug}`} aria-label={`Baca ${news.title}`}>↗</a></article>)}</div></div><aside className="trending-column" id="terpopuler"><div className="section-heading compact"><div><span className="section-label">PALING DIBACA</span><h2>Trending</h2></div></div><ol className="trending-list"><li><span className="trend-number">01</span><div><h3>Kenapa berita lokal semakin penting untuk masa depan kota?</h3><small>1.2k pembaca</small></div></li><li><span className="trend-number">02</span><div><h3>Lima hal yang berubah dari cara kita bekerja tahun ini</h3><small>986 pembaca</small></div></li><li><span className="trend-number">03</span><div><h3>Ruang hijau dan kualitas hidup: apa kata warga?</h3><small>754 pembaca</small></div></li></ol></aside></section>
      <footer className="footer"><div className="brand footer-brand"><span className="brand-mark">M</span><span>menit<span className="brand-dot">.</span>com</span></div><p>Berita yang dekat dengan hidupmu.</p><span className="footer-meta">© 2026 Menit.com</span></footer>
    </main>
  );
}
