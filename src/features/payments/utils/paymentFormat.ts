export function formatRupees(value: number): string {
  const negative = value < 0;
  const fixed = Math.abs(value).toFixed(2);
  const [whole = '0', fraction = '00'] = fixed.split('.');

  let grouped = whole;
  if (whole.length > 3) {
    const lastThree = whole.slice(-3);
    const rest = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    grouped = `${rest},${lastThree}`;
  }

  return `${negative ? '-' : ''}₹${grouped}.${fraction}`;
}
