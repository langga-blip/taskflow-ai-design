// Utility for managing registered account emails and phone numbers for duplicate validation & redirect flows

const DEFAULT_EMAILS = [
  'alex@apexscale.com',
  'alex.rivera@gmail.com',
  'demo@taskflow.ai',
  'mummom692@gmail.com',
];

const DEFAULT_PHONES = [
  '+1 801 234 5678',
  '+1 555 019 2834',
  '+234 801 234 5678',
  '+44 7911 123456',
  '8012345678',
  '5550192834',
];

const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const getRegisteredEmails = (currentUserEmail?: string): string[] => {
  const list = [...DEFAULT_EMAILS];
  if (currentUserEmail) {
    list.push(currentUserEmail.toLowerCase().trim());
  }
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
  return Array.from(new Set(list));
};

export const isEmailRegistered = (email: string, currentUserEmail?: string): boolean => {
  if (!email || !email.trim()) return false;
  const clean = email.trim().toLowerCase();
  const registered = getRegisteredEmails(currentUserEmail);
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

export const getRegisteredPhones = (currentPhone?: string): string[] => {
  const list = [...DEFAULT_PHONES];
  if (currentPhone) {
    list.push(currentPhone.trim());
  }
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
  return Array.from(new Set(list));
};

export const isPhoneRegistered = (phone: string, currentPhone?: string): boolean => {
  if (!phone || !phone.trim()) return false;
  const rawDigits = normalizePhone(phone);
  if (rawDigits.length < 6) return false;

  const registered = getRegisteredPhones(currentPhone);
  return registered.some((saved) => {
    const savedDigits = normalizePhone(saved);
    if (!savedDigits) return false;
    // Exact match or suffix match (e.g. 8012345678 matches +1 801 234 5678)
    return (
      rawDigits === savedDigits ||
      (rawDigits.length >= 7 && savedDigits.endsWith(rawDigits)) ||
      (savedDigits.length >= 7 && rawDigits.endsWith(savedDigits))
    );
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
