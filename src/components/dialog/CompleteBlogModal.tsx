"use client";

import { Loader2 } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CompleteBlogModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPost: any;
  onComplete: (blogUrl: string, notes: string) => Promise<void>;
  isCompleting: boolean;
  blogUrl: string;
  setBlogUrl: Dispatch<SetStateAction<string>>;
  notes: string;
  setNotes: Dispatch<SetStateAction<string>>;
  urlError: string;
}

export function CompleteBlogModal({
  isOpen,
  onOpenChange,
  selectedPost,
  onComplete,
  isCompleting,
  blogUrl,
  setBlogUrl,
  notes,
  setNotes,
  urlError,
}: CompleteBlogModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>블로그 글 작성 완료</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h3 className="mb-2 font-medium">{selectedPost?.store_name}</h3>
          <p className="text-muted-foreground mb-4 text-sm">
            키워드: {selectedPost?.main_keyword}
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blogUrl">블로그 URL *</Label>
              <Input
                id="blogUrl"
                value={blogUrl}
                onChange={(e) => setBlogUrl(e.target.value)}
                placeholder="작성한 블로그 글의 URL을 입력하세요"
              />
              {urlError && (
                <p className="text-destructive text-xs">{urlError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">메모 (선택사항)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="관리자에게 전달할 메모를 입력하세요"
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={() => onComplete(blogUrl, notes)}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "작성 완료"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
