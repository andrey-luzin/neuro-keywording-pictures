import React, { FC, useCallback, useRef, useState } from 'react';
import { parse } from 'papaparse';

import { Button } from '../Button';
import { ChatGPTGenerateKeywordsResponse, GenerateKeywordsResultType } from '@/types/chatGPT';

type UploadCSVProps = {
  data: GenerateKeywordsResultType[],
  setData: (data: GenerateKeywordsResultType[]) => void,
  setError: (text: string) => void,
  onClick: () => void,
};

export const UploadCSV: FC<UploadCSVProps> = ({ data, setData, setError, onClick }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = useCallback(() => {
    onClick();
    inputRef.current?.click();
  }, [onClick]);

  const detectDelimiter = (csvContent: string): string => {
    const delimiterLine = csvContent.split("\n")[0];
    const delimiters = [",", ";", "\t"];
    const counts = delimiters.map((delim) => {
      return {
        delim,
        count: (delimiterLine.match(new RegExp(`\\${delim}`, "g")) || []).length,
      }
    });

    return counts.reduce((a, b) => (a.count > b.count ? a : b)).delim;
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const uploadedFile = files[0];

    const fileText = await uploadedFile.text();
    const detectedDelimiter = detectDelimiter(fileText);
    
    parse(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      delimiter: detectedDelimiter,
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

        setLoading(false);
        if (!mappedData.length) {
          return setError('Данных в CSV нет');
        }
        
        setData(mappedData);
      },
      error: (error) => {
        setLoading(false);
        setError(`Ошибка при чтении CSV: ${error.message}`)
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
      <Button onClick={handleButtonClick} loading={loading}>
        Загрузить CSV и обновить метаданные
      </Button>
    </div>
  );
};
