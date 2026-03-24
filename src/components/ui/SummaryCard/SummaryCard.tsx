import React from 'react';
import styles from './SummaryCard.module.scss';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  trend?: string;
  positive?: boolean;
  Icon: LucideIcon;
}

export default function SummaryCard({ title, value, trend, positive, Icon }: SummaryCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.glow} />
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <div className={styles.iconWrapper}>
          <Icon size={18} />
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.value}>{value}</h3>
        {trend && (
          <span className={clsx(styles.trend, positive ? styles.positive : styles.negative)}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
