from dataclasses import dataclass
from enum import Enum
import random
import uuid
from jsonpickle import json
from returns.maybe import Maybe, Some
from returns.result import Result, ResultE, Success, safe
from returns.future import future_safe

# from returns.result import ResultE

from event_broker_base import DomainEvent
from models.task_events import Events


class Status(Enum):
    FAILED = "FAILED"
    PROCESSING = "PROCESSING"
    FINISH = "FINISH"
    PENDING = "PENDING"


@safe
def parse_status(v: str):
    return Status(v)


@dataclass()
class FailReason:
    value: str


def parse_reason(value) -> ResultE[FailReason]:
    return Result.from_value(FailReason(value))


@dataclass()
class RunningResult:
    value: str


def parse_result(value) -> ResultE[RunningResult]:
    return Result.from_value(RunningResult(value))


@dataclass()
class Task:
    doc_id: uuid.UUID
    status: Status
    fail_reason: Maybe[FailReason]
    result: Maybe[RunningResult]
    gene_file: str


def parse_task(
    doc_id: uuid.UUID,
    status: str,
    fail_reason: Maybe[str],
    result: Maybe[str],
    file_gene: str,
) -> ResultE[Task]:
    domain_status = parse_status(status)
    match [domain_status, fail_reason, result]:
        case [
            Success(Status.PROCESSING | Status.PENDING),
            Maybe.empty,
            Maybe.empty,
        ]:
            return Result.from_value(
                Task(
                    doc_id, domain_status.unwrap(), Maybe.empty, Maybe.empty, file_gene
                )
            )

        case [Success(Status.FAILED), Some(raw_reason), Maybe.empty]:
            return Result.do(
                Task(
                    doc_id=doc_id,
                    status=Status.FAILED,
                    fail_reason=Maybe.from_value(r),
                    result=Maybe.empty,
                    gene_file=file_gene,
                )
                for r in parse_reason(raw_reason)
            )
        case [Success(Status.FINISH), Maybe.empty, Some(raw_result)]:
            return Result.do(
                Task(
                    doc_id=doc_id,
                    status=Status.FAILED,
                    fail_reason=Maybe.empty,
                    result=Maybe.from_value(r),
                    gene_file=file_gene,
                )
                for r in parse_result(raw_result)
            )
        case _:
            return Result.from_failure(
                Exception(
                    f"task is not in correct status:  status={domain_status}, fail_reason={fail_reason}, result={result}"
                )
            )


def clone_task(task: Task):
    return Task(
        doc_id=task.doc_id,
        result=task.result,
        fail_reason=task.fail_reason,
        gene_file=task.gene_file,
        status=task.status,
    )


def start_task(task: Task):
    isPending = task.status == Status.PENDING
    if isPending is False:
        return Result.from_failure(Exception("CANNOT_START_A_NON_PENDING_TASK"))
    else:
        updated_task = clone_task(task)
        updated_task.status = Status.PROCESSING
        return Result.from_value(
            [updated_task, [DomainEvent(Events.TASK_START.value, {"task": task})]]
        )


class RiskScore(Enum):
    EXTREMELY_HIGH = 1
    HIGH = 2
    SLIGHTLY_HIGH = 3
    LOW = 4


@future_safe
async def running_task(task: Task, genomeContent: str):
    # machine learning algorithm main process be put at here
    # is_failed = bool(random.randint(0, 1))
    # for simplicity, alwasy true
    is_failed = False
    updated_task = clone_task(task)
    score = random.choice(list(RiskScore))
    print("genomeContent ", genomeContent)
    match is_failed:
        case False:
            updated_task.result = Maybe.from_value(
                parse_result(
                    json.encode(
                        {
                            "proof": "proof",
                            "hash": "doc_hash",
                            "risk_score_tag": score.name,
                            "risk_score_ind": score.value,
                        }
                    )
                ).unwrap()
            )  # panic here
            updated_task.status = Status.FINISH
            return [
                updated_task,
                [DomainEvent(Events.TASK_FINISH.value, {"task": updated_task})],
            ]
        case True:
            updated_task.fail_reason = Maybe.from_value(
                parse_reason("FAILED BY RANDOM").unwrap()
            )  # panic here true
            updated_task.status = Status.FAILED
            return [
                updated_task,
                [DomainEvent(Events.TASK_FAILED.value, {"task": updated_task})],
            ]
