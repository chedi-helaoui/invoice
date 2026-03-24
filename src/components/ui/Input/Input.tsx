import React from 'react';
import styles from './Input.module.scss';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  const generatedId = id || React.useId();
  
  return (
    <div className={clsx(styles.inputWrapper, className)}>
      {label && <label htmlFor={generatedId} className={styles.label}>{label}</label>}
      <input 
        id={generatedId}
        className={clsx(styles.input, error && styles.hasError)} 
        {...props} 
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
