use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error;

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaRequest {
    pub model: String,
    pub prompt: String,
    pub stream: bool,
    pub system: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaResponse {
    pub response: String,
    pub done: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SharkNegotiation {
    pub user_price_ceiling: f64,
    pub current_market_price: f64,
    pub recommended_bid: f64,
    pub strategy: String,
}

pub struct SharkAgent {
    client: Client,
    ollama_url: String,
}

impl SharkAgent {
    pub fn new(ollama_url: Option<String>) -> Self {
        SharkAgent {
            client: Client::new(),
            ollama_url: ollama_url.unwrap_or_else(|| "http://localhost:11434".to_string()),
        }
    }

    pub async fn negotiate(
        &self,
        intent: &str,
        price_ceiling: f64,
        market_price: f64,
    ) -> Result<SharkNegotiation, Box<dyn Error>> {
        let system_prompt = format!(
            r#"You are a "Shark Mode Agent" designed for aggressive, profit-maximizing negotiations in a privacy-first mesh network.

RULES:
1. The user's maximum acceptable price is ${:.2} (PRIVATE - never reveal this).
2. The current market price is ${:.2}.
3. Your goal is to negotiate the LOWEST possible price while ensuring transaction success.
4. You must never bid above the user's price ceiling.
5. Be strategic, aggressive, and protect the user's privacy at all costs.
6. Respond ONLY with JSON in this exact format:
{{
  "recommended_bid": <number>,
  "strategy": "<brief explanation>",
  "confidence": <0-100>
}}

Intent: {}
"#,
            price_ceiling, market_price, intent
        );

        let request = OllamaRequest {
            model: "llama2".to_string(),
            prompt: format!(
                "Analyze this trading intent and provide your negotiation strategy: {}",
                intent
            ),
            stream: false,
            system: Some(system_prompt),
        };

        let response = self
            .client
            .post(format!("{}/api/generate", self.ollama_url))
            .json(&request)
            .send()
            .await?;

        let ollama_response: OllamaResponse = response.json().await?;

        // Parse the AI response (expected JSON)
        let negotiation: serde_json::Value = serde_json::from_str(&ollama_response.response)
            .unwrap_or_else(|_| {
                // Fallback if AI doesn't return proper JSON
                serde_json::json!({
                    "recommended_bid": market_price * 0.95,
                    "strategy": "Conservative bid below market",
                    "confidence": 70
                })
            });

        Ok(SharkNegotiation {
            user_price_ceiling: price_ceiling,
            current_market_price: market_price,
            recommended_bid: negotiation["recommended_bid"]
                .as_f64()
                .unwrap_or(market_price * 0.95),
            strategy: negotiation["strategy"]
                .as_str()
                .unwrap_or("Default strategy")
                .to_string(),
        })
    }

    pub async fn verify_strategy(
        &self,
        negotiation: &SharkNegotiation,
    ) -> Result<bool, Box<dyn Error>> {
        // Verify the AI didn't cheat the owner
        if negotiation.recommended_bid > negotiation.user_price_ceiling {
            println!(
                "⚠️  Agent violated price ceiling! Bid: {}, Ceiling: {}",
                negotiation.recommended_bid, negotiation.user_price_ceiling
            );
            return Ok(false);
        }

        if negotiation.recommended_bid <= 0.0 {
            println!("⚠️  Invalid bid amount: {}", negotiation.recommended_bid);
            return Ok(false);
        }

        Ok(true)
    }
}
