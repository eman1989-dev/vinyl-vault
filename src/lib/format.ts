export const formatCOP = (n: number) => {
  const formattedNumber = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(n);
  return `₡${formattedNumber}`;
};

export const formatDate = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
