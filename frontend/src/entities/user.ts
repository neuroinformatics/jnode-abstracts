export interface UserSimpleEntity {
  uuid: string;
  mail: string;
}

export interface UserEntity extends UserSimpleEntity {
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  ctime: string; // ISO8601
  mtime: string; // ISO8601
  isAdmin: boolean;
}
