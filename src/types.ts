export interface Peer {
    id: string;
    address: string;
    timestamp: number;
}

export interface ThoughtLog {
    message: string;
    timestamp: number;
    type: "noir" | "arcium" | "silentswap" | "mesh" | "agent";
}

export interface MeshEvent {
    type: string;
    peer_id?: string;
    address?: string;
    intent?: any;
}

export type ViewState = "nexus" | "negotiation" | "integrity" | "report" | "config";
