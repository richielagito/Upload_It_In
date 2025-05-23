import re
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

# Inisialisasi hanya sekali untuk efisiensi
stemmer = StemmerFactory().create_stemmer()
stopwords = set(StopWordRemoverFactory().get_stop_words())

def preprocess(text):
    if not text or not isinstance(text, str):
        return ""
    
    # Lowercase
    text = text.lower()
    
    # Hapus karakter non-alphanumeric kecuali spasi
    text = re.sub(r'[^\w\s]', '', text)
    
    # Hapus extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Split dan filter stopwords
    words = text.split()
    words = [w for w in words if w and w not in stopwords and len(w) > 1]
    
    # Stemming
    stemmed_words = [stemmer.stem(w) for w in words]
    
    return " ".join(stemmed_words)