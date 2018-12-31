export default function unauthorized(data) {
  return {
    statusCode: 403,
    body: JSON.stringify(data) || data || 'Unauthorized.',
    headers: {
      'Access-Control-Allow-Origin': process.env.APP_ORIGIN
    }
  };
}
