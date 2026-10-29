import { useEffect, useState } from "react";

const read = () => (window.location.hash.startsWith("#/app") ? "app" : "home");

/** Router hash minimal: "#/app" = aplikasi, selainnya = landing (anchor #fitur dll tetap berfungsi). */
export function useHashRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      const next = read();
      setRoute((prev) => {
        if (prev !== next) window.scrollTo({ top: 0, behavior: "instant" });
        return next;
      });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
