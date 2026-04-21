export interface Project {
  readonly name: string;
  readonly href: string;
  readonly section: string;
  readonly date: string;
  readonly tags: readonly string[];
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly image: string;
  readonly external: boolean;
}
