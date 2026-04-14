import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const propertyTypeLabels: Record<string, string> = {
  location: 'Location',
  location_meublee: 'Location meublée',
  vente: 'Vente',
};

export const propertyCategoryLabels: Record<string, string> = {
  appartement: 'Appartement',
  terrain: 'Terrain',
  studio: 'Studio',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  villa: 'Villa',
  bureau: 'Bureau',
};

export const propertyStatusLabels: Record<string, string> = {
  disponible: 'Disponible',
  loué: 'Loué',
  vendu: 'Vendu',
  en_cours: 'En cours',
  vefa: '',
};

export const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editeur: 'Éditeur',
};
