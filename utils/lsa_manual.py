from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

def compute_lsa_similarity(X, n_components=2):
    n_components = min(n_components, X.shape[1] - 1)
    svd = TruncatedSVD(n_components=n_components, random_state=42)
    X_lsa = svd.fit_transform(X)
    similarities = [
        cosine_similarity([X_lsa[0]], [vec])[0][0]
        for vec in X_lsa[1:]
    ]
    return similarities
