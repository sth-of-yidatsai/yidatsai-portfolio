import { useEffect } from "react";
import SelectWork from "../components/sections/projects-page/SelectWork";
import AllWork from "../components/sections/projects-page/AllWork";
import { useTranslation } from "../hooks/useTranslation";
import "./Projects.css";

export default function Projects() {
  const { t } = useTranslation();
  useEffect(() => {
    const THRESHOLD = window.innerHeight * 0.9;

    const update = () => {
      if (window.scrollY < THRESHOLD) {
        document.body.classList.add("in-select-work");
      } else {
        document.body.classList.remove("in-select-work");
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      document.body.classList.remove("in-select-work");
    };
  }, []);

  return (
    <main className="projects-page">
      <h1 className="sr-only">{t('seo.h1.projects')}</h1>
      <SelectWork />
      <AllWork />
    </main>
  );
}
