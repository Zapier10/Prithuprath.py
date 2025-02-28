import os
import numpy as np
import tensorflow as tf
import cv2 
import matplotlib.pyplot as plt

# Load MNIST dataset
mnist = tf.keras.datasets.mnist
(x_train, y_train), (x_test, y_test) = mnist.load_data()

# Normalize the dataset
x_train = tf.keras.utils.normalize(x_train, axis=1)
x_test = tf.keras.utils.normalize(x_test, axis=1)

# Define model path
model_path = 'handwritten.keras'  # Use .keras extension

if not os.path.exists(model_path):  # Train only if model does not exist
    model = tf.keras.models.Sequential([
        tf.keras.layers.Flatten(input_shape=(28, 28)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dense(10, activation='softmax')  # 10 output classes
    ])

    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    model.fit(x_train, y_train, epochs=3)
    
    model.save(model_path)  # Save the trained model in .keras format

# Load the model
model = tf.keras.models.load_model(model_path)

# Start processing images
image_number = 0

while os.path.isfile(f"{image_number}.png"):  # Check in the current directory
    try: 
        print(f"Processing image: {image_number}.png")  # Debugging step

        # Read and process the image
        img = cv2.imread(f"{image_number}.png", cv2.IMREAD_GRAYSCALE)

        if img is None:  
            raise ValueError(f"Error: Image {image_number}.png not loaded properly. Check the file.")

        img = cv2.resize(img, (28, 28))  # Resize to 28x28
        img = np.invert(img)  # Invert colors (white background, black digit)
        img = img / 255.0  # Normalize
        img = img.reshape(1, 28, 28)  # Reshape for model input

        # Debugging Step: Check shape
        print(f"Image shape before prediction: {img.shape}")

        # Make prediction
        prediction = model.predict(img)
        print(f"This digit is probably a {np.argmax(prediction)}")

        # Display the image
        plt.imshow(img[0], cmap=plt.cm.binary)
        plt.show()
    
    except Exception as e: 
        print(f"Error processing image {image_number}.png: {e}")
    
    finally: 
        image_number += 1
