export function getTokenFromEvent(event={}) {
  if (!event || !event.headers || !event.headers['Authorization']) {
    return false
  }
  let token = event.headers['Authorization'];
  return token.replace('Bearer ', '');
}

export function shapeDynamoResponseForEngineers(engineers=[]) {
  const shapedEngineers = engineers.reduce(shapeDynamoResponseForEngineer);
  return shapedEngineers;
}

export function shapeDynamoResponseForEngineer(engineer={}) {
  const {
    firstName = '',
    lastName = '',
    about = [],
    clients = []
  } = engineer;
  return {
    firstName: firstName.S || '',
    lastName: lastName.S || '',
    about: about.SS || [],
    clients: clients.SS || []
  };
}
