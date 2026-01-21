"""
RAG Engine
Orchestrates the complete RAG pipeline
"""

from loguru import logger
from typing import Optional

from .data_loader import DataLoader
from .embeddings import EmbeddingGenerator
from .vector_store import VectorStore
from .retriever import Retriever
from .generator import BlueprintGenerator


class RAGEngine:
    """Main RAG engine that coordinates all components"""
    
    _instance: Optional['RAGEngine'] = None
    
    def __init__(self):
        """Initialize RAG engine components"""
        logger.info("Initializing RAG Engine...")
        
        self.data_loader = DataLoader()
        self.embedding_generator = EmbeddingGenerator()
        self.vector_store = VectorStore()
        self.retriever = Retriever(self.vector_store, self.embedding_generator)
        self.generator = BlueprintGenerator(self.retriever)
        
        self.initialized = False
    
    @classmethod
    def get_instance(cls) -> 'RAGEngine':
        """Get singleton instance of RAG engine"""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    async def initialize(self, force_reload: bool = False):
        """
        Initialize the RAG engine
        
        Args:
            force_reload: Force reload of data and rebuild index
        """
        if self.initialized and not force_reload:
            logger.info("RAG Engine already initialized")
            return
        
        logger.info("Starting RAG Engine initialization...")
        
        try:
            # Try to load existing index
            if not force_reload:
                try:
                    self.vector_store.load()
                    if len(self.vector_store.documents) > 0:
                        logger.info("Loaded existing vector store")
                        self.initialized = True
                        return
                except Exception as e:
                    logger.warning(f"Could not load existing index: {e}")
            
            # Load data
            logger.info("Loading data sources...")
            data = await self.data_loader.load_all_data()
            
            # Prepare documents
            logger.info("Preparing documents for embedding...")
            documents = self.embedding_generator.prepare_documents_for_embedding(data)
            
            # Generate embeddings
            logger.info("Generating embeddings...")
            embedded_docs = await self.embedding_generator.embed_documents(documents)
            
            # Add to vector store
            logger.info("Building vector index...")
            self.vector_store.add_documents(embedded_docs)
            
            # Save index
            logger.info("Saving vector store...")
            self.vector_store.save()
            
            self.initialized = True
            logger.info("✅ RAG Engine initialized successfully")
            
            # Print stats
            stats = self.vector_store.get_stats()
            logger.info(f"Vector store stats: {stats}")
        
        except Exception as e:
            logger.error(f"Failed to initialize RAG Engine: {e}")
            raise
    
    async def generate_blueprint(self, startup_idea: str):
        """
        Generate startup blueprint
        
        Args:
            startup_idea: User's startup idea
        
        Returns:
            BlueprintContent object
        """
        if not self.initialized:
            await self.initialize()
        
        return await self.generator.generate_blueprint(startup_idea)
    
    async def chat(self, message: str, blueprint_context: str = None) -> str:
        """
        Generate chat response
        
        Args:
            message: User message
            blueprint_context: Optional blueprint context
        
        Returns:
            AI response
        """
        if not self.initialized:
            await self.initialize()
        
        return await self.generator.chat_response(message, blueprint_context)
    
    async def retrieve_context(self, query: str, k: int = 5):
        """
        Retrieve relevant context for a query
        
        Args:
            query: Search query
            k: Number of results
        
        Returns:
            List of relevant documents
        """
        if not self.initialized:
            await self.initialize()
        
        return await self.retriever.retrieve(query, k)
    
    def get_stats(self):
        """Get RAG engine statistics"""
        return {
            "initialized": self.initialized,
            "vector_store": self.vector_store.get_stats() if self.initialized else None
        }


# Global instance
rag_engine = RAGEngine.get_instance()
