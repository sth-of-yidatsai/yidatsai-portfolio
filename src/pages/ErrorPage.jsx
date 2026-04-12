import { useRouteError, Link } from "react-router-dom";
import CustomCursor from "../components/CustomCursor";
import "./ErrorPage.css";

const COPY = {
  en: {
    label:    'Error',
    heading:  'Something went wrong.',
    body:     'An unexpected error occurred.\nPlease try again or return to the homepage.',
    reload:   'Reload',
    backHome: 'Back to Home',
  },
  zh: {
    label:    '錯誤',
    heading:  '發生了一些問題。',
    body:     '發生了意外錯誤。\n請重試或返回首頁。',
    reload:   '重新載入',
    backHome: '回到首頁',
  },
};

export default function ErrorPage({ standalone = true }) {
  const error = useRouteError();
  console.error(error);

  const lang = window.location.pathname.match(/^\/(en|zh)\//)?.[1] ?? 'en';
  const t = COPY[lang] ?? COPY.en;

  return (
    <>
    {standalone && <CustomCursor />}
    <div className="ep-page">
      <div className="ep-inner">
        <p className="ep-label">{t.label}</p>
        <h1 className="ep-heading">{t.heading}</h1>
        <span className="ep-divider" aria-hidden="true" />
        <p className="ep-body">
          {t.body.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>
        <div className="ep-actions">
          <button
            className="ep-btn ep-btn--secondary"
            onClick={() => window.location.reload()}
          >
            {t.reload}
          </button>
          <Link to={`/${lang}/`} className="ep-btn ep-btn--primary">
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
