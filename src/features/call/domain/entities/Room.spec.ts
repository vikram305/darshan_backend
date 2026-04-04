import { Room } from './Room';
import { Peer } from './Peer';

describe('Room Entity', () => {
  it('should correctly add, get, and list peers in a room', () => {
    const room = new Room('123456');
    const peer1 = new Peer('peer-1', 'Alice');
    const peer2 = new Peer('peer-2', 'Bob');

    room.addPeer(peer1);
    room.addPeer(peer2);

    expect(room.getPeers().length).toBe(2);
    expect(room.getPeer('peer-1')).toBe(peer1);
    expect(room.getPeer('non-existent')).toBeUndefined();
  });

  it('should correctly remove a peer by ID', () => {
    const room = new Room('789012');
    const peer1 = new Peer('peer-1', 'Alice');

    room.addPeer(peer1);
    expect(room.getPeers().length).toBe(1);

    room.removePeer('peer-1');
    expect(room.getPeers().length).toBe(0);
    expect(room.getPeer('peer-1')).toBeUndefined();
  });
});
