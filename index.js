(function() {
    var ws = null;
    var connected = false;
    var historyItems = [];

    var serverUrl;
    var connectionStatus;
    var sendMessage;

    var historyList;
    var connectButton;
    var disconnectButton;
    var sendButton;

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
        sendMessage.attr('disabled', 'disabled');
        sendButton.attr('disabled', 'disabled');
    };

    var clearLog = function() {
        $('#messages').html('');
    };

    var onOpen = function() {
        console.log('OPENED: ' + serverUrl.val());
        ws.send('console');
        connected = true;
        connectionStatus.text('OPENED');
        sendMessage.removeAttr('disabled');
        sendButton.removeAttr('disabled');
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
        if (type === 'SENT') {
            msg.addClass('sent');
        }
        var messages = $('#messages');
        messages.append(msg);

        var msgBox = messages.get(0);
        while (msgBox.childNodes.length > 1000) {
            msgBox.removeChild(msgBox.firstChild);
        }
        msgBox.scrollTop = msgBox.scrollHeight;
    };

    var addToHistoryList = function(item) {
        var addedLi = $('<li>').attr('id', item.id).append(
            $('<a>').attr('href', item.url).attr('title', item.url).attr('class', 'historyUrl').append(item.url)).append(
            $('<span>').attr('class', 'removeHistory').append("x")).attr('style', 'display: none;').prependTo(historyList);

        addedLi.toggle('slow');
    };

    var loadHistory = function() {
        historyList = $('#history');
        historyItems = JSON.parse(localStorage.getItem('history'));

        if (!historyItems) {
            historyItems = [];
        }

        $.each(historyItems, function(i, item) {
            addToHistoryList(item);
        });

        if (historyItems.length>0) {
            serverUrl.val(historyItems[historyItems.length-1].url);
        } 
    };

    var removeHistory = function(item) {
        var removeLi = function() {
            $(this).remove();
        };
        for (var i = historyItems.length - 1; i >= 0; i--) {
            if (historyItems[i].url === item.url && historyItems[i].msg === item.msg) {
                var selector = 'li#' + historyItems[i].id;
                $(selector).toggle('slow', removeLi);

                historyItems.splice(i, 1);
            }
        }
    };

    var guid = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };

    var saveHistory = function() {
        var item = { 'id': guid(), 'url': serverUrl.val() };
        for (var i = historyItems.length - 1; i >= 0; i--) {
            if (historyItems[i].url === item.url) {
                return;
            }
        }

        if (historyItems.length >= 20) {
            historyItems.shift();
            $('#history li:last-child').remove();
        }

        historyItems.push(item);
        localStorage.setItem('history', JSON.stringify(historyItems));

        addToHistoryList(item);
    };

    var clearHistory = function() {
        historyItems = [];
        localStorage.clear();
        historyList.empty();
    };

    WebSocketClient = {
        init: function() {
            serverUrl = $('#serverUrl');
            filter = $('#filter');
            connectionStatus = $('#connectionStatus');
            sendMessage = $('#sendMessage');
            historyList = $('#history');

            connectButton = $('#connectButton');
            disconnectButton = $('#disconnectButton');
            sendButton = $('#sendButton');

            loadHistory();

            $('#clearHistory').click(function(e) {
                clearHistory();
            });

            connectButton.click(function(e) {
                close();
                open();
                saveHistory();
            });

            disconnectButton.click(function(e) {
                close();
            });

            sendButton.click(function(e) {
                var msg = $('#sendMessage').val();
                addMessage(msg, 'SENT');
                ws.send(msg);
            });

            $('#clearMessage').click(function(e) {
                clearLog();
            });

            historyList.delegate('.removeHistory', 'click', function(e) {
                var link = $(this).parent().find('a');
                removeHistory({ 'url': link.attr('href'), 'msg': link.attr('data-msg') });
                localStorage.setItem('history', JSON.stringify(historyItems));
            });

            historyList.delegate('.historyUrl', 'click', function(e) {
                window.haha1 = this;
                serverUrl.val(this.href);
                e.preventDefault();
            });

            serverUrl.keydown(function(e) {
                if (e.which === 13) {
                    connectButton.click();
                }
            });

            var isCtrl;
            sendMessage.keyup(function(e) {
                if (e.which === 17) {
                    isCtrl = false;
                }
            }).keydown(function(e) {
                if (e.which === 17) {
                    isCtrl = true;
                }
                if (e.which === 13 && isCtrl === true) {
                    sendButton.click();
                    return false;
                }
            });
        }
    };
})();

var WebSocketClient;

$(function() {
    WebSocketClient.init();
});
