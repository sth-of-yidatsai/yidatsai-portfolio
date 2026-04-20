import { useState, useEffect, useCallback, useRef } from "react";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "../../../hooks/useTranslation";
import "./ContactForm.css";

const EMAILJS_SERVICE_ID =
  import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY =
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

// Rate limit: max 3 submissions per hour
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_MS = 60 * 60 * 1000;
const RATE_LIMIT_KEY = "cf_submissions";

// Toast auto-dismiss timing (ms)
const TOAST_VISIBLE_MS = 5500;
const TOAST_REMOVE_MS = 6500;

// ── Set true to preview toast style, false in production ──────────────────────
const PREVIEW_TOAST = false;

const EN_INTEREST_GROUPS = [
  {
    group: "Brand",
    items: ["Logo Design", "Brand Identity", "Brand Strategy", "Rebranding"],
  },
  {
    group: "Graphic",
    items: [
      "Packaging Design",
      "Print Design",
      "Editorial Design",
      "Campaign Visuals",
    ],
  },
  {
    group: "Digital",
    items: [
      "Website Design",
      "UI / UX Design",
      "Landing Page",
      "Design System",
    ],
  },
  { group: "Extras", items: ["Social Media", "Motion Graphics", "3D Visual"] },
  { group: "Other", items: ["Not sure yet"] },
];

// ─── Budget weight system ─────────────────────────────────────────────────────

const INTEREST_WEIGHTS = {
  "Logo Design": 1,
  "Brand Identity": 3,
  "Brand Strategy": 3,
  Rebranding: 3,
  "Packaging Design": 2,
  "Print Design": 1,
  "Editorial Design": 2,
  "Campaign Visuals": 2,
  "Website Design": 3,
  "UI / UX Design": 3,
  "Landing Page": 2,
  "Design System": 3,
  "Social Media": 1,
  "Motion Graphics": 2,
  "3D Visual": 2,
  "Not sure yet": 0,
};

const CATEGORY_MULTIPLIERS = {
  Brand: 1.2,
  Graphic: 1.0,
  Digital: 1.1,
  Extras: 0.8,
  Other: 1.0,
};

// item → group lookup (built once at module level)
const ITEM_GROUP = {};
EN_INTEREST_GROUPS.forEach(({ group, items }) =>
  items.forEach((item) => {
    ITEM_GROUP[item] = group;
  }),
);

// minimum budget index forced by certain high-value items
const MIN_BUDGET_FOR = { "Brand Identity": 2, "Brand Strategy": 2 };

function suggestBudgetIndex(selectedItems) {
  if (selectedItems.length === 0) return 1; // default → $2,500
  const score = selectedItems.reduce((sum, item) => {
    const w = INTEREST_WEIGHTS[item] ?? 0;
    const m = CATEGORY_MULTIPLIERS[ITEM_GROUP[item]] ?? 1.0;
    return sum + w * m;
  }, 0);
  const minIdx = selectedItems.reduce(
    (mx, item) => Math.max(mx, MIN_BUDGET_FOR[item] ?? 0),
    0,
  );
  let idx =
    score <= 2 ? 0 : score <= 4 ? 1 : score <= 6 ? 2 : score <= 8 ? 3 : 4;
  return Math.max(idx, minIdx);
}

const BUDGET_STEPS = [1200, 2500, 3600, 4500, 6000];
const BUDGET_TIERS = ["Starter", "Basic", "Standard", "Pro", "Custom"];

const EN_TIMELINES = [
  "Within 1 month",
  "2-3 months",
  "3-6 months",
  "Over 3 months",
  "Flexible timeline",
];

const TAIWAN_COUNTIES = [
  "Taiwan",
  "Taipei City",
  "New Taipei City",
  "Taoyuan City",
  "Taichung City",
  "Tainan City",
  "Kaohsiung City",
  "Hsinchu City",
  "Keelung City",
  "Hsinchu County",
  "Miaoli County",
  "Changhua County",
  "Nantou County",
  "Yunlin County",
  "Chiayi City",
  "Chiayi County",
  "Pingtung County",
  "Yilan County",
  "Hualien County",
  "Taitung County",
  "Penghu County",
  "Kinmen County",
  "Lienchiang County",
];

