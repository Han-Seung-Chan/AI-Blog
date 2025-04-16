"use client";

import { ExternalLink, Loader2 } from "lucide-react";
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

interface ApproveBlogModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPost: any;
  onApprove: (feedback: string) => Promise<void>;
  isApproving: boolean;
}

export function ApproveBlogModal({
  isOpen,
  onOpenChange,
  selectedPost,
  onApprove,
  isApproving,
}: ApproveBlogModalProps) {
  const [feedback, setFeedback] = useState("");

  const handleApprove = async () => {
    await onApprove(feedback);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>블로그 글 승인</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h3 className="mb-2 font-medium">{selectedPost?.store_name}</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            작성자: {selectedPost?.assigned_user?.name || "알 수 없음"}
          </p>

          {selectedPost?.blog_url && (
            <div className="mb-4">
              <a
                href={selectedPost.blog_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary flex items-center hover:underline"
              >
                블로그 글 확인하기
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </div>
          )}

          {(selectedPost?.resubmission_notes ||
            selectedPost?.completion_notes) && (
            <div className="mb-4 rounded-md">
              <h4 className="text-sm font-semibold">
                유저 메모:{" "}
                <span className="text-sm font-medium">
                  {selectedPost?.resubmission_notes ||
                    selectedPost?.completion_notes}
                </span>
              </h4>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">피드백 (선택사항)</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="작성자에게 전달할 피드백을 입력하세요"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleApprove} disabled={isApproving}>
            {isApproving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "승인 완료"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
