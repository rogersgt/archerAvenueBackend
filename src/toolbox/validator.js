// handles event.body for Lambda
export function handleBody(body) {
  if (typeof body === 'string') {
    return JSON.parse(body);
  }
  return body;
}