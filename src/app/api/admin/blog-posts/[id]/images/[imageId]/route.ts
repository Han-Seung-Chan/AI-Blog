import { NextRequest, NextResponse } from "next/server";

import { verifyUserRole } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

// 이미지 삭제 처리
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; imageId: string }> },
) {
  try {
    const params = await context.params;
    const postId = params.id;
    const imageId = params.imageId;

    // 관리자 권한 확인
    const { user, errorResponse } = await verifyUserRole(request, "admin");
    if (errorResponse) return errorResponse;

    // 이미지 정보 조회
    const { data: imageData, error: imageError } = await supabase
      .from("blog_images")
      .select("*")
      .eq("id", imageId)
      .eq("blog_post_id", postId)
      .single();

    if (imageError || !imageData) {
      return NextResponse.json(
        { error: "이미지를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // Supabase Storage에서 이미지 파일 삭제
    const { error: storageError } = await supabase.storage
      .from("uploads")
      .remove([imageData.file_path]);

    if (storageError) {
      console.error("스토리지 파일 삭제 오류:", storageError);
      // 파일 삭제에 실패해도 메타데이터는 삭제 진행 (고아 파일 방지)
    }

    // 데이터베이스에서 이미지 메타데이터 삭제
    const { error: dbError } = await supabase
      .from("blog_images")
      .delete()
      .eq("id", imageId)
      .eq("blog_post_id", postId);

    if (dbError) {
      return NextResponse.json(
        { error: `이미지 삭제 오류: ${dbError.message}` },
        { status: 500 },
      );
    }

    // 남은 이미지 수 확인
    const { data: remainingImages, error: countError } = await supabase
      .from("blog_images")
      .select("id")
      .eq("blog_post_id", postId);

    if (!countError && remainingImages) {
      // 남은 이미지가 없으면 has_images 플래그 업데이트
      if (remainingImages.length === 0) {
        await supabase
          .from("blog_posts")
          .update({
            has_images: false,
            updated_at: new Date(),
          })
          .eq("id", postId);
      }
    }

    // 활동 로그 기록
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      blog_post_id: postId,
      action: "delete_image",
      notes: `이미지 삭제: ${imageData.file_name}`,
      created_at: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "이미지가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("이미지 삭제 중 오류:", error);
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 500 },
    );
  }
}
