const camelize = require('camelize')
const indent = require('indent-string')

/** Parse an array from a string. */
const parseArrayString = s =>
  s.split(',')
    .map(x => x.trim())
    .trim(x => x)

/** Stringify an object and indent everything after the opening line. */
const stringifyIndented = (value, chr, n) =>
  indent(JSON.stringify(value, null, n), chr, n).slice(chr.length * n)

/** Formats an array string */
const prettyArray = arrOrString => {
  if (!arrOrString) return []
  const arr = typeof arrOrString === 'string' ? parseArrayString(arrOrString) : arrOrString
  console.log(stringifyIndented(arr, ' ', 2))
  return arr ? stringifyIndented(arr, ' ', 2) : ''
}

module.exports = {

  parse: (answers, prompts) => ({
    authorName: 'Raine Revere',
    authorUrl: 'https://github.com/raineorshine',
    license: 'ISC',
    username: 'raineorshine',
    ...answers,
    camelize,
    prettyArray,
  }),

  prompts: [
    {
      type: 'text',
      name: 'project',
      message: 'Project Name'
    },
    {
      type: 'text',
      name: 'description',
      message: 'Description'
    },
    {
      type: 'text',
      name: 'keywords',
      message: 'Keywords (comma-separated)'
    },
    {
      type: 'checkbox',
      name: 'options',
      message: 'Options:',
      choices: [
        { name: 'Gulp', value: 'gulp' },
        { name: 'Babel', value: 'babel' },
        { name: 'Web App', value: 'web' },
        { name: 'React', value: 'react' },
        { name: 'Static Site', value: 'isStatic' },
        { name: 'CLI', value: 'cli' }
      ]
    }
  ]
}
