require('array.prototype.find')
var generators = require('yeoman-generator')
var path       = require('path')
var camelize   = require('camelize')
var prefixnote = require('prefixnote')
var chalk      = require('chalk')
var striate    = require('gulp-striate')
var R          = require('ramda')
var fileExists = require('file-exists')
var indent     = require('indent-string')
var pkg        = require('../package.json')

// files that should never be copied
var ignore = ['.DS_Store']

// parse an array from a string
function parseArray(str) {
  return R.filter(R.identity, str.split(',').map(R.invoker(0, 'trim')))
}

// stringify an object and indent everything after the opening line
function stringifyIndented(value, chr, n) {
  return indent(JSON.stringify(value, null, n), chr, n).slice(chr.length * n)
}

// do a simple stringify on an object but use single quotes and spaces
function stringifySimple(value) {
  return JSON.stringify(value)
    .replace(/"/g, '\'')
    .replace(/,/g, ', ')
}

module.exports = generators.Base.extend({

  constructor: function () {

    generators.Base.apply(this, arguments)

    // parse yoga.json and report error messages for missing/invalid
    try {
      this.yogaFile = require(fileExists('./yoga.json') ? './yoga.json' : './yoga.js')
    }
    catch(e) {
      if(e.code === 'MODULE_NOT_FOUND') {
        console.log(chalk.red('No yoga file found. Proceeding with simple copy.'))
      }
      else {
        console.log(chalk.red('Invalid yoga file'))
        console.log(chalk.red(e))
        throw e;
      }
    }

  },

  prompting: function () {

    var done = this.async()

    if(this.yogaFile && !(this.yogaFile.prompts && this.yogaFile.prompts.length)) {
      console.log(chalk.red('No prompts in yoga.json. Proceeding with simple copy.'))
      return
    }

    // set the default project name to the destination folder name
    var projectPrompt = this.yogaFile.prompts.find(R.propEq('name', 'project'))
    if(projectPrompt) {
      projectPrompt.default = path.basename(this.env.cwd)
    }

    this.prompt(this.yogaFile.prompts, function (props) {

      // extract all possible choices from the yogafile
      var allChoices = R.find(R.propEq('name', 'options'), this.yogaFile.prompts)
        .choices.map(R.prop('value'))

      // map each choice to true/false, whether it was selected or not
      var choicesObject = R.fromPairs(allChoices.map(function (choice) {
        return [choice, R.contains(choice, props.options)]
      }))

      // merge selected properties with defaults and converted options
      props = R.mergeAll([{
        // set some defaults for prompts that are skipped
        isStatic: false,
        cli: false,
        camelize: camelize,
      }, props, choicesObject])

      // format keywords
      props.keywordsFormatted = stringifyIndented(parseArray(props.keywords), ' ', 2)

      // build and format dependencies
      var dependencies = R.sortBy(R.identity, R.flatten([
        props.gulp ? [
          'gulp',
          'browserify',
          'gulp-cached',
          'gulp-livereload',
          'gulp-notify',
          'gulp-sourcemaps',
          'vinyl-source-stream',
          'vinyl-buffer',
        ] : [],
        props.babel ? [
          'babel-register',
          'babel-preset-es2015',
        ] : [],
        props.babel && props.react ? [
          'react',
          'react-dom',
          'babel-preset-react',
        ] : [],
        props.gulp && props.babel ? [
          'babelify',
        ] : [],
        props.web ? [
          'event-stream',
          'gulp-autoprefixer',
          'gulp-concat',
          'gulp-minify-css',
          'gulp-plumber',
          'gulp-progeny',
          'gulp-rename',
          'gulp-sass',
          'gulp-stylus',
          'gulp-util',
          'nib',
        ] : [],
        props.isStatic ? [
          'gulp-jade',
        ] : [],
        props.cli ? [
          'commander',
          'get-stdin-promise',
        ] : []
      ]))
      var dependenciesObject = R.zipObj(dependencies, R.repeat('*', dependencies.length))
      props.dependenciesFormatted = stringifyIndented(dependenciesObject, ' ', 2)

      var tasks = R.flatten([
        'script',
        props.web ? 'style' : [],
        props.isStatic ? 'view' : []
      ])
      props.tasksFormatted = stringifySimple(tasks)

      this.viewData = props;

      done()
    }.bind(this))
  },

  // Copies all files from the template directory to the destination path
  // parsing filenames using prefixnote and running them through striate
  writing: function () {

    var done = this.async()

    this.registerTransformStream(striate(this.viewData))

    prefixnote.parseFiles(this.templatePath(), this.viewData)

      // copy each file that is traversed
      .on('data', function (file) {
        var filename = path.basename(file.original)

        // always ignore files like .DS_Store
        if(ignore.indexOf(filename) === -1) {
          var from = file.original
          var to = this.destinationPath(path.relative(this.templatePath(), file.parsed))

          // copy the file with templating
          this.fs.copyTpl(from, to, this.viewData)
        }
      }.bind(this))

      .on('end', done)
      .on('error', done)
  },

  end: function () {
    this.installDependencies()
  }

})
