#!/bin/bash
# filepath: /Users/mouradgares/Downloads/project/fix_imports.sh

echo "🔄 Démarrage de la correction des imports..."

echo "🔧 Correction automatique des imports..."

# Correction des imports de MainLayout
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/layout/MainLayout|@/features/layout/components/MainLayout|g'

# Correction des imports de composants de layout
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/Navbar|@/features/layout/components/Navbar|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/Sidebar|@/features/layout/components/Sidebar|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/UserMenu|@/features/layout/components/UserMenu|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/ErrorBoundary|@/features/layout/components/ErrorBoundary|g'

# Correction des imports de services
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/services/apiClient|@/features/common/services/apiClient|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/services/projectService|@/features/projects/services/projectService|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/services/reportService|@/features/reports/services/reportService|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/services/storageService|@/features/storage/services/storageService|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/services/annotationService|@/features/annotations/services/annotationService|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/services/teamService|@/features/team/services/teamService|g'

# Correction des imports de hooks
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/hooks/use-mobile|@/features/common/hooks/use-mobile|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/hooks/use-toast|@/features/common/hooks/use-toast|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/hooks/useLocalStorage|@/features/storage/hooks/useLocalStorage|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/hooks/useSubscription|@/features/subscription/hooks/useSubscription|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/hooks/use-report-form|@/features/reports/hooks/use-report-form|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/hooks/useTeamMemberManager|@/features/team/hooks/useTeamMemberManager|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/hooks/useEditProject|@/features/projects/hooks/useEditProject|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/hooks/use-storage-upload|@/features/storage/hooks/use-storage-upload|g'

# Correction des imports de contextes
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/contexts/AuthContext|@/features/auth/contexts/AuthContext|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/contexts/ThemeContext|@/features/auth/contexts/ThemeContext|g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/contexts/DataPersistenceContext|@/features/auth/contexts/DataPersistenceContext|g'

# Correction des imports de types
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/gantt/types|@/features/projects/types/gantt|g'

# Correction des imports de localStorageService
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/features/storage/localStorageService|@/features/storage/services/localStorageService|g'

# Correction des imports de milestonesService
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|@/components/services/milestonesService|@/features/projects/services/milestonesService|g'

echo "✅ Correction des imports terminée!"