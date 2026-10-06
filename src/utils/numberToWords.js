/**
 * Converts a number to words in the Indian numbering system (Lakhs, Crores)
 * e.g., 2955 -> "Two Thousand Nine Hundred Fifty-Five Rupees Only"
 * e.g., 145020.50 -> "One Lakh Forty-Five Thousand Twenty Rupees and Fifty Paise Only"
 */
export function numberToWordsIndian(num) {
  if (num === null || num === undefined || isNaN(num)) return 'Zero Rupees Only';

  const n = Math.abs(Number(num));
  if (n === 0) return 'Zero Rupees Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(val) {
    if (val < 20) return units[val];
    const unitPart = val % 10;
    return tens[Math.floor(val / 10)] + (unitPart > 0 ? ' ' + units[unitPart] : '');
  }

  function convertThreeDigits(val) {
    let str = '';
    const hundred = Math.floor(val / 100);
    const remainder = val % 100;
    if (hundred > 0) {
      str += units[hundred] + ' Hundred';
      if (remainder > 0) str += ' ';
    }
    if (remainder > 0) {
      str += convertTwoDigits(remainder);
    }
    return str;
  }

  const integerPart = Math.floor(n);
  const decimalPart = Math.round((n - integerPart) * 100);

  let result = '';

  // Indian Numbering grouping:
  // Crores (digits beyond 7)
  // Lakhs (next 2 digits)
  // Thousands (next 2 digits)
  // Hundreds / Units (last 3 digits)

  let remaining = integerPart;

  const crores = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakhs = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousands = Math.floor(remaining / 1000);
  remaining %= 1000;

  const hundredsAndBelow = remaining;

  if (crores > 0) {
    result += convertThreeDigits(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    result += convertTwoDigits(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    result += convertTwoDigits(thousands) + ' Thousand ';
  }
  if (hundredsAndBelow > 0) {
    result += convertThreeDigits(hundredsAndBelow);
  }

  result = result.trim();
  if (!result) {
    result = 'Zero';
  }

  if (decimalPart > 0) {
    result += ' rupees and ' + convertTwoDigits(decimalPart) + ' paise only';
  } else {
    result += ' rupees only';
  }

  return result;
}
