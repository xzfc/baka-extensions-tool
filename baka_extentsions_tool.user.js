// ==UserScript==
// @name        Baka extensions tool
// @include     http://agar.io/
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// ==/UserScript==

function main() {
	g = function(id) {return document.getElementById(id);}

	reqc = 0
	acc = '3a32aebd068d46be842fcb125868b059e37ba425efc2733a90f72622d27d1eaad238fa2e7da24ad72434b'
	callback = {}

	q = function (m, q, ret) {
		var script = document.createElement('script')
		script.id = reqc
		script.src = 'https://api.vk.com/method/' + m + '?https=1&access_token=' + acc + '&' + q + '&callback=callback[' + reqc +']'
		callback[reqc] = (function(reqc, ret) {return function(r) {
			//console.log('q ', r)
			if (typeof ret == 'function') ret(r)
			else console.log('ret is not a function', ret)
			g(reqc).remove()
		 }} (reqc, ret))
		document.getElementsByTagName("head")[0].appendChild(script)
		reqc++
	}

	im = {
		guid: 0,
		load: function() {
			q('messages.getHistory', 'count=200&user_id=288367682', im.draw)
		},
		draw: function(r) {
			r = r['response']
			var box = g('msgsbox')
			for (var i = 1; i < r.length; i++) {
				var msg = document.createElement('div')
				msg.innerHTML = r[i].body
				box.insertBefore(msg, box.firstChild)
			}
			g('msgsbox').lastChild.scrollIntoView()
		},
		send: function() {
			ret = function(r) {
				if (r.error === undefined) g('carea').value = ''
				else console.log('im.send.error ', r.error)
			}
			params = 'user_id=288367682' + '&guid=' + im.guid + '&message=' + encodeURIComponent(g('nick').value + '|' + g('carea').value)
			im.guid = Date.now()
			q('messages.send', params, ret)
		}
	}

	function lpconnect() {
		var ret = function(r) {
			window.lpi = r.response
			g('lpltrigger').click()
		}
		q('messages.getLongPollServer', 'use_ssl=1', ret)
	}

	im.load()
	lpconnect()
}


function init() {
	var stl = document.createElement('style')
	stl.innerHTML = '#cbox {background: black; position:fixed; z-index:100; bottom:0; right:0; width:400px; height:250px; opacity:0.5; color:white;} .button {background: white; color: black; font-size:16px; border: 1px solid black; cursor: pointer; height:25px;} #carea {width:100%; color:black; height: 25px;} #msgsbox {height: 200px; overflow: auto;}'
	document.body.appendChild(stl)

	var cbox = document.createElement('div')
	cbox.id = 'cbox'
	cbox.innerHTML = '<div id="msgsbox"></div><div id="cform"><form onsubmit="im.send(); return false;"><input id="carea"></input><input type="submit" class="button" value="Send"></input></div><div id="lpltrigger"></div>'
	document.body.appendChild(cbox)
	
	document.getElementById('lpltrigger').addEventListener('click', lploop)

	var script = document.createElement('script');
	script.appendChild (document.createTextNode('('+ main +')();'));
	(document.body || document.head || document.documentElement).appendChild(script);
}



function lploop() {
	r = unsafeWindow.lpi
	//console.log('used ts', r.ts)
	GM_xmlhttpRequest({
		method: "GET",
		url: 'http://' + r.server + '?act=a_check&key=' + r.key + '&ts='+ r.ts + '&wait=10&mode=2',
		onload: function(ups) {
			eval('ups = ' + ups.responseText)
			if (unsafeWindow.lpi.ts != ups.ts) {
				//console.log('-new ts', ups.ts, unsafeWindow.lpi.ts, ups)
				unsafeWindow.lpi.ts = ups.ts
				ups = ups.updates
				for (var i = 0; i < ups.length; i++) {
					if (ups[i][0] == 4) {
						var msg = document.createElement('div')
						msg.innerHTML = ups[i][6]
						document.getElementById('msgsbox').appendChild(msg)
					}
				}
				document.getElementById('msgsbox').lastChild.scrollIntoView()
			}
			lploop()
		}
	})
}

init()
