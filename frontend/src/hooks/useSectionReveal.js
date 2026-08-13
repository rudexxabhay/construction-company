import { useEffect } from "react";
import { ScrollTrigger, gsap } from "../motion/gsap";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clearStyles = (elements) => {
  elements.forEach((element) => {
    gsap.set(element, { clearProps: "all" });
  });
};

const useSectionReveal = (
  rootRef,
  {
    start = "top 82%",
    introSelector = "[data-reveal-intro]",
    itemSelector = "[data-reveal-item]",
    connectorSelector = "[data-reveal-connector]",
    introY = 24,
    itemY = 28,
    itemStagger = 0.1
  } = {}
) => {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const introTargets = Array.from(root.querySelectorAll(introSelector));
    const itemTargets = Array.from(root.querySelectorAll(itemSelector));
    const connectorTargets = Array.from(root.querySelectorAll(connectorSelector));

    if (prefersReducedMotion()) {
      clearStyles([...introTargets, ...itemTargets, ...connectorTargets]);
      return undefined;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start,
          once: true
        }
      });

      if (connectorTargets.length) {
        tl.from(
          connectorTargets,
          {
            opacity: 0,
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.45,
            ease: "power2.out"
          },
          0
        );
      }

      if (introTargets.length) {
        tl.from(
          introTargets,
          {
            y: introY,
            opacity: 0,
            duration: 0.75,
            ease: "power3.out"
          },
          0.05
        );
      }

      if (itemTargets.length) {
        tl.from(
          itemTargets,
          {
            y: itemY,
            opacity: 0,
            duration: 0.7,
            stagger: itemStagger,
            ease: "power3.out"
          },
          0.2
        );
      }
    }, root);

    return () => ctx.revert();
  }, [rootRef, start, introSelector, itemSelector, connectorSelector, introY, itemY, itemStagger]);
};

export default useSectionReveal;
