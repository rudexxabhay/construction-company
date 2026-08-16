import React, { useEffect, useRef } from "react";

// ─── Video Asset Imports ───────────────────────────────────────────────────────
import vid1 from "../assets/292ad6448dc6b80b1eaf7ce7ba238064_720w.mp4";
import vid2 from "../assets/44e83e70c834f342713342f1864712b3_720w (1).mp4";
import vid3 from "../assets/7767bbdee8a4167ff6d45f1aba30b554_720w.mp4";
import vid4 from "../assets/e3528289edb92c09d3a09d0417c57d9c_720w.mp4";

const VIDEOS = [
  { id: 1, src: vid1, label: "Site Inspection & Footing" },
  { id: 2, src: vid2, label: "Framework & Column Construction" },
  { id: 3, src: vid3, label: "Structure & Slab Reinforcement" },
  { id: 4, src: vid4, label: "Finishing & Quality Verification" }
];

const VideoShowcase = () => {
  const videoRefs = useRef([]);
  const sectionRef = useRef(null);
  const isSectionVisibleRef = useRef(false);

  useEffect(() => {
    const cleanups = [];

    // ── Direct Video Setup & Event Listeners ─────────────────────────────────
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      // 1. Permanent Mute & Mobile Compatibility Attributes
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("muted", "");

      // 2. Play helper with single canplay retry
      const attemptPlay = () => {
        if (!isSectionVisibleRef.current) return;
        const promise = video.play();
        if (promise !== undefined) {
          promise.catch(() => {
            const onCanPlayOnce = () => {
              video.removeEventListener("canplay", onCanPlayOnce);
              if (isSectionVisibleRef.current) {
                video.play().catch(() => {});
              }
            };
            video.addEventListener("canplay", onCanPlayOnce);
            cleanups.push(() => video.removeEventListener("canplay", onCanPlayOnce));
          });
        }
      };

      // 3. Metadata & Dynamic Loop Threshold (Skip final 3 seconds smoothly)
      const onLoadedMetadata = () => {
        if (video.duration && video.duration > 3) {
          video.__effectiveEndTime = video.duration - 3;
        } else {
          video.__effectiveEndTime = null;
        }
      };

      // Direct timeupdate listener - loops seamlessly with 0 React re-renders
      const onTimeUpdate = () => {
        if (video.__effectiveEndTime != null && video.currentTime >= video.__effectiveEndTime - 0.08) {
          video.currentTime = 0;
          video.play().catch(() => {});
        }
      };

      const onError = () => {
        if (process.env.NODE_ENV !== "production") {
          console.error(`[VideoShowcase] Failed to load Video ${index + 1}: ${VIDEOS[index]?.src}`);
        }
      };

      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("timeupdate", onTimeUpdate);
      video.addEventListener("error", onError);

      if (video.readyState >= 1) {
        onLoadedMetadata();
      }

      cleanups.push(() => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.removeEventListener("error", onError);
      });

      // Attempt immediate play if section is already marked visible
      if (isSectionVisibleRef.current) {
        attemptPlay();
      }
    });

    // ── Single Viewport Observer for the whole section only ──────────────────
    const sectionEl = sectionRef.current;
    let sectionObserver = null;

    if (sectionEl) {
      sectionObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            isSectionVisibleRef.current = true;
            videoRefs.current.forEach((video) => {
              if (video) {
                video.muted = true;
                video.defaultMuted = true;
                video.volume = 0;
                const promise = video.play();
                if (promise !== undefined) {
                  promise.catch(() => {
                    const onCanPlay = () => {
                      video.removeEventListener("canplay", onCanPlay);
                      if (isSectionVisibleRef.current) {
                        video.play().catch(() => {});
                      }
                    };
                    video.addEventListener("canplay", onCanPlay);
                  });
                }
              }
            });
          } else {
            isSectionVisibleRef.current = false;
            videoRefs.current.forEach((video) => {
              if (video && !video.paused) {
                video.pause();
              }
            });
          }
        },
        {
          threshold: 0.05,
          rootMargin: "100px"
        }
      );

      sectionObserver.observe(sectionEl);
    }

    return () => {
      cleanups.forEach((fn) => fn());
      if (sectionObserver) {
        sectionObserver.disconnect();
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="vs-section"
      aria-label="Our Stories – Built in Motion"
    >
      <div className="container-pad">
        {/* Section Header */}
        <header className="vs-header">
          <p className="vs-eyebrow">OUR STORIES</p>
          <h2 className="vs-title">Built in Motion</h2>
          <p className="vs-desc">
            A closer look at the work, precision and progress behind Quality Construction.
          </p>
        </header>

        {/* Video Grid: 4 in row on Desktop, 2 in row on Mobile/Tablet */}
        <div className="vs-grid">
          {VIDEOS.map((video, index) => (
            <div
              key={video.id}
              data-video-index={index}
              className="vs-card"
              role="region"
              aria-label={`Video ${index + 1}: ${video.label}`}
            >
              <div className="vs-card-inner">
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={video.src}
                  muted
                  defaultMuted
                  playsInline
                  autoPlay
                  loop
                  preload="auto"
                  disablePictureInPicture
                  className="vs-video"
                  aria-label={video.label}
                />

                {/* Subtle Dark Gradient Overlay at Bottom */}
                <div className="vs-gradient" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;



