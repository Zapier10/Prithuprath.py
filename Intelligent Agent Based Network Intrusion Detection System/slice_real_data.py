import pandas as pd

print("Loading the massive CIC-IDS2017 file... (This may take a minute)")
# Replace this filename if yours is named slightly differently
df = pd.read_csv('Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv')

# Clean up column names (CIC-IDS has annoying leading spaces)
df.columns = df.columns.str.strip()

print("Extracting Normal Traffic and DDoS Attacks...")
# Get 500 rows of Normal Traffic
benign = df[df['Label'] == 'BENIGN'].head(500)

# Get 100 rows of DDoS Attack Traffic
ddos = df[df['Label'] == 'DDoS'].head(100)

# Get 500 more rows of Normal Traffic
benign_2 = df[df['Label'] == 'BENIGN'].tail(500)

# Combine them into a timeline
demo_df = pd.concat([benign, ddos, benign_2])

# Map the real columns to your engine's expected features
final_demo = pd.DataFrame({
    'timestamp': demo_df['Flow ID'] if 'Flow ID' in demo_df.columns else range(len(demo_df)), # Placeholder for time
    'velocity': demo_df['Flow Packets/s'].replace([float('inf'), float('-inf')], 0).fillna(0),
    'entropy': demo_df['Bwd Packet Length Std'].fillna(0),
    'label': demo_df['Label']
})

final_demo.to_csv('real_network_traffic.csv', index=False)
print("Success! Created 'real_network_traffic.csv' for your dashboard.")