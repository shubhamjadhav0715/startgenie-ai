"""
Blueprint Generator Module
Generates startup blueprints using LLM with RAG context
"""

from typing import Dict, Any
from openai import OpenAI
from loguru import logger
import json

from app.config import settings
from app.models.blueprint import BlueprintContent
from .retriever import Retriever


class BlueprintGenerator:
    """Generate startup blueprints using LLM"""
    
    def __init__(self, retriever: Retriever):
        """
        Initialize generator
        
        Args:
            retriever: Retriever instance for context
        """
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.retriever = retriever
        self.model = settings.OPENAI_MODEL
        self.temperature = settings.OPENAI_TEMPERATURE
        self.max_tokens = settings.OPENAI_MAX_TOKENS
    
    def _create_system_prompt(self) -> str:
        """Create system prompt for the LLM"""
        return """You are StartGenie AI, an expert startup consultant specializing in the Indian startup ecosystem. 
Your role is to help entrepreneurs create comprehensive, actionable business blueprints.

You have deep knowledge of:
- Indian startup ecosystem and regulations
- Government schemes and funding options
- Legal compliance requirements
- Market analysis and business strategy
- Financial planning and budgeting

Generate detailed, practical, and India-specific startup blueprints based on the user's idea and provided context.
Always provide specific, actionable recommendations with real data when available."""
    
    def _create_blueprint_prompt(self, startup_idea: str, context: str) -> str:
        """
        Create prompt for blueprint generation
        
        Args:
            startup_idea: User's startup idea
            context: Retrieved context from RAG
        
        Returns:
            Formatted prompt
        """
        return f"""Generate a comprehensive startup blueprint for the following idea:

STARTUP IDEA:
{startup_idea}

RELEVANT CONTEXT (Government schemes, legal requirements, funding sources, market data):
{context}

Generate a detailed blueprint with the following sections in JSON format:

{{
  "startup_overview": {{
    "suggested_names": ["name1", "name2", "name3"],
    "industry": "industry name",
    "problem_statement": "clear problem description",
    "solution": "proposed solution",
    "unique_value_proposition": "what makes this unique"
  }},
  "market_analysis": {{
    "target_audience": "detailed audience description",
    "market_size": "market size with data",
    "market_demand": "demand analysis",
    "industry_trends": ["trend1", "trend2", "trend3"],
    "competitors": [
      {{"name": "competitor1", "strength": "their strength", "weakness": "their weakness"}},
      {{"name": "competitor2", "strength": "their strength", "weakness": "their weakness"}}
    ]
  }},
  "business_model": {{
    "revenue_streams": ["stream1", "stream2"],
    "pricing_strategy": "pricing approach",
    "customer_acquisition": "acquisition strategy"
  }},
  "swot_analysis": {{
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
    "threats": ["threat1", "threat2"]
  }},
  "budget_estimation": {{
    "initial_setup_cost": 500000,
    "monthly_operational_expenses": 100000,
    "technology_cost": 200000,
    "marketing_cost": 150000,
    "breakdown": {{
      "item1": 100000,
      "item2": 50000
    }}
  }},
  "funding_investment": {{
    "funding_options": ["option1", "option2"],
    "government_schemes": [
      {{"name": "scheme name", "amount": "funding amount", "eligibility": "criteria"}}
    ],
    "investor_readiness_tips": ["tip1", "tip2", "tip3"]
  }},
  "legal_compliance": {{
    "business_registration_type": "recommended type",
    "required_licenses": ["license1", "license2"],
    "taxation_basics": "tax information",
    "compliance_checklist": ["item1", "item2", "item3"]
  }},
  "go_to_market_strategy": {{
    "launch_plan": "detailed launch strategy",
    "marketing_channels": ["channel1", "channel2", "channel3"],
    "risks": ["risk1", "risk2"],
    "mitigation_strategies": ["strategy1", "strategy2"]
  }},
  "action_roadmap": {{
    "months_0_3": ["action1", "action2", "action3"],
    "months_3_6": ["action1", "action2", "action3"],
    "months_6_12": ["action1", "action2", "action3"]
  }},
  "export_summary": "A concise 2-3 paragraph summary suitable for presentations and emails"
}}

Ensure all recommendations are:
1. Specific to the Indian market
2. Based on the provided context when applicable
3. Realistic and actionable
4. Include actual numbers and data where possible

Return ONLY the JSON object, no additional text."""
    
    async def generate_blueprint(self, startup_idea: str) -> BlueprintContent:
        """
        Generate complete startup blueprint
        
        Args:
            startup_idea: User's startup idea description
        
        Returns:
            BlueprintContent object
        """
        logger.info("Generating startup blueprint...")
        
        try:
            # Retrieve relevant context
            context_docs = await self.retriever.retrieve_context_for_blueprint(startup_idea)
            context_str = self.retriever.format_context_for_llm(context_docs)
            
            # Create prompts
            system_prompt = self._create_system_prompt()
            user_prompt = self._create_blueprint_prompt(startup_idea, context_str)
            
            # Call LLM
            logger.debug("Calling OpenAI API...")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            # Parse response
            content = response.choices[0].message.content
            logger.debug(f"Received response: {len(content)} characters")
            
            # Extract JSON from response
            # Sometimes LLM adds markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            # Parse JSON
            blueprint_data = json.loads(content)
            
            # Convert to BlueprintContent model
            blueprint = BlueprintContent(**blueprint_data)
            
            logger.info("Blueprint generated successfully")
            return blueprint
        
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            logger.error(f"Response content: {content}")
            raise ValueError("Failed to generate valid blueprint structure")
        
        except Exception as e:
            logger.error(f"Error generating blueprint: {e}")
            raise
    
    async def refine_section(self, section_name: str, current_content: str, user_feedback: str) -> str:
        """
        Refine a specific section based on user feedback
        
        Args:
            section_name: Name of the section to refine
            current_content: Current section content
            user_feedback: User's feedback or requirements
        
        Returns:
            Refined section content
        """
        logger.info(f"Refining section: {section_name}")
        
        prompt = f"""Refine the following section of a startup blueprint based on user feedback:

SECTION: {section_name}

CURRENT CONTENT:
{current_content}

USER FEEDBACK:
{user_feedback}

Provide an improved version that addresses the feedback while maintaining the same structure and format.
Return only the refined content."""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self._create_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=1000
            )
            
            refined_content = response.choices[0].message.content
            logger.info("Section refined successfully")
            return refined_content
        
        except Exception as e:
            logger.error(f"Error refining section: {e}")
            raise
    
    async def chat_response(self, message: str, blueprint_context: str = None) -> str:
        """
        Generate chat response for user queries
        
        Args:
            message: User message
            blueprint_context: Optional blueprint context for reference
        
        Returns:
            AI response
        """
        logger.info("Generating chat response...")
        
        system_prompt = self._create_system_prompt()
        
        if blueprint_context:
            user_prompt = f"""User is working on a startup blueprint. Here's the context:

{blueprint_context}

User question: {message}

Provide a helpful, specific response."""
        else:
            user_prompt = message
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            logger.error(f"Error generating chat response: {e}")
            raise
