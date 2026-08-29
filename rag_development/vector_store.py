import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any

class VectorStore:
    """
    Maneja la base de datos vectorial ChromaDB y la generación de embeddings.
    """
    def __init__(self, db_path: str = "./chroma_db", collection_name: str = "leyes_chilenas"):
        # 1. Inicializar cliente de ChromaDB persistente en disco
        self.client = chromadb.PersistentClient(path=db_path)
        
        # 2. Inicializar o cargar la colección
        self.collection = self.client.get_or_create_collection(name=collection_name)
        
        # 3. Cargar el modelo de embeddings local (rápido y eficiente)
        # all-MiniLM-L6-v2 es ideal para español/inglés y requiere pocos recursos
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
    def add_chunks(self, chunks: List[Dict[str, Any]]):
        """
        Genera embeddings para los chunks y los guarda en la BD vectorial.
        """
        if not chunks:
            return

        texts = [chunk['text'] for chunk in chunks]
        metadatas = [chunk['metadata'] for chunk in chunks]
        
        # Generar IDs únicos para cada chunk
        # En producción, usa un hash del texto o un ID compuesto (ley_id + articulo_num)
        ids = [f"{m.get('ley_id', 'unknown')}_{m.get('numero', i)}" for i, m in enumerate(metadatas)]
        
        # Generar embeddings usando SentenceTransformers
        embeddings = self.embedding_model.encode(texts).tolist()
        
        # Insertar o actualizar en ChromaDB
        self.collection.upsert(
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        print(f"[OK] {len(chunks)} fragmentos insertados/actualizados en ChromaDB.")
        
    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Busca los fragmentos más relevantes para una consulta (el perfil de empresa).
        """
        # Vectorizar la consulta
        query_embedding = self.embedding_model.encode([query]).tolist()
        
        # Buscar en ChromaDB
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=top_k
        )
        
        # Formatear resultados
        formatted_results = []
        if results['documents'] and results['documents'][0]:
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    'text': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'distance': results['distances'][0][i] if 'distances' in results else None
                })
                
        return formatted_results
