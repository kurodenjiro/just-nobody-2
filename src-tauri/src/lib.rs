mod mesh;
mod agent;
mod zk_handler;

use mesh::{MeshNetwork, PrivacyIntent, MeshEvent};
use agent::{SharkAgent, SharkNegotiation};
use zk_handler::{ZKHandler, ProofRequest, ZKProof};
use std::sync::Arc;
use tokio::sync::{Mutex, mpsc};
use tauri::{State, Manager, Emitter};

// Global state for mesh network
pub struct AppState {
    pub mesh_tx: Option<mpsc::UnboundedSender<PrivacyIntent>>,
    pub agent: Arc<SharkAgent>,
    pub zk_handler: Arc<ZKHandler>,
}

#[tauri::command]
async fn send_intent_to_mesh(
    payload: String,
    state: State<'_, Arc<Mutex<AppState>>>,
) -> Result<String, String> {
    let state = state.lock().await;
    
    let intent = PrivacyIntent {
        intent_type: "trade".to_string(),
        payload: payload.clone(),
        encrypted: true,
    };

    if let Some(tx) = &state.mesh_tx {
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
    let state = state.lock().await;
    let request = ProofRequest {
        balance,
        bid_amount,
        price_ceiling,
    };
    state
        .zk_handler
        .generate_proof(request)
        .await
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_handle = app.handle().clone();

            // Initialize mesh network in background
            tauri::async_runtime::spawn(async move {
                let (intent_tx, mut intent_rx) = mpsc::unbounded_channel();
                let (event_tx, mut event_rx) = mpsc::unbounded_channel();

                // Initialize mesh network
                match MeshNetwork::new().await {
                    Ok(mut mesh) => {
                        println!("✅ Mesh network initialized");

                        // Spawn mesh event loop
                        tokio::spawn(async move {
                            if let Err(e) = mesh.start(event_tx).await {
                                eprintln!("Mesh network error: {}", e);
                            }
                        });

                        // Handle intents from frontend
                        tokio::spawn(async move {
                            while let Some(intent) = intent_rx.recv().await {
                                println!("Broadcasting intent: {:?}", intent);
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
