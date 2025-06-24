# app.py

import streamlit as st
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# ------------------------------------------
# Load and Filter Data
# ------------------------------------------

@st.cache_data
def load_data():
    # Load data
    books = pd.read_csv('data/Books.csv', dtype=str, encoding='latin-1', on_bad_lines='skip')
    ratings = pd.read_csv('data/Ratings.csv', dtype=str, encoding='latin-1', on_bad_lines='skip')

    # Clean ratings
    ratings['Book-Rating'] = pd.to_numeric(ratings['Book-Rating'], errors='coerce')
    ratings.dropna(subset=['User-ID', 'ISBN', 'Book-Rating'], inplace=True)
    ratings = ratings[ratings['Book-Rating'] > 0]

    # Merge with books (include image URLs)
    ratings_books = ratings.merge(books[['ISBN', 'Book-Title', 'Image-URL-L']], on='ISBN')
    ratings_books = ratings_books[['User-ID', 'Book-Title', 'Book-Rating', 'Image-URL-L']]

    # Filter: keep books with >50 ratings
    book_counts = ratings_books['Book-Title'].value_counts()
    popular_books = book_counts[book_counts > 50].index
    ratings_books = ratings_books[ratings_books['Book-Title'].isin(popular_books)]

    # Filter: keep users with >20 ratings
    user_counts = ratings_books['User-ID'].value_counts()
    active_users = user_counts[user_counts > 20].index
    ratings_books = ratings_books[ratings_books['User-ID'].isin(active_users)]

    return ratings_books

# ------------------------------------------
# Build Similarity Matrix
# ------------------------------------------

@st.cache_data
def build_model(ratings_books):
    user_item_matrix = ratings_books.pivot_table(index='User-ID', columns='Book-Title', values='Book-Rating')
    user_item_matrix.fillna(0, inplace=True)
    similarity = cosine_similarity(user_item_matrix.T)
    similarity_df = pd.DataFrame(similarity, index=user_item_matrix.columns, columns=user_item_matrix.columns)
    return similarity_df

# ------------------------------------------
# Recommendation Function
# ------------------------------------------

def recommend_books(book_title, sim_df, num_recommendations=5):
    if book_title not in sim_df.columns:
        return []
    similar_books = sim_df[book_title].sort_values(ascending=False)
    recommended = similar_books.iloc[1:num_recommendations+1].index.tolist()
    return recommended

# ------------------------------------------
# Streamlit Web UI
# ------------------------------------------

st.set_page_config(page_title="📚 Book Recommender", layout="centered")
st.title("📚 Book Recommendation System")
st.caption("Get book recommendations with covers using collaborative filtering.")

# Load Data and Model
with st.spinner("Loading and preparing data..."):
    ratings_books = load_data()
    similarity_df = build_model(ratings_books)
    all_titles = sorted(similarity_df.columns.tolist())
    book_images = ratings_books.drop_duplicates('Book-Title').set_index('Book-Title')['Image-URL-L'].to_dict()

# Dropdown for Book Selection
book_input = st.selectbox("Select a book you liked:", options=all_titles)
num_recs = st.slider("How many recommendations?", 1, 10, 5)

# Recommendation Button
if st.button("Recommend"):
    with st.spinner("Finding recommendations..."):
        recommendations = recommend_books(book_input, similarity_df, num_recommendations=num_recs)

        if recommendations:
            st.success(f"📚 Books similar to: {book_input}")
            for i, rec in enumerate(recommendations, 1):
                st.markdown(f"**{i}. {rec}**")
                if rec in book_images:
                    st.image(book_images[rec], width=150)
        else:
            st.error("No similar books found.")
