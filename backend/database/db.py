from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, Text, JSON
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from backend.config import settings
from backend.models.alert_model import SOCAlert

engine = create_async_engine(settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///"))
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

class DBUser(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Integer, default=True) # SQLite uses 0/1 for bool

class DBAlert(Base):
    __tablename__ = "alerts"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    rule_id: Mapped[str] = mapped_column(String)
    rule_description: Mapped[str] = mapped_column(String)
    severity: Mapped[int] = mapped_column(Integer)
    source_ip: Mapped[str] = mapped_column(String)
    dest_ip: Mapped[str] = mapped_column(String, nullable=True)
    agent_name: Mapped[str] = mapped_column(String)
    agent_id: Mapped[str] = mapped_column(String)
    full_log: Mapped[str] = mapped_column(Text)
    ai_analysis: Mapped[str] = mapped_column(Text, nullable=True)
    ai_priority: Mapped[int] = mapped_column(Integer, nullable=True)
    ai_explanation: Mapped[str] = mapped_column(Text, nullable=True)
    recommended_actions: Mapped[list] = mapped_column(JSON, default=[])
    mitre_techniques: Mapped[list] = mapped_column(JSON, default=[])

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with SessionLocal() as session:
        yield session

async def save_alert(alert_data: SOCAlert):
    async with SessionLocal() as db:
        try:
            db_alert = DBAlert(
                id=alert_data.id,
                timestamp=alert_data.timestamp,
                rule_id=alert_data.rule_id,
                rule_description=alert_data.rule_description,
                severity=alert_data.severity,
                source_ip=alert_data.source_ip,
                dest_ip=alert_data.dest_ip,
                agent_name=alert_data.agent_name,
                agent_id=alert_data.agent_id,
                full_log=alert_data.full_log,
                ai_analysis=alert_data.ai_analysis,
                ai_priority=alert_data.ai_priority,
                ai_explanation=alert_data.ai_explanation,
                recommended_actions=alert_data.recommended_actions,
                mitre_techniques=alert_data.mitre_techniques
            )
            db.add(db_alert)
            await db.commit()
        except IntegrityError as e:
            await db.rollback()
            print(f"Database Integrity Error: {e}")
