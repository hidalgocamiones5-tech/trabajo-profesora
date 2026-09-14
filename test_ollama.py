import ollama

print("Testing ollama stream...")
try:
    stream = ollama.chat(
        model="llama3.2:3b",
        messages=[{"role": "user", "content": "Genera un JSON simple con nombre y edad. Formato JSON estricto."}],
        format="json",
        stream=True
    )
    for chunk in stream:
        print(chunk['message']['content'], end='', flush=True)
    print("\nDONE")
except Exception as e:
    print(f"ERROR: {e}")
