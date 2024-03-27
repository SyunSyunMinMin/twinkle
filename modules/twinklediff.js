// <nowiki>


(function($) {


/*
 ****************************************
 *** twinklediff.js: Diff module
 ****************************************
 * Mode of invocation:     Tab on non-diff pages ("Last"); tabs on diff pages ("Since", "Since mine", "Current")
 * Active on:              Existing non-special pages
 */

Twinkle.diff = function twinklediff() {
	if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
		return;
	}
	Twinkle.addPortletLink(mw.util.getUrl(mw.config.get('wgPageName'), {diff: 'cur', oldid: 'prev'}), 'Last', 'tw-lastdiff', '最新版の差分を表示');

	// Show additional tabs only on diff pages
	if (mw.config.get('wgDiffNewId')) {
		Twinkle.addPortletLink(function() {
			Twinkle.diff.evaluate(false);
		}, 'Since', 'tw-since', '最新版とこの利用者による最後の版との差分を表示');
		Twinkle.addPortletLink(function() {
			Twinkle.diff.evaluate(true);
		}, 'Since mine', 'tw-sincemine', '最新版と自分による最後の版との差分を表示');

		Twinkle.addPortletLink(mw.util.getUrl(mw.config.get('wgPageName'), {diff: 'cur', oldid: mw.config.get('wgDiffNewId')}), 'Current', 'tw-curdiff', '最新版との差分を表示');
	}
};

Twinkle.diff.evaluate = function twinklediffEvaluate(me) {

	var user;
	if (me) {
		user = mw.config.get('wgUserName');
	} else {
		var node = document.getElementById('mw-diff-ntitle2');
		if (!node) {
			// nothing to do?
			return;
		}
		user = $(node).find('a').first().text();
	}
	var query = {
		prop: 'revisions',
		action: 'query',
		titles: mw.config.get('wgPageName'),
		rvlimit: 1,
		rvprop: [ 'ids', 'user' ],
		rvstartid: mw.config.get('wgCurRevisionId') - 1, // i.e. not the current one
		rvuser: user,
		format: 'json'
	};
	Morebits.status.init(document.getElementById('mw-content-text'));
	var wikipedia_api = new Morebits.wiki.api('初版投稿者のデータを取得', query, Twinkle.diff.callbacks.main);
	wikipedia_api.params = { user: user };
	wikipedia_api.post();
};

Twinkle.diff.callbacks = {
	main: function(self) {
		var rev = self.response.query.pages[0].revisions;
		var revid = rev && rev[0].revid;

		if (!revid) {
			self.statelem.error('no suitable earlier revision found, or ' + self.params.user + ' is the only contributor. Aborting.');
			self.statelem.error('適切な過去版が見つからないか、' + self.params.user + 'が唯一の投稿者です。中止します。');
			return;
		}
		window.location = mw.util.getUrl(mw.config.get('wgPageName'), {
			diff: mw.config.get('wgCurRevisionId'),
			oldid: revid
		});
	}
};

Twinkle.addInitCallback(Twinkle.diff, 'diff');
})(jQuery);


// </nowiki>
