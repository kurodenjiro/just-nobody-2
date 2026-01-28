use futures::StreamExt;
use libp2p::{
    gossipsub, mdns, noise,
    swarm::{NetworkBehaviour, SwarmEvent},
    tcp, yamux, Swarm, SwarmBuilder,
};
use serde::{Deserialize, Serialize};
use std::collections::hash_map::DefaultHasher;
use std::error::Error;
use std::hash::{Hash, Hasher};
use std::time::Duration;
use tokio::sync::mpsc;

#[derive(NetworkBehaviour)]
#[behaviour(to_swarm = "MeshBehaviourEvent")]
pub struct MeshBehaviour {
    pub mdns: mdns::tokio::Behaviour,
    pub gossipsub: gossipsub::Behaviour,
}

#[derive(Debug)]
pub enum MeshBehaviourEvent {
    Mdns(mdns::Event),
    Gossipsub(gossipsub::Event),
}

impl From<mdns::Event> for MeshBehaviourEvent {
    fn from(event: mdns::Event) -> Self {
        MeshBehaviourEvent::Mdns(event)
    }
}

impl From<gossipsub::Event> for MeshBehaviourEvent {
    fn from(event: gossipsub::Event) -> Self {
        MeshBehaviourEvent::Gossipsub(event)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrivacyIntent {
    pub intent_type: String,
    pub payload: String,
    pub encrypted: bool,
}

pub struct MeshNetwork {
    pub swarm: Swarm<MeshBehaviour>,
    pub topic: gossipsub::IdentTopic,
}

impl MeshNetwork {
    pub async fn new() -> Result<Self, Box<dyn Error>> {
        // Generate ephemeral keypair for "Nobody" identity
        let local_key = libp2p::identity::Keypair::generate_ed25519();
        let local_peer_id = local_key.public().to_peer_id();
        
        println!("🔐 Ephemeral PeerID generated: {}", local_peer_id);

        // Configure Gossipsub for Privacy Intent broadcasting
        let message_id_fn = |message: &gossipsub::Message| {
            let mut s = DefaultHasher::new();
            message.data.hash(&mut s);
            gossipsub::MessageId::from(s.finish().to_string())
        };

        let gossipsub_config = gossipsub::ConfigBuilder::default()
            .heartbeat_interval(Duration::from_secs(1))
            .validation_mode(gossipsub::ValidationMode::Strict)
            .message_id_fn(message_id_fn)
            .build()
            .map_err(|msg| std::io::Error::new(std::io::ErrorKind::Other, msg))?;

        let mut gossipsub = gossipsub::Behaviour::new(
            gossipsub::MessageAuthenticity::Signed(local_key.clone()),
            gossipsub_config,
        )?;

        // Create the Privacy Intent topic
        let topic = gossipsub::IdentTopic::new("just-nobody-privacy-intents");
        gossipsub.subscribe(&topic)?;

        // Set up mDNS for local peer discovery (ShadowWire mesh)
        let mdns = mdns::tokio::Behaviour::new(mdns::Config::default(), local_peer_id)?;

        let behaviour = MeshBehaviour { mdns, gossipsub };

        // Build the Swarm with Noise encryption (ShadowWire philosophy)
        let swarm = SwarmBuilder::with_existing_identity(local_key)
            .with_tokio()
            .with_tcp(
                tcp::Config::default(),
                noise::Config::new,
                yamux::Config::default,
            )?
            .with_behaviour(|_| behaviour)?
            .with_swarm_config(|c| c.with_idle_connection_timeout(Duration::from_secs(60)))
            .build();

        Ok(MeshNetwork { swarm, topic })
    }

    pub async fn start(&mut self, tx: mpsc::UnboundedSender<MeshEvent>) -> Result<(), Box<dyn Error>> {
        // Listen on all interfaces (offline-first mesh)
        self.swarm.listen_on("/ip4/0.0.0.0/tcp/0".parse()?)?;

        loop {
            match self.swarm.next().await {
                Some(SwarmEvent::NewListenAddr { address, .. }) => {
                    println!("📡 Listening on {}", address);
                    let _ = tx.send(MeshEvent::ListeningStarted { address: address.to_string() });
                }
                Some(SwarmEvent::Behaviour(event)) => match event {
                    MeshBehaviourEvent::Mdns(mdns::Event::Discovered(list)) => {
                        for (peer_id, multiaddr) in list {
                            println!("🔍 Peer discovered: {} at {}", peer_id, multiaddr);
                            self.swarm.behaviour_mut().gossipsub.add_explicit_peer(&peer_id);
                            let _ = tx.send(MeshEvent::PeerDiscovered {
                                peer_id: peer_id.to_string(),
                                address: multiaddr.to_string(),
                            });
                        }
                    }
                    MeshBehaviourEvent::Mdns(mdns::Event::Expired(list)) => {
                        for (peer_id, _) in list {
                            println!("👻 Peer expired: {}", peer_id);
                            self.swarm.behaviour_mut().gossipsub.remove_explicit_peer(&peer_id);
                        }
                    }
                    MeshBehaviourEvent::Gossipsub(gossipsub::Event::Message { message, .. }) => {
                        let intent: Result<PrivacyIntent, _> = serde_json::from_slice(&message.data);
                        if let Ok(intent) = intent {
                            println!("📬 Received Intent: {:?}", intent);
                            let _ = tx.send(MeshEvent::IntentReceived { intent });
                        }
                    }
                    _ => {}
                },
                _ => {}
            }
        }
    }

    pub fn broadcast_intent(&mut self, intent: PrivacyIntent) -> Result<(), Box<dyn Error>> {
        let payload = serde_json::to_vec(&intent)?;
        self.swarm
            .behaviour_mut()
            .gossipsub
            .publish(self.topic.clone(), payload)?;
        println!("📤 Intent broadcasted to mesh");
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type")]
pub enum MeshEvent {
    ListeningStarted { address: String },
    PeerDiscovered { peer_id: String, address: String },
    IntentReceived { intent: PrivacyIntent },
}
