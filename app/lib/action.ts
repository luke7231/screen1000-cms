"use server";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

interface Page {
  key: string;
  img: string;
  thumbnail: string;
  tag: string;
}

export async function insertPages(pages: Page[], tag: string) {
  try {
    console.log("데이터 삽입 시동");

    await Promise.all(
      pages.map(async (page) => {
        await sql`INSERT INTO page (name, image, thumbnail, tag) VALUES (${page.key}, ${page.img}, ${page.thumbnail}, ${tag})`;
      })
    );

    console.log("데이터 삽입이 완료되었습니다.");
    revalidatePath("/crop");
  } catch (error) {
    console.error("데이터 삽입 중 오류 발생:", error);
  }
}
