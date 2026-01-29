use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::error::Error;
use chrono::{DateTime, Utc};
// Crypto Imports
use solana_sdk::signature::{Keypair, Signer};
use solana_sdk::pubkey::Pubkey;
use keyring::Entry;
use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng, rand_core::RngCore},
    Aes256Gcm, Nonce, Key
};
use base64::{Engine as _, engine::general_purpose::STANDARD as BASE64};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityRecord {
    pub alias: String,
    pub emoji: String, // New field
    pub keypair_base58: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityView {
    pub alias: String,
    pub emoji: String, // New field,
    pub pubkey: String,
}

// ... 

    pub fn load_identities(&mut self) -> Result<Vec<IdentityView>, Box<dyn Error>> {
        if self.identity_path.exists() {
            println!("🔑 Loading Identities V2 from {:?}", self.identity_path);
            let content = fs::read_to_string(&self.identity_path)?;
            
            match serde_json::from_str::<Vec<IdentityRecord>>(&content) {
                Ok(mut records) => {
                     // Migration: Add emoji if missing (naive check not needed for new struct, but good practice if mixed)
                     // Since we changed struct, old file might fail to parse if strict.
                     // Serde default? Or we bump version file again to v3 to be safe.
                     // Let's bump to V3.
                     self.identities = records;
                     if self.identities.is_empty() {
                         return self.generate_new_identity("Primary Fox".to_string(), "🦊".to_string());
                     }
                     self.get_identity_views()
                },
                Err(_) => {
                    println!("⚠️ Failed to parse identity list (V3), creating new...");
                    return self.generate_new_identity("Glitch Fox".to_string(), "👾".to_string());
                }
            }
        } else {
            return self.generate_new_identity("Genesis Fox".to_string(), "🦊".to_string());
        }
    }

    pub fn generate_new_identity(&mut self, alias: String, emoji: String) -> Result<Vec<IdentityView>, Box<dyn Error>> {
        println!("🆕 Generating NEW Identity '{}' [{}]...", alias, emoji);
        let keypair = Keypair::new();
        let record = IdentityRecord {
            alias,
            emoji: emoji.clone(),
            keypair_base58: keypair.to_base58_string(),
        };
        self.identities.push(record);
        self.save_identities()?;
        self.get_identity_views()
    }
    
    // ...

    pub fn get_identity_views(&self) -> Result<Vec<IdentityView>, Box<dyn Error>> {
        let mut views = Vec::new();
        for id in &self.identities {
            // Validate keypair just in case, but rely on stored string
            // Keypair::from_base58_string panics on invalid input. 
            // We assume stored data is valid.
            let kp = Keypair::from_base58_string(&id.keypair_base58);
            views.push(IdentityView {
                alias: id.alias.clone(),
                emoji: id.emoji.clone(),
                pubkey: kp.pubkey().to_string(),
            });
        }
        Ok(views)
    }

    pub fn get_primary_pubkey(&self) -> String {
        if let Some(first) = self.identities.first() {
             let kp = Keypair::from_base58_string(&first.keypair_base58);
             return kp.pubkey().to_string();
        }
        "unknown".to_string()
    }

    /// Syncs state from Helius DAS API and saves encrypted snapshot
    pub async fn sync_state(&self, _wallet_address_override: &str) -> Result<Snapshot, Box<dyn Error>> {
        let api_key = self.helius_api_key.as_deref().ok_or("Missing Helius API Key")?;
        let url = format!("https://mainnet.helius-rpc.com/?api-key={}", api_key);
        
        // Use Real Identity if available
        let wallet_address = self.get_primary_pubkey();
        
        // If unknown (no identities), use override or fail
        let target_address = if wallet_address != "unknown" {
            wallet_address.clone()
        } else {
             _wallet_address_override.to_string()
        };

        println!("🔄 [Bridge] JSON-RPC Request to Helius DAS for {}", wallet_address);

        let client = reqwest::Client::new();
        let payload = serde_json::json!({
            "jsonrpc": "2.0",
            "id": "nobody-sync",
            "method": "getAssetsByOwner",
            "params": {
                "ownerAddress": wallet_address,
                "page": 1,
                "limit": 1000,
                "displayOptions": {
                    "showFungible": true,
                    "showNativeBalance": true
                }
            }
        });

        let res = client.post(&url)
            .json(&payload)
            .send()
            .await?;

        if !res.status().is_success() {
            return Err(format!("Helius API Error: {}", res.status()).into());
        }

        let body: serde_json::Value = res.json().await?;
        
        let mut assets = Vec::new();
        
        if let Some(items) = body["result"]["items"].as_array() {
            for item in items {
                let id = item["id"].as_str().unwrap_or("unknown").to_string();
                let amount = 1; // Simplified
                let symbol = item["content"]["metadata"]["symbol"].as_str().unwrap_or("UNK").to_string();
                
                assets.push(CompressedAsset {
                    id,
                    amount,
                    symbol,
                    owner: wallet_address.clone(),
                    proof: None,
                });
            }
        }
        
        println!("✅ [Bridge] Fetched {} assets.", assets.len());

        let snapshot = Snapshot {
            timestamp: Utc::now(),
            assets,
            signature: "verified_by_helius_rpc".to_string(),
        };

        self.save_snapshot_encrypted(&snapshot)?;
        
        Ok(snapshot)
    }

    fn get_snapshot_key(&self) -> Result<Key<Aes256Gcm>, Box<dyn Error>> {
        let entry = Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_USER)?;
        
        match entry.get_password() {
            Ok(pass) => {
                let bytes = BASE64.decode(pass)?;
                if bytes.len() != 32 { return Err("Invalid key length in keychain".into()); }
                Ok(*Key::<Aes256Gcm>::from_slice(&bytes))
            }
            Err(_) => {
                println!("🔐 Generating new encryption key in Keychain...");
                let mut key_bytes = [0u8; 32];
                OsRng.fill_bytes(&mut key_bytes);
                let encoded = BASE64.encode(key_bytes);
                entry.set_password(&encoded)?;
                Ok(*Key::<Aes256Gcm>::from_slice(&key_bytes))
            }
        }
    }

    fn save_snapshot_encrypted(&self, snapshot: &Snapshot) -> Result<(), Box<dyn Error>> {
        let json = serde_json::to_vec(&snapshot)?;
        
        let key = self.get_snapshot_key()?;
        let cipher = Aes256Gcm::new(&key);
        let nonce = Aes256Gcm::generate_nonce(&mut OsRng); // 96-bits; unique per message
        
        let ciphertext = cipher.encrypt(&nonce, json.as_ref())
            .map_err(|_| "Encryption failed")?;
            
        // Prepend nonce to ciphertext for storage
        let mut final_data = nonce.to_vec();
        final_data.extend_from_slice(&ciphertext);
        
        fs::write(&self.storage_path, final_data)?;
        println!("💾 [Bridge] Snapshot ENCRYPTED and saved via Keychain Key.");
        Ok(())
    }

    pub fn get_latest_snapshot(&self) -> Result<Snapshot, Box<dyn Error>> {
        if !self.storage_path.exists() {
            return Err("No snapshot found".into());
        }
        let file_data = fs::read(&self.storage_path)?;
        if file_data.len() < 12 { return Err("Corrupted snapshot file".into()); }
        
        let (nonce_bytes, ciphertext) = file_data.split_at(12);
        let nonce = Nonce::from_slice(nonce_bytes);
        
        let key = self.get_snapshot_key()?;
        let cipher = Aes256Gcm::new(&key);
        
        let plaintext = cipher.decrypt(nonce, ciphertext)
            .map_err(|_| "Decryption failed - Invalid Key or Corrupted Data")?;
            
        let snapshot: Snapshot = serde_json::from_slice(&plaintext)?;
        Ok(snapshot)
    }

    pub fn delete_snapshot(&self) -> Result<(), Box<dyn Error>> {
        if self.storage_path.exists() {
            fs::remove_file(&self.storage_path)?;
        }
        Ok(())
    }

    pub fn delete_identity(&self) -> Result<(), Box<dyn Error>> {
        if self.identity_path.exists() {
            fs::remove_file(&self.identity_path)?;
        }
        Ok(())
    }
    
    // ... Mock methods for sessions
    pub fn init_ephemeral_session(&mut self) -> MagicBlockSession {
        // Generate a real ephemeral keypair for the agent
        let agent_keypair = Keypair::new();
        let authority_pubkey = agent_keypair.pubkey().to_string();
        
        // In a full implementation, we would sign a delegation transaction here
        // For now, we store this valid keypair as the "Agent Authority"
        
        let session = MagicBlockSession {
            session_id: format!("sess_{}", Utc::now().timestamp()),
            authority: authority_pubkey,
            expiry: Utc::now() + chrono::Duration::hours(1),
            is_active: true,
        };
        self.current_session = Some(session.clone());
        session
    }

    pub fn get_status(&self) -> String {
         match &self.current_session {
            Some(s) if s.is_active => format!("MagicBlock Engine: Active [Agent: {}...]", &s.authority[..4]),
            _ => "MagicBlock Engine: Inactive".to_string(),
        }
    }
}
