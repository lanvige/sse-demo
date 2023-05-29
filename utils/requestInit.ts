export default interface RequestInit2 extends RequestInit {
  onMessage(text: string): void;
  onClose(): void;
}
