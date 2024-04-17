// <nowiki>


(function($) {


/*
 ****************************************
 *** twinkleimage.js: Image CSD module
 ****************************************
 * Mode of invocation:     Tab ("DI")
 * Active on:              Local nonredirect file pages (not on Commons)
 */

Twinkle.image = function twinkleimage() {
	if (mw.config.get('wgNamespaceNumber') === 6 && mw.config.get('wgArticleId') && !document.getElementById('mw-sharedupload') && !Morebits.isPageRedirect()) {
		Twinkle.addPortletLink(Twinkle.image.callback, 'DI', 'tw-di', '保留期間がある即時削除対象のファイルを指定');
	}
};

Twinkle.image.callback = function twinkleimageCallback() {
	var Window = new Morebits.simpleWindow(600, 330);
	Window.setTitle('日付入り即時削除依頼');
	Window.setScriptName('Twinkle');
	Window.addFooterLink('即時削除の方針', 'WP:CSD#F');
	Window.addFooterLink('Image設定', 'User:Syunsyunminmin/Twinkle/Preferences#image');
	Window.addFooterLink('Twinkle help', ':en:WP:TW/DOC#image');
	Window.addFooterLink('フィードバック', 'User talk:Syunsyunminmin/Twinkle');

	var form = new Morebits.quickForm(Twinkle.image.callback.evaluate);
	form.append({
		type: 'checkbox',
		list: [
			{
				label: 'アップロード者に通知',
				value: 'notify',
				name: 'notify',
				tooltip: '同じ利用者から複数の指定を行う予定で、その利用者の会話ページに多くの通知を送りたくない場合は、このチェックを外してください。',
				checked: Twinkle.getPref('notifyUserOnDeli')
			}
		]
	}
	);
	var field = form.append({
		type: 'field',
		label: '行おうとしている操作'
	});
	field.append({
		type: 'radio',
		name: 'type',
		list: [
			{
				label: '出典情報なし (CSD F5)',
				value: 'no source',
				checked: true,
				tooltip: '出典についての情報がないファイル'
			},
			{
				label: 'ライセンス情報なし (CSD F5)',
				value: 'no license',
				tooltip: '著作権状態についての情報がないファイル'
			}
		]
	});
	form.append({ type: 'submit' });

	var result = form.render();
	Window.setContent(result);
	Window.display();

	// We must init the parameters
	var evt = document.createEvent('Event');
	evt.initEvent('change', true, true);
	result.type[0].dispatchEvent(evt);
};

Twinkle.image.callback.evaluate = function twinkleimageCallbackEvaluate(event) {

	var input = Morebits.quickForm.getInputData(event.target);
	if (input.replacement) {
		input.replacement = (new RegExp('^' + Morebits.namespaceRegex(6) + ':', 'i').test(input.replacement) ? '' : 'File:') + input.replacement;
	}

	var csdcrit, notifytemplatename;
	switch (input.type) {
		case 'no source':
			notifytemplatename += 'Image source';
			csdcrit = 'F5';
			break;
		case 'no license':
			notifytemplatename += 'Image copyright';
			csdcrit = 'F5';
			break;
		default:
			throw new Error('Twinkle.image.callback.evaluate: 不明な基準');
	}

	var lognomination = Twinkle.getPref('logSpeedyNominations') && Twinkle.getPref('noLogOnSpeedyNomination').indexOf(csdcrit.toLowerCase()) === -1;
	var templatename = input.type;

	var params = $.extend({
		templatename: templatename,
		notifytemplatename: notifytemplatename,
		normalized: csdcrit,
		lognomination: lognomination
	}, input);

	Morebits.simpleWindow.setButtonsEnabled(false);
	Morebits.status.init(event.target);

	Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
	Morebits.wiki.actionCompleted.notice = 'タグ付け完了';

	// Tagging image
	var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'ファイルに画像削除タグを付ける');
	wikipedia_page.setCallbackParameters(params);
	wikipedia_page.load(Twinkle.image.callbacks.taggingImage);

	// Notifying uploader
	if (input.notify) {
		wikipedia_page.lookupCreation(Twinkle.image.callbacks.userNotification);
	} else {
		// add to CSD log if desired
		if (lognomination) {
			Twinkle.image.callbacks.addToLog(params, null);
		}
		// No auto-notification, display what was going to be added.
		var noteData = document.createElement('pre');
		noteData.appendChild(document.createTextNode('{{subst:' + notifytemplatename + '|1=' + mw.config.get('wgTitle') + '}} --~~~~'));
		Morebits.status.info('通知', [ '以下のようなデータは、元のアップロード者に投稿されるべきです:', document.createElement('br'), noteData ]);
	}
};

Twinkle.image.callbacks = {
	taggingImage: function(pageobj) {
		var text = pageobj.getPageText();
		var params = pageobj.getCallbackParameters();

		// remove "move to Commons" tag - deletion-tagged files cannot be moved to Commons
		text = text.replace(/\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*\}\}/gi, '');

		var tag = '{{subst:' + params.templatename + '}}\n';
		switch (params.type) {
			default:
				break;  // doesn't matter
		}

		pageobj.setPageText(tag + text);
		pageobj.setEditSummary('このファイルは[[WP:CSD#' + params.normalized + '|CSD ' + params.normalized + ']]に従い削除される予定です (' + params.type + ')');
		pageobj.setChangeTags(Twinkle.changeTags);
		pageobj.setWatchlist(Twinkle.getPref('deliWatchPage'));
		pageobj.setCreateOption('nocreate');
		pageobj.save();
	},
	userNotification: function(pageobj) {
		var params = pageobj.getCallbackParameters();
		var initialContrib = pageobj.getCreator();

		// disallow warning yourself
		if (initialContrib === mw.config.get('wgUserName')) {
			pageobj.getStatusElement().warn('あなた (' + initialContrib + ') がこのページを作成しました。通知をスキップします。');
		} else {
			var usertalkpage = new Morebits.wiki.page('User talk:' + initialContrib, 'このページの立項者 (' + initialContrib + ') へ通知');
			var notifytext = '\n{{subst:' + params.notifytemplatename + '|1=' + mw.config.get('wgTitle') + '}} --~~~~';
			usertalkpage.setAppendText(notifytext);
			usertalkpage.setEditSummary('通知: [[:' + Morebits.pageNameNorm + ']] の削除へのタグ付け' + Twinkle.summaryAd);
			usertalkpage.setCreateOption('recreate');
			usertalkpage.setWatchlist(Twinkle.getPref('deliWatchUser'));
			usertalkpage.setFollowRedirect(true, false);
			usertalkpage.append();
		}

		// add this nomination to the user's userspace log, if the user has enabled it
		if (params.lognomination) {
			Twinkle.image.callbacks.addToLog(params, initialContrib);
		}
	},
	addToLog: function(params, initialContrib) {
		var usl = new Morebits.userspaceLogger(Twinkle.getPref('speedyLogPageName'));
		usl.initialText =
			'{{Notice|style=announce|text=即時削除の際、このページへのリンクは考慮する必要はありません。}}\n' +
			'<!-- このテンプレートは、[[Wikipedia:即時削除の方針#リダイレクト]]にリンク元がある場合は削除しないよう定めてあるため、このページがリンクしていることによる影響を避けるためのものです。 -->\n\n' +
			'このページは[[H:TW|Twinkle]]のCSDモジュールによって生成されており、[[WP:CSD|即時削除]]に指定したページを記録しています。\n\n' +
			'記録をこれ以上保持したくない場合、[[利用者:Syunsyunminmin/Twinkle/Preferences|設定パネル]]を使用してこの機能をオフにした後、' +
			'[[WP:CSD#U1|CSD U1]]でこのページの即時削除を依頼することが出来ます。' +
			(Morebits.userIsSysop ? '\n\nこのログは、Twinkleを使用して行われた即時削除を完全に追跡してはいません。' : '');

		var formatParamLog = function(normalize, csdparam, input) {
			return ' {' + normalize + ' ' + csdparam + ': ' + input + '}';
		};

		var extraInfo = '';

		// If a logged file is deleted but exists on commons, the wikilink will be blue, so provide a link to the log
		var fileLogLink = ' ([{{fullurl:Special:Log|page=' + mw.util.wikiUrlencode(mw.config.get('wgPageName')) + '}} 記録])';

		var appendText = '# [[:' + Morebits.pageNameNorm + ']]' + fileLogLink + ': DI [[WP:CSD#' + params.normalized.toUpperCase() + '|CSD ' + params.normalized.toUpperCase() + ']] ({{tl|' + params.templatename + '}})';

		['reason', 'replacement', 'source'].forEach(function(item) {
			if (params[item]) {
				extraInfo += formatParamLog(params.normalized.toUpperCase(), item, params[item]);
				return false;
			}
		});

		if (extraInfo) {
			appendText += '; 追加情報:' + extraInfo;
		}
		if (initialContrib) {
			appendText += '; {{user|1=' + initialContrib + '}}に通知';
		}
		appendText += ' ~~~~~\n';

		var editsummary = '[[:' + Morebits.pageNameNorm + ']]の即時削除への指定を記録' + Twinkle.summaryAd;

		usl.changeTags = Twinkle.changeTags;
		usl.log(appendText, editsummary);
	}
};

Twinkle.addInitCallback(Twinkle.image, 'image');
})(jQuery);


// </nowiki>
