import { ChatGPTGenerateKeywordsResponse } from '@/types/chatGPT';
import React, { FC, useCallback, useState } from 'react';
import { Button } from '../Button';
import { generateCSV } from '@/api';
import { getCurrentTime } from '@/utils';

type CSVDownloadingProps = {
  data: ChatGPTGenerateKeywordsResponse[],
  className?: string,
};

export const CSVDownloading: FC<CSVDownloadingProps> = ({ data, className }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const downloadCsv =  useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await generateCSV(data);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `keywords_${getCurrentTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Ошибка при скачивании CSV:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  return(
    <div className={className}>
      <Button onClick={downloadCsv} view="success" loading={isLoading}>Скачать CSV</Button>
    </div>
  );
};
