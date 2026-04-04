import { Peer } from './Peer';

export class Room {
  private peers: Map<string, Peer> = new Map();

  constructor(
    public readonly code: string,
    public readonly createdAt: Date = new Date()
  ) {}

  public getPeers(): Peer[] {
    return Array.from(this.peers.values());
  }

  public getPeer(peerId: string): Peer | undefined {
    return this.peers.get(peerId);
  }

  public addPeer(peer: Peer): void {
    this.peers.set(peer.id, peer);
  }

  public removePeer(peerId: string): void {
    this.peers.delete(peerId);
  }
}
