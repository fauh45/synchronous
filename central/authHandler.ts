// Faux-Database for user
// As demo purpose only, do not use in real world production!
const user: Map<string, string> = new Map([
  ["Radon", "RadonIsTheElementPrettyCool!"],
]);

export const isAuthDataValid = (
  username: string,
  password: string
): boolean => {
  const userPassword = user.get(username);

  return userPassword === password && userPassword !== undefined;
};

export const getRandomDeviceId = (): string => {
  return Math.random().toString(36).substring(7);
};
