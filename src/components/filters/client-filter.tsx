"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface Client {
  id: string;
  nom: string;
}

interface ClientFilterProps {
  clients: Client[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export function ClientFilter({
  clients,
  value,
  onChange,
  placeholder = "Sélectionner un client",
}: ClientFilterProps) {
  const [open, setOpen] = useState(false);

  const selectedClient = clients.find((client) => client.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedClient ? selectedClient.nom : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher un client..." />
          <CommandList>
            <CommandEmpty>Aucun client trouvé.</CommandEmpty>
            <CommandGroup>
              {clients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.nom}
                  className="cursor-pointer"
                  onSelect={(currentValue) => {
                    const selectedClient = clients.find(
                      (c) => c.nom.toLowerCase() === currentValue.toLowerCase()
                    );
                    if (selectedClient) {
                      onChange(
                        selectedClient.id === value ? null : selectedClient.id
                      );
                    }
                    setOpen(false);
                  }}
                  onClick={() => {
                    onChange(client.id === value ? null : client.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 pointer-events-none",
                      value === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="pointer-events-none">{client.nom}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
