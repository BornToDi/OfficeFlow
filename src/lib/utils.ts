import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Converts a number to its word representation.
export function numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];

    if (num === 0) return 'Zero';

    const numStr = num.toString();
    const [integerPart, decimalPart] = numStr.split('.');

    function convert(n: number): string {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
        
        let word = '';
        let i = 0;
        while (n > 0) {
            if (n % 1000 !== 0) {
                word = convert(n % 1000) + ' ' + thousands[i] + ' ' + word;
            }
            n = Math.floor(n / 1000);
            i++;
        }
        return word.trim();
    }

    let words = convert(parseInt(integerPart, 10)) + ' Taka';

    if (decimalPart) {
        const cents = parseInt(decimalPart.slice(0, 2), 10);
        if (cents > 0) {
            words += ' and ' + convert(cents) + ' Poisha';
        }
    }

    return words;
}
