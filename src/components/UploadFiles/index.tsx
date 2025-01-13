'use client';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { Button } from "@/components/Button";
import { checkResults, generateKeywords } from '@/api';
import { Spinner } from '../Spinner';
import { ChatGPTGenerateKeywordsResponse, ChatGptModels, GenerateKeywordsResultType } from '@/types/chatGPT';
import { CSVDownloading } from '../CSVDownloading';
import { UpdateExif } from '../UpdateExif';
import { UploadCSV } from '../UploadCSV';
import { Select } from '../Select';

type UploadButtonProps = unknown;

const models = [
  {
    label: ChatGptModels.GPT4o,
    value: ChatGptModels.GPT4o,
  },
  {
    label: ChatGptModels.GPT4oMini,
    value: ChatGptModels.GPT4oMini,
  },
  {
    label: ChatGptModels.GPT4oLatest,
    value: ChatGptModels.GPT4oLatest,
  },
];

const chatGPTActiveModel = 'chatGPTActiveModel';

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
  const [checkingData, setCheckingData] = useState<GenerateKeywordsResultType[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeModel, setActiveModel] = useState<ChatGptModels | string>(models[0].value);

  useEffect(() => {
    if (typeof window !== undefined) {
      const name = localStorage.getItem(chatGPTActiveModel);
      if (name) {
        setActiveModel(name)
      }
    }
  }, []);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  useEffect(() => {
    const fetchChecking = async () => {
      const results: ChatGPTGenerateKeywordsResponse[] = [];
      for (const file of successfulUploadingResults) {
        const response = await checkResults(file, activeModel as ChatGptModels);
        results.push(response);
      }

      return results;
    }
    if (
      fileList.length &&
      successfulUploadingResults.length &&
      fileList.length === successfulUploadingResults.length
    ) {
      fetchChecking().then((results) => {
        const resultsWithFiles: GenerateKeywordsResultType[] = results.map((result) => {
          const successfulResult = successfulUploadingResults.find(
            (successfulResult) => successfulResult.fileName === result.fileName
          );
          
          if (successfulResult) {
            return {
              ...result,
              file: successfulResult.file,
            };
          }
        
          return undefined;
        }).filter((result): result is GenerateKeywordsResultType => result !== undefined);

        setCheckingData(resultsWithFiles)
      });
    }
  },[fileList, successfulUploadingResults, activeModel]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleUploadStart = useCallback(async (files: File[]) => {
    const results = [];
    const successfulResults: GenerateKeywordsResultType[] = [];
    const erroneousFiles = [];
    setErroneousUploadingFiles([]);
    setIsUploading(true);

    for (const file of files) {
      try {
        const result = await generateKeywords(file, activeModel as ChatGptModels);
        const { fileName, ...rest } = result;
        const resultData = { fileName: file.name || fileName, ...rest };
        successfulResults.push({...resultData, file});
        results.push(result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        erroneousFiles.push(file);
        results.push({ fileName: file.name, error: error.message });
      }
    }
    setIsUploading(false);

    setSuccessfulUploadingResults(prevState => [...prevState, ...successfulResults]);
    setErroneousUploadingFiles(erroneousFiles);
    return results
  }, [activeModel]);

  const handleInitUploadStart = useCallback(async () => {
    setIsUploading(true);
    setUploadingResults([]);

    await handleUploadStart(fileList).then((results) => {
      if (results.length) {
        setUploadingResults(results);
        setInitUploadingCompleted(true);
      }
    })
  }, [fileList, handleUploadStart]);

  const handleErrorsUploadStart = useCallback(async () => {
    setErroneousUploadingFiles([]);

    await handleUploadStart(erroneousUploadingFiles).then((results) => {
      if (results.length) {
        setUploadingResults([...successfulUploadingResults, ...results]);
      }
    })
  }, [erroneousUploadingFiles, handleUploadStart, successfulUploadingResults]);


  const handleSelectChange = (value: string) => {
    setActiveModel(value);
    localStorage.setItem(chatGPTActiveModel, value);
  }

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
          <>
            <Select options={models} onChange={handleSelectChange} selected={activeModel} />
            <Button
              view='success'
              disabled={!fileList.length || isUploading}
              onClick={handleInitUploadStart}
              loading={isUploading}
            >
              Начать загрузку
            </Button>
          </>
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
        checkingData && checkingData.length ?
        <div className='flex gap-4 flex-wrap'>
          <CSVDownloading data={checkingData} />
          <div className='flex gap-4 ml-auto'>
            <UploadCSV data={checkingData} setData={data => setCheckingData(data)} />
            <UpdateExif data={checkingData} />
          </div>
        </div>
        : null
      }
    </div>
  );
};
