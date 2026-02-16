import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <h1 className={styles.title}>Remmik</h1>
        <p className={styles.info}>
          CVR 39483882
          <span className={styles.separator}>&bull;</span>
          <a href="tel:+4531585080">+45 31 58 50 80</a>
        </p>
      </div>
      <a href="#contact" className={styles.scrollCue} aria-label="Scroll to contact">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 10l5 5 5-5" />
        </svg>
      </a>
    </section>
  );
}
