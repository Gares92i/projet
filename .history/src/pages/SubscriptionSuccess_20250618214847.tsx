import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
import { CheckCircle } from "lucide-react";

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const plan = searchParams.get("plan") || "Professionnel";
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Rediriger vers la dashboard
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Abonnement activé avec succès!</CardTitle>
          <CardDescription>
            Merci d'avoir souscrit au plan {plan}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>
            Votre abonnement est maintenant actif et vous avez accès à toutes les fonctionnalités du plan {plan}.
          </p>
          <p className="mt-4 text-muted-foreground">
            Vous allez être redirigé vers votre tableau de bord dans {countdown} secondes...
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link to="/">
              Aller au tableau de bord
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}