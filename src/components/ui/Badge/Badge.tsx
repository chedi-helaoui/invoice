import React from 'react';
import styles from './Badge.module.scss';
import clsx from 'clsx';

interface BadgeProps {
  status: 'paid' | 'overdue' | 'pending' | 'draft';
  children: React.ReactNode;
}

export default function Badge({ status, children }: BadgeProps) {
  return (
    <span className={clsx(styles.badge, styles[status])}>
      {children}
    </span>
  );
}
