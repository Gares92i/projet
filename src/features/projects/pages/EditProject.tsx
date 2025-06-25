import { useParams } from "react-router-dom";
import MainLayout from "@/features/layout/components/MainLayout";
import { ProjectHeader } from "@/features/projects/components/edit/ProjectHeader";
import { GeneralInfoCard } from "@/features/projects/components/edit/GeneralInfoCard";
import { TeamMembersCard } from "@/features/projects/components/edit/TeamMembersCard";
import { ProjectImageCard } from "@/features/projects/components/edit/ProjectImageCard";
import { LoadingState } from "@/features/projects/components/edit/LoadingState";
import { NotFoundState } from "@/features/projects/components/edit/NotFoundState";
import { useEditProject } from "@/features/projects/hooks/useEditProject";

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const {
    isLoading,
    isSaving,
    project,
    teamMembers,
    clients,
    selectedTeamMembers,
    handleSelectTeamMember,
    handleInputChange,
    handleImageUploaded,
    handleSaveProject
  } = useEditProject(id);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (!project) {
    return <NotFoundState />;
  }
  
  return (
    <MainLayout>
      <ProjectHeader 
        id={id as string}
        isSaving={isSaving}
        onSave={handleSaveProject}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GeneralInfoCard 
            project={project}
            clients={clients}
            onInputChange={handleInputChange}
          />
          
          <TeamMembersCard 
            teamMembers={teamMembers}
            selectedTeamMembers={selectedTeamMembers}
            onSelectTeamMember={handleSelectTeamMember}
          />
        </div>
        
        <div>
          <ProjectImageCard 
            imageUrl={project.imageUrl}
            projectName={project.name}
            projectId={project.id}
            onImageUploaded={handleImageUploaded}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default EditProject;
