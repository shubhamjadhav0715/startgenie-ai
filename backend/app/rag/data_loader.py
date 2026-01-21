"""
Data Loader Module
Collects and processes data from various startup ecosystem sources
"""

import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from loguru import logger
import json
import os

from app.config import settings


class DataLoader:
    """Load and process data from startup ecosystem sources"""
    
    def __init__(self):
        self.data_dir = "./data"
        self.sources = {
            "startup_india": settings.STARTUP_INDIA_URL,
            "dpiit": settings.DPIIT_URL,
            "invest_india": settings.INVEST_INDIA_URL
        }
        self._ensure_data_directory()
    
    def _ensure_data_directory(self):
        """Create data directory if it doesn't exist"""
        os.makedirs(self.data_dir, exist_ok=True)
        os.makedirs(f"{self.data_dir}/raw", exist_ok=True)
        os.makedirs(f"{self.data_dir}/processed", exist_ok=True)
        os.makedirs(f"{self.data_dir}/vector_store", exist_ok=True)
    
    async def load_startup_india_schemes(self) -> List[Dict[str, Any]]:
        """
        Load government schemes from Startup India
        Returns list of schemes with details
        """
        logger.info("Loading Startup India schemes...")
        
        # Sample data structure (in production, this would scrape the website)
        schemes = [
            {
                "name": "Startup India Seed Fund Scheme (SISFS)",
                "description": "Provides financial assistance to startups for proof of concept, prototype development, product trials, market entry and commercialization",
                "eligibility": "DPIIT recognized startups incorporated less than 2 years ago",
                "funding_amount": "Up to ₹20 lakhs as grant, Up to ₹50 lakhs as debt/convertible debentures",
                "category": "Seed Funding",
                "source": "Startup India"
            },
            {
                "name": "Credit Guarantee Scheme for Startups (CGSS)",
                "description": "Provides credit guarantee to loans extended by Member Institutions to startups",
                "eligibility": "DPIIT recognized startups",
                "funding_amount": "Up to ₹10 crores",
                "category": "Credit Guarantee",
                "source": "Startup India"
            },
            {
                "name": "Fund of Funds for Startups (FFS)",
                "description": "Contributes to the corpus of SEBI registered Alternative Investment Funds (AIFs)",
                "eligibility": "Startups through registered AIFs",
                "funding_amount": "Varies based on AIF",
                "category": "Venture Capital",
                "source": "Startup India"
            },
            {
                "name": "Atal Innovation Mission (AIM)",
                "description": "Promotes innovation and entrepreneurship across the country",
                "eligibility": "Schools, colleges, and startups",
                "funding_amount": "Varies by program",
                "category": "Innovation Support",
                "source": "NITI Aayog"
            }
        ]
        
        # Save to file
        self._save_json(schemes, "startup_india_schemes.json")
        
        logger.info(f"Loaded {len(schemes)} schemes from Startup India")
        return schemes
    
    async def load_legal_requirements(self) -> List[Dict[str, Any]]:
        """
        Load legal and compliance requirements for Indian startups
        """
        logger.info("Loading legal requirements...")
        
        legal_data = [
            {
                "type": "Private Limited Company",
                "description": "Most common structure for startups in India",
                "requirements": [
                    "Minimum 2 directors and 2 shareholders",
                    "Digital Signature Certificate (DSC)",
                    "Director Identification Number (DIN)",
                    "Name approval from MCA",
                    "Memorandum of Association (MOA)",
                    "Articles of Association (AOA)"
                ],
                "registration_time": "7-15 days",
                "cost_range": "₹10,000 - ₹20,000",
                "benefits": [
                    "Limited liability protection",
                    "Separate legal entity",
                    "Easy to raise funding",
                    "Tax benefits available"
                ]
            },
            {
                "type": "Limited Liability Partnership (LLP)",
                "description": "Hybrid structure combining benefits of partnership and company",
                "requirements": [
                    "Minimum 2 partners",
                    "Digital Signature Certificate (DSC)",
                    "Director Identification Number (DIN)",
                    "LLP Agreement"
                ],
                "registration_time": "7-10 days",
                "cost_range": "₹7,000 - ₹15,000",
                "benefits": [
                    "Limited liability",
                    "Less compliance than Pvt Ltd",
                    "No minimum capital requirement"
                ]
            },
            {
                "type": "One Person Company (OPC)",
                "description": "Company with single member/shareholder",
                "requirements": [
                    "Single director and shareholder",
                    "Nominee required",
                    "Digital Signature Certificate (DSC)",
                    "Director Identification Number (DIN)"
                ],
                "registration_time": "7-15 days",
                "cost_range": "₹8,000 - ₹18,000",
                "benefits": [
                    "Limited liability",
                    "Single ownership",
                    "Separate legal entity"
                ]
            }
        ]
        
        # Common licenses
        licenses = [
            {
                "name": "GST Registration",
                "required_for": "Businesses with turnover > ₹40 lakhs (₹20 lakhs for services)",
                "validity": "Permanent (annual returns required)",
                "cost": "Free"
            },
            {
                "name": "Shops and Establishment License",
                "required_for": "All commercial establishments",
                "validity": "Varies by state",
                "cost": "₹500 - ₹5,000"
            },
            {
                "name": "FSSAI License",
                "required_for": "Food businesses",
                "validity": "1-5 years",
                "cost": "₹100 - ₹7,500"
            },
            {
                "name": "Trade License",
                "required_for": "Commercial activities",
                "validity": "1 year (renewable)",
                "cost": "₹1,000 - ₹10,000"
            }
        ]
        
        legal_data.append({"licenses": licenses})
        
        self._save_json(legal_data, "legal_requirements.json")
        
        logger.info(f"Loaded legal requirements data")
        return legal_data
    
    async def load_funding_sources(self) -> List[Dict[str, Any]]:
        """
        Load information about funding sources in India
        """
        logger.info("Loading funding sources...")
        
        funding_sources = [
            {
                "type": "Angel Investors",
                "description": "Individual investors providing early-stage funding",
                "typical_amount": "₹25 lakhs - ₹2 crores",
                "stage": "Seed, Pre-Series A",
                "networks": [
                    "Indian Angel Network",
                    "Mumbai Angels",
                    "Chennai Angels",
                    "Hyderabad Angels"
                ]
            },
            {
                "type": "Venture Capital",
                "description": "Professional investment firms",
                "typical_amount": "₹5 crores - ₹50 crores",
                "stage": "Series A, B, C",
                "top_vcs": [
                    "Sequoia Capital India",
                    "Accel Partners",
                    "Nexus Venture Partners",
                    "Kalaari Capital",
                    "Blume Ventures"
                ]
            },
            {
                "type": "Incubators & Accelerators",
                "description": "Programs providing funding, mentorship, and resources",
                "typical_amount": "₹10 lakhs - ₹50 lakhs",
                "stage": "Idea, Seed",
                "programs": [
                    "Y Combinator",
                    "Techstars",
                    "T-Hub",
                    "NASSCOM 10000 Startups",
                    "Startup India Hub"
                ]
            },
            {
                "type": "Bank Loans",
                "description": "Traditional lending from banks",
                "typical_amount": "₹10 lakhs - ₹10 crores",
                "stage": "Any (with collateral)",
                "schemes": [
                    "MUDRA Loan",
                    "Stand-Up India",
                    "CGTMSE",
                    "SIDBI Loans"
                ]
            }
        ]
        
        self._save_json(funding_sources, "funding_sources.json")
        
        logger.info(f"Loaded {len(funding_sources)} funding sources")
        return funding_sources
    
    async def load_market_data(self) -> Dict[str, Any]:
        """
        Load market research and industry data
        """
        logger.info("Loading market data...")
        
        market_data = {
            "indian_startup_ecosystem": {
                "total_startups": "99,000+ (as of 2024)",
                "unicorns": "108",
                "funding_2023": "$10.5 billion",
                "top_sectors": [
                    "Fintech",
                    "E-commerce",
                    "Edtech",
                    "Healthtech",
                    "SaaS"
                ]
            },
            "industry_trends": [
                "AI/ML integration across sectors",
                "Sustainable and green tech solutions",
                "D2C brands growth",
                "Rural market penetration",
                "Vernacular content platforms"
            ]
        }
        
        self._save_json(market_data, "market_data.json")
        
        logger.info("Loaded market data")
        return market_data
    
    def _save_json(self, data: Any, filename: str):
        """Save data to JSON file"""
        filepath = f"{self.data_dir}/raw/{filename}"
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.debug(f"Saved data to {filepath}")
    
    def load_json(self, filename: str) -> Any:
        """Load data from JSON file"""
        filepath = f"{self.data_dir}/raw/{filename}"
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    async def load_all_data(self) -> Dict[str, Any]:
        """
        Load all data sources
        Returns combined dataset
        """
        logger.info("Loading all data sources...")
        
        data = {
            "schemes": await self.load_startup_india_schemes(),
            "legal": await self.load_legal_requirements(),
            "funding": await self.load_funding_sources(),
            "market": await self.load_market_data()
        }
        
        logger.info("All data sources loaded successfully")
        return data
