export const getYouTubeId = (url = "") => {
  const value = url.trim();
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/i,
    /youtube\.com\/shorts\/([^?&/]+)/i,
    /youtu\.be\/([^?&/]+)/i,
    /youtube\.com\/embed\/([^?&/]+)/i
  ];
  const match = patterns.map((pattern) => value.match(pattern)?.[1]).find(Boolean);
  return match || "";
};

export const getVideoThumbnail = (video = {}) => {
  if (video.thumbnail) return video.thumbnail;
  const youtubeId = getYouTubeId(video.url);
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "";
};

export const getVideoEmbedUrl = (url = "") => {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;
  return url;
};

export const isDirectVideoUrl = (url = "") => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url.trim());

export const normalizeVideo = (video = {}) => {
  const title = video.title?.trim() || "";
  const url = video.url?.trim() || "";
  const thumbnail = video.thumbnail?.trim() || getVideoThumbnail({ url });
  return { title, url, thumbnail };
};
