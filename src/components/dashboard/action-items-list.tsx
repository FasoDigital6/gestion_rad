"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ActionItem } from "./action-item";
import { Inbox } from "lucide-react";
import type { ActionItem as ActionItemType } from "@/lib/utils/dashboard";

interface ActionItemsListProps {
  actions: ActionItemType[];
}

export function ActionItemsList({ actions }: ActionItemsListProps) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actions requises</CardTitle>
          <CardDescription>Tâches nécessitant votre attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Tout est à jour !</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Aucune action urgente n'est requise pour le moment. Continuez votre excellent travail !
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions requises ({actions.length})</CardTitle>
        <CardDescription>Tâches nécessitant votre attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <ActionItem key={index} action={action} />
        ))}
      </CardContent>
    </Card>
  );
}
