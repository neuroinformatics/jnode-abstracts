// Keep @types/node on the 24.x line to match the Node.js version used for
// the build and deployment. Its "latest" dist-tag points at a newer major
// line (26.x), so the default target would propose a major upgrade.
export default {
  target: (name) => (name === '@types/node' ? 'minor' : 'latest'),
};
