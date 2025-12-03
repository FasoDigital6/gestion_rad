# Système de Filtres Réutilisables

Ce système de filtres modulaire permet de filtrer facilement vos données dans tout le projet.

## Composants disponibles

- `DataTableFilters` - Conteneur principal
- `ClientFilter` - Filtre par client
- `StatusFilter` - Filtre par statut (avec couleurs)
- `PeriodFilter` - Filtre par période (semaine, mois, année, personnalisé)
- `SearchFilter` - Recherche textuelle simple
- `FilterBadge` - Badge pour afficher les filtres actifs

## Hook

- `useDataFilters()` - Hook pour gérer l'état des filtres

## Utilisation

### Exemple pour BDL (Bons de Livraison)

```tsx
import { useDataFilters } from "@/lib/hooks/use-data-filters";
import {
  DataTableFilters,
  ClientFilter,
  StatusFilter,
  PeriodFilter,
} from "@/components/filters";

// Définir les statuts pour BDL
const BDL_STATUS_OPTIONS = [
  { value: "brouillon", label: "Brouillon", color: "bg-gray-500" },
  { value: "en_attente", label: "En attente", color: "bg-yellow-500" },
  { value: "en_cours", label: "En cours", color: "bg-blue-500" },
  { value: "livre", label: "Livré", color: "bg-green-500" },
  { value: "annule", label: "Annulé", color: "bg-red-500" },
];

function BDLPage() {
  const { filters, setFilter, clearAllFilters, hasActiveFilters, activeFiltersCount } = useDataFilters();
  const { data: clients } = useClients();

  return (
    <div>
      <DataTableFilters
        onClearAll={clearAllFilters}
        hasActiveFilters={hasActiveFilters}
        activeFiltersCount={activeFiltersCount}
      >
        <ClientFilter
          clients={clients || []}
          value={filters.client || null}
          onChange={(value) => setFilter("client", value)}
        />
        <StatusFilter
          options={BDL_STATUS_OPTIONS}
          value={filters.status || null}
          onChange={(value) => setFilter("status", value)}
        />
        <PeriodFilter
          value={filters.period || null}
          onChange={(value) => setFilter("period", value)}
        />
      </DataTableFilters>

      {/* Votre DataTable ici */}
    </div>
  );
}
```

### Exemple pour BDC (Bons de Commande)

```tsx
const BDC_STATUS_OPTIONS = [
  { value: "brouillon", label: "Brouillon", color: "bg-gray-500" },
  { value: "approuve", label: "Approuvé", color: "bg-green-500" },
  { value: "annule", label: "Annulé", color: "bg-red-500" },
];
```

### Exemple pour Proforma

```tsx
const PROFORMA_STATUS_OPTIONS = [
  { value: "brouillon", label: "Brouillon", color: "bg-gray-500" },
  { value: "envoye", label: "Envoyé", color: "bg-blue-500" },
  { value: "valide", label: "Validé", color: "bg-green-500" },
];
```

### Exemple pour Factures

```tsx
const FACTURE_STATUS_OPTIONS = [
  { value: "emise", label: "Émise", color: "bg-blue-500" },
  { value: "partiel", label: "Partiel", color: "bg-yellow-500" },
  { value: "paye", label: "Payée", color: "bg-green-500" },
];
```

## Filtrer les données

```tsx
// Fonction utilitaire pour filtrer les données
function filterData<T extends { clientId?: string; status?: string; date?: Date }>(
  data: T[],
  filters: FilterValue
): T[] {
  return data.filter((item) => {
    // Filtre par client
    if (filters.client && item.clientId !== filters.client) {
      return false;
    }

    // Filtre par statut
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // Filtre par période
    if (filters.period && item.date) {
      const itemDate = new Date(item.date);
      if (filters.period.startDate && itemDate < filters.period.startDate) {
        return false;
      }
      if (filters.period.endDate && itemDate > filters.period.endDate) {
        return false;
      }
    }

    return true;
  });
}

// Utilisation
const filteredData = useMemo(
  () => filterData(data, filters),
  [data, filters]
);
```
