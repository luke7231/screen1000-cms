import { S3UploadPayload } from "./file-utils";

interface ResultPage {
  key: string;
  img: string;
  thumbnail: string;
}

export const mergeArrays = (
  arr1: S3UploadPayload[],
  arr2: S3UploadPayload[]
): ResultPage[] => {
  const mergedArray: ResultPage[] = [];

  const map: { [key: string]: any } = {};

  // arr1 항목을 맵에 추가
  for (const item of arr1) {
    const key = item.key.split("_")[0].split("/")[1];
    map[key] = { ...map[key], thumbnail: item.Location };
  }

  // arr2 항목을 맵에 추가하거나 업데이트
  for (const item of arr2) {
    const key = item.key.split("/")[1];
    if (map[key]) {
      map[key].img = item.Location;
    } else {
      map[key] = { img: item.Location };
    }
  }

  // 맵의 값을 배열에 추가
  for (const key in map) {
    const { img, thumbnail } = map[key];
    mergedArray.push({ key, img, thumbnail });
  }

  return mergedArray;
};

export const convertArray = (arr1: S3UploadPayload[]) => {
  const newArray = arr1.map((page) => {
    return {
      key: page.key.split("/")[1],
      img: page.Location,
      thumbnail: page.Location,
    };
  });
  console.log(newArray);
  return newArray;
};

// Delete like '.jpg', '.webp', '.avif' ... etc
export const removeExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return filename; // 파일 이름에 확장자가 없는 경우
  }
  return filename.substring(0, lastDotIndex);
};
