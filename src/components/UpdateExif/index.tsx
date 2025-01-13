import React, { FC, useCallback, useState } from 'react';

import { Button } from '../Button';
import { GenerateKeywordsResultType } from '@/types/chatGPT';
import { updateExif } from '@/api';
import { getCurrentTime } from '@/utils';

type UpdateExifProps = {
  data: GenerateKeywordsResultType[],
};

export const UpdateExif: FC<UpdateExifProps> = ({ data }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUpdateExif = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await updateExif(data);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `updated-images_${getCurrentTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`${error.message}`);
      } else {
        throw new Error("An unknown error occurred");
      } 
    } finally {
      setIsLoading(false);
    }
  }, [data]);
  
  return(
    <div className="">
      <Button onClick={handleUpdateExif} view="success" loading={isLoading}>
        Обновить Exif и скачать архив
      </Button>
    </div>
  );
};
