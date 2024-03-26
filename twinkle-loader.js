mw.loader.using(['mediawiki.api', 'mediawiki.language', 'mediawiki.user', 'mediawiki.util', 'mediawiki.Title', 'jquery.ui'])
	.then(
		function () {
			mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/Twinkle-pagestyles.css&action=raw&ctype=text/css', 'text/css');
			mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/select2/select2.min.css&action=raw&ctype=text/css', 'text/css');
			mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/morebits/morebits.css&action=raw&ctype=text/css', 'text/css');
			mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/Twinkle.css&action=raw&ctype=text/css', 'text/css');
			mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/select2/select2.min.js&action=raw&ctype=text/javascript');
			mw.loader.getScript('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/morebits/morebits.js&action=raw&ctype=text/javascript')
				.then(
					function () {
						mw.loader.getScript('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/Twinkle.js&action=raw&ctype=text/javascript')
							.then(
								function () {
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinkleconfig.js&action=raw&ctype=text/javascript');
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/friendlyshared.js&action=raw&ctype=text/javascript');
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinklespeedy.js&action=raw&ctype=text/javascript');
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinklediff.js&action=raw&ctype=text/javascript');
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinkleunlink.js&action=raw&ctype=text/javascript');
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinklefluff.js&action=raw&ctype=text/javascript');
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinklewarn.js&action=raw&ctype=text/javascript');
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinkleprotect.js&action=raw&ctype=text/javascript');
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/friendlytag.js&action=raw&ctype=text/javascript');
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/friendlywelcome.js&action=raw&ctype=text/javascript');
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/friendlytalkback.js&action=raw&ctype=text/javascript');
									mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinklexfd.js&action=raw&ctype=text/javascript');
									/*
									//mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinklearv.js&action=raw&ctype=text/javascript');
									//mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinkledeprod.js&action=raw&ctype=text/javascript');
									//mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinklebatchdelete.js&action=raw&ctype=text/javascript');
									//mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinklebatchprotect.js&action=raw&ctype=text/javascript');
									//mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinklebatchundelete.js&action=raw&ctype=text/javascript');
									//mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinkleblock.js&action=raw&ctype=text/javascript');
									//mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinkleprod.js&action=raw&ctype=text/javascript');
									//mw.loader.load('//ja.wikipedia.org/w/index.php?title=User:Syunsyunminmin/Twinkle/twinkleimage.js&action=raw&ctype=text/javascript');
									*/
								}
							);
					}
				);
		});
