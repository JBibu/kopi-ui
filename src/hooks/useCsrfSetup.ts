import { useEffect } from "react";
import axios from "axios";

export function useCsrfSetup() {
  useEffect(() => {
    const tok: HTMLMetaElement | null = document.head.querySelector<HTMLMetaElement>('meta[name="kopia-csrf-token"]');
    if (tok && tok.content) {
      axios.defaults.headers.common["X-Kopia-Csrf-Token"] = tok.content;
    } else {
      axios.defaults.headers.common["X-Kopia-Csrf-Token"] = "-";
    }
  }, []);
}