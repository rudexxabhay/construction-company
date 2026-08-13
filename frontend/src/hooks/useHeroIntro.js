import { useEffect } from "react";
import { gsap } from "../motion/gsap";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const useHeroIntro = (rootRef) => {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(root.querySelectorAll("[data-hero-reveal]"), { clearProps: "all" });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const eyebrow = root.querySelector("[data-hero-reveal='eyebrow']");
      const titleLines = root.querySelectorAll("[data-hero-reveal='title']");
      const subtitle = root.querySelector("[data-hero-reveal='subtitle']");
      const actions = root.querySelector("[data-hero-reveal='actions']");
      const stats = root.querySelector("[data-hero-reveal='stats']");
      const media = root.querySelector("[data-hero-reveal='media']");

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (media) tl.from(media, { scale: 1.02, opacity: 0, duration: 0.9 }, 0);
      if (eyebrow) tl.from(eyebrow, { y: 18, opacity: 0, duration: 0.55 }, 0.15);
      if (titleLines.length) tl.from(titleLines, { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.28);
      if (subtitle) tl.from(subtitle, { y: 16, opacity: 0, duration: 0.55 }, 0.48);
      if (actions) tl.from(actions, { y: 16, opacity: 0, duration: 0.55 }, 0.62);
      if (stats) tl.from(stats, { y: 20, opacity: 0, duration: 0.65 }, 0.76);
    }, root);

    return () => ctx.revert();
  }, [rootRef]);
};

export default useHeroIntro;
