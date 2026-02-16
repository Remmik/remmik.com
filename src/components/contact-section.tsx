import { ContactForm } from "./contact-form";
import styles from "./contact-section.module.css";

export function ContactSection() {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.content}>
        <h2 className={styles.heading}>Get in touch</h2>
        <ContactForm />
      </div>
      <footer className={styles.footer}>
        <p>&copy; Remmik {new Date().getFullYear()}</p>
      </footer>
    </section>
  );
}
