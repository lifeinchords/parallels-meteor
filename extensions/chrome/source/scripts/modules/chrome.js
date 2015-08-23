'use strict';

define(function () {

  return {
    /**
     * @callback tabPageInfoCallback
     * @param {Object} pageInfo - page information for tab where extension was initiated
     */

    /**
     * Send message to the extension
     * @param {tabPageInfoCallback} callback - The callback that handles the response.
     */
    onExtensionTriggered: function (callback) {
      chrome.browserAction.onClicked.addListener(function (tab) {
        var pageInfo = {
          url: tab.url,
          title: tab.title,
          nativeWidth: tab.width,
          nativeHeight: tab.height
        };
        callback(pageInfo);
      });
    },

    saveLocal: function (data, callback) {
      chrome.storage.local.set(data, callback);
    },

    getLocal: function (data, callback) {
      var storedData = {};
      storedData[data.key] = data.defaultValue;
      chrome.storage.local.get(storedData, function (value) {
        callback(value);
      });
    },

    notify: function (notification, callback) {
      var options = {
        type: 'basic',
        title: notification.title,
        message: notification.message,
        iconUrl: '../images/cube.png'
      };

      chrome.notifications.create('', options, function(id) {
        console.log('notification ' + id);
        callback();
      });
    },

    screenshot: function (callback) {
      chrome.tabs.captureVisibleTab(null, {}, function (dataUrl) {
        callback(dataUrl);
      });
    },

    getURL: function (path) {
      return chrome.extension.getURL(path);
    },

    sendMessageToDom: function (message, tabId) {
      if (tabId) {
        chrome.tabs.sendMessage(tabId, message);
      } else {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, message);
        });
      }
    },

    sendMessageToBackground: function (message) {
      chrome.extension.sendMessage(message);
    },

    currentTab: function (callback) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        callback(tabs[0]);
      });
    },

    onBackgroundConnection: function(callback) {
      chrome.extension.onConnect.addListener(function(port) {
        if (port.name === 'parallels') {
          callback({
            id: port._portId,
            senderId: port.sender.tab.id,
            onMessage: function(cb) {
              port.onMessage.addListener(cb);
            },
            onDisconnect: function(cb) {
              port.onDisconnect.addListener(cb);
            },
            removeListener: function(cb) {
              port.onMessage.removeListener(cb);
            },
            postMessage: function(message) {
              port.postMessage(message);
            }
          });
        }
      });
    },

    connectToBackground: function() {
      var port = chrome.extension.connect({name: 'parallels'});
      return {
        onBackgroundMessage: function(listener) {
          port.onMessage.addListener(listener);
        },
        postMessage: function(message) {
          port.postMessage(message);
        }
      };
    },

    initMessageListener: function(listener) {
      chrome.extension.onMessage.addListener(listener);
    }
  };
});
