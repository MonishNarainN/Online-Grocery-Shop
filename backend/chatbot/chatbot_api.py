import joblib
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

import gc

print("Loading model and dataset...")
model_data = joblib.load('meal_chatbot.pkl')
dataset = model_data['dataset']
embeddings = model_data['embeddings']
del model_data # Clean up the dictionary wrapper
gc.collect()

print("Loading SentenceTransformer ('all-MiniLM-L6-v2')...")
encoder = SentenceTransformer('all-MiniLM-L6-v2')
gc.collect()
print("Chatbot API is ready.")

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({"response": "I didn't quite catch that. What kind of dish are you looking for?"})
        
    query_embedding = encoder.encode([user_message])
    similarities = cosine_similarity(query_embedding, embeddings)[0]
    
    # Get top 3 indices
    top_indices = np.argsort(similarities)[::-1][:3]
    
    best_match_score = similarities[top_indices[0]]
    
    if best_match_score < 0.2:
        return jsonify({"response": "I'm not exactly sure what recipe matches that. Can you describe the ingredients or flavors you're looking for?"})
        
    response_text = "Here are a few dishes that match what you're looking for:\n\n"
    
    for i, idx in enumerate(top_indices):
        row = dataset.iloc[idx]
        dish = row.get('dish', 'Unknown Dish').title()
        course = str(row.get('course', 'Unknown Course')).title()
        ingredients = row.get('ingredients', 'Various ingredients')
        
        response_text += f"{i+1}. **{dish}** _({course})_\n"
        response_text += f"   Contains: {ingredients}\n\n"
        
    response_text += "Would you like to try searching for these ingredients in our store?"
        
    return jsonify({"response": response_text.strip()})

import os

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
