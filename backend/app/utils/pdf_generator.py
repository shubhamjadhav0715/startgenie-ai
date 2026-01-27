"""
PDF Generator
Creates professional PDF reports from blueprints
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from io import BytesIO
from datetime import datetime
from typing import Dict, Any

from app.models.blueprint import BlueprintContent


class PDFGenerator:
    """Generate PDF documents from blueprint data"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0284c7'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Section heading
        self.styles.add(ParagraphStyle(
            name='SectionHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#0369a1'),
            spaceAfter=12,
            spaceBefore=20,
            fontName='Helvetica-Bold'
        ))
        
        # Subsection heading
        self.styles.add(ParagraphStyle(
            name='SubsectionHeading',
            parent=self.styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#075985'),
            spaceAfter=8,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Body text
        self.styles.add(ParagraphStyle(
            name='BodyText',
            parent=self.styles['Normal'],
            fontSize=11,
            leading=16,
            alignment=TA_JUSTIFY,
            spaceAfter=10
        ))
        
        # Bullet point
        self.styles.add(ParagraphStyle(
            name='BulletPoint',
            parent=self.styles['Normal'],
            fontSize=11,
            leading=14,
            leftIndent=20,
            spaceAfter=6
        ))
    
    def generate_blueprint_pdf(self, blueprint_data: Dict[str, Any]) -> BytesIO:
        """
        Generate PDF from blueprint data
        
        Args:
            blueprint_data: Blueprint dictionary with content
        
        Returns:
            BytesIO buffer containing PDF
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18,
        )
        
        # Build document content
        story = []
        
        # Cover page
        story.extend(self._create_cover_page(blueprint_data))
        story.append(PageBreak())
        
        # Table of contents
        story.extend(self._create_toc())
        story.append(PageBreak())
        
        # Content sections
        content = blueprint_data.get('content', {})
        
        if content.get('startup_overview'):
            story.extend(self._create_overview_section(content['startup_overview']))
            story.append(PageBreak())
        
        if content.get('market_analysis'):
            story.extend(self._create_market_section(content['market_analysis']))
            story.append(PageBreak())
        
        if content.get('business_model'):
            story.extend(self._create_business_model_section(content['business_model']))
            story.append(Spacer(1, 0.3*inch))
        
        if content.get('swot_analysis'):
            story.extend(self._create_swot_section(content['swot_analysis']))
            story.append(PageBreak())
        
        if content.get('budget_estimation'):
            story.extend(self._create_budget_section(content['budget_estimation']))
            story.append(Spacer(1, 0.3*inch))
        
        if content.get('funding_investment'):
            story.extend(self._create_funding_section(content['funding_investment']))
            story.append(PageBreak())
        
        if content.get('legal_compliance'):
            story.extend(self._create_legal_section(content['legal_compliance']))
            story.append(Spacer(1, 0.3*inch))
        
        if content.get('go_to_market_strategy'):
            story.extend(self._create_gtm_section(content['go_to_market_strategy']))
            story.append(PageBreak())
        
        if content.get('action_roadmap'):
            story.extend(self._create_roadmap_section(content['action_roadmap']))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def _create_cover_page(self, blueprint_data: Dict[str, Any]) -> list:
        """Create cover page"""
        story = []
        
        # Title
        story.append(Spacer(1, 2*inch))
        story.append(Paragraph("Startup Blueprint", self.styles['CustomTitle']))
        story.append(Spacer(1, 0.5*inch))
        
        # Startup idea
        idea = blueprint_data.get('startup_idea', 'N/A')
        story.append(Paragraph(f"<b>{idea}</b>", self.styles['BodyText']))
        story.append(Spacer(1, 1*inch))
        
        # Generated info
        date = datetime.now().strftime("%B %d, %Y")
        story.append(Paragraph(f"Generated on: {date}", self.styles['Normal']))
        story.append(Paragraph("Powered by StartGenie AI", self.styles['Normal']))
        
        return story
    
    def _create_toc(self) -> list:
        """Create table of contents"""
        story = []
        story.append(Paragraph("Table of Contents", self.styles['SectionHeading']))
        story.append(Spacer(1, 0.2*inch))
        
        sections = [
            "1. Startup Overview",
            "2. Market Analysis",
            "3. Business Model",
            "4. SWOT Analysis",
            "5. Budget Estimation",
            "6. Funding & Investment",
            "7. Legal & Compliance",
            "8. Go-to-Market Strategy",
            "9. Action Roadmap"
        ]
        
        for section in sections:
            story.append(Paragraph(section, self.styles['Normal']))
            story.append(Spacer(1, 0.1*inch))
        
        return story
    
    def _create_overview_section(self, data: Dict[str, Any]) -> list:
        """Create startup overview section"""
        story = []
        story.append(Paragraph("1. Startup Overview", self.styles['SectionHeading']))
        
        # Suggested names
        if data.get('suggested_names'):
            story.append(Paragraph("Suggested Names", self.styles['SubsectionHeading']))
            names = ", ".join(data['suggested_names'])
            story.append(Paragraph(names, self.styles['BodyText']))
        
        # Industry
        if data.get('industry'):
            story.append(Paragraph("Industry", self.styles['SubsectionHeading']))
            story.append(Paragraph(data['industry'], self.styles['BodyText']))
        
        # Problem statement
        if data.get('problem_statement'):
            story.append(Paragraph("Problem Statement", self.styles['SubsectionHeading']))
            story.append(Paragraph(data['problem_statement'], self.styles['BodyText']))
        
        # Solution
        if data.get('solution'):
            story.append(Paragraph("Solution", self.styles['SubsectionHeading']))
            story.append(Paragraph(data['solution'], self.styles['BodyText']))
        
        # UVP
        if data.get('unique_value_proposition'):
            story.append(Paragraph("Unique Value Proposition", self.styles['SubsectionHeading']))
            story.append(Paragraph(data['unique_value_proposition'], self.styles['BodyText']))
        
        return story
    
    def _create_market_section(self, data: Dict[str, Any]) -> list:
        """Create market analysis section"""
        story = []
        story.append(Paragraph("2. Market Analysis", self.styles['SectionHeading']))
        
        if data.get('target_audience'):
            story.append(Paragraph("Target Audience", self.styles['SubsectionHeading']))
            story.append(Paragraph(data['target_audience'], self.styles['BodyText']))
        
        if data.get('market_size'):
            story.append(Paragraph("Market Size", self.styles['SubsectionHeading']))
            story.append(Paragraph(data['market_size'], self.styles['BodyText']))
        
        if data.get('industry_trends'):
            story.append(Paragraph("Industry Trends", self.styles['SubsectionHeading']))
            for trend in data['industry_trends']:
                story.append(Paragraph(f"• {trend}", self.styles['BulletPoint']))
        
        return story
    
    def _create_business_model_section(self, data: Dict[str, Any]) -> list:
        """Create business model section"""
        story = []
        story.append(Paragraph("3. Business Model", self.styles['SectionHeading']))
        
        if data.get('revenue_streams'):
            story.append(Paragraph("Revenue Streams", self.styles['SubsectionHeading']))
            for stream in data['revenue_streams']:
                story.append(Paragraph(f"• {stream}", self.styles['BulletPoint']))
        
        if data.get('pricing_strategy'):
            story.append(Paragraph("Pricing Strategy", self.styles['SubsectionHeading']))
            story.append(Paragraph(data['pricing_strategy'], self.styles['BodyText']))
        
        return story
    
    def _create_swot_section(self, data: Dict[str, Any]) -> list:
        """Create SWOT analysis section"""
        story = []
        story.append(Paragraph("4. SWOT Analysis", self.styles['SectionHeading']))
        
        # Create SWOT table
        swot_data = [
            ['Strengths', 'Weaknesses'],
            [
                '\n'.join([f"• {s}" for s in data.get('strengths', [])]),
                '\n'.join([f"• {w}" for w in data.get('weaknesses', [])])
            ],
            ['Opportunities', 'Threats'],
            [
                '\n'.join([f"• {o}" for o in data.get('opportunities', [])]),
                '\n'.join([f"• {t}" for t in data.get('threats', [])])
            ]
        ]
        
        table = Table(swot_data, colWidths=[3.5*inch, 3.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284c7')),
            ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#0284c7')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('TEXTCOLOR', (0, 2), (-1, 2), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        return story
    
    def _create_budget_section(self, data: Dict[str, Any]) -> list:
        """Create budget section"""
        story = []
        story.append(Paragraph("5. Budget Estimation", self.styles['SectionHeading']))
        
        budget_items = [
            ('Initial Setup Cost', data.get('initial_setup_cost')),
            ('Monthly Operational Expenses', data.get('monthly_operational_expenses')),
            ('Technology Cost', data.get('technology_cost')),
            ('Marketing Cost', data.get('marketing_cost'))
        ]
        
        for label, value in budget_items:
            if value:
                story.append(Paragraph(f"<b>{label}:</b> ₹{value:,.0f}", self.styles['BodyText']))
        
        return story
    
    def _create_funding_section(self, data: Dict[str, Any]) -> list:
        """Create funding section"""
        story = []
        story.append(Paragraph("6. Funding & Investment", self.styles['SectionHeading']))
        
        if data.get('funding_options'):
            story.append(Paragraph("Funding Options", self.styles['SubsectionHeading']))
            for option in data['funding_options']:
                story.append(Paragraph(f"• {option}", self.styles['BulletPoint']))
        
        if data.get('government_schemes'):
            story.append(Paragraph("Government Schemes", self.styles['SubsectionHeading']))
            for scheme in data['government_schemes']:
                story.append(Paragraph(f"<b>{scheme.get('name', 'N/A')}</b>", self.styles['BodyText']))
                story.append(Paragraph(f"Amount: {scheme.get('amount', 'N/A')}", self.styles['BulletPoint']))
        
        return story
    
    def _create_legal_section(self, data: Dict[str, Any]) -> list:
        """Create legal section"""
        story = []
        story.append(Paragraph("7. Legal & Compliance", self.styles['SectionHeading']))
        
        if data.get('business_registration_type'):
            story.append(Paragraph("Recommended Registration Type", self.styles['SubsectionHeading']))
            story.append(Paragraph(data['business_registration_type'], self.styles['BodyText']))
        
        if data.get('required_licenses'):
            story.append(Paragraph("Required Licenses", self.styles['SubsectionHeading']))
            for license in data['required_licenses']:
                story.append(Paragraph(f"• {license}", self.styles['BulletPoint']))
        
        return story
    
    def _create_gtm_section(self, data: Dict[str, Any]) -> list:
        """Create go-to-market section"""
        story = []
        story.append(Paragraph("8. Go-to-Market Strategy", self.styles['SectionHeading']))
        
        if data.get('launch_plan'):
            story.append(Paragraph("Launch Plan", self.styles['SubsectionHeading']))
            story.append(Paragraph(data['launch_plan'], self.styles['BodyText']))
        
        if data.get('marketing_channels'):
            story.append(Paragraph("Marketing Channels", self.styles['SubsectionHeading']))
            for channel in data['marketing_channels']:
                story.append(Paragraph(f"• {channel}", self.styles['BulletPoint']))
        
        return story
    
    def _create_roadmap_section(self, data: Dict[str, Any]) -> list:
        """Create roadmap section"""
        story = []
        story.append(Paragraph("9. Action Roadmap", self.styles['SectionHeading']))
        
        phases = [
            ('Months 0-3', data.get('months_0_3', [])),
            ('Months 3-6', data.get('months_3_6', [])),
            ('Months 6-12', data.get('months_6_12', []))
        ]
        
        for phase_name, actions in phases:
            story.append(Paragraph(phase_name, self.styles['SubsectionHeading']))
            for action in actions:
                story.append(Paragraph(f"• {action}", self.styles['BulletPoint']))
            story.append(Spacer(1, 0.2*inch))
        
        return story
