export interface UserEntity {
  uuid: string;
  mail: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  ctime: string; // ISO8601
  mtime: string; // ISO8601
}
