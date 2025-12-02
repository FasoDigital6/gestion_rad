"use client";

import { useState } from "react";
import { FiltrePeriode, TypePeriode } from "@/lib/types/finances";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PeriodeFilterProps {
  periode: FiltrePeriode;
  onChange: (periode: FiltrePeriode) => void;
}

const MOIS = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
];

const ANNEES = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year, label: year.toString() };
});

export function PeriodeFilter({ periode, onChange }: PeriodeFilterProps) {
  const [dateDebut, setDateDebut] = useState<Date | undefined>(
    periode.dateDebut
  );
  const [dateFin, setDateFin] = useState<Date | undefined>(periode.dateFin);

  const handleTypeChange = (type: TypePeriode) => {
    if (type === "mois") {
      onChange({
        type: "mois",
        mois: new Date().getMonth() + 1,
        annee: new Date().getFullYear(),
      });
    } else if (type === "annee") {
      onChange({
        type: "annee",
        annee: new Date().getFullYear(),
      });
    } else {
      onChange({
        type: "custom",
        annee: new Date().getFullYear(),
        dateDebut: undefined,
        dateFin: undefined,
      });
    }
  };

  const handleMoisChange = (mois: string) => {
    onChange({
      ...periode,
      mois: parseInt(mois),
    });
  };

  const handleAnneeChange = (annee: string) => {
    onChange({
      ...periode,
      annee: parseInt(annee),
    });
  };

  const handleDateDebutChange = (date: Date | undefined) => {
    setDateDebut(date);
    onChange({
      ...periode,
      dateDebut: date,
    });
  };

  const handleDateFinChange = (date: Date | undefined) => {
    setDateFin(date);
    onChange({
      ...periode,
      dateFin: date,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      {/* Type de période */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Période :</span>
        <Select value={periode.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mois">Par mois</SelectItem>
            <SelectItem value="annee">Par année</SelectItem>
            <SelectItem value="custom">Personnalisée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sélecteur de mois (si type = mois) */}
      {periode.type === "mois" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Mois :</span>
          <Select
            value={periode.mois?.toString()}
            onValueChange={handleMoisChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MOIS.map((mois) => (
                <SelectItem key={mois.value} value={mois.value.toString()}>
                  {mois.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sélecteur d'année (pour mois et année) */}
      {(periode.type === "mois" || periode.type === "annee") && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Année :</span>
          <Select
            value={periode.annee.toString()}
            onValueChange={handleAnneeChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ANNEES.map((annee) => (
                <SelectItem key={annee.value} value={annee.value.toString()}>
                  {annee.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Sélecteurs de dates (si type = custom) */}
      {periode.type === "custom" && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Du :</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal",
                    !dateDebut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateDebut ? (
                    format(dateDebut, "dd MMM yyyy", { locale: fr })
                  ) : (
                    <span>Début</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateDebut}
                  onSelect={handleDateDebutChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Au :</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[160px] justify-start text-left font-normal",
                    !dateFin && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFin ? (
                    format(dateFin, "dd MMM yyyy", { locale: fr })
                  ) : (
                    <span>Fin</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFin}
                  onSelect={handleDateFinChange}
                  initialFocus
                  disabled={(date) => {
                    if (!dateDebut) return false;
                    return date < dateDebut;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}
    </div>
  );
}
