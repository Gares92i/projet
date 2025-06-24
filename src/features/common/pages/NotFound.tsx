import { Button } from "@/ui/button";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Page non trouvée
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/projects">Voir mes projets</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}