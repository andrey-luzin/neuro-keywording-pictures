'use client';
import React, { FC, useCallback, useRef, useState } from 'react';
import cn from 'classnames';
import { Button } from "@/components/Button";
import { generateKeywords } from '@/api';

type UploadButtonProps = unknown;

export const UploadFiles: FC<UploadButtonProps> = () => {
  const [fileList, setFileList] = useState<File[]>([]);
  const [uploadingResults, setUploadingResults] =
    useState<({fileName: string, result?: any, error?: any})[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
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

  const handleUploadStart = useCallback(async () => {
    const results = [];
    setIsUploading(true);
    setUploadingResults([]);

    for (const file of fileList) {
      try {
        const result = await generateKeywords(file);
        results.push({ fileName: file.name, result });
      } catch (error: any) {
        results.push({ fileName: file.name, error: error.message });
      } finally {
        setIsUploading(false);
      }
    }
  
    if (results.length) {
      setUploadingResults(results);
    }
  }, [fileList]);

  return(
    <div className="upload-button flex flex-col gap-6">
      <div className='relative flex gap-4'>
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
        <Button onClick={handleButtonClick} disabled={isUploading}>Выбери директорию или файлы</Button>
        <Button
          view='success'
          disabled={!fileList.length || isUploading}
          onClick={handleUploadStart}
          loading={isUploading}
        >
          Начать загрузку
        </Button>
      </div>
      {
        uploadingResults.length ?
        <ul>
          {uploadingResults.map(({ fileName, result, error }) => (
            <li key={fileName} className='leading-7'>
              {fileName}:{' '}
              <strong className={cn({'text-green-700': !error }, {'text-red-500': error})}>
                {result ? 'Выполнено' : error || 'Неизвестная ошибка'}
              </strong>
            </li>
          ))}
        </ul>
        : null
      }
    </div>
  );
};
