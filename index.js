(function() {
    var ws = null;
    var connected = false;

    var serverUrl;
    var connectionStatus;
    var isSaveFile;
    var getFileWrap;
    var getFileButton;
    var filePath;

    var connectButton;
    var disconnectButton;

    var open = function() {
        var url = serverUrl.val();
        ws = new WebSocket(url);
        ws.onopen = onOpen;
        ws.onclose = onClose;
        ws.onmessage = onMessage;
        ws.onerror = onError;

        connectionStatus.text('OPENING ...');
        serverUrl.attr('disabled', 'disabled');
        connectButton.hide();
        disconnectButton.show();
    };

    var close = function() {
        if (ws) {
            console.log('CLOSING ...');
            ws.close();
        }
    };

    var reset = function() {
        connected = false;
        connectionStatus.text('CLOSED');

        serverUrl.removeAttr('disabled');
        connectButton.show();
        disconnectButton.hide();
    };

    var clearLog = function() {
        $('#messages').html('');
    };

    var onOpen = function() {
        console.log('OPENED: ' + serverUrl.val());
        ws.send('console');
        connected = true;
        connectionStatus.text('OPENED');
    };

    var onClose = function() {
        console.log('CLOSED: ' + serverUrl.val());
        ws = null;
        reset();
    };

    var onFileSelectChanged = function(checked) {
        if (checked) {
            console.log('checked: ');
            getFileWrap.show();
        } else {
            console.log('unchecked: ');
            filePath.text('');
            getFileWrap.hide();
        }
    }

    var onMessage = function(event) {
        var data = event.data;
        if (filter.val()) {
            if (data.indexOf(filter.val())>=0) {
                addMessage(data);
            }
        } else {
            addMessage(data);
        }
    };

    var onError = function(event) {
        alert(event.type);
    };

    var addMessage = function(data, type) {
        var msg = $('<pre>').text(data);
        var messages = $('#messages');
        messages.append(msg);

        var msgBox = messages.get(0);
        while (msgBox.childNodes.length > 1000) {
            msgBox.removeChild(msgBox.firstChild);
        }
        msgBox.scrollTop = msgBox.scrollHeight;
    };

    var loadHistory = function() {
        var url = localStorage.getItem('historyUrl');

        if (url) {
            serverUrl.val(url);
        }
    };

    var saveHistory = function() {
        localStorage.setItem('historyUrl', serverUrl.val());
    };

    function onInitFs(fs) {
      
      }

      function errorHandler(e) {
        console.log('Error: ' + e.name+"\n" + e.message);
      }

    WebSocketClient = {
        init: function() {
            serverUrl = $('#serverUrl');
            filter = $('#filter');
            connectionStatus = $('#connectionStatus');

            connectButton = $('#connectButton');
            disconnectButton = $('#disconnectButton');
            isSaveFile = $('#isSaveFile');
            getFileWrap = $('#getFileWrap');
            getFileButton = $('#getFileButton');
            filePath = $('#filePath');

            loadHistory();

            connectButton.click(function(e) {
                close();
                open();
                saveHistory();
            });

            disconnectButton.click(function(e) {
                close();
            });

            isSaveFile.change(function(e) {
                var checkbox = e.target;
                onFileSelectChanged(checkbox.checked);
            });

            getFileButton.click(function(e) {
                var requestedBytes = 1024*1024*280; 

                navigator.webkitPersistentStorage.requestQuota (
                // navigator.webkitTemporaryStorage.requestQuota (
                    requestedBytes, function(grantedBytes) {  
                        console.log('we were granted ', grantedBytes, 'bytes');
                        // window.webkitRequestFileSystem(TEMPORARY, grantedBytes, onInitFs, errorHandler); 
                        window.webkitRequestFileSystem(PERSISTENT, grantedBytes, onInitFs, errorHandler); 
                
                    }, function(e) { console.log('Error', e); }
                );
            });

            $('#clearMessage').click(function(e) {
                clearLog();
            });

            serverUrl.keydown(function(e) {
                if (e.which === 13) {
                    connectButton.click();
                }
            });
        }
    };
})();

var WebSocketClient;

$(function() {
    WebSocketClient.init();
});
