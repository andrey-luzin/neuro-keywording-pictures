import React, { FC, useCallback, useState } from 'react';

import { Button } from '../Button';
import { GenerateKeywordsResultType } from '@/types/chatGPT';
import { updateExif } from '@/api';

type UpdateExifProps = {
  data: GenerateKeywordsResultType[],
};

export const UpdateExif: FC<UpdateExifProps> = ({ data }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUpdateExif = useCallback(async () => {
    setIsLoading(true);
    
    await updateExif(data).then(async (response) => {
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "updated-images.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }).finally(() => {
      setIsLoading(false);
    })
  }, [data]);
  
  return(
    <div className="">
      <Button onClick={handleUpdateExif} view="success" loading={isLoading}>
        Обновить Exif и скачать архив
      </Button>
    </div>
  );
};
