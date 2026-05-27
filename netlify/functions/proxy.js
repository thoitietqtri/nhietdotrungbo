exports.handler = async function(event) {

  try {

    const url = event.queryStringParameters.url;

    const response = await fetch(url);

    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: text
    };

  } catch (err) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
}