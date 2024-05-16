from dataclasses import dataclass
from dino_seedwork_be import get_env


@dataclass
class ServiceConfig:
    max_number_of_concurent_job: int
    max_mocking_process_delay_minutes: float
    encryption_key: str
    encryption_iv: str


env_service_config = ServiceConfig(
    max_number_of_concurent_job=int(get_env("MAX_NUMBER_JOBS") or 1),
    max_mocking_process_delay_minutes=float(
        get_env("MAX_MOCKING_PROCESS_DELAY") or 0.2
    ),
    encryption_key=str(get_env("FILE_ENCRYPTED_SECRET_KEY")),
    encryption_iv=str(get_env("FILE_ENCRYPTED_SECRET_IV")),
)
