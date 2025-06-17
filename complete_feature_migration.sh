#!/bin/bash
# Finaliser la migration feature-first

set -e  # Arrêter en cas d'erreur

# Fonction pour créer le répertoire si nécessaire et copier le fichier
copy_file() {
  src=$1
  dest=$2
  mkdir -p $(dirname "$dest")
  if [ -f "$src" ]; then
    cp "$src" "$dest"
    echo "✅ Copié: $src -> $dest"
  else
    echo "⚠️ Fichier source non trouvé: $src"
  fi
}

echo "🔄 Migration des composants/services/hooks restants vers l'architecture feature-first..."

## FEATURE: AUTH
echo "🔐 Migration de la feature AUTH..."
copy_file "src/components/auth/LoginForm.tsx" "src/features/auth/components/LoginForm.tsx"
copy_file "src/components/auth/SignupForm.tsx" "src/features/auth/components/SignupForm.tsx"
copy_file "src/components/auth/AuthFooter.tsx" "src/features/auth/components/AuthFooter.tsx"
copy_file "src/components/auth/AiHelper.tsx" "src/features/auth/components/AiHelper.tsx"
copy_file "src/components/guards/AuthGuard.tsx" "src/features/auth/components/AuthGuard.tsx"
copy_file "src/components/guards/GuestGuard.tsx" "src/features/auth/components/GuestGuard.tsx"
copy_file "src/services/authService.ts" "src/features/auth/services/authService.ts"
copy_file "src/hooks/useAuthProvider.ts" "src/features/auth/hooks/useAuthProvider.ts"
copy_file "src/types/auth.ts" "src/features/auth/types/auth.ts"
copy_file "src/schemas/authSchemas.ts" "src/features/auth/schemas/authSchemas.ts"
copy_file "src/pages/Auth.tsx" "src/features/auth/pages/Auth.tsx"

## FEATURE: CHAT
echo "💬 Migration de la feature CHAT..."
copy_file "src/components/chat/ChatContainer.tsx" "src/features/chat/components/ChatContainer.tsx"
copy_file "src/components/chat/ChatHeader.tsx" "src/features/chat/components/ChatHeader.tsx"
copy_file "src/components/chat/ChatMessages.tsx" "src/features/chat/components/ChatMessages.tsx"
copy_file "src/components/chat/ChatSidebar.tsx" "src/features/chat/components/ChatSidebar.tsx"
copy_file "src/components/chat/ChatSidebarHeader.tsx" "src/features/chat/components/ChatSidebarHeader.tsx"
copy_file "src/components/chat/ConversationItem.tsx" "src/features/chat/components/ConversationItem.tsx"
copy_file "src/components/chat/ConversationList.tsx" "src/features/chat/components/ConversationList.tsx"
copy_file "src/components/chat/EmptyConversation.tsx" "src/features/chat/components/EmptyConversation.tsx"
copy_file "src/components/chat/MessageBubble.tsx" "src/features/chat/components/MessageBubble.tsx"
copy_file "src/components/chat/MessageInput.tsx" "src/features/chat/components/MessageInput.tsx"
copy_file "src/components/chat/MessageList.tsx" "src/features/chat/components/MessageList.tsx"
copy_file "src/components/chat/NewConversationDialog.tsx" "src/features/chat/components/NewConversationDialog.tsx"
copy_file "src/components/chat/PrivateIndicator.tsx" "src/features/chat/components/PrivateIndicator.tsx"
copy_file "src/components/chat/SearchInput.tsx" "src/features/chat/components/SearchInput.tsx"

copy_file "src/hooks/chat/useDemoMessages.ts" "src/features/chat/hooks/useDemoMessages.ts"
copy_file "src/hooks/chat/useMessageSubscription.ts" "src/features/chat/hooks/useMessageSubscription.ts"
copy_file "src/hooks/chat/useRealMessages.ts" "src/features/chat/hooks/useRealMessages.ts"
copy_file "src/hooks/useConversationMessages.ts" "src/features/chat/hooks/useConversationMessages.ts"

