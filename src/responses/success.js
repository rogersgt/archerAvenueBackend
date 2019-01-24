export default function success(data) {
  return {
    statusCode: !!data ? 200 : 204,
    body: JSON.stringify(data) || data,
    headers: {
      'Access-Control-Allow-Origin': process.env.APP_ORIGIN,
      'Access-Control-Allow-Credentials': '*'
    }
  };
}
