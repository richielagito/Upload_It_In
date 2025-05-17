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
    tfidf = compute_tfidf_matrix(texts)
    # Jika TF-IDF menghasilkan matrix kosong, kembalikan list kosong
    if tfidf.size == 0:
        return [0.0] * (len(texts) - 1)
    lsa_vectors = truncated_svd(tfidf, k)
    guru_vec = lsa_vectors[0]
    sim_scores = []
    for i in range(1, len(lsa_vectors)):
        sim = cosine_similarity(guru_vec, lsa_vectors[i])
        sim_scores.append(sim)
    return sim_scores
