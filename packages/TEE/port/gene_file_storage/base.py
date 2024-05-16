import abc

from returns.result import ResultE


class FileReaderBase(abc.ABC):
    @abc.abstractmethod
    def read_file(self, file_id: str) -> ResultE[str]:
        pass
