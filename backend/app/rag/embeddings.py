"""
Embedding Generation Module
Converts text to vector embeddings using OpenAI
"""

from typing import List, Dict, Any
from openai import OpenAI
from loguru import logger
import tiktoken

from app.config import settings


class EmbeddingGenerator:
    """Generate embeddings for text using OpenAI API"""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_EMBEDDING_MODEL
        self.encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text"""
        return len(self.encoding.encode(text))
    
    def chunk_text(self, text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
        """
        Split text into chunks for embedding
        
        Args:
            text: Text to chunk
            chunk_size: Maximum tokens per chunk
            overlap: Number of overlapping tokens between chunks
        
        Returns:
            List of text chunks
        """
        if chunk_size is None:
            chunk_size = settings.CHUNK_SIZE
        if overlap is None:
            overlap = settings.CHUNK_OVERLAP
        
        # Split by sentences first
        sentences = text.replace('\n', ' ').split('. ')
        
        chunks = []
        current_chunk = []
        current_tokens = 0
        
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            
            sentence_tokens = self.count_tokens(sentence)
            
            # If single sentence exceeds chunk size, split it
            if sentence_tokens > chunk_size:
                if current_chunk:
                    chunks.append('. '.join(current_chunk) + '.')
                    current_chunk = []
                    current_tokens = 0
                
                # Split long sentence by words
                words = sentence.split()
                temp_chunk = []
                temp_tokens = 0
                
                for word in words:
                    word_tokens = self.count_tokens(word)
                    if temp_tokens + word_tokens > chunk_size:
                        chunks.append(' '.join(temp_chunk))
                        temp_chunk = []
                        temp_tokens = 0
                    temp_chunk.append(word)
                    temp_tokens += word_tokens
                
                if temp_chunk:
                    chunks.append(' '.join(temp_chunk))
                continue
            
            # Add sentence to current chunk
            if current_tokens + sentence_tokens > chunk_size:
                chunks.append('. '.join(current_chunk) + '.')
                # Keep overlap
                overlap_sentences = current_chunk[-2:] if len(current_chunk) > 2 else current_chunk
                current_chunk = overlap_sentences
                current_tokens = sum(self.count_tokens(s) for s in current_chunk)
            
            current_chunk.append(sentence)
            current_tokens += sentence_tokens
        
        # Add remaining chunk
        if current_chunk:
            chunks.append('. '.join(current_chunk) + '.')
        
        logger.debug(f"Split text into {len(chunks)} chunks")
        return chunks
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        
        Args:
            text: Text to embed
        
        Returns:
            Embedding vector
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            embedding = response.data[0].embedding
            logger.debug(f"Generated embedding of dimension {len(embedding)}")
            return embedding
        
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in batch
        
        Args:
            texts: List of texts to embed
        
        Returns:
            List of embedding vectors
        """
        try:
            # OpenAI API supports batch processing
            response = self.client.embeddings.create(
                model=self.model,
                input=texts
            )
            
            embeddings = [item.embedding for item in response.data]
            logger.info(f"Generated {len(embeddings)} embeddings")
            return embeddings
        
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            raise
    
    async def embed_documents(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Embed a list of documents with metadata
        
        Args:
            documents: List of documents with 'text' and optional metadata
        
        Returns:
            List of documents with embeddings added
        """
        logger.info(f"Embedding {len(documents)} documents...")
        
        # Extract texts
        texts = [doc.get('text', '') for doc in documents]
        
        # Generate embeddings in batches (OpenAI limit: 2048 texts per request)
        batch_size = 100
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            embeddings = await self.generate_embeddings_batch(batch)
            all_embeddings.extend(embeddings)
            logger.debug(f"Processed batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}")
        
        # Add embeddings to documents
        for doc, embedding in zip(documents, all_embeddings):
            doc['embedding'] = embedding
        
        logger.info(f"Successfully embedded {len(documents)} documents")
        return documents
    
    def prepare_documents_for_embedding(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Prepare raw data for embedding by creating structured documents
        
        Args:
            data: Raw data from data loader
        
        Returns:
            List of documents ready for embedding
        """
        documents = []
        
        # Process schemes
        if 'schemes' in data:
            for scheme in data['schemes']:
                text = f"""
                Scheme: {scheme.get('name', '')}
                Description: {scheme.get('description', '')}
                Eligibility: {scheme.get('eligibility', '')}
                Funding Amount: {scheme.get('funding_amount', '')}
                Category: {scheme.get('category', '')}
                Source: {scheme.get('source', '')}
                """
                documents.append({
                    'text': text.strip(),
                    'type': 'scheme',
                    'metadata': scheme
                })
        
        # Process legal requirements
        if 'legal' in data:
            for item in data['legal']:
                if 'type' in item:
                    text = f"""
                    Business Type: {item.get('type', '')}
                    Description: {item.get('description', '')}
                    Requirements: {', '.join(item.get('requirements', []))}
                    Registration Time: {item.get('registration_time', '')}
                    Cost Range: {item.get('cost_range', '')}
                    Benefits: {', '.join(item.get('benefits', []))}
                    """
                    documents.append({
                        'text': text.strip(),
                        'type': 'legal',
                        'metadata': item
                    })
        
        # Process funding sources
        if 'funding' in data:
            for source in data['funding']:
                text = f"""
                Funding Type: {source.get('type', '')}
                Description: {source.get('description', '')}
                Typical Amount: {source.get('typical_amount', '')}
                Stage: {source.get('stage', '')}
                """
                documents.append({
                    'text': text.strip(),
                    'type': 'funding',
                    'metadata': source
                })
        
        # Process market data
        if 'market' in data:
            market = data['market']
            if 'indian_startup_ecosystem' in market:
                eco = market['indian_startup_ecosystem']
                text = f"""
                Indian Startup Ecosystem:
                Total Startups: {eco.get('total_startups', '')}
                Unicorns: {eco.get('unicorns', '')}
                Funding 2023: {eco.get('funding_2023', '')}
                Top Sectors: {', '.join(eco.get('top_sectors', []))}
                """
                documents.append({
                    'text': text.strip(),
                    'type': 'market',
                    'metadata': eco
                })
        
        logger.info(f"Prepared {len(documents)} documents for embedding")
        return documents
