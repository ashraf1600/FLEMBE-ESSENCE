/**
 * Bangladeshi Mobile Phone Number Utilities
 * Validates, normalizes, and detects operators for all BD mobile carriers.
 */

export interface PhoneValidationResult {
  raw: string;
  cleaned: string;
  isValid: boolean;
  operatorName: string | null;
  errorMessage: string | null;
  digitsCount: number;
}

const BD_OPERATORS: Record<string, string> = {
  '017': 'Grameenphone',
  '013': 'Skitto / GP',
  '018': 'Robi',
  '016': 'Airtel',
  '019': 'Banglalink',
  '014': 'Banglalink',
  '015': 'Teletalk',
};

/**
 * Normalizes input by removing spaces, dashes, and converting +880 or 880 to 0.
 */
export function normalizeBDPhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.trim().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+880')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('880')) {
    cleaned = '0' + cleaned.slice(3);
  }
  // Strip any remaining non-digit characters
  return cleaned.replace(/\D/g, '');
}

/**
 * Validates a Bangladeshi mobile phone number with detailed feedback.
 */
export function validateBDPhone(phone: string): PhoneValidationResult {
  const cleaned = normalizeBDPhone(phone);
  const digitsCount = cleaned.length;

  if (!cleaned) {
    return {
      raw: phone,
      cleaned: '',
      isValid: false,
      operatorName: null,
      errorMessage: 'Phone number is required for Cash on Delivery.',
      digitsCount: 0,
    };
  }

  const prefix = cleaned.slice(0, 3);
  const operatorName = prefix.length >= 3 ? BD_OPERATORS[prefix] || null : null;

  if (cleaned.length < 3) {
    return {
      raw: phone,
      cleaned,
      isValid: false,
      operatorName: null,
      errorMessage: 'Start with 013, 014, 015, 016, 017, 018, or 019.',
      digitsCount,
    };
  }

  if (!operatorName) {
    return {
      raw: phone,
      cleaned,
      isValid: false,
      operatorName: null,
      errorMessage: `Prefix "${prefix}" is not a recognized BD mobile operator.`,
      digitsCount,
    };
  }

  if (digitsCount < 11) {
    return {
      raw: phone,
      cleaned,
      isValid: false,
      operatorName,
      errorMessage: `${digitsCount} of 11 digits entered.`,
      digitsCount,
    };
  }

  if (digitsCount > 11) {
    return {
      raw: phone,
      cleaned,
      isValid: false,
      operatorName,
      errorMessage: `Too many digits (${digitsCount}). BD numbers must be 11 digits.`,
      digitsCount,
    };
  }

  return {
    raw: phone,
    cleaned,
    isValid: true,
    operatorName,
    errorMessage: null,
    digitsCount: 11,
  };
}
