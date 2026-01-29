mod mesh;
mod agent;
mod zk_handler;
mod ollama_manager;

use mesh::{MeshNetwork, PrivacyIntent};
use agent::{SharkAgent, SharkNegotiation};
use zk_handler::{ZKHandler, ProofRequest, ZKProof};
use ollama_manager::OllamaManager;
use std::sync::Arc;
use tokio::sync::{Mutex, mpsc};
use tauri::{State, Manager, Emitter};

// Global state for mesh network
pub struct AppState {
    pub mesh_tx: Option<mpsc::UnboundedSender<PrivacyIntent>>,
    pub agent: Arc<SharkAgent>,
    pub zk_handler: Arc<ZKHandler>,
    pub ollama: Arc<OllamaManager>,
}

#[tauri::command]
async fn send_intent_to_mesh(
    payload: String,
    state: State<'_, Arc<Mutex<AppState>>>,
) -> Result<String, String> {
    let state_lock = state.lock().await;
    
    // Check if payload is a settlement/deal message (contains "type" field)
    if let Ok(json_val) = serde_json::from_str::<serde_json::Value>(&payload) {
        if json_val.get("type").is_some() {
            // This is a settlement/deal message, send as raw JSON
            println!("📤 Sending settlement message: {}", payload);
            if let Some(tx) = &state_lock.mesh_tx {
                // We need to broadcast this differently - it's not a PrivacyIntent
                // For now, wrap it in a special intent type
                let intent = PrivacyIntent {
                    intent_type: "settlement".to_string(),
                    payload: payload.clone(),
                    encrypted: false,
                };
                tx.send(intent).map_err(|e| e.to_string())?;
                return Ok(format!("Settlement message broadcasted: {}", payload));
            } else {
                return Err("Mesh network not initialized".to_string());
            }
        }
    }
    
    // Regular intent message
    let intent = PrivacyIntent {
        intent_type: "trade".to_string(),
        payload: payload.clone(),
        encrypted: true,
    };

    if let Some(tx) = &state_lock.mesh_tx {
        tx.send(intent).map_err(|e| e.to_string())?;
        Ok(format!("Intent broadcasted: {}", payload))
    } else {
        Err("Mesh network not initialized".to_string())
    }
}

#[tauri::command]
async fn negotiate_with_shark(
    intent: String,
    price_ceiling: f64,
    market_price: f64,
    state: State<'_, Arc<Mutex<AppState>>>,
) -> Result<SharkNegotiation, String> {
    let state = state.lock().await;
    state
        .agent
        .negotiate(&intent, price_ceiling, market_price)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn generate_zk_proof(
    balance: u64,
    bid_amount: u64,
    price_ceiling: u64,
    state: State<'_, Arc<Mutex<AppState>>>,
) -> Result<ZKProof, String> {
    println!("🚀 handling generate_zk_proof command");
    let state = state.lock().await;
    let request = ProofRequest {
        balance,
        bid_amount,
        price_ceiling,
    };
    let result = state
        .zk_handler
        .generate_proof(request)
        .await
        .map_err(|e| e.to_string());
    
    match &result {
        Ok(_) => println!("✅ ZK Proof generated successfully"),
        Err(e) => eprintln!("❌ ZK Proof generation failed: {}", e),
    }
    
    result
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Create consistent Ollama instance
            let ollama_manager = Arc::new(OllamaManager::new(Some("llama2".to_string())));
            let ollama_init = ollama_manager.clone();
            
            // Initialize Ollama in background (but keep instance alive in AppState)
            tauri::async_runtime::spawn(async move {
                let ollama = ollama_init;
                
                println!("🔍 Checking Ollama installation...");
                if !ollama.is_installed() {
                    eprintln!("⚠️  Ollama not found!");
                    eprintln!("📝 Please install from: https://ollama.ai");
                    eprintln!("   Or run: brew install ollama");
                } else {
                    // Start Ollama service and pull model
                    match ollama.initialize().await {
                        Ok(_) => {
                            println!("✅ Ollama ready!");
                            
                            // Wait for service to be healthy
                            for i in 1..=10 {
                                if ollama.health_check().await {
                                    println!("✅ Ollama service is healthy");
                                    break;
                                }
                                if i == 10 {
                                    eprintln!("⚠️  Ollama service not responding");
                                }
                                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
                            }
                        }
                        Err(e) => {
                            eprintln!("❌ Failed to initialize Ollama: {}", e);
                        }
                    }
                }
            });

            // Pass strong reference to mesh setup to store in AppState
            let ollama_state = ollama_manager.clone();

            // Initialize mesh network in background
            tauri::async_runtime::spawn(async move {
                let (intent_tx, intent_rx) = mpsc::unbounded_channel();
                let (event_tx, mut event_rx) = mpsc::unbounded_channel();

                // Initialize mesh network
                match MeshNetwork::new().await {
                    Ok(mut mesh) => {
                        println!("✅ Mesh network initialized");

                        // Spawn mesh event loop with intent channel
                        tokio::spawn(async move {
                            if let Err(e) = mesh.start(event_tx, intent_rx).await {
                                eprintln!("Mesh network error: {}", e);
                            }
                        });

                        // Forward mesh events to frontend
                        let handle_clone = app_handle.clone();
                        tokio::spawn(async move {
                            while let Some(event) = event_rx.recv().await {
                                let _ = handle_clone.emit("mesh-event", event);
                            }
                        });
                    }
                    Err(e) => {
                        eprintln!("❌ Failed to initialize mesh: {}", e);
                    }
                }

                let state = Arc::new(Mutex::new(AppState {
                    mesh_tx: Some(intent_tx),
                    agent: Arc::new(SharkAgent::new(None)),
                    zk_handler: Arc::new(ZKHandler::new(None)),
                    ollama: ollama_state,
                }));

                app_handle.manage(state);
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            send_intent_to_mesh,
            negotiate_with_shark,
            generate_zk_proof
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
