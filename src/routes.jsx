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

import projects from "./data/projects.json";
import { PAGE_META, buildProjectMeta } from "./seo/seoConfig.js";

// loaders
export async function projectsLoader() {
  return projects;
}

export async function projectDetailLoader({ params }) {
  const { id } = params || {};
  const project = projects.find((p) => p.id === id);
  if (!project) {
    return redirect("/not-found");
  }
  return project;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home />, handle: { title: () => "YI-DA TSAI", meta: () => PAGE_META.home } },
      { path: "about", element: <About />, handle: { title: () => "About | YI-DA TSAI", meta: () => PAGE_META.about } },
      { path: "contact", element: <Contact />, handle: { title: () => "Contact | YI-DA TSAI", meta: () => PAGE_META.contact } },
      {
        path: "projects",
        element: <Projects />,
        loader: projectsLoader,
        handle: { title: () => "Projects | YI-DA TSAI", meta: () => PAGE_META.projects },
      },
      {
        path: "projects/page/:page",
        element: <Projects />,
        loader: projectsLoader,
        handle: { title: () => "Projects | YI-DA TSAI", meta: () => PAGE_META.projects },
      },
      {
        path: "playground",
        element: <Playground />,
        loader: projectsLoader,
        handle: { title: () => "Playground | YI-DA TSAI", meta: () => PAGE_META.playground },
      },
      {
        path: "projects/:id",
        element: <ProjectPage />,
        loader: projectDetailLoader,
        handle: {
          title: (data) => data?.title ? `${data.title} | YI-DA TSAI` : "Project | YI-DA TSAI",
          meta: (data) => buildProjectMeta(data),
        },
      },
      { path: "*", element: <NotFound />, handle: { title: () => "Not Found | YI-DA TSAI", meta: () => PAGE_META.notFound } },
    ],
  },
  { path: "error-test", element: <ErrorPage />, handle: { title: () => "Error | YI-DA TSAI" } },
]);

export default router;
