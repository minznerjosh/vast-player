'use strict';

var TESTS = ['test/spec/**/*.ut.js'];
var LIBS = [
    'lib/**/*.js',
    'index.js'
];
var CODE = LIBS.concat(TESTS);

module.exports = function gruntfile(grunt) {
    var pkg = require('./package.json');
    var npmTasks = Object.keys(pkg.devDependencies).filter(function(name) {
        return (name !== 'grunt-cli') && (/^grunt-/).test(name);
    });

    npmTasks.forEach(function(name) {
        grunt.task.loadNpmTasks(name);
    });
    grunt.task.loadTasks('./tasks');

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true
            },
            code: {
                src: CODE
            }
        },
        karma: {
            options: {
                configFile: 'test/karma.conf.js'
            },
            tdd: {
                options: {
                    autoWatch: true
                }
            },
            test: {
                options: {
                    singleRun: true
                }
            }
        },

        clean: {
            build: ['dist'],
            server: ['examples/.build']
        },
        browserify: {
            options: {
                browserifyOptions: {
                    standalone: 'VASTPlayer'
                }
            },

            build: {
                files: [
                    {
                        src: 'index.js',
                        dest: 'dist/vast-player.js'
                    }
                ]
            },
            server: {
                options: {
                    watch: true
                },
                files: [
                    {
                        src: 'index.js',
                        dest: 'examples/.build/vast-player.js'
                    }
                ]
            }
        },
        uglify: {
            build: {
                options: {
                    screwIE8: true
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist',
                        src: '*.js',
                        dest: 'dist/',
                        ext: '.min.js',
                        extDot: 'last'
                    }
                ]
            }
        },
        mxmlc: {
            build: {
                options: {
                    rawConfig: '-compiler.source-path=./lib/as3/src'
                },
                files: [
                    {
                        src: 'lib/as3/src/com/reelcontent/vpaidadapter/main/Player.as',
                        dest: 'dist/vast-player--vpaid.swf'
                    }
                ]
            }
        },

        connect: {
            server: {
                options: {
                    base: 'examples',
                    livereload: true,
                    open: true
                }
            }
        },
        watch: {
            server: {
                options: {
                    livereload: true
                },
                files: [
                    'examples/**'
                ]
            }
        }
    });

    grunt.registerTask('test', [
        'karma:test',
        'jshint:code'
    ]);

    grunt.registerTask('build', [
        'clean:build',
        'browserify:build',
        'uglify:build',
        'mxmlc:build'
    ]);

    grunt.registerTask('server', [
        'browserify:server',
        'connect:server',
        'watch:server'
    ]);

    grunt.registerTask('tdd', ['karma:tdd']);
};
