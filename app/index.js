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

// if the package name is generator-yoga then we are in creation mode
// which will recursively copy this generator itself and give it a new
// project name so that subsequent runs will generate from app/templates
var createMode = pkg.name === 'generator-yoga'

// map inquirer options to names
var optionLabels = {
  gulp: 'Gulp',
  babel: 'Babel',
  web: 'Web App',
  isStatic: 'Static Site',
  cli: 'CLI'
}

// generate a complete options object from an array of choices
/*
  @param choices   ['gulp', 'babel']
  @returns {
    gulp: true,
    babel: true,
    web: false,
    isStatic: false,
    cli: false
  }
*/
function generateOptions(choices) {
  return R.fromPairs(Object.keys(optionLabels).map(function (key) {
    return [key, R.contains(optionLabels[key], choices)]
  }))
}

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
      this.yogaFile = require(createMode ? '../create/yoga.json' :
        fileExists('./yoga.json') ? './yoga.json' : './yoga.js')
    }
    catch(e) {
      if(e.code === 'MODULE_NOT_FOUND') {
        console.log(chalk.red('No yoga file found. Proceeding with simple copy.'))
      }
      else {
        console.log(chalk.red('Invalid yoga file'))
        console.log(chalk.red(e))
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

      // disallow a project name of generator-yoga
      if(createMode && props.name === 'generator-yoga') {
        var error = 'You may not name your generator "generator-yoga".'
        this.log.error(error)
        done(error)
        return
      }

      // format keywords
      var keywordsFormatted = stringifyIndented(parseArray(props.keywords), ' ', 2)

      // build and format dependencies
      var dependencies = R.sortBy(R.identity, R.flatten([
        props.gulp ? [
          'gulp',
          'browserify',
          'gulp-livereload',
          'gulp-notify',
          'gulp-sourcemaps',
          'vinyl-source-stream',
          'vinyl-buffer',
        ] : [],
        props.babel ? [
          'gulp-babel',
          'babel-preset-es2015',
        ] : [],
        props.web ? [
          'event-stream',
          'gulp-autoprefixer',
          'gulp-concat',
          'gulp-minify-css',
          'gulp-plumber',
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
      var dependenciesFormatted = stringifyIndented(dependenciesObject, ' ', 2)

      var tasks = R.flatten([
        'scripts',
        props.web ? 'styles' : [],
        props.isStatic ? 'views' : []
      ])
      var tasksFormatted = stringifySimple(tasks)

      // populate viewData from the prompts and formatted values
      this.viewData = R.mergeAll([props, generateOptions(props.options), {
        // set some defaults for prompts that are skipped
        isStatic: false,
        cli: false,
        camelize: camelize,
        keywordsFormatted: keywordsFormatted,
        dependenciesFormatted: dependenciesFormatted,
        tasksFormatted: tasksFormatted
      }])

      done()
    }.bind(this))
  },

  // Copies all files from the template directory to the destination path
  // parsing filenames using prefixnote and running them through striate
  writing: function () {

    var done = this.async()

    if(createMode) {

      // copy yoga-generator itself
      this.fs.copy(path.join(__dirname, '../'), this.destinationPath(), {
        globOptions: {
          dot: true,
          ignore: [
            '**/.git',
            '**/.git/**/*',
            '**/node_modules',
            '**/node_modules/**/*',
            '**/test/**/*',
            '**/create/**/*'
          ]
        }
      })

      // copy the package.json and README
      this.fs.copyTpl(path.join(__dirname, '../create/{}package.json'), this.destinationPath('package.json'), this.viewData)

      this.fs.copyTpl(path.join(__dirname, '../create/README.md'), this.destinationPath('README.md'), this.viewData)

      done()
    }
    else {
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
    }
  },

  end: function () {
    this.installDependencies()
  }

})
