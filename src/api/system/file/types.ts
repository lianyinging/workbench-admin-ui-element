export interface FileQuery extends PageQuery {
  filename?: string;
  originalFilename?: string;
  basePath?: string;
  path?: string;
  ext?: string;
  contentType?: string;
  fileAcl?: string;
  fileCategoryId?: number;
  userType?: string;
  isLock?: number;
  createBy?: number;
  createByName?: string;
  suffixes?: string[];
  maxSize?: number;
  contentTypes?: string[];
}

export interface FileForm {
  fileId?: number;
  originalFilename?: string;
  userMetadata?: string;
  fileCategoryId?: number;
  isLock?: number;
  createBy?: number;
}

export interface FileVO extends BaseEntity {
  fileId?: number;
  url?: string;
  previewUrl?: string;
  downloadUrl?: string;
  size?: number;
  filename?: string;
  originalFilename?: string;
  basePath?: string;
  path?: string;
  ext?: string;
  contentType?: string;
  storageConfigId?: number;
  thUrl?: string;
  thFilename?: string;
  thSize?: number;
  thContentType?: string;
  objectId?: string;
  objectType?: string;
  metadata?: string;
  userMetadata?: string;
  thMetadata?: string;
  thUserMetadata?: string;
  attr?: string;
  fileAcl?: string;
  thFileAcl?: string;
  hashInfo?: string;
  uploadId?: string;
  uploadStatus?: number;
  fileCategoryId?: number;
  userType?: string;
  isLock?: number;
  categoryPath?: string;
}

export interface FileActiveVO extends FileVO {
  active: boolean;
}

export interface FileUploadVO {
  fileName?: string;
  fileId?: string;
  previewUrl?: string;
  downloadUrl?: string;
}
