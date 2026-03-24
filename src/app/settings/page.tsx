"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.scss';
import { Briefcase, CreditCard, Bell, Shield, AlertTriangle, Plus } from 'lucide-react';
import { getSettingsAction, saveSettingsAction, type UserSettings } from '@/app/actions/db';
import { changePasswordAction } from '@/app/auth/actions';

const DEFAULT_SETTINGS: UserSettings = {
  company_name: '',
  vat_number: '',
  business_address: '',
  logo_url: null,
  default_currency: 'USD',
  default_tax_rate: 0,
  payment_terms: 'Net 30',
  notify_overdue: true,
  notify_paid: true,
  notify_weekly_summary: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    getSettingsAction().then((result) => {
      if (result.success && result.settings) {
        setSettings(result.settings);
      }
    });
  }, []);

  function set<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    const result = await saveSettingsAction(settings);
    setSaving(false);
    setSaveMsg(result.success ? 'Changes saved.' : (result.error ?? 'Failed to save.'));
    setTimeout(() => setSaveMsg(''), 3000);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwSaving(true);
    setPwMsg('');
    const formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);
    const result = await changePasswordAction(formData);
    setPwSaving(false);
    if (result.success) {
      setPwMsg('Password update email sent. Check your inbox.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } else {
      setPwMsg(result.error ?? 'Failed to update password.');
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>System Configuration</h1>
          <p className={styles.subtitle}>Manage your professional identity and financial logic.</p>
        </div>
        <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : saveMsg || 'Save Changes'}
        </button>
      </header>

      <div className={styles.grid}>
        {/* Business Profile */}
        <section className={`${styles.section} ${styles.col8}`}>
          <div className={styles.sectionHeader}>
            <Briefcase size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Business Profile</h3>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroupSpan2Md1}>
              <label>Company Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => set('company_name', e.target.value)}
              />
            </div>
            <div className={styles.formGroupSpan2Md1}>
              <label>VAT Number</label>
              <input
                type="text"
                value={settings.vat_number}
                onChange={(e) => set('vat_number', e.target.value)}
                className={styles.monoInput}
              />
            </div>
            <div className={styles.formGroupSpan2}>
              <label>Business Address</label>
              <textarea
                rows={3}
                value={settings.business_address}
                onChange={(e) => set('business_address', e.target.value)}
              />
            </div>
            <div className={styles.formGroupSpan2}>
              <label className={styles.logoLabel}>Company Logo</label>
              <div className={styles.logoUploadContainer}>
                <div className={styles.logoPreview}>
                  {settings.logo_url
                    ? <img src={settings.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Plus size={32} className={styles.addIcon} />
                  }
                </div>
                <div className={styles.logoInfo}>
                  <button type="button" className={styles.uploadButton}>Upload New</button>
                  <p>SVG, PNG, or JPG (max. 2MB).<br />Recommended: 400x400px</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Logic */}
        <section className={`${styles.section} ${styles.col4}`}>
          <div className={styles.sectionHeader}>
            <CreditCard size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Financial Logic</h3>
          </div>
          <div className={styles.financialForm}>
            <div className={styles.formGroup}>
              <label>Default Currency</label>
              <select
                value={settings.default_currency}
                onChange={(e) => set('default_currency', e.target.value)}
              >
                <option value="USD">USD - United States Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Default Tax Rate</label>
              <div className={styles.inputWithSuffix}>
                <input
                  type="text"
                  value={settings.default_tax_rate}
                  onChange={(e) => set('default_tax_rate', parseFloat(e.target.value) || 0)}
                  className={styles.monoInput}
                />
                <span className={styles.suffix}>%</span>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Payment Terms</label>
              <select
                value={settings.payment_terms}
                onChange={(e) => set('payment_terms', e.target.value)}
              >
                <option value="Net 30">Net 30</option>
                <option value="Net 15">Net 15</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
          </div>
          <div className={styles.sectionFooter}>
            <p>Changes here will apply to all future invoices by default.</p>
          </div>
        </section>

        {/* Communications */}
        <section className={`${styles.section} ${styles.col6}`}>
          <div className={styles.sectionHeader}>
            <Bell size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Communications</h3>
          </div>
          <div className={styles.optionsList}>
            <div className={styles.optionItem}>
              <div>
                <p className={styles.optionTitle}>Invoice Overdue</p>
                <p className={styles.optionDesc}>Alert me when a payment window expires.</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notify_overdue}
                  onChange={(e) => set('notify_overdue', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.optionItem}>
              <div>
                <p className={styles.optionTitle}>Invoice Paid</p>
                <p className={styles.optionDesc}>Instant confirmation of client remittance.</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notify_paid}
                  onChange={(e) => set('notify_paid', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.optionItem}>
              <div>
                <p className={styles.optionTitle}>Weekly Financial Summary</p>
                <p className={styles.optionDesc}>Executive digest of ledger activity.</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={settings.notify_weekly_summary}
                  onChange={(e) => set('notify_weekly_summary', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </section>

        {/* Security Vault */}
        <section className={`${styles.section} ${styles.col6}`}>
          <div className={styles.sectionHeader}>
            <Shield size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Security Vault</h3>
          </div>
          <div className={styles.securityForm}>
            <div className={styles.twoFactorBanner}>
              <div className={styles.twoFactorContent}>
                <div>
                  <p className={styles.twoFactorTitle}>Two-Factor Authentication</p>
                  <p className={styles.twoFactorDesc}>Fortify your account access protocols.</p>
                </div>
                <label className={styles.switchAlt}>
                  <input type="checkbox" />
                  <span className={styles.slider}></span>
                </label>
              </div>
              <Shield size={120} className={styles.bgIcon} />
            </div>

            <form className={styles.credentialsForm} onSubmit={handleChangePassword}>
              <p className={styles.credentialsLabel}>Change Credentials</p>
              <div className={styles.credentialsGrid}>
                <div className={styles.colFull}>
                  <input
                    type="password"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              {pwMsg && (
                <p style={{ fontSize: '0.8rem', color: pwMsg.includes('sent') ? '#4ade80' : '#f87171', margin: '0 0 0.5rem' }}>
                  {pwMsg}
                </p>
              )}
              <button type="submit" className={styles.textLink} disabled={pwSaving}>
                {pwSaving ? 'Updating…' : 'Update Vault Entry →'}
              </button>
            </form>
          </div>
        </section>

        {/* Dangerous Waters */}
        <section className={styles.dangerSection}>
          <div className={styles.dangerContent}>
            <div className={styles.dangerIconWrapper}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className={styles.dangerTitle}>Dangerous Waters</h4>
              <p className={styles.dangerDesc}>Permanently deactivate your ledger and erase all fiscal history.</p>
            </div>
          </div>
          <button className={styles.dangerButton} onClick={() => alert('Account termination requires contacting support.')}>
            Terminate Account
          </button>
        </section>
      </div>
    </div>
  );
}
