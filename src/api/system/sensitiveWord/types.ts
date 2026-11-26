export interface SensitiveWordQuery extends PageQuery {
  word?: string;
  category?: string;
  status?: number;
}

export interface SensitiveWordForm {
  wordId?: number;
  word?: string;
  category?: string;
  description?: string;
  status?: number;
}

export interface SensitiveWordVO extends BaseEntity {
  wordId?: number;
  word?: string;
  category?: string;
  description?: string;
  status?: number;
}

export interface SensitiveWordTest {
  text: string;
  category?: string[];
}

export interface SensitiveWordTestVO {
  containsSensitiveWord: boolean;
  sensitiveWordReplace: string;
  sensitiveWords: string[];
}
