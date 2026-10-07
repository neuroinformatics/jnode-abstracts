import ky from 'ky';

// Spring Security issues the CSRF token in this cookie and expects it back in this header
const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-XSRF-TOKEN';

// methods not protected against CSRF by Spring Security
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

const getCookie = (name: string): string | null => {
  const prefix = `${name}=`;
  const cookie = document.cookie.split('; ').find((c) => c.startsWith(prefix));
  return cookie != null ? decodeURIComponent(cookie.substring(prefix.length)) : null;
};

// ky instance for the backend api, sending the CSRF token with state changing requests
const api = ky.create({
  hooks: {
    beforeRequest: [
      ({ request }) => {
        if (!SAFE_METHODS.includes(request.method)) {
          const token = getCookie(CSRF_COOKIE_NAME);
          if (token != null) {
            request.headers.set(CSRF_HEADER_NAME, token);
          }
        }
      },
    ],
  },
});

export default api;
