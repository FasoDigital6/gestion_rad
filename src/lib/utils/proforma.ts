export function generateNumeroDA(): string {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 900 + 100);

  return `DA${year}${month}${day}${random}`;
}
