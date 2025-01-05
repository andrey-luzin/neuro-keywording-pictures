'use client';
import React, { FC, useCallback, useRef, useState } from 'react';
import { Button } from "@/components/Button";

type UploadButtonProps = unknown;

export const UploadFiles: FC<UploadButtonProps> = () => {
  const [fileList, setFileList] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (files) {
      const filteredFiles = Array.from(files).filter((file) => {
        return file.type && file.type.includes('image');
      });

      setFileList(filteredFiles);
      console.log('handleInputChange', filteredFiles);
    }
  };

  const handleUploadStart = useCallback(() => {
  }, []);

  return(
    <div className="upload-button relative flex gap-4">
      <input
        className="invisible absolute"
        ref={inputRef}
        type="file"
        /* @ts-expect-error: webkitdirectory is working in modern browsers */
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleInputChange}
      />
      <Button onClick={handleButtonClick}>Выбери директорию или файлы</Button>
      <Button
        view='success'
        disabled={!fileList.length}
        onClick={handleUploadStart}
      >
        Начать загрузку
      </Button>
    </div>
  );
};
