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
      { rootMargin: "-2% 0px -2% 0px", threshold: 0.05 },
    );

    const registerTargets = (root: ParentNode = document) => {
      root.querySelectorAll(MOTION_TARGETS).forEach((element) => {
        // Chat messages, typing inputs aur wallpapers ko exclude karein
        if (
          observed.has(element) ||
          element.closest("[data-motion-fx='off']") ||
          element.closest(".chat-messages-shell") ||
          element.closest(".chat-wallpaper") ||
          element.closest("[data-chat-messages]") ||
          element.closest("input") ||
          element.closest("textarea")
        ) {
          return;
        }

        observed.add(element);
        element.classList.add("radiant-fx-target");
        observer.observe(element);
      });
    };

    registerTargets();

    // requestAnimationFrame debounce taaki continuous typing par DOM freeze na ho
    let rafId: number | null = null;
    const mutationObserver = new MutationObserver(() => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        registerTargets();
        rafId = null;
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
};

export default MotionFX;
