import { toast as sonnerToast } from 'sonner';

export const useToast = () => {
  const toast = {
    success: (message: string) => sonnerToast.success(message),
    error: (message: string) => sonnerToast.error(message),
    warning: (message: string) => sonnerToast.warning(message),
    info: (message: string) => sonnerToast.info(message),
  };

  return toast;
};

export { toast } from 'sonner'; 