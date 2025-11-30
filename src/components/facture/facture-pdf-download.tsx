"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { FacturePDFTemplate } from "./facture-pdf-template";
import type { Facture } from "@/lib/types/facture";

interface FacturePDFDownloadProps {
  facture: Facture;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FacturePDFDownload({
  facture,
  variant = "outline",
  size = "default",
}: FacturePDFDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);

      // Générer le blob PDF
      const blob = await pdf(<FacturePDFTemplate facture={facture} />).toBlob();

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Facture_${facture.numero.replace(/\//g, "_")}.pdf`;
      link.click();

      // Nettoyer
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      variant={variant}
      size={size}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Génération...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Télécharger PDF
        </>
      )}
    </Button>
  );
}
