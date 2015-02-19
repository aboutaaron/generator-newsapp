'use strict';

var join = require('path').join;
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

module.exports = yeoman.generators.Base.extend({
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.pkg = require('../package.json');
  },

  askFor: function () {
    var done = this.async();

    // welcome message
    if (!this.options['skip-welcome-message']) {
      this.log(require('yosay')());
      this.log(chalk.magenta(
        'Out of the box I include HTML5 Boilerplate, jQuery, and a ' +
        'Gruntfile.js to build your app.'
      ));
    }

    var prompts = [{
      type: 'list',
      name: 'template',
      message: 'Choose application template:',
      choices: [{
        name: 'Django',
        value: 'includeDjango'
      }, {
        name: 'Webapp',
        value: 'includeWebapp'
      }]
    },{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Bootstrap',
        value: 'includeBootstrap',
        checked: true
      },{
        name: 'Sass',
        value: 'includeSass',
        checked: false
      },{
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: false
      }]
    }, {
      when: function (answers) {
        return answers && answers.features &&
          answers.features.indexOf('includeSass') !== -1;
      },
      type: 'confirm',
      name: 'libsass',
      value: 'includeLibSass',
      message: 'Would you like to use libsass? Read up more at \n' +
        chalk.green('https://github.com/andrew/node-sass#node-sass'),
      default: false
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      }

      this.includeSass = hasFeature('includeSass');
      this.includeBootstrap = hasFeature('includeBootstrap');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeDjango =  hasFeature('includeDjango');
      this.includeWebapp = hasFeature('includeWebapp');

      this.includeLibSass = answers.libsass;
      this.includeRubySass = !answers.libsass;

      done();
    }.bind(this));
  },

  gruntfile: function () {
    this.template('Gruntfile.js');
  },

  packageJSON: function () {
    this.template('_package.json', 'package.json');
  },

  git: function () {
    this.template('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');
  },

  bower: function () {
    var bower = {
      name: this._.slugify(this.appname),
      private: true,
      dependencies: {}
    };

    if (this.includeBootstrap) {
      var bs = 'bootstrap' + (this.includeSass ? '-sass-official' : '');
      bower.dependencies[bs] = "~3.2.0";
    } else {
      bower.dependencies.jquery = "~1.11.1";
    }

    if (this.includeModernizr) {
      bower.dependencies.modernizr = "~2.8.2";
    }

    this.copy('bowerrc', '.bowerrc');
    this.write('bower.json', JSON.stringify(bower, null, 2));
  },

  jshint: function () {
    this.copy('jshintrc', '.jshintrc');
  },

  editorConfig: function () {
    this.copy('editorconfig', '.editorconfig');
  },

  mainStylesheet: function () {
    var css = 'main.' + (this.includeSass ? 's' : '') + 'css';
    var stylePath = this.includeDjango ? 'assets/styles/' : 'app/styles/';
    this.template(css, stylePath + css);
  },

  // writeIndex: function () {
  //   var htmlFile = this.includeDjango ? 'base.html' : 'index.html';

  //   this.indexFile = this.engine(
  //     this.readFileAsString(join(this.sourceRoot(), htmlFile)),
  //     this
  //   );

  //   // wire Bootstrap plugins
  //   if (this.includeBootstrap && !this.includeSass) {
  //     var bs = 'bower_components/bootstrap/js/';

  //     this.indexFile = this.appendFiles({
  //       html: this.indexFile,
  //       fileType: 'js',
  //       optimizedPath: 'scripts/plugins.js',
  //       sourceFileList: [
  //         bs + 'affix.js',
  //         bs + 'alert.js',
  //         bs + 'dropdown.js',
  //         bs + 'tooltip.js',
  //         bs + 'modal.js',
  //         bs + 'transition.js',
  //         bs + 'button.js',
  //         bs + 'popover.js',
  //         bs + 'carousel.js',
  //         bs + 'scrollspy.js',
  //         bs + 'collapse.js',
  //         bs + 'tab.js'
  //       ],
  //       searchPath: '.'
  //     });
  //   }

  //   this.indexFile = this.appendFiles({
  //     html: this.indexFile,
  //     fileType: 'js',
  //     optimizedPath: 'scripts/main.js',
  //     sourceFileList: ['scripts/main.js'],
  //     searchPath: ['app','.tmp']
  //   });
  // },

  django: function () {
    if (this.includeDjango) {
      // Assets
      this.mkdir('assets');
      this.mkdir('assets/scripts');
      this.mkdir('assets/styles');
      this.mkdir('assets/images');
      this.copy('main.js', 'assets/scripts/main.js');

      // Templates
      this.mkdir('templates');
      this.template('base.html', 'templates/base.html');
    }
  },

  app: function () {
    if (this.includeWebapp) {
      this.mkdir('app/scripts');
      this.mkdir('app/styles');
      this.mkdir('app/images');
      this.template('index.html', 'app/index.html');
      this.copy('main.js', 'app/scripts/main.js');
      this.copy('credentials.template', 'app/credentials.template');
    }
  },

  install: function () {
    this.installDependencies();
  }
});
