import { createSupabaseServerClient } from "@/lib/supabase/server";

const fallbackArticles = [
  { slug: "berita-hari-ini-lebih-dekat", title: "Berita hari ini, disajikan lebih dekat dengan apa yang penting.", excerpt: "Ringkasan berita pilihan dari berbagai penjuru Indonesia.", category: "Nasional" },
  { slug: "ekosistem-digital-indonesia-terus-tumbuh", title: "Ekosistem digital Indonesia terus tumbuh, talenta lokal jadi kunci", excerpt: "Talenta lokal menjadi fondasi penting bagi pertumbuhan ekosistem digital Indonesia.", category: "Teknologi" },
  { slug: "umkm-mengandalkan-kanal-digital", title: "Pelaku UMKM mulai mengandalkan kanal digital untuk memperluas pasar", excerpt: "Kanal digital membantu pelaku UMKM menjangkau pelanggan baru.", category: "Ekonomi" },
  { slug: "kota-kecil-ruang-publik-ramah-warga", title: "Kota-kota kecil menyiapkan ruang publik yang lebih ramah warga", excerpt: "Ruang publik yang nyaman kembali menjadi perhatian di berbagai kota kecil.", category: "Daerah" },
];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: rawQuery } = await searchParams;
  const query = (rawQuery ?? "").trim();
  let results = query ? fallbackArticles.filter((article) => `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(query.toLowerCase())) : [];

  if (query) {
    try {
      const safeQuery = query.replace(/[%_,]/g, " ");
      const supabase = await createSupabaseServerClient();
      const { data } = await supabase.from("articles").select("slug, title, excerpt, categories(name)").eq("status", "published").or(`title.ilike.%${safeQuery}%,excerpt.ilike.%${safeQuery}%`).order("published_at", { ascending: false });
      if (data?.length) {
        results = data.map((article) => {
          const relation = article.categories as { name?: string } | { name?: string }[] | null;
          return { slug: article.slug, title: article.title, excerpt: article.excerpt, category: (Array.isArray(relation) ? relation[0]?.name : relation?.name) ?? "Berita" };
        });
      }
    } catch {
      // Keep local sample results visible if Supabase is temporarily unavailable.
    }
  }

  return (
    <main className="site-shell search-shell">
      <header className="topbar"><a className="brand" href="/" aria-label="Kembali ke Menit.com"><span className="brand-mark">M</span><span>menit<span className="brand-dot">.</span>com</span></a><a className="back-link" href="/">← Kembali ke beranda</a></header>
      <section className="search-page">
        <span className="section-label">JELAJAHI ARSIP</span>
        <h1>Cari berita</h1>
        <form className="search-form" action="/cari"><input name="q" defaultValue={query} placeholder="Cari topik, judul, atau kategori" aria-label="Kata kunci pencarian" /><button type="submit">Cari ↗</button></form>
        {query ? <p className="search-summary">{results.length} hasil untuk “{query}”</p> : <p className="search-summary">Ketik kata kunci untuk menemukan berita yang kamu cari.</p>}
        <div className="search-results">{results.map((article) => <a className="search-result" href={`/berita/${article.slug}`} key={article.slug}><span className="news-category">{article.category}</span><h2>{article.title}</h2><p>{article.excerpt}</p><span className="result-arrow">Baca selengkapnya ↗</span></a>)}</div>
        {query && !results.length && <div className="empty-search"><strong>Belum ada berita yang cocok.</strong><span>Coba kata kunci lain seperti teknologi, UMKM, atau daerah.</span></div>}
      </section>
    </main>
  );
}
