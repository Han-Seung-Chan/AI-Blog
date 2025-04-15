"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectBlogModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPost: any;
  onReject: (rejectionReason: string) => Promise<void>;
  isRejecting: boolean;
}

export function RejectBlogModal({
  isOpen,
  onOpenChange,
  selectedPost,
  onReject,
  isRejecting,
}: RejectBlogModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError("거절 사유는 필수 항목입니다.");
      return;
    }
    setError("");
    await onReject(rejectionReason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>블로그 글 거절</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h3 className="mb-2 font-medium">{selectedPost?.store_name}</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            작성자: {selectedPost?.assigned_user?.name || "알 수 없음"}
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              거절 사유 <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="작성자에게 전달할 거절 사유를 입력하세요"
              rows={4}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isRejecting}
          >
            {isRejecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "거절하기"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
