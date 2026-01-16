export interface UploadFile {
  public_id: string;
  secure_url: string;
  format: string;
  isLinked?: boolean;
}

export interface UploadGroup {
  folder: string;
  files: UploadFile[];
}
