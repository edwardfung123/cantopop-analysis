function pp(obj){
  return JSON.stringify(obj, null, 2);
}

var utils = require('utils');
/**
 * @typedef {Object} Song
 * @property {string} title
 *           The title of the song
 * @property {string[]} singers
 *           The list of singer names.
 * @property {string} lyric
 *           The lyric of the song.
 */

/**
 * @description A custom made parser for mojim.
 * @return {Song} The song
 */
function getSongInfo(){
  var $container = $('#fsZx1');
  $container
  .contents()
  .filter(function() {
    return this.nodeType === 3 && this.textContent.trim();
  })
    .wrap( "<p></p>" )
    .end()
  .filter( "br" )
  .remove();

  var $peopleAndLyric = $container.find('#fsZx3');
  var song = {
    lyricist: '',
    composer: '',
    arranger: '',
    supervisor: '',
    title: '',
    lyric: '',
  };

  var blocks = $peopleAndLyric[0].innerText
    .split('\n\n')
    .map(function(l){ return l.replace(/更多更詳盡歌詞 在 ※ Mojim.com　魔鏡歌詞網/g, ''); })
    .map(function(l){ return l.trim(); })
    .filter(function(l){ return l.length > 0; });
  // Example
  /*
  ["作詞：林夕
    作曲：陳輝陽
    編曲：陳輝陽/金培達",
   "每晚你也要駕著的士盼望
    但聖誕夜誰來講快樂
    每隔數秒要對著電話講你好
    遇著你感冒　誰來問你的好",
   "一路上夢想的櫥窗　誰憑勞力發亮
    天未亮便在場　誰贈你勳章　炫耀你夢鄉",
   "每晚企著過　為何都不肚餓
    樣樣美食你也捧過　誰來請你坐
    擔起一噸噸繁華的廢物
    朝垃圾站　造福萬民　誰來贈你香薰",
   "一路上夢想的櫥窗　誰憑勞力發亮
    天未亮便在場　誰贈你勳章　誰在拍掌",
   "* 我想將天使的小禮物呈上一雙翅膀
    在夜空翱翔一趟　陪你看城市亮光
    我想將這張咀親你額角好比高貴銅像
    誰認識這大人物　霓虹燈因他更亮　誰來景仰",
   "Repeat *",
   "我想將　雙手的溫暖附托在你肩上
    我想將　鼓掌的聲線盤旋在你光環上
    若你無言　讓天使合唱"]
  */
  console.log(JSON.stringify(blocks));
  // The first block will be the people.
  var firstBlock = blocks[0];
  if (firstBlock.indexOf('：') >= 0) {
    blocks.shift();   // Remove the first block as it is not lyric.
    var peopleLines = firstBlock.split('\n');
    var peopleMatcher = /(.*)：(.*)/;
    peopleLines.forEach(function(l){
      var match = peopleMatcher.exec(l);
      if (match){
        switch(match[1]){
          case '作詞':
            song.lyricist = match[2];
            break;
          case '作曲':
            song.composer = match[2];
            break;
          case '編曲':
            song.arranger = match[2];
            break;
          // case '監製':
          //   song.supervisor = match[2];
          //   break;
          default:
            if (song.unknown_person === undefined || song.unknown_person === null){
              song.unknown_person = {};
            }
            song.unknown_person[match[1]] = match[2];
        }
      }
    });
  }

  _.extend(song, {
    title: $container.find('#fsZx2').text().trim(),
    singers: [$container.find('>p').text().trim(), ],
    lyric: blocks.join('\n\n'),
    raw: $container.text(),
  });
  console.log(JSON.stringify(song));
  return song;
}

var song = null;

var casper = require('casper').create({
  clientScripts:  [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/underscore/underscore.js',
  ],
  pageSettings: {
    loadImages:  false,        // The WebPage instance used by Casper will
    loadPlugins: false         // use these settings
  },
  logLevel: 'debug',
  verbose: true,
});

casper.on('remote.message', function(message) {
  casper.log('[remote.message]: ' + message, 'info');
});

casper.on("page.error", function(msg, trace) {
  capser.log("[page.error]: " + msg, "error");
});

//var url = 'file:///Users/edward/code/me/lyric_parser/mojim/song_01.html';
//var url = 'https://mojim.com/twy100111x25x12.htm';
var url = casper.cli.get('url') || 'file:///Users/edward/code/me/lyric_parser/mojim/song_01.html';
casper.log(url, 'debug');
casper.start(url);

casper.then(function() {
  casper.log('First Page: ' + this.getTitle(), 'info');
  song = this.evaluate(getSongInfo);
});

casper.run(function(){
  casper.log(pp(song));
  casper.done();
});
