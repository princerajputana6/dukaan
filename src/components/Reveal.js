"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";

// Reveals children with a fade/slide when scrolled into view.
export default function Reveal({
  children,
  delay = 0,
  y = 24,
  once = true,
  duration = 0.7,
  sx,
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            if (once) obs.unobserve(e.target);
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  return (
    <Box
      ref={ref}
      sx={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity ${duration}s cubic-bezier(.2,.7,.3,1) ${delay}s, transform ${duration}s cubic-bezier(.2,.7,.3,1) ${delay}s`,
        willChange: "opacity, transform",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}
