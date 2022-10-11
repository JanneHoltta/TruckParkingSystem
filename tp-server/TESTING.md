# Manual Testing

This file contains the manual testing history for this repository.

## database-plugin

Tested database-plugin implementation (implemented in MR !4).

- [x] Plugin initializes a database transaction for each incoming request
- [x] Transaction gets committed when the response status code is 200
- [x] Transaction gets rolled back when the response status code is 500
- [x] Tested with the official MariaDB testing database of the project

## login-handling

Tested fastify login-handling implementation (implemented in MR !15)

- [x] POSTing correct login details returns 200 and userID
- [x] POSTing incorrect login details returns 401 and error
- [x] Fastify input validation returns 400 and error on missing or incorrectly formatted fields
- [x] Missing or incorrect API key header returns 401 and error
