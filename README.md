# Menit.com

## Ringkasan Perencanaan

Menit.com direncanakan sebagai portal berita umum yang menyajikan berbagai jenis berita dengan sistem kategori. Target awalnya adalah website responsif dan aplikasi Android yang nantinya dapat dipublikasikan di Google Play Store.

## Referensi Produk

Konsep awal mengambil inspirasi dari portal berita seperti detik.com, tetapi versi pertama dibuat lebih sederhana agar cepat digunakan dan dikembangkan bertahap.

## Teknologi yang Direncanakan

```text
Next.js       -> website publik dan CMS admin
Supabase      -> database, autentikasi, dan penyimpanan gambar
Expo           -> aplikasi Android
Google Play    -> distribusi aplikasi
```

Next.js cocok untuk website berita karena mendukung halaman yang cepat dan SEO. Untuk aplikasi Android, React Native dengan Expo lebih fleksibel daripada membungkus website secara langsung.

## Fitur MVP Tahap Awal

1. Beranda berita terbaru.
2. Kategori berita.
3. Halaman detail berita.
4. Pencarian berita.
5. CMS/admin dashboard.
6. Login admin dan penulis.
7. Upload gambar berita.
8. Status berita: draft, review, published, dan archived.
9. Website mobile-friendly.
10. Aplikasi Android yang mengambil data dari backend yang sama.

## Kategori Awal

- Nasional
- Daerah
- Politik
- Ekonomi
- Teknologi
- Olahraga
- Hiburan
- Lifestyle

Kategori harus dapat ditambah melalui CMS tanpa mengubah kode aplikasi.

## Sistem Role

### Super Admin

Mengatur seluruh sistem, pengguna, kategori, dan hak akses.

### Editor

Memeriksa, mengedit, dan menerbitkan berita.

### Penulis/Reporter

Membuat dan mengedit berita miliknya.

### Admin Media

Mengelola gambar dan media pendukung berita.

### Pembaca

Membaca berita dan menggunakan fitur pencarian.

## Alur Berita

```text
Draft -> Review Editor -> Published -> Archived
```

## Rancangan Database Awal

### `profiles`

Menyimpan data pengguna dan role.

### `categories`

Menyimpan nama, slug, deskripsi, serta status kategori.

### `articles`

Menyimpan judul, slug, isi, ringkasan, thumbnail, kategori, penulis, status, dan waktu publikasi.

### `article_media`

Menyimpan gambar atau media tambahan yang terhubung dengan artikel.

## Aturan Keamanan

- Pembaca hanya melihat artikel dengan status `published`.
- Penulis dapat membuat dan mengubah draft miliknya.
- Editor dapat melakukan review dan publikasi.
- Super admin dapat mengatur seluruh data.
- Hak akses menggunakan Row Level Security Supabase.
- Secret backend tidak boleh dimasukkan ke aplikasi Android.

## Langkah Berikutnya

1. Audit project dan dependency yang sudah ada.
2. Pastikan versi Next.js dan React.
3. Pastikan Supabase sudah terpasang atau siapkan dependency-nya.
4. Pastikan konfigurasi environment aman.
5. Buat migration database Supabase.
6. Bangun CMS admin.
7. Bangun halaman publik berita.
8. Buat aplikasi Android dengan Expo.
9. Uji di perangkat Android.
10. Siapkan build `.aab` dan publikasi ke Play Store.

## Catatan Nama

Nama kerja aplikasi adalah **Menit.com**. Sebelum dipublikasikan, perlu dilakukan pengecekan ketersediaan domain, merek, dan potensi kemiripan dengan portal berita lain.
