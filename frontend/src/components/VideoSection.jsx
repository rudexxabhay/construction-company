import React, { useState } from "react";
import { X } from "lucide-react";
import SectionTitle from "./SectionTitle";
import VideoCard from "./VideoCard";
import { getVideoEmbedUrl, isDirectVideoUrl } from "../utils/video";

const VideoSection = ({ videos = [] }) => {
  const visibleVideos = videos.filter((video) => video?.url).slice(0, 12);
  const [active, setActive] = useState(null);

  if (!visibleVideos.length) return null;

  return (
    <section className="bg-black py-12 text-white md:py-16">
      <div className="container-pad">
        <SectionTitle eyebrow="Videos" title="Recent site videos" text="Compact walkthroughs, project updates, and construction highlights." theme="dark" align="center" />
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-4">
          {visibleVideos.map((video, index) => (
            <div key={`${video.url}-${index}`} className="min-w-[calc(50%-0.375rem)] snap-start md:min-w-0">
              <VideoCard video={video} onPlay={setActive} />
            </div>
          ))}
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-4xl overflow-hidden rounded-lg bg-black shadow-premium">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="truncate text-sm font-black text-white">{active.title || "Video"}</p>
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:bg-chrome" onClick={() => setActive(null)} aria-label="Close video">
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {isDirectVideoUrl(active.url) ? (
                <video className="h-full w-full" src={active.url} controls autoPlay />
              ) : (
                <iframe className="h-full w-full" src={getVideoEmbedUrl(active.url)} title={active.title || "Video"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoSection;
