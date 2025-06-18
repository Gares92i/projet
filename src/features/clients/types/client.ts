/**
 * Types pour la gestion des clients
 */

/**
 * Interface représentant un client dans l'application
 */
export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  projectIds: string[]; // IDs des projets liés à ce client
}

/**
 * Interface pour la création d'un nouveau client (sans ID)
 */
export type ClientCreateInput = Omit<ClientData, "id" | "projectIds"> & {
  projectIds?: string[];
};

/**
 * Interface pour la mise à jour d'un client existant
 */
export type ClientUpdateInput = Partial<Omit<ClientData, "id">>;