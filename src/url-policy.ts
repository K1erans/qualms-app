export function isLocalHttpUrl(url: URL): boolean {
  return (
    url.protocol === "http:" &&
    (url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]")
  );
}
