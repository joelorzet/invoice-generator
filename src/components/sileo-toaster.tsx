"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sileo";
import "sileo/styles.css";

export function SileoToaster() {
  const [toastTheme, setToastTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    function update() {
      const isLight = document.documentElement.classList.contains("light");
      setToastTheme(isLight ? "light" : "dark");
    }

    update();

    // Watch for class changes on <html>
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return <Toaster position="top-center" theme={toastTheme} />;
}
