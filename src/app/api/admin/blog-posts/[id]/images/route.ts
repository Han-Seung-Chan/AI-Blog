import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";

import { verifyUserRole } from "@/lib/auth-middleware";
import { supabase } from "@/lib/supabase";

// 허용되는 이미지 MIME 타입
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

// 최대 파일 크기 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 이미지 업로드 처리
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const postId = params.id;

    // 관리자 권한 확인
    const { user, errorResponse } = await verifyUserRole(request, "admin");
    if (errorResponse) return errorResponse;

    // 블로그 글 존재 확인
    const { data: postData, error: postError } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      return NextResponse.json(
        { error: "블로그 글을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    // 현재 이미지 수 확인 (최대 5개 제한)
    const { data: existingImages, error: countError } = await supabase
      .from("blog_images")
      .select("id")
      .eq("blog_post_id", postId);

    if (countError) {
      return NextResponse.json(
        { error: "이미지 정보를 조회하는 중 오류가 발생했습니다." },
        { status: 500 },
      );
    }

    const currentImageCount = existingImages?.length || 0;

    // multipart/form-data 요청 처리
    const formData = await request.formData();
    const imageFiles = formData.getAll("images") as File[];

    // 최대 이미지 수 검증
    if (currentImageCount + imageFiles.length > 5) {
      return NextResponse.json(
        { error: "이미지는 최대 5개까지만 등록할 수 있습니다." },
        { status: 400 },
      );
    }

    // 이미지 처리 결과를 저장할 배열
    const uploadedImages = [];
    const errors = [];

    // 각 이미지 파일 처리
    for (const file of imageFiles) {
      // 파일 타입 및 크기 검증
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        errors.push(`'${file.name}'은(는) 지원되지 않는 이미지 형식입니다.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `'${file.name}'의 크기가 최대 허용 크기(5MB)를 초과합니다.`,
        );
        continue;
      }

      // 파일 데이터를 ArrayBuffer로 변환
      const fileBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(fileBuffer);

      // Supabase Storage에 이미지 업로드
      const fileName = `${uuid()}`;
      const filePath = `blog_images/${postId}/${fileName}`;

      const { data: _, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, fileData, {
          contentType: file.type,
          cacheControl: "3600",
        });

      if (uploadError) {
        errors.push(`'${file.name}' 업로드 중 오류: ${uploadError.message}`);
        continue;
      }

      // 이미지 URL 생성
      const { data: urlData } = await supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      // 데이터베이스에 이미지 메타데이터 저장
      const { data: imageData, error: dbError } = await supabase
        .from("blog_images")
        .insert({
          blog_post_id: postId,
          file_name: fileName,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          url: urlData.publicUrl,
          uploaded_by: user.id,
          uploaded_at: new Date(),
        })
        .select()
        .single();

      if (dbError) {
        errors.push(
          `'${file.name}' 메타데이터 저장 중 오류: ${dbError.message}`,
        );

        // 스토리지에서 업로드된 파일 삭제 (롤백)
        await supabase.storage.from("uploads").remove([filePath]);
        continue;
      }

      uploadedImages.push(imageData);
    }

    // 블로그 글의 has_images 필드 업데이트
    if (uploadedImages.length > 0) {
      await supabase
        .from("blog_posts")
        .update({
          has_images: true,
          updated_at: new Date(),
        })
        .eq("id", postId);
    }

    // 활동 로그 기록
    if (uploadedImages.length > 0) {
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        blog_post_id: postId,
        action: "upload_images",
        notes: `${uploadedImages.length}개 이미지 업로드`,
        created_at: new Date(),
      });
    }

    // 응답 반환
    return NextResponse.json({
      success: true,
      data: uploadedImages,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("이미지 업로드 중 오류:", error);
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

// 블로그 글에 연결된 모든 이미지 조회
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const postId = params.id;

    // 관리자 권한 확인
    const { errorResponse } = await verifyUserRole(request, "admin");
    if (errorResponse) return errorResponse;

    // 이미지 목록 조회
    const { data, error } = await supabase
      .from("blog_images")
      .select("*")
      .eq("blog_post_id", postId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `이미지 목록 조회 오류: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("이미지 목록 조회 중 오류:", error);
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
