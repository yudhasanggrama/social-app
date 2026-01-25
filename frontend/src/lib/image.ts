// src/lib/image.ts

const ORIGIN = "http://localhost:9000";
export const DEFAULT_AVATAR = `${ORIGIN}/uploads/default-avatar.png`;

/**
 * Return string URL atau undefined (bukan "")
 * cocok untuk AvatarImage (karena src?: string)
 */
export const publicUrl = (p?: string | null): string | undefined => {
  if (!p) return undefined;
  if (p.startsWith("http")) return p;

  if (p.startsWith("uploads/")) return `${ORIGIN}/${p}`;
  if (p.startsWith("/")) return `${ORIGIN}${p}`;
  return `${ORIGIN}/${p}`;
};

/**
 * Return URL string pasti (dengan fallback)
 * cocok untuk <img> biasa
 */
export const publicUrlWithFallback = (
  p?: string | null,
  fallback: string = DEFAULT_AVATAR
): string => {
  return publicUrl(p) ?? fallback;
};

/**
 * Untuk avatar shadcn: kalau tidak ada avatar -> undefined,
 * biar AvatarFallback yang tampil.
 */
export const avatarSrc = (avatar?: string | null): string | undefined => {
  return publicUrl(avatar);
};

/**
 * Untuk <img> avatar (bukan shadcn), selalu ada gambar fallback.
 * bisa cache bust dengan versi.
 */
export const avatarImgSrc = (
  avatar?: string | null,
  version?: number,
  fallback: string = DEFAULT_AVATAR
): string => {
  const base = publicUrlWithFallback(avatar, fallback);
  return version ? `${base}?v=${version}` : base;
};
