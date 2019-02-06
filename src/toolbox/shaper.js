export function getTokenFromEvent(event={}) {
  if (!event || !event.headers || !event.headers['Authorization']) {
    return false
  }
  let token = event.headers['Authorization'];
  return token.replace('Bearer ', '');
}

export function shapeDynamoResponseForEngineers(engineers=[]) {
  const shapedEngineers = engineers.map(shapeDynamoResponseForEngineer);
  return shapedEngineers;
}

export function shapeDynamoResponseForEngineer(engineer={}) {
  const {
    firstName = {},
    lastName = {},
    bio = {},
    clients = {}
  } = engineer;
  return {
    firstName: firstName.S || '',
    lastName: lastName.S || '',
    bio: bio.S || '',
    clients: clients.SS || []
  };
}
