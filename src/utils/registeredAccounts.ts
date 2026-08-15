// Utility for managing registered account emails and phone numbers for duplicate validation & redirect flows

// Demo accounts that exist by default for preview sign-in
const DEFAULT_EMAILS = [
  'demo@taskflow.ai',
];

const DEFAULT_PHONES = [
  '+1 555 019 0000',
];

const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const getRegisteredEmails = (): string[] => {
  const list = [...DEFAULT_EMAILS];
  try {
    const saved = localStorage.getItem('tf_registered_emails');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        list.push(...parsed.map((e: string) => String(e).toLowerCase().trim()));
      }
    }
  } catch (e) {
    console.warn('[Registered Accounts] Email storage read warning:', e);
  }
  return Array.from(new Set(list.filter(Boolean)));
};

export const isEmailRegistered = (email: string): boolean => {
  if (!email || !email.trim()) return false;
  const clean = email.trim().toLowerCase();
  const registered = getRegisteredEmails();
  return registered.includes(clean);
};

export const saveRegisteredEmail = (emailToSave: string): void => {
  if (!emailToSave || !emailToSave.trim()) return;
  const clean = emailToSave.trim().toLowerCase();
  try {
    const current = getRegisteredEmails();
    if (!current.includes(clean)) {
      const updated = [...current, clean];
      localStorage.setItem('tf_registered_emails', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('[Registered Accounts] Email storage write warning:', e);
  }
};

export const getRegisteredPhones = (): string[] => {
  const list = [...DEFAULT_PHONES];
  try {
    const saved = localStorage.getItem('tf_registered_phones');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        list.push(...parsed.map((p: string) => String(p).trim()));
      }
    }
  } catch (e) {
    console.warn('[Registered Accounts] Phone storage read warning:', e);
  }
  return Array.from(new Set(list.filter(Boolean)));
};

export const isPhoneRegistered = (phone: string): boolean => {
  if (!phone || !phone.trim()) return false;
  const rawDigits = normalizePhone(phone);
  if (rawDigits.length < 8) return false;

  const registered = getRegisteredPhones();
  return registered.some((saved) => {
    const savedDigits = normalizePhone(saved);
    if (!savedDigits || savedDigits.length < 8) return false;
    // Exact digit match
    if (rawDigits === savedDigits) return true;
    // Match 10-digit national number suffix if both have >= 10 digits
    if (rawDigits.length >= 10 && savedDigits.length >= 10) {
      const rawLast10 = rawDigits.slice(-10);
      const savedLast10 = savedDigits.slice(-10);
      return rawLast10 === savedLast10;
    }
    return false;
  });
};

export const saveRegisteredPhone = (phoneToSave: string): void => {
  if (!phoneToSave || !phoneToSave.trim()) return;
  const clean = phoneToSave.trim();
  try {
    const current = getRegisteredPhones();
    if (!isPhoneRegistered(clean)) {
      const updated = [...current, clean];
      localStorage.setItem('tf_registered_phones', JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('[Registered Accounts] Phone storage write warning:', e);
  }
};
