// netlify/functions/proxy.js

export async function handler(event) {
  try {

    const apiUrl =
      event.queryStringParameters?.apiUrl;

    if (!apiUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Thiếu apiUrl"
        })
      };
    }

    const params =
      new URLSearchParams(
        event.queryStringParameters
      );

    params.delete("apiUrl");

    const qs = params.toString();

    const fullUrl =
      qs
        ? `${apiUrl}?${qs}`
        : apiUrl;

    console.log(
      "Proxy URL:",
      fullUrl
    );

    const resp =
      await fetch(fullUrl);

    const html =
      await resp.text();

    // ===== Parse HTML =====

    const rows = [];

    const trMatches =
      [...html.matchAll(
        /<tr[^>]*>(.*?)<\/tr>/gis
      )];

    for (
      let i = 1;
      i < trMatches.length;
      i++
    ) {

      const tr =
        trMatches[i][1];

      const tdMatches =
        [...tr.matchAll(
          /<td[^>]*>(.*?)<\/td>/gis
        )];

      if (
        tdMatches.length >= 3
      ) {

        rows.push({

          matram:
            tdMatches[0][1]
              .replace(/<[^>]+>/g, "")
              .trim(),

          thoigian:
            tdMatches[1][1]
              .replace(/<[^>]+>/g, "")
              .trim(),

          solieu:
            parseFloat(
              tdMatches[2][1]
                .replace(/<[^>]+>/g, "")
                .trim()
            )

        });

      }

    }

    return {

      statusCode: 200,

      headers: {

        "Content-Type":
          "application/json",

        "Access-Control-Allow-Origin":
          "*"

      },

      body:
        JSON.stringify(rows)

    };

  }
  catch (e) {

    console.error(e);

    return {

      statusCode: 500,

      headers: {
        "Content-Type":
          "application/json"
      },

      body:
        JSON.stringify({
          error:
            e.message ||
            "Proxy Error"
        })

    };

  }
}