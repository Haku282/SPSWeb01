from datetime import date, datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
import os


class InventoryItem(BaseModel):
    lot_id: Optional[str] = Field(default=None, description="Lot identifier")
    product_id: Optional[int] = Field(default=None, description="Product identifier")
    product_name: str = Field(..., description="Drug name")
    batch_no: Optional[str] = Field(default=None, description="Batch number")
    quantity: int = Field(..., ge=0, description="Remaining stock quantity")
    expiry_date: str = Field(..., description="Expiry date (YYYY-MM-DD or DD/MM/YYYY)")


class RecommendationRequest(BaseModel):
    items: List[InventoryItem]


class RecommendationItem(BaseModel):
    priority: int
    lot_id: Optional[str]
    product_id: Optional[int]
    product_name: str
    batch_no: Optional[str]
    quantity: int
    expiry_date: str
    days_to_expiry: int
    risk_level: str


class RecommendationResponse(BaseModel):
    total_items: int
    recommendations: List[RecommendationItem]


def parse_expiry_date(value: str) -> date:
    """Parse common date formats used by FEFO payloads."""
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Unsupported date format: {value}")


def get_risk_level(days_to_expiry: int) -> str:
    if days_to_expiry < 0:
        return "EXPIRED"
    if days_to_expiry <= 30:
        return "HIGH"
    if days_to_expiry <= 90:
        return "MEDIUM"
    return "LOW"


def build_recommendations(items: List[InventoryItem]) -> RecommendationResponse:
    today = date.today()

    parsed = []
    for item in items:
        expiry = parse_expiry_date(item.expiry_date)
        days_left = (expiry - today).days
        parsed.append(
            {
                "lot_id": item.lot_id,
                "product_id": item.product_id,
                "product_name": item.product_name,
                "batch_no": item.batch_no,
                "quantity": item.quantity,
                "expiry": expiry,
                "days_to_expiry": days_left,
                "risk_level": get_risk_level(days_left),
            }
        )

    parsed.sort(key=lambda row: row["expiry"])

    recommendations: List[RecommendationItem] = []
    for index, row in enumerate(parsed, start=1):
        recommendations.append(
            RecommendationItem(
                priority=index,
                lot_id=row["lot_id"],
                product_id=row["product_id"],
                product_name=row["product_name"],
                batch_no=row["batch_no"],
                quantity=row["quantity"],
                expiry_date=row["expiry"].isoformat(),
                days_to_expiry=row["days_to_expiry"],
                risk_level=row["risk_level"],
            )
        )

    return RecommendationResponse(total_items=len(recommendations), recommendations=recommendations)


def create_db_engine() -> Optional[Engine]:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return None
    return create_engine(database_url, pool_pre_ping=True)


engine = create_db_engine()


app = FastAPI(title="SmartPharma AI Service", version="1.0.0")

allowed_origin = os.getenv("CORS_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}


@app.post("/api/v1/inventory-recommendation", response_model=RecommendationResponse)
def inventory_recommendation(payload: RecommendationRequest):
    try:
        return build_recommendations(payload.items)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/v1/inventory-lots")
def get_inventory_lots_from_db():
    if engine is None:
        raise HTTPException(
            status_code=500,
            detail="DATABASE_URL is not configured for AI service.",
        )

    with engine.connect() as conn:
        try:
            if engine.dialect.name.startswith("postgres"):
                sql = text(
                    """
                    SELECT
                        CAST(product_id AS TEXT) AS lot_id,
                        product_id,
                        product_name,
                        NULL AS batch_no,
                        quantity,
                        TO_CHAR(expiry_date::date, 'YYYY-MM-DD') AS expiry_date
                    FROM product
                    WHERE status = 1
                      AND expiry_date IS NOT NULL
                      AND quantity > 0
                    """
                )
            else:
                sql = text(
                    """
                    SELECT
                        CAST(product_id AS CHAR) AS lot_id,
                        product_id,
                        product_name,
                        NULL AS batch_no,
                        quantity,
                        DATE_FORMAT(expiry_date, '%Y-%m-%d') AS expiry_date
                    FROM product
                    WHERE status = 1
                      AND expiry_date IS NOT NULL
                      AND quantity > 0
                    """
                )

            rows = conn.execute(
                sql
            ).mappings().all()
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"Unable to read inventory data from DB: {exc}",
            ) from exc

    normalized_items = []
    for row in rows:
        row_dict = dict(row)
        row_dict["expiry_date"] = str(row_dict["expiry_date"])
        normalized_items.append(row_dict)

    return {"items": normalized_items}


@app.get("/api/v1/inventory-recommendation/from-db", response_model=RecommendationResponse)
def inventory_recommendation_from_db():
    payload = get_inventory_lots_from_db()
    items = [InventoryItem(**item) for item in payload["items"]]
    return build_recommendations(items)
