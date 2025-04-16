import { FileText } from "lucide-react";
import { useState } from "react";

import { ViewResultModal } from "@/components/dialog/ViewResultModal";
import { Button } from "@/components/ui/button";

interface ViewContentButtonProps {
  content: string;
  title?: string;
  buttonLabel?: string;
  buttonVariant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

export function ViewContentButton({
  content,
  title = "콘텐츠",
  buttonLabel = "보기",
  buttonVariant = "outline",
  buttonSize = "sm",
}: ViewContentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  if (!content) return <>-</>;

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setIsModalOpen(true)}
        className="flex items-center"
      >
        <FileText className="mr-1 h-4 w-4" />
        {buttonLabel}
      </Button>

      <ViewResultModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={title}
        content={content}
      />
    </>
  );
}
