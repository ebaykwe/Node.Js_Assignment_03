const http = require("http");
const { findUser } = require("./db.function");

function getBodyFromStream(req) {
  return new Promise((resolve, reject) => {
    if (req.method !== "GET") {
      // Only parse the body for non-GET requests
      const data = [];
      req.on("data", (chunk) => {
        data.push(chunk);
      });
      req.on("end", () => {
        const body = Buffer.concat(data).toString();
        if (body) {
          // Assuming that the body is a JSON object
          resolve(JSON.parse(body));
          return;
        }
        resolve({});
      });

      req.on("error", (err) => {
        reject(err);
      });
    } else {
      resolve({});
    }
  });
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("authenticate", req.headers.authorization);
  if (!authHeader) {
    res.statusCode = 401;
    res.end();
    return;
  }

  const [authType, encodedCredentials] = authHeader.split(" ");
  if (authType.toLowerCase() !== "basic" || !encodedCredentials) {
    res.statusCode = 401;
    res.end();
    return;
  }

  const decodedCredentials = Buffer.from(encodedCredentials, "base64").toString();
  const [username, password] = decodedCredentials.split(":");
  const user = findUser(username);

  if (!user || user.password !== password) {
    res.statusCode = 401;
    res.end();
    return;
  }

  next(req, res);
}

function handleMethodNotImplemented(req, res) {
  res.statusCode = 501;
  res.end("Method Not Implemented");
}

// Endpoint handlers for books
function getBooks(req, res) {
  console.log("getBooks", req.body);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ books: [{ name: "Harry Potter" }] }));
}

function postBooks(req, res) {
  console.log("postBooks", req.body);
  //handleMethodNotImplemented(req, res);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ books: [{ name: "Gary" }] }));
}

function putBooks(req, res) {
  console.log("putBooks", req.body);
  //handleMethodNotImplemented(req, res);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ books: [{ name: "Potter" }] }));
}

function patchBooks(req, res) {
  console.log("patchBooks", req.body);
  //handleMethodNotImplemented(req, res);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ books: [{ name: "Harry" }] }));
}

function deleteBooks(req, res) {
  console.log("deleteBooks", req.body);
  //handleMethodNotImplemented(req, res);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ books: [{ name: "Babatunde" }] }));
}

// Endpoint handlers for authors
function handleAuthorsGet(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ authors: [{ name: "J.K. Rowling" }] }));
}

function handleAuthorsPost(req, res) {
  handleMethodNotImplemented(req, res);
}

function handleAuthorsPut(req, res) {
  handleMethodNotImplemented(req, res);
}

function handleAuthorsPatch(req, res) {
  handleMethodNotImplemented(req, res);
}

function handleAuthorsDelete(req, res) {
  handleMethodNotImplemented(req, res);
}

const server = http.createServer(async (req, res) => {
  try {
    const body = await getBodyFromStream(req);
    req.body = body;

    if (req.url === "/books") {
      authenticate(req, res, () => {
        if (req.method === "GET") {
          handleBooksGet(req, res);
        } else if (req.method === "POST") {
          handleBooksPost(req, res);
        } else if (req.method === "PUT") {
          handleBooksPut(req, res);
        } else if (req.method === "PATCH") {
          handleBooksPatch(req, res);
        } else if (req.method === "DELETE") {
          handleBooksDelete(req, res);
        }
      });
    } else if (req.url === "/authors") {
      authenticate(req, res, () => {
        if (req.method === "GET") {
          handleAuthorsGet(req, res);
        } else if (req.method === "POST") {
          handleAuthorsPost(req, res);
        } else if (req.method === "PUT") {
          handleAuthorsPut(req, res);
        } else if (req.method === "PATCH") {
          handleAuthorsPatch(req, res);
        } else if (req.method === "DELETE") {
          handleAuthorsDelete(req, res);
        }
      });
    } else {
      res.statusCode = 404;
      res.end("Not Found");
    }
  } catch (error) {
    res.statusCode = 500;
    res.end(error.message);
  }
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
