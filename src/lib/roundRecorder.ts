export class RoundRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  async start(): Promise<void> {
    this.cancel();

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.chunks = [];
    this.recorder = new MediaRecorder(this.stream);

    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.recorder.start();
  }

  stop(): Promise<Blob | null> {
    if (!this.recorder || this.recorder.state === "inactive") {
      this.cancel();
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      const recorder = this.recorder!;

      recorder.onerror = () => {
        this.cancel();
        reject(new Error("Microphone error"));
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(this.chunks, { type: mimeType });
        this.cancel();
        resolve(blob.size > 0 ? blob : null);
      };

      recorder.stop();
    });
  }

  cancel(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.recorder = null;
    this.chunks = [];
  }
}
