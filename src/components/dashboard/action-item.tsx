"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getPriorityBadgeStyle,
  getPriorityLabel,
  type ActionItem as ActionItemType,
} from "@/lib/utils/dashboard";

interface ActionItemProps {
  action: ActionItemType;
}

export function ActionItem({ action }: ActionItemProps) {
  const router = useRouter();

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex-1 space-y-2">
        <div className="flex items-start gap-2">
          <Badge className={getPriorityBadgeStyle(action.priority)}>
            {getPriorityLabel(action.priority)}
          </Badge>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{action.title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Client: {action.client}
            </p>
          </div>
        </div>

        {action.metadata.length > 0 && (
          <div className="flex flex-wrap gap-3 text-xs">
            {action.metadata.map((meta, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="text-muted-foreground">{meta.label}:</span>
                <span className="font-medium">{meta.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="gap-1 shrink-0"
        onClick={() => router.push(action.link)}
      >
        Voir
        <ArrowRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
