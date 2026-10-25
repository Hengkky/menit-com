# 4. Rancangan Database

## Tabel inti

### `profiles`

- `id` UUID, relasi ke `auth.users`
- `display_name` TEXT
- `role` TEXT
- `created_at` TIMESTAMPTZ

### `categories`

- `id` UUID
- `name` TEXT
- `slug` TEXT unik
- `description` TEXT nullable
- `is_active` BOOLEAN
- `created_at` TIMESTAMPTZ

### `articles`

- `id` UUID
- `title` TEXT
- `slug` TEXT unik
- `excerpt` TEXT
- `content` TEXT
- `thumbnail_url` TEXT nullable
- `category_id` UUID ke `categories`
- `author_id` UUID ke `profiles`
- `status` TEXT: `draft`, `review`, `published`, `archived`
- `published_at` TIMESTAMPTZ nullable
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

### `article_media`

- `id` UUID
- `article_id` UUID ke `articles`
- `storage_path` TEXT
- `media_type` TEXT
- `alt_text` TEXT nullable
- `sort_order` INTEGER
- `created_at` TIMESTAMPTZ

## Index penting

- `articles.slug`
- `articles.status`
- `articles.published_at`
- `articles.category_id`
- `categories.slug`

## Aturan akses awal

- Pembaca dapat membaca artikel berstatus `published`.
- Author dapat membuat dan mengubah draft miliknya.
- Editor dapat meninjau dan menerbitkan artikel.
- Super admin dapat mengelola seluruh data.
- Pengelolaan role dilakukan hanya oleh super admin.

## Catatan implementasi

Skema ini adalah rancangan awal. Migration SQL baru dibuat setelah hasil audit dependency dan keputusan final mengenai format editor artikel ditetapkan.
