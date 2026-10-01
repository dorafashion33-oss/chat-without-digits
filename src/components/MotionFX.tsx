import { useEffect } from "react";

const MOTION_TARGETS = [
  "main h1",
  "main h2",
  "main h3",
  "main p",
  "main article",
  "main img",
  "main video",
  "main button",
  "main a",
  "main form",
  "main [role='dialog']",
  "header a",
  "header button",
  "aside > *",
].join(",");

const MotionFX = () => {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const observed = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("radiant-fx-visible", entry.isIntersecting);
        });
      },
      { rootMargin: "-4% 0px -4% 0px", threshold: 0.08 },
    );

    const registerTargets = (root: ParentNode = document) => {
      root.querySelectorAll(MOTION_TARGETS).forEach((element) => {
        if (observed.has(element) || element.closest("[data-motion-fx='off']")) return;
        observed.add(element);
        element.classList.add("radiant-fx-target");
        observer.observe(element);
      });
    };

    registerTargets();
    const mutationObserver = new MutationObserver(() => registerTargets());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
};

export default MotionFX;