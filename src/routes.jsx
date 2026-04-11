import React from "react";
import { createBrowserRouter, redirect } from "react-router-dom";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Projects from "./pages/Projects.jsx";
import Playground from "./pages/Playground.jsx";
import Contact from "./pages/Contact.jsx";
import ProjectPage from "./pages/ProjectPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import LangWrapper from "./components/LangWrapper.jsx";

import projects from "./data/projects.json";
import { getPageMeta, buildProjectMeta } from "./seo/seoConfig.js";

// loaders
export async function projectsLoader() {
  return projects;
}

export async function projectDetailLoader({ params }) {
  const { id, lang = "en" } = params || {};
  const project = projects.find((p) => p.id === id);
  if (!project) {
    return redirect(`/${lang}/not-found`);
  }
  return project;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, loader: () => redirect("/en/") },
      {
        path: ":lang",
        element: <LangWrapper />,
        children: [
          { index: true, element: <Home />, handle: { title: (_d, lang) => getPageMeta("home", lang).title ?? "YI-DA TSAI", meta: (_d, lang) => getPageMeta("home", lang) } },
          { path: "about", element: <About />, handle: { title: (_d, lang) => getPageMeta("about", lang).title ?? "About | YI-DA TSAI", meta: (_d, lang) => getPageMeta("about", lang) } },
          { path: "contact", element: <Contact />, handle: { title: (_d, lang) => getPageMeta("contact", lang).title ?? "Contact | YI-DA TSAI", meta: (_d, lang) => getPageMeta("contact", lang) } },
          {
            path: "projects",
            element: <Projects />,
            loader: projectsLoader,
            handle: { title: (_d, lang) => getPageMeta("projects", lang).title ?? "Projects | YI-DA TSAI", meta: (_d, lang) => getPageMeta("projects", lang) },
          },
          {
            path: "projects/page/:page",
            element: <Projects />,
            loader: projectsLoader,
            handle: { title: (_d, lang) => getPageMeta("projects", lang).title ?? "Projects | YI-DA TSAI", meta: (_d, lang) => getPageMeta("projects", lang) },
          },
          {
            path: "playground",
            element: <Playground />,
            loader: projectsLoader,
            handle: { title: (_d, lang) => getPageMeta("playground", lang).title ?? "Playground | YI-DA TSAI", meta: (_d, lang) => getPageMeta("playground", lang) },
          },
          {
            path: "projects/:id",
            element: <ProjectPage />,
            loader: projectDetailLoader,
            handle: {
              title: (data, lang) => {
                const title = lang === "zh" && data?.title_zh ? data.title_zh : data?.title;
                return title ? `${title} | YI-DA TSAI` : "Project | YI-DA TSAI";
              },
              meta: (data, lang) => buildProjectMeta(data, lang),
            },
          },
          { path: "*", element: <NotFound />, handle: { title: (_d, lang) => getPageMeta("notFound", lang).title ?? "Not Found | YI-DA TSAI", meta: (_d, lang) => getPageMeta("notFound", lang) } },
        ],
      },
    ],
  },
  { path: "error-test", element: <ErrorPage />, handle: { title: () => "Error | YI-DA TSAI" } },
]);

export default router;
