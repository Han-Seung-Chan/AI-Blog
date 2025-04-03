import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

async function crawlRestaurantInfo(url: string) {
  const data = {
    introduction: "",
    status: "success",
  };

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // 사용자 에이전트 설정
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 10000 });

    // iframe 요소를 찾을 때까지 대기
    try {
      await page.waitForSelector("iframe#entryIframe", { timeout: 3000 });

      // iframe의 src 속성 가져오기
      const frameSrc = await page.evaluate(() => {
        const iframe = document.querySelector("iframe#entryIframe");
        return iframe ? iframe.getAttribute("src") : null;
      });

      if (!frameSrc) {
        throw new Error("iframe src를 찾을 수 없습니다");
      }

      // iframe 내부의 콘텐츠에 접근하기 위해 직접 iframe URL로 이동
      await page.goto(frameSrc, { waitUntil: "networkidle2", timeout: 5000 });

      // 페이지 로딩 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        // 정보 탭 클릭 로직 수정
        await page.evaluate(() => {
          const infoTabs = Array.from(
            document.querySelectorAll<HTMLAnchorElement>("a.tpj9w._tab-menu"),
          );

          const infoTab = infoTabs.find(
            (el) => el.textContent && el.textContent.includes("정보"),
          );

          if (infoTab) {
            infoTab.click();
            return true;
          }
          return false;
        });

        // 탭 전환 후 콘텐츠 로드 대기
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 소개 텍스트 추출
        const introductionText = await page.evaluate(() => {
          const introElement = document.querySelector(".T8RFa");
          return introElement?.textContent?.trim() || null;
        });

        if (introductionText) {
          // 데이터 객체에 소개 텍스트 추가
          data.introduction = introductionText;
        } else {
          console.log("소개 텍스트를 찾을 수 없습니다.");
        }
      } catch (e) {
        console.error("소개 텍스트 추출 실패:", e);
      }
    } catch (e) {
      data.status = "failed";
      console.error("장소를 찾을 수 없거나 iframe 접근 실패:", e);
    }
  } catch (error: unknown) {
    data.status = "error";
    console.error("크롤링 오류:", error);
  } finally {
    await browser.close();
  }

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await crawlRestaurantInfo(body.url);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("API 처리 중 오류:", error);
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
