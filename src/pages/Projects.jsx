import { useEffect } from "react";
import SelectWork from "../components/sections/projects-page/SelectWork";
import AllWork from "../components/sections/projects-page/AllWork";
import "./Projects.css";

export default function Projects() {
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
      <SelectWork />
      <AllWork />
    </main>
  );
}
