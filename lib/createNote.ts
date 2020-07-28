export enum CreateType {
  DAILY = "daily",
  WEEKLY = "weekly",
}

export interface Note {
  title: string;
  uuid: string;
}

export async function createNote(type: CreateType): Promise<Note> {
  switch (type) {
    case CreateType.DAILY:
      break;
    case CreateType.WEEKLY:
      break;
  }
  return {
    title: "Test",
    uuid: "abc123",
  };
}