const REGIONS = [
  "International",
  "Japan",
  "South Korea",
  "China (Mainland)",
  "Hong Kong",
  "Macau",
  "Singapore",
  "Southeast Asia",
  "South Asia",
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Netherlands",
  "Other Europe",
  "Middle East",
  "Australia / New Zealand",
  "Latin America",
  "Africa",
  "Other",
];

// ─── Custom Select ────────────────────────────────────────────────────────────

const MIN_THUMB_H = 24;

// options      — EN keys stored in form state
// displayOptions — locale display labels (same length as options)
function CustomSelect({ name, value, options, displayOptions, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const thumbRef = useRef(null);

  // ── Close on outside click ──────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function onPointer(e) {
      if (rootRef.current && !rootRef.current.contains(e.target))
        setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // ── Close on Escape ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // ── Custom thumb sync + wheel capture ──────────────────────────
  useEffect(() => {
    const list = listRef.current;
    const thumb = thumbRef.current;
    if (!list || !thumb || !open) return;

    const updateThumb = () => {
      const { scrollTop, scrollHeight, clientHeight } = list;
      const ratio =
        scrollHeight > clientHeight
          ? scrollTop / (scrollHeight - clientHeight)
          : 0;
      const thumbH = Math.max(
        MIN_THUMB_H,
        (clientHeight / scrollHeight) * clientHeight,
      );
      const maxTop = clientHeight - thumbH;
      thumb.style.height = `${thumbH}px`;
      thumb.style.transform = `translateY(${ratio * maxTop}px)`;
    };

    // Block wheel from reaching smooth-scroll on window; scroll list manually
    const onWheel = (e) => {
      e.stopPropagation();
      list.scrollTop += e.deltaY;
      updateThumb();
    };

    updateThumb();
    list.addEventListener("scroll", updateThumb, { passive: true });
    list.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      list.removeEventListener("scroll", updateThumb);
      list.removeEventListener("wheel", onWheel);
    };
  }, [open]);

  return (
    <div
      className={`cf__csel${disabled ? " cf__csel--disabled" : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        className={`cf__csel-trigger${open ? " cf__csel-trigger--open" : ""}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled}
      >
        <span className="cf__csel-value">
          {displayOptions ? displayOptions[options.indexOf(value)] ?? value : value}
        </span>
        <span className="cf__csel-arrow" aria-hidden="true">
          &#x25BE;
        </span>
      </button>

      {open && (
        <div className="cf__csel-panel">
          <ul className="cf__csel-list" role="listbox" ref={listRef}>
            {options.map((opt, i) => (
              <li key={opt} role="option" aria-selected={opt === value}>
                <button
                  type="button"
                  className={`cf__csel-option${opt === value ? " cf__csel-option--selected" : ""}`}
                  onClick={() => {
                    onChange(name, opt);
                    setOpen(false);
                  }}
                >
                  {displayOptions ? (displayOptions[i] ?? opt) : opt}
                </button>
              </li>
            ))}
          </ul>
          <div className="cf__csel-track">
            <div className="cf__csel-thumb" ref={thumbRef} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Form initial state ───────────────────────────────────────────────────────

const initialForm = {
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  phone: "",
  locationCounty: "Taiwan",
  locationRegion: "International",
  interests: [],
  budgetIndex: 1,
  timeline: "",
  message: "",
  honeypot: "", // hidden anti-bot field
};

// ─── Rate limit helpers ───────────────────────────────────────────────────────

function getRateRecords() {
  try {
    return JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || "[]");
  } catch {
    return [];
  }
}

function isRateLimited() {
  const now = Date.now();
  const recent = getRateRecords().filter((t) => now - t < RATE_LIMIT_MS);
  return recent.length >= RATE_LIMIT_MAX;
}

function recordSubmission() {
  const now = Date.now();
  const recent = getRateRecords().filter((t) => now - t < RATE_LIMIT_MS);
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify([...recent, now]));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContactForm() {
  const { t, locale } = useTranslation();
  const cf = locale.contact.form;
  // Display-only locale arrays (form state always stores EN values internally)
  const displayGroups = cf.interestGroups;
  const displayTiers = cf.budgetTiers;
  const displayDescs = cf.budgetDescs;
  const displayTimelines = cf.timelines;
  const displayCounties = cf.counties;
  const displayRegions = cf.regions;

  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error | rate-limited
  const [toastVisible, setToastVisible] = useState(false);
  const [isBudgetLocked, setIsBudgetLocked] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const budgetDotsRef = useRef(null);
  const recaptchaRef = useRef(null);

  // Auto-dismiss toast (skipped in preview mode)
  useEffect(() => {
    if (PREVIEW_TOAST) return;
    if (status === "idle" || status === "sending") return;

    setToastVisible(true);
    const hideTimer = setTimeout(
      () => setToastVisible(false),
      TOAST_VISIBLE_MS,
    );
    const resetTimer = setTimeout(() => setStatus("idle"), TOAST_REMOVE_MS);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(resetTimer);
    };
  }, [status]);

  // Unlock budget suggestion when all interests are cleared
  useEffect(() => {
    if (form.interests.length === 0) {
      setIsBudgetLocked(false);
      setForm((prev) => ({ ...prev, budgetIndex: 1 }));
    }
  }, [form.interests.length]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const cleaned = name === "phone" ? value.replace(/[^\d+-]/g, "") : value;
    setForm((prev) => ({ ...prev, [name]: cleaned }));
  }, []);

  const handleSelectChange = useCallback((name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // mutual exclusion: selecting a specific county locks region, and vice versa
      if (name === "locationCounty" && value !== "Taiwan")
        next.locationRegion = "International";
      if (name === "locationRegion" && value !== "International")
        next.locationCounty = "Taiwan";
      return next;
    });
  }, []);

  const handleInterest = useCallback(
    (label) => {
      setForm((prev) => {
        const has = prev.interests.includes(label);
        const newInterests = has
          ? prev.interests.filter((i) => i !== label)
          : [...prev.interests, label];
        const next = { ...prev, interests: newInterests };
        if (!isBudgetLocked && newInterests.length > 0) {
          next.budgetIndex = suggestBudgetIndex(newInterests);
        }
        return next;
      });
    },
    [isBudgetLocked],
  );

  const handleBudgetClick = useCallback((i) => {
    setIsBudgetLocked(true);
    setForm((prev) => ({ ...prev, budgetIndex: i }));
  }, []);

  const handleBudgetPointerDown = useCallback((e) => {
    if (e.button !== undefined && e.button !== 0) return; // left mouse only
    e.preventDefault();

    const getIdx = (clientX) => {
      const el = budgetDotsRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      return Math.max(
        0,
        Math.min(
          BUDGET_STEPS.length - 1,
          Math.round(ratio * (BUDGET_STEPS.length - 1)),
        ),
      );
    };

    const apply = (clientX) => {
      const idx = getIdx(clientX);
      if (idx === null) return;
      setIsBudgetLocked(true);
      setForm((prev) =>
        prev.budgetIndex === idx ? prev : { ...prev, budgetIndex: idx },
      );
    };

    const startX = e.touches ? e.touches[0].clientX : e.clientX;
    apply(startX);

    const el = budgetDotsRef.current;
    if (el) el.classList.add("cf__budget-dots--dragging");
    document.body.style.userSelect = "none";

    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      apply(clientX);
    };

    const onUp = () => {
      const el = budgetDotsRef.current;
      if (el) el.classList.remove("cf__budget-dots--dragging");
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
  }, []);

  const handleTimeline = useCallback((val) => {
    setForm((prev) => ({ ...prev, timeline: prev.timeline === val ? "" : val }));
  }, []);

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Honeypot check — bots fill hidden fields
      if (form.honeypot) return;

      if (!form.firstName || !form.lastName || !form.email) return;
      if (!recaptchaToken) return;

      // Rate limit check
      if (isRateLimited()) {
        setStatus("rate-limited");
        return;
      }

      setStatus("sending");

      try {
        const budgetValue = BUDGET_STEPS[form.budgetIndex];
        const budgetLabel =
          form.budgetIndex === BUDGET_STEPS.length - 1
            ? `$${budgetValue.toLocaleString()}+`
            : `$${budgetValue.toLocaleString()}`;

        const templateParams = {
          from_name: `${form.firstName} ${form.lastName}`,
          from_email: form.email,
          phone: form.phone || "—",
          company: form.company || "—",
          location:
            form.locationCounty !== "Taiwan"
              ? form.locationCounty
              : form.locationRegion !== "International"
                ? form.locationRegion
                : "—",
          interests: form.interests.length ? form.interests.join(", ") : "—",
          budget: budgetLabel,
          timeline: form.timeline || "—",
          message: form.message || "—",
          "g-recaptcha-response": recaptchaToken,
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          { publicKey: EMAILJS_PUBLIC_KEY },
        );

        recordSubmission();
        setStatus("success");
        setForm(initialForm);
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
      } catch (err) {
        console.error("EmailJS error:", err);
        setStatus("error");
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
      }
    },
    [form, recaptchaToken],
  );

  // ─── Derived ───────────────────────────────────────────────────────────────

  const budgetValue = BUDGET_STEPS[form.budgetIndex];
  const budgetDisplay =
    form.budgetIndex === BUDGET_STEPS.length - 1
      ? `$\u00a0${budgetValue.toLocaleString()}+`
      : `$\u00a0${budgetValue.toLocaleString()}`;

  const toastMessage =
    status === "success"
      ? t('contact.form.successToast')
      : status === "error"
        ? t('contact.form.errorToast')
        : status === "rate-limited"
          ? t('contact.form.rateLimitToast')
          : "";

  const toastType = status === "success" ? "success" : "error";

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="cf">
      {/* ── Toast notification (fixed, outside layout flow) ── */}
      {(PREVIEW_TOAST || (status !== "idle" && status !== "sending")) && (
        <div
          className={`cf__toast cf__toast--${PREVIEW_TOAST ? "success" : toastType}${PREVIEW_TOAST || toastVisible ? " cf__toast--visible" : ""}`}
          role="status"
          aria-live="polite"
        >
          {PREVIEW_TOAST
            ? t('contact.form.successToast')
            : toastMessage}
        </div>
      )}

      <form className="cf__form" onSubmit={handleSubmit} noValidate>
        {/* ── Honeypot (hidden from real users, bots fill it) ── */}
        <div className="cf__honeypot" aria-hidden="true">
          <input
            type="text"
            name="honeypot"
            value={form.honeypot}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* ── Name ── */}
        <div className="cf__row">
          <span className="cf__label">{t('contact.form.nameSection')}</span>
          <div className="cf__fields cf__fields--split">
            <input
              className="cf__input"
              type="text"
              name="firstName"
              placeholder={t('contact.form.firstName')}
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              className="cf__input"
              type="text"
              name="lastName"
              placeholder={t('contact.form.lastName')}
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* ── Company ── */}
        <div className="cf__row">
          <span className="cf__label">{t('contact.form.companySection')}</span>
          <div className="cf__fields">
            <input
              className="cf__input"
              type="text"
              name="company"
              placeholder={t('contact.form.companyPlaceholder')}
              value={form.company}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ── Contact ── */}
        <div className="cf__row">
          <span className="cf__label">{t('contact.form.contactSection')}</span>
          <div className="cf__fields cf__fields--split">
            <input
              className="cf__input"
              type="email"
              name="email"
              placeholder={t('contact.form.email')}
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              className="cf__input"
              type="tel"
              name="phone"
              placeholder={t('contact.form.phone')}
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ── Location ── */}
        <div className="cf__row">
          <span className="cf__label">{t('contact.form.locationSection')}</span>
          <div className="cf__fields cf__fields--split">
            <CustomSelect
              name="locationCounty"
              value={form.locationCounty}
              options={TAIWAN_COUNTIES}
              displayOptions={displayCounties}
              onChange={handleSelectChange}
              disabled={form.locationRegion !== "International"}
            />
            <CustomSelect
              name="locationRegion"
              value={form.locationRegion}
              options={REGIONS}
              displayOptions={displayRegions}
              onChange={handleSelectChange}
              disabled={form.locationCounty !== "Taiwan"}
            />
          </div>
        </div>

        {/* ── Interests ── */}
        <div className="cf__row cf__row--interests">
          <span className="cf__label">{t('contact.form.interestSection')}</span>
          <div className="cf__fields">
            <div className="cf__interest-groups">
              {EN_INTEREST_GROUPS.map(({ group, items }, gi) => {
                const dg = displayGroups[gi];
                return (
                  <div key={group} className="cf__interest-group">
                    <span className="cf__interest-group-label">{dg.group}</span>
                    <div className="cf__interest-items">
                      {items.map((enLabel, ii) => {
                        const checked = form.interests.includes(enLabel);
                        return (
                          <label key={enLabel} className="cf__interest-item">
                            <span
                              className={`cf__radio-ring${checked ? " cf__radio-ring--checked" : ""}`}
                              aria-hidden="true"
                            />
                            <input
                              type="checkbox"
                              className="cf__checkbox-hidden"
                              checked={checked}
                              onChange={() => handleInterest(enLabel)}
                            />
                            <span className="cf__interest-label">{dg.items[ii]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Budget ── */}
        <div className="cf__row cf__row--budget">
          <span className="cf__label">{t('contact.form.budgetSection')}</span>
          <div className="cf__fields">
            <div className="cf__budget-track">
              {/* tier names row */}
              <div className="cf__budget-tier-row">
                {BUDGET_STEPS.map((v, i) => (
                  <span
                    key={`tier-${v}`}
                    className={`cf__budget-tier-cell${i === form.budgetIndex ? " cf__budget-tier-cell--active" : ""}`}
                  >
                    {displayTiers[i]}
                  </span>
                ))}
              </div>
              {/* dots row — ::before line stays at top:10px (half dot-wrap) */}
              <div
                className="cf__budget-dots"
                ref={budgetDotsRef}
                onMouseDown={handleBudgetPointerDown}
                onTouchStart={handleBudgetPointerDown}
              >
                {/* animated fill — width driven by budgetIndex */}
                <span
                  className="cf__budget-fill"
                  style={{
                    width: `${(form.budgetIndex / (BUDGET_STEPS.length - 1)) * 80}%`,
                  }}
                />
                {BUDGET_STEPS.map((v, i) => (
                  <button
                    key={v}
                    type="button"
                    className={`cf__budget-step${i === form.budgetIndex ? " cf__budget-step--active" : ""}`}
                    onClick={() => handleBudgetClick(i)}
                    aria-label={`Budget ${BUDGET_TIERS[i]} ${i === BUDGET_STEPS.length - 1 ? `$${v.toLocaleString()}+` : `$${v.toLocaleString()}`}`}
                  >
                    <span className="cf__budget-dot-wrap">
                      <span className="cf__budget-dot" />
                    </span>
                  </button>
                ))}
              </div>
              {/* price labels row */}
              <div className="cf__budget-price-row">
                {BUDGET_STEPS.map((v, i) => (
                  <span
                    key={`price-${v}`}
                    className={`cf__budget-price-cell${i === form.budgetIndex ? " cf__budget-price-cell--active" : ""}`}
                  >
                    {i === BUDGET_STEPS.length - 1
                      ? `$\u00a0${v.toLocaleString()}+`
                      : `$\u00a0${v.toLocaleString()}`}
                  </span>
                ))}
              </div>
              {/* description line */}
              <p className="cf__budget-desc">
                {displayDescs[form.budgetIndex]}
              </p>
            </div>
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="cf__row cf__row--timeline">
          <span className="cf__label">{t('contact.form.timelineSection')}</span>
          <div className="cf__fields">
            <div className="cf__timeline-grid">
              {EN_TIMELINES.map((enTimeline, i) => (
                <button
                  key={enTimeline}
                  type="button"
                  className={`cf__timeline-btn${form.timeline === enTimeline ? " cf__timeline-btn--active" : ""}`}
                  onClick={() => handleTimeline(enTimeline)}
                >
                  {displayTimelines[i]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Message ── */}
        <div className="cf__row cf__row--message">
          <span className="cf__label">{t('contact.form.detailsSection')}</span>
          <div className="cf__fields">
            <textarea
              className="cf__textarea"
              name="message"
              placeholder={t('contact.form.detailsPlaceholder')}
              value={form.message}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>

        {/* ── Footer: send button + (note, reCAPTCHA) ── */}
        <div className="cf__footer">
          <div className="cf__send-wrap">
            <button
              type="submit"
              className={`cf__send-btn clickable${status === "sending" ? " cf__send-btn--sending" : ""}`}
              disabled={status === "sending" || !recaptchaToken}
              aria-label={t('contact.form.sendBtn')}
            >
              <span className="cf__send-text">
                {status === "sending" ? t('contact.form.sendingBtn') : t('contact.form.sendBtn')}
              </span>
            </button>
          </div>

          <div className="cf__footer-right">
            <p className="cf__note">{t('contact.form.requiredNote')}</p>
            <div className="cf__recaptcha-wrap">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
                onErrored={() => setRecaptchaToken(null)}
              />
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
