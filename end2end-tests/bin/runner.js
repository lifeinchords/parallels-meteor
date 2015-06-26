var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var conf = require('selenium-standalone/conf');

var service = new chrome.ServiceBuilder(conf.chromeDr.path).build();
chrome.setDefaultService(service);

var options = new chrome.Options();
var logOptions = new webdriver.logging.Preferences();
logOptions.setLevel('browser', webdriver.logging.Level.ALL);
options.setLoggingPrefs(logOptions);

var driver = new chrome.Driver(options);

console.log("  > Opening Meteor test suite...");
driver.get('http://127.0.0.1:4096').then(function() {
  console.log("  > Running tests...");

  // Wait for tests to complete.
  var pollTimer = setInterval(function() {
    // Output logs while the tests are running.
    driver.manage().logs().get('browser').then(function (log) {
      for (var index in log) {
        var entry = log[index];
        console.log("    [" + entry.level.name + "] " + entry.message);
      }
    });

    driver.executeScript(function() {
      if (typeof TEST_STATUS !== 'undefined')
        return TEST_STATUS.DONE;
      return typeof DONE !== 'undefined' && DONE;
    }).then(function(done) {
      if (done) {
        clearInterval(pollTimer);
        driver.executeScript(function () {
          if (typeof TEST_STATUS !== 'undefined')
            return TEST_STATUS.FAILURES;
          if (typeof FAILURES === 'undefined') {
            return 1;
          }
          return 0;
        }).then(function (failures) {
          // Output final logs.
          driver.manage().logs().get('browser').then(function (log) {
            for (var index in log) {
              var entry = log[index];
              console.log("    [" + entry.level.name + "] " + entry.message);
            }

            driver.quit().then(function() {
              console.log("  > Tests completed " + (failures ? "WITH FAILURES" : "OK") + ".");
              process.exit(failures ? 1 : 0);
            });
          });
        });
      }
    });
  }, 500);
});