import requests
import config
import json
import time
import pandas as pd
from pathlib import Path

# Carica le credenziali da config.py
CLIENT_ID = config.CLIENT_ID
CLIENT_SECRET = config.CLIENT_SECRET

def get_access_token(client_id, client_secret):
    """Ottiene il token di accesso dall'API di Terna."""
    url = "https://api.terna.it/transparency/oauth/accessToken"
    payload = {'grant_type': 'client_credentials', 'client_id': client_id, 'client_secret': client_secret}
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    
    print("1. Ottenimento del token di accesso...")
    response = requests.post(url, data=payload, headers=headers)
    response.raise_for_status() # Lancia un'eccezione se la richiesta fallisce
    print("✅ Token ottenuto con successo!")
    return response.json().get('access_token')

def get_total_load(access_token):
    """Ottiene i dati del carico totale usando il token."""
    data_url = "https://api.terna.it/load/v2.0/total-load"
    # Prendiamo i dati di ieri, una data sicura per avere dati consolidati
    from datetime import date, timedelta
    yesterday = date.today() - timedelta(days=1)
    date_str = yesterday.strftime('%d/%m/%Y')
    
    params = {'dateFrom': date_str, 'dateTo': date_str}
    headers = {'Authorization': f'Bearer {access_token}'}

    print(f"2. Download dei dati per il giorno: {date_str}...")
    response = requests.get(data_url, headers=headers, params=params)
    response.raise_for_status()
    print("✅ Dati scaricati con successo!")
    return response.json()

# --- Esecuzione principale dello script ---
if __name__ == "__main__":
    try:
        # Step 1: Ottieni il token
        access_token = get_access_token(CLIENT_ID, CLIENT_SECRET)
        
        # Step 2: Attendi per rispettare il rate limit
        time.sleep(1) 
        
        # Step 3: Ottieni i dati da Terna
        total_load_data = get_total_load(access_token)
        
        # --- NUOVA PARTE: Elaborazione e Salvataggio ---
        print("3. Elaborazione dei dati con Pandas...")
        
        # Estrai la lista di dati dalla risposta JSON
        records = total_load_data.get('total_load', [])
        
        if not records:
            print("⚠️ Nessun dato sul carico trovato nella risposta. Uscita.")
        else:
            # Converti la lista in un DataFrame di Pandas
            df = pd.DataFrame(records)
            
            # Converti le colonne importanti nei tipi di dato corretti
            df['date'] = pd.to_datetime(df['date'])
            df['total_load_MW'] = pd.to_numeric(df['total_load_MW'])
            
            # Ordina i dati per data e zona, per pulizia
            df = df.sort_values(by=['bidding_zone', 'date'])
            
            # Crea la cartella 'dati' se non esiste
            Path("dati").mkdir(exist_ok=True)
            
            # Salva il DataFrame in un file JSON
            output_path = "dati/carico_elettrico.json"
            # 'orient="records"' crea un file JSON pulito, perfetto per JavaScript
            df.to_json(output_path, orient="records", indent=2, date_format="iso")
            
            print(f"✅ Dati elaborati e salvati con successo in '{output_path}'")
            print("\n--- Missione completata! ---")

    except Exception as e:
        print(f"\n❌ ERRORE: {e}")