from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.database.db import get_db, DBAlert
from backend.models.alert_model import SOCAlert
from typing import List

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/", response_model=List[SOCAlert])
async def get_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBAlert).order_by(DBAlert.timestamp.desc()).limit(100))
    alerts = result.scalars().all()
    return alerts

