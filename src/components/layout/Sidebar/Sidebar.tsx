"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, PlusCircle, Settings } from "lucide-react";
import styles from "./Sidebar.module.scss";

export default function Sidebar() {
  const pathname = usePathname();

  const getNavItemClass = (path: string) => {
    return `${styles.navItem} ${pathname === path ? styles.active : ""}`;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoMark} />
        <span className={styles.logoText}>Atelier</span>
      </div>

      <nav className={styles.nav}>
        <Link href="/" className={getNavItemClass("/")}>
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </Link>
        <Link href="/clients" className={getNavItemClass("/clients")}>
          <Users size={20} />
          <span>Clients</span>
        </Link>
        <Link href="/tracker" className={getNavItemClass("/tracker")}>
          <FileText size={20} />
          <span>Invoices</span>
        </Link>
        <Link href="/create" className={getNavItemClass("/create")}>
          <PlusCircle size={20} />
          <span>New Invoice</span>
        </Link>
      </nav>

      <div className={styles.bottomNav}>
        <Link 
          href="/settings"
          className={getNavItemClass("/settings")} 
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
