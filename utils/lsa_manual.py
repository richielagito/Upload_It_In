import numpy as np
from .tfidf_manual import compute_tfidf_matrix

def truncated_svd(matrix, k):
    """Perform truncated SVD with better error handling"""
    if matrix.size == 0:
        return np.array([])
    
    # Pastikan k tidak melebihi dimensi matrix
    max_k = min(matrix.shape[0], matrix.shape[1])
    k = min(k, max_k)
    
    if k <= 0:
        return matrix  # Return original if k invalid
    
    try:
        U, S, Vt = np.linalg.svd(matrix, full_matrices=False)
        
        # Truncate ke k dimensi  
        U_k = U[:, :k]
        S_k = S[:k]
        
        # Return reduced representation dengan proper scaling
        return U_k * S_k
        
    except (np.linalg.LinAlgError, ValueError) as e:
        print(f"SVD failed: {e}")
        # Fallback ke matrix asli
        return matrix

def cosine_similarity(vec1, vec2):
    """Compute cosine similarity with better handling"""
    if len(vec1) == 0 or len(vec2) == 0:
        return 0.0
    
    # Flatten vectors
    vec1 = np.array(vec1).flatten()
    vec2 = np.array(vec2).flatten()
    
    # Handle dimension mismatch
    if len(vec1) != len(vec2):
        min_len = min(len(vec1), len(vec2))
        vec1 = vec1[:min_len]
        vec2 = vec2[:min_len]
    
    # Compute norms
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    similarity = np.dot(vec1, vec2) / (norm1 * norm2)
    
    # Clamp to [0, 1] range dan handle floating point errors
    return max(0.0, min(1, float(similarity)))

def perform_lsa_and_similarity(texts, k=2):
    """
    Perform LSA and compute similarities (Individual Comparison)
    
    Args:
        texts: List [guru_text, murid1_text, murid2_text, ...]
        k: Number of latent dimensions
    
    Returns:
        List of similarity scores for each student vs teacher
    """
    if len(texts) < 2:
        return []
    
    guru_text = texts[0]
    similarities = []
    
    # Bandingkan setiap murid dengan guru secara individual
    for i in range(1, len(texts)):
        try:
            # Proses hanya guru + 1 murid (individual assessment)
            current_texts = [guru_text, texts[i]]
            
            # Compute TF-IDF untuk pair ini
            tfidf_matrix = compute_tfidf_matrix(current_texts)
            
            # Validasi matrix
            if tfidf_matrix.size == 0 or tfidf_matrix.shape[0] < 2:
                similarities.append(0.0)
                continue
            
            # Check jika ada konten yang bermakna
            if np.all(tfidf_matrix == 0):
                similarities.append(0.0)
                continue
            
            # Determine optimal k untuk matrix ini
            effective_k = min(k, min(tfidf_matrix.shape))
            
            if effective_k <= 0:
                similarities.append(0.0)
                continue
            
            # Perform LSA
            lsa_vectors = truncated_svd(tfidf_matrix, effective_k)
            
            if lsa_vectors.size == 0 or lsa_vectors.shape[0] < 2:
                similarities.append(0.0)
                continue
            
            # Compute similarity guru vs murid ini
            guru_vector = lsa_vectors[0]
            murid_vector = lsa_vectors[1]
            
            similarity = cosine_similarity(guru_vector, murid_vector)
            similarities.append(similarity)
            
        except Exception as e:
            print(f"Error processing student {i}: {e}")
            similarities.append(0.0)
    
    return similarities
