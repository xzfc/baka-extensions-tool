// ==UserScript==
// @name        Baka extensions tool
// @version     1.24.2
// @namespace   baka-extensions-tool
// @updateURL   https://raw.githubusercontent.com/xzfc/baka-extensions-tool/master/baka_extentsions_tool.user.js
// @include     http://agar.io/*
// @include     http://petridish.pw/*
// @include     http://fxia.me/agar/
// @grant       none
// ==/UserScript==

(function() {
    var version = "1.24.2"
    setConf({wsUri: "ws://89.31.114.117:8000/",
             quickTemplates: {
                 _049: [['К', 'Покорми'],
                        ['!К', 'Не корми']],
                 _050: [['ВК', 'Взорви колючку'],
                        ['ПК', 'Пульни колючку']],
                 _051: [['Е', 'Возьми мои ошмётки'],
                        ['!Е', 'Не бери мои ошмётки']],
                 _052: [['⧀', 'Отходим'],
                        ['⧁', 'Наступаем']],
                 _097: [['↙', 'Левый нижний угол']],
                 _098: [['↓', 'Центр внизу']],
                 _099: [['↘', 'Правый нижний угол']],
                 _100: [['←', 'Центр слева']],
                 _101: [['⨀', 'Центр']],
                 _102: [['→', 'Центр справа']],
                 _103: [['↖', 'Левый верхний угол']],
                 _104: [['↑', 'Центр сверху']],
                 _105: [['↗', 'Правый верхний угол']],
             },
             teams:{
                 baka:{aura: "#00f",
                       names: [/[⑨Ø]/]},
                 zt: {aura: "#a5a",
                      names: [/ƵŦ/]},
                 turkey: {names: [/ek[sşŞ\$][iİ]/i,
                                  /[iİ][╦T][µÜ]/i,
                                  /[ʍm][εe][†t][υuü]|ʍε†/i,
                                  /[Ծo][dԺ][tԵ][uü]/i,
                                  /ΆǾĢ|ⒶⓄⒼ/, /ŦĪŦ/,
                                  /\bDH\b/, /[つマづĐÐ][みℋんĦн]|ⒹⒽ|매|Ďℍ|⊃Ⓗ|đħ/]},
                 other: {names: [/\[(\$|402λ|WAR|AOG|DH|FBI|TUC|EU|TW|AGU|R[iİ]PO|T[iİ]T)\]/i,
                                 /ヴ[いぃ]ｐ/,
                                 /ⒷⓀ|ⓂⓋⓅ|RZCW|MZDK|Mezdeke/,
                                 /\b(AOG|MKB|MZK|FKS|TİT|HKG)\b/i,
                                 /\b(pkb|ркб|ркв)\b/i, /pkb/i,
                                 /[1①❶][8⑧❽]-?[2②❷][5⑤❺]/,
                                 /Ì\.M\.P/, "[UP] #1",
                                 /㉹/, /ՁЧ➹７|ջЧ➹Դ/,
                                ]},
             },
             soundList: ["http://89.31.114.117/tutturu/0.mp3",
                         "http://89.31.114.117/tutturu/1.mp3",
                         "http://89.31.114.117/tutturu/2.mp3",
                         "http://89.31.114.117/tutturu/3.mp3",
                         "http://89.31.114.117/tutturu/4.mp3",
                         "http://89.31.114.117/tutturu/5.mp3",
                         "http://89.31.114.117/tutturu/6.mp3",
                         "http://89.31.114.117/tutturu/7.mp3"],
             sound: {chat:1, quick:1},
             showOnlyBakaAura: false,
             myAura: "#fff",
             bakaAura: "#000",
             defaultTeamAura: "#A55",
             timeFormat: 0,
             mouseControls: true,
             fogOfWar: false,
             hideJoinLeaveMessages: false,
             mapProjection: [-7060, 7060],
            })
    var myName = null
    var hasConnected = false

    var defaultName = "Безымянная сырно"
    function g(id) {return document.getElementById(id)}

    function setConf(defaults) {
        function setDefault(record, field, value) {
            if (record[field] === undefined && value !== undefined)
                record[field] = value
        }
        setDefault(window, 'bakaconf', {})
        for (var i in defaults)
            if (i !== 'teams')
                setDefault(window.bakaconf, i, defaults[i])
        setDefault(window.bakaconf, 'teams', {})
        for (var i in defaults.teams)
            setDefault(window.bakaconf.teams, i, defaults.teams[i])
    }

    function join(l) {
        if (l.length === 0)
            return ["никого"]
        if (l.length <= 1)
            return l
        var result = []
        for (var i = 0; i < l.length; i++) {
            result.push(l[i])
            if (i < l.length-2)
                result.push(", ")
            else if (i === l.length-2)
                result.push(" и ")
        }
        return result
    }

    function formatTime(t) {
        function pad(number) { return (number < 10) ? '0' + number : number }
        t = new Date(t*1000 + 1000*60*60*3)
        var h = pad(t.getUTCHours()), m = pad(t.getUTCMinutes()), s = pad(t.getUTCSeconds())
        switch(window.bakaconf.timeFormat % 3) {
        case 0: return  h+':'+m+':'+s+' '
        case 1: return  h+':'+m+' '
        case 2: return ''
        }
    }

    var storage = {
        get: function(key) {
            if (typeof GM_getValue === 'function')
                return GM_getValue(key, null)
            else
                return localStorage.getItem(key)
        },
        set: function(key, value) {
            if (typeof GM_setValue === 'function')
                GM_setValue(key, value)
            else
                localStorage.setItem(key, value)
        }
    }

    var notificator = {
        cached: [],
        list: "",
        unreadCount: 0,
        init: function() {
            var el = document.createElement('div')
            el.id = "notification"
            document.body.appendChild(el)
            el.onclick = chat.toggle.bind(chat, true)
            this.cache()
        },
        cache: function() {
            var list = window.bakaconf.soundList.join("\n")
            if (list === this.list)
                return
            this.list = list
            console.log("Update!")
            this.cached = window.bakaconf.soundList.map(function(x) {
                return new Audio(x)
            })
        },
        clear: function() {
            this.unreadCount = 0
            g("notification").style.visibility = 'hidden'
        },
        notify: function(what) {
            if (chat.hidden) {
                g("notification").style.visibility = ''
                g("notification").textContent = ++this.unreadCount
            }
            if (window.bakaconf.sound[what]) {
                this.cache()
                if (this.cached.length === 0)
                    return
                this.cached[Math.floor(Math.random()*this.cached.length)].play()
            }
        },
    }

    var chat = {
        hidden: false,
        active: false,
        defaultPosition: true,
        usersCount: 0,
        init: function() {
            var cbox = document.createElement('table')
            cbox.cellpadding = cbox.cellspacing = 0
            cbox.id = 'cbox'
            cbox.innerHTML = '<tr><td colspan="2"><div id="msgsbox"></div></td></tr>' +
                '<tr height="0">' +
                '<td width="100%"><form id="form"><input id="carea" autocomplete="off"></form></td>' +
                '<td id="chat_users"></td>' +
                '</tr>' +
                '<tr><td colspan="2"><div id="connector" style="display:none"></div></td></tr>'
            document.body.appendChild(cbox)

            g("chat_users").onclick = function() { send({t:'names'}) }
            g('form').onsubmit = submit
            g('carea').onfocus = function () {
                chat.active = true
                cbox.style.opacity = '1'
            }
            g('carea').onblur = function () {
                chat.active = false
                cbox.style.opacity = '0.7'
            }
            g('carea').onkeydown = function(e) {
                switch (e.keyCode) {
                case 38: return submitHistory.up(), false
                case 40: return submitHistory.down(), false
                }
            }
        },
        move: function() {
            var dp = this.defaultPosition = !this.defaultPosition
            var stl = g('cbox').style
            stl.bottom = stl.right = dp?'0':''
            stl.top    = stl.left  = dp?'' :'0'
        },
        toggle: function(show) {
            this.hidden = show === undefined ? !this.hidden : !show
            g('cbox').style.visibility = (this.hidden ? 'hidden' : '')
            notificator.clear()
        },
        focus: function() {
            this.toggle(true)
            document.getElementById('carea').focus()
        },
        blur: function() { g('carea').blur() },
        clickName: function(e) {
            e = e || window.event; e = e.target || e.srcElement
            var ca = document.getElementById('carea')
            ca.value = e.textContent + ": " + ca.value
            chat.focus()
        },
        setUsersCount: function(add, value) {
            if (add)
                this.usersCount += value
            else
                this.usersCount = value
            g("chat_users").textContent = (this.usersCount >= 0) ? this.usersCount : "#"
        },
    }

    var sessionId = Math.random().toString(36).substring(2)
    function connectChat() {
        function reconnectButton(e) {
            e = e || window.event;e = e.target || e.srcElement
            e.parentNode.removeChild(e)
            connectChat()
        }
        ignore.reset()
        var reconnect = false, closed = false
        var ws = new WebSocket(window.bakaconf.wsUri)
        var myId = null
        ws.binaryType = "arraybuffer"
        ws.onopen = function(evt) {
            map.reset()
            send({t: "version", version: version,
                  expose: (window.agar===undefined?0:1),
                  sessionId: sessionId })
            var auth_token = storage.get('auth_token')
            if (auth_token !== null)
                send({t:"auth", token:auth_token})
            if (myName !== null)
                send({t: "name", "name": myName})
        }
        ws.onclose = function(evt) {
            if (closed) return
            chat.setUsersCount(false, -1)
            if (reconnect) {
                closed = true
                addLine({message:['Переподключаюсь~']})
                return connectChat()
            }
            if (hasConnected) {
                hasConnected = false
                return setTimeout(connectChat, 1000)
            } else {
                addLine({message:["Вебсокет закрыт. ",
                                  aButton("переподключиться к вебсокету", reconnectButton)]})
            }
            notificator.notfy('system')
        }
        ws.onerror = function(evt) {
            if (closed) return
            console.log(evt)
            addLine({message:"Ошибка вебсокета"})
        }
        ws.reconnect = function() {
            reconnect = true
            ws.close()
            setTimeout(function() {
                if (closed) return
                closed = true
                addLine({message:['Переподключаюсь~~']})
                connectChat()
            }, 1000)
        }
        ws.onmessage = function(evt) {
            hasConnected = true
            if (closed) return
            if (evt.data instanceof window.ArrayBuffer)
                onmessage_binary(new DataView(evt.data))
            else
                onmessage_json(JSON.parse(evt.data))
        }
        function onmessage_json(d) {
            var sender = {i:d.i, name:d.f, premium:d.premium}
            function notify(what) {
                if (myId !== d.i && myId !== null)
                    notificator.notify(what)
            }
            switch(d.t) {
            case "names":
                var namesList = d.names.
                    filter(function(n) { return n.name !== "" }).
                    map(aName)
                var nonameCount = d.names.length - namesList.length
                if (nonameCount === 0) {/* do nothing */}
                else if (nonameCount === 1)
                    namesList.push("одна безымянная сырно" +
                                   (myName === ""?" (это ты)":""))
                else
                    namesList.push(nonameCount + " безымянных сырно" +
                                   (myName === ""?" (включая тебя)":""))
                addLine({time:d.T, message: [].concat(["В чате "], join(namesList), ["."])})
                chat.setUsersCount(false, d.names.length)
                break
            case "message":
                if (d.legacy <= 1)
                    break
                addLine({time:d.T, sender:sender, message:formatMessage(d.text)})
                notify("chat")
                break
            case "quick":
                var message = "[" + d.text + "]"
                if (d.symbol !== undefined)
                    message = "[" + d.symbol + ":" + d.text + "]"
                addLine({time:d.T, sender:sender, message:message})
                notify("quick")
                if (d.cells !== undefined)
                    map.blink(d.cells, d.symbol)
                break
            case "name":
                var oldName = aName(sender)
                sender.name = d.name
                addLine({time:d.T, message: [oldName, " теперь ", aName(sender), "."]})
                break
            case "map":
                map.update(d.data, d.range)
                break
            case "join":
                if (!window.bakaconf.hideJoinLeaveMessages)
                    addLine({time:d.T, message: [aName(sender), " заходит."]})
                chat.setUsersCount(true, +1)
                break
            case "leave":
                if (!window.bakaconf.hideJoinLeaveMessages)
                    addLine({time:d.T, message: [aName(sender), " выходит."]})
                chat.setUsersCount(true, -1)
                break
            case "welcome":
                myId = d.i
                break
            case "ping":
                d.t = 'pong'
                send(d)
                break
            case "addr":
                var connect = ""
                if (d.game === undefined || d.game === "agar.io") {
                    if (d.token)
                        connect = aButton(
                            d.token + " " + d.region,
                            connector.autoConnectParty.bind(
                                connector, d.token, d.region, d.top))
                    else
                        connect = "!brute " + d.ws + " " + d.region
                } else
                    connect = "connect(" + d.ws + ")"
                addLine({time:d.T, sender:sender, message:[
                    d.game !== undefined? "(" + d.game + ") " : "",
                    "Топ: " + joinTop(d.top), br(), connect]})
                notify("chat")
                break
            case "addrs":
                showAddrs(d.addrs, d.T)
                break
            case "restart":
                addLine({time:d.T, message:["Сейчас сервер будет перезапущен"]})
                break
            }
        }
        function onmessage_binary(d) {
            var c = 1
            function getString() {
                var result = ""
                while (true) {
                    var x = d.getUint16(c); c+=2
                    if (x === 0)
                        return result
                    result += String.fromCharCode(x)
                }
            }
            function getColor() {
                var col = d.getUint8(c+2) + d.getUint8(c+1)*0x100 + d.getUint8(c)*0x10000
                c += 3
                col = col.toString(16)
                while (col.length < 6)
                    col = "0" + col
                return "#" + col
            }
            var data_size = d.getUint32(c); c += 4
            var data = []
            for (var i = 0; i < data_size; i++) {
                var cell = {}
                cell.i = d.getUint32(c); c += 4
                cell.s = d.getUint32(c); c += 4
                cell.x = d.getFloat32(c); c += 4
                cell.y = d.getFloat32(c); c += 4
                cell.c = getColor()
                cell.n = getString()
                var flags = d.getUint8(c); c+= 1
                cell.v = (flags & 1) !== 0
                cell.a = (flags & 2) !== 0
                data.push(cell)
            }
            var range_size = d.getUint32(c); c += 4
            var range = []
            for (var i = 0; i < range_size; i++) {
                var r = {}
                r.minX = d.getFloat32(c); c += 4
                r.minY = d.getFloat32(c); c += 4
                r.maxX = d.getFloat32(c); c += 4
                r.maxY = d.getFloat32(c); c += 4
                range.push(r)
            }
            map.update(data, range)
        }
        websocket = ws
    }

    function topScreenshot() {
        var canvas = document.getElementById("canvas")
        var data = canvas.getContext('2d').getImageData(canvas.width-220, 0, 220, 320)

        var top_canvas = document.createElement("canvas")
        top_canvas.width = 220
        top_canvas.height = 320
        top_canvas.getContext('2d').putImageData(data, 0, 0)
        return top_canvas.toDataURL()
    }

    function downloadTopScreenshot() {
        var a = document.createElement('a')
        a.setAttribute('download', 'top.png')
        a.setAttribute('href', topScreenshot())
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    function aButton(text, action, className, tooltip) {
        var a = document.createElement('a')
        a.href = "javascript:void(0)"
        if (className)
            a.className = className
        a.onclick = action
        a.textContent = text
        if (tooltip !== undefined)
            a.title = tooltip
        return a
    }

    function aName(p) {
        return aButton(p.name || defaultName, chat.clickName,
                       "name" + (p.premium?" premium":""), p.i)
    }

    function formatMessage(text) {
        var re = /(https?:\/\/[^ ]*[^. ,\(\)]|:noel:)/
            var i, node, result = text.split(re)
        if (text.indexOf(g('nick').value||defaultName) > -1)
            result.higlight = true
        for (i = 1; i < result.length; i += 2) {
            var el
            if (result[i] === ':noel:') {
                el = document.createElement("img")
                el.src = "data: image/ gif; base64, R0lG"+
                    "O                                  "+
                    "D            lhEAAQALMAAP          "+
                    "3        eAv7            pUv7      "+
                    "x      mPW/                  A+    "+
                    "C    TA    f8AALAAAP///8D    Aw    "+
                    "I    CAgAAA              AP///w    "+
                    "A  AA      AAAAAAAAAAAACH5B    AE  "+
                    "A  AA        sALA    AAAAAQ    AB  "+
                    "A  AA        ARec    Mmpq  p14VVN  "+
                    "6  r9                          lm  "+
                    "j  Jy    nUAlirdy5qFWKIEd9a    QM  "+
                    "A    rC  ut              qD  lA    "+
                    "o    CI    QW          GY    /R    "+
                    "X      Co    CBibRwVhGa    ha      "+
                    "A        zvVl          LcCD        "+
                    "H            7aX218ULq0            "+
                    "B                                  "+
                    "PAMmJYgCenVoD1BSuFwUGbNQ2QwazN/EQA7";
                el.title = el.alt = result[i]
            } else {
                el = document.createElement('a')
                el.textContent = result[i]
                el.href = result[i]
                el.target = "_blank"
            }
            result[i] = el
        }
        if (text.trim()[0] === '>')
            result.greentext = true
        return result
    }

    function br() {
        return document.createElement('br')
    }

    function addLine(p) {
        var d = document.createElement('div')

        if (p.time !== undefined) {
            var time = document.createElement('span')
            time.className = "time"
            time.textContent = formatTime(p.time)
            d.appendChild(time)
        }

        if (p.sender !== undefined) {
            d.appendChild(aName(p.sender))
            d.appendChild(document.createTextNode(": "))
            d.setAttribute("bakaid", p.sender.i)
        }

        if (p.message !== undefined) {
            if (typeof p.message === "string")
                p.message = [p.message]
            var message = document.createElement('span')
            p.message.forEach(function(i) {
                if (typeof i === "string")
                    message.appendChild(document.createTextNode(i))
                else
                    message.appendChild(i)
            })
            message.className =
                (p.message.greentext ? " greentext" : "") +
                (p.message.higlight ? " higlight" : "")
            d.appendChild(message)
        }

        var msgbox = document.getElementById('msgsbox')
        var scroll = msgbox.scrollTop + msgbox.offsetHeight - msgbox.scrollHeight === 0
        msgbox.appendChild(d)
        if (scroll)
            msgbox.lastChild.scrollIntoView()
    }

    function send(a) {
        if (websocket.readyState === 1) {
            websocket.send(JSON.stringify(a))
            return true
        }
        return false
    }
    window.send = send

    function sendAddr() {
        var a = window.agar
        if (a === undefined ||
            a.ws === undefined ||
            a.top === undefined ||
            a.top.length === 0)
            return false
        var m = {t: "addr", ws:a.ws, top:a.top, game:window.location.hostname}
        if (a.region !== undefined) {
            m.region = a.region
            if (a.region.endsWith(":party"))
                m.token =
                    document.getElementsByClassName("partyToken")[0].
                    value.replace(/^agar\.io\//, "")
        }
        send(m)
    }

    var connector = {
        maxAttempts: 10,
        autoConnectParty: function(token, region, top) {
            if (!this.checkExpose())
                return
            this.stop()
            this.attempt = 0
            this.token = token
            window.setRegion(region.replace(/:.*$/, ""))
            this.region = region
            this.top = top
            this.state = 'connect'
            this.autoConnectIteration()
        },
        autoConnectIteration: function() {
            var thisMethod = this.autoConnectIteration.bind(this)
            if (this.timer !== undefined)
                delete this.timer
            if (this.state === 'connect') {
                this.status.trying()
                if (this.attempt === 0)
                    window.joinParty(this.token)
                else
                    window.createParty()
                this.state = 'check'
                this.timer = setTimeout(thisMethod, 1000)
            } else {
                var partyState = g('helloContainer').getAttribute('data-party-state')
                if (partyState === '5' || partyState === '1' && this.checkConnection()) {
                    this.status.ok()
                } else {
                    if (++this.attempt !== this.maxAttempts) {
                        this.status.trying()
                        this.state = 'connect'
                        this.timer = setTimeout(thisMethod, 4000)
                    } else {
                        this.status.fail()
                    }
                }
            }
        },
        checkConnection: function() {
            if (this.top === undefined)
                return true
            var top1 = window.agar.top, top2 = this.top
            for (var i = 0; i < top1.length; i++)
                for (var j = 0; j < top2.length; j++)
                    if (top1[i].id === top2[j].id && top1[i].name === top2[j].name)
                        return true
            return false
        },
        checkExpose: function() {
            return window.agar !== undefined &&
                window.agar.ws !== undefined &&
                window.agar.region !== undefined &&
                window.agar.top !== undefined
        },
        stop: function() {
            if (this.timer !== undefined) {
                this.status.stop()
                clearTimeout(this.timer)
                delete this.timer
            }
        },
        status: {
            init: function() {
                var t = this
                t._element = g("connector")
                t._stop = aButton("стоп", connector.stop.bind(connector))
                t._close = aButton("закрыть",
                                   function() { t._element.style.display = 'none' })
                t._text = document.createElement('span')

                ;["_text", "_close", "_stop"].
                    forEach(function(e) { t._element.appendChild(t[e])})
            },
            _set: function(text, stop) {
                this._element.style.display = ''
                this._text.textContent = text
                this._stop.style.display = stop ? '' : 'none'
                this._close.style.display = stop ? 'none' : ''
            },
            trying: function() {
                var attempt = "[" + connector.attempt + "/" + connector.maxAttempts + "] "
                if (connector.state === 'connect') {
                    if (connector.attempt === 0)
                        this._set("Подключаюсь к " + connector.token + "..." + attempt, true)
                    else
                        this._set("Перебираю в " + connector.region + "... " + attempt, true)
                }
                else if (connector.state === 'check')
                    this._set("Проверяю... " + attempt, true)
            },
            ok: function() { this._set("Подключился! ", false) },
            fail: function() { this._set("Не удалось подключиться. ", false) },
            stop: function() { this._set("Подключение прервано. ", false) }
        },
    }

    function joinTop(top) {
        return top.map(function(x){return x.name || "An unnamed cell"}).join(", ")
    }

    function showAddrs(addrs, time) {
        addrs = addrs.filter(function(x) { return (x.alive || x.players > 2) && x.ws })
        if (addrs.length === 0)
            return addLine({time:time, message:["Сырны нигде не играют."]})
        addLine({time:time, message:["Сырны играют тут:"]})
        addrs.sort(function(x, y){
            if (x.alive > y.alive) return +1
            if (x.alive < y.alive) return -1
            if (x.players > y.players) return +1
            if (x.players < y.players) return -1
            return 0
        }).forEach(function(x, idx) {
            var aConnect = aButton(x.ws, connector.autoConnect.bind(connector, x.ws, x.top))
            addLine({message:[
                idx?br():"",
                "• " + x.alive +"/" + x.players + " Топ: " + joinTop(x.top),
                br(),
                "!brute " + x.ws]})
        })
    }

    var submitHistory = {
        list: [],
        idx: -1,
        text: "",
        up: function() {
            if (this.list.length === 0)
                return
            if (this.idx === -1) {
                this.text = g('carea').value
                g('carea').value = this.list[this.idx = this.list.length-1]
            } else if (this.idx !== 0)
                g('carea').value = this.list[--this.idx]
        },
        down: function() {
            if (this.list.length === 0)
                return
            if (this.idx === this.list.length-1) {
                this.idx = -1
                g('carea').value = this.text
            } else if (this.idx !== -1)
               g('carea').value = this.list[++this.idx]
        },
        push: function(t) {
            this.idx = -1
            if (this.list[this.list.length -1] !== t)
                this.list.push(t)
        },
    }

    function submit(e) {
        var ca = document.getElementById('carea')
        function sendName() {
            var n = document.getElementById('nick')
            if (myName !== n.value) {
                myName = n.value
                send({t: "name", name:myName})
            }
        }

        if (ca.value !== "") {
            var tokens = ca.value.trim().split(/ +/)
            if (tokens.length === 0)
                return false
            if (tokens[0][0] === "/") {
                switch(tokens[0]) {
                case "/names":
                    send({t:"names"}); break
                case "/addr":
                    sendName()
                    if (tokens[1] && window.agar)
                        window.agar.region = tokens[1]
                    sendAddr(); break
                case "/addrs":
                    send({t:"addrs"}); break
                case "/reconnect":
                    websocket.reconnect(); break
                case "/ignore":
                    for (var i = 1; i < tokens.length; i++)
                        if (/^[-+]?\d+$/.test(tokens[i])) {
                            var id = parseInt(tokens[i].substr(1))
                            if (tokens[i][0] === '+')
                                ignore.add(id)
                            else
                                ignore.remove(id)
                        }
                    addLine({message: ["Список игнорирования: "].concat(join(Object.keys(ignore.list)))})
                    break
                case "/auth":
                    if (tokens[1] !== undefined) {
                        storage.set("auth_token", tokens[1])
                        send({t:"auth", token:tokens[1]})
                    }
                    break
                default:
                    addLine({message: ["Команды чата:"]})
                    addLine({message: ["/names — получить список сырн в чате"]})
                    addLine({message: ["/addr [регион] — отправить текущий севрер и топ (требуется expose)"]})
                    addLine({message: ["/addrs — получить список комнат, на которых играют сырны"]})
                    addLine({message: ["/reconnect — переподключиться к чатсерверу"]})
                    addLine({message: ["/ingore [действия] — работа со списком игнорирования. " +
                                       "Пример: `/ingore +1 +3 -2` — добавить 1 и 3 в список и убрать 2 из списка"]})
                    addLine({message: ["/auth — авторизация"]})
                }
            } else {
                sendName()
                send({t: "message", text: ca.value})
            }
            submitHistory.push(ca.value)
            ca.value = ""
            var myCells = map.myCells()
            if (myCells === undefined || myCells.length !== 0)
                ca.blur()
        }
        return false
    }

    function handleEvents() {
        // Autofire
        var repeat = 0, repeatm = 0
        setInterval(function() {
            if (!repeat && !repeatm) return
            if (!isHovered()) return repeat = repeatm = false
            olddown(key_w)
            oldup(key_w)
        }, 50)

        // Keyboard controls
        var olddown = window.onkeydown, oldup = window.onkeyup
        var extended = false
        window.onkeydown = function(e) {
            if (extended) {
                if (e.keyCode >= 16 && e.keyCode <= 18) return false
                var cmd = quick.eventToAction(e)
                if (cmd !== undefined)
                    send({t:"quick", symbol:cmd[0], text:cmd[1], cells:map.myCells()})
                quick.hide()
                extended = false
                return false
            }

            if (chat.active) {
                if (e.keyCode === 27 || e.keyCode === 9)
                    return chat.blur(), false
                else
                    return true
            }

            if (e.ctrlKey && e.keyCode === 83) {
                downloadTopScreenshot()
                return false
            }

            if (!e.altKey && !e.shiftKey && !e.ctrKey && !e.metaKey) {
                switch(e.keyCode) {
                case 9: return chat.focus(), false
                case 49: return chat.toggle(), true
                case 51: return chat.move(), true
                case 52: extended = true; quick.show(); return true
                case 53: map.toggle(); return true
                case 81: repeat = 1; return true
                }
            }
            return olddown(e)
        }
        window.onkeyup = function(e) {
            switch(e.keyCode) {
            case 81: repeat = 0;break
            default: return oldup(e)
            }
        }

        // Mouse controls
        var key_w = {keyCode: 87}, key_space = {keyCode: 32}
        g("canvas").onmousedown = function(e) {
            if (!window.bakaconf.mouseControls)
                return true
            switch (e.which) {
            case 1: return repeatm = true, false
            case 3: return olddown(key_space), oldup(key_space), false
            }
        }
        g("canvas").onmouseup = g("map").onmouseup = g("notification").onmouseup =
            g("cbox").onmouseup =
            function(e) { if (e.which === 1) repeatm = false }
        g("canvas").oncontextmenu =
            function(e) { return !window.bakaconf.mouseControls }

        // Mouse controls: hover tracker
        var hovered = {}
        function isHovered() {
            for (var i in hovered) if (hovered[i]) return true
            return false
        }
        function track(id) {
            function set(k, v) { hovered[k] = v }
            g(id).addEventListener("mouseenter", set.bind(this, id, true))
            g(id).addEventListener("mousemove",  set.bind(this, id, true))
            g(id).addEventListener("mouseleave", set.bind(this, id, false))
        }
        track("canvas"); track("map"), track("notification"), track("cbox")

        // Make baka UI mouse-transparent
        g("map").onmousemove = g("notification").onmousemove = g("cbox").onmousemove =
            g("canvas").onmousemove
        var wheel = [g("canvas"), g("map"), g("notification")]
        for (var i = 0; i < wheel.length; i++) {
            if (window.agar && window.agar.dommousescroll)
                wheel[i].addEventListener('DOMMouseScroll', window.agar.dommousescroll, false)
            else
                wheel[i].onmousewheel = document.body.onmousewheel
        }
        if (window.agar && window.agar.dommousescroll)
            document.removeEventListener('DOMMouseScroll', window.agar.dommousescroll, false)
        else
            document.body.onmousewheel = null
    }

    function handleOptions() {
        var oldSetNick = window.setNick
        window.setNick = function(n) {
            if (n !== myName) {
                myName = n
                if (window.location.hostname === 'petridish.pw')
                    myName = myName.replace(/:::::.*?:::::[0-3]$/, '')
                send({t: "name", "name": myName})
            }
            oldSetNick(n)
        }
        var oldSetDarkTheme = window.setDarkTheme
        window.setDarkTheme = function(n) {
            if (n) {
                if (document.body.hasAttribute("dark"))
                    document.body.removeAttribute("dark")
                else
                    document.body.setAttribute("dark", n)
            }
            oldSetDarkTheme(n)
        }
    }

    var map = {
        canvas: null,
        data: [],
        range: [],
        blackRibbon: true,
        hidden: false,
        blinks: {},
        blinkIdsCounter: 0,
        waitReply: true,
        myCellsAffected: false,
        init: function() {
            this.canvas = document.createElement("canvas")
            this.canvas.id = "map"
            this.canvas.width = 256
            this.canvas.height = 256
            document.body.appendChild(this.canvas)
            this.canvas.onclick = function() { map.blackRibbon = false; map.draw() }
            this.draw()
            setInterval(function(){ map.send() }, 250)
        },
        reset: function() {
            this.waitReply = false
        },
        toggle: function() {
            this.hidden = !this.hidden
            g('map').style.visibility = (this.hidden ? 'hidden' : '')
        },
        update: function(data, range) {
            this.waitReply = false
            this.data = data
            this.range = range
            this.draw()
        },
        blink: function(ids, sym) {
            var c = this.blinkIdsCounter++
            var iteration = 12
            var blink = map.blinks[c] = {ids:ids, sym:sym, hl:false}
            function toggle() {
                if (--iteration)
                    window.setTimeout(toggle, 250)
                else
                    delete map.blinks[c]
                blink.hl = !blink.hl
                map.draw()
            }
            toggle()
        },
        draw: function() {
            if (this.hidden)
                return
            var context = this.canvas.getContext('2d')
            var myCells = this.myCells() || []
            var teams = window.bakaconf.teams
            var idx = {}
            function getAura(cell) {
                if (myCells.indexOf(cell.i) > -1)
                    return window.bakaconf.myAura
                if (cell.a)
                    return window.bakaconf.bakaAura
                for (var i in teams) {
                    if (i !== 'baka' && window.bakaconf.showOnlyBakaAura)
                        continue
                    var names = teams[i].names
                    if (names instanceof RegExp || typeof names === 'string')
                        names = [names]
                    for (var j = 0; j < names.length; j++)
                        if (names[j] === cell.n ||
                            (names[j] instanceof RegExp && names[j].test(cell.n)))
                            return teams[i].aura || window.bakaconf.defaultTeamAura
                }
            }
            
            context.clearRect(0 , 0, canvas.width, canvas.height)
            var proj = window.bakaconf.mapProjection
            if (window.location.hostname === "petridish.pw") {
                var region = g('region').options[g('region').selectedIndex].text
                proj = [0, parseFloat(region.replace(/.*\bMap([0-9.]+)K\b.*/, "$1"))*1000]
            } else if ((window.agar||{}).dimensions)
                proj = [window.agar.dimensions[0], window.agar.dimensions[2]]
            proj = [proj[0], 256/(proj[1]-proj[0])]
            function t(v) { return (v-proj[0])*proj[1] } // shift+scale
            function s(v) { return v * proj[1] }         // scale
            var i

            context.globalAlpha = 0.5
            context.fillStyle = "#777"
            if (window.bakaconf.fogOfWar) {
                context.beginPath()
                for (i = 0; i < this.range.length; i++) {
                    var d = this.range[i]
                    context.rect(t(d.minX), t(d.minY),
                                 s(d.maxX-d.minX),
                                 s(d.maxY-d.minY))
                }
                context.fill()
            } else {
                context.fillRect(0 , 0, canvas.width, canvas.height)
            }

            if (this.blackRibbon) {
                context.beginPath()
                context.lineWidth = 32
                context.strokeStyle = "#000"
                context.beginPath();
                context.moveTo(256-96-32,256+32);
                context.lineTo(256+32,256-96-32);
                context.stroke()
                context.fill()
            }

            context.globalAlpha = .4
            for (i = 0; i < this.data.length; i++) {
                var d = this.data[i]
                var aura = getAura(d)
                if (aura) {
                    context.fillStyle = aura
                    context.beginPath()
                    context.arc(t(d.x), t(d.y), s(d.s)+4,
                                0, 2 * Math.PI, false)
                    context.fill()
                }

                idx[d.i] = this.data[i]
            }

            context.lineWidth = 2
            for (i = 0; i < this.data.length; i++) {
                var d = this.data[i]
                context.beginPath()
                context.arc(t(d.x), t(d.y), s(d.s),
                            0, 2 * Math.PI, false)
                context.globalAlpha = 1
                context.fillStyle = d.c
                context.fill()
                if (d.v) {
                    context.strokeStyle = "#ff0000"
                } else {
                    context.globalAlpha = .1
                    context.strokeStyle = "#000000"
                }
                context.stroke()
            }

            for (var i in this.blinks) {
                var blink = this.blinks[i]
                if (blink.ids.length === 0 || !blink.hl)
                    continue
                context.beginPath()
                context.fillStyle = "#f00"
                context.globalAlpha = 0.7
                var minX, maxX, minY, maxY, drawText = false
                for (var j = 0; j < blink.ids.length; j++) {
                    var d = idx[blink.ids[j]]
                    if (d === undefined) continue
                    drawText = true
                    if (j === 0 || minX > d.x*2-d.s) minX = d.x*2-d.s
                    if (j === 0 || maxX < d.x*2+d.s) maxX = d.x*2+d.s
                    if (j === 0 || minY > d.y*2-d.s) minY = d.y*2-d.s
                    if (j === 0 || maxY < d.y*2+d.s) maxY = d.y*2+d.s
                    context.arc(t(d.x), t(d.y), s(d.s)+6,
                                0, 2 * Math.PI, false)
                    context.closePath()
                }
                context.fill()
                if (!drawText || blink.sym === undefined) continue
                context.globalAlpha = 1
                context.font = 'bold 13px Ubuntu'
                context.textAlign = 'center'
                context.textBaseline = 'middle'
                context.fillStyle = '#0ff'
                context.fillText(blink.sym, t((minX+maxX)/4), t((minY+maxY)/4))
            }
        },
        myCells: function() {
            var a = window.agar
            if (a === undefined || a.myCells === undefined || a.allCells === undefined)
                return undefined
            var myCells = a.myCells.filter(function (x){return x in a.allCells})
            if (this.myCellsAffected && myCells.length !== a.myCells.length) {
                this.myCellsAffected = true
                send({t:'anime', myCellsAffected:1})
            }
            return myCells
        },
        send: function() {
            function getViewport() {
                var v = a.rawViewport
                if (v) {
                    var dx = 1024 / v.scale, dy = 600 / v.scale
                    return {minX:v.x-dx, minY:v.y-dy, maxX:v.x+dx, maxY:v.y+dy}
                } else {
                    var r = {minX:0, maxX:0, minY:0, maxY:0}
                    allCellsArray.forEach(function(c, i) {
                        if (!i || r.minX > c.x+c.size/2) r.minX = c.x+c.size/2
                        if (!i || r.maxX < c.x-c.size/2) r.maxX = c.x-c.size/2
                        if (!i || r.minY > c.y+c.size/2) r.minY = c.y+c.size/2
                        if (!i || r.maxY < c.y-c.size/2) r.maxY = c.y-c.size/2
                    })
                    return r
                }
            }
            var a = window.agar
            var myCells = this.myCells()
            if (a === undefined || a.allCells === undefined || myCells === undefined || a.top === undefined || !a.ws) {
                if (!this.hidden)
                    send({t:'map', reply:1})
                return
            }
            if (!a.top.length)
                return
            var allCellsArray = Object.keys(a.allCells).map(function(i){ return a.allCells[i] })
            var cells = allCellsArray.filter(function(c){
                return c.size >= 32 || myCells.indexOf(c.id) > -1
            }).map(function(c){
                return {x:c.x,
                        y:c.y,
                        i:c.id,
                        n:c.name,
                        c:c.color,
                        s:c.size,
                        v:c.isVirus?1:0}
            })
            var top = a.top.map(function(x){return [x.id, x.name]})
            var reply = (!this.hidden && !this.waitReply) ? 1 : 0
            var sent = send({t:'map', all:cells, my:myCells, top:top, reply:reply,
                             ws:a.ws, range:getViewport(), game:window.location.hostname})
            if (sent && reply)
                this.waitReply = true
            this.blackRibbon = false
        },
    }

    var quick = {
        eventToAction: function(e) {
            var key
            if (e.keyCode < 10) key = "_00" + e.keyCode
            else if (e.keyCode < 100) key = "_0" + e.keyCode
            else key = "_" + e.keyCode
            var t = window.bakaconf.quickTemplates[key]
            if (t === undefined || t.length === 0)
                return
            var mod = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey
            if (mod && t.length >= 2)
                return t[1]
            return t[0]
        },
        show: function() {
            this.hide()
            var quickHint = document.createElement('div')
            quickHint.id = "quickHint"
            function add(key, sym, text) {
                var line = document.createElement('div')
                function span(className, textContent) {
                    var span = document.createElement('span')
                    span.textContent = textContent
                    span.className = className
                    line.appendChild(span)
                }
                span('key', key)
                span('sym', sym)
                span('text', text)
                quickHint.appendChild(line)
            }
            function codeToName(x) {
                if (x >= 48 && x <= 57) return ""+(x-48)
                if (x >= 96 && x <= 105) return "num"+(x-96)
                if (x >= 65 && x <= 90) return x-65+"a".charCodeAt(0)
                return "[" + x + "]"
            }
            var keys = Object.keys(window.bakaconf.quickTemplates).sort()
            for (var i = 0; i < keys.length; i++) {
                var name = codeToName(+keys[i].substr(1))
                var t = window.bakaconf.quickTemplates[keys[i]]
                if (t.length >= 1)
                    add(name, t[0][0], t[0][1])
                if (t.length >= 2)
                    add("Mod + " + name, t[1][0], t[1][1])
            }
            document.body.appendChild(quickHint)
        },
        hide: function() {
            var quickHint = document.getElementById('quickHint')
            if (quickHint)
                document.body.removeChild(quickHint)
        },
    }

    var ignore = {
        style: null,
        list: {},
        init: function() {
            this.style = document.createElement('style')
            this.style.id = 'baka-style-ignore'
            document.head.appendChild(this.style)
        },
        update: function() {
            var list = Object.keys(this.list)
            if (list.length === 0)
                this.style.textContent = ""
            else
                this.style.textContent = list.map(function(i) {
                    return '#msgsbox > div[bakaid="'+i+'"]'
                }).join(',\n') + "{ display:none }"
        },
        add: function(i) { this.list[i] = 1; this.update() },
        remove: function(i) { delete this.list[i]; this.update() },
        reset: function() { this.list = {}; this.update() },
    }

    function init() {
        if (g('baka-style') === null) {
            var stl = document.createElement('style')
            stl.id = 'baka-style'
            stl.textContent = '#cbox { background:rgba(255,255,255,0.5); position:fixed; z-index:205; bottom:0; right:0; width:400px; color:#000; opacity:0.7 }' +
                '#carea { width:100%; color:black }' +
                '#form { margin:0 }' +
                '#msgsbox { overflow:auto; word-wrap:break-word; width:400px; height:250px }' +
                '#msgsbox .name { color:#333 }' +
                '#msgsbox .name.premium { color:#550;font-weight:bold }' +
                '#msgsbox .higlight { color:#055 }' +
                '#msgsbox .time { font-size:70%; color:#777 }' +
                '#msgsbox .greentext { color:#3b5000 }' +
                'body:not([dark]) a { color:#275d8b }' +
                'body[dark] #cbox { background:rgba(0,0,0,0.5); color:#fff }' +
                'body[dark] #msgsbox .name { color:#CCC }' +
                'body[dark] #msgsbox .name.premium { color:#EEA }' +
                'body[dark] #msgsbox .higlight { color:#faa }' +
                'body[dark] #msgsbox .greentext { color:#789922 }' +
                '#notification { background:red; position:fixed; z-index:205; bottom:5px; right:5px; opacity:0.5; color:white }' +
                '#quickHint { background:#777; position:fixed; z-index:210; top:0; left:0; color:white }'+
                '#quickHint .key { font-weight:bold; margin-right:1em; float:left; width:4em }' +
                '#quickHint .sym { color:#000; float:left; width:2em }' +
                '#map { position:fixed; bottom:5px; left:5px; z-index:205; border:1px black solid }' +
                'body[dark] #map { border-color: #aaa }' +
                '.agario-promo { width: 220px !important; height: 274px !important; background-size: contain }' +
                '.tosBox { bottom: initial !important; border-radius: 0px 0px 0px 5px !important }'
            document.head.appendChild(stl)
        }

        chat.init()
        map.init()
        ignore.init()
        connector.status.init()
        notificator.init()

        setInterval(function() {
            send({t:'ping'})
        }, 1000)

        handleOptions()
        handleEvents()
        connectChat()
    }

    function wait() {
        if (!window.onkeydown || !window.onkeyup ||
            !window.setNick || !g("canvas").onmousemove)
            return setTimeout(wait, 100)
        init()
    }
    wait()
})()
