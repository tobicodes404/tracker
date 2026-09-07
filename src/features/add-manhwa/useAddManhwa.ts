import { useState } from 'react';
import { createManualManhwa, type CreateManualManhwaInput } from '../../domain/usecases/CreateManualManhwa';

export function useAddManhwa() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitManualManhwa = async (input: CreateManualManhwaInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const id = await createManualManhwa(input);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create manhwa';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { submitManualManhwa, isLoading, error };
}