copy_file "src/services/chat/conversationService.ts" "src/features/chat/services/conversationService.ts"
copy_file "src/services/chat/createConversationService.ts" "src/features/chat/services/createConversationService.ts"
copy_file "src/services/chat/demoDataService.ts" "src/features/chat/services/demoDataService.ts"
copy_file "src/services/chat/getConversationService.ts" "src/features/chat/services/getConversationService.ts"
copy_file "src/services/chat/getConversationsService.ts" "src/features/chat/services/getConversationsService.ts"
copy_file "src/services/chat/messageService.ts" "src/features/chat/services/messageService.ts"
copy_file "src/services/chat/index.ts" "src/features/chat/services/index.ts"

copy_file "src/types/chat.ts" "src/features/chat/types/chat.ts"
copy_file "src/pages/Chat.tsx" "src/features/chat/pages/Chat.tsx"

## FEATURE: TASKS
echo "📋 Migration de la feature TASKS..."
copy_file "src/components/TaskList.tsx" "src/features/tasks/components/TaskList.tsx"
copy_file "src/components/tasks/EditTaskSheet.tsx" "src/features/tasks/components/EditTaskSheet.tsx"
copy_file "src/components/tasks/NewTaskSheet.tsx" "src/features/tasks/components/NewTaskSheet.tsx"
copy_file "src/components/tasks/TaskFilters.tsx" "src/features/tasks/components/TaskFilters.tsx"
copy_file "src/components/tasks/TaskStats.tsx" "src/features/tasks/components/TaskStats.tsx"
copy_file "src/components/services/taskService.ts" "src/features/tasks/services/taskService.ts"
copy_file "src/types/taskTypes.ts" "src/features/tasks/types/taskTypes.ts"
copy_file "src/pages/Tasks.tsx" "src/features/tasks/pages/Tasks.tsx"

## FEATURE: CALENDAR
echo "📅 Migration de la feature CALENDAR..."
copy_file "src/pages/Calendar.tsx" "src/features/calendar/pages/Calendar.tsx"

## FEATURE: RESOURCES
echo "📚 Migration de la feature RESOURCES..."
copy_file "src/components/resources/LotManager.tsx" "src/features/resources/components/LotManager.tsx"
copy_file "src/components/resources/ResourceCategories.tsx" "src/features/resources/components/ResourceCategories.tsx"
copy_file "src/components/resources/ResourceForm.tsx" "src/features/resources/components/ResourceForm.tsx"
copy_file "src/components/resources/ResourceList.tsx" "src/features/resources/components/ResourceList.tsx"
copy_file "src/components/resources/ResourceSearchBar.tsx" "src/features/resources/components/ResourceSearchBar.tsx"
copy_file "src/components/resources/data.ts" "src/features/resources/data/mockData.ts"
copy_file "src/components/resources/types.ts" "src/features/resources/types/resources.ts"
copy_file "src/pages/Resources.tsx" "src/features/resources/pages/Resources.tsx"

## FEATURE: SETTINGS
echo "⚙️ Migration de la feature SETTINGS..."
copy_file "src/components/settings/ColorPicker.tsx" "src/features/settings/components/ColorPicker.tsx"
copy_file "src/components/settings/HeaderFooterEditor.tsx" "src/features/settings/components/HeaderFooterEditor.tsx"
copy_file "src/pages/Settings.tsx" "src/features/settings/pages/Settings.tsx"

## FEATURE: DOCUMENTS
echo "📄 Migration de la feature DOCUMENTS..."
copy_file "src/components/DocumentsList.tsx" "src/features/documents/components/DocumentsList.tsx"
copy_file "src/pages/Documents.tsx" "src/features/documents/pages/Documents.tsx"

