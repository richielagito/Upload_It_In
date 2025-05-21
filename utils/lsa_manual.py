import numpy as np
from .tfidf_manual import compute_tfidf_matrix

def truncated_svd(matrix, k):
    U, S, Vt = np.linalg.svd(matrix, full_matrices=False)
    U_k = U[:, :k]
    S_k = np.diag(S[:k])
    return np.dot(U_k, S_k)

def cosine_similarity(vec1, vec2):
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return np.dot(vec1, vec2) / (norm1 * norm2)

def perform_lsa_and_similarity(texts, k=2):
    guru_text = texts[0]
    sim_scores = []
    
    # Bandingkan setiap teks murid dengan guru secara individual
    for i in range(1, len(texts)):
        # Hanya proses guru dan satu murid saja per iterasi
        current_texts = [guru_text, texts[i]]
        tfidf = compute_tfidf_matrix(current_texts)
        
        # Periksa apakah matriks valid
        if tfidf.shape[0] < 2 or tfidf.shape[1] == 0:
            sim_scores.append(0.0)
            continue
            
        # Lakukan LSA
        lsa_vectors = truncated_svd(tfidf, min(k, min(tfidf.shape)))
        
        # Hitung cosine similarity
        sim = cosine_similarity(lsa_vectors[0], lsa_vectors[1])
        sim_scores.append(sim)
        
    return sim_scores