export interface OpcDesktopUserQuery extends PageQuery {
  userName?: string;
  nickName?: string;
  status?: string;
}

export interface OpcDesktopUserCoworkerTool {
  coworkerId?: number;
  logicalMcp?: string;
  toolName?: string;
}

export interface OpcDesktopUserForm {
  userId?: number;
  userName?: string;
  nickName?: string;
  password?: string;
  status?: string;
  /** 1已订阅 0未订阅（有勾选应用则为 1） */
  subscribed?: string;
  appIds?: number[];
  coworkerIds?: number[];
  coworkerTools?: OpcDesktopUserCoworkerTool[];
  remark?: string;
}

export interface OpcDesktopUserVo extends BaseEntity {
  userId?: number;
  userName?: string;
  nickName?: string;
  status?: string;
  subscribed?: string;
  appIds?: number[];
  appTitles?: string[];
  coworkerIds?: number[];
  coworkerTitles?: string[];
  coworkerTools?: OpcDesktopUserCoworkerTool[];
  remark?: string;
  lastLoginIp?: string;
  lastLoginTime?: string;
  online?: boolean;
}