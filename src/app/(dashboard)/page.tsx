"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Users, FileText, Wallet } from "lucide-react";

// Données factices pour la démonstration
const statsData = [
  {
    title: "Total des ventes",
    value: "2,350,000 GNF",
    change: "+12.5%",
    trend: "up",
    icon: Wallet,
    description: "vs mois dernier",
  },
  {
    title: "Clients actifs",
    value: "142",
    change: "+8",
    trend: "up",
    icon: Users,
    description: "nouveaux ce mois",
  },
  {
    title: "Factures en attente",
    value: "23",
    change: "-5",
    trend: "down",
    icon: FileText,
    description: "vs semaine dernière",
  },
  {
    title: "Taux de paiement",
    value: "94.2%",
    change: "+2.1%",
    trend: "up",
    icon: TrendingUp,
    description: "en hausse",
  },
];

const recentClients = [
  { id: 1, nom: "Société Générale", type: "Entreprise", statut: "Actif", derniereFacture: "2025-01-15" },
  { id: 2, nom: "Orange Guinée", type: "Entreprise", statut: "Actif", derniereFacture: "2025-01-12" },
  { id: 3, nom: "EDG", type: "Entreprise", statut: "Actif", derniereFacture: "2025-01-10" },
  { id: 4, nom: "MTN Guinée", type: "Entreprise", statut: "Actif", derniereFacture: "2025-01-08" },
  { id: 5, nom: "Ministère des Mines", type: "Administration", statut: "Actif", derniereFacture: "2025-01-05" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-base text-gray-500">
          Vue d'ensemble de votre activité commerciale
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Clients Table */}
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold">Clients récents</CardTitle>
              <CardDescription className="mt-1">
                Liste des derniers clients ajoutés ou modifiés
              </CardDescription>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau client
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Dernière facture
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {recentClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{client.nom}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{client.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {client.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {new Date(client.derniereFacture).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        Voir détails
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Cards Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Activité récente</CardTitle>
            <CardDescription>Dernières actions effectuées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Nouvelle facture créée", client: "Orange Guinée", time: "Il y a 2h" },
                { action: "Paiement reçu", client: "Société Générale", time: "Il y a 5h" },
                { action: "Client ajouté", client: "EDG", time: "Il y a 1 jour" },
                { action: "Proforma envoyée", client: "MTN Guinée", time: "Il y a 2 jours" },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.client}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">À faire</CardTitle>
            <CardDescription>Tâches en attente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { task: "Relancer 3 factures impayées", priority: "high", dueDate: "Aujourd'hui" },
                { task: "Envoyer proforma à Ministère des Mines", priority: "medium", dueDate: "Demain" },
                { task: "Mettre à jour les prix", priority: "low", dueDate: "Cette semaine" },
                { task: "Vérifier les paiements en attente", priority: "medium", dueDate: "Vendredi" },
              ].map((todo, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-gray-900">{todo.task}</p>
                    <p className="text-xs text-gray-500">{todo.dueDate}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      todo.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : todo.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {todo.priority === "high" ? "Urgent" : todo.priority === "medium" ? "Moyen" : "Bas"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
