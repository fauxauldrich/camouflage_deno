# Request model

Request object made available by camouflage is simply an instance of express request object for a given incoming request. Following are the properties/objects available on the request object which can be used in request matching or to extract information out of the request.

- request.baseUrl
- request.method
- request.originalUrl
- request.path
- request.protocol
- request.query
- request.headers
- request_body

!!!note

    We'd like to highlight _**request_body (request underscore body)**_ specially, as we understand it might be an area of confusion. This will be fixed in future releases to standard request.body.
