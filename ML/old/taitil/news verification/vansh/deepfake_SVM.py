import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.svm import SVC
import os 
import joblib  # To save and load models

def prepare_data(csv_path):
    # Read the CSV file
    df = pd.read_csv(csv_path)
    
    # Separate features and target
    X = df.drop(['LABEL', 'FILE_PATH'], axis=1)  # Remove label and file path columns
    y = df['LABEL']  # Target variable
    y = y.map({'FAKE': 0, 'REAL': 1})  # Convert labels to binary format
    # Store feature names before scaling
    feature_names = X.columns.tolist()
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    return X_train_scaled, X_test_scaled, y_train, y_test, feature_names, scaler

def train_and_evaluate_models(X_train, X_test, y_train, y_test, feature_names):
    # Initialize models
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'XGBoost': XGBClassifier(random_state=42),
        'SVM': SVC(kernel='rbf', random_state=42, probability=True)
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\nTraining {name}...")

        # Train the model
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test)
        
        # Calculate and store metrics
        results[name] = {
            'classification_report': classification_report(y_test, y_pred),
            'confusion_matrix': confusion_matrix(y_test, y_pred)
        }
        
        # Print results
        print(f"\n{name} Results:")
        print("Classification Report:")
        print(results[name]['classification_report'])
        
        # Plot confusion matrix
        plt.figure(figsize=(8, 6))
        sns.heatmap(results[name]['confusion_matrix'], 
                   annot=True, 
                   fmt='d', 
                   cmap='Blues',
                   xticklabels=['Real', 'Fake'],
                   yticklabels=['Real', 'Fake'])
        plt.title(f'Confusion Matrix - {name}')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.show()
        
        # For Random Forest, show feature importance
        if name == 'Random Forest':
            feature_importance = pd.DataFrame({
                'feature': feature_names,
                'importance': model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            plt.figure(figsize=(10, 6))
            sns.barplot(data=feature_importance.head(10), x='importance', y='feature')
            plt.title('Top 10 Most Important Features')
            plt.show()
    
    return models, results

def save_models(models, path='models/'):
    """
    Save the trained models to the specified directory.
    """
    import os
    if not os.path.exists(path):
        os.makedirs(path)

    for name, model in models.items():
        model_path = os.path.join(path, f'{name.replace(" ", "_")}_model.joblib')
        joblib.dump(model, model_path)
        print(f"Model {name} saved to {model_path}")

def load_model(model_name, path='models/'):
    """
    Load a saved model from the specified directory.
    """
    model_path = os.path.join(path, f'{model_name.replace(" ", "_")}_model.joblib')
    model = joblib.load(model_path)
    print(f"Model {model_name} loaded from {model_path}")
    return model

def predict_single_audio(model, scaler, features, feature_names):
    """
    Make prediction for a single audio file's features
    """
    # Ensure features are in the correct order
    features_df = pd.DataFrame([features], columns=feature_names)
    
    # Scale the features
    features_scaled = scaler.transform(features_df)
    
    # Make prediction
    prediction = model.predict(features_scaled)
    probability = model.predict_proba(features_scaled)[0]
    
    return prediction[0], probability

# Main execution
if __name__ == "__main__":
    # Path to your CSV file
    csv_path = "news verification/vansh/audio_features.csv"
    
    # Prepare the data
    X_train, X_test, y_train, y_test, feature_names, scaler = prepare_data(csv_path)
    
    # Train and evaluate models
    models, results = train_and_evaluate_models(X_train, X_test, y_train, y_test, feature_names)

    # Save models
    save_models(models)

    # Example: Load a saved model (for testing)
    loaded_model = load_model("Random Forest")  # Example for loading the Random Forest model
