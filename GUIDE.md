# Responses
All responses are containing HTTP status code for partial check.

## Rate Limit Headers
`X-RateLimit-*` headers are composed of:
|      Header Name      | Description                                           |
|:---------------------:|-------------------------------------------------------|
| X-RateLimit-Limit     | Maximum of request before reset                       |
| X-RateLimit-Remaining | Remaining requests before reset                       |
| X-RateLimit-Reset     | Time when the rate limit reset occurs in milliseconds |

## Success
Response body immediately returns the requested data object, not wrapped under "data" object:

```json
// API returns the requested data like this
{
  "id": "k0001",
  "name": "Satan"
}

// Not like this!
{
  "data": {
    "id": "k0001",
    "name": "Satan"
  }
}
```

## Error
Response body returns an error object:

```json
{
  "error": {
    "message": "Blah BLAAAAAAAAAAAAAARGHh",
    "code": 500
  }
}
```
