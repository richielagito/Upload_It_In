import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD

def lsa_similarity_sklearn(texts, n_components=2):
    """
    texts: list of string (sudah hasil preprocess dan join token)
    Return: list of similarity (guru vs murid)
    """
    if len(texts) < 2:
        return [0.0]
    # TF-IDF
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(texts)
    # SVD
    svd = TruncatedSVD(n_components=n_components)
    reduced = svd.fit_transform(tfidf_matrix)
    # Cosine similarity: guru (index 0) vs murid (index 1,2,...)
    similarities = []
    for i in range(1, len(texts)):
        a = reduced[0]
        b = reduced[i]
        sim = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)) if np.linalg.norm(a) and np.linalg.norm(b) else 0.0
        similarities.append(round(sim, 4))
    return similarities
