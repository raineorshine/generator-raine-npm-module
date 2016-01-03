module.exports = {
  "prompts": [
    {
      "type": "text",
      "name": "project",
      "message": "Project Name"
    },
    {
      "type": "text",
      "name": "description",
      "message": "Description"
    },
    {
      "type": "text",
      "name": "keywords",
      "message": "Keywords (comma-separated)"
    },
    {
      "type": "text",
      "name": "username",
      "message": "Github Username",
      "store": true
    },
    {
      "type": "text",
      "name": "authorName",
      "message": "Author Name",
      "store": true
    },
    {
      "type": "text",
      "name": "authorEmail",
      "message": "Author Email",
      "store": true
    },
    {
      "type": "text",
      "name": "authorUrl",
      "message": "Author URL",
      "store": true
    },
    {
      "type": "text",
      "name": "license",
      "message": "License",
      "store": true,
      "default": "ISC"
    },
    {
      "type": "confirm",
      "name": "gulp",
      "message": "Are you using gulp?",
      "default": false
    },
    {
      "type": "confirm",
      "name": "web",
      "message": "Is this a web application?",
      "default": false
    },
    {
      "type": "confirm",
      "name": "isStatic",
      "message": "Is this a static site?",
      "default": false,
      "when": function(props) {
        return props.web
      }
    },
    {
      "type": "confirm",
      "name": "cli",
      "message": "Is this a command-line application?",
      "default": false,
      "when": function(props) {
        return !props.web
      }
    }
  ]
}
