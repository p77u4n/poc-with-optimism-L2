from typing import final
import hashlib
import urllib.request

from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from returns.result import safe
from port.gene_file_storage.base import FileReaderBase


@final
class FileReaderAES256(FileReaderBase):
    def __init__(self, secret_key: str, secret_iv: str) -> None:
        self.key = hashlib.sha512(secret_key.encode()).hexdigest()[:32].encode()
        self.iv = hashlib.sha512(secret_iv.encode()).hexdigest()[:16].encode()

    def _get_url_by_id(self, file_id: str):
        return file_id

    @safe
    def read_file(self, file_id: str) -> str:
        request = urllib.request.Request(
            self._get_url_by_id(file_id), headers={"User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(request) as f:
            encrypted_data = f.read()
            cipher = Cipher(
                algorithms.AES(self.key), modes.CBC(self.iv), backend=default_backend()
            )
            decryptor = cipher.decryptor()
            decrypted_data = decryptor.update(encrypted_data) + decryptor.finalize()
            unpadder = padding.PKCS7(algorithms.AES256.block_size).unpadder()
            unpadded_data = unpadder.update(decrypted_data) + unpadder.finalize()
            return unpadded_data.decode(encoding="utf-8")
