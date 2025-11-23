"use client";

import { Client } from "@/lib/types/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, FileText, Building2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ClientInfoCardProps {
  client: Client;
}

export function ClientInfoCard({ client }: ClientInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{client.email}</p>
            </div>
          </div>

          {/* Téléphone */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              <p className="text-sm">{client.telephone}</p>
            </div>
          </div>

          {/* Adresse */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Adresse</p>
              <p className="text-sm">{client.adresse}</p>
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.statut === "actif"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {client.statut === "actif" ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          </div>

          {/* IFU */}
          {client.ifu && (
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">IFU</p>
                <p className="text-sm">{client.ifu}</p>
              </div>
            </div>
          )}

          {/* RCCM */}
          {client.rccm && (
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">RCCM</p>
                <p className="text-sm">{client.rccm}</p>
              </div>
            </div>
          )}

          {/* Date de création */}
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Client depuis</p>
              <p className="text-sm">
                {format(new Date(client.dateCreation), "d MMMM yyyy", {
                  locale: fr,
                })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
