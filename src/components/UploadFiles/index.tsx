'use client';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { Button } from "@/components/Button";
import { checkResults, generateKeywords } from '@/api';
import { Spinner } from '../Spinner';
import { ChatGPTGenerateKeywordsResponse, GenerateKeywordsResultType } from '@/types/chatGPT';
import { CSVDownloading } from '../CSVDownloading';

type UploadButtonProps = unknown;

export const UploadFiles: FC<UploadButtonProps> = () => {
  const [fileList, setFileList] = useState<File[]>([]);
  const [uploadingResults, setUploadingResults] =
    useState<ChatGPTGenerateKeywordsResponse[]>([]);
  const [erroneousUploadingFiles, setErroneousUploadingFiles] =
    useState<File[]>([]);
  const [successfulUploadingResults, setSuccessfulUploadingResults] = useState<GenerateKeywordsResultType[]>([]);
  // Cостояние, что изначальная загрузка завершена
  const [initUploadingCompleted, setInitUploadingCompleted] = useState<boolean>(false);
  // Состояние для отображения загрузки для генерации ключевых слов
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [filesCount, setFilesCount] = useState<number>(0);
  const [checkingData, setCheckingData] = useState<GenerateKeywordsResultType[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  useEffect(() => {
    const results: ChatGPTGenerateKeywordsResponse[] = [];
    const fetchChecking = async () => {
      for (const file of successfulUploadingResults) {
        const response = await checkResults(file);
        results.push(response);
      }
    }
    if (
      filesCount &&
      successfulUploadingResults.length &&
      filesCount - 1 === successfulUploadingResults.length
    ) {
      fetchChecking().then(() => {
        const resultsWithFiles: GenerateKeywordsResultType[] = results.map((result) => {
          return successfulUploadingResults.find((successfulResult) => {
            if (successfulResult.fileName === result.fileName) {
              return { ...result, file: successfulResult.file };
            }
          })
        }).filter((result): result is GenerateKeywordsResultType => result !== undefined);

        setCheckingData(resultsWithFiles)
      });
    }
  },[filesCount, successfulUploadingResults]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilesCount(event.target.files?.length || 0);
    
    setUploadingResults([]);
    setErroneousUploadingFiles([]);
    setSuccessfulUploadingResults([]);
    setInitUploadingCompleted(false);
    setCheckingData(null)
    const { files } = event.target;

    if (files) {
      const filteredFiles = Array.from(files).filter((file) => {
        return file.type && file.type.includes('image');
      });

      setFileList(filteredFiles);
    }
  };

  const handleUploadStart = async (files: File[]) => {
    const results = [];
    const successfulResults: GenerateKeywordsResultType[] = [];
    const erroneousFiles = [];
    setErroneousUploadingFiles([]);
    setIsUploading(true);

    for (const file of files) {
      try {
        const result = await generateKeywords(file);
        const { fileName, ...rest } = result;
        const resultData = { fileName: file.name || fileName, ...rest };
        successfulResults.push({...resultData, file});
        results.push(result);
      } catch (error: any) {
        erroneousFiles.push(file);
        results.push({ fileName: file.name, error: error.message });
      }
    }
    setIsUploading(false);

    setSuccessfulUploadingResults(prevState => [...prevState, ...successfulResults]);
    setErroneousUploadingFiles(erroneousFiles);
    return results
  };

  const handleInitUploadStart = useCallback(async () => {
    setIsUploading(true);
    setUploadingResults([]);

    await handleUploadStart(fileList).then((results) => {
      if (results.length) {
        setUploadingResults(results);
        setInitUploadingCompleted(true);
      }
    })
  }, [fileList]);

  const handleErrorsUploadStart = useCallback(async () => {
    setErroneousUploadingFiles([]);

    await handleUploadStart(erroneousUploadingFiles).then((results) => {
      if (results.length) {
        setUploadingResults([...successfulUploadingResults, ...results]);
      }
    })
  }, [erroneousUploadingFiles, successfulUploadingResults]);

  return(
    <div className="upload-button flex flex-col gap-6 h-full">
      <div className='relative flex gap-4 shrink-0 items-center'>
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
        {
          !isUploading && !initUploadingCompleted &&
          <Button
            view='success'
            disabled={!fileList.length || isUploading}
            onClick={handleInitUploadStart}
            loading={isUploading}
          >
            Начать загрузку
          </Button>
        }
        {
          !isUploading && erroneousUploadingFiles.length ?
          <Button
            view='success'
            disabled={!fileList.length || isUploading}
            onClick={handleErrorsUploadStart}
            loading={isUploading}
          >
            Перезапустить файлы с ошибками
          </Button>
          : null
        }
        {isUploading && <Spinner size={6} />}
      </div>
      {
        uploadingResults.length ?
        <ul className='overflow-auto border border-gray-200 rounded p-2'>
          {uploadingResults.map(({ fileName, error }) => (
            <li key={fileName} className='leading-7'>
              {fileName}:{' '}
              <strong className={cn({'text-green-700': !error }, {'text-red-500': error})}>
                {!error ? 'Выполнено' : error || 'Неизвестная ошибка'}
              </strong>
            </li>
          ))}
        </ul>
        : null
      }
      {
        erroneousUploadingFiles.length ?
        <footer className='shrink-0 flex gap-8 items-center'>
          <span>Содержатся ошибки.<br/> Все равно запустить проверку?</span>
          <Button view='alert'>Запустить проверку</Button>
        </footer>
        : null
      }
      {
        checkingData && checkingData.length &&
        <CSVDownloading data={checkingData} />
      }
    </div>
  );
};
