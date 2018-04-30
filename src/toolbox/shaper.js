export function getTokenFromEvent(event={}) {
  if (!event || !event.headers || !event.headers['Authorization']) {
    return false
  }
  let token = event.headers['Authorization'];
  return token.replace('Bearer ', '');
}