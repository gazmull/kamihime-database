define({ "api": [
  {
    "type": "get",
    "url": "/refresh",
    "title": "refresh",
    "name": "GetRefresh",
    "group": "API_Specific",
    "description": "<p>Forcefully refreshes server cache (Character list)</p>",
    "permission": [
      {
        "name": "Owner Only"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"ok\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/GET/refresh.ts",
    "groupTitle": "API_Specific"
  },
  {
    "type": "get",
    "url": "/version",
    "title": "version",
    "name": "GetVersion",
    "group": "API_Specific",
    "description": "<p>Provides the current application's version.</p>",
    "success": {
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"version\": \"2.0.0\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/GET/version.ts",
    "groupTitle": "API_Specific"
  },
  {
    "type": "delete",
    "url": "/delete",
    "title": "delete",
    "name": "DeleteDelete",
    "group": "Kamihime_Specific",
    "description": "<p>Deletes an item from the database.</p>",
    "permission": [
      {
        "name": "Owner Only"
      }
    ],
    "parameter": {
      "fields": {
        "Request Body": [
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "user",
            "description": "<p>The user's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>The user's authentication token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>The item's name.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"id\": \"k0001\",\n  \"name\": \"Satan\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/DELETE/delete.ts",
    "groupTitle": "Kamihime_Specific"
  },
  {
    "type": "get",
    "url": "/id/:id",
    "title": "id",
    "name": "GetId",
    "group": "Kamihime_Specific",
    "description": "<p>Retrieves an item's information.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"_rowId\": 6,\n  \"id\": \"k0001\",\n  \"name\": \"Satan\",\n  \"approved\": 1,\n  \"avatar\": \"portrait/Satan Portrait.png\",\n  \"main\": \"main/Satan.png\",\n  \"preview\": \"close/Satan Close.png\",\n  \"loli\": 0,\n  \"peeks\": \"6670\",\n  \"harem1Title\": \"Satan and the Little Ones\",\n  \"harem1Resource1\": null,\n  \"harem2Title\": \"A Healthy Appetite\",\n  \"harem2Resource1\": null,\n  \"harem2Resource2\": \"aebdeb68bd5da8f168ae45e6a305c1d59531c0de755dde59\",\n  \"harem3Title\": \"The Men's Revenge\",\n  \"harem3Resource1\": null,\n  \"harem3Resource2\": \"aebdeb68bd5da8f1d14add7fe21120889531c0de755dde59\",\n  \"element\": \"Dark\",\n  \"type\": \"Tricky\",\n  \"rarity\": \"SSR\",\n  \"tier\": null\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/GET/id.ts",
    "groupTitle": "Kamihime_Specific"
  },
  {
    "type": "get",
    "url": "/latest",
    "title": "latest",
    "name": "GetLatest",
    "group": "Kamihime_Specific",
    "description": "<p>Retrieves latest added characters.</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "category",
            "description": "<p>Get latest characters within the specified category only. Available: <code>soul</code> / <code>eidolon</code> / <code>ssr+</code> / <code>ssr</code> / <code>sr</code> / <code>r</code></p>"
          },
          {
            "group": "Query",
            "type": "number",
            "optional": true,
            "field": "len",
            "description": "<p>The number of latest characters to be retrieved. Default: 3 / Min-Max: 1—10</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Character[]",
            "optional": false,
            "field": "category",
            "description": "<p>Properties for each category (soul, eidolon, etc).</p>"
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "Character",
            "description": "<p>The character object.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "Character.id",
            "description": "<p>The character ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "Character.name",
            "description": "<p>The character name.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "Characer.created",
            "description": "<p>The character's data creation date.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"soul\": [\n    { \"id\": \"s0030\", \"name\": \"Shingen\" },\n    { \"id\": \"s0029\", \"name\": \"Masamune (Soul)\" },\n    { \"id\": \"s0028\", \"name\": \"Yukimura\" }\n  ],\n  \"eidolon\": [\n    { \"id\": \"e5017\", \"name\": \"Hanuman\" },\n    { \"id\": \"e6049\", \"name\": \"Medjed\" },\n    { \"id\": \"e6042\", \"name\": \"Iwanaga-Hime\" }\n  ],\n  \"ssr+\": [\n    { \"id\": \"k5082\", \"name\": \"Acala (Awakened)\" },\n    { \"id\": \"k5080\", \"name\": \"Brahma (Awakened)\" },\n    { \"id\": \"k5076\", \"name\": \"Odin (Awakened)\" }\n  ],\n  \"ssr\": [\n    { \"id\": \"k5087\", \"name\": \"Isis\" },\n    { \"id\": \"k5086\", \"name\": \"Tishtrya\" },\n    { \"id\": \"k5081\", \"name\": \"Samael\" }\n  ],\n  \"sr\": [\n    { \"id\": \"k6097\", \"name\": \"Hathor\" },\n    { \"id\": \"k6096\", \"name\": \"Mithra\" },\n    { \"id\": \"k6091\", \"name\": \"Cernunnos\" }\n  ],\n  \"r\": [\n    { \"id\": \"k7055\", \"name\": \"Mato\" },\n    { \"id\": \"k7054\", \"name\": \"(Holy Night Wind) Kamadeva\" },\n    { \"id\": \"k7053\", \"name\": \"Dark Kushinada\" }\n  ]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/GET/latest.ts",
    "groupTitle": "Kamihime_Specific"
  },
  {
    "type": "get",
    "url": "/list/:options",
    "title": "list",
    "name": "GetList",
    "group": "Kamihime_Specific",
    "description": "<p>Retrieves a list of items. <code>:options</code> available:</p> <h3>Primary Options</h3> <blockquote> <p>A must before any other options.</p> </blockquote> <ul> <li><code>soul</code> / <code>eidolon</code> / <code>kamihime</code> / <code>weapon</code></li> <li><code>approved</code> / <code>loli</code> / <code>no-loli</code></li> </ul> <h3>Secondary Options</h3> <ul> <li><strong>Soul Only</strong>: <code>legendary</code> / <code>elite</code> / <code>standard</code></li> <li><strong>Kamihime Only</strong>: <code>healer</code> / <code>offense</code> / <code>tricky</code> / <code>balance</code> / <code>defense</code></li> <li><strong>Weapon Only</strong>: <code>hammer</code> / <code>lance</code> / <code>glaive</code> / <code>arcane</code> / <code>staff</code> / <code>axe</code> / <code>gun</code> / <code>bow</code> / <code>sword</code></li> <li><strong>Eidolon / Kamihime / Weapon Only</strong>: <ul> <li><code>light</code> / <code>dark</code> / <code>wind</code> / <code>thunder</code> / <code>water</code> / <code>fire</code> / <code>phantom</code></li> <li><code>ssr+</code> / <code>ssr</code> / <code>sr</code> / <code>r</code> / <code>n</code></li> </ul> </li> </ul> <h3>Sort Options</h3> <ul> <li><strong>Sort By</strong>: <code>name</code> / <code>rarity</code> / <code>tier</code> / <code>element</code> / <code>type</code> / <code>atk</code> / <code>hp</code></li> <li><strong>Sort Type</strong>: <code>asc</code> / <code>desc</code></li> </ul>",
    "examples": [
      {
        "title": "Example: this will return items that are approved, eidolon, not a loli, and of water element, sorted by rarity (ascending).",
        "content": "https://kamihimedb.winspace/api/list/approved/eidolon/no-loli/water?sort=rarity-asc",
        "type": "html"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": true,
            "field": "options",
            "description": "<p>An array of options with <code>/</code> delimiter. See description.</p>"
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "sort",
            "description": "<p>Sorts the list. Syntax: <code>sortBy-sortType</code> (default: <code>name-asc</code>)</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "/id[]",
            "optional": false,
            "field": "items",
            "description": "<p>An array of items from <code>GET /id</code> object.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n  \"id\": \"e6021\",\n  \"name\": \"Jack Frost\",\n  \"avatar\": \"portrait/Jack Frost Portrait.png\",\n  \"main\": \"main/Jack Frost.png\",\n  \"preview\": \"close/Jack Frost Close.png\",\n  \"loli\": 1,\n  \"peeks\": \"1715\",\n  \"harem1Title\": \"Clinking Head and Hands\",\n  \"harem1Resource1\": \"1e3a94a3d3d8348f86482b055d2dd8db4a70cac361bc9f51\",\n  \"harem2Title\": \"Chilled Hands and Feet, Burning Desire\",\n  \"harem2Resource1\": \"1e3a94a3d3d8348f35658ab6e49a6d134a70cac361bc9f51\",\n  \"harem2Resource2\": \"1e3a94a3d3d8348f79b2217040cc025206f12ba16f14d7ad\",\n  \"harem3Title\": null,\n  \"harem3Resource1\": null,\n  \"harem3Resource2\": null,\n  \"element\": \"Water\",\n  \"type\": null,\n  \"rarity\": \"SSR\",\n  \"tier\": null\n  }, ...items\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/GET/list.ts",
    "groupTitle": "Kamihime_Specific"
  },
  {
    "type": "get",
    "url": "/random/:length/:includeAll",
    "title": "random",
    "name": "GetRandom",
    "group": "Kamihime_Specific",
    "description": "<p>Randomly provides character objects based on length provided. Maximum of 10.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "length",
            "description": "<p>Number of items to be provided.</p>"
          },
          {
            "group": "Parameter",
            "type": "boolean",
            "optional": false,
            "field": "includeAll",
            "description": "<p>Whether to include weapons and generic eidolons in the cherry picking pool as well</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n    \"_rowId\": 6,\n    \"id\": \"k0001\",\n    \"name\": \"Satan\",\n    \"approved\": 1,\n    \"avatar\": \"portrait/Satan Portrait.png\",\n    \"main\": \"main/Satan.png\",\n    \"preview\": \"close/Satan Close.png\",\n    \"loli\": 0,\n    \"peeks\": \"6670\",\n    \"harem1Title\": \"Satan and the Little Ones\",\n    \"harem1Resource1\": null,\n    \"harem2Title\": \"A Healthy Appetite\",\n    \"harem2Resource1\": null,\n    \"harem2Resource2\": \"aebdeb68bd5da8f168ae45e6a305c1d59531c0de755dde59\",\n    \"harem3Title\": \"The Men's Revenge\",\n    \"harem3Resource1\": null,\n    \"harem3Resource2\": \"aebdeb68bd5da8f1d14add7fe21120889531c0de755dde59\",\n    \"element\": \"Dark\",\n    \"type\": \"Tricky\",\n    \"rarity\": \"SSR\",\n    \"tier\": null\n  }, ...items\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/GET/random.ts",
    "groupTitle": "Kamihime_Specific"
  },
  {
    "type": "get",
    "url": "/search",
    "title": "search",
    "name": "GetSearch",
    "group": "Kamihime_Specific",
    "description": "<p>Searches items with the provided name.</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>The item's name.</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "class",
            "description": "<p>Search <code>soul</code> / <code>eidolon</code> / <code>kamihime</code> / <code>weapon</code> only.</p>"
          },
          {
            "group": "Query",
            "type": "number",
            "optional": true,
            "field": "accurate",
            "description": "<p><code>1 / 0 only</code>: Whether to immediately shift the search on the first result or not if the provided name is accurate enough to resolve at least one item.</p>"
          },
          {
            "group": "Query",
            "type": "number",
            "optional": true,
            "field": "loli",
            "description": "<p><code>1 / 0 only</code>: Search <code>lolis</code> / <code>not lolis</code> only.</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "element",
            "description": "<p>Search <code>light</code> / <code>dark</code> / <code>wind</code> / <code>thunder</code> / <code>water</code> / <code>fire</code> / <code>phantom</code> only.</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "rarity",
            "description": "<p>Search <code>ssr+</code> / <code>ssr</code> / <code>sr</code> / <code>r</code> / <code>n</code> only.</p>"
          },
          {
            "group": "Query",
            "type": "string",
            "optional": true,
            "field": "type",
            "description": "<p>Search with only: <br>- <strong>Kamihime Only</strong>: <code>healer</code> / <code>offense</code> / <code>tricky</code> / <code>balance</code> / <code>defense</code> <br>- <strong>Weapon Only</strong>: <code>hammer</code> / <code>lance</code> / <code>glaive</code> / <code>arcane</code> / <code>staff</code> / <code>axe</code> / <code>gun</code> / <code>bow</code> / <code>sword</code></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "/id[]",
            "optional": false,
            "field": "items",
            "description": "<p>An array of items (up to 10 items) from <code>GET /id</code> object.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n  \"_rowId\": 204,\n  \"id\": \"e6021\",\n  \"name\": \"Jack Frost\",\n  \"approved\": 1,\n  \"avatar\": \"portrait/Jack Frost Portrait.png\",\n  \"main\": \"main/Jack Frost.png\",\n  \"preview\": \"close/Jack Frost Close.png\",\n  \"loli\": 1,\n  \"peeks\": \"1715\",\n  \"harem1Title\": \"Clinking Head and Hands\",\n  \"harem1Resource1\": \"1e3a94a3d3d8348f86482b055d2dd8db4a70cac361bc9f51\",\n  \"harem2Title\": \"Chilled Hands and Feet, Burning Desire\",\n  \"harem2Resource1\": \"1e3a94a3d3d8348f35658ab6e49a6d134a70cac361bc9f51\",\n  \"harem2Resource2\": \"1e3a94a3d3d8348f79b2217040cc025206f12ba16f14d7ad\",\n  \"harem3Title\": null,\n  \"harem3Resource1\": null,\n  \"harem3Resource2\": null,\n  \"element\": \"Water\",\n  \"type\": null,\n  \"rarity\": \"SSR\",\n  \"tier\": null\n  }, ...items\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/GET/search.ts",
    "groupTitle": "Kamihime_Specific"
  },
  {
    "type": "post",
    "url": "/add",
    "title": "add",
    "name": "PostAdd",
    "group": "Kamihime_Specific",
    "description": "<p>Adds an item to the database.</p>",
    "permission": [
      {
        "name": "Owner Only"
      }
    ],
    "parameter": {
      "fields": {
        "Request Body": [
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>The item's name.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "user",
            "description": "<p>The user's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>The user's authentication token.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": true,
            "field": "harem1Title",
            "defaultValue": "null",
            "description": "<p>The Episode 1 Title.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": true,
            "field": "harem1Resource1",
            "defaultValue": "null",
            "description": "<p>The Episode 1 Story Resource ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": true,
            "field": "harem2Title",
            "defaultValue": "null",
            "description": "<p>The Episode 2 Title.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": true,
            "field": "harem2Resource1",
            "defaultValue": "null",
            "description": "<p>The Episode 2 Story Resource ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": true,
            "field": "harem2Resource2",
            "defaultValue": "null",
            "description": "<p>The Episode 2 Scenario Resource ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": true,
            "field": "harem3Title",
            "defaultValue": "null",
            "description": "<p>The Episode 3 Title.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": true,
            "field": "harem3Resource1",
            "defaultValue": "null",
            "description": "<p>The Episode 3 Story Resource ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": true,
            "field": "harem3Resource2",
            "defaultValue": "null",
            "description": "<p>The Episode 3 Scenario Resource ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "number",
            "optional": true,
            "field": "loli",
            "defaultValue": "0",
            "description": "<p><code>1 / 0 only</code>: Whether the character is a loli or not.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": true,
            "field": "rarity",
            "defaultValue": "null",
            "description": "<p>The item's rarity if it ever has one.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>The item's name.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"id\": \"k0001\",\n  \"name\": \"Satan\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/POST/add.ts",
    "groupTitle": "Kamihime_Specific"
  },
  {
    "type": "post",
    "url": "/session",
    "title": "session",
    "name": "PostSession",
    "group": "Kamihime_Specific",
    "description": "<p>Creates a session for updating an item from the database.</p>",
    "permission": [
      {
        "name": "Owner Only"
      }
    ],
    "parameter": {
      "fields": {
        "Request Body": [
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "user",
            "description": "<p>The user's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>The user's authentication token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The sessions's ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "password",
            "description": "<p>The session's password.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "created",
            "description": "<p>The session's creation date.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "characterId",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "userId",
            "description": "<p>The user's ID.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"id\": \"sdww2fh\",\n  \"password\": \"h2no387sw\",\n  \"created\": \"2018-12-29 04:21:04\",\n  \"characterId\": \"k0001\",\n  \"userId\": \"319102712383799296\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/POST/session.ts",
    "groupTitle": "Kamihime_Specific"
  },
  {
    "type": "put",
    "url": "/approve",
    "title": "approve",
    "name": "PutApprove",
    "group": "Kamihime_Specific",
    "description": "<p>Approves/Disapproves a character from the database.</p>",
    "permission": [
      {
        "name": "Owner Only"
      }
    ],
    "parameter": {
      "fields": {
        "Request Body": [
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "user",
            "description": "<p>The user's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>The user's authentication token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>The item's name.</p>"
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "approved",
            "description": "<p>The current status of the character for approval.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"id\": \"k0001\",\n  \"name\": \"Satan\",\n  \"approved\": 1\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/PUT/approve.ts",
    "groupTitle": "Kamihime_Specific"
  },
  {
    "type": "put",
    "url": "/flag",
    "title": "flag",
    "name": "PutFlag",
    "group": "Kamihime_Specific",
    "description": "<p>Flags/Unflags a character as loli from the database.</p>",
    "permission": [
      {
        "name": "Owner Only"
      }
    ],
    "parameter": {
      "fields": {
        "Request Body": [
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "user",
            "description": "<p>The user's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>The user's authentication token.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>The item's name.</p>"
          },
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "flagged",
            "description": "<p>The current status of the character for flag.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"id\": \"k0001\",\n  \"name\": \"Satan\",\n  \"loli\": 0\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/PUT/flag.ts",
    "groupTitle": "Kamihime_Specific"
  },
  {
    "type": "put",
    "url": "/update",
    "title": "update",
    "name": "PutUpdate",
    "group": "Kamihime_Specific",
    "description": "<p>Updates an item from the database.</p> <p><strong>Warning</strong>: You have to do <code>POST /session</code> first to obtain an authorization to update an item.</p>",
    "permission": [
      {
        "name": "Owner Only"
      }
    ],
    "parameter": {
      "fields": {
        "Request Body": [
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>The item's name.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "user",
            "description": "<p>The user's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "token",
            "description": "<p>The user's authentication token.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "harem1Title",
            "description": "<p>The Episode 1 Title.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "harem1Resource1",
            "description": "<p>The Episode 1 Story Resource ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "harem2Title",
            "description": "<p>The Episode 2 Title.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "harem2Resource1",
            "description": "<p>The Episode 2 Story Resource ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "harem2Resource2",
            "description": "<p>The Episode 2 Scenario Resource ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "harem3Title",
            "description": "<p>The Episode 3 Title.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "harem3Resource1",
            "description": "<p>The Episode 3 Story Resource ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "harem3Resource2",
            "description": "<p>The Episode 3 Scenario Resource ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "rarity",
            "description": "<p>The item's rarity if it ever has one.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "id",
            "description": "<p>The item's ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>The item's name.</p>"
          },
          {
            "group": "Success 200",
            "type": "PathLike",
            "optional": false,
            "field": "avatar",
            "description": "<p>The item's portrait image path.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"id\": \"k0001\",\n  \"name\": \"Satan\",\n  \"avatar\": \"portrait/Satan Portrait.png\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/PUT/update.ts",
    "groupTitle": "Kamihime_Specific"
  },
  {
    "type": "get",
    "url": "/@me",
    "title": "@me",
    "name": "GetAtMe",
    "group": "Site_Specific",
    "description": "<p>Retrieves site user's information.</p> <p><strong>Warning</strong>: Requires cookies to be passed at headers.</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "boolean",
            "optional": true,
            "field": "save",
            "defaultValue": "true",
            "description": "<p>Saves user info from cookies to database.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "settings",
            "description": "<p>The user's settings.</p>"
          },
          {
            "group": "Success 200",
            "type": "string",
            "optional": false,
            "field": "username",
            "description": "<p>The user's name.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"settings\": {\n    \"audio\": {\n      \"bgm\": 0.1,\n      \"glo\": 1.0,\n      \"snd\": 0.5,\n    },\n    \"menu\": \"true\",\n    \"visual\": {\n      \"bg\": \"rgb(255, 183, 183)\",\n      \"cl\": \"rgb(190, 50, 74)\",\n    }\n  },\n  \"username\": \"Euni\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/GET/@me.ts",
    "groupTitle": "Site_Specific"
  },
  {
    "type": "post",
    "url": "/report",
    "title": "report",
    "name": "PostReport",
    "group": "Site_Specific",
    "description": "<p>Creates a user report entry regarding a character to the database.</p> <p><strong>Warning</strong>: Requires cookies to be passed at headers.</p>",
    "parameter": {
      "fields": {
        "Request Body": [
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "characterId",
            "description": "<p>The character's ID.</p>"
          },
          {
            "group": "Request Body",
            "type": "object",
            "optional": false,
            "field": "message",
            "description": "<p>The user's message.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "message.subject",
            "description": "<p>The message's subject. Valid options can be seen at <code>Message Subject Options</code>'s Fields.</p>"
          },
          {
            "group": "Request Body",
            "type": "string",
            "optional": false,
            "field": "message.content",
            "description": "<p>The message's content.</p>"
          }
        ],
        "Message Subject Options": [
          {
            "group": "Message Subject Options",
            "optional": false,
            "field": "internal",
            "description": "<p><code>Cannot view story/scenario</code></p>"
          },
          {
            "group": "Message Subject Options",
            "optional": false,
            "field": "others",
            "description": "<p><code>Others</code></p>"
          },
          {
            "group": "Message Subject Options",
            "optional": false,
            "field": "resource",
            "description": "<p><code>Wrong episode story/scenario</code></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "boolean",
            "optional": false,
            "field": "ok",
            "description": "<p>JSON body of &lt;Response.status&gt;.ok.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"ok\": true\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/api/POST/report.ts",
    "groupTitle": "Site_Specific"
  }
] });
