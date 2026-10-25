insert into public.categories (name, slug, description)
values
  ('Nasional', 'nasional', 'Berita nasional terbaru dan terpercaya.'),
  ('Daerah', 'daerah', 'Cerita dan kabar dari berbagai daerah Indonesia.'),
  ('Politik', 'politik', 'Kabar politik yang jernih dan berimbang.'),
  ('Ekonomi', 'ekonomi', 'Ekonomi, bisnis, dan peluang usaha.'),
  ('Teknologi', 'teknologi', 'Teknologi yang dekat dengan kehidupan sehari-hari.'),
  ('Olahraga', 'olahraga', 'Berita olahraga dan kisah para atlet.'),
  ('Hiburan', 'hiburan', 'Film, musik, budaya, dan hiburan pilihan.')
on conflict (slug) do update set name = excluded.name, description = excluded.description, is_active = true;

do $$
declare author_id uuid; nasional_id uuid; teknologi_id uuid; ekonomi_id uuid; daerah_id uuid;
begin
  select id into author_id from public.profiles order by created_at limit 1;
  if author_id is null then raise notice 'Categories seeded. Articles skipped because no profile exists yet.'; return; end if;
  select id into nasional_id from public.categories where slug = 'nasional';
  select id into teknologi_id from public.categories where slug = 'teknologi';
  select id into ekonomi_id from public.categories where slug = 'ekonomi';
  select id into daerah_id from public.categories where slug = 'daerah';
  insert into public.articles (title, slug, excerpt, content, category_id, author_id, status, published_at)
  values
    ('Berita hari ini, disajikan lebih dekat dengan apa yang penting.', 'berita-hari-ini-lebih-dekat', 'Ringkasan berita pilihan dari berbagai penjuru Indonesia, dibuat untuk menemani langkahmu sepanjang hari.', 'Menit.com merangkum kabar penting dengan bahasa yang ringkas, jernih, dan relevan.', nasional_id, author_id, 'published', now() - interval '8 minutes'),
    ('Ekosistem digital Indonesia terus tumbuh, talenta lokal jadi kunci', 'ekosistem-digital-indonesia-terus-tumbuh', 'Talenta lokal menjadi fondasi penting bagi pertumbuhan ekosistem digital Indonesia.', 'Pertumbuhan ekosistem digital membuka ruang baru bagi talenta lokal dan pelaku usaha.', teknologi_id, author_id, 'published', now() - interval '12 minutes'),
    ('Pelaku UMKM mulai mengandalkan kanal digital untuk memperluas pasar', 'umkm-mengandalkan-kanal-digital', 'Kanal digital membantu pelaku UMKM menjangkau pelanggan baru dengan cara yang lebih efisien.', 'Digitalisasi membuat pelaku UMKM dapat mengelola pemasaran dan layanan pelanggan dengan lebih dekat.', ekonomi_id, author_id, 'published', now() - interval '28 minutes'),
    ('Kota-kota kecil menyiapkan ruang publik yang lebih ramah warga', 'kota-kecil-ruang-publik-ramah-warga', 'Ruang publik yang nyaman kembali menjadi perhatian di berbagai kota kecil.', 'Sejumlah kota mulai menata ruang publik agar lebih inklusif dan mudah digunakan warga.', daerah_id, author_id, 'published', now() - interval '41 minutes')
  on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, content = excluded.content, category_id = excluded.category_id, status = excluded.status, published_at = excluded.published_at;
end $$;
