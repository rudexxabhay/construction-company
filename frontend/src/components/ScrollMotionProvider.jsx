import React, { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger, gsap } from "../motion/gsap";

const isReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ScrollMotionProvider = ({ children }) => {
  useEffect(() => {
    if (isReducedMotion()) return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1
    });

    const onScroll = () => ScrollTrigger.update();
    const onRaf = (time) => {
      lenis.raf(time * 1000);
    };
    const refresh = () => ScrollTrigger.refresh();

    lenis.on("scroll", onScroll);
    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;

    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }

    window.addEventListener("load", refresh, { once: true });

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(onRaf);
      lenis.destroy();
      if (window.__lenis === lenis) delete window.__lenis;
      window.removeEventListener("load", refresh);
    };
  }, []);

  return <>{children}</>;
};

export default ScrollMotionProvider;
