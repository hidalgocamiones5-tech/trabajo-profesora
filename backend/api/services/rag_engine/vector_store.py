import os
from typing import List, Dict, Any
from django.conf import settings

# Caché global para evitar recargar el modelo y cliente DB en cada petición
_EMBEDDING_MODEL_CACHE = None
_CHROMADB_CLIENT_CACHE = None

class VectorStore:
    """
    Maneja la base de datos vectorial ChromaDB y la generación de embeddings
    para el catálogo legal chileno dentro del backend Django.
    """
    def __init__(self, db_path: str = None, collection_name: str = "leyes_chilenas"):
        global _EMBEDDING_MODEL_CACHE, _CHROMADB_CLIENT_CACHE
        import chromadb
        from sentence_transformers import SentenceTransformer

        if not db_path:
            # Ubicación por defecto dentro del backend de Django
            db_path = os.path.join(settings.BASE_DIR, "chroma_db")
            
        if _CHROMADB_CLIENT_CACHE is None:
            # Setting Settings(allow_reset=True) or using a single shared instance fixes the Rust lock
            _CHROMADB_CLIENT_CACHE = chromadb.PersistentClient(path=db_path)
            
        self.client = _CHROMADB_CLIENT_CACHE
        self.collection = self.client.get_or_create_collection(name=collection_name)
        
        if _EMBEDDING_MODEL_CACHE is None:
            _EMBEDDING_MODEL_CACHE = SentenceTransformer('all-MiniLM-L6-v2')
        self.embedding_model = _EMBEDDING_MODEL_CACHE

        
    def add_chunks(self, chunks: List[Dict[str, Any]]):
        """Genera embeddings e inserta fragmentos legales en ChromaDB."""
        if not chunks:
            return

        texts = [chunk['text'] for chunk in chunks]
        metadatas = [chunk['metadata'] for chunk in chunks]
        ids = [chunk.get('id') or f"{m.get('ley_id', 'norma')}_{m.get('numero', i)}" for i, (chunk, m) in enumerate(zip(chunks, metadatas))]
        
        embeddings = self.embedding_model.encode(texts).tolist()
        
        self.collection.upsert(
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        print(f"[OK] {len(chunks)} fragmentos normativos indexados en ChromaDB.")
        
    def search(self, query: str, top_k: int = 6, where: dict = None) -> List[Dict[str, Any]]:
        """Recupera los artículos normativos más afines usando Búsqueda Híbrida (Semántica + Metadatos)."""
        query_embedding = self.embedding_model.encode([query]).tolist()
        
        query_kwargs = {
            "query_embeddings": query_embedding,
            "n_results": top_k
        }
        if where:
            query_kwargs["where"] = where
            
        results = self.collection.query(**query_kwargs)
        
        formatted_results = []
        if results.get('documents') and results['documents'][0]:
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    'text': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'distance': results['distances'][0][i] if 'distances' in results else None
                })
                
        return formatted_results
