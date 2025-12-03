import { X, CheckCircle2 } from "lucide-react";
import { Button } from "./button";

interface SuccessToastProps {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    onClose: () => void;
}

export function SuccessToast({
    message,
    actionLabel,
    onAction,
    onClose,
}: SuccessToastProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-white border border-green-200 rounded-lg shadow-lg p-4 min-w-[320px] max-w-md animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{message}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {actionLabel && onAction && (
                    <Button
                        onClick={onAction}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs"
                    >
                        {actionLabel}
                    </Button>
                )}
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
