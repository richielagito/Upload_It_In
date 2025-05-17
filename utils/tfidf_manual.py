import math
from collections import Counter
import numpy as np

def compute_tf(text):
    words = text.split()
    tf = Counter(words)
    total = len(words)
    return {w: tf[w] / total for w in tf}

def compute_idf(docs):
    N = len(docs)
    vocab = set(word for doc in docs for word in doc.split())
    idf = {}
    for word in vocab:
        df = sum(1 for doc in docs if word in doc.split())
        idf[word] = math.log(N / (1 + df))
    return idf, sorted(vocab)

def compute_tfidf_matrix(docs):
    idf, vocab = compute_idf(docs)
    matrix = []
    for doc in docs:
        tf = compute_tf(doc)
        vector = [tf.get(w, 0) * idf[w] for w in vocab]
        matrix.append(vector)
    return np.array(matrix)
