// ==UserScript==
// @name        Baka extensions tool example config
// @version     1.0
// @namespace   baka-extensions-tool
// @include     http://agar.io/*
// @grant       none
// ==/UserScript==

if (window.bakaconf === undefined) window.bakaconf = {};
if (window.bakaconf.teams === undefined) window.bakaconf.teams = {};
function bakaStyle() {
    var stl = document.getElementById('baka-style');
    if (stl !== null) stl.parentNode.removeChild(stl);
    stl = document.createElement('style');stl.id='baka-style';
    stl.textContent =  Array.slice(arguments).join('\n');
    document.head.appendChild(stl);
}

// Добавить (или заменить) команду, члены которой будут отмечены на карте цветной аурой
// window.bakaconf.teams.ww2leaders = {names: ["Stalin", "Hitler"], color: "#00F"};

// Шаблоны для быстрых команд. Коды есть в гугле по запросу `javascript key codes`
/*
window.bakaconf.quickTemplates = {
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
};
*/

// Не использовать управление кнопками мыши.
// window.bakaconf.mouseControls = false;

// Формат отображения времени в чате. 0 — HH:MM:SS, 1 — HH:MM, 2 — не отображать
// window.bakaconf.timeFormat = 0;

// Отмечать на карте только сырн
// window.bakaconf.showOnlyBakaAura = true;

// Включить туман войны
// window.bakaconf.fogOfWar = true;

// Переопределить встроенный в скрипт стиль
/*
bakaStyle('#cbox,#map {visibility: hidden;}',
          'a,input,select,button { animation:spin 4s linear infinite }',
          '@keyframes spin { 100% { transform:rotate(360deg) } }');
*/

// Совсем убрать встроенный в скрипт стиль
// bakaStyle();
