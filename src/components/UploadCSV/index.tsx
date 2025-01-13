import React, { FC, useRef } from 'react';
import { parse } from 'papaparse';

import { Button } from '../Button';
import { ChatGPTGenerateKeywordsResponse, GenerateKeywordsResultType } from '@/types/chatGPT';

type UploadCSVProps = {
  data: GenerateKeywordsResultType[],
  setData: (data: GenerateKeywordsResultType[]) => void
};

export const UploadCSV: FC<UploadCSVProps> = ({ data, setData }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadedFile = files[0];

    parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data as ChatGPTGenerateKeywordsResponse[];
        
        const mappedData = rows.map((row) => {
          const fileData = data.find(file => file.fileName === row.fileName);
          return fileData ? {
            ...fileData,
            fileName: row.fileName || uploadedFile.name,
            keywords: row.keywords || '',
            description: row.description || '',
          } : null;
        }).filter(file => file) as GenerateKeywordsResultType[];

        setData(mappedData);
      },
      error: (error) => {
        console.error('Ошибка при чтении CSV:', error.message);
      },
    });
  };

  return(
    <div className="">
      <input
        className="invisible absolute"
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
      />
      <Button onClick={handleButtonClick}>
        Загрузить CSV и обновить метаданные
      </Button>
    </div>
  );
};
