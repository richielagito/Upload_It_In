from sklearn.feature_extraction.text import TfidfVectorizer

def get_tfidf_matrix(texts):
    vectorizer = TfidfVectorizer()
    return vectorizer.fit_transform(texts)
