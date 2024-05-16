import { useState } from "react";

export const useUploadDoc = (url: string) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [docId, setDocId] = useState<string>();

  const manuallySetDocId = (docId: string) => setDocId(docId);

  const uploadDoc = async (file: File, walletAddr?: string) => {
    if (!walletAddr) {
      window.alert("You need to connect wallet first");
      return false;
    }
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("walletAddress", walletAddr);
    formData.append("file1", file);
    try {
      const response = await fetch(`${url}/me/gene-data-task`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to send coordinates");
      }
      const data = await response.json();
      setDocId(data.docId);

      setIsLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Not known error");
      }

      setIsLoading(false);
    }
  };

  return { uploadDoc, isLoading, error, docId, manuallySetDocId };
};
