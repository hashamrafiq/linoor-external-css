import ThemePage from "@/components/ThemePage";
import ContactForm from "@/components/ContactForm";
import "./contact.css";

export const metadata = { title: "Contact | Linoor" };

export default function ContactPage() {
  return <><ThemePage slug="contact" /><ContactForm /></>;
}
