import React from "react";
import { Play } from "lucide-react";
import { getVideoThumbnail } from "../utils/video";

const VideoCard = ({ video, onPlay }) => {
  const thumbnail = getVideoThumbnail(video);

  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className="group min-w-0 overflow-hidden rounded-lg border border-zinc-200 bg-white text-left shadow-md transition duration-200 hover:-translate-y-1 hover:border-chrome hover:shadow-premium"
    >
      <span className="relative block aspect-video w-full overflow-hidden bg-black">
        {thumbnail ? (
          <img className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={thumbnail} alt={video.title || "Video"} />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-black text-sm font-black text-chrome">VIDEO</span>
        )}
        <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/35" />
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-chrome text-black shadow-md transition group-hover:scale-110">
          <Play size={19} fill="currentColor" />
        </span>
      </span>
      {video.title && <span className="block truncate px-3 py-3 text-sm font-black text-black">{video.title}</span>}
    </button>
  );
};

export default VideoCard;
