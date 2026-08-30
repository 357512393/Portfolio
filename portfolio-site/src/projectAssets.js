import { assetUrl } from "./assetUrl";

export const PROJECT_ASSET_VERSION = "20260830-1";

export function projectAssetUrl(path) {
  return `${assetUrl(path)}?v=${PROJECT_ASSET_VERSION}`;
}

export function projectImages(slug, numbers) {
  return numbers.map((number) => projectAssetUrl(`/assets/projects/${slug}/${number}.webp`));
}

export function projectThumbnailImages(slug, numbers) {
  return numbers.map((number) => projectAssetUrl(`/assets/project-thumbnails/${slug}/${number}.webp`));
}

export function projectCoverImage(number) {
  return projectAssetUrl(`/assets/${number}.webp`);
}

export function projectMobileAssetUrl(source) {
  const [pathname, query] = source.split("?");
  let mobilePath = pathname;
  if (pathname.includes("/assets/projects/")) {
    mobilePath = pathname.replace("/assets/projects/", "/assets/projects-mobile/");
  } else {
    mobilePath = pathname.replace(/\/assets\/(\d+)\.webp$/, "/assets/projects-mobile/covers/$1.webp");
  }
  return query ? `${mobilePath}?${query}` : mobilePath;
}
