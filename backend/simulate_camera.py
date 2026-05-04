import os
import random
import time
import requests

API_URL = "http://localhost:5000/api/predict"
IMAGES_DIR = os.path.join("..", "helmet_dataset", "val", "images")

if not os.path.exists(IMAGES_DIR):
    # Try raw dataset if the helmet_dataset is not ready yet
    IMAGES_DIR = os.path.join("..", "raw_dataset", "images")

if not os.path.exists(IMAGES_DIR):
    print("No images found to test with!")
    exit(1)

images = [f for f in os.listdir(IMAGES_DIR) if f.endswith(('.png', '.jpg', '.jpeg'))]

if not images:
    print("No image files found in the dataset directory.")
    exit(1)

print(f"Found {len(images)} images for testing.")
print("Starting camera simulation... Press Ctrl+C to stop.\n")

try:
    while True:
        img_name = random.choice(images)
        img_path = os.path.join(IMAGES_DIR, img_name)
        
        print(f"Sending {img_name}...")
        
        try:
            with open(img_path, 'rb') as f:
                files = {'image': (img_name, f, 'image/jpeg')}
                response = requests.post(API_URL, files=files)
                
            if response.status_code == 200:
                data = response.json()
                if data.get("violation_recorded"):
                    print(f" [ALERT] VIOLATION DETECTED! (No Helmet) - Check your React dashboard.")
                else:
                    print(f" [OK] All clear.")
            else:
                print(f" [ERROR] Failed to get response: {response.text}")
        except requests.exceptions.ConnectionError:
            print(f" [WAIT] Backend server is offline. Waiting to reconnect...")
            
        # Wait a few seconds before sending the next frame
        time.sleep(5)
except KeyboardInterrupt:
    print("\nSimulation stopped.")
