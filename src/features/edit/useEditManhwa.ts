import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePersonalMetadata, type UpdatePersonalMetadataInput } from '../../domain/usecases/UpdatePersonalMetadata';
import { updateReadingProgress, type UpdateReadingProgressInput } from '../../domain/usecases/UpdateReadingProgress';

export function useEditManhwa(manhwaId: string) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const saveChanges = async (
    personalInput: UpdatePersonalMetadataInput,
    progressInput: UpdateReadingProgressInput
  ) => {
    setIsLoading(true);
    try {
      await updatePersonalMetadata(personalInput);
      await updateReadingProgress(progressInput);
      navigate(`/details/${manhwaId}`);
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { saveChanges, isLoading };
}
