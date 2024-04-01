import { compress } from "image-conversion";
import AWS from "aws-sdk";
import { removeExtension } from "./utils";

export const compressFile = (file: File, quality: number): Promise<File> => {
  return compress(file, { quality }) // 이미지 압축
    .then((compressedBlob: Blob) => {
      // Blob 객체를 사용하여 새로운 File 객체 생성
      const compressedFile = new File([compressedBlob], file.name, {
        type: "image/jpeg",
      });
      return compressedFile;
    });
};

export const cropImage = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const img = new Image();

      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // 4:5 비율로 크롭
        const targetRatio = 4 / 5;
        let width = img.width;
        let height = img.height;

        // 이미지의 가로/세로 비율에 따라 크롭 영역 설정
        if (img.width / img.height > targetRatio) {
          width = img.height * targetRatio;
        } else {
          height = img.width / targetRatio;
        }

        const x = 0;
        const y = 0;

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, x, y, width, height, 0, 0, width, height);

        // 리사이징 및 크롭된 이미지 데이터를 반환
        canvas.toBlob((blob) => {
          blob?.stream();
          Object.defineProperty(blob, "name", { value: file.name }); // 이걸 하지 않으면 filename이 속성에 담기지 않음.
          // console.log(blob, 'blob');
          resolve(blob); // 반환.
        }, file.type);
      };
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const KEY = "AKIATHRMURH62Z4UFOYA";
const SECRETKEY = "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";

const s3 = new AWS.S3({
  accessKeyId: KEY,
  secretAccessKey: SECRETKEY,
  region: "ap-northeast-2",
});

export const uploadToS3 = async (
  file: File,
  isCroped?: boolean
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const filename = removeExtension(file.name);
    // 업로드 명세 정의
    const params = {
      ACL: "public-read",
      Bucket: "habitstorage", // S3 버킷 이름
      Key: isCroped ? `${filename}_thumbnail` : filename, // 파일 이름
      Body: file, // 업로드할 파일 데이터
      ContentType: "image/jpeg",
    };

    // 업로드
    s3.upload(params, (err: Error, data: any) => {
      if (err) {
        console.error("S3 업로드 오류:", err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
