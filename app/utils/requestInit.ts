export default interface RequestInit2 extends RequestInit {
  onmessage(text: string): void;
  onclose(): void;
}
