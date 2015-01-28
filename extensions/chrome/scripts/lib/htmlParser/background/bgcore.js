define(['lib/htmlParser/background/nio', 'lib/htmlParser/common/util', 'lib/htmlParser/common/processor', 'lib/htmlParser/background/wininfo'], function(nio, util, processor, wininfo) {
  var core = {};

  core.PageData = PageData;
  core.DocData = DocData;

  function PageData(tabId, pageId, config, processSelection, processFrame, callback) {
    var timeoutError, that = this;
    this.pageId = pageId;
    this.docs = [];
    this.processedDocs = 0;
    this.initializedDocs = 0;
    this.processableDocs = 0;
    this.config = config;
    this.processSelection = processSelection;
    this.processFrame = processFrame;
    this.processing = true;
    this.tabId = tabId;
    this.requestManager = new nio.RequestManager();
    this.progressIndex = 0;
    this.progressMax = 0;
    this.title = null;
    this.url = null;
    this.top = null;
    this.timeoutPageInit = null;
    this.portsId = [];
    this.contextmenuTime = null;
    this.frameDocData = null;
    timeoutError = setTimeout(function() {
      that.processing = false;
      chrome.tabs.sendMessage(tabId, {data: {
        event: 'process-error',
        processError : true
      }});
    }, 15000);
    wininfo.init(tabId, function(processableDocs) {
      clearTimeout(timeoutError);
      that.processableDocs = processableDocs;
      callback();
    });
  }

  PageData.prototype = {
    initProcess : function() {
      console.log('bgcore:PageData:initProcess');
      var that = this;
      this.docs.forEach(function(docData) {
        if (that.config.processInBackground) {
          if (docData.processDocCallback)
            docData.processDocCallback();
        } else
          docData.process();
      });
    },
    processDoc : function(port, topWindow, winId, index, content, title, url, baseURI, characterSet, canvasData, contextmenuTime, callbacks) {
      console.log('bgcore:processDoc:');
      var that = this, docData;
      docData = new DocData(port, winId, index, content, baseURI, characterSet, canvasData);
      if (topWindow) {
        this.top = docData;
        this.title = title || "";
        this.url = url;
      }
      this.docs.push(docData);
      if (this.processFrame && contextmenuTime && (!this.contextmenuTime || contextmenuTime > this.contextmenuTime)) {
        this.contextmenuTime = contextmenuTime;
        this.frameDocData = docData;
      }
      if (this.config.processInBackground && docData.content) {
        docData.parseContent();
        docData.processDocCallback = processor.initProcess(docData.doc, docData.doc.documentElement, topWindow, baseURI, characterSet, this.config,
          canvasData, this.requestManager, function(maxIndex) {
            callbacks.init(that, docData, maxIndex);
          }, function(index, maxIndex) {
            callbacks.progress(that, docData, index);
          }, function() {
            callbacks.end(that, docData);
          });
      }
    },
    processDocFragment : function(docData, mutationEventId, content) {
      var doc = document.implementation.createHTMLDocument();
      doc.body.innerHTML = content;
      docData.processDocCallback = processor.initProcess(doc, doc.documentElement, this.top == docData, docData.baseURI, docData.characterSet,
        this.config, null, this.requestManager, function() {
          docData.processDocCallback();
        }, null, function() {
          docData.setDocFragment(doc.body.innerHTML, mutationEventId);
        });
    },
    setDocContent : function(docData, content, callback) {
      var selectedDocData, that = this;

      function buildPage(docData, setFrameContent, getContent, callback) {
        function setContent(docData) {
          var parent = docData.parent;
          if (parent)
            setFrameContent(docData, function() {
              parent.processedChildren++;
              if (parent.processedChildren == parent.childrenLength)
                getContent(parent, function() {
                  setContent(parent);
                });
            });
          else if (callback)
            callback(docData);
        }

        if (docData.childrenLength)
          docData.children.forEach(function(data) {
            buildPage(data, setFrameContent, getContent, callback);
          });
        else
          setContent(docData);
      }

      function bgPageEnd(pageData, docData, callback) {
        var content = util.getDocContent(docData.doc);
        if (pageData.config.displayProcessedPage)
          pageData.top.setContent(content);
        else
          callback(pageData.tabId, pageData.pageId, pageData.top, content);
      }

      if (content)
        docData.content = content;
      this.processedDocs++;
      if (this.processSelection)
        if (this.config.processInBackground)
          bgPageEnd(this, docData, callback);
        else
          docData.getContent(function() {
            that.top.setContent(docData.content);
          });
      else if (this.processedDocs == this.docs.length) {
        this.docs.forEach(function(docData) {
          var parentWinId = docData.winId.match(/((?:\d*\.?)*)\.\d*/);
          parentWinId = parentWinId ? parentWinId[1] : null;
          if (parentWinId)
            that.docs.forEach(function(data) {
              if (data.winId && data.winId == parentWinId)
                docData.parent = data;
            });
          if (docData.parent)
            docData.parent.setChild(docData);
        });
        if (this.frameDocData) {
          selectedDocData = this.frameDocData;
          selectedDocData.parent = null;
        } else
          selectedDocData = this.top;
        if (this.config.processInBackground)
          buildPage(selectedDocData, function(docData, callback) {
            var content = encodeURI(util.getDocContent(docData.doc)), maxFrameSize = that.config.maxFrameSize;
            if (maxFrameSize > 0 && content.length > maxFrameSize * 1024 * 1024)
              content = "";
            docData.parent.docFrames[docData.index].setAttribute("src", "data:text/html;charset=utf-8," + content);
            delete docData.doc;
            callback();
          }, function(docData, callback) {
            callback();
          }, function(docData) {
            bgPageEnd(that, docData, callback);
          });
        else
          buildPage(this.top, function(docData, callback) {
            docData.parent.setFrameContent(docData, callback);
          }, function(docData, callback) {
            docData.getContent(callback);
          }, function(docData) {
            docData.setContent();
          });
      }
    },
    computeProgress : function() {
      var that = this;
      this.progressIndex = 0;
      this.progressMax = 0;
      this.docs.forEach(function(docData) {
        that.progressIndex += docData.progressIndex || 0;
        that.progressMax += docData.progressMax || 0;
      });
    },
    getResourceContentRequest : function(url, requestId, winId, characterSet, mediaTypeParam, docData) {
      this.requestManager.send(url, function(content) {
        docData.getResourceContentResponse(content, requestId);
      }, characterSet, mediaTypeParam);
    },
    getDocData : function(winId) {
      var found;
      this.docs.forEach(function(docData) {
        if (docData.winId == winId)
          found = docData;
      });
      return found;
    }
  };

  function DocData(port, winId, index, content, baseURI, characterSet, canvasData) {
    this.port = port;
    this.content = content;
    this.baseURI = baseURI;
    this.characterSet = characterSet;
    this.canvasData = canvasData;
    this.winId = winId;
    this.index = index;
    this.children = [];
    this.doc = null;
    this.docFrames = null;
    this.processDocCallback = null;
    this.getContentCallback = null;
    this.setFrameContentCallback = null;
    this.processedChildren = 0;
    this.childrenLength = 0;
  }

  DocData.prototype = {
    parseContent : function() {
      var doc = document.implementation.createHTMLDocument();
      doc.open();
      doc.write(this.content);
      doc.close();
      this.doc = doc;
      this.docFrames = doc.querySelectorAll("iframe, frame");
      delete this.content;
    },
    setChild : function(childDoc) {
      this.children[childDoc.index] = childDoc;
      this.childrenLength++;
    },
    process : function() {
      console.log('bgcore:DocData:process');
      this.port.postMessage({
        processDoc : true,
        winId : this.winId
      });
    },
    setDocFragment : function(content, mutationEventId) {
      console.log('bgcore:DocData:setDocFragment');
      this.port.postMessage({
        setDocFragment : true,
        content : content,
        mutationEventId : mutationEventId
      });
    },
    getResourceContentResponse : function(content, requestId) {
      console.log('bgcore:DocData:getResourceContentResponse');
      this.port.postMessage({
        getResourceContentResponse : true,
        requestId : requestId,
        winId : this.winId,
        content : content
      });
    },
    setContent : function(content) {
      console.log('bgcore:DocData:setContent');
      this.port.postMessage({
        setContentRequest : true,
        content : content,
        winProperties : core.winProperties
      });
    },
    getContent : function(callback) {
      console.log('bgcore:DocData:getContent');
      this.getContentCallback = callback;
      this.port.postMessage({
        getContentRequest : true,
        winId : this.winId
      });
    },
    setFrameContent : function(docData, callback) {
      console.log('bgcore:DocData:setFrameContent');
      docData.setFrameContentCallback = callback;
      this.port.postMessage({
        setFrameContentRequest : true,
        winId : this.winId,
        index : docData.index,
        content : docData.content
      });
    }
  };

  (function() {
    var property, winProperties = {};
    for (property in window)
      winProperties[property] = true;
    core.winProperties = winProperties;
  })();

  return core;
});
