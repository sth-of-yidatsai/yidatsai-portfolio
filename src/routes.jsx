import React from "react";
import { createBrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Projects from "./pages/Projects.jsx";
import Playground from "./pages/Playground.jsx";
import Contact from "./pages/Contact.jsx";
import ProjectDetailRouter from "./pages/ProjectDetailRouter.jsx";
import NotFound from "./pages/NotFound.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";

import projects from "./data/projects.json";

// loaders
export async function projectsLoader() {
  return projects;
}

export async function projectDetailLoader({ params }) {
  const { id } = params || {};
  const project = projects.find((p) => p.id === id);
  if (!project) {
    throw new Response("Not Found", {
      status: 404,
      statusText: "Project Not Found",
    });
  }
  return project;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home />, handle: { title: () => "YI-DA TSAI" } },
      { path: "about", element: <About />, handle: { title: () => "About | YI-DA TSAI" } },
      { path: "contact", element: <Contact />, handle: { title: () => "Contact | YI-DA TSAI" } },
      {
        path: "projects",
        element: <Projects />,
        loader: projectsLoader,
        errorElement: <ErrorPage />,
        handle: { title: () => "Projects | YI-DA TSAI" },
      },
      {
        path: "projects/page/:page",
        element: <Projects />,
        loader: projectsLoader,
        errorElement: <ErrorPage />,
        handle: { title: () => "Projects | YI-DA TSAI" },
      },
      {
        path: "playground",
        element: <Playground />,
        loader: projectsLoader,
        errorElement: <ErrorPage />,
        handle: { title: () => "Playground | YI-DA TSAI" },
      },
      {
        path: "projects/:id",
        element: <ProjectDetailRouter />,
        loader: projectDetailLoader,
        errorElement: <ErrorPage />,
        handle: { title: (data) => data?.title ? `${data.title} | YI-DA TSAI` : "Project | YI-DA TSAI" },
      },
      { path: "*", element: <NotFound />, handle: { title: () => "Not Found | YI-DA TSAI" } },
    ],
  },
]);

export default router;
