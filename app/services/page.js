import ThemePage from "@/components/ThemePage";
import ServicesTabs from "@/components/ServicesTabs";
import styles from "./services.module.css";

export const metadata = { title: "Services | Linoor" };

export default function ServicesPage() {
  return (
    <div className={`${styles.servicesPage} services-page`}>
      <ThemePage slug="services" />
      <ServicesTabs />
    </div>
  );
}
