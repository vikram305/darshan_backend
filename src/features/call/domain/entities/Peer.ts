export class Peer {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public hasAudio: boolean = false,
    public hasVideo: boolean = false
  ) {}
}
