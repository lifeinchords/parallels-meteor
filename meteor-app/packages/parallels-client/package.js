Package.describe({
  name: 'parallels-client',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});


Package.onUse(function(api) {
  api.versionsFrom('1.4.1');

  api.use([
    "session",
    "parallels-lib@0.0.2",
    "chuangbo:marked@0.3.5_1",
    "angelcabo:mousetrap@1.0.2"
  ], 'client', {weak: false, unordered: false});

  api.addFiles([
    'lib/vendor/flocking/flocking-no-jquery.min.js',
    'lib/vendor/two/two.min.js',
    'lib/vendor/verge/verge.js',
    'lib/meteor-reload-config.js',
    'lib/key-bindings.js',
    'lib/markdown-config.js',
    'lib/main.js'
  ], 'client');
});
