# 3. Arsitektur Aplikasi

## Komponen

```text
Website publik + CMS admin  -> Next.js
Database + autentikasi       -> Supabase
Penyimpanan gambar           -> Supabase Storage
Aplikasi Android             -> Expo / React Native
Hosting website              -> Platform hosting Next.js
Distribusi Android           -> Google Play Store
```

## Alur konten

```text
Penulis membuat draft
        -> Editor memeriksa
        -> Editor menerbitkan
        -> Website dan Android membaca berita terbit
```

## Role pengguna

- `super_admin`: mengatur seluruh sistem dan pengguna.
- `editor`: meninjau serta menerbitkan berita.
- `author`: membuat dan mengedit berita miliknya.
- `media_admin`: mengelola media jika diperlukan.
- `reader`: membaca berita publik.

## Prinsip keamanan

- Secret server tidak boleh dikirim ke aplikasi Android.
- Akses data dibatasi dengan Row Level Security Supabase.
- Berita publik hanya menampilkan status `published`.
- Perubahan penting dicatat untuk audit.
- Role tidak ditentukan hanya dari data yang dikirim client.
