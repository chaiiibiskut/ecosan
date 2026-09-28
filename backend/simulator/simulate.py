import random
import time
import requests
import threading
from datetime import datetime

API_BASE = "http://127.0.0.1:8000/api"

def get_bins():
    resp = requests.get(f"{API_BASE}/bins")
    resp.raise_for_status()
    return resp.json()

def post_reading(bin_id, fill_pct, weight_kg=None, battery_pct=None, gas_ppm=None):
    data = {
        "bin_id": bin_id,
        "fill_pct": round(fill_pct, 1),
    }
    if weight_kg is not None:
        data["weight_kg"] = round(weight_kg, 1)
    if battery_pct is not None:
        data["battery_pct"] = round(battery_pct, 1)
    resp = requests.post(f"{API_BASE}/bins/{bin_id}/reading", json=data)
    if resp.status_code != 200:
        print(f"[{datetime.now()}] Error posting reading for bin {bin_id}: {resp.text}")
    return resp

def simulate():
    print(f"[{datetime.now()}] Starting bin simulator...")
    while True:
        try:
            bins = get_bins()
            active_bins = [b for b in bins if b["is_active"]]
            
            for bin in active_bins:
                bin_id = bin["id"]
                current_fill = bin["fill_pct"]
                current_battery = bin["battery_pct"]
                
                increment = random.uniform(0.5, 3.0)
                new_fill = current_fill + increment
                
                battery_drain = random.uniform(0.01, 0.1)
                new_battery = max(0, current_battery - battery_drain)
                
                weight = random.uniform(0.5, 8.0)
                
                if new_fill >= 100:
                    new_fill = random.uniform(3, 8)
                    weight = random.uniform(20, 50)
                    print(f"[{datetime.now()}] Bin {bin['bin_code']} (ID: {bin_id}) COLLECTED - reset to {new_fill:.1f}%")
                
                gas_ppm = None
                if random.random() < 0.02:
                    gas_ppm = random.uniform(500, 2000)
                    print(f"[{datetime.now()}] ⚠️  GAS SPIKE on Bin {bin['bin_code']} (ID: {bin_id}): {gas_ppm:.0f} ppm")
                
                post_reading(bin_id, new_fill, weight, new_battery, gas_ppm)
            
            time.sleep(3)
            
        except requests.exceptions.ConnectionError:
            print(f"[{datetime.now()}] Cannot connect to API, retrying in 5s...")
            time.sleep(5)
        except Exception as e:
            print(f"[{datetime.now()}] Error: {e}")
            time.sleep(3)

if __name__ == "__main__":
    simulate()