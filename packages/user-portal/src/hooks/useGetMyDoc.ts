import { useState } from "react";
import { Task } from "../model/Task";

export const useGetMyDocId = (url: string) => {
  const [error, setError] = useState<string | null>(null);
  const [taskDoc, setTaskDoc] = useState<Task>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchDocIdSession = async (docId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${url}/me/gene-data-task/${docId}/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to send coordinates");
      }
      const task = await response.json();
      setTaskDoc(task);

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

  return { fetchDocIdSession, isLoading, error, taskDoc };
};
