#!/bin/bash
# update_imports.sh - Met à jour les imports vers la nouvelle structure feature-first

echo "🔄 Mise à jour des imports dans tous les fichiers TS/TSX..."

# Trouver tous les fichiers TS/TSX
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -not -path "*/node_modules/*" | while read -r file; do
  echo "📝 Traitement de $file"
  
  # 1. Mise à jour des imports de composants UI
  sed -i '' -E 's|from "@/components/ui/|from "@ui/|g' "$file"
  sed -i '' -E 's|from "@components/ui/|from "@ui/|g' "$file"
  
  # 2. Mise à jour des imports utils
  sed -i '' -E 's|from "@/utils/|from "@lib/|g' "$file"
  sed -i '' -E 's|from "@utils/|from "@lib/|g' "$file"
  
  # 3. Mise à jour des imports features
  
  # Auth
  sed -i '' -E 's|from "@/components/auth/|from "@features/auth/components/|g' "$file"
  sed -i '' -E 's|from "@components/auth/|from "@features/auth/components/|g' "$file"
  sed -i '' -E 's|from "@/hooks/useAuth|from "@features/auth/hooks/useAuth|g' "$file"
  sed -i '' -E 's|from "@hooks/useAuth|from "@features/auth/hooks/useAuth|g' "$file"
  sed -i '' -E 's|from "@/services/authService|from "@features/auth/services/authService|g' "$file"
  sed -i '' -E 's|from "@services/authService|from "@features/auth/services/authService|g' "$file"
  
  # Projects
  sed -i '' -E 's|from "@/components/project/|from "@features/projects/components/|g' "$file"
  sed -i '' -E 's|from "@components/project/|from "@features/projects/components/|g' "$file"
  sed -i '' -E 's|from "@/services/projectService|from "@features/projects/services/projectService|g' "$file"
  sed -i '' -E 's|from "@services/projectService|from "@features/projects/services/projectService|g' "$file"
  
  # Annotations
  sed -i '' -E 's|from "@/components/annotations/|from "@features/annotations/components/|g' "$file"
  sed -i '' -E 's|from "@components/annotations/|from "@features/annotations/components/|g' "$file"
  sed -i '' -E 's|from "@/services/annotationService|from "@features/annotations/services/annotationService|g' "$file"
  sed -i '' -E 's|from "@services/annotationService|from "@features/annotations/services/annotationService|g' "$file"
  
  # Chat
  sed -i '' -E 's|from "@/components/chat/|from "@features/chat/components/|g' "$file"
  sed -i '' -E 's|from "@components/chat/|from "@features/chat/components/|g' "$file"
  sed -i '' -E 's|from "@/services/chat/|from "@features/chat/services/|g' "$file"
  sed -i '' -E 's|from "@services/chat/|from "@features/chat/services/|g' "$file"
  
  # Team
  sed -i '' -E 's|from "@/components/team/|from "@features/team/components/|g' "$file"
  sed -i '' -E 's|from "@components/team/|from "@features/team/components/|g' "$file"
  sed -i '' -E 's|from "@/services/teamService|from "@features/team/services/teamService|g' "$file"
  sed -i '' -E 's|from "@services/teamService|from "@features/team/services/teamService|g' "$file"
  sed -i '' -E 's|from "@/services/team/|from "@features/team/services/|g' "$file"
  sed -i '' -E 's|from "@services/team/|from "@features/team/services/|g' "$file"
  
  # Tasks
  sed -i '' -E 's|from "@/components/tasks/|from "@features/tasks/components/|g' "$file"
  sed -i '' -E 's|from "@components/tasks/|from "@features/tasks/components/|g' "$file"
  sed -i '' -E 's|from "@/services/taskService|from "@features/tasks/services/taskService|g' "$file"
  sed -i '' -E 's|from "@services/taskService|from "@features/tasks/services/taskService|g' "$file"
  
  # Clients
  sed -i '' -E 's|from "@/components/clients/|from "@features/clients/components/|g' "$file"
  sed -i '' -E 's|from "@components/clients/|from "@features/clients/components/|g' "$file"
  sed -i '' -E 's|from "@/services/clientService|from "@features/clients/services/clientService|g' "$file"
  sed -i '' -E 's|from "@services/clientService|from "@features/clients/services/clientService|g' "$file"
  
  # Planning
  sed -i '' -E 's|from "@/components/planning/|from "@features/planning/components/|g' "$file"
  sed -i '' -E 's|from "@components/planning/|from "@features/planning/components/|g' "$file"
  sed -i '' -E 's|from "@/components/gantt/|from "@features/planning/components/|g' "$file"
  sed -i '' -E 's|from "@components/gantt/|from "@features/planning/components/|g' "$file"
  sed -i '' -E 's|from "@/services/planningService|from "@features/planning/services/planningService|g' "$file"
  sed -i '' -E 's|from "@services/planningService|from "@features/planning/services/planningService|g' "$file"
  
  # Reports
  sed -i '' -E 's|from "@/components/reports/|from "@features/reports/components/|g' "$file"
  sed -i '' -E 's|from "@components/reports/|from "@features/reports/components/|g' "$file"
  sed -i '' -E 's|from "@/services/reportService|from "@features/reports/services/reportService|g' "$file"
  sed -i '' -E 's|from "@services/reportService|from "@features/reports/services/reportService|g' "$file"
  
  # 4. Mise à jour des imports de types
  sed -i '' -E 's|from "@/types/|from "@types/|g' "$file"
  sed -i '' -E 's|from "@types/auth|from "@features/auth/types/auth|g' "$file"
  sed -i '' -E 's|from "@types/project|from "@features/projects/types/project|g' "$file"
  sed -i '' -E 's|from "@types/annotation|from "@features/annotations/types/annotation|g' "$file"
  sed -i '' -E 's|from "@types/chat|from "@features/chat/types/chat|g' "$file"
  sed -i '' -E 's|from "@types/team|from "@features/team/types/team|g' "$file"
  sed -i '' -E 's|from "@types/task|from "@features/tasks/types/task|g' "$file"
  sed -i '' -E 's|from "@types/client|from "@features/clients/types/client|g' "$file"
  sed -i '' -E 's|from "@types/planning|from "@features/planning/types/planning|g' "$file"
  sed -i '' -E 's|from "@types/report|from "@features/reports/types/report|g' "$file"
  
  # 5. Mise à jour des imports de hooks
  sed -i '' -E 's|from "@/hooks/|from "@hooks/|g' "$file"
  sed -i '' -E 's|from "@hooks/useProfile|from "@features/profile/hooks/useProfile|g' "$file"
  sed -i '' -E 's|from "@hooks/useRoles|from "@features/team/hooks/useRoles|g' "$file"
  sed -i '' -E 's|from "@hooks/useTeamMember|from "@features/team/hooks/useTeamMember|g' "$file"
  sed -i '' -E 's|from "@hooks/useAnnotations|from "@features/annotations/hooks/useAnnotations|g' "$file"
  sed -i '' -E 's|from "@hooks/useReportForm|from "@features/reports/hooks/useReportForm|g' "$file"
  sed -i '' -E 's|from "@hooks/useConversation|from "@features/chat/hooks/useConversation|g' "$file"
  
  # 6. Mise à jour des imports contexts
  sed -i '' -E 's|from "@/contexts/|from "@contexts/|g' "$file"
  sed -i '' -E 's|from "@contexts/AuthContext|from "@features/auth/contexts/AuthContext|g' "$file"
  
  # 7. Mise à jour des imports components génériques
  sed -i '' -E 's|from "@/components/layout/|from "@components/layout/|g' "$file"
  sed -i '' -E 's|from "@/components/guards/|from "@features/auth/components/|g' "$file"
  sed -i '' -E 's|from "@components/guards/|from "@features/auth/components/|g' "$file"
  
  echo "✅ Fichier $file mis à jour"
done

echo "✨ Mise à jour des imports terminée avec succès!"