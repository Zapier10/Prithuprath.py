import google.generativeai as genai

# Put your exact API key here
genai.configure(api_key="AIzaSyD-DAlWsJGB_0Q3czWt5SN2pKi1HGwceQE")

print("Asking Google what models this API key can access...\n")

try:
    available_models = False
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"FOUND MODEL: {m.name}")
            available_models = True
            
    if not available_models:
        print("ERROR: Your API key connects, but it has ZERO models attached to it!")
except Exception as e:
    print(f"CRITICAL ERROR: {e}")