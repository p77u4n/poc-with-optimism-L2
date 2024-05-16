from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.orm import declarative_base
from sqlalchemy.types import Integer

Base = declarative_base()


class DMTask(Base):
    __tablename__ = "gene_analytic_tasks"
    result = Column(String)
    reason = Column(String)
    status = Column(String(16))
    doc_id = Column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    session_id = Column(Integer)
    gene_file = Column(String)
    created_at = Column(DateTime)


class DMDoc(Base):
    __tablename__ = "docs"
    id = Column(String, primary_key=True)
