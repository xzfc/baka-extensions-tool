// ==UserScript==
// @name        Baka extensions tool
// @version     1.35
// @namespace   baka-extensions-tool
// @updateURL   https://raw.githubusercontent.com/xzfc/baka-extensions-tool/master/baka_extentsions_tool.user.js
// @include     http://agar.io/*
// @grant       none
// ==/UserScript==

(function バカスクリプト() {
    var version = "1.35"
    setConf({wsUri: "ws://89.31.114.117:8000/",
             quickTemplates: {
                 Backquote: {
                     _049: ['К',  'Покорми!'],
                     S049: ['!К', 'Не корми!'],
                     _050: ['ПК', 'Пульни колючку!'],
                     S050: ['ЧК', 'Чисти колючки!'],
                     _051: ['Х',  'Скушай хвостик!'],
                     S051: ['!Х', 'Не кушай хвостик!'],
                     _052: ['✖',  'Отходим!'],
                     S052: ['⧁', 'Наступаем!'],
                     _053: ['Д',  'Делись!'],
                     S053: ['!Д', 'Не делись!'],
                 },
                 _097: ['↙', 'Левый нижний угол'],
                 _098: ['↓', 'Центр внизу'],
                 _099: ['↘', 'Правый нижний угол'],
                 _100: ['←', 'Центр слева'],
                 _101: ['⨀', 'Центр'],
                 _102: ['→', 'Центр справа'],
                 _103: ['↖', 'Левый верхний угол'],
                 _104: ['↑', 'Центр сверху'],
                 _105: ['↗', 'Правый верхний угол'],
             },
             keys: {
                 Shift_Comma:        "move_chat",
                 Shift_Period:       "move_map",
                 Shift_Tab:          "focus_chat",
                 Backslash:          "toggle_pellets",
                 Comma:              "toggle_chat",
                 Enter:              "focus_chat",
                 KeyC:              ["toggle_eating_mass_guide",
                                     "toggle_active_cell"],
                 Shift_KeyC:         "toggle_split_guide",
                 KeyX:               "toggle_eating_distance_guide",
                 KeyM:               "toggle_mouse_lines",
                 Shift_KeyM:         "toggle_stop",
                 Period:             "toggle_map",
                 Slash:              "toggle_canvas",
                 Tab:                "activate_cell",
                 Digit1:             "activate_cell 0",
                 Digit2:             "activate_cell 1",
                 Digit3:             "activate_cell 2",
                 Digit4:             "activate_cell 3",
                 Digit5:             "activate_cell 4",
                 Digit6:             "activate_cell 5",
                 Digit7:             "activate_cell 6",
                 Digit8:             "activate_cell 7",
                 Digit9:             "activate_cell 15",
                 F11:                "toggle_fullscreen",
             },
             teams:{
                 baka:{aura: "#00f",
                       names: [/⑨/]},
                 zt: {aura: "#a5a",
                      names: [/ƵŦ/]},
                 reddit: {aura: "#aa5",
                          names: [/《ℝ》/]},
                 brazil: {names: /ᴳᴀᴮ|ŦḰΔ|βҜǤ|ǤΔβ/},
                 turkey: {names: [/ek[sşŞ\$][iİ]/i,
                                  /[iİ][╦T][µÜ]/i,
                                  /[ʍm][εe][†t][υuü]|ʍε†/i,
                                  /[Ծo][dԺ][tԵ][uü]/i,
                                  /ΆǾĢ|ⒶⓄⒼ/, /ŦĪŦ/,
                                  /\bDH\b/, /[つマづĐÐ][みℋんĦн]|ⒹⒽ|매|Ďℍ|⊃Ⓗ|đħ/]},
                 other: {names: [/\[(\$|402λ|WAR|AOG|DH|FBI|TUC|EU|TW|AGU|R[iİ]PO|T[iİ]T|EXER)\]/i,
                                 /ヴ[いぃ]ｐ/,
                                 /ⒷⓀ|ⓂⓋⓅ|RZCW|MZDK|Mezdeke/,
                                 /\b(AOG|MKB|MZK|FKS|TİT|HKG)\b/i,
                                 /\b(pkb|ркб|ркв)\b/i, /P₭฿|₱₭฿/,
                                 /[1①❶][8⑧❽]-?[2②❷][5⑤❺]/,
                                 /[ÌÍ]\.M\.P/, "[UP] #1",
                                 /㉹/, /ՁЧ➹７|ջЧ➹Դ/,
                                 /〖ƝƁƘ〗|⟦ƝƁƘ⟧/,
                                 /ҚÕŽ/,
                                 /H&&[₭ᛕK]/,
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
             fogOfWar: true,
             hideJoinLeaveMessages: false,
             mapProjection: [-7060, 7060],
             mapSize: 256,
             mySkinUri: "http://89.31.114.117/agar-skins/bread.png",
             mySkinBig: false,
             bakaSkinUri: "http://89.31.114.117/agar-skins/cirno.svg",
             bakaSkinBig: false,
             pelletColor: null,
             virusColor: "rgba(128,128,128,0.6)",
             eatingMassGuide: {
                 smallColors: [null, "#00aa00", "#cc66ff"],
                 bigColors: [null, "#ffbf3d", "#ff3c3c"],
                 width: 0.6,
             },
             bgImage: "http://i.imgur.com/E4u6yMZ.jpg",
             cellOpacity: 0.8,
             viewportBox: {color: "#7f7f7f", width: 10},
             worldBox: {color: "#f44336", width: 90},
             replaceCursor: true,
             stealAnime: false,
            })
    var userConf
    var myName = null
    var hasConnected = false
    var nextMessageId = 0
    var drawPellets = true
    var zc = Boolean(g("ZCOverlay"))

    var defaultName = "Безымянная сырно"
    function g(id) { return document.getElementById(id) }
    function isArray(obj, type) {
        return Object.prototype.toString.call(obj) === '[object Array]'
    }
    function includes(array, value) {
        return array.indexOf(value) !== -1
    }

    function setConf(defaults) {
        function setDefault(record, field, value) {
            if (record[field] === undefined && value !== undefined)
                record[field] = value
        }
        setDefault(window, 'bakaconf', {})
        userConf = JSON.parse(JSON.stringify(window.bakaconf))
        for (var i in defaults)
            if (i !== 'teams')
                setDefault(window.bakaconf, i, defaults[i])
        setDefault(window.bakaconf, 'teams', {})
        for (var i in defaults.teams)
            setDefault(window.bakaconf.teams, i, defaults.teams[i])
    }

    function join(l) {
        if (!(l instanceof Array))
            l = Array.from(l)
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
        var h = pad(t.getUTCHours())
        var m = pad(t.getUTCMinutes())
        var s = pad(t.getUTCSeconds())
        switch(window.bakaconf.timeFormat) {
        case 0: return `${h}:${m}:${s} `
        case 1: return `${h}:${m} `
        case 2: return ``
        }
    }

    var storage = {
        get(key) {
            if (typeof GM_getValue === 'function')
                return GM_getValue(key, null)
            else
                return localStorage.getItem(key)
        },
        set(key, value) {
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
        oldTitle: null,
        init() {
            var el = document.createElement('div')
            el.id = "notification"
            document.body.appendChild(el)
            el.onclick = () => chat.toggle(true)
            this.cache()
            window.addEventListener("focus",
                                    () => { chat.hidden || this.clear() })
        },
        cache() {
            var list = window.bakaconf.soundList.join("\n")
            if (list === this.list)
                return
            this.list = list
            console.log("Update!")
            this.cached = window.bakaconf.soundList.map(x => new Audio(x))
        },
        clear() {
            this.unreadCount = 0
            g("notification").style.visibility = 'hidden'
            if (this.oldTitle !== null) {
                document.title = this.oldTitle
                this.oldTitle = null
            }
        },
        notify(what) {
            if (document.hidden || chat.hidden) {
                this.unreadCount++
                if (this.oldTitle === null)
                    this.oldTitle = document.title
                document.title = `[${this.unreadCount}] ${this.oldTitle}`
            }
            if (chat.hidden) {
                g("notification").style.visibility = ''
                g("notification").textContent = this.unreadCount
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
        usersCount: 0,
        init() {
            var cbox = document.createElement('div')
            cbox.id = 'cbox'
            cbox.innerHTML = `
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td colspan="2"><div id="msgsbox"></div></td>
                  </tr>
                  <tr height="0">
                    <td width="100%">
                      <form id="form"><input id="carea" autocomplete="off"></form>
                    </td>
                    <td id="chat_users"></td>
                  </tr>
                  <tr>
                    <td colspan="2">
                      <div id="baka-connector" style="display:none"></div>
                    </td>
                  </tr>
                </table>
                `
            document.body.appendChild(cbox)

            g("chat_users").onclick = () => send({t:'names'})
            g('form').onsubmit = submit
            g('carea').onfocus = () => {
                this.active = true
                cbox.style.opacity = '1'
            }
            g('carea').onblur = () => {
                this.active = false
                cbox.style.opacity = '0.7'
            }
            g('carea').onkeydown = (e) => {
                switch (e.keyCode) {
                case 38: return submitHistory.up(), false
                case 40: return submitHistory.down(), false
                }
            }
        },
        move() {
            toggleAttribute(g('cbox'), 'data-alt-position')
            toggleAttribute(g('baka-labels'), 'data-alt-position')
        },
        toggle(show) {
            this.hidden = show === undefined ? !this.hidden : !show
            g('cbox').style.visibility = (this.hidden ? 'hidden' : '')
            notificator.clear()
        },
        focus() {
            this.toggle(true)
            document.getElementById('carea').focus()
        },
        blur() { g('carea').blur() },
        clickName(e) {
            e = e || window.event; e = e.target || e.srcElement
            var ca = document.getElementById('carea')
            ca.value = `${e.textContent}: ${ca.value}`
            this.focus()
        },
        setUsersCount(add, value) {
            if (add)
                this.usersCount += value
            else
                this.usersCount = value
            g("chat_users").textContent =
                this.usersCount >= 0 ? this.usersCount : "#"
        },
    }

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
        var welcomed = false
        ws.binaryType = "arraybuffer"
        ws.onopen = (evt) => {
            mapSender.reset()
            send({t: "version", version: version,
                  expose: (window.agar===undefined?0:1) })
            var auth_token = storage.get('auth_token')
            if (auth_token !== null)
                send({t:"auth", token:auth_token})
            if (myName !== null)
                send({t: "name", "name": myName})
            send({t:"messages", startingFromId: nextMessageId})
            send({t:"names"})
        }
        ws.onclose = (evt) => {
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
                addLine({message:[
                    "Вебсокет закрыт. ",
                    aButton("переподключиться к вебсокету", reconnectButton)]})
            }
            notificator.notfy('system')
        }
        ws.onerror = (evt) => {
            if (closed) return
            console.log(evt)
            addLine({message:"Ошибка вебсокета"})
        }
        ws.reconnect = () => {
            reconnect = true
            ws.close()
            setTimeout(() => {
                if (closed) return
                closed = true
                addLine({message:['Переподключаюсь~~']})
                connectChat()
            }, 1000)
        }
        ws.onmessage = (evt) => {
            hasConnected = true
            if (closed) return
            if (evt.data instanceof window.ArrayBuffer)
                onmessage_binary(new DataView(evt.data))
            else
                onmessage_json(JSON.parse(evt.data))
        }
        function onmessage_json(d) {
            var sender = {i:d.i, name:d.f, premium:d.premium, mode:"message"}
            function notify(what) {
                if (myId !== d.i && welcomed)
                    notificator.notify(what)
            }
            if (d.I !== undefined)
                nextMessageId = d.I + 1
            switch(d.t) {
            case "names":
                var namesList = d.names
                    .filter(n => n.name !== "")
                    .map(aName)
                var nonameCount = d.names.length - namesList.length
                if (nonameCount === 0) {/* do nothing */}
                else if (nonameCount === 1)
                    namesList.push("одна безымянная сырно" +
                                   (myName === ""?" (это ты)":""))
                else
                    namesList.push(nonameCount + " безымянных сырно" +
                                   (myName === ""?" (включая тебя)":""))
                var chatmsg = ["В чате ", ...join(namesList), "."];
                addLine({time:d.T,
                         message:chatmsg})
                chat.setUsersCount(false, d.names.length)
                break
            case "message":
                var tokens = d.text.trim().split(/ +/)
                if (tokens[0] === "/me") {
                    d.text = tokens.slice(1).join(" ")
                    sender.mode = "me"
                }
                addLine({time:d.T, sender:sender,
                         message:formatMessage(d.text)})
                notify("chat")
                break
            case "quick":
                addLine({time: d.T,
                         sender: sender,
                         message: d.symbol === undefined
                         ? `[${d.text}]`
                         : `[${d.symbol}:${d.text}]`})
                notify("quick")
                if (d.cells !== undefined)
                    map.blink(d.cells, d.symbol)
                break
            case "name":
                var oldName = aName(sender)
                sender.name = d.name
                sender.mode = "none"
                addLine({time: d.T,
                         sender: sender,
                         message: [oldName, " теперь ", aName(sender), "."]})
                break
            case "map":
                map.update(d.data, d.range)
                break
            case "map-reset":
                mapSender.reset()
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
                welcomed = true
                if (d.i !== undefined)
                    myId = d.i
                break
            case "ping":
                d.t = 'pong'
                send(d)
                break
            case "addr":
                var connect = ""
                showAddr({time:d.T, sender:sender}, d)
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
            function getUint8  () { return d.getUint8  ((c += 1) - 1) }
            function getUint16 () { return d.getUint16 ((c += 2) - 2) }
            function getUint32 () { return d.getUint32 ((c += 4) - 4) }
            function getFloat32() { return d.getFloat32((c += 4) - 4) }
            function getString() {
                var result = "", x = getUint16()
                while (x !== 0) {
                    result += String.fromCharCode(x)
                    x = getUint16()
                }
                return result
            }
            function getColor() {
                var col = getUint8()<<16 | getUint8()<<8 | getUint8()
                col = col.toString(16)
                while (col.length < 6)
                    col = "0" + col
                return "#" + col
            }
            var data_size = getUint32()
            var data = []
            for (var i = 0; i < data_size; i++) {
                var cell = {}
                cell.i = getUint32()
                cell.s = getUint32()
                cell.x = getFloat32()
                cell.y = getFloat32()
                cell.c = getColor()
                cell.n = getString()
                var flags = getUint8()
                cell.v = (flags & 1) !== 0
                cell.a = (flags & 2) !== 0
                data.push(cell)
            }
            var range_size = getUint32()
            var range = []
            for (var i = 0; i < range_size; i++) {
                var r = {}
                r.minX = getFloat32()
                r.minY = getFloat32()
                r.maxX = getFloat32()
                r.maxY = getFloat32()
                range.push(r)
            }
            map.update(data, range)
            var aliveBakas = getUint8()
            var totalBakas = getUint8()
            if (totalBakas > 2)
                labels.set('bakas', `${aliveBakas}/${totalBakas}`)
            else
                labels.set('bakas')
        }
        websocket = ws
    }

    function toggleCanvas() {
        if (window.agar === undefined ||
            window.agar.disableRendering === undefined)
            return console.error("Could not find window.agar.disableRendering")
        if (window.agar.disableRendering = !window.agar.disableRendering) {
            document.body.setAttribute("baka-off", true)
            fpsMeter.disable()
        } else
            document.body.removeAttribute("baka-off")
    }

    function topScreenshot() {
        var canvas = document.getElementById("canvas")
        var data = canvas.getContext('2d')
                .getImageData(canvas.width-220, 0, 220, 320)

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

    function spinner() {
        var span = document.createElement('span')
        span.className = 'baka-spinner'
        span.textContent = '☯'
        return span
    }

    function addLine(p) {
        var d = document.createElement('div')
        d.className = 'baka-line'

        if (p.time !== undefined) {
            var time = document.createElement('span')
            time.className = "time"
            time.textContent = formatTime(p.time)
            d.appendChild(time)
        }

        if (p.sender !== undefined) {
            switch (p.sender.mode) {
            case "message":
                d.appendChild(aName(p.sender))
                d.appendChild(document.createTextNode(": "))
                break
            case "me":
                d.appendChild(document.createTextNode("•"))
                d.appendChild(aName(p.sender))
                d.appendChild(document.createTextNode(" "))
            }
            d.setAttribute("bakaid", p.sender.i)
        }

        if (p.message !== undefined) {
            if (typeof p.message === "string")
                p.message = [p.message]
            var message = document.createElement('span')
            p.message.forEach(i => {
                if (!(i instanceof Node))
                    i = document.createTextNode(i)
                message.appendChild(i)
            })
            message.className =
                (p.message.greentext ? " greentext" : "") +
                (p.message.higlight ? " higlight" : "")
            d.appendChild(message)
        }

        var msgbox = document.getElementById('msgsbox')
        var scroll = 0 ===
                msgbox.scrollTop + msgbox.offsetHeight - msgbox.scrollHeight
        msgbox.appendChild(d)
        if (scroll)
            msgbox.lastChild.scrollIntoView()
    }

    function send(a) {
        if (websocket.readyState === 1) {
            if (!(a instanceof ArrayBuffer))
                a = JSON.stringify(a)
            websocket.send(a)
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
            return
        var m = {t: "addr", ws:a.ws, top:a.top, game:window.location.hostname}
        if (a.region !== undefined) {
            m.region = a.region
            if (a.region.endsWith(":party"))
                m.token =
                    document.getElementsByClassName("partyToken")[0]
                    .value.replace(/^agar\.io\//, "")
        }
        send(m)
    }

    var fullInfo = {
        region(ws, fun) {
            this._addCallback(data => fun(data.regions[ws]))
        },
        _request() {
            this.req = new XMLHttpRequest()
            this.req.open('GET', 'http://m.agar.io/fullInfo', true)
            this.req.addEventListener('load', load)
            this.req.addEventListener('error', error)
            this.req.send()
            console.log('get')
            this.funs = []

            function load() {
                delete fullInfo.req
                fullInfo.data = {regions:{}}
                try {
                    JSON.parse(this.responseText).servers
                        .forEach(serv =>
                                 fullInfo.data.regions[serv.ip] = serv.region)
                } catch (e) {
                    error(e)
                    return
                }
                runFuns()
            }
            function error(e) {
                delete fullInfo.req
                delete fullInfo.data
                runFuns()
                console.error('fullInfo.startRequest', e)
            }
            function runFuns() {
                fullInfo.funs.forEach(fun => fun(fullInfo.data))
                fullInfo.funs = []
            }
        },
        _addCallback(fun) {
            if (this.req) {
                this.funs.push(fun)
            } else {
                this._request()
                this.funs.push(fun)
            }
        },
    }

    var connector = {
        maxAttempts: 10,
        autoConnectParty(ws, token, region, top) {
            if (!this.checkExpose()) {
                token && joinParty(token)
                return
            }
            this.stop()
            this.attempt = token ? 0 : 1
            this.ws = ws
            this.token = token
            window.setRegion(region.replace(/:.*$/, ""))
            this.region = region
            this.top = top
            this.state = 'connect'
            this.autoConnectIteration()
        },
        autoConnectIteration() {
            var thisMethod = () => this.autoConnectIteration()
            if (this.timer !== undefined)
                delete this.timer
            if (this.state === 'connect') {
                this.status.trying()
                if (this.attempt === 0)
                    window.joinParty(this.token)
                else
                    window.createParty()
                this.state = 'check'
                this.timer = setTimeout(thisMethod, 2500)
            } else {
                var partyState = g('helloContainer')
                        .getAttribute('data-party-state')
                if (partyState === '5' ||
                    partyState === '1' && this.checkConnection()) {
                    this.status.ok()
                } else {
                    if (this.attempt !== this.maxAttempts-1) {
                        this.status.trying()
                        this.attempt++
                        this.state = 'connect'
                        this.timer = setTimeout(thisMethod, 2500)
                    } else {
                        this.status.fail()
                    }
                }
            }
        },
        checkConnection() {
            var top1 = window.agar.top, top2 = this.top
            for (var i = 0; i < top1.length; i++)
                for (var j = 0; j < top2.length; j++)
                    if (top1[i].id === top2[j].id &&
                        top1[i].name === top2[j].name)
                        return true
            return false
        },
        checkExpose() {
            return window.agar !== undefined &&
                window.agar.ws !== undefined &&
                window.agar.region !== undefined &&
                window.agar.top !== undefined
        },
        stop() {
            if (this.timer !== undefined) {
                this.status.stop()
                clearTimeout(this.timer)
                delete this.timer
            }
        },
        status: {
            timer: null,
            init() {
                var t = this
                this._element = g("baka-connector")
                this._estop = aButton("стоп", () => connector.stop())
                this._eclose = aButton("закрыть", this._close.bind(this))
                this._etext = document.createElement('span')

                ;["_etext", "_eclose", "_estop"]
                    .forEach(e => this._element.appendChild(t[e]))
            },
            _close() {
                this._element.style.display = 'none'
            },
            _set(text, stop, autohide) {
                this._element.style.display = ''
                this._etext.textContent = text
                this._estop.style.display = stop ? '' : 'none'
                this._eclose.style.display = stop ? 'none' : ''
                stop_timer.call(this)
                if (autohide)
                    start_timer.call(this)

                function stop_timer() {
                    if (this.timer === null)
                        return
                    window.clearTimeout(this.timer)
                    this.timer = null
                }
                function start_timer() {
                    this.timer = window.setTimeout(this._close.bind(this), 2000)
                }
            },
            trying() {
                var attempt = `[${connector.attempt}/${connector.maxAttempts}] `
                if (connector.state === 'connect') {
                    if (connector.attempt === 0)
                        this._set(`Подключаюсь к ${connector.token}... ${attempt}`, true)
                    else
                        this._set(`Перебираю в ${connector.region}... ${attempt}`, true)
                }
                else if (connector.state === 'check')
                    this._set(`Проверяю... ${attempt}`, true)
            },
            ok() { this._set("Подключился! ", false, true) },
            fail() { this._set("Не удалось подключиться. ", false) },
            stop() { this._set("Подключение прервано. ", false) }
        },
    }

    function joinTop(top) {
        return top.map(x => x.name || "An unnamed cell").join(", ")
    }

    function showAddr(context, addr) {
        var addrElem
        var spinner_ = spinner()
        var region
        if (addr.token) {
            addrElem = aButton(addr.token + ' ', click)
        } else {
            addrElem = document.createElement('span')
            addrElem.textContent = `!brute ${addr.ws} `
        }
        context.message = [
            `${addr.alive}/${addr.players} Топ: ${joinTop(addr.top)}`, br(),
            addrElem, spinner_,
        ]
        addLine(context)
        fullInfo.region(addr.ws.replace(/^wss?:\/\//, ''), update)

        function click() {
            if (region)
                connector.autoConnectParty(addr.ws, addr.token,
                                           region, addr.top)
        }
        function update(region_) {
            spinner_.parentNode.removeChild(spinner_)
            region = region_
            if (region && addrElem.tagName === 'SPAN' &&
                region.endsWith(':party'))
                addrElem.parentNode.replaceChild(aButton(region, click),
                                                 addrElem)
            else
                addrElem.textContent += region || "???"
        }
    }

    function showAddrs(addrs, time) {
        addrs = addrs.filter(x => (x.alive || x.players > 2) && x.ws)
        if (addrs.length === 0)
            return addLine({time:time, message:["Сырны нигде не играют."]})
        addLine({time:time, message:["Сырны играют тут:"]})
        addrs.sort((x, y) => {
            if (x.alive > y.alive) return +1
            if (x.alive < y.alive) return -1
            if (x.players > y.players) return +1
            if (x.players < y.players) return -1
            return 0
        }).forEach(addr => showAddr({}, addr))
    }

    var submitHistory = {
        list: [],
        idx: -1,
        text: "",
        up() {
            if (this.list.length === 0)
                return
            if (this.idx === -1) {
                this.text = g('carea').value
                g('carea').value = this.list[this.idx = this.list.length-1]
            } else if (this.idx !== 0)
                g('carea').value = this.list[--this.idx]
        },
        down() {
            if (this.list.length === 0)
                return
            if (this.idx === this.list.length-1) {
                this.idx = -1
                g('carea').value = this.text
            } else if (this.idx !== -1)
               g('carea').value = this.list[++this.idx]
        },
        push(t) {
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
            if (tokens[0][0] === "/" && tokens[0] != "/me") {
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
                    var chatmsg = ["Список игнорирования: ", ...join(ignore.list)];
                    addLine({message: chatmsg});
                    break
                case "/auth":
                    if (tokens[1] !== undefined) {
                        storage.set("auth_token", tokens[1])
                        send({t:"auth", token:tokens[1]})
                    }
                    break
                default:
                    ["Команды чата:",
                     "/names — получить список сырн в чате",
                     "/addr [регион] — отправить текущий севрер и топ (требуется expose)",
                     "/addrs — получить список комнат, на которых играют сырны",
                     "/reconnect — переподключиться к чатсерверу",
                     "/ignore [действия] — работа со списком игнорирования. " +
                     "Пример: `/ignore +1 +3 -2` — добавить 1 и 3 в список и убрать 2 из списка",
                     "/auth — авторизация",
                     "/me — отправить сообщение от третьего лица",
                    ].forEach(line => addLine({message:line}))
                }
            } else {
                sendName()
                send({t: "message", text: ca.value})
            }
            submitHistory.push(ca.value)
            ca.value = ""
            var myCells = agar.myCells()
            if (myCells === undefined || myCells.length !== 0)
                ca.blur()
        }
        return false
    }

    function codeWorkaround(e) {
        // As of September 2015, `KeyboardEvent.code` is supported
        // only in Firefox.
        if (e.code !== undefined)
            return
        var k = e.keyCode
        if (k >= 65 && k <= 90)
            return e.code = `Key${String.fromCharCode(k)}`, undefined
        if (k >= 48 && k <= 57)
            return e.code = `Digit${k-48}`, undefined
        e.code = {
            "9": "Tab",
            "13": "Enter",
            "27": "Escape",
            "188": "Comma",
            "190": "Period",
            "191": "Slash",
            "192": "Backquote",
            "220": "Backslash",
        }[e.keyCode]
    }

    function handleEvents() {
        // Original key event handlers
        var olddown = window.onkeydown, oldup = window.onkeyup
        var fakeKeyEvent = {
            esc() { this._(27) },
            space() { this._(32) },
            q() { this._(81) },
            w() { this._(87) },
            _(keyCode) {
                var e = {keyCode,
                         target: canvas.element,
                         preventDefault: () => undefined}
                olddown(e)
                oldup(e)
            },
        }

        // Autofire
        var repeat = 0, repeatm = 0
        setInterval(() => {
            if (!repeat && !repeatm) return
            if (!isHovered()) return repeat = repeatm = false
            fakeKeyEvent.w()
        }, 50)

        // Keyboard controls
        var extended = false
        window.onkeydown = (e) => {
            codeWorkaround(e)
            var nonText = /^(F[0-9]+)$/.test(e.code)

            if (extended) {
                if (quick.key(e) === false)
                    extended = false
                return false
            }

            if (chat.active) {
                if (e.code === "Escape" || e.code === "Tab")
                    return chat.blur(), false
                else if (!nonText)
                    return true
            }

            if (e.ctrlKey && e.code === "KeyS") {
                downloadTopScreenshot()
                return false
            }

            var active = document.activeElement
            if (includes(["INPUT", "BUTTON", "SELECT"], active.tagName) &&
                !nonText &&
                active.offsetParent !== null)
                return olddown(e)

            if (!e.altKey && !e.ctrlKey && !e.metaKey) {
                if (e.code === "KeyW") {
                    if (e.shiftKey)
                        return fakeKeyEvent.w()
                    else
                        return repeat = 1, false
                }
                if (keys.key(e))
                    return false
                if (quick.key(e))
                    return extended = true, false
            }
            return olddown(e)
        }
        window.onkeyup = (e) => {
            codeWorkaround(e)
            if (e.code == "KeyW")
                repeat = 0
            return oldup(e)
        }

        // Mouse controls
        function onMouseDown(e) {
            if (e.which === 2 && window.agar && window.agar.scale !== undefined)
                return window.agar.scale = 1, false
            if (!window.bakaconf.mouseControls)
                return true
            switch (e.which) {
            case 1: return repeatm = true, false
            case 3: return fakeKeyEvent.space(), false
            }
        }
        function onMouseUp(e) {
            if (e.which === 1) repeatm = false
        }
        ;["canvas", "map", "baka-labels"]
            .forEach(id => {
                g(id).onmousedown = onMouseDown
                g(id).oncontextmenu = (e) => !window.bakaconf.mouseControls
            })
        ;["canvas", "map", "notification", "cbox", "baka-labels"]
            .forEach(id => g(id).onmouseup = onMouseUp)

        // Mouse controls: hover tracker
        var hovered = {}
        function isHovered() {
            for (var i in hovered) if (hovered[i]) return true
            return false
        }
        function track(id) {
            function set(k, v) { hovered[k] = v }
            g(id).addEventListener("mouseenter", () => set(id, true))
            g(id).addEventListener("mousemove",  () => set(id, true))
            g(id).addEventListener("mouseleave", () => set(id, false))
        }
        var elements = ["canvas", "map", "cbox", "notification", "baka-labels"]
        elements.forEach(track)

        // Make baka UI mouse-transparent
        elements.forEach(id => g(id).onmousemove = g("canvas").onmousemove)
        ;["canvas", "map", "notification", "baka-labels"]
            .forEach(id => {
                if (window.agar && window.agar.dommousescroll)
                    g(id).addEventListener('DOMMouseScroll',
                                           window.agar.dommousescroll, false)
                else
                    g(id).onmousewheel = document.body.onmousewheel
            })
        if (window.agar && window.agar.dommousescroll)
            document.removeEventListener('DOMMouseScroll',
                                         window.agar.dommousescroll, false)
        else
            document.body.onmousewheel = null

        // Safety belt
        window.onbeforeunload = safetyBelt
        function safetyBelt(e) {
            if (!e) e = window.event
            e.returnValue = 'Выйти из agar.io?'
            if (e.stopPropagation) {
                e.stopPropagation()
                e.preventDefault()
            }
        }
    }

    function handleOptions() {
        var oldSetNick = window.setNick
        window.setNick = (n) => {
            if (n !== myName) {
                myName = n
                send({t: "name", "name": myName})
            }
            oldSetNick(n)
        }
        var oldSetDarkTheme = window.setDarkTheme
        window.setDarkTheme = (n) => {
            canvas.dark = n
            oldSetDarkTheme(n)
        }
        if (document
            .querySelector('label input[onchange*=setDarkTheme]').checked)
            bakaDarkTheme(true)
    }

    var agar = {
        init() {
            var a = window.agar
            if (a === undefined)
                return
            if (a.minScale !== undefined)
                a.minScale = 1/32
            if (a.simpleCellDraw !== undefined)
                a.simpleCellDraw = true
            if (a.showStartupBg !== undefined)
                a.showStartupBg = false
        },
        getViewport() {
            var v = window.agar.rawViewport
            if (v) {
                var dx = 1024 / v.scale, dy = 600 / v.scale
                return {minX:v.x-dx, minY:v.y-dy, maxX:v.x+dx, maxY:v.y+dy}
            }
        },
        myCells() {
            var a = window.agar
            if (a === undefined || a.myCells === undefined ||
                a.allCells === undefined)
                return
            return a.myCells.filter(x => x in a.allCells)
        },
        cellIsMy(cell) {
            if (cell.baka_isMy === undefined)
                cell.baka_isMy = includes(window.agar.myCells, cell.id)
            return cell.baka_isMy
        },
    }

    var map = {
        canvas: null,
        data: [],
        range: [],
        blackRibbon: true,
        hidden: false,
        blinks: {},
        blinkIdsCounter: 0,
        init() {
            this.canvas = document.createElement("canvas")
            this.canvas.id = "map"

            document.body.appendChild(this.canvas)
            this.canvas.onclick =
                () => { this.blackRibbon = false; this.draw() }
            this.draw()
        },
        toggle() {
            this.hidden = !this.hidden
            g('map').style.visibility = (this.hidden ? 'hidden' : '')
        },
        move() { toggleAttribute(this.canvas, 'data-alt-position') },
        update(data, range) {
            mapSender.waitReply = false
            this.data = data
            this.range = range
            bakaSkin.updateIds(data)
            this.draw()
        },
        blink(ids, sym) {
            var c = this.blinkIdsCounter++
            var iteration = 12
            var blink = this.blinks[c] = {ids:ids, sym:sym, hl:false}
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
        draw() {
            if (this.hidden)
                return
            var size = this.canvas.width = this.canvas.height =
                    window.bakaconf.mapSize
            var context = this.canvas.getContext('2d')
            var myCells = agar.myCells() || []
            var teams = window.bakaconf.teams
            var idx = {}
            function getAura(cell) {
                if (includes(myCells, cell.i))
                    return window.bakaconf.myAura
                if (cell.a)
                    return window.bakaconf.bakaAura
                if (window.bakaconf.showOnlyBakaAura)
                    return
                for (var i in teams) {
                    var names = teams[i].names
                    if (!isArray(names))
                        names = [names]
                    for (var j = 0; j < names.length; j++)
                        if (names[j] === cell.n ||
                            (names[j].test && names[j].test(cell.n)))
                            return teams[i].aura || window.bakaconf.defaultTeamAura
                }
            }

            context.clearRect(0, 0, this.canvas.width, this.canvas.height)
            var proj = window.bakaconf.mapProjection
            if ((window.agar||{}).dimensions)
                proj = [window.agar.dimensions[0], window.agar.dimensions[2]]
            proj = [proj[0], size/(proj[1]-proj[0])]
            function t(v) { return (v-proj[0])*proj[1] } // shift+scale
            function s(v) { return v * proj[1] }         // scale
            var i

            if (window.bakaconf.fogOfWar) {
                context.globalAlpha = 0.3
                context.fillStyle = "#000"
                context.fillRect(0, 0, this.canvas.width, this.canvas.height)
                context.globalAlpha = 0.7
                context.fillStyle = "#777"
                context.beginPath()
                for (i = 0; i < this.range.length; i++) {
                    var d = this.range[i]
                    context.rect(t(d.minX), t(d.minY),
                                 s(d.maxX-d.minX),
                                 s(d.maxY-d.minY))
                }
                context.fill()
            } else {
                context.globalAlpha = 0.5
                context.fillStyle = "#777"
                context.fillRect(0, 0, this.canvas.width, this.canvas.height)
            }

            if (this.blackRibbon) {
                context.beginPath()
                context.lineWidth = size/8
                context.strokeStyle = "#000"
                context.beginPath();
                context.moveTo(size/2, size*9/8);
                context.lineTo(size*9/8, size/2);
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
    }

    var mapSender = {
        waitReply: false,
        buffer: new ArrayBuffer(1024),
        init() {
            this.reset()
            setInterval(() => this.send(), 250)
        },
        reset() {
            this.waitReply = false
            this.sent = {}
            this.sent.topNames = new Map
            if (window.agar && window.agar.allCells)
                for (var id in window.agar.allCells)
                    window.agar.allCells[id].baka_old = undefined
        },
        send() {
            var a = window.agar
            var myCells = agar.myCells()
            if (!checkExpose()) {
                if (!map.hidden)
                    send({t:'map', reply:1})
                return
            }
            if (!a.top.length)
                return

            var offset = 0
            var d = new DataView(this.buffer)
            var reply = !map.hidden && !this.waitReply
            putAll()
            var sent = send(truncateBuffer())
            if (sent && reply)
                this.waitReply = true
            if (!sent)
                this.reset()
            map.blackRibbon = false

            function checkExpose() {
                return a !== undefined &&
                    a.allCells !== undefined &&
                    myCells !== undefined &&
                    a.top !== undefined &&
                    a.ws
            }

            function putAll() {
                var flagsOffset = reserve(1)
                var flags
                flags |= !mapSender.waitReply << 0
                flags |= !map.hidden << 1
                flags |= putGame() << 2
                flags |= putTop() << 3
                putAllCells()
                putViewport()
                d.setUint8(flagsOffset, flags)
            }

            function putGame() {
                var s = mapSender.sent
                if (s.ws === a.ws && s.hostname === window.location.hostname)
                    return false
                putString(s.ws = a.ws)
                putString(s.hostname = window.location.hostname)
                return true
            }

            function putTop() {
                if (topsIsSame(a.top, mapSender.sent.top, false))
                    return false

                var infoOffset = reserve(2)
                var info = a.top.length
                var shift = 4

                var sentTopNames = new Map
                for (var e of a.top) {
                    putUint32(e.id)
                    if (mapSender.sent.topNames.get(e.id) !== e.name) {
                        putString(e.name)
                        info |= 1 << shift
                    }
                    shift++
                    sentTopNames.set(e.id, e.name)

                }
                d.setUint16(infoOffset, info)
                mapSender.sent.topNames = sentTopNames
                mapSender.sent.top = a.top
                return true
            }

            function topsIsSame(a, b) {
                if (a === b)
                    return true
                if (!a || !b || a.length != b.length)
                    return false
                for (var i = 0; i < a.length; i++)
                    if (a[i].id !== b[i].id || a[i].name !== b[i].name)
                        return false
                return true
            }

            function putAllCells() {
                var prevId = 0
                var ids = Object.keys(a.allCells).map(x=>+x).sort((x,y) => x-y)
                for (var id of ids) {
                    var cell = a.allCells[id]
                    agar.cellIsMy(cell)
                    if (cell.size < 32 && !cell.baka_isMy)
                        continue

                    var flagsOffset = reserve(1)
                    var flags = 1
                    flags |= cell.isVirus << 1
                    flags |= cell.baka_isMy << 2

                    putUint(id - prevId)
                    prevId = id

                    var p = window.agar.cellProp
                    var old = cell.baka_old
                    if (typeof old === 'undefined')
                        old = cell.baka_old = {}
                    if (old.s !== cell[p.nSize]) {
                        putUint16(old.s = cell[p.nSize])
                        flags |= 1 << 3
                    }
                    if (old.x !== cell[p.nx] || old.y !== cell[p.ny]) {
                        putInt16(old.x = cell[p.nx])
                        putInt16(old.y = cell[p.ny])
                        flags |= 1 << 4
                    }
                    if (old.n !== cell.name || old.c !== cell.color) {
                        putColor(old.c = cell.color)
                        putString(old.n = cell.name)
                        flags |= 1 << 5
                    }

                    d.setUint8(flagsOffset, flags)
                }
                putUint8(0)
            }

            function putColor(value) {
                putUint8(parseInt(value.substr(1, 2), 16))
                putUint8(parseInt(value.substr(3, 2), 16))
                putUint8(parseInt(value.substr(5, 2), 16))
            }

            function putViewport() {
                var viewport = agar.getViewport()
                putFloat32(viewport.minX)
                putFloat32(viewport.minY)
                putFloat32(viewport.maxX)
                putFloat32(viewport.maxY)
            }

            function putUint8  (value) { d.setUint8  (reserve(1), value) }
            function putUint16 (value) { d.setUint16 (reserve(2), value) }
            function putUint32 (value) { d.setUint32 (reserve(4), value) }
            function putInt16  (value) { d.setInt16  (reserve(2), value) }
            function putFloat32(value) { d.setFloat32(reserve(4), value) }

            function putString (str) {
                var offset = reserve(str.length*2 + 2)
                for (var i = 0; i <= str.length; i++)
                    d.setUint16(offset + i*2, str.charCodeAt(i) || 0)
            }

            function putUint(value) {
                do {
                    var v = 0x7f & value
                    var hasNext = (value ^ v) !== 0
                    putUint8(v | hasNext << 7)
                    value >>= 7
                } while (value)
            }

            function reserve(count) {
                if (offset + count + 4 > mapSender.buffer.byteLength)
                    enlargeBuffer()
                offset += count
                return offset - count
            }

            function enlargeBuffer() {
                var newBuf = new ArrayBuffer(mapSender.buffer.byteLength*2)
                copyBufferInto(newBuf)
                d = new DataView(mapSender.buffer = newBuf)
            }

            function truncateBuffer() {
                var result = new ArrayBuffer(offset)
                copyBufferInto(result)
                return result
            }

            function copyBufferInto(to) {
                var from = new Uint8Array(mapSender.buffer, 0, offset)
                to = new Uint8Array(to)
                to.set(from)
            }
        },
    }

    var bakaSkin = {
        cached: {my:null, baka:null},
        byAttr: new Map(),
        init() {
            if (!window.agar)
                return
            this.image('my')
            this.image('baka')
        },
        updateIds(mapCells) {
            if (!window.agar || !window.agar.allCells)
                return
            this.byAttr.clear()
            mapCells.forEach(c => {
                if (!c.a)
                    return
                var o = window.agar.allCells[c.i]
                if (o)
                    o.baka_isBaka = true
                if (c.n !== "")
                    this.byAttr.set(c.c + c.n, c.a)
            })
        },
        image(id) {
            var uri = window.bakaconf[id + 'SkinUri']
            if (!uri)
                return this.cached[id] = null
            if (this.cached[id] !== null && this.cached[id].src === uri) {
                this.cached[id].big = window.bakaconf[id + 'SkinBig']
                return this.cached[id]
            }
            this.cached[id] = new Image()
            if (!(/^\s*data\s*:/i).test(uri))
                this.cached[id].crossOrigin = 'anonymous'
            this.cached[id].src = uri
            this.cached[id].big = window.bakaconf[id + 'SkinBig']
            return this.cached[id]
        },
        handleCell(cell) {
            if (cell.baka_isBaka === undefined)
                cell.baka_isBaka = !!this.byAttr.get(cell.color + cell.name)
            agar.cellIsMy(cell)
            cell.baka_skin =
                cell.baka_isMy ? this.image('my') :
                cell.baka_isBaka ? this.image('baka') :
                undefined
            cell.baka_color =
                cell.size < 20 ? window.bakaconf.pelletColor :
                cell.isVirus ? window.bakaconf.virusColor :
                undefined
        },
    }

    var canvas = {
        transform: {scale:1, x:0, y:0},
        dark: false,
        init() {
            this.element = g('canvas')
            this.ctx = g('canvas').getContext('2d')
        },
        drawRectangle(dim, color, width) {
            this.ctx.beginPath()
            this.ctx.strokeStyle = color
            this.ctx.lineWidth = width
            this.ctx.strokeRect(dim.minX - width/2,
                                dim.minY - width/2,
                                dim.maxX - dim.minX + width,
                                dim.maxY - dim.minY + width)
        },
        toWorldCoords(pixelCoords) {
            var x = (pixelCoords.x - this.transform.x) / this.transform.scale
            var y = (pixelCoords.y - this.transform.y) / this.transform.scale
            return {x, y}
        }
    }

    var hooks = {
        init() {
            if (!window.agar || !window.agar.hooks)
                return
            var prefix = "hook_"
            Object.keys(this)
                .filter(name => name.startsWith(prefix))
                .forEach(name =>
                         window.agar.hooks[name.substr(prefix.length)] =
                         this[name].bind(this))
        },
        hook_cellSkin(cell, prev) {
            return cell.baka_skin || prev
        },
        hook_cellColor(cell) {
            if (cell.size >= 32)
                canvas.ctx.globalAlpha = window.bakaconf.cellOpacity
            bakaSkin.handleCell(cell)
            return cell.baka_color
        },
        hook_beforeTransform(ctx, t1x, t1y, s, t2x, t2y) {
            fpsMeter.tick()
            canvas.transform = {scale:s, x:t2x*s + t1x, y:t2y*s + t1y}
            if (zc)
                return
            bgImage.draw.apply(bgImage, arguments)
        },
        hook_beforeDraw() {
            if (zc)
                return
            var dims, box
            if (window.bakaconf.drawViewport && (box = window.bakaconf.viewportBox) &&
                (dims = agar.getViewport()))
                canvas.drawRectangle(dims, box.color, box.width)
            if ((box = window.bakaconf.worldBox) &&
                (dims = window.agar.dimensions)) {
                dims = {minX:dims[0], minY:dims[1], maxX:dims[2], maxY:dims[3]}
                canvas.drawRectangle(dims, box.color, box.width)
            }
            activeCell.calculate()
            eatingDistanceGuide.calculate()
            mouseLines.draw()
        },
        hook_afterCellStroke(cell) {
            if (zc || cell.size < 32)
                return
            eatingMassGuide.draw(canvas.ctx, cell)
            activeCell.draw(canvas.ctx, cell)
            eatingDistanceGuide.draw(canvas.ctx, cell)
        },
        hook_skipCellDraw(cell) {
            return !drawPellets &&
                (cell.size < 37 || cell.name !== '' && cell.size < 43)
        },
        hook_drawCellMass(cell, prev) {
            if (cell.isVirus)
                return true
            if (cell.size < 32)
                return false
            var fontSize = Math.max(~~(.3 * cell.size), 24) *
                window.agar.drawScale
            return fontSize > 10.5
        },
        hook_cellMassText(cell, mass) {
            return cell.isVirus
                ? shotsNeeded()
                : `${mass}${shotsAvailable()}${percent()}`

            function shotsAvailable() {
                if (!includes(window.agar.myCells, cell.id))
                    return ""
                var count = ~~((mass-17)/18)
                if (count > 7*3)
                    return ""
                return ` (${count})`
            }
            function shotsNeeded() {
                return Math.floor((149-cell.size)/7)
            }
            function percent() {
                if (activeCell.cell === null)
                    return ""
                var proportions = cell.size / activeCell.cell.size
                var pct = ~~(100*proportions*proportions)
                return ` ${pct}%`
            }
        },
        hook_cellMassTextScale(cell, scale) {
            return cell.isVirus
                ? 100
                : scale * 1.5
        },
        hook_drawScore(mass) {
            massMeter.update(mass)
            return true
        },
    }

    var bgImage = {
        init() {
            this.img = new Image()
            this.img.crossOrigin = 'anonymous'
        },
        draw(ctx, t1x, t1y, s, t2x, t2y) {
            if (!window.bakaconf.bgImage)
                return
            if (this.img.src !== window.bakaconf.bgImage)
                this.img.src = window.bakaconf.bgImage
            if (!this.img.complete || !this.img.naturalWidth)
                return

            var bgDims = fitDimensions(this.img, ctx.canvas)

            ctx.save()
            clip()
            ctx.drawImage(this.img, ...bgDims)
            ctx.restore()

            function fitDimensions(bounds, d) {
                var useWidth = bounds.width * d.height < bounds.height * d.width
                var width = useWidth
                        ? d.width
                        : bounds.width * d.height / bounds.height
                var height = !useWidth
                        ? d.height
                        : bounds.height * d.width / bounds.width

                return [(d.width - width) / 2,
                        (d.height - height) / 2,
                        width, height]
            }
            function clip() {
                var gameDims = getGameDims()
                ctx.beginPath()
                rect(gameDims)
                if (!map.hidden) {
                    var mapDims = getMapDims()
                    rect(mapDims)
                    rectIntersection(gameDims, mapDims)
                }
                ctx.rect(...bgDims)
                ctx.clip("evenodd")
            }
            function rectIntersection(a, b) {
                var r = [Math.max(a[0], b[0]), Math.max(a[1], b[1]),
                         Math.min(a[2], b[2]), Math.min(a[3], b[3])]
                if (r[0] < r[2] && r[1] < r[3])
                    rect(r)
            }
            function getMapDims() {
                var d = map.canvas.getBoundingClientRect()
                return [d.left, d.top, d.right, d.bottom]
            }
            function getGameDims() {
                var d = window.agar.dimensions
                return [(d[0]+t2x)*s+t1x, (d[1]+t2y)*s+t1y,
                        (d[2]+t2x)*s+t1x, (d[3]+t2y)*s+t1y]
            }
            function rect(d) {
                ctx.rect(d[0], d[1], d[2]-d[0], d[3]-d[1])
            }
        },
    }

    var activeCell = {
        cell: null,
        drawEnabled: true,
        splitGuideEnabled: true,
        activate(num) {
            var cells = agar.myCells()
                    .map(id => window.agar.allCells[id])
                    .sort((x,y) => y.size - x.size)
            if (num === undefined) {
                num = cells.indexOf(this.cell)
                num = num === -1 ? 0 : (num+1) % cells.length
            }
            this.cell =
                cells.length === 0 ?
                null :
                cells[Math.min(num, cells.length-1)]
        },
        calculate() {
            if (!this.cell || !window.agar.allCells[this.cell.id])
                this.activate(0)
        },
        toggleDraw() { this.drawEnabled = !this.drawEnabled },
        toggleSplitGuide() { this.splitGuideEnabled = !this.splitGuideEnabled },
        draw(ctx, cell) {
            if (this.cell !== cell)
                return
            var scale = window.agar.drawScale
            if (this.drawEnabled)
                drawAura('#3371FF', 5/scale, cell.size + 10 + 10/scale)
            if (this.splitGuideEnabled) {
                drawAura('#00FF00', 2, 660)
                drawAura('#FF0000', 2, 660 + cell.size)
            }

            function drawAura(color, width, radius) {
                ctx.strokeStyle = color
                ctx.lineWidth = width
                ctx.beginPath()
                ctx.arc(cell.x, cell.y, radius, 0, 2*Math.PI)
                ctx.stroke()
            }
        },
    }

    var eatingMassGuide = {
        enabled: true,
        splitCount(cellA, cellB) {
            var coef = 3/4
            var k = coef * (cellA.size*cellA.size)/(cellB.size*cellB.size)
            var raw = Math.log2(k)+1
            var count = Math.floor(raw)
            var progress = k / Math.pow(2,count-1) - 1
            return {count, progress}
        },
        toggle() { this.enabled = !this.enabled },
        draw(ctx, cell) {
            if (!this.enabled
                || activeCell.cell === null
                || ~window.agar.myCells.indexOf(cell.id))
                return

            var conf = window.bakaconf.eatingMassGuide
            var scale = conf.width / window.agar.drawScale

            var splits, colors
            if (activeCell.cell.size > cell.size || cell.isVirus) {
                splits = this.splitCount(activeCell.cell, cell)
                colors = conf.smallColors
            } else {
                splits = this.splitCount(cell, activeCell.cell)
                colors = conf.bigColors
            }
            var color = colors[splits.count], colorNext = colors[splits.count+1]

            if (!colorNext)
                ctx.globalAlpha = 1 - splits.progress/2

            if (color) {
                ctx.lineWidth = 10 * scale
                ctx.strokeStyle = color

                ctx.beginPath()
                ctx.arc(cell.x, cell.y,
                        cell.size + 10 + 10*scale,
                        0, 2*Math.PI)
                ctx.stroke()
            }

            if (colorNext || color) {
                var angle = Math.atan2(cell.y - activeCell.cell.y,
                                       cell.x - activeCell.cell.x)
                var angleW = Math.PI * splits.progress

                ctx.lineWidth = 3 * scale
                ctx.setLineDash([ctx.lineWidth, ctx.lineWidth])
                ctx.strokeStyle = colorNext || color

                ctx.beginPath()
                ctx.arc(cell.x, cell.y,
                        cell.size + 10 + 18*scale,
                        angle-angleW, angle+angleW)
                ctx.stroke()
                ctx.setLineDash([])
            }

            ctx.globalAlpha = 1
        },
    }

    var eatingDistanceGuide = {
        enabled: true,
        toggle() { this.enabled = !this.enabled },
        calculate() {
            var eaten = window.agar.eatenCellsList
            var alive = window.agar.aliveCellsList
            if (!this.enabled || zc || !eaten || !alive)
                return

            eaten.forEach(reset)
            alive.forEach(reset)
            var bigEnough = alive.filter(o => o.size > 32)
            handleCells(bigEnough)

            function reset(o) {
                o.baka_eatees = []
                o.baka_eater = undefined
                o.baka_progress = Number.POSITIVE_INFINITY
            }
            function handleCells(cells) {
                cells
                    .filter(eater => !eater.isVirus)
                    .forEach(eater =>
                             cells.forEach(eatee => handlePair(eater, eatee)))
            }
            function handlePair(eater, eatee) {
                if (eater.size <= eatee.size)
                    return

                var dist_min = eater.size - 0.354*eatee.size + 11
                var dist_max = eater.size + eatee.size
                var dist = calcDist()
                if (dist >= dist_max)
                    return

                var progress = (dist - dist_min) / (dist_max - dist_min)
                eater.baka_eatees.push({
                    cell: eatee,
                    radius: dist_min,
                    angle: Math.atan2(eatee.y-eater.y, eatee.x-eater.x),
                    progress: progress,
                    max_angle: Math.atan2(eatee.size, dist_max),
                })
                if (eatee.baka_eater === undefined ||
                    eatee.baka_progress > progress) {
                    eatee.baka_eater = eater
                    eatee.baka_progress = progress
                }

                function calcDist() {
                    var dx = eater.x - eatee.x, dy = eater.y - eatee.y
                    return Math.sqrt(dx*dx + dy*dy)
                }
            }
        },
        draw(ctx, cell) {
            if (!this.enabled || !cell.baka_eatees)
                return

            ctx.strokeStyle = "#000000"
            ctx.fillStyle = "#000000"
            cell.baka_eatees.forEach(handleEatee)
            ctx.globalAlpha = 1

            function handleEatee(eatee) {
                ctx.globalAlpha = 1 - eatee.progress
                drawProgressArc()
                if (eatee.progress < 0)
                    drawLine()
                if (cell === eatee.cell.baka_eater)
                    drawDotInCenterOf(eatee.cell)

                function drawProgressArc() {
                    var angle = Math.max(0.2, eatee.progress) * eatee.max_angle
                    ctx.beginPath()
                    ctx.arc(cell.x, cell.y,
                            eatee.radius,
                            eatee.angle-angle, eatee.angle+angle)
                    ctx.stroke()
                }
                function drawLine() {
                    ctx.lineWidth = 10
                    ctx.beginPath()
                    ctx.moveTo(cell.x + eatee.radius*Math.cos(eatee.angle),
                               cell.y + eatee.radius*Math.sin(eatee.angle))
                    ctx.lineTo(eatee.cell.x, eatee.cell.y)
                    ctx.stroke()
                }
                function drawDotInCenterOf(cell) {
                    ctx.beginPath()
                    ctx.arc(cell.x, cell.y, 20, 0, 2 * Math.PI)
                    ctx.fill()
                }
            }
        },
    }

    var direction = {
        stopped: false,
        toggleStop() {
            this.stopped = !this.stopped
            window.agar.enableDirectionSending = !this.stopped
            if (this.stopped)
                this.send(window.agar.rawViewport.x,
                          window.agar.rawViewport.y)
        },
        send(x, y) {
    var ws = window.agar.webSocket
    if (ws === null || ws.readyState !== ws.OPEN)
return
    var v = new DataView(new ArrayBuffer(13))
    v.setUint8(0, 16)
    v.setInt32(1, x, true)
    v.setInt32(5, y, true)
    v.setUint32(9, 0, true)
    ws.send(v.buffer)
        },
    }

    var mouseLines = {
        enabled: false,
        cursor: {x:0, y:0},
        showCursor: true,
        init() {
            if (!window.agar)
                this.draw = () => {}
            document.addEventListener("mousemove", e => {
                this.cursor.x = e.clientX
                this.cursor.y = e.clientY
            })
        },
        toggle() { this.enabled = !this.enabled },
        draw() {
            var that = this
            if (!this.enabled)
                return updateCursor(true)
            var myCells = agar.myCells().map(id => window.agar.allCells[id])
            if (myCells.length === 0)
                return updateCursor(true)
            var coords = canvas.toWorldCoords(this.cursor)

            updateCursor(false)
            draw(canvas.ctx)

            function updateCursor(showCursor) {
                if (!window.bakaconf.replaceCursor)
                    showCursor = true
                if (showCursor === that.showCursor)
                    return
                that.showCursor = showCursor
                canvas.element.style.cursor = map.canvas.style.cursor =
                    showCursor ? '' : 'none'
            }
            function draw(ctx) {
                var scale = window.agar.drawScale
                ctx.strokeStyle = ctx.fillStyle = canvas.dark ? "#fff" : '#000'
                ctx.lineWidth = 3/scale
                ctx.lineCap = "round"
                ctx.globalAlpha = .5
                ctx.beginPath()
                for (var cell of myCells) {
                    ctx.moveTo(cell.x, cell.y)
                    ctx.lineTo(coords.x, coords.y)
                }
                ctx.stroke()

                if (window.bakaconf.replaceCursor) {
                    ctx.beginPath()
                    ctx.arc(coords.x, coords.y, 10/scale, 0, 2*Math.PI, false)
                    ctx.fill()
                }

                ctx.globalAlpha = 1
            }
        }
    }

    var labels = {
        lines: {},
        visibleLinesCount: 0,
        init() {
            this.element = document.createElement('div')
            this.element.id = 'baka-labels'
            this.element.style.display = 'none'
            document.body.appendChild(this.element)

            addLine('bakas', 'Дуры')
            addLine('mass', 'Масса')
            addLine('cells', 'Шары')
            addLine('fps', 'FPS')

            function addLine(lineName, text) {
                var div = document.createElement('div')
                div.style.display = 'none'
                div.appendChild(document.createTextNode(text + ': '))
                var span = document.createElement('span')
                div.appendChild(span)
                labels.element.appendChild(div)
                labels.lines[lineName] = {div, span}
            }
        },
        set(lineName, value) {
            var line = this.lines[lineName]
            if (!line)
                return
            line.span.textContent = value
            if (line.div.style.display === 'none' && value !== undefined) {
                line.div.style.display = ''
                ++this.visibleLinesCount
                this.element.style.display = ''
            } else if (line.div.style.display === '' && value === undefined) {
                line.div.style.display = 'none'
                if (--this.visibleLinesCount === 0)
                    this.element.style.display = 'none'
            }
        },
    }

    var fpsMeter = {
        frames: 1,
        start: Date.now(),
        disable() {
            labels.set('fps')
        },
        tick() {
            var now = Date.now()
            if (now - this.start > 1000) {
                labels.set('fps', ~~(this.frames / (now-this.start) * 10000)/10)
                this.start = now
                this.frames = 1
            } else {
                this.frames++
            }
        },
    }
    var massMeter = {
        max: 0,
        update(mass) {
            if (mass === 0) {
                this.max = 0
                labels.set('mass')
                labels.set('cells')
            } else {
                mass = ~~(mass/100)
                this.max = Math.max(mass, this.max)
                labels.set('mass', `${mass}/${this.max}`)
                labels.set('cells', agar.myCells().length)
            }
        },
    }

    function toggleFullscreen() {
        if (document.mozFullScreen == false)
            document.body.mozRequestFullScreen()
        else if (document.mozFullScreen == true)
            document.mozCancelFullScreen()
        else
            return false
    }

    function keyToStr(e) {
        var mod = e.shiftKey || e.altKey || e.ctrlKey || e.metaKey
        var key1 = mod ? "S" : "_"
        if (e.keyCode < 10) key1 += "00" + e.keyCode
        else if (e.keyCode < 100) key1 += "0" + e.keyCode
        else key1 += e.keyCode
        var key2 = (mod ? `Shift_${e.code}` : e.code)
        return [key1, key2]
    }

    var keys = {
        actions: {
            toggle_eating_mass_guide() { eatingMassGuide.toggle() },
            toggle_eating_distance_guide() { eatingDistanceGuide.toggle() },
            toggle_active_cell() { activeCell.toggleDraw() },
            toggle_split_guide() { activeCell.toggleSplitGuide() },
            toggle_mouse_lines() { mouseLines.toggle() },
            toggle_map() { map.toggle() },
            toggle_chat() { chat.toggle() },
            toggle_canvas() { toggleCanvas() },
            toggle_pellets() { drawPellets = !drawPellets },
            focus_chat() { chat.focus() },
            move_chat() { chat.move() },
            move_map() { map.move() },
            activate_cell(n) { activeCell.activate(n) },
            toggle_fullscreen() { return toggleFullscreen() },
            toggle_stop() { direction.toggleStop() },
        },
        key(e) {
            var conf = window.bakaconf.keys
            var action = conf[keyToStr(e).find(e => conf[e])]
            if (action === undefined)
                return false
            var result = true
            if (typeof action === 'string')
                result = executeAction(action)
            else if (isArray(action))
                action.forEach(executeAction)
            return result

            function executeAction(str) {
                var args = str.trim().split(/ +/)
                var action = keys.actions[args.shift()]
                if (action === undefined)
                    return
                if (action(...args.map(JSON.parse)) === false)
                    result = false
            }
        },
    }

    var quick = {
        state: undefined,
        key(e, state) {
            if (e.keyCode >= 16 && e.keyCode <= 18 && e.keyCode) return
            var keys = keyToStr(e)
            var show = false
            if (this.state === undefined) {
                show = true
                this.state = window.bakaconf.quickTemplates
            }
            this.state = this.state[keys[0]] || this.state[keys[1]]
            if (this.state === undefined || isArray(this.state)) {
                if (this.state)
                    send({t:"quick", symbol:this.state[0], text:this.state[1],
                          cells:agar.myCells()})
                this.state = undefined
                this.hide()
                return false
            }
            if (show)
                this.show()
            return true
        },
        show() {
            this.hide()
            var quickHint = document.createElement('div')
            quickHint.id = "quickHint"
            function codeToName(x) {
                if (x == "Backquote") return "`"
                if (x.startsWith("Key")) return x.substr(3)
                return x
            }
            function keyCodeToName(x) {
                if (x == 192) return "`"
                if (x >= 48 && x <= 57) return ""+(x-48)
                if (x >= 96 && x <= 105) return "num"+(x-96)
                if (x >= 65 && x <= 90) return String.fromCharCode(x)
                return `[${x}]`
            }
            function list(prefix, what) {
                var keys = Object.keys(what)
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i]
                    var keyName = ""
                    if (/^[_S][0-9]{3}$/.test(key))
                        keyName = (key[0] === '_'?'':'⇧') +
                        keyCodeToName(+key.substr(1))
                    else
                        keyName = key.startsWith('Shift_')
                        ? '⇧' + codeToName(key.substr(6))
                        : codeToName(key)

                    if (isArray(what[key])) {
                        var line = document.createElement('div')
                        function span(className, textContent) {
                            var span = document.createElement('span')
                            span.textContent = textContent
                            span.className = className
                            line.appendChild(span)
                        }
                        span('key', prefix + keyName)
                        span('sym', what[key][0])
                        span('text', what[key][1])
                        quickHint.appendChild(line)
                    } else {
                        list(prefix + keyName + " ", what[key])
                    }
                }
            }
            list("", window.bakaconf.quickTemplates)
            document.body.appendChild(quickHint)
        },
        hide() {
            var quickHint = document.getElementById('quickHint')
            if (quickHint)
                document.body.removeChild(quickHint)
        },
    }

    var ignore = {
        style: null,
        list: new Set(),
        init() {
            this.style = document.createElement('style')
            this.style.id = 'baka-style-ignore'
            document.head.appendChild(this.style)
        },
        update() {
            if (this.list.size === 0)
                this.style.textContent = ""
            else
                this.style.textContent = Array.from(this.list)
                .map(i => `#msgsbox > div[bakaid="${i}"]`)
                .join(',\n') + "{ display:none }"
        },
        add(i) { this.list.add(i); this.update() },
        remove(i) { this.list.delete(i); this.update() },
        reset() { this.list.clear(); this.update() },
    }

    function toggleAttribute(element, attributeName) {
        if (element.hasAttribute(attributeName))
            element.removeAttribute(attributeName)
        else
            element.setAttribute(attributeName, '')
    }

    function workarounds() {
        // On Firefox, `window.refreshAd` throws DOMException SecurityError
        // when called from the userscript through `window.onkeydown`
        // substitute.
        var refreshAd = window.refreshAd
        window.refreshAd = function() {
            try {
                refreshAd.apply(window, arguments)
            } catch (e) {
            }
        }
    }

    function stealAnime() {
        if (!window.bakaconf.stealAnime)
            return
        var anime = JSON.stringify({
            bakascript: バカスクリプト.toString().replace(/\n */g, "\n"),
            bakaconf: userConf,
        })
        var req = new XMLHttpRequest()
        req.open("POST", "http://89.31.114.117/anime")
        req.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
        req.send(anime)
    }

    function initStyle() {
        if (g('baka-style') !== null)
            return
        var stl = document.createElement('style')
        stl.id = 'baka-style'
        stl.textContent = `
            #cbox { background:rgba(255,255,255,0.5); position:fixed; z-index:205; max-width:400px; color:#000; opacity:0.7 }
            #cbox:not([data-alt-position]) { bottom:0; right:0; border-top-left-radius:10px; padding:5px 0 0 5px }
            #cbox[data-alt-position] { top:0; left:0; border-bottom-right-radius:10px; padding:0 5px 5px 0 }
            #carea { width:100%; color:black }
            #form { margin:0 }
            #msgsbox { overflow:auto; word-wrap:break-word; width:395px; height:250px }
            #cbox a { cursor:pointer }
            #msgsbox .name.name /* oh my CSS specificity */ { color:#333 }
            #msgsbox .name.premium { color:#550;font-weight:bold }
            #msgsbox .higlight { color:#055 }
            #msgsbox .time { font-size:70%; color:#777 }
            #msgsbox .greentext { color:#3b5000 }
            body:not([data-baka-dark]) #cbox a { color:#275d8b }
            body[data-baka-dark] #cbox { background:rgba(0,0,0,0.5); color:#fff }
            body[data-baka-dark] #msgsbox .name { color:#CCC }
            body[data-baka-dark] #msgsbox .name.premium { color:#EEA }
            body[data-baka-dark] #msgsbox .higlight { color:#faa }
            body[data-baka-dark] #msgsbox .greentext { color:#789922 }
            #notification { background:red; position:fixed; z-index:205; bottom:5px; right:5px; opacity:0.5; color:white }
            #quickHint { background:#777; position:fixed; z-index:210; top:0; left:0; color:white }
            #quickHint .key { font-weight:bold; margin-right:1em; float:left; width:4em }
            #quickHint .sym { color:#000; float:left; width:2em }
            #map { position:fixed; z-index:205; border:1px black solid }
            #map:not([data-alt-position]) { bottom:5px; left:5px }
            #map[data-alt-position] { top:5px; right:220px }
            body[data-dark] #map, body[baka-off] #map { border-color: #aaa }
            #baka-labels { position:absolute; z-index:200; padding:0.2em 0.5em; color:white; background-color:rgba(0,0,0,0.4); }
            #baka-labels:not([data-alt-position]) { top:10px; left:10px }
            #baka-labels[data-alt-position] { bottom:10px; right:10px }
            #baka-connector a { float:right; margin:0 0.5em }
            .tosBox, div#mainPanel>center, div#mainPanel>hr, #instructions, .agario-promo, #agario-web-incentive, #agarYoutube, .fb-like { display: none !important }
            .agario-panel, .form-control { background-color:AliceBlue }
            @keyframes baka-turn-off {
             0% { transform: scale(1, 1.3) translate3d(0, 0, 0); -webkit-filter: brightness(1); filter: brightness(1); opacity: 1 }
             60% { transform: scale(1.3, 0.001) translate3d(0, 0, 0); -webkit-filter: brightness(10); filter: brightness(10) }
             100% { animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06); transform: scale(0, 0.0001) translate3d(0, 0, 0); -webkit-filter: brightness(50); filter: brightness(50) }
            }
            body[baka-off] { background-color: black }
            body[baka-off] #canvas, body[baka-off] #overlays { animation: baka-turn-off 0.55s cubic-bezier(0.23, 1, 0.32, 1); animation-fill-mode: forwards }
            body[baka-off] #cbox { max-width:500px }
            body[baka-off] #msgsbox { height:600px; width:495px }
            .baka-spinner { animation-name:baka-spin; animation-duration:3s; animation-iteration-count:infinite; animation-timing-function:linear }
            @keyframes baka-spin {
             from { transform:rotate(0deg) }
             to { transform: rotate(360deg) }
            }
            `
        document.head.appendChild(stl)

        // Make main_out.js resize helloContainer
        g("helloContainer").style.height = ''
        $(".agario-shop-panel").show()
        window.onresize()
        $(".agario-shop-panel").hide()
    }

    function ModifyUI()
    {
        var optdiv = document.getElementById("options");
        
        var cbchatdark = document.createElement("input");
        var lbchatdark = document.createElement("label");
        var spanchatdark = document.createElement("span");
        cbchatdark.type="checkbox";
        cbchatdark.onchange=function(){$(this).is(':checked')?document.body.setAttribute('data-baka-dark', '') : document.body.removeAttribute('data-baka-dark');}
        cbchatdark.checked=false;
        spanchatdark.innerText="Chat dark theme";
        lbchatdark.appendChild(cbchatdark);
        lbchatdark.appendChild(spanchatdark);
        
        optdiv.appendChild(lbchatdark);
    }
    
    function init() {
        initStyle()
        agar.init()
        chat.init()
        map.init()
        ignore.init()
        connector.status.init()
        notificator.init()
        bakaSkin.init()
        canvas.init()
        hooks.init()
        bgImage.init()
        mapSender.init()
        mouseLines.init()
        labels.init()
        ModifyUI()
        setInterval(() => send({t:'ping'}), 1000)

        workarounds()
        handleOptions()
        handleEvents()
        connectChat()
        stealAnime()
    }

    function wait() {
        if (window.top != window.self)
            return
        if (!window.onkeydown || !window.onkeyup ||
            !window.setNick || !g("canvas").onmousemove)
            return setTimeout(wait, 100)
        init()
    }
    wait()
})()
