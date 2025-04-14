"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReserveBlogModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPost: any; // 타입을 더 구체적으로 정의할 수 있습니다
  onReserve: () => Promise<void>;
  isReserving: boolean;
  error?: string;
}

export function ReserveBlogModal({
  isOpen,
  onOpenChange,
  selectedPost,
  onReserve,
  isReserving,
  error,
}: ReserveBlogModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>블로그 글 작성 예약</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h3 className="mb-2 font-medium">{selectedPost?.store_name}</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            키워드: {selectedPost?.main_keyword}
          </p>

          <p>
            이 블로그 글 작성을、예약하시겠습니까? 예약 후에는 블로그 글을
            작성하고 완료 처리해야 합니다.
          </p>

          {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onReserve} disabled={isReserving}>
            {isReserving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "예약하기"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
