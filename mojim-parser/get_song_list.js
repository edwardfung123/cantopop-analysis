var utils = require('utils');
function pp(obj){
  return JSON.stringify(obj, null, 2);
};
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
 * @description A custom made parser for mojim to get all the songs in a page.
 * @return {Song} The song
 */
function getSongs(){
  var $songs = $('dd.hb2, dd.hb3')
  var songs = $songs.map(function(i, e){
    var $e = $(e);
    var $a = $e.find('.hc1 > a');
    return {
      title: $a.text().trim(),
      url: 'https://mojim.com' + $a.attr('href'),
      date: $e.find('.hc4').text().trim(),
    }
  }).get();
  return songs;
}

function getNextUrls(){
  return ['file:///Users/edward/code/me/lyric_parser/mojim/list_01-1.html'];
}

var songs = null;

var casper = require('casper').create({
  clientScripts:  [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/underscore/underscore.js',
  ],
  pageSettings: {
    loadImages:  false,        // The WebPage instance used by Casper will
    loadPlugins: false         // use these settings
  },
  //logLevel: 'debug',
  //verbose: true,
});

casper.on('remote.message', function(message) {
  casper.log('[remote.message]: ' + message, 'info');
});

casper.on("page.error", function(msg, trace) {
  casper.log("[page.error]: " + msg, "error");
});

var url = 'file:///Users/edward/code/me/lyric_parser/mojim/list_01.html';
//var url = 'https://mojim.com/twy100111x25x12.htm';
casper.start(url);

casper.then(function() {
  casper.log('First Page: ' + this.getTitle(), 'info');
  songs = this.evaluate(getSongs);
  casper.log(pp(songs.slice(0, 3)), 'debug');
  var nextUrls = this.evaluate(getNextUrls);
  casper.log('nextUrls: ', 'debug');
  casper.log(pp(nextUrls), 'debug');
  var count = 0;
  function loadNext(){
    var url = nextUrls[count];
    casper.log('load the next list: ' + url, 'debug');
    casper.thenOpen(url, function(){
      var newSongs = this.evaluate(getSongs);
      casper.log('new songs', 'debug');
      casper.log(pp(newSongs), 'debug');
      songs.push.apply(songs, newSongs);
      count++;
      if (count < nextUrls.length){
        loadNext();
      } else {
        casper.log('All Songs loaded', 'debug');
        utils.dump(songs);
      }
    });
  }
  if (count < nextUrls.length){  
    loadNext();
  }
});

casper.run(function(){
  casper.done();
});
