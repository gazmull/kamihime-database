# Guide

## Requests
> If you are requesting with `XHR`, then you may skip this section.

Your request headers must at least contain:
|     Name     | Value                                                   |
| :----------: | ------------------------------------------------------- |
|    Accept    | `application/json`                                      |
| Content-Type | `application/json`, `application/x-www-form-urlencoded` |

All requests must be sent to [__https__://kamihimedb.winspace/api](https://kamihimedb.winspace/api)

## Responses
All responses contain HTTP status code for partial check.

### Rate Limit Headers
`X-RateLimit-*` headers are composed of:
|      Header Name      | Description                                           |
| :-------------------: | ----------------------------------------------------- |
|   X-RateLimit-Limit   | Maximum of request before reset                       |
| X-RateLimit-Remaining | Remaining requests before reset                       |
|   X-RateLimit-Reset   | Time when the rate limit reset occurs in milliseconds |

### Success
Response body immediately returns the requested data object:

```json
{
  "id": "k0001",
  "name": "Satan"
}
```

### Error
Response body returns an error object when an error has occurred:

```json
{
  "error": {
    "message": "Blah BLAAAAAAAAAAAAAARGHh",
    "code": 500
  }
}
```
