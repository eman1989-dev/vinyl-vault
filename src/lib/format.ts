let currentLocale = "es-CR";

export const setLocale = (locale: string) => {
  currentLocale = locale;
};

export const formatCOP = (n: number) => {
  const formattedNumber = new Intl.NumberFormat(currentLocale, {
    maximumFractionDigits: 0,
  }).format(n);
  return `₡${formattedNumber}`;
};

export const formatDate = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(currentLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
