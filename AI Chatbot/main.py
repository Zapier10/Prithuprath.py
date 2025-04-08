import os
import json
import random

import nltk
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

class ChatBotModel(nn.Module):
    def __init__(self, input_size, output_size):
        super(ChatBotModel, self).__init__()
        self.fc1 = nn.Linear(input_size, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, output_size)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.5)

    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        return x

class ChatBotAssistant:
    def __init__(self, intents_path, functional_mappings=None):
        self.model = None
        self.intents_path = intents_path
        self.documents = []
        self.vocabulary = []
        self.intents = []
        self.intents_responses = {}
        self.functional_mappings = functional_mappings
        self.X = None
        self.y = None

    @staticmethod
    def tokenizer_and_lemmatize(text):
        lemmatizer = nltk.WordNetLemmatizer()
        words = nltk.word_tokenize(text)
        words = [lemmatizer.lemmatize(word.lower()) for word in words]
        return words

    def bag_of_words(self, words):
        return [1 if word in words else 0 for word in self.vocabulary]

    def intents_index(self, intent):
        return self.intents.index(intent)

    def parse_intents(self):
        if os.path.exists(self.intents_path):
            with open(self.intents_path, 'r') as f:
                intents_data = json.load(f)

            vocabulary = []
            for intent in intents_data['intents']:
                if intent['tag'] not in self.intents:
                    self.intents.append(intent['tag'])
                    self.intents_responses[intent['tag']] = intent['responses']
                for pattern in intent['patterns']:
                    pattern_words = self.tokenizer_and_lemmatize(pattern)
                    vocabulary.extend(pattern_words)
                    self.documents.append((pattern_words, intent['tag']))
            self.vocabulary = sorted(set(vocabulary))

    def prepare_data(self):
        bags = []
        indices = []
        for words, intent in self.documents:
            bag = self.bag_of_words(words)
            intent_index = self.intents_index(intent)
            bags.append(bag)
            indices.append(intent_index)
        self.X = np.array(bags)
        self.y = np.array(indices)

    def train_model(self, batch_size, lr, epochs):
        X_tensor = torch.tensor(self.X, dtype=torch.float32)
        y_tensor = torch.tensor(self.y, dtype=torch.long)
        dataset = TensorDataset(X_tensor, y_tensor)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
        self.model = ChatBotModel(self.X.shape[1], len(self.intents))
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(self.model.parameters(), lr=lr)

        for epoch in range(epochs):
            running_loss = 0.0
            for batch_X, batch_y in loader:
                optimizer.zero_grad()
                outputs = self.model(batch_X)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
                running_loss += loss.item()
            print(f"Epoch {epoch+1}, Loss: {running_loss/len(loader):.4f}")

    def save_model(self, model_path, dimensions_path):
        torch.save(self.model.state_dict(), model_path)
        with open(dimensions_path, 'w') as f:
            json.dump({'input_size': self.X.shape[1], 'output_size': len(self.intents)}, f)

    def load_model(self, model_path, dimensions_path):
        with open(dimensions_path, 'r') as f:
            dimensions = json.load(f)
        self.model = ChatBotModel(dimensions['input_size'], dimensions['output_size'])
        self.model.load_state_dict(torch.load(model_path))
        self.model.eval()

    def process_message(self, input_message):
        words = self.tokenizer_and_lemmatize(input_message)
        bag = self.bag_of_words(words)
        bag_tensor = torch.tensor([bag], dtype=torch.float32)
        with torch.no_grad():
            predictions = self.model(bag_tensor)
        predicted_class_index = torch.argmax(predictions, dim=1).item()
        predicted_intent = self.intents[predicted_class_index]

        if self.functional_mappings and predicted_intent in self.functional_mappings:
            self.functional_mappings[predicted_intent]()

        if self.intents_responses.get(predicted_intent):
            return random.choice(self.intents_responses[predicted_intent])
        else:
            return "I'm not sure how to respond."

def get_stocks():
    stocks = ['APPL', 'META', 'NVDA', 'GS', 'MSFT']
    print(random.sample(stocks, 3))

if __name__ == '__main__':
    nltk.download('punkt')
    nltk.download('wordnet')

    assistant = ChatBotAssistant('intents.json', functional_mappings={'stocks': get_stocks})
    assistant.parse_intents()

    if not os.path.exists('chatbot_model.pth') or not os.path.exists('dimensions.json'):
        assistant.prepare_data()
        assistant.train_model(batch_size=8, lr=0.001, epochs=100)
        assistant.save_model('chatbot_model.pth', 'dimensions.json')
    else:
        assistant.load_model('chatbot_model.pth', 'dimensions.json')

    while True:
        message = input('Enter your message: ')
        if message.strip().lower() == '/quit':
            break
        print(assistant.process_message(message))