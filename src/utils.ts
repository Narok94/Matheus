// --- CRYPTO UTILITY ---
// Hashes a string using the SHA-256 algorithm.
export async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);                    
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// --- FORMATTING UTILITIES ---
export const capitalizeWords = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatDocument = (value: string): string => {
  if (!value) return '';
  const onlyDigits = value.replace(/\D/g, '');

  if (onlyDigits.length <= 11) {
    return onlyDigits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);
  }

  return onlyDigits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .slice(0, 18);
};

export const formatPhone = (value: string): string => {
    if (!value) return '';
    const onlyDigits = value.replace(/\D/g, '');
    return onlyDigits.slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(onlyDigits.length === 11 ? /(\d{5})(\d)/ : /(\d{4})(\d)/, '$1-$2');
};


// --- EXCEL EXPORT UTILITY ---
// Helper to auto-adjust column widths in an Excel worksheet
export const setWorksheetColumns = (worksheet: any, data: any[]) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const colWidths = headers.map(header => {
        const maxWidth = Math.max(
            header.length,
            ...data.map(row => String(row[header] || '').length)
        );
        return { wch: maxWidth + 2 }; // +2 for padding
    });
    worksheet['!cols'] = colWidths;
};

// --- DATE UTILITY ---
// Parses a 'YYYY-MM-DD' string as a local date, avoiding timezone shifts.
export const parseLocalDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  // Check for 'YYYY-MM-DD' format specifically to avoid timezone issues.
  // new Date('2025-11-20') can be interpreted as UTC midnight.
  // new Date(2025, 10, 20) is interpreted in the local timezone's midnight.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  // For other formats (like full ISO strings), the default constructor is usually fine.
  return new Date(dateString);
};

// Formats a local Date object into a 'YYYY-MM-DD' string.
export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};