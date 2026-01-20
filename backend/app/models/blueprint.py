"""
Blueprint Models
Pydantic models for startup blueprint data
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
from enum import Enum


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class BlueprintStatus(str, Enum):
    """Blueprint generation status"""
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class StartupOverview(BaseModel):
    """Startup overview section"""
    suggested_names: List[str] = Field(default_factory=list)
    industry: Optional[str] = None
    problem_statement: Optional[str] = None
    solution: Optional[str] = None
    unique_value_proposition: Optional[str] = None


class MarketAnalysis(BaseModel):
    """Market analysis section"""
    target_audience: Optional[str] = None
    market_size: Optional[str] = None
    market_demand: Optional[str] = None
    industry_trends: List[str] = Field(default_factory=list)
    competitors: List[Dict[str, Any]] = Field(default_factory=list)


class BusinessModel(BaseModel):
    """Business model section"""
    revenue_streams: List[str] = Field(default_factory=list)
    pricing_strategy: Optional[str] = None
    customer_acquisition: Optional[str] = None


class SWOTAnalysis(BaseModel):
    """SWOT analysis section"""
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    opportunities: List[str] = Field(default_factory=list)
    threats: List[str] = Field(default_factory=list)


class BudgetEstimation(BaseModel):
    """Budget and cost estimation section"""
    initial_setup_cost: Optional[float] = None
    monthly_operational_expenses: Optional[float] = None
    technology_cost: Optional[float] = None
    marketing_cost: Optional[float] = None
    breakdown: Dict[str, float] = Field(default_factory=dict)


class FundingInvestment(BaseModel):
    """Funding and investment section"""
    funding_options: List[str] = Field(default_factory=list)
    government_schemes: List[Dict[str, Any]] = Field(default_factory=list)
    investor_readiness_tips: List[str] = Field(default_factory=list)


class LegalCompliance(BaseModel):
    """Legal and compliance section"""
    business_registration_type: Optional[str] = None
    required_licenses: List[str] = Field(default_factory=list)
    taxation_basics: Optional[str] = None
    compliance_checklist: List[str] = Field(default_factory=list)


class GoToMarketStrategy(BaseModel):
    """Go-to-market strategy section"""
    launch_plan: Optional[str] = None
    marketing_channels: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    mitigation_strategies: List[str] = Field(default_factory=list)


class ActionRoadmap(BaseModel):
    """Action roadmap section"""
    months_0_3: List[str] = Field(default_factory=list)
    months_3_6: List[str] = Field(default_factory=list)
    months_6_12: List[str] = Field(default_factory=list)


class BlueprintContent(BaseModel):
    """Complete blueprint content with all sections"""
    startup_overview: Optional[StartupOverview] = None
    market_analysis: Optional[MarketAnalysis] = None
    business_model: Optional[BusinessModel] = None
    swot_analysis: Optional[SWOTAnalysis] = None
    budget_estimation: Optional[BudgetEstimation] = None
    funding_investment: Optional[FundingInvestment] = None
    legal_compliance: Optional[LegalCompliance] = None
    go_to_market_strategy: Optional[GoToMarketStrategy] = None
    action_roadmap: Optional[ActionRoadmap] = None
    export_summary: Optional[str] = None


class BlueprintCreate(BaseModel):
    """Blueprint creation request"""
    startup_idea: str = Field(..., min_length=10, max_length=1000)
    additional_context: Optional[Dict[str, Any]] = None


class BlueprintUpdate(BaseModel):
    """Blueprint update request"""
    content: Optional[BlueprintContent] = None
    status: Optional[BlueprintStatus] = None


class BlueprintInDB(BaseModel):
    """Blueprint model as stored in database"""
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    startup_idea: str
    content: Optional[BlueprintContent] = None
    status: BlueprintStatus = BlueprintStatus.PENDING
    generation_time: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class BlueprintResponse(BaseModel):
    """Blueprint response model"""
    id: str = Field(..., alias="_id")
    user_id: str
    startup_idea: str
    content: Optional[BlueprintContent] = None
    status: BlueprintStatus
    generation_time: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
