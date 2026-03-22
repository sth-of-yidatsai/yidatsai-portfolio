import { useRouteError, Link } from "react-router-dom";
import CustomCursor from "../components/CustomCursor";
import "./ErrorPage.css";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <>
    <CustomCursor />
    <div className="ep-page">
      <div className="ep-inner">
        <p className="ep-label">Error</p>
        <h1 className="ep-heading">Something went wrong.</h1>
        <span className="ep-divider" aria-hidden="true" />
        <p className="ep-body">
          An unexpected error occurred.<br />
          Please try again or return to the homepage.
        </p>
        <div className="ep-actions">
          <button
            className="ep-btn ep-btn--secondary"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
          <Link to="/" className="ep-btn ep-btn--primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
