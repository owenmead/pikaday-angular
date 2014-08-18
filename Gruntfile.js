'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    project: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      all: {
        files: [
          '<%= project.app %>/{,*/}*.js',
          '<%= project.app %>/{,*/}*.html',
          '<%= project.app %>/{,*/}*.css'
        ],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      main: {
        src: [
          'Gruntfile.js',
          '<%= project.app %>/scripts.js'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/components',
                connect.static('./components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      }
    },

  });


  grunt.registerTask('default', 'Compile then start a connect web server', function (target) {
    grunt.task.run([
      'connect:livereload',
      'watch'
    ]);
  });

};
