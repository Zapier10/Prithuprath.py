import pandas as pd
import numpy as np

# Generate 2000 rows of traffic
rows = 2000

# Normal background traffic
df = pd.DataFrame({
    'Flow Bytes/s': np.random.uniform(10, 100, size=rows),
    'Packet Length Std': np.random.uniform(1.0, 3.0, size=rows) * 100 
})

# Inject the Zero-Day Payload (Hidden, slow, highly encrypted)
# We spike the Entropy (Packet Length Std) to extreme levels, but keep Velocity low to evade volume-based detection
zero_day_indices = range(1500, 1550) # The attack happens near the end
df.loc[zero_day_indices, 'Flow Bytes/s'] = np.random.uniform(20, 50, size=50) 
df.loc[zero_day_indices, 'Packet Length Std'] = np.random.uniform(8.0, 9.8, size=50) * 100 # Massive Entropy Spike!

# Save to your project folder
df.to_csv('zero_day_traffic.csv', index=False)
print("Synthetic Zero-Day Dataset created successfully: zero_day_traffic.csv")