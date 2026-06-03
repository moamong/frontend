export function formatCurrency(amount: number) {
  return `${new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
  }).format(amount)}원`;
}

export function formatNumberWithCommas(value: number | string) {
  const digits = String(value).replace(/,/g, "").replace(/[^\d]/g, "");

  if (!digits) {
    return "";
  }

  return new Intl.NumberFormat("ko-KR").format(Number(digits));
}

export function parseFormattedNumber(value: string) {
  const digits = value.replace(/,/g, "").replace(/[^\d]/g, "");

  if (!digits) {
    return 0;
  }

  return Number(digits);
}
