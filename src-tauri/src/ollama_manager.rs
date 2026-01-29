use std::process::{Command, Child, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

pub struct OllamaManager {
    process: Arc<Mutex<Option<Child>>>,
    model_name: String,
}

impl OllamaManager {
    pub fn new(model_name: Option<String>) -> Self {
        OllamaManager {
            process: Arc::new(Mutex::new(None)),
            model_name: model_name.unwrap_or_else(|| "llama2".to_string()),
        }
    }

    /// Check if Ollama is installed
    pub fn is_installed(&self) -> bool {
        Command::new("ollama")
            .arg("--version")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .is_ok()
    }

    /// Start Ollama service in the background
    pub fn start_service(&self) -> Result<(), String> {
        if !self.is_installed() {
            return Err("Ollama is not installed. Please install it from https://ollama.ai".to_string());
        }

        println!("🤖 Starting Ollama service...");

        // Start ollama serve as a background process
        match Command::new("ollama")
            .arg("serve")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
        {
            Ok(child) => {
                *self.process.lock().unwrap() = Some(child);
                println!("✅ Ollama service started");
                
                // Give it time to start
                thread::sleep(Duration::from_secs(2));
                
                Ok(())
            }
            Err(e) => Err(format!("Failed to start Ollama: {}", e)),
        }
    }

    /// Pull the AI model if not already available
    pub fn pull_model(&self) -> Result<(), String> {
        println!("📥 Checking for model: {}", self.model_name);

        // Check if model exists
        let list_output = Command::new("ollama")
            .arg("list")
            .output()
            .map_err(|e| format!("Failed to list models: {}", e))?;

        let list_str = String::from_utf8_lossy(&list_output.stdout);
        
        if list_str.contains(&self.model_name) {
            println!("✅ Model {} already available", self.model_name);
            return Ok(());
        }

        // Pull the model
        println!("📥 Pulling model {} (this may take a few minutes)...", self.model_name);
        
        let output = Command::new("ollama")
            .arg("pull")
            .arg(&self.model_name)
            .output()
            .map_err(|e| format!("Failed to pull model: {}", e))?;

        if output.status.success() {
            println!("✅ Model {} downloaded successfully", self.model_name);
            Ok(())
        } else {
            Err(format!(
                "Failed to pull model: {}",
                String::from_utf8_lossy(&output.stderr)
            ))
        }
    }

    /// Initialize Ollama (start service + pull model)
    pub async fn initialize(&self) -> Result<(), String> {
        // Start the service
        self.start_service()?;

        // Pull the model in the background
        let model_name = self.model_name.clone();
        tokio::task::spawn_blocking(move || {
            let manager = OllamaManager::new(Some(model_name));
            if let Err(e) = manager.pull_model() {
                eprintln!("⚠️  Warning: {}", e);
            }
        });

        Ok(())
    }

    /// Check if Ollama service is responding
    pub async fn health_check(&self) -> bool {
        let client = reqwest::Client::new();
        match client
            .get("http://localhost:11434/api/tags")
            .timeout(Duration::from_secs(2))
            .send()
            .await
        {
            Ok(response) => response.status().is_success(),
            Err(_) => false,
        }
    }

    /// Stop the Ollama service
    pub fn stop_service(&self) {
        if let Some(mut child) = self.process.lock().unwrap().take() {
            println!("🛑 Stopping Ollama service...");
            let _ = child.kill();
            let _ = child.wait();
        }
    }
}

impl Drop for OllamaManager {
    fn drop(&mut self) {
        self.stop_service();
    }
}
