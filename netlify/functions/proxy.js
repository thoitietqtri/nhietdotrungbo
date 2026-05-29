// netlify/functions/proxy.js

export async function handler(event) {
  try {

    // URL API được truyền từ client

    const apiUrl =
      event.queryStringParameters?.apiUrl;

    if (!apiUrl) {
      return {
        statusCode: 400,
        body: "Thiếu tham số apiUrl",
      };
    }

    // Lấy toàn bộ query string

    const params = new URLSearchParams(
      event.queryStringParameters
    );

    // Xóa apiUrl khỏi query
    params.delete("apiUrl");

    const qs = params.toString();

    const fullUrl =
      qs.length > 0
        ? `${apiUrl}?${qs}`
        : apiUrl;

    console.log(
      "Proxy URL:",
      fullUrl
    );

    const resp = await fetch(fullUrl, {
      method: "GET",
    });

    const text = await resp.text();

    return {
      statusCode: 200,

      headers: {
        "Content-Type":
          "text/html; charset=utf-8",

        "Access-Control-Allow-Origin":
          "*",
      },

      body: text,
    };
  }
  catch (e) {

    console.error(e);

    return {
      statusCode: 500,

      body:
        e.message ||
        "Proxy Error",
    };
  }
}

