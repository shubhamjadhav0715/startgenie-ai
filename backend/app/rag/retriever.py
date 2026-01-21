"""
Retriever Module
Handles query processing and relevant document retrieval
"""

from typing import List, Dict, Any
from loguru import logger

from .embeddings import EmbeddingGenerator
from .vector_store import VectorStore


class Retriever:
    """Retrieve relevant documents for a given query"""
    
    def __init__(self, vector_store: VectorStore, embedding_generator: EmbeddingGenerator):
        """
        Initialize retriever
        
        Args:
            vector_store: Vector store instance
            embedding_generator: Embedding generator instance
        """
        self.vector_store = vector_store
        self.embedding_generator = embedding_generator
    
    async def retrieve(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieve relevant documents for a query
        
        Args:
            query: User query
            k: Number of documents to retrieve
        
        Returns:
            List of relevant documents with scores
        """
        logger.info(f"Retrieving documents for query: {query[:100]}...")
        
        # Generate query embedding
        query_embedding = await self.embedding_generator.generate_embedding(query)
        
        # Search vector store
        results = self.vector_store.search(query_embedding, k=k)
        
        # Format results
        documents = []
        for doc, distance in results:
            doc_with_score = doc.copy()
            doc_with_score['relevance_score'] = 1 / (1 + distance)  # Convert distance to similarity score
            documents.append(doc_with_score)
        
        logger.info(f"Retrieved {len(documents)} relevant documents")
        return documents
    
    async def retrieve_by_type(self, query: str, doc_type: str, k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieve relevant documents of a specific type
        
        Args:
            query: User query
            doc_type: Type of documents to retrieve (scheme, legal, funding, market)
            k: Number of documents to retrieve
        
        Returns:
            List of relevant documents
        """
        logger.debug(f"Retrieving {doc_type} documents for query")
        
        # Generate query embedding
        query_embedding = await self.embedding_generator.generate_embedding(query)
        
        # Search by type
        results = self.vector_store.search_by_type(query_embedding, doc_type, k=k)
        
        # Format results
        documents = []
        for doc, distance in results:
            doc_with_score = doc.copy()
            doc_with_score['relevance_score'] = 1 / (1 + distance)
            documents.append(doc_with_score)
        
        return documents
    
    async def retrieve_context_for_blueprint(self, startup_idea: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Retrieve all relevant context for blueprint generation
        
        Args:
            startup_idea: User's startup idea description
        
        Returns:
            Dictionary with categorized relevant documents
        """
        logger.info("Retrieving comprehensive context for blueprint generation...")
        
        context = {
            "schemes": await self.retrieve_by_type(startup_idea, "scheme", k=5),
            "legal": await self.retrieve_by_type(startup_idea, "legal", k=3),
            "funding": await self.retrieve_by_type(startup_idea, "funding", k=4),
            "market": await self.retrieve_by_type(startup_idea, "market", k=2)
        }
        
        total_docs = sum(len(docs) for docs in context.values())
        logger.info(f"Retrieved {total_docs} documents across all categories")
        
        return context
    
    def format_context_for_llm(self, context: Dict[str, List[Dict[str, Any]]]) -> str:
        """
        Format retrieved context into a string for LLM prompt
        
        Args:
            context: Retrieved context dictionary
        
        Returns:
            Formatted context string
        """
        formatted_parts = []
        
        # Format schemes
        if context.get("schemes"):
            formatted_parts.append("=== GOVERNMENT SCHEMES ===")
            for doc in context["schemes"]:
                metadata = doc.get("metadata", {})
                formatted_parts.append(f"""
Scheme: {metadata.get('name', 'N/A')}
Description: {metadata.get('description', 'N/A')}
Eligibility: {metadata.get('eligibility', 'N/A')}
Funding: {metadata.get('funding_amount', 'N/A')}
""")
        
        # Format legal requirements
        if context.get("legal"):
            formatted_parts.append("\n=== LEGAL & COMPLIANCE ===")
            for doc in context["legal"]:
                metadata = doc.get("metadata", {})
                formatted_parts.append(f"""
Type: {metadata.get('type', 'N/A')}
Description: {metadata.get('description', 'N/A')}
Requirements: {', '.join(metadata.get('requirements', []))}
Cost: {metadata.get('cost_range', 'N/A')}
""")
        
        # Format funding sources
        if context.get("funding"):
            formatted_parts.append("\n=== FUNDING SOURCES ===")
            for doc in context["funding"]:
                metadata = doc.get("metadata", {})
                formatted_parts.append(f"""
Type: {metadata.get('type', 'N/A')}
Description: {metadata.get('description', 'N/A')}
Typical Amount: {metadata.get('typical_amount', 'N/A')}
Stage: {metadata.get('stage', 'N/A')}
""")
        
        # Format market data
        if context.get("market"):
            formatted_parts.append("\n=== MARKET INSIGHTS ===")
            for doc in context["market"]:
                formatted_parts.append(doc.get("text", ""))
        
        return "\n".join(formatted_parts)
