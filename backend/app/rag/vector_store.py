"""
Vector Store Module
Manages FAISS vector database for similarity search
"""

import faiss
import numpy as np
import pickle
import os
from typing import List, Dict, Any, Tuple
from loguru import logger

from app.config import settings


class VectorStore:
    """FAISS-based vector store for document embeddings"""
    
    def __init__(self, dimension: int = 1536):
        """
        Initialize vector store
        
        Args:
            dimension: Embedding dimension (1536 for OpenAI ada-002)
        """
        self.dimension = dimension
        self.index = None
        self.documents = []
        self.index_path = settings.FAISS_INDEX_PATH
        self._ensure_directory()
    
    def _ensure_directory(self):
        """Create index directory if it doesn't exist"""
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
    
    def create_index(self, use_gpu: bool = False):
        """
        Create a new FAISS index
        
        Args:
            use_gpu: Whether to use GPU acceleration (requires faiss-gpu)
        """
        logger.info(f"Creating FAISS index with dimension {self.dimension}")
        
        # Use IndexFlatL2 for exact search (good for small to medium datasets)
        # For larger datasets, consider IndexIVFFlat or IndexHNSWFlat
        self.index = faiss.IndexFlatL2(self.dimension)
        
        # Optionally use GPU
        if use_gpu and faiss.get_num_gpus() > 0:
            logger.info("Using GPU for FAISS")
            self.index = faiss.index_cpu_to_gpu(faiss.StandardGpuResources(), 0, self.index)
        
        logger.info("FAISS index created successfully")
    
    def add_documents(self, documents: List[Dict[str, Any]]):
        """
        Add documents with embeddings to the index
        
        Args:
            documents: List of documents with 'embedding' field
        """
        if self.index is None:
            self.create_index()
        
        logger.info(f"Adding {len(documents)} documents to vector store...")
        
        # Extract embeddings
        embeddings = np.array([doc['embedding'] for doc in documents], dtype='float32')
        
        # Add to FAISS index
        self.index.add(embeddings)
        
        # Store documents (without embeddings to save space)
        for doc in documents:
            doc_copy = doc.copy()
            if 'embedding' in doc_copy:
                del doc_copy['embedding']  # Remove embedding to save memory
            self.documents.append(doc_copy)
        
        logger.info(f"Added {len(documents)} documents. Total: {len(self.documents)}")
    
    def search(self, query_embedding: List[float], k: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        """
        Search for similar documents
        
        Args:
            query_embedding: Query vector
            k: Number of results to return
        
        Returns:
            List of (document, distance) tuples
        """
        if self.index is None or len(self.documents) == 0:
            logger.warning("Vector store is empty")
            return []
        
        # Convert to numpy array
        query_vector = np.array([query_embedding], dtype='float32')
        
        # Search
        distances, indices = self.index.search(query_vector, min(k, len(self.documents)))
        
        # Prepare results
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(self.documents):
                results.append((self.documents[idx], float(dist)))
        
        logger.debug(f"Found {len(results)} similar documents")
        return results
    
    def search_by_type(self, query_embedding: List[float], doc_type: str, k: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        """
        Search for similar documents of a specific type
        
        Args:
            query_embedding: Query vector
            doc_type: Document type to filter by
            k: Number of results to return
        
        Returns:
            List of (document, distance) tuples
        """
        # Get more results initially
        all_results = self.search(query_embedding, k * 3)
        
        # Filter by type
        filtered_results = [
            (doc, dist) for doc, dist in all_results
            if doc.get('type') == doc_type
        ]
        
        return filtered_results[:k]
    
    def save(self, index_path: str = None, documents_path: str = None):
        """
        Save index and documents to disk
        
        Args:
            index_path: Path to save FAISS index
            documents_path: Path to save documents
        """
        if index_path is None:
            index_path = f"{self.index_path}.index"
        if documents_path is None:
            documents_path = f"{self.index_path}.pkl"
        
        logger.info(f"Saving vector store to {index_path}")
        
        # Save FAISS index
        if self.index is not None:
            faiss.write_index(self.index, index_path)
        
        # Save documents
        with open(documents_path, 'wb') as f:
            pickle.dump(self.documents, f)
        
        logger.info("Vector store saved successfully")
    
    def load(self, index_path: str = None, documents_path: str = None):
        """
        Load index and documents from disk
        
        Args:
            index_path: Path to FAISS index file
            documents_path: Path to documents file
        """
        if index_path is None:
            index_path = f"{self.index_path}.index"
        if documents_path is None:
            documents_path = f"{self.index_path}.pkl"
        
        logger.info(f"Loading vector store from {index_path}")
        
        # Load FAISS index
        if os.path.exists(index_path):
            self.index = faiss.read_index(index_path)
            logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors")
        else:
            logger.warning(f"Index file not found: {index_path}")
            self.create_index()
        
        # Load documents
        if os.path.exists(documents_path):
            with open(documents_path, 'rb') as f:
                self.documents = pickle.load(f)
            logger.info(f"Loaded {len(self.documents)} documents")
        else:
            logger.warning(f"Documents file not found: {documents_path}")
            self.documents = []
    
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the vector store"""
        stats = {
            "total_documents": len(self.documents),
            "index_size": self.index.ntotal if self.index else 0,
            "dimension": self.dimension,
            "document_types": {}
        }
        
        # Count by type
        for doc in self.documents:
            doc_type = doc.get('type', 'unknown')
            stats["document_types"][doc_type] = stats["document_types"].get(doc_type, 0) + 1
        
        return stats
    
    def clear(self):
        """Clear all data from vector store"""
        logger.warning("Clearing vector store...")
        self.create_index()
        self.documents = []
        logger.info("Vector store cleared")
