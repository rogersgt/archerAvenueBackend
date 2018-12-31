export default function badRequest(data) {
  return {
    data: JSON.stringify(data) || data || 'Bad request.',
    statusCode: 400,
    headers: {
      'Access-Control-Allow-Origin': process.env.APP_ORIGIN
    }
  };
}
