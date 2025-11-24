"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Configuration: numérotation, PDF, TVA, délais
        </p>
      </div>

      {/* Informations de l'entreprise */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'entreprise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nom de l'entreprise</Label>
              <Input id="company-name" placeholder="RAD" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Email</Label>
              <Input id="company-email" type="email" placeholder="contact@rad.com" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-phone">Téléphone</Label>
              <Input id="company-phone" placeholder="+226 XX XX XX XX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-ifu">IFU</Label>
              <Input id="company-ifu" placeholder="Identifiant Fiscal Unique" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-address">Adresse</Label>
            <Input id="company-address" placeholder="Adresse complète" />
          </div>
        </CardContent>
      </Card>

      {/* Numérotation */}
      <Card>
        <CardHeader>
          <CardTitle>Numérotation automatique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="proforma-prefix">Préfixe Proforma</Label>
              <Input id="proforma-prefix" defaultValue="PRO" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bdc-prefix">Préfixe BDC</Label>
              <Input id="bdc-prefix" defaultValue="BDC" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bl-prefix">Préfixe BL</Label>
              <Input id="bl-prefix" defaultValue="BL" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facture-prefix">Préfixe Facture</Label>
              <Input id="facture-prefix" defaultValue="FAC" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TVA et Finances */}
      <Card>
        <CardHeader>
          <CardTitle>TVA et Finances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tva-rate">Taux de TVA (%)</Label>
              <Input id="tva-rate" type="number" defaultValue="18" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-delay">Délai de paiement (jours)</Label>
              <Input id="payment-delay" type="number" defaultValue="30" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Devise</Label>
            <Select defaultValue="XOF">
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XOF">FCFA (XOF)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="USD">Dollar (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Catégories de dépenses */}
      <Card>
        <CardHeader>
          <CardTitle>Catégories de dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Gérez vos catégories de dépenses pour une meilleure organisation
            </p>
            <div className="flex gap-2 mt-4">
              <Input placeholder="Nouvelle catégorie" />
              <Button>Ajouter</Button>
            </div>
            <div className="mt-4 space-y-2">
              {["Fournitures", "Transport", "Salaires", "Loyer"].map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span>{cat}</span>
                  <Button variant="ghost" size="sm">
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Annuler</Button>
        <Button>Enregistrer les modifications</Button>
      </div>
    </div>
  );
}
