import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonctions de validation
export const validators = {
  // Validation d'email
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validation de téléphone français
  phone: (phone: string): boolean => {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Validation de nom (au moins 2 caractères)
  name: (name: string): boolean => {
    return name.trim().length >= 2;
  },

  // Validation d'adresse (au moins 10 caractères)
  address: (address: string): boolean => {
    return address.trim().length >= 10;
  },

  // Validation de société (au moins 2 caractères)
  company: (company: string): boolean => {
    return company.trim().length >= 2;
  },

  // Validation de rôle (doit être dans la liste des rôles valides)
  role: (role: string, validRoles: string[]): boolean => {
    return validRoles.includes(role);
  },

  // Validation de statut
  status: (status: string, validStatuses: string[]): boolean => {
    return validStatuses.includes(status);
  }
};

// Messages d'erreur de validation
export const validationMessages = {
  email: "Veuillez entrer une adresse email valide",
  phone: "Veuillez entrer un numéro de téléphone français valide",
  name: "Le nom doit contenir au moins 2 caractères",
  address: "L'adresse doit contenir au moins 10 caractères",
  company: "Le nom de la société doit contenir au moins 2 caractères",
  required: "Ce champ est obligatoire",
  minLength: (min: number) => `Ce champ doit contenir au moins ${min} caractères`,
  maxLength: (max: number) => `Ce champ ne peut pas dépasser ${max} caractères`
};

// Fonction utilitaire pour formater un numéro de téléphone
export const formatPhoneNumber = (phone: string): string => {
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Formater selon le format français
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return phone;
};

// Fonction utilitaire pour formater un nom (première lettre en majuscule)
export const formatName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Fonction utilitaire pour générer des initiales
export const getInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return "??";
  
  const name = `${firstName || ""} ${lastName || ""}`.trim();
  if (!name) return "??";
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Fonction utilitaire pour obtenir le nom complet
export const getFullName = (firstName?: string, lastName?: string): string => {
  return `${firstName || ""} ${lastName || ""}`.trim() || "Nom inconnu";
};
