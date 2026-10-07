interface ViteTypeOptions {
  // disallow unknown keys in ImportMetaEnv
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
