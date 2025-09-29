import { useEffect } from "react";

export function useAppInit() {
  useEffect(() => {
    const av: HTMLElement | null = document.getElementById("appVersion");
    if (av) {
      // Show app version after mounting the component to avoid flashing of unstyled content
      av.style.display = "block";
    }
  }, []);
}