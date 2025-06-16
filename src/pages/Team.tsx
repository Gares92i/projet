import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { TeamMemberDisplay } from "@/components/team/TeamMemberDisplay";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Grid, List, Filter } from "lucide-react"; // Ajout des icônes Grid et List
import { useTeamMemberManager } from "@/hooks/useTeamMemberManager";
import { TeamMemberDialogs } from "@/components/team/TeamMemberDialogs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; // Ajout de ToggleGroup

const TeamPage = () => {
  // Utiliser useTeamMemberManager pour gérer l'état
  const {
    membersData: members,
    isLoading,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredMembers,
    openAddMemberSheet,
    handleEditMember,
    handleDeleteMember,
    isAddMemberSheetOpen,
    setIsAddMemberSheetOpen,
    isEditMemberSheetOpen,
    setIsEditMemberSheetOpen,
    confirmDeleteDialogOpen,
    setConfirmDeleteDialogOpen,
    currentMember,
    teamId,
    handleCreateMember,
    handleUpdateMember,
    confirmDeleteMember
  } = useTeamMemberManager();

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Équipe</h1>
            <Button onClick={openAddMemberSheet}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter un membre
            </Button>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher un membre..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 items-center">
              {/* Filtre par rôle */}
              <Select value={activeFilter} onValueChange={setActiveFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="architecte">Architecte</SelectItem>
                  <SelectItem value="chef_de_projet">Chef de projet</SelectItem>
                  <SelectItem value="ingenieur">Ingénieur</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="entreprise">Entreprise</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                  <SelectItem value="active">Actifs uniquement</SelectItem>
                  <SelectItem value="inactive">Inactifs uniquement</SelectItem>
                </SelectContent>
              </Select>

              {/* Boutons vue grille/liste avec icônes */}
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
                <ToggleGroupItem value="grid" aria-label="Vue grille" title="Vue grille">
                  <Grid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Vue liste" title="Vue liste">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Affichage des membres (liste ou grille) */}
          <TeamMemberDisplay
            members={filteredMembers}
            isLoading={isLoading}
            viewMode={viewMode}
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
          />
        </div>
      </div>

      {/* Modales et dialogues */}
      <TeamMemberDialogs
        isAddMemberSheetOpen={isAddMemberSheetOpen}
        setIsAddMemberSheetOpen={setIsAddMemberSheetOpen}
        isEditMemberSheetOpen={isEditMemberSheetOpen}
        setIsEditMemberSheetOpen={setIsEditMemberSheetOpen}
        confirmDeleteDialogOpen={confirmDeleteDialogOpen}
        setConfirmDeleteDialogOpen={setConfirmDeleteDialogOpen}
        currentMember={currentMember}
        teamId={teamId}
        handleCreateMember={handleCreateMember}
        handleUpdateMember={handleUpdateMember}
        confirmDeleteMember={confirmDeleteMember}
      />
    </MainLayout>
  );
};

export default TeamPage;
