export interface ConfigEntity {
  // only site admins can log in, everyone else reads the published information
  readOnly: boolean;
}
