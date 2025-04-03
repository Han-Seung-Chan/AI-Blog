import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

// 크롤링 상태 추적용 카운터
let noPlaces = 0;

async function crawlRestaurantInfo(
  restaurantName: string,
  location: string = "",
) {
  // 기본 데이터 구조 설정
  const data = {
    name: restaurantName,
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

    // 검색어에 지역을 포함하여 정확도를 높임
    const searchQuery = `${restaurantName} ${location}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://map.naver.com/p/search/${encodedQuery}`;

    console.log(`크롤링 시작: ${searchQuery}`);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // iframe 요소를 찾을 때까지 대기
    try {
      await page.waitForSelector("iframe#entryIframe", { timeout: 10000 });
      console.log("iframe 찾음");

      // iframe의 src 속성 가져오기
      const frameSrc = await page.evaluate(() => {
        const iframe = document.querySelector("iframe#entryIframe");
        return iframe ? iframe.getAttribute("src") : null;
      });

      if (!frameSrc) {
        throw new Error("iframe src를 찾을 수 없습니다");
      }

      console.log("iframe src:", frameSrc);

      // iframe 내부의 콘텐츠에 접근하기 위해 직접 iframe URL로 이동
      await page.goto(frameSrc, { waitUntil: "networkidle2", timeout: 30000 });

      // 페이지 로딩 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        // 정보 탭 클릭 로직 수정
        await page.evaluate(() => {
          // HTMLAnchorElement로 타입 단언하여 click 메서드에 접근 가능하도록 함
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
        console.log("정보 탭으로 이동 성공");

        // 소개 텍스트 추출 로직 수정
        const introductionText = await page.evaluate(() => {
          const introElement = document.querySelector(".T8RFa");
          return introElement?.textContent?.trim() || null;
        });

        if (introductionText) {
          console.log("소개 텍스트 추출 성공:");
          console.log(introductionText);

          // 데이터 객체에 소개 텍스트 추가
          data.introduction = introductionText;
        } else {
          console.log("소개 텍스트를 찾을 수 없습니다.");
        }
      } catch (e) {
        console.error("소개 텍스트 추출 실패:", e);
      }
    } catch (e) {
      noPlaces++;
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

    const result = await crawlRestaurantInfo(body.name, body.location || "");
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
