import { createHash } from "node:crypto";

export const cloudinaryReady = () =>
  !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

export const userFolder = (userId: string) => `buharkent/${userId}`;

/** Tarayıcının doğrudan Cloudinary'ye yükleyebilmesi için kısa ömürlü imza */
export function signUpload(userId: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    allowed_formats: "jpg,jpeg,png,webp,heic",
    folder: userFolder(userId),
    timestamp,
  };
  // Cloudinary kuralı: parametreler alfabetik sırada, sonuna API secret eklenir
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signature = createHash("sha1").update(toSign + process.env.CLOUDINARY_API_SECRET).digest("hex");
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder: params.folder as string,
    allowedFormats: params.allowed_formats as string,
  };
}

/** Sadece kendi klasörümüze, bu kullanıcının yüklediği görseller kabul edilir */
export function isOwnImage(url: unknown, userId: string): url is string {
  if (typeof url !== "string" || url.length > 300) return false;
  const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  return url.startsWith(prefix) && url.includes(`/${userFolder(userId)}/`) && !/[\s"'<>]/.test(url);
}

/** Görseli boyutlandırılmış ve otomatik formatlı haliyle verir */
export const cdn = (url: string, w: number) => url.replace("/image/upload/", `/image/upload/c_limit,w_${w},q_auto,f_auto/`);