## FEATURE: PROFILE
echo "👤 Migration de la feature PROFILE..."
copy_file "src/hooks/useProfile.ts" "src/features/profile/hooks/useProfile.ts"
copy_file "src/pages/Profile.tsx" "src/features/profile/pages/Profile.tsx"

## FEATURE: ANNOTATIONS (compléter)
echo "🖍️ Compléter la feature ANNOTATIONS..."
copy_file "src/components/annotations/AddFileButton.tsx" "src/features/annotations/components/AddFileButton.tsx"
copy_file "src/components/annotations/AnnotationDialog.tsx" "src/features/annotations/components/AnnotationDialog.tsx"
copy_file "src/components/annotations/AnnotationMarker.tsx" "src/features/annotations/components/AnnotationMarker.tsx"
copy_file "src/components/annotations/AnnotationsSidebar.tsx" "src/features/annotations/components/AnnotationsSidebar.tsx"
copy_file "src/components/annotations/ConvertToTaskDialog.tsx" "src/features/annotations/components/ConvertToTaskDialog.tsx"
copy_file "src/components/annotations/DialogDocumentName.tsx" "src/features/annotations/components/DialogDocumentName.tsx"
copy_file "src/components/annotations/DialogImageEditor.tsx" "src/features/annotations/components/DialogImageEditor.tsx"
copy_file "src/components/annotations/DocumentsSidebar.tsx" "src/features/annotations/components/DocumentsSidebar.tsx"
copy_file "src/components/annotations/ImageViewer.tsx" "src/features/annotations/components/ImageViewer.tsx"
copy_file "src/components/annotations/MainContent.tsx" "src/features/annotations/components/MainContent.tsx"
copy_file "src/components/annotations/PlanViewerPage.tsx" "src/features/annotations/components/PlanViewerPage.tsx"
copy_file "src/utils/annotationUtils.ts" "src/features/annotations/utils/annotationUtils.ts"
copy_file "src/utils/captureService.ts" "src/features/annotations/utils/captureService.ts"
copy_file "src/utils/svgGenerationService.ts" "src/features/annotations/utils/svgGenerationService.ts"

## FEATURE: PROJECTS (compléter)
echo "📂 Compléter la feature PROJECTS..."
copy_file "src/components/project/AdditionalDetailsSection.tsx" "src/features/projects/components/AdditionalDetailsSection.tsx"
copy_file "src/components/project/AnnotationReserveItem.tsx" "src/features/projects/components/AnnotationReserveItem.tsx"
copy_file "src/components/project/AssignMembersDialog.tsx" "src/features/projects/components/AssignMembersDialog.tsx"
copy_file "src/components/project/GeneralInfoSection.tsx" "src/features/projects/components/GeneralInfoSection.tsx"
copy_file "src/components/project/ProjectOverviewTab.tsx" "src/features/projects/components/ProjectOverviewTab.tsx"
copy_file "src/components/project/TaskProgressDisplay.tsx" "src/features/projects/components/TaskProgressDisplay.tsx"
copy_file "src/components/project/TaskProgressSelector.tsx" "src/features/projects/components/TaskProgressSelector.tsx"
copy_file "src/components/project/TeamMemberSelectionDialog.tsx" "src/features/projects/components/TeamMemberSelectionDialog.tsx"
copy_file "src/components/maps/ProjectLocationMap.tsx" "src/features/projects/components/ProjectLocationMap.tsx"

copy_file "src/hooks/useEditProject.ts" "src/features/projects/hooks/useEditProject.ts"
copy_file "src/pages/EditProject.tsx" "src/features/projects/pages/EditProject.tsx"

