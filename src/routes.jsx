import React from "react";
import { createBrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Projects from "./pages/Projects.jsx";
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
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      {
        path: "projects",
        element: <Projects />,
        loader: projectsLoader,
        errorElement: <ErrorPage />,
      },
      {
        path: "projects/:id",
        element: <ProjectDetailRouter />,
        loader: projectDetailLoader,
        errorElement: <ErrorPage />,
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
