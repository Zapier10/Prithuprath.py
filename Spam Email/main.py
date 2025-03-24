import string 
import numpy as np 
import pandas as pd 

import nltk 
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer 

from sklearn.feature_extraction.text import CountVectorizer 
from sklearn.model_selection import train_test_split 
from sklearn.ensemble import RandomForestClassifier

# Download stopwords
nltk.download('stopwords')

# Load the dataset
df = pd.read_csv('spam_ham_dataset.csv')

# Check for missing values and clean the text
df['text'] = df['text'].fillna('').apply(lambda x: x.replace('\r\n', ' '))

# Verify dataset structure
print(df.info())

# Initialize the Stemmer
stemmer = PorterStemmer()
corpus = []

# Convert stopwords list to a set for faster lookup
stopwords_set = set(stopwords.words('english'))

# Process text
for i in range(len(df)):
    text = df['text'].iloc[i].lower()  # Convert to lowercase
    text = text.translate(str.maketrans('', '', string.punctuation)).split()  # Remove punctuation and tokenize
    text = [stemmer.stem(word) for word in text if word not in stopwords_set]  # Stemming and stopword removal
    text = ' '.join(text)  # Join words back into a sentence
    corpus.append(text)

# Vectorization
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(corpus).toarray()
y = df['label_num']  # Ensure this column exists in your dataset

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42) 

# Train RandomForest Classifier
clf = RandomForestClassifier(n_jobs=-1, random_state=42)
clf.fit(X_train, y_train)

# Model Accuracy
print("Model Accuracy:", clf.score(X_test, y_test))

# Select multiple test emails (random 5 samples from dataset)
test_indices = np.random.choice(df.index, 5, replace=False)
test_emails = df.loc[test_indices, 'text']

# Preprocess and classify multiple test emails
for i, email in enumerate(test_emails):
    email_text = email.lower().translate(str.maketrans('', '', string.punctuation)).split()
    email_text = [stemmer.stem(word) for word in email_text if word not in stopwords_set]
    email_text = ' '.join(email_text)
    
    # Transform and predict
    X_email = vectorizer.transform([email_text]).toarray()  # Convert sparse matrix to array
    prediction = clf.predict(X_email)
    
    print(f"Email {i+1}:")
    print(f"Original Text: {email[:200]}...")  # Print first 200 characters for readability
    print(f"Predicted Label: {'Spam' if prediction[0] == 1 else 'Ham'}\n")
