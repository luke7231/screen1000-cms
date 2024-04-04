"use client";

import React, { useState } from "react";
import { insertPages } from "./lib/action";
import { mergeArrays } from "./lib/utils";
import { compressFile, cropImage, uploadToS3 } from "./lib/file-utils";

const ImageUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<any>([]);
  const [result, setResult] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const filesSelectedHandler = (event: any) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files as File[]);

    const previews = files.map((file) => URL.createObjectURL(file as Blob));
    setPreviewUrls(previews);
  };

  const handleOpti = async () => {
    if (selectedFiles.length === 0) {
      alert("이미지를 선택하세요.");
      return;
    }

    setLoading(true);

    // 🧹 이미지 최적화
    try {
      const compressedFilesPromises = selectedFiles.map((file: File) => {
        return compressFile(file, 0.5);
      });

      // 압축된 이미지로 선택된 파일 업데이트
      Promise.all(compressedFilesPromises)
        .then((compressedFiles: File[]) => {
          // 새로 압축된 파일로 선택된 파일 업데이트
          setSelectedFiles(compressedFiles);
          console.log("최적화 완료 🚀");
        })
        .catch((error: any) => {
          console.error("압축된 이미지를 업데이트하는 도중 오류 발생:", error);
        });
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      console.log("이미지를 선택하세요.");
      return;
    }
    setLoading(true);

    // 🚀 업로드
    try {
      // 1️⃣ full image upload
      const uploadPromises = selectedFiles.map((file: File) => {
        return uploadToS3(file as File);
      });
      const results = await Promise.all(uploadPromises);

      // 2️⃣ croped image upload
      const uploadCropedImgPromises = selectedFiles.map((file: File) => {
        return cropImage(file).then((resizedImage) => {
          return uploadToS3(resizedImage as File, true);
        });
      });
      const resultCropped = await Promise.all(uploadCropedImgPromises);

      console.log("S3에 업로드된 이미지 URL:", results);
      console.log("S3에 업로드된 이미지 THUMBNAIL URL:", resultCropped);

      const mergedArray = mergeArrays(resultCropped, results); // DB 업로드하기 편하게 머지.
      setResult(mergedArray);
    } catch (error) {
      console.error("이미지 처리 오류:", error);
    }

    setLoading(false);
  };

  const insertPageWithArray = insertPages.bind(null, result);

  return (
    <div className="p-24">
      <input
        type="file"
        accept="image/*"
        onChange={filesSelectedHandler}
        multiple
      />
      <div className="flex gap-4 ">
        {previewUrls.map((previewUrl: string, index: number | string) => (
          <img
            key={index}
            src={previewUrl}
            alt={`Preview ${index}`}
            className="border border-solid border-black"
            style={{ maxWidth: "100%", maxHeight: "200px" }}
          />
        ))}
      </div>
      <div className="flex gap-4 mt-12">
        {result.map(
          (
            resultImageUrl: { img: string; key: string; thumbnail: string },
            index: number | string
          ) => (
            <div key={index}>
              <img
                key={index}
                src={resultImageUrl.thumbnail}
                alt={`Result ${index}`}
                style={{ maxWidth: "100%", maxHeight: "200px" }}
              />
              {/* <h3>{resultImageUrl}</h3> */}
            </div>
          )
        )}
      </div>

      <button
        className="mt-4 mr-4 border border-black p-2 rounded-lg"
        onClick={handleOpti}
      >
        최적화 🚀
      </button>

      <button
        className="mt-4 mr-4 border border-black p-2 rounded-lg"
        onClick={handleSubmit}
      >
        업로드 ⬆️
      </button>

      <form action={insertPageWithArray} className="inline-block">
        <button className="mt-4 mr-4 border border-black p-2 rounded-lg">
          객체 생성 💾
        </button>
      </form>
    </div>
  );
};

export default ImageUpload;