## FEATURE: REPORTS (compléter)
echo "📝 Compléter la feature REPORTS..."
copy_file "src/components/project/DescriptifHeader.tsx" "src/features/reports/components/DescriptifHeader.tsx"
copy_file "src/components/project/ObservationsSection.tsx" "src/features/reports/components/ObservationsSection.tsx"
copy_file "src/components/project/ParticipantsSection.tsx" "src/features/reports/components/ParticipantsSection.tsx"
copy_file "src/components/project/PhotosSection.tsx" "src/features/reports/components/PhotosSection.tsx"
copy_file "src/components/project/RecommendationsSection.tsx" "src/features/reports/components/RecommendationsSection.tsx"
copy_file "src/components/project/ReportAnnotationsSection.tsx" "src/features/reports/components/ReportAnnotationsSection.tsx"
copy_file "src/components/project/ReportFooter.tsx" "src/features/reports/components/ReportFooter.tsx"
copy_file "src/components/project/ReportHeader.tsx" "src/features/reports/components/ReportHeader.tsx"
copy_file "src/components/project/ReportTemplateSelector.tsx" "src/features/reports/components/ReportTemplateSelector.tsx"
copy_file "src/components/project/SiteVisitReportsList.tsx" "src/features/reports/components/SiteVisitReportsList.tsx"
copy_file "src/components/project/SortableObservationItem.tsx" "src/features/reports/components/SortableObservationItem.tsx"
copy_file "src/components/project/SortableRecommendationItem.tsx" "src/features/reports/components/SortableRecommendationItem.tsx"

## FEATURE: TEAM (compléter)
echo "👥 Compléter la feature TEAM..."
copy_file "src/components/team/TeamMemberDialogs.tsx" "src/features/team/components/TeamMemberDialogs.tsx"
copy_file "src/components/team/TeamMemberDisplay.tsx" "src/features/team/components/TeamMemberDisplay.tsx"
copy_file "src/components/team/TeamMemberForm.tsx" "src/features/team/components/TeamMemberForm.tsx"
copy_file "src/components/team/ThemeSelector.tsx" "src/features/team/components/ThemeSelector.tsx"
copy_file "src/hooks/team" "src/features/team/hooks/"
copy_file "src/hooks/useTeamMemberManager.tsx" "src/features/team/hooks/useTeamMemberManager.tsx"
copy_file "src/hooks/useRoles.ts" "src/features/team/hooks/useRoles.ts"
copy_file "src/pages/Team.tsx" "src/features/team/pages/Team.tsx"

## DEPLACEMENT DES PAGES DE REDIRECTION
echo "🔄 Création des pages de redirection..."

# Auth
mkdir -p src/pages/auth
cat > "src/pages/auth/index.tsx" << 'EOF'
import { Auth } from "@features/auth/pages/Auth";
export default Auth;
EOF

# Chat
mkdir -p src/pages/chat
cat > "src/pages/chat/index.tsx" << 'EOF'
import { Chat } from "@features/chat/pages/Chat";
export default Chat;
EOF

# Tasks
mkdir -p src/pages/tasks
cat > "src/pages/tasks/index.tsx" << 'EOF'
import { Tasks } from "@features/tasks/pages/Tasks";
export default Tasks;
EOF

# Calendar
mkdir -p src/pages/calendar
cat > "src/pages/calendar/index.tsx" << 'EOF'
import { Calendar } from "@features/calendar/pages/Calendar";
export default Calendar;
EOF

# Resources
mkdir -p src/pages/resources
cat > "src/pages/resources/index.tsx" << 'EOF'
import { Resources } from "@features/resources/pages/Resources";
export default Resources;
EOF

# Settings
mkdir -p src/pages/settings
cat > "src/pages/settings/index.tsx" << 'EOF'
import { Settings } from "@features/settings/pages/Settings";
export default Settings;
EOF

# Documents
mkdir -p src/pages/documents
cat > "src/pages/documents/index.tsx" << 'EOF'
import { Documents } from "@features/documents/pages/Documents";
export default Documents;
EOF

# Profile
mkdir -p src/pages/profile
cat > "src/pages/profile/index.tsx" << 'EOF'
import { Profile } from "@features/profile/pages/Profile";
export default Profile;
EOF

echo "✅ Migration des composants terminée!"