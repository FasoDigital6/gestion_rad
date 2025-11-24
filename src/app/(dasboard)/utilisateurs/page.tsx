"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, User } from "lucide-react";

export default function UtilisateursPage() {
  // Mock data pour démonstration
  const utilisateurs = [
    {
      id: "1",
      nom: "Admin RAD",
      email: "admin@rad.com",
      role: "admin",
      statut: "actif",
      dateCreation: new Date("2024-01-01"),
    },
    {
      id: "2",
      nom: "Gestionnaire 1",
      email: "gestionnaire@rad.com",
      role: "gestionnaire",
      statut: "actif",
      dateCreation: new Date("2024-02-15"),
    },
    {
      id: "3",
      nom: "Lecture Seule",
      email: "viewer@rad.com",
      role: "lecture",
      statut: "inactif",
      dateCreation: new Date("2024-03-10"),
    },
  ];

  const roleLabels: Record<string, string> = {
    admin: "Administrateur",
    gestionnaire: "Gestionnaire",
    lecture: "Lecture seule",
  };

  const roleColors: Record<string, string> = {
    admin: "bg-purple-500",
    gestionnaire: "bg-blue-500",
    lecture: "bg-gray-500",
  };

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gérer les comptes et les rôles des utilisateurs
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilisateurs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {utilisateurs.filter((u) => u.statut === "actif").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {utilisateurs.filter((u) => u.statut === "inactif").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {utilisateurs.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b pb-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{user.nom}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                      <Badge
                        variant={user.statut === "actif" ? "default" : "outline"}
                      >
                        {user.statut === "actif" ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                  <Button
                    variant={user.statut === "actif" ? "destructive" : "default"}
                    size="sm"
                  >
                    {user.statut === "actif" ? "Désactiver" : "Activer"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rôles et permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Rôles et permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="font-medium text-purple-600">Administrateur</p>
              <p className="text-sm text-muted-foreground mt-1">
                Accès complet : créer, modifier, supprimer tous les documents.
                Gérer les utilisateurs et paramètres.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium text-blue-600">Gestionnaire</p>
              <p className="text-sm text-muted-foreground mt-1">
                Créer et modifier les documents commerciaux. Consulter les
                rapports. Pas d'accès aux paramètres et utilisateurs.
              </p>
            </div>
            <div className="border-l-4 border-gray-500 pl-4 py-2">
              <p className="font-medium text-gray-600">Lecture seule</p>
              <p className="text-sm text-muted-foreground mt-1">
                Consulter uniquement les documents et rapports. Aucune
                modification possible.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
