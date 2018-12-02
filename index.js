(function() {
    var ws = null;
    var connected = false;

    var serverUrl;
    var connectionStatus;

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

    WebSocketClient = {
        init: function() {
            serverUrl = $('#serverUrl');
            filter = $('#filter');
            connectionStatus = $('#connectionStatus');

            connectButton = $('#connectButton');
            disconnectButton = $('#disconnectButton');

            loadHistory();

            connectButton.click(function(e) {
                close();
                open();
                saveHistory();
            });

            disconnectButton.click(function(e) {
                close();
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
