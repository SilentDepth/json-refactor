const json = `{
  "plain-number": 233,
  "plain-string": "Hello json",
  "plain-boolean": true,
  "number-like-string": "666",
  "menu": {
    "id": "file",
    "value": "File",
    "popup": {
      "menuitem": [
        { "value": "New", "onclick": "CreateNewDoc()" },
        { "value": "Open", "onclick": "OpenDoc()" },
        { "value": "Close", "onclick": "CloseDoc()" }
      ]
    }
  }
}`;

export default json;