import { Button } from '@/ui/button';
import { Sparkles } from 'lucide-react';

interface AiHelperProps {
  activeTab: string;
}

const AiHelper = ({ activeTab }: AiHelperProps) => {
  // Fonctionnalité AI désactivée (stockage désactivé)
  return (
    <Button 
      variant="outline" 
      size="icon" 
      disabled
      className="text-primary"
      title="AI Helper désactivé temporairement"
    >
      <Sparkles className="h-5 w-5" />
    </Button>
  );
};

export default AiHelper;
