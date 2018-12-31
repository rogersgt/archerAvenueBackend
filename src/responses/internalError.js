export default function internalError(data) {
  return {
    data: JSON.stringify(data) || data,
    statusCode: 500,
    headers: {
      'Access-Control-Allow-Origin': process.env.APP_ORIGIN
    }
  };
}
