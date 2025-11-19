import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.optimizers import Adam

def prepare_data(csv_path):
    # Read the CSV file
    df = pd.read_csv(csv_path)
    
    # Separate features and target
    X = df.drop(['LABEL', 'FILE_PATH'], axis=1)  # Remove label and file path columns
    y = df['LABEL']  # Target variable
    y = y.map({'FAKE': 0, 'REAL': 1})  # Convert labels to binary format
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler

def create_keras_model(input_dim):
    model = Sequential()
    model.add(Dense(64, activation='relu', input_dim=input_dim))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1, activation='sigmoid'))  # For binary classification

    model.compile(optimizer=Adam(), loss='binary_crossentropy', metrics=['accuracy'])
    
    return model

# Main execution
if __name__ == "__main__":
    # Path to your CSV file
    csv_path = "news verification/vansh/audio_features.csv"
    
    # Prepare the data
    X_train, X_test, y_train, y_test, scaler = prepare_data(csv_path)
    
    # Create a Keras model
    model = create_keras_model(X_train.shape[1])  # input_dim = number of features
    
    # Train the Keras model
    model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test))
    
    # Save the model to .h5 file
    model.save('audio_model.h5')
    print("Keras model saved as audio_model.h5")
