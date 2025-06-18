import { useState } from "react";
import MainLayout from "@components/layout/MainLayout";
import { Button } from "@ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@features/auth/services/authService";
import { useSubscription } from "@hooks/useSubscription";

type PricingPeriod = "monthly" | "annually";

interface PricingOption {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annually: number;
  };
  features: string[];
  cta: string;
  popular?: boolean;
}

export default function Pricing() {
  const { user } = useAuth();
  const { subscription, isLoading } = useSubscription();
  const [period, setPeriod] = useState<PricingPeriod>("monthly");

  const pricingOptions: PricingOption[] = [
    {
      id: "basic",
      name: "Basique",
      description: "Pour les indépendants et petites équipes",
      price: {
        monthly: 29,
        annually: 24,
      },
      features: [
        "Jusqu'à 5 projets",
        "Jusqu'à 10 utilisateurs",
        "5Go de stockage",
        "Rapports de visite illimités",
        "Support par email",
      ],
      cta: "Commencer l'essai gratuit",
    },
    {
      id: "pro",
      name: "Professionnel",
      description: "Pour les équipes qui ont besoin de plus de contrôle",
      price: {
        monthly: 49,
        annually: 39,
      },
      features: [
        "Projets illimités",
        "Jusqu'à 50 utilisateurs",
        "50Go de stockage",
        "Rapports de visite illimités",
        "Support prioritaire",
        "Annotations illimitées",
        "Intégration calendrier",
      ],
      cta: "Commencer l'essai gratuit",
      popular: true,
    },
    {
      id: "enterprise",
      name: "Entreprise",
      description: "Pour les grandes organisations",
      price: {
        monthly: 99,
        annually: 79,
      },
      features: [
        "Projets illimités",
        "Utilisateurs illimités",
        "500Go de stockage",
        "Rapports de visite illimités",
        "Support dédié 24/7",
        "Annotations illimitées",
        "Intégration calendrier",
        "API personnalisée",
        "Single Sign-On (SSO)",
      ],
      cta: "Contacter les ventes",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8 py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Plans et tarifs</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choisissez le plan qui correspond à vos besoins
          </p>

          <div className="flex justify-center mt-6">
            <div className="inline-flex items-center rounded-md border p-1 bg-muted">
              <Button
                variant={period === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriod("monthly")}
              >
                Mensuel
              </Button>
              <Button
                variant={period === "annually" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriod("annually")}
              >
                Annuel
                <span className="ml-1.5 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                  -20%
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid max-w-screen-lg mx-auto grid-cols-1 gap-5 lg:grid-cols-3">
          {pricingOptions.map((option) => (
            <Card
              key={option.id}
              className={`flex flex-col ${
                option.popular
                  ? "border-primary shadow-md relative"
                  : ""
              }`}
            >
              {option.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-primary text-primary-foreground text-sm rounded-full px-3 py-1">
                    Le plus populaire
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle>{option.name}</CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 flex-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {option.price[period]}€
                  </span>
                  <span className="text-muted-foreground">/ mois</span>
                </div>
                {period === "annually" && (
                  <p className="text-sm text-muted-foreground">
                    Facturé annuellement ({option.price.annually * 12}€)
                  </p>
                )}
                <ul className="space-y-2 pt-4">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={option.popular ? "default" : "outline"}
                >
                  {option.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}