import React, { useEffect, useRef, useState, useCallback } from "react";

// ─── Video Asset Imports ───────────────────────────────────────────────────────
import vid1 from "../assets/292ad6448dc6b80b1eaf7ce7ba238064_720w.mp4";
import vid2 from "../assets/44e83e70c834f342713342f1864712b3_720w (1).mp4";
import vid3 from "../assets/7767bbdee8a4167ff6d45f1aba30b554_720w.mp4";
import vid4 from "../assets/e3528289edb92c09d3a09d0417c57d9c_720w.mp4";

const VIDEOS = [
  { id: 1, src: vid1, permanentMute: true, label: "Site Inspection & Footing" },
  { id: 2, src: vid2, permanentMute: false, label: "Framework & Column Construction" },
  { id: 3, src: vid3, permanentMute: false, label: "Structure & Slab Reinforcement" },
  { id: 4, src: vid4, permanentMute: false, label: "Finishing & Quality Verification" }
];

// ─── Icons ─────────────────────────────────────────────────────────────────────
const MuteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const UnmuteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const VideoShowcase = () => {
  const videoRefs = useRef([]);
  const sectionRef = useRef(null);
  const isSectionVisibleRef = useRef(false);

  // activeIndexRef keeps track of currently playing index (0, 1, 2, 3)
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // unmutedIndex tracks which video (1, 2, 3) has sound; null = all muted
  const unmutedIndexRef = useRef(null);
  const [unmutedIndex, setUnmutedIndex] = useState(null);

  // ── Play Target Video with Safe Mobile Autoplay & canplay Retry ───────────────
  const playOnly = useCallback((indexToPlay) => {
    if (indexToPlay === null || indexToPlay === undefined) return;

    // 1. Pause all other videos
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx !== indexToPlay) {
        if (!vid.paused) {
          vid.pause();
        }
      }
    });

    // 2. Play target video
    const target = videoRefs.current[indexToPlay];
    if (target) {
      // Configure muted status (Video 1 is always permanently muted)
      if (indexToPlay === 0 || unmutedIndexRef.current !== indexToPlay) {
        target.muted = true;
        target.defaultMuted = true;
      } else {
        target.muted = false;
      }
      target.playsInline = true;

      // Safe playback execution
      const executePlay = () => {
        if (!isSectionVisibleRef.current) return;
        const playPromise = target.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If failed (e.g. mobile timing/buffering), retry once when ready
            if (target.readyState < 2) {
              const onCanPlayOnce = () => {
                target.removeEventListener("canplay", onCanPlayOnce);
                if (isSectionVisibleRef.current && activeIndexRef.current === indexToPlay) {
                  target.play().catch(() => {});
                }
              };
              target.addEventListener("canplay", onCanPlayOnce);
            }
          });
        }
      };

      if (isSectionVisibleRef.current) {
        if (target.readyState >= 2) {
          executePlay();
        } else {
          // If video metadata/data is still loading, listen for canplay
          const onReady = () => {
            target.removeEventListener("canplay", onReady);
            target.removeEventListener("loadeddata", onReady);
            if (isSectionVisibleRef.current && activeIndexRef.current === indexToPlay) {
              executePlay();
            }
          };
          target.addEventListener("canplay", onReady);
          target.addEventListener("loadeddata", onReady);
          executePlay(); // attempt immediately as well
        }
      }
    }

    activeIndexRef.current = indexToPlay;
    setActiveIndex(indexToPlay);
  }, []);

  const pauseAll = useCallback(() => {
    videoRefs.current.forEach((vid) => {
      if (vid && !vid.paused) {
        vid.pause();
      }
    });
  }, []);

  // ── Mute Toggle Handler (Does NOT restart video) ─────────────────────────────
  const handleToggleMute = useCallback((index, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (index === 0) return; // Video 1 is permanently muted

    setUnmutedIndex((prevUnmuted) => {
      const nextVal = prevUnmuted === index ? null : index;
      unmutedIndexRef.current = nextVal;
      return nextVal;
    });
  }, []);

  // ── Sync DOM muted attributes directly ───────────────────────────────────────
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === 0) {
        vid.muted = true; // Video 1 is permanently muted
        vid.defaultMuted = true;
      } else {
        const isMuted = unmutedIndex !== idx;
        vid.muted = isMuted;
        vid.defaultMuted = isMuted;
      }
    });
  }, [unmutedIndex]);

  // ── Video Lifecycle: Mobile Attributes, Error Handling, Metadata, & Next ─────
  useEffect(() => {
    const cleanups = [];

    videoRefs.current.forEach((vid, index) => {
      if (!vid) return;

      // Ensure full mobile browser compatibility attributes
      vid.muted = true;
      vid.defaultMuted = true;
      vid.playsInline = true;
      vid.setAttribute("playsinline", "");
      vid.setAttribute("webkit-playsinline", "");
      vid.setAttribute("muted", "");

      const onLoadedMetadata = () => {
        if (vid.duration && vid.duration > 3) {
          vid.__effectiveEndTime = vid.duration - 3;
        } else {
          vid.__effectiveEndTime = null;
        }
      };

      // Automatic continuous sequence: 1 -> 2 -> 3 -> 4 -> 1 ...
      const onTimeUpdate = () => {
        if (vid.__effectiveEndTime != null && vid.currentTime >= vid.__effectiveEndTime) {
          vid.pause();
          vid.currentTime = 0;

          // Next video index in continuous sequence
          const nextIndex = (index + 1) % VIDEOS.length;
          playOnly(nextIndex);
        }
      };

      const onError = () => {
        if (process.env.NODE_ENV !== "production") {
          console.error(`[VideoShowcase] Failed to load Video ${index + 1}: ${VIDEOS[index].src}`);
        }
      };

      vid.addEventListener("loadedmetadata", onLoadedMetadata);
      vid.addEventListener("timeupdate", onTimeUpdate);
      vid.addEventListener("error", onError);

      if (vid.readyState >= 1) {
        onLoadedMetadata();
      }

      cleanups.push(() => {
        vid.removeEventListener("loadedmetadata", onLoadedMetadata);
        vid.removeEventListener("timeupdate", onTimeUpdate);
        vid.removeEventListener("error", onError);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [playOnly]);

  // ── Single Viewport Observer: Autoplay when visible, Pause when scrolled away ──
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isSectionVisibleRef.current = true;
          // Automatically start / resume the active video (Video 1 initially)
          playOnly(activeIndexRef.current);
        } else {
          isSectionVisibleRef.current = false;
          pauseAll();
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px"
      }
    );

    sectionObserver.observe(sectionEl);

    return () => {
      sectionObserver.disconnect();
    };
  }, [playOnly, pauseAll]);

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
          {VIDEOS.map((video, index) => {
            const isActive = activeIndex === index;
            const isUnmuted = unmutedIndex === index;

            return (
              <div
                key={video.id}
                data-video-index={index}
                className={`vs-card${isActive ? " vs-card--active" : ""}`}
                role="region"
                aria-label={`Video ${index + 1}: ${video.label}`}
              >
                <div className="vs-card-inner">
                  <video
                    ref={(el) => { videoRefs.current[index] = el; }}
                    src={video.src}
                    muted={video.permanentMute ? true : !isUnmuted}
                    playsInline
                    autoPlay
                    preload="metadata"
                    disablePictureInPicture
                    className="vs-video"
                    aria-label={video.label}
                  />

                  {/* Subtle Dark Gradient Overlay at Bottom */}
                  <div className="vs-gradient" aria-hidden="true" />

                  {/* Top-Right Mute/Unmute Button: ONLY for Videos 2, 3, and 4 */}
                  {!video.permanentMute && (
                    <button
                      type="button"
                      className={`vs-mute-btn${isUnmuted ? " vs-mute-btn--on" : ""}`}
                      onClick={(e) => handleToggleMute(index, e)}
                      aria-label={isUnmuted ? `Mute video ${index + 1}` : `Unmute video ${index + 1}`}
                      title={isUnmuted ? "Mute" : "Unmute"}
                    >
                      {isUnmuted ? <UnmuteIcon /> : <MuteIcon />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;



