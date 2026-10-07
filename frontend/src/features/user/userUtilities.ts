// at least 10 characters with a letter, a digit and a symbol; the server only checks the length
export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= 10 &&
    /[a-z]/i.test(password) &&
    /\d/.test(password) &&
    /[.,/<>?!@#$%^&*()=`_+|~{};':"\-\\[\]]/.test(password)
  );
};
