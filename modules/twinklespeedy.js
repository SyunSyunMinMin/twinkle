// <nowiki>


(function($) {


/*
 ****************************************
 *** twinklespeedy.js: CSD module
 ****************************************
 * Mode of invocation:     Tab ("CSD")
 * Active on:              Non-special, existing pages
 *
 * NOTE FOR DEVELOPERS:
 *   If adding a new criterion, add it to the appropriate places at the top of
 *   twinkleconfig.js.  Also check out the default values of the CSD preferences
 *   in twinkle.js, and add your new criterion to those if you think it would be
 *   good.
 */

Twinkle.speedy = function twinklespeedy() {
	// Disable on:
	// * special pages
	// * non-existent pages
	if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
		return;
	}

	Twinkle.addPortletLink(Twinkle.speedy.callback, 'CSD', 'tw-csd', Morebits.userIsSysop ? 'WP:CSDに従いページを削除する' : 'WP:CSDに従い即時削除を依頼');
};

// This function is run when the CSD tab/header link is clicked
Twinkle.speedy.callback = function twinklespeedyCallback() {
	Twinkle.speedy.initDialog(Morebits.userIsSysop ? Twinkle.speedy.callback.evaluateSysop : Twinkle.speedy.callback.evaluateUser, true);
};

// Used by unlink feature
Twinkle.speedy.dialog = null;
// Used throughout
Twinkle.speedy.hasCSD = !!$('#delete-reason').length;

// Prepares the speedy deletion dialog and displays it
Twinkle.speedy.initDialog = function twinklespeedyInitDialog(callbackfunc) {
	var dialog;
	Twinkle.speedy.dialog = new Morebits.simpleWindow(Twinkle.getPref('speedyWindowWidth'), Twinkle.getPref('speedyWindowHeight'));
	dialog = Twinkle.speedy.dialog;
	dialog.setTitle('即時削除の基準を選択する');
	dialog.setScriptName('Twinkle');
	dialog.addFooterLink('即時削除の方針', 'WP:CSD');
	dialog.addFooterLink('CSD設定', 'User:Syunsyunminmin/Twinkle/Preferences#speedy');
	dialog.addFooterLink('Twinkle help', 'WP:TW/DOC#speedy');
	dialog.addFooterLink('フィードバック', 'User talk:Syunsyunminmin/Twinkle');

	var form = new Morebits.quickForm(callbackfunc, Twinkle.getPref('speedySelectionStyle') === 'radioClick' ? 'change' : null);
	if (Morebits.userIsSysop) {
		form.append({
			type: 'checkbox',
			list: [
				{
					label: 'タグ付けのみ行い削除しない',
					value: 'tag_only',
					name: 'tag_only',
					tooltip: '今すぐページを削除するのではなく、タグ付けだけしたい場合',
					checked: !(Twinkle.speedy.hasCSD || Twinkle.getPref('deleteSysopDefaultToDelete')),
					event: function(event) {
						var cForm = event.target.form;
						var cChecked = event.target.checked;
						// enable talk page checkbox
						if (cForm.talkpage) {
							cForm.talkpage.checked = !cChecked && Twinkle.getPref('deleteTalkPageOnDelete');
						}
						// enable redirects checkbox
						cForm.redirects.checked = !cChecked;
						// enable delete multiple
						cForm.delmultiple.checked = false;
						// enable notify checkbox
						cForm.notify.checked = cChecked;
						// enable deletion notification checkbox
						cForm.warnusertalk.checked = !cChecked && !Twinkle.speedy.hasCSD;
						// enable multiple
						cForm.multiple.checked = false;

						Twinkle.speedy.callback.modeChanged(cForm);

						event.stopPropagation();
					}
				}
			]
		});

		var deleteOptions = form.append({
			type: 'div',
			name: 'delete_options'
		});
		deleteOptions.append({
			type: 'header',
			label: '削除関係のオプション'
		});
		if (mw.config.get('wgNamespaceNumber') % 2 === 0 && (mw.config.get('wgNamespaceNumber') !== 2 || (/\//).test(mw.config.get('wgTitle')))) {  // hide option for user pages, to avoid accidentally deleting user talk page
			deleteOptions.append({
				type: 'checkbox',
				list: [
					{
						label: 'トークページも削除',
						value: 'talkpage',
						name: 'talkpage',
						tooltip: "This option deletes the page's talk page in addition. If you choose the F8 (moved to Commons) criterion, this option is ignored and the talk page is *not* deleted.",
						checked: Twinkle.getPref('deleteTalkPageOnDelete'),
						event: function(event) {
							event.stopPropagation();
						}
					}
				]
			});
		}
		deleteOptions.append({
			type: 'checkbox',
			list: [
				{
					label: 'リダイレクトも削除',
					value: 'redirects',
					name: 'redirects',
					tooltip: 'This option deletes all incoming redirects in addition. Avoid this option for procedural (e.g. move/merge) deletions.',
					checked: Twinkle.getPref('deleteRedirectsOnDelete'),
					event: function (event) {
						event.stopPropagation();
					}
				},
				{
					label: 'Delete under multiple criteria',
					value: 'delmultiple',
					name: 'delmultiple',
					tooltip: 'When selected, you can select several criteria that apply to the page. For example, G11 and A7 are a common combination for articles.',
					event: function(event) {
						Twinkle.speedy.callback.modeChanged(event.target.form);
						event.stopPropagation();
					}
				},
				{
					label: 'ページの削除を初版立項者に通知する',
					value: 'warnusertalk',
					name: 'warnusertalk',
					tooltip: 'A notification template will be placed on the talk page of the creator, IF you have a notification enabled in your Twinkle preferences ' +
						'for the criterion you choose AND this box is checked. The creator may be welcomed as well.',
					checked: !Twinkle.speedy.hasCSD,
					event: function(event) {
						event.stopPropagation();
					}
				}
			]
		});
	}

	var tagOptions = form.append({
		type: 'div',
		name: 'tag_options'
	});

	if (Morebits.userIsSysop) {
		tagOptions.append({
			type: 'header',
			label: '削除関係のオプション'
		});
	}

	tagOptions.append({
		type: 'checkbox',
		list: [
			{
				label: '可能であれば初版立項者に通知する',
				value: 'notify',
				name: 'notify',
				tooltip: '選択した基準に対して個人設定で有効になっており、またこのボックスがチェックされている場合、通知テンプレートが作成者の会話ページに追加されます。',
				checked: !Morebits.userIsSysop || !(Twinkle.speedy.hasCSD || Twinkle.getPref('deleteSysopDefaultToDelete')),
				event: function(event) {
					event.stopPropagation();
				}
			},
			{
				label: 'Tag with multiple criteria',
				value: 'multiple',
				name: 'multiple',
				tooltip: 'When selected, you can select several criteria that apply to the page. For example, G11 and A7 are a common combination for articles.',
				event: function(event) {
					Twinkle.speedy.callback.modeChanged(event.target.form);
					event.stopPropagation();
				}
			},
			{
				label: 'ベージを白紙化する',
				value: 'blankpage',
				name: 'blankpage',
				tooltip: '削除タグを貼り付ける前にページを白紙化します。',
				event: function(event) {
					event.stopPropagation();
				}
			},
			{
				label: 'コメントを追加する',
				value: 'add_comments',
				name: 'add_comments',
				tooltip: 'コメントを追加する',
				subgroup: {
					name: 'additional_comments',
					type: 'input',
					label: 'コメント:',
					size: 60
				},
				event: function(event) {
					event.stopPropagation();
				}
			},
			{
				label: 'ユーザーログを残さない',
				value: 'notsavelog',
				name: 'notsavelog',
				tooltip: 'Twinkle設定でユーザーログを有効にしている場合、この項目にチェックすることでユーザーログを残さないようにします。' +
						'不適切な記事名など、ログを保持したくない場合に使用してください。',
				event: function(event) {
					event.stopPropagation();
				}
			}
		]
	});

	form.append({
		type: 'div',
		id: 'prior-deletion-count',
		style: 'font-style: italic'
	});

	form.append({
		type: 'div',
		name: 'work_area',
		label: 'CSDモジュールの初期化に失敗しました。もう一度試すか、Twinkleの開発者に問題を伝えてください。'
	});

	if (Twinkle.getPref('speedySelectionStyle') !== 'radioClick') {
		form.append({ type: 'submit', className: 'tw-speedy-submit' }); // Renamed in modeChanged
	}

	var result = form.render();
	dialog.setContent(result);
	dialog.display();

	Twinkle.speedy.callback.modeChanged(result);

	// Check for prior deletions.  Just once, upon init
	Twinkle.speedy.callback.priorDeletionCount();
};

Twinkle.speedy.callback.modeChanged = function twinklespeedyCallbackModeChanged(form) {
	var namespace = mw.config.get('wgNamespaceNumber');

	// first figure out what mode we're in
	var mode = {
		isSysop: !!form.tag_only && !form.tag_only.checked,
		isMultiple: form.tag_only && !form.tag_only.checked ? form.delmultiple.checked : form.multiple.checked,
		isRadioClick: Twinkle.getPref('speedySelectionStyle') === 'radioClick'
	};

	if (mode.isSysop) {
		$('[name=delete_options]').show();
		$('[name=tag_options]').hide();
		$('button.tw-speedy-submit').text('削除');
	} else {
		$('[name=delete_options]').hide();
		$('[name=tag_options]').show();
		$('button.tw-speedy-submit').text('タグ付け');
	}

	var work_area = new Morebits.quickForm.element({
		type: 'div',
		name: 'work_area'
	});

	if (mode.isMultiple && mode.isRadioClick) {
		var evaluateType = mode.isSysop ? 'evaluateSysop' : 'evaluateUser';

		work_area.append({
			type: 'div',
			label: '基準を選択し終わったら、クリック:'
		});
		work_area.append({
			type: 'button',
			name: 'submit-multiple',
			label: mode.isSysop ? 'ページを削除' : 'ページにタグ付け',
			event: function(event) {
				Twinkle.speedy.callback[evaluateType](event);
				event.stopPropagation();
			}
		});
	}

	var appendList = function(headerLabel, csdList) {
		work_area.append({ type: 'header', label: headerLabel });
		work_area.append({ type: mode.isMultiple ? 'checkbox' : 'radio', name: 'csd', list: Twinkle.speedy.generateCsdList(csdList, mode) });
	};

	if (mode.isSysop && !mode.isMultiple) {
		appendList('その他の基準', Twinkle.speedy.customRationale);
	}

	if (!Morebits.isPageRedirect()) {
		switch (namespace) {
			case 0:  // article
			case 1:  // talk
				appendList('記事', Twinkle.speedy.articleList);
				break;

			case 2:  // user
			case 3:  // user talk
				appendList('利用者ページ', Twinkle.speedy.userList);
				break;

			case 6:  // file
			case 7:  // file talk
				appendList('ファイル', Twinkle.speedy.fileList);
				if (!mode.isSysop) {
					work_area.append({ type: 'div', label: '{{No source}}または{{No license}}のタグ付けは、Twinkleの "DI "タブを使って行うことができます。' });
				}
				break;

			case 14:  // category
			case 15:  // category talk
				appendList('カテゴリ', Twinkle.speedy.categoryList);
				break;

			default:
				break;
		}
	} else {
		if (namespace === 2 || namespace === 3) {
			appendList('利用者ページ', Twinkle.speedy.userList);
		}
		appendList('リダイレクト', Twinkle.speedy.redirectList);
	}

	var generalCriteria = Twinkle.speedy.generalList;

	// custom rationale lives under general criteria when tagging
	if (!mode.isSysop) {
		generalCriteria = Twinkle.speedy.customRationale.concat(generalCriteria);
	}
	appendList('全般', generalCriteria);

	var old_area = Morebits.quickForm.getElements(form, 'work_area')[0];
	form.replaceChild(work_area.render(), old_area);

	// if sysop, check if CSD is already on the page and fill in custom rationale
	if (mode.isSysop && Twinkle.speedy.hasCSD) {
		var customOption = $('input[name=csd][value=その他]')[0];
		if (customOption) {
			if (Twinkle.getPref('speedySelectionStyle') !== 'radioClick') {
				// force listeners to re-init
				customOption.click();
				customOption.parentNode.appendChild(customOption.subgroup);
			}
			customOption.subgroup.querySelector('input').value = decodeURIComponent($('#delete-reason').text()).replace(/\+/g, ' ');
		}
	}
};

Twinkle.speedy.callback.priorDeletionCount = function () {
	var query = {
		action: 'query',
		format: 'json',
		list: 'logevents',
		letype: 'delete',
		leaction: 'delete/delete', // Just pure page deletion, no redirect overwrites or revdel
		letitle: mw.config.get('wgPageName'),
		leprop: '', // We're just counting we don't actually care about the entries
		lelimit: 5  // A little bit goes a long way
	};

	new Morebits.wiki.api('過去の削除を確認', query, function(apiobj) {
		var response = apiobj.getResponse();
		var delCount = response.query.logevents.length;
		if (delCount) {
			var message = delCount + '回' + (response.continue ? '以上' : '') + '過去に削除';

			// 3+ seems problematic
			if (delCount >= 3) {
				$('#prior-deletion-count').css('color', 'red');
			}

			// Provide a link to page logs (CSD templates have one for sysops)
			var link = Morebits.htmlNode('a', '(記録)');
			link.setAttribute('href', mw.util.getUrl('Special:Log', {page: mw.config.get('wgPageName')}));
			link.setAttribute('target', '_blank');

			$('#prior-deletion-count').text(message + ' '); // Space before log link
			$('#prior-deletion-count').append(link);
		}
	}).post();
};


Twinkle.speedy.generateCsdList = function twinklespeedyGenerateCsdList(list, mode) {

	var pageNamespace = mw.config.get('wgNamespaceNumber');

	var openSubgroupHandler = function(e) {
		$(e.target.form).find('input').prop('disabled', true);
		$(e.target.form).children().css('color', 'gray');
		$(e.target).parent().css('color', 'black').find('input').prop('disabled', false);
		$(e.target).parent().find('input:text')[0].focus();
		e.stopPropagation();
	};
	var submitSubgroupHandler = function(e) {
		var evaluateType = mode.isSysop ? 'evaluateSysop' : 'evaluateUser';
		Twinkle.speedy.callback[evaluateType](e);
		e.stopPropagation();
	};

	return $.map(list, function(critElement) {
		var criterion = $.extend({}, critElement);

		if (mode.isMultiple) {
			if (criterion.hideWhenMultiple) {
				return null;
			}
			if (criterion.hideSubgroupWhenMultiple) {
				criterion.subgroup = null;
			}
		} else {
			if (criterion.hideWhenSingle) {
				return null;
			}
			if (criterion.hideSubgroupWhenSingle) {
				criterion.subgroup = null;
			}
		}

		if (mode.isSysop) {
			if (criterion.hideWhenSysop) {
				return null;
			}
			if (criterion.hideSubgroupWhenSysop) {
				criterion.subgroup = null;
			}
		} else {
			if (criterion.hideWhenUser) {
				return null;
			}
			if (criterion.hideSubgroupWhenUser) {
				criterion.subgroup = null;
			}
		}

		if (Morebits.isPageRedirect() && criterion.hideWhenRedirect) {
			return null;
		}

		if (criterion.showInNamespaces && criterion.showInNamespaces.indexOf(pageNamespace) < 0) {
			return null;
		}
		if (criterion.hideInNamespaces && criterion.hideInNamespaces.indexOf(pageNamespace) > -1) {
			return null;
		}

		if (criterion.subgroup && !mode.isMultiple && mode.isRadioClick) {
			if (Array.isArray(criterion.subgroup)) {
				criterion.subgroup = criterion.subgroup.concat({
					type: 'button',
					name: 'submit',
					label: mode.isSysop ? 'ページを削除' : 'ページをタグ付け',
					event: submitSubgroupHandler
				});
			} else {
				criterion.subgroup = [
					criterion.subgroup,
					{
						type: 'button',
						name: 'submit',  // ends up being called "csd.submit" so this is OK
						label: mode.isSysop ? 'ページを削除' : 'ページをタグ付け',
						event: submitSubgroupHandler
					}
				];
			}
			// FIXME: does this do anything?
			criterion.event = openSubgroupHandler;
		}

		return criterion;
	});
};

Twinkle.speedy.customRationale = [
	{
		label: 'その他の基準。' + (Morebits.userIsSysop ? ' (カスタムの削除理由)' : '{{即時削除|その他}}を使用します。'),
		value: 'その他',
		tooltip: !Morebits.userIsSysop ? '明らかに即時削除の方針の基準に合致しているが、各基準番号のテンプレートでどうしても呼び出せない場合など、どうしても各基準番号のテンプレートを利用できないようなやむを得ない場合の救済措置です。' : '',
		subgroup: {
			name: 'reason_1',
			type: 'input',
			label: '即時削除の方針に合致していることの説明:',
			size: 60
		}
	}
];

Twinkle.speedy.fileList = [
	{
		label: 'F1-2: コモンズと重複（コピー）',
		value: 'ファイル1-2',
		tooltip: '同名のファイルが日本語版ウィキペディアに存在しウィキメディア・コモンズから表示できない場合は除きます。',
		subgroup: {
			name: 'redundantcopy_filename',
			type: 'input',
			label: 'コモンズでのファイル名:',
			tooltip: '接頭辞"File:"は省略してください',
			value: Morebits.pageNameNorm
		}
	},
	{
		label: 'F1-3: コモンズと重複（他プロジェクト由来）',
		value: 'ファイル1-3',
		tooltip: '他プロジェクト由来のファイルで、次の条件を全て満たすもの。(1) ウィキメディア・コモンズのファイル説明ページでそのプロジェクトを正しく出典元として掲示されている。(2) 出典元のファイル、ウィキメディア・コモンズのファイル、および日本語版のファイルのすべてに変更が加えられていないもの。',
		subgroup: {
			name: 'redundantproject_filename',
			type: 'input',
			label: 'コモンズでのファイル名:',
			tooltip: '接頭辞"File:"は省略してください',
			value: Morebits.pageNameNorm
		}
	},
	{
		label: 'F1-4: コモンズと重複（同一投稿者）',
		value: 'ファイル1-4',
		tooltip: 'ウィキメディア・コモンズに、日本語版ウィキペディアと同一の投稿者によって投稿されたもの',
		subgroup: {
			name: 'redundantauthor_filename',
			type: 'input',
			label: 'コモンズでのファイル名:',
			tooltip: '接頭辞"File:"は省略してください',
			value: Morebits.pageNameNorm
		}
	},
	{
		label: 'F1-5: コモンズへ移動',
		value: 'ファイル1-5',
		tooltip: '次の条件を全て満たす、ウィキメディア・コモンズへコピーされたファイル。(1) コモンズのファイルページの初版に、ウィキペディア日本語版に記載されていたファイルの作者名、投稿日時、ライセンス情報が正確に転記されている。(2) コモンズのファイルページの初版または最新版に、ウィキペディア日本語版に記載されていた更新履歴、ページ内の説明文などを含む全てのファイル情報が記載されている。',
		subgroup: {
			name: 'movetocommons_filename',
			type: 'input',
			label: 'コモンズでのファイル名:',
			tooltip: '接頭辞"File:"は省略してください',
			value: Morebits.pageNameNorm
		}
	},
	{
		label: 'F1-6: 転送元・転送先がコモンズと同一構造のファイルリダイレクト',
		value: 'ファイル1-6',
		tooltip: '転送元・転送先がコモンズと同一構造のファイルリダイレクトで、ローカルに転送先が存在しないもの',
		subgroup: {
			name: 'redir_filename',
			type: 'input',
			label: '転送先のファイル名:',
			tooltip: '接頭辞"File:"は省略してください'
		}
	},
	{
		label: 'F3: 重複ファイル',
		value: 'ファイル3',
		tooltip: '同じ様なファイルがあるという意味ではなく、ファイル名が違うだけで全く同じファイルを指します。',
		subgroup: {
			name: 'redundantimage_filename',
			type: 'input',
			label: '重複先のファイル名:',
			tooltip: '接頭辞"File:"は省略してください'
		}
	},
	{
		label: 'F5: 出典またはライセンス不明のまま1週間経過',
		value: 'ファイル5',
		tooltip: '次の各条件を全て満たすもの。(1) {{No source}}、{{No license}}の各タグが貼り付けられており、貼り付けから一週間以上経過している。(2) {{Image source}}等で投稿者に通知されており、通知から一週間以上経過している。当該のファイルについて個別に通知されている必要はなく、過去に同様な通知がされているならば、その時点から一週間が経過していればよい。',
		subgroup: {
			name: 'notify_talkname',
			type: 'input',
			label: '投稿者への通知先:'
		}
	},
	{
		label: 'F6: 自由利用できないファイル',
		value: 'ファイル6',
		tooltip: 'ファイルの内容およびファイルページの記述によれば、著作権法上の理由により自由利用できないことが明らかであって、自由利用できないファイルの受け入れ方針にも適合しないファイル。ただし、ファイルページや記事の編集、改変したファイルの再アップロードなどの対応によって、自由利用できないファイルの受け入れ方針への違反状態を解消できる可能性がある場合には、当該ファイルページおよび投稿者の会話ページへの通知から一定期間が経過しても、依然として違反状態が解消されないことを条件として削除する。',
		subgroup: {
			name: 'unfree_filename',
			type: 'input',
			label: '自由利用ができない根拠:'
		}
	},
	{
		label: 'F7: コモンズのファイルページ',
		value: 'ファイル7',
		tooltip: 'ウィキメディア・コモンズから呼び出しているファイル（秀逸な画像に選出された画像を除く）のファイルページ。ただし、有意な内容があるものについては、ウィキメディア・コモンズに転記した後に削除するものとする。'
	},
	{
		label: 'F8: ファイルが存在しないファイルページ',
		value: 'ファイル8',
		tooltip: 'ローカルのファイルページ自体にアップロードされたメディアがない非リダイレクト。ただし、サーバ等のエラーによって一時的にファイルが見つからなくなっている場合があるので注意すること。'
	},
	{
		label: 'F9: 初版投稿後7日以内の投稿者による依頼',
		value: 'ファイル9',
		tooltip: 'ファイルの投稿者自身によって、初版投稿時から168時間（7日間）以内に {{即時削除}} 貼付が行われたもので、リンク元がないか、そのページが削除されても問題のないリンクのみ（例えば削除依頼からのリンクなど）のもの。'
	}
];

Twinkle.speedy.articleList = [
	{
		label: 'A1: 定義になっていない、あるいは文章になっていないもの',
		value: '記事1',
		tooltip: '定義がないということの意味は「『項目名は○○である』という定義文がない」という意味ではありません。冒頭に定型定義文がないことは、即時削除の理由とはなりません。また、定義文があっても百科事典としての解説に足る定義がないものは、対象となります。(1) 項目名だけ書いてあるもの。(2) 言語間リンク・カテゴリ・外部リンクのみのページ。(3) 文章になっているが、定義になっていないもの（例：「彼は非常に有名で多くの人に慕われていた。死ぬまでに3冊の本を書いて社会に貢献した。」）。(4) その他、単なる単語の羅列等。'
	}
];

Twinkle.speedy.categoryList = [
	{
		label: 'C1: 初版からリダイレクト',
		value: 'カテゴリ1',
		tooltip: '初版から継続して他のページへのリダイレクトであるもの。ただし、カテゴリページの移動により生成されたリダイレクトを除く。移動により生成されたリダイレクトは、C6の適用を検討してください。'
	},
	{
		label: 'C3: 私的カテゴリ',
		value: 'カテゴリ3',
		tooltip: '「Category:利用者:（利用者名）」のような、私的カテゴリ'
	},
	{
		label: 'C6: 改名・統合等による事前合意を経て未使用となったカテゴリ',
		value: 'カテゴリ6',
		tooltip: '事前の所定の議論による合意に基づく、移行（改名・統合）先へのカテゴリ変更により、空カテゴリとなったもの（統合には複数の異なる移行先への吸収合併を含む）',
		subgroup: {
			name: 'catdesc',
			type: 'input',
			label: '議論場所:',
			tooltip: '"[[]]"は外して入力してください。例: プロジェクト:カテゴリ関連/議論/20xx年/x月x日#議論セクション'
		}
	}
];

Twinkle.speedy.userList = [
	{
		label: 'U1: 本人希望',
		value: '利用者ページ1',
		tooltip: '他の利用者の編集が入っているものについては、会話ページとして使用されてきた履歴があるもの（会話ページからの移動により作成された過去ログなど）を除き即時削除対象とする。'
	},
	{
		label: 'U2: 登録されていない利用者の利用者ページ',
		value: '利用者ページ2',
		tooltip: 'Wikipedia日本語版に利用者登録されていない利用者の利用者ページ、会話ページ。サブページを含む。利用者名変更により生じたリダイレクトは対象外とする。'
	},
	{
		label: 'U3: IP利用者の利用者ページ',
		value: '利用者ページ3',
		tooltip: 'IP利用者の利用者ページ / 利用者ページのサブページ。',
		hideWhenRedirect: true
	}
];

Twinkle.speedy.generalList = [
	{
		label: 'G1: 意味不明な内容のページ',
		value: '全般1',
		tooltip: '内容が全く意味をもっておらず理解することができないページ。',
		hideInNamespaces: [ 2 ] // Not applicable in userspace
	},
	{
		label: 'G2: テストページ',
		value: '全般2',
		tooltip: '編集やその他のウィキペディアの機能をテストするために作成されたページ。 User名前空間のページは含まれていません。',
		hideInNamespaces: [ 2 ] // Not applicable in userspace
	},
	{
		label: 'G3: 荒らし投稿',
		value: '全般3',
		tooltip: '純粋な破壊行為のページ。'
	},
	{
		label: 'G4: 露骨な宣伝・広告のみが目的',
		value: '全般4',
		tooltip: '露骨な宣伝・広告のみが目的と思われるページ。特定商品の宣伝・広告で全文が占められているものや、百科事典的な記事にするためには根本的に書き換える必要があるもののことです。単に企業あるいは製品を主題とした記事に関してはこの方針における削除対象にはならないことにご注意ください。また、立項アカウントが記事名（人名・団体名など）と同じということは即時削除理由になりません。',
		subgroup: {
			name: 'spam_reason',
			type: 'input',
			label: '「露骨な宣伝・広告のみが目的」と判断される根拠:',
			size: 60
		}
	},
	{
		label: 'G5: 削除されたページの改善なき再作成',
		value: '全般5',
		tooltip: '過去に削除依頼を経て削除されたページや文章・ファイルなどについて、その削除理由となった問題点が解消されていないものの再投稿。過去に削除審議を経ずして削除されたもの（削除依頼を一度も経ておらず、即時削除された履歴しかないもの）には適用されません。再作成された項目に、この条項以外の理由による即時削除理由が存在すれば、その即時削除理由を附して、再度の即時削除を求めることはできます。',
		subgroup: {
			name: 'repost_xfd',
			type: 'input',
			label: '削除の議論が行われたページ:',
			tooltip: '"Wikipedia:削除依頼/"は外して書く必要があります。"',
			size: 60
		}
	},
	{
		label: 'G6: ウィキペディア内のコピペ',
		value: '全般6',
		tooltip: 'ウィキペディア（他言語版を含む）内ページのコピー&ペーストによって作成された、またはリダイレクトなどが上書きされ記事となったページで、ペースト後に意味のある加筆が行われていないもの。ただし翻訳や分割などコピー&ペーストが有意な目的のためになされており、かつ必要な履歴継承もなされている場合は除きます。また、移動すべき場合にもかかわらずコピー&ペーストにより作成されたページについても削除の対象となります。',
		hideInNamespaces: [ 6 ], // Not applicable in filespace
		subgroup: [
			{
				name: 'original_page',
				type: 'input',
				label: 'コピペ元ページ名:'
			},
			{
				name: 'language_code',
				type: 'input',
				label: '言語コード:',
				tooltip: '日本語版の場合は指定不要です。',
				size: 60
			}
		]
	},
	{
		label: 'G8: 初版投稿者による依頼または白紙化',
		value: '全般8',
		tooltip: '初版投稿者または初めて有益な記述が行われた版の投稿者自身によって{{即時削除}}添付または白紙化が行われたもので、次の要件全てを満たしているもの: (1)ページの履歴にその投稿者の投稿しかない、あるいは、誤字脱字の訂正、カテゴリやリンクの追加など、ごく単純な編集しかないもの(2)移動により自動生成されたリダイレクトでないこと(3)ファイル名前空間ではないもの※ファイル名前空間の場合はファイル9で扱います。',
		hideInNamespaces: [ 6 ] // Not applicable in filespace
	},
	{
		label: 'G9: 明白な著作権侵害',
		value: '全般9',
		tooltip: '次の条件を全て満たしており、著作権侵害が明白であると判断されるもの。次のうち1つでも当てはまらない可能性がある場合は削除依頼に回してください。(1)ウェブ上で認証なしで閲覧できるページからの完全な複製であるもの（翻案は含まない）(2)初版からほぼ全ての版において著作権侵害が認められ、著作権侵害部分を除去した場合に記事として成り立たないもの(3)自著作物の持ち込みでないことが明白であるもの(4)複製部分に明確な著作物性が認められるもの（きわめて短い文章、事実の羅列、リスト、表、年表、略歴等は含まない）(5)複製部分の著作権が保護期間内であることが明らかであるもの(6)複製元であるウェブページが著作権を有していることが明白であるもの（ウィキペディアもしくは他のウィキメディア・プロジェクトを含む、複製元ウェブページ以外のウェブサイトをソースとするものは含まない）(7)GFDLとCC BY-SA 3.0のデュアルライセンスで利用できないことが明らかであり、適切な引用とも認められないもの以上のうち1つでも当てはまらない可能性がある場合は削除依頼に回してください。',
		subgroup: {
			name: 'copyvio_url',
			type: 'input',
			label: '著作権の侵害元ページのURL:',
			tooltip: '「http://」または「https://」プロトコルを含むURLを入力してください。',
			size: 60
		}
	},
	{
		label: 'G10: <a href="https://ja.wikipedia.org/wiki/WP:CSD/G10" target="_blank">WP:CSD/G10</a>に掲載されている特定の荒らしが作成したページ',
		value: '全般10',
		tooltip: 'Wikipedia:即時削除の方針/全般10に掲載されている荒らしが作成したページで、「ページの履歴にLTAまたはVIPの投稿しかない、あるいは、他利用者の履歴があっても、それが誤字脱字の訂正、カテゴリやリンクの追加など、ごく単純な編集でしかないもの」に該当しているもの。記事としての履歴がないリダイレクトのリダイレクト起こしも含む。',
		subgroup: {
			name: 'banned_user',
			type: 'input',
			label: '荒らしの名称:',
			size: 40
		}
	}
];

Twinkle.speedy.redirectList = [
	{
		label: 'R1-1: 直接関係のないページへのリダイレクト',
		value: 'リダイレクト1-1',
		tooltip: '赤リンクへのリダイレクトは、必ずしも即時削除の理由とはなりません。'
	},
	{
		label: 'R1-2: 単純な書き誤り',
		value: 'リダイレクト1-2',
		tooltip: 'よくある間違いや表記揺れの場合は、リダイレクトのまま存続となることがあります。少しでも微妙であればリダイレクトの削除依頼に提出してください。(1) 名前空間名の書き誤りなど - 存在しない名前空間のものなど。(2) 名前空間を間違えて移動したことによる残骸ページ。(3) 字体の似たひらがな・カタカナ・漢字等の取り違え。',
		subgroup: {
			name: 'err_reason',
			type: 'input',
			label: '書き誤り箇所:',
			size: 40
		}
	},
	{
		label: 'R1-3: 転送先がないリダイレクトであって、他のページへのリダイレクトに変更できないもの',
		value: 'リダイレクト1-3',
		tooltip: 'ページ名の別名や略称など。ただし単に「現在の転送先が存在しない」というだけでは即時削除の対象となりません。転送先が変更できないか判断に迷う場合はリダイレクトの削除依頼へ提出してください。'
	},
	{
		label: 'R1-4: 他プロジェクトへのリダイレクト',
		value: 'リダイレクト1-4',
		tooltip: '転送先がプロジェクト接頭辞（「en:」など）を含むものに限る'
	},
	{
		label: 'R2-1: 半角と全角の使い分け違反',
		value: 'リダイレクト2-1',
		tooltip: '全角と半角の使い分けに反する半角カタカナ、全角英数字、全角スペースなどを使用しているもの',
		subgroup: {
			name: 'width_character',
			type: 'input',
			label: '使い分けが間違っている文字:',
			size: 40
		}
	},
	{
		label: 'R2-2: 作品名を鍵括弧等でくくったもの',
		value: 'リダイレクト2-2',
		tooltip: '作品名を「」または『』などでくくっているもの'
	},
	{
		label: 'R2-3: 作品名以外の記事名における読み・別表記等の併記',
		value: 'リダイレクト2-3',
		tooltip: '項目名に、読みがな、別名、別表記、原語を付記しているもの。作品名については読み等までを含めて正式名称である可能性を考慮し、リダイレクトの削除依頼で削除してください。'
	},
	{
		label: 'R2-5: 曖昧さ回避括弧の使い方違反',
		value: 'リダイレクト2-5',
		tooltip: '(1) 項目名に曖昧さ回避の括弧を使用する場合に、左括弧の前に半角スペースがない、または、半角丸括弧以外を使用しているもの。(2) 曖昧さ回避括弧の中に曖昧さ回避括弧を含むもの。',
		subgroup: {
			name: 'usage_violation',
			type: 'input',
			label: '使い方の違反内容:',
			size: 40
		}
	},
	{
		label: 'R2-6: 漢字表記人名の姓名間の空白',
		value: 'リダイレクト2-6',
		tooltip: '漢字で表記される人物の記事名で、姓と名の間に、半角全角かかわらず空白が入っているもの'
	},
	{
		label: 'R4: 唯一の投稿者による移動の残骸で本人依頼のもの',
		value: 'リダイレクト4',
		tooltip: '漢字で表記される人物の記事名で、姓と名の間に、半角全角かかわらず空白が入っているもの'
	}
];

Twinkle.speedy.normalizeHash = {
	'その他': 'db',
	'全般1': 'g1',
	'全般2': 'g2',
	'全般3': 'g3',
	'全般4': 'g4',
	'全般5': 'g5',
	'全般5 (リダイレクト)': 'g5-r',
	'全般6': 'g6',
	'全般8': 'g8',
	'全般9': 'g9',
	'全般10': 'g10',
	'記事1': 'a1',
	'利用者ページ1': 'u1',
	'利用者ページ2': 'u2',
	'利用者ページ3': 'u3',
	'カテゴリ1': 'c1',
	'カテゴリ3': 'c3',
	'カテゴリ6': 'c6',
	'ファイル1-2': 'f1-2',
	'ファイル1-3': 'f1-3',
	'ファイル1-4': 'f1-4',
	'ファイル1-5': 'f1-5',
	'ファイル1-6': 'f1-6',
	'ファイル3': 'f3',
	'ファイル5': 'f5',
	'ファイル6': 'f6',
	'ファイル7': 'f7',
	'ファイル8': 'f8',
	'ファイル9': 'f9',
	'リダイレクト1-1': 'r1-1',
	'リダイレクト1-2': 'r1-2',
	'リダイレクト1-3': 'r1-3',
	'リダイレクト1-4': 'r1-4',
	'リダイレクト2-1': 'r2-1',
	'リダイレクト2-2': 'r2-2',
	'リダイレクト2-3': 'r2-3',
	'リダイレクト2-5': 'r2-5',
	'リダイレクト2-6': 'r2-6',
	'リダイレクト4': 'r4'
};

Twinkle.speedy.callbacks = {
	getTemplateCodeAndParams: function(params) {
		var code, parameters, i;
		if (params.normalizeds.length > 1) {
			code = '{{db-multiple';
			params.utparams = {};
			$.each(params.normalizeds, function(index, norm) {
				code += '|' + norm.toUpperCase();
				parameters = params.templateParams[index] || [];
				for (var i in parameters) {
					if (typeof parameters[i] === 'string' && !parseInt(i, 10)) {  // skip numeric parameters - {{db-multiple}} doesn't understand them
						code += '|' + i + '=' + parameters[i];
					}
				}
				$.extend(params.utparams, Twinkle.speedy.getUserTalkParameters(norm, parameters));
			});
			code += '}}';
		} else {
			parameters = params.templateParams[0] || [];
			code = '{{即時削除|1=' + params.values[0];
			for (i in parameters) {
				if (typeof parameters[i] === 'string') {
					code += '|' + i + '=' + parameters[i];
				}
			}
			code += '}}';
			params.utparams = Twinkle.speedy.getUserTalkParameters(params.normalizeds[0], parameters);
		}
		console.log(code);
		console.log(params.utparams);

		return [code, params.utparams];
	},

	parseWikitext: function(wikitext, callback) {
		var query = {
			action: 'parse',
			prop: 'text',
			pst: 'true',
			text: wikitext,
			contentmodel: 'wikitext',
			title: mw.config.get('wgPageName'),
			disablelimitreport: true,
			format: 'json'
		};

		var statusIndicator = new Morebits.status('Building deletion summary');
		var api = new Morebits.wiki.api('Parsing deletion template', query, function(apiobj) {
			var reason = decodeURIComponent($(apiobj.getResponse().parse.text).find('#delete-reason').text()).replace(/\+/g, ' ');
			if (!reason) {
				statusIndicator.warn('Unable to generate summary from deletion template');
			} else {
				statusIndicator.info('complete');
			}
			callback(reason);
		}, statusIndicator);
		api.post();
	},

	noteToCreator: function(pageobj) {
		var params = pageobj.getCallbackParameters();
		var initialContrib = pageobj.getCreator();

		// disallow notifying yourself
		if (initialContrib === mw.config.get('wgUserName')) {
			Morebits.status.warn('あなた (' + initialContrib + ') がこのページを作成しました; skipping user notification');
			initialContrib = null;

		// don't notify users when their user talk page is nominated/deleted
		} else if (initialContrib === mw.config.get('wgTitle') && mw.config.get('wgNamespaceNumber') === 3) {
			Morebits.status.warn('Notifying initial contributor: this user created their own user talk page; skipping notification');
			initialContrib = null;

		// quick hack to prevent excessive unwanted notifications, per request. Should actually be configurable on recipient page...
		} else if ((initialContrib === 'Cyberbot I' || initialContrib === 'SoxBot') && params.normalizeds[0] === 'f2') {
			Morebits.status.warn('Notifying initial contributor: page created procedurally by bot; skipping notification');
			initialContrib = null;

		// Check for already existing tags
		} else if (Twinkle.speedy.hasCSD && params.warnUser && !confirm('The page is has a deletion-related tag, and thus the creator has likely been notified.  Do you want to notify them for this deletion as well?')) {
			Morebits.status.info('Notifying initial contributor', 'canceled by user; skipping notification.');
			initialContrib = null;
		}

		if (initialContrib) {
			var usertalkpage = new Morebits.wiki.page('User talk:' + initialContrib, 'Notifying initial contributor (' + initialContrib + ')'),
				notifytext, i, editsummary;

			// special cases: "db" and "db-multiple"
			if (params.normalizeds.length > 1) {
				notifytext = '\n{{subst:db-' + (params.warnUser ? 'deleted' : 'notice') + '-multiple|1=' + Morebits.pageNameNorm;
				var count = 2;
				$.each(params.normalizeds, function(index, norm) {
					notifytext += '|' + count++ + '=' + norm.toUpperCase();
				});
			} else if (params.normalizeds[0] === 'db') {
				notifytext = '\n{{subst:db-reason-' + (params.warnUser ? 'deleted' : 'notice') + '|1=' + Morebits.pageNameNorm;
			} else {
				notifytext = '\n{{subst:db-csd-' + (params.warnUser ? 'deleted' : 'notice') + '-custom|1=' + Morebits.pageNameNorm + '|2=' + params.values[0];
			}

			for (i in params.utparams) {
				if (typeof params.utparams[i] === 'string') {
					notifytext += '|' + i + '=' + params.utparams[i];
				}
			}
			notifytext += (params.welcomeuser ? '' : '|nowelcome=yes') + '}} ~~~~';

			editsummary = '通知: ページ';
			if (!params.notsavelog) {  // ログに残さない設定の場合、通知時もページ名は記載しない。
				editsummary += ' [[:' + Morebits.pageNameNorm + ']] ';
			}
			editsummary += 'の即時削除' + (params.warnUser ? '' : 'への指定');

			usertalkpage.setAppendText(notifytext);
			usertalkpage.setEditSummary(editsummary);
			usertalkpage.setChangeTags(Twinkle.changeTags);
			usertalkpage.setCreateOption('recreate');
			usertalkpage.setWatchlist(Twinkle.getPref('watchSpeedyUser'));
			usertalkpage.setFollowRedirect(true, false);
			usertalkpage.append(function onNotifySuccess() {
				// add this nomination to the user's userspace log, if the user has enabled it
				if (params.lognomination) {
					Twinkle.speedy.callbacks.user.addToLog(params, initialContrib);
				}
			}, function onNotifyError() {
				// if user could not be notified, log nomination without mentioning that notification was sent
				if (params.lognomination) {
					Twinkle.speedy.callbacks.user.addToLog(params, null);
				}
			});
		} else if (params.lognomination) {
			// log nomination even if the user notification wasn't sent
			Twinkle.speedy.callbacks.user.addToLog(params, null);
		}
	},

	sysop: {
		main: function(params) {
			var reason;
			if (!params.normalizeds.length && params.normalizeds[0] === 'db') {
				reason = prompt('Enter the deletion summary to use, which will be entered into the deletion log:', '');
				Twinkle.speedy.callbacks.sysop.deletePage(reason, params);
			} else {
				var code = Twinkle.speedy.callbacks.getTemplateCodeAndParams(params)[0];
				Twinkle.speedy.callbacks.parseWikitext(code, function(reason) {
					if (params.promptForSummary) {
						reason = prompt('Enter the deletion summary to use, or press OK to accept the automatically generated one.', reason);
					}
					Twinkle.speedy.callbacks.sysop.deletePage(reason, params);
				});
			}
		},
		deletePage: function(reason, params) {
			var thispage = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Deleting page');

			if (reason === null) {
				return Morebits.status.error('Asking for reason', 'User cancelled');
			} else if (!reason || !reason.replace(/^\s*/, '').replace(/\s*$/, '')) {
				return Morebits.status.error('Asking for reason', "you didn't give one.  I don't know... what with admins and their apathetic antics... I give up...");
			}

			var deleteMain = function(callback) {
				thispage.setEditSummary(reason);
				thispage.setChangeTags(Twinkle.changeTags);
				thispage.setWatchlist(params.watch);
				thispage.deletePage(function() {
					thispage.getStatusElement().info('done');
					typeof callback === 'function' && callback();
					Twinkle.speedy.callbacks.sysop.deleteTalk(params);
				});
			};

			// look up initial contributor. If prompting user for deletion reason, just display a link.
			// Otherwise open the talk page directly
			if (params.warnUser) {
				thispage.setCallbackParameters(params);
				thispage.lookupCreation(function(pageobj) {
					deleteMain(function() {
						Twinkle.speedy.callbacks.noteToCreator(pageobj);
					});
				});
			} else {
				deleteMain();
			}
		},
		deleteTalk: function(params) {
			// delete talk page
			if (params.deleteTalkPage &&
					params.normalized !== 'f8' &&
					!document.getElementById('ca-talk').classList.contains('new')) {
				var talkpage = new Morebits.wiki.page(mw.config.get('wgFormattedNamespaces')[mw.config.get('wgNamespaceNumber') + 1] + ':' + mw.config.get('wgTitle'), 'トークページの削除');
				talkpage.setEditSummary('削除された"' + Morebits.pageNameNorm + '"のトークページ');
				talkpage.setChangeTags(Twinkle.changeTags);
				talkpage.deletePage();
				// this is ugly, but because of the architecture of wiki.api, it is needed
				// (otherwise success/failure messages for the previous action would be suppressed)
				window.setTimeout(function() {
					Twinkle.speedy.callbacks.sysop.deleteRedirects(params);
				}, 1800);
			} else {
				Twinkle.speedy.callbacks.sysop.deleteRedirects(params);
			}
		},
		deleteRedirects: function(params) {
			// delete redirects
			if (params.deleteRedirects) {
				var query = {
					action: 'query',
					titles: mw.config.get('wgPageName'),
					prop: 'redirects',
					rdlimit: 'max', // 500 is max for normal users, 5000 for bots and sysops
					format: 'json'
				};
				var wikipedia_api = new Morebits.wiki.api('getting list of redirects...', query, Twinkle.speedy.callbacks.sysop.deleteRedirectsMain,
					new Morebits.status('Deleting redirects'));
				wikipedia_api.params = params;
				wikipedia_api.post();
			}

			// promote Unlink tool
			var $link, $bigtext;
			if (mw.config.get('wgNamespaceNumber') === 6 && params.normalized !== 'f8') {
				$link = $('<a/>', {
					href: '#',
					text: 'click here to go to the Unlink tool',
					css: { fontSize: '130%', fontWeight: 'bold' },
					click: function() {
						Morebits.wiki.actionCompleted.redirect = null;
						Twinkle.speedy.dialog.close();
						Twinkle.unlink.callback('Removing usages of and/or links to deleted file ' + Morebits.pageNameNorm);
					}
				});
				$bigtext = $('<span/>', {
					text: 'To orphan backlinks and remove instances of file usage',
					css: { fontSize: '130%', fontWeight: 'bold' }
				});
				Morebits.status.info($bigtext[0], $link[0]);
			} else if (params.normalized !== 'f8') {
				$link = $('<a/>', {
					href: '#',
					text: 'click here to go to the Unlink tool',
					css: { fontSize: '130%', fontWeight: 'bold' },
					click: function() {
						Morebits.wiki.actionCompleted.redirect = null;
						Twinkle.speedy.dialog.close();
						Twinkle.unlink.callback('Removing links to deleted page ' + Morebits.pageNameNorm);
					}
				});
				$bigtext = $('<span/>', {
					text: 'To orphan backlinks',
					css: { fontSize: '130%', fontWeight: 'bold' }
				});
				Morebits.status.info($bigtext[0], $link[0]);
			}
		},
		deleteRedirectsMain: function(apiobj) {
			var response = apiobj.getResponse();
			var snapshot = response.query.pages[0].redirects || [];
			var total = snapshot.length;
			var statusIndicator = apiobj.statelem;

			if (!total) {
				statusIndicator.status('no redirects found');
				return;
			}

			statusIndicator.status('0%');

			var current = 0;
			var onsuccess = function(apiobjInner) {
				var now = parseInt(100 * ++current / total, 10) + '%';
				statusIndicator.update(now);
				apiobjInner.statelem.unlink();
				if (current >= total) {
					statusIndicator.info(now + ' (completed)');
					Morebits.wiki.removeCheckpoint();
				}
			};

			Morebits.wiki.addCheckpoint();

			snapshot.forEach(function(value) {
				var title = value.title;
				var page = new Morebits.wiki.page(title, 'Deleting redirect "' + title + '"');
				page.setEditSummary('[[WP:CSD#R1-3|R1-3]]: 転送先がないリダイレクト 転送先: [["' + Morebits.pageNameNorm + ']]"');
				page.setChangeTags(Twinkle.changeTags);
				page.deletePage(onsuccess);
			});
		}
	},

	user: {
		main: function(pageobj) {
			var statelem = pageobj.getStatusElement();

			if (!pageobj.exists()) {
				statelem.error('ページが存在しないようです。もしかしたら、すでに削除されているのかもしれません。');
				return;
			}

			var params = pageobj.getCallbackParameters();

			// given the params, builds the template and also adds the user talk page parameters to the params that were passed in
			// returns => [<string> wikitext, <object> utparams]
			var buildData = Twinkle.speedy.callbacks.getTemplateCodeAndParams(params),
				code = buildData[0];
			params.utparams = buildData[1];

			// Tag if possible, post on talk if not
			if (pageobj.canEdit() && ['wikitext', 'Scribunto', 'javascript', 'css', 'sanitized-css'].indexOf(pageobj.getContentModel()) !== -1) {
				var text = pageobj.getPageText();

				statelem.status('ページ上のタグの確認...');

				// check for existing deletion tags
				var tag = /(?:\{\{\s*([sS][dD]2?|即時削除2?(\/.*)?|[dD]elete)(?:\s*\||\s*\}\}))/.exec(text);
				// This won't make use of the db-multiple template but it probably should
				if (tag && !confirm('ページ上には既にCSD関係のテンプレート {{' + tag[1] + '}} があります。別のCSDテンプレートを追加しますか？')) {
					return;
				}

				var xfd = /\{\{((?:Sakujo\/本体)|[cfm]fd\b)/i.exec(text) || /RFD notice/.exec(text);
				if (xfd && !confirm('削除関連のテンプレート {{' + xfd[1] + '}} が見つかりました。このまま即時削除テンプレートを追加しますか?')) {
					return;
				}

				// curate/patrol the page
				if (Twinkle.getPref('markSpeedyPagesAsPatrolled')) {
					pageobj.triage();
				}

				// Wrap SD template in noinclude tags if we are in template space.
				// Won't work with userboxes in userspace, or any other transcluded page outside template space
				if (mw.config.get('wgNamespaceNumber') === 10) {  // Template:
					code = '<noinclude>' + code + '</noinclude>';
				}

				// Remove tags that become superfluous with this action
				text = text.replace(/\{\{\s*([Uu]serspace draft)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/g, '');
				if (mw.config.get('wgNamespaceNumber') === 6) {
					// remove "move to Commons" tag - deletion-tagged files cannot be moved to Commons
					text = text.replace(/\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*\}\}/gi, '');
				}

				if (mw.config.get('wgPageContentModel') === 'Scribunto') {
					// Scribunto isn't parsed like wikitext, so CSD templates on modules need special handling to work
					var equals = '';
					while (code.indexOf(']' + equals + ']') !== -1) {
						equals += '=';
					}
					code = "require('Module:Module wikitext')._addText([" + equals + '[' + code + ']' + equals + ']);';
				} else if (['javascript', 'css', 'sanitized-css'].indexOf(mw.config.get('wgPageContentModel')) !== -1) {
					// Likewise for JS/CSS pages
					code = '/* ' + code + ' */';
				}

				// Generate edit summary for edit
				var editsummary;
				if (params.normalizeds.length > 1) {
					editsummary = 'Requesting speedy deletion (';
					$.each(params.normalizeds, function(index, norm) {
						editsummary += '[[WP:CSD#' + norm.toUpperCase() + '|CSD ' + norm.toUpperCase() + ']], ';
					});
					editsummary = editsummary.substr(0, editsummary.length - 2); // remove trailing comma
					editsummary += ').';
				} else if (params.normalizeds[0] === 'db') {
					editsummary = '"' + params.templateParams[0]['1'] + '"として[[WP:CSD|即時削除]]を依頼';
				} else {
					editsummary = '即時削除を依頼 ([[WP:CSD#' + params.normalizeds[0].toUpperCase() + '|CSD ' + params.normalizeds[0].toUpperCase() + ']])';
				}

				// Blank pages
				if (params.blankpage) {
					text = code;
				} else {
					// Insert tag after short description or any hatnotes
					var wikipage = new Morebits.wikitext.page(text);
					text = wikipage.insertAfterTemplates(code + '\n', Twinkle.hatnoteRegex).getText();
				}

				console.log(text);
				console.log(editsummary);

				pageobj.setPageText(text);
				pageobj.setEditSummary(editsummary);
				pageobj.setWatchlist(params.watch);
				//pageobj.save(Twinkle.speedy.callbacks.user.tagComplete); //一時的にコメントアウト
			} else { // Attempt to place on talk page
				var talkName = new mw.Title(pageobj.getPageName()).getTalkPage().toText();
				if (talkName !== pageobj.getPageName()) {
					pageobj.getStatusElement().warn('ページの編集ができなかったため、トークページにタグが置かれます。');

					var talk_page = new Morebits.wiki.page(talkName, 'トークページにタグを自動配置');
					talk_page.setNewSectionTitle(pageobj.getPageName() + 'の即時削除依頼');
					talk_page.setNewSectionText(code + '\n\nI was unable to tag ' + pageobj.getPageName() + ' so please delete it. ~~~~');
					talk_page.setNewSectionText(code + '\n\n' + pageobj.getPageName() + 'にタグ付けすることができませんでした。削除してください。--~~~~');
					talk_page.setCreateOption('recreate');
					talk_page.setFollowRedirect(true);
					talk_page.setWatchlist(params.watch);
					talk_page.setChangeTags(Twinkle.changeTags);
					talk_page.setCallbackParameters(params);
					talk_page.newSection(Twinkle.speedy.callbacks.user.tagComplete);
				} else {
					pageobj.getStatusElement().error('ページは保護されており、編集依頼を追加する場所がありません。中止します。');
				}
			}
		},

		tagComplete: function(pageobj) {
			var params = pageobj.getCallbackParameters();

			// Notification to first contributor, will also log nomination to the user's userspace log
			if (params.usertalk) {
				var thispage = new Morebits.wiki.page(Morebits.pageNameNorm);
				thispage.setCallbackParameters(params);
				thispage.lookupCreation(Twinkle.speedy.callbacks.noteToCreator);
			// or, if not notifying, add this nomination to the user's userspace log without the initial contributor's name
			} else if (params.lognomination) {
				Twinkle.speedy.callbacks.user.addToLog(params, null);
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
				if ((normalize === 'C6' && csdparam === 'catdesc') ||
					(normalize === 'F1' && csdparam === 'filename')) {
					input = '[[:' + input + ']]';
				} else if (normalize === 'G5' && csdparam === '2') {
					input = '[[:Wikipedia:削除依頼/' + input + ']]';
				} else if (normalize === 'G9' && csdparam.lastIndexOf('url', 0) === 0 && input.lastIndexOf('http', 0) === 0) {
					input = '[' + input + ' ' + input + ']';
				} else if (normalize === 'F8' && csdparam === 'filename') {
					input = '[[commons:' + input + ']]';
				}
				return ' {' + normalize + ' ' + csdparam + ': ' + input + '}';
			};

			var extraInfo = '';

			// If a logged file is deleted but exists on commons, the wikilink will be blue, so provide a link to the log
			var fileLogLink = mw.config.get('wgNamespaceNumber') === 6 ? ' ([{{fullurl:Special:Log|page=' + mw.util.wikiUrlencode(mw.config.get('wgPageName')) + '}} 記録])' : '';

			var editsummary = '[[:' + Morebits.pageNameNorm + ']]の即時削除への指定を記録';
			var appendText = '# [[:' + Morebits.pageNameNorm + ']]' + fileLogLink + ': ';

			if (params.normalizeds.length > 1) {
				appendText += 'multiple criteria (';
				$.each(params.normalizeds, function(index, norm) {
					appendText += '[[WP:CSD#' + norm.toUpperCase() + '|' + norm.toUpperCase() + ']], ';
				});
				appendText = appendText.substr(0, appendText.length - 2);  // remove trailing comma
				appendText += ')';
			} else if (params.normalizeds[0] === 'db') {
				appendText += '{{tlp|即時削除|その他}}';
			} else {
				appendText += '[[WP:CSD#' + params.normalizeds[0].toUpperCase() + '|CSD ' + params.normalizeds[0].toUpperCase() + ']] ({{tlp|即時削除|' + params.values[0] + '}})';
			}

			// If params is "empty" it will still be full of empty arrays, but ask anyway
			if (params.templateParams) {
				// Treat custom rationale individually
				if (params.normalizeds[0] && params.normalizeds[0] === 'db') {
					extraInfo += formatParamLog('Custom', 'rationale', params.templateParams[0]['1']);
				} else {
					params.templateParams.forEach(function(item, index) {
						var keys = Object.keys(item);
						if (keys[0] !== undefined && keys[0].length > 0) {
							// Second loop required since some items (G12, F9) may have multiple keys
							keys.forEach(function(key, keyIndex) {
								if (keys[keyIndex] === 'blanked' || keys[keyIndex] === 'ts') {
									return true; // Not worth logging
								}
								extraInfo += formatParamLog(params.normalizeds[index].toUpperCase(), keys[keyIndex], item[key]);
							});
						}
					});
				}
			}

			if (params.blankpage) {
				appendText += '; ページを白紙化した上でのタグ付け。';
			}
			if (extraInfo) {
				appendText += '; 追加情報:' + extraInfo;
			}
			if (initialContrib) {
				appendText += '; notified {{user|1=' + initialContrib + '}}';
			}
			appendText += ' ~~~~~\n';

			usl.changeTags = Twinkle.changeTags;
			usl.log(appendText, editsummary);
		}
	}
};

// validate subgroups in the form passed into the speedy deletion tag
Twinkle.speedy.getParameters = function twinklespeedyGetParameters(form, values) {
	var parameters = [];

	$.each(values, function(index, value) {
		var currentParams = [];
		if (form.add_comments && form.add_comments.checked) {
			currentParams.コメント = form['add_comments.additional_comments'].value;
		}
		switch (value) {
			case 'その他':
				if (form['csd.reason_1']) {
					var dbrationale = form['csd.reason_1'].value;
					if (!dbrationale || !dbrationale.trim()) {
						alert('その他の基準:  即時削除の方針に合致していることの説明を入力してください。');
						parameters = null;
						return false;
					}
					currentParams['2'] = dbrationale;
				}
				break;

			case '全般4':  // G4
				if (form['csd.spam_reason']) {
					if (form['csd.spam_reason'].value) {
						currentParams['2'] = form['csd.spam_reason'].value;
					} else {
						alert('CSD G4:  「露骨な宣伝・広告のみが目的」と判断される根拠を入力してください。');
						parameters = null;
						return false;
					}
				}
				break;

			case '全般5':  // G5
				if (form['csd.repost_xfd']) {
					var deldisc = form['csd.repost_xfd'].value;
					if (deldisc) {
						if (new RegExp('^:?' + Morebits.namespaceRegex(4) + ':', 'i').test(deldisc)) {
							alert('CSD G5:  削除依頼サブページを入力する場合は、"Wikipedia:削除依頼/"は外して書く必要があります。');
							parameters = null;
							return false;
						}
						currentParams['2'] = deldisc;
					} else {
						alert('CSD G5:  削除依頼サブページを入力してください。');
						parameters = null;
						return false;
					}
				}
				break;

			case '全般6':  // G6
				if (form['csd.original_page'] && form['csd.language_code']) {
					var oroginal = form['csd.original_page'].value,
						lang = form['csd.language_code'].value;
					if (!oroginal || !oroginal.trim()) {
						alert('CSD G6: コピペ元のページ名を指定してください');
						parameters = null;
						return false;
					}
					if (lang) {
						currentParams['3'] = lang;
					}
					currentParams['2'] = oroginal;
				}
				break;

			case '全般9':  // G9
				if (form['csd.copyvio_url']) {
					if (form['csd.copyvio_url'].value) {
						currentParams['2'] = form['csd.copyvio_url'].value;
					} else {
						alert('CSD G9:  転載元のURLを入力してください。');
					}
				}
				break;

			case '全般10':  // G10
				if (form['csd.banned_user'] && form['csd.banned_user'].value) {
					currentParams['2'] = form['csd.banned_user'].value;
				}
				break;

			case 'カテゴリ6':  // C6
				if (form['csd.catdesc'] && form['csd.catdesc'].value) {
					var catdesc = form['csd.catdesc'].value;
					if (/^\[\[(.*)\]\]$/.test(catdesc)) {
						alert('CSD C6: 議論場所は"[[]]"を外して入力してください。');
						parameters = null;
						return false;
					}
					currentParams['2'] = form['csd.catdesc'].value;
				}
				break;

			case 'リダイレクト1-2':  // R1-2
				if (form['csd.err_reason'] && form['csd.err_reason'].value) {
					if (!form['csd.err_reason'].value) {
						alert('CSD R1-2: 書き誤り箇所を入力してください。');
						parameters = null;
						return false;
					}
					currentParams['2'] = form['csd.err_reason'].value;
				}
				break;

			case 'リダイレクト2-1':  // R2-1
				if (form['csd.width_character'] && form['csd.width_character'].value) {
					if (!form['csd.width_character'].value) {
						alert('CSD R2-1: 使い分けが間違っている文字を入力してください。');
						parameters = null;
						return false;
					}
					currentParams['2'] = form['csd.width_character'].value;
				}
				break;

			case 'リダイレクト2-5':  // R2-5
				if (form['csd.usage_violation'] && form['csd.usage_violation'].value) {
					if (!form['csd.usage_violation'].value) {
						alert('CSD R2-5: 使い方の違反内容を入力してください。');
						parameters = null;
						return false;
					}
					currentParams['2'] = form['csd.usage_violation'].value;
				}
				break;

			case 'ファイル1-2':  // F1-2
				if (form['csd.redundantcopy_filename']) {
					var redcopyimage = form['csd.redundantcopy_filename'].value;
					currentParams['2'] = redcopyimage.replace(new RegExp('^\\s*' + Morebits.namespaceRegex(6) + ':', 'i'), '');
				}
				break;

			case 'ファイル1-3':  // F1-3
				if (form['csd.redundantproject_filename']) {
					var redprojimage = form['csd.redundantproject_filename'].value;
					currentParams['2'] = redprojimage.replace(new RegExp('^\\s*' + Morebits.namespaceRegex(6) + ':', 'i'), '');
				}
				break;

			case 'ファイル1-4':  // F1-4
				if (form['csd.redundantauthor_filename']) {
					var redauthimage = form['csd.redundantauthor_filename'].value;
					currentParams['2'] = redauthimage.replace(new RegExp('^\\s*' + Morebits.namespaceRegex(6) + ':', 'i'), '');
				}
				break;

			case 'ファイル1-5':  // F1-5
				if (form['csd.movetocommons_filename']) {
					var movedimage = form['csd.movetocommons_filename'].value;
					currentParams['2'] = movedimage.replace(new RegExp('^\\s*' + Morebits.namespaceRegex(6) + ':', 'i'), '');
				}
				break;


			case 'ファイル1-6':  // F1-6
				if (form['csd.redir_filename']) {
					var redirimage = form['csd.redir_filename'].value;
					if (redirimage) {
						currentParams['2'] = redirimage.replace(new RegExp('^\\s*' + Morebits.namespaceRegex(6) + ':', 'i'), '');
					} else {
						alert('CSD F1-6: ファイルの転送先を入力してください。');
						parameters = null;
						return false;
					}
				}
				break;

			case 'ファイル3':  // F3
				if (form['csd.redundantimage_filename']) {
					var redimage = form['csd.redundantimage_filename'].value;
					if (redimage) {
						currentParams['2'] = redimage.replace(new RegExp('^\\s*' + Morebits.namespaceRegex(6) + ':', 'i'), '');
					} else {
						alert('CSD F3: ファイルの重複先を入力してください。');
						parameters = null;
						return false;
					}
				}
				break;

			case 'ファイル5':  // F5
				if (form['csd.redundantimage_filename']) {
					var notifytalkpage = form['csd.redundantimage_filename'].value;
					if (notifytalkpage) {
						if (/^\[\[(.*)\]\]$/.test(notifytalkpage)) {
							alert('CSD F5: 通知先は"[[]]"を外して入力してください。');
							parameters = null;
							return false;
						}
						currentParams['2'] = notifytalkpage.replace(new RegExp('^\\s*' + Morebits.namespaceRegex(6) + ':', 'i'), '');
					} else {
						alert('CSD F5: 投稿者への通知先を入力してください。');
						parameters = null;
						return false;
					}
				}
				break;
			case 'ファイル6':  // F6
				if (form['csd.unfree_filename']) {
					if (form['csd.unfree_filename'].value) {
						currentParams['2'] = form['csd.unfree_filename'].value;
					} else {
						alert('CSD F6: 自由利用ができない根拠を入力してください。');
					}
				}
				break;

			default:
				break;
		}
		parameters.push(currentParams);
	});
	return parameters;
};

// Function for processing talk page notification template parameters
// key1/value1: for {{db-criterion-[notice|deleted]}} (via {{db-csd-[notice|deleted]-custom}})
// utparams.param: for {{db-[notice|deleted]-multiple}}
Twinkle.speedy.getUserTalkParameters = function twinklespeedyGetUserTalkParameters(normalized, parameters) {
	var utparams = [];

	// Special cases
	if (normalized === 'db') {
		utparams['2'] = parameters['1'];
	} else if (normalized === 'g12') {
		['url', 'url2', 'url3'].forEach(function(item, idx) {
			if (parameters[item]) {
				idx++;
				utparams['key' + idx] = item;
				utparams['value' + idx] = utparams[item] = parameters[item];
			}
		});
	} else if (normalized === 'g5-r') {
		['url', 'url2', 'url3'].forEach(function(item, idx) {
			if (parameters[item]) {
				idx++;
				utparams['key' + idx] = item;
				utparams['value' + idx] = utparams[item] = parameters[item];
			}
		});
	} else {
		// Handle the rest
		var param;
		switch (normalized) {
			case 'g4':
				param = 'xfd';
				break;
			case 'f9':
				param = 'url';
				break;
			default:
				break;
		}
		// No harm in providing a usertalk template with the others' parameters
		if (param && parameters[param]) {
			utparams.key1 = param;
			utparams.value1 = utparams[param] = parameters[param];
		}
	}
	return utparams;
};

/**
 * @param {Event} e
 * @returns {Array}
 */
Twinkle.speedy.resolveCsdValues = function twinklespeedyResolveCsdValues(e) {
	var values = (e.target.form ? e.target.form : e.target).getChecked('csd');
	if (values.length === 0) {
		alert('Please select a criterion!');
		return null;
	}
	return values;
};

Twinkle.speedy.callback.evaluateSysop = function twinklespeedyCallbackEvaluateSysop(e) {
	var form = e.target.form ? e.target.form : e.target;

	if (e.target.type === 'checkbox' || e.target.type === 'text' ||
			e.target.type === 'select') {
		return;
	}

	var tag_only = form.tag_only;
	if (tag_only && tag_only.checked) {
		Twinkle.speedy.callback.evaluateUser(e);
		return;
	}

	var values = Twinkle.speedy.resolveCsdValues(e);
	if (!values) {
		return;
	}
	var templateParams = Twinkle.speedy.getParameters(form, values);
	if (!templateParams) {
		return;
	}

	var normalizeds = values.map(function(value) {
		return Twinkle.speedy.normalizeHash[value];
	});

	// analyse each criterion to determine whether to watch the page, prompt for summary, or notify the creator
	var watchPage, promptForSummary;
	normalizeds.forEach(function(norm) {
		if (Twinkle.getPref('watchSpeedyPages').indexOf(norm) !== -1) {
			watchPage = Twinkle.getPref('watchSpeedyExpiry');
		}
		if (Twinkle.getPref('promptForSpeedyDeletionSummary').indexOf(norm) !== -1) {
			promptForSummary = true;
		}
	});

	var warnusertalk = form.warnusertalk.checked && normalizeds.some(function (norm) {
		return Twinkle.getPref('warnUserOnSpeedyDelete').indexOf(norm) !== -1;
	});

	var welcomeuser = warnusertalk && normalizeds.some(function (norm) {
		return Twinkle.getPref('welcomeUserOnSpeedyDeletionNotification').indexOf(norm) !== -1;
	});

	var params = {
		values: values,
		normalizeds: normalizeds,
		watch: watchPage,
		deleteTalkPage: form.talkpage && form.talkpage.checked,
		deleteRedirects: form.redirects.checked,
		warnUser: warnusertalk,
		welcomeuser: welcomeuser,
		promptForSummary: promptForSummary,
		templateParams: templateParams
	};

	Morebits.simpleWindow.setButtonsEnabled(false);
	Morebits.status.init(form);

	Twinkle.speedy.callbacks.sysop.main(params);
};

Twinkle.speedy.callback.evaluateUser = function twinklespeedyCallbackEvaluateUser(e) {
	var form = e.target.form ? e.target.form : e.target;

	if (e.target.type === 'checkbox' || e.target.type === 'text' ||
			e.target.type === 'select') {
		return;
	}

	var values = Twinkle.speedy.resolveCsdValues(e);
	if (!values) {
		return;
	}
	var templateParams = Twinkle.speedy.getParameters(form, values);
	if (!templateParams) {
		return;
	}

	// var multiple = form.multiple.checked;

	var normalizeds = values.map(function(value) {
		return Twinkle.speedy.normalizeHash[value];
	});

	// analyse each criterion to determine whether to watch the page/notify the creator
	var watchPage = normalizeds.some(function(csdCriteria) {
		return Twinkle.getPref('watchSpeedyPages').indexOf(csdCriteria) !== -1;
	}) && Twinkle.getPref('watchSpeedyExpiry');

	var notifyuser = form.notify.checked && normalizeds.some(function(norm) {
		return Twinkle.getPref('notifyUserOnSpeedyDeletionNomination').indexOf(norm) !== -1;
	});
	var welcomeuser = notifyuser && normalizeds.some(function(norm) {
		return Twinkle.getPref('welcomeUserOnSpeedyDeletionNotification').indexOf(norm) !== -1;
	});
	var csdlog = !form.notsavelog.checked && Twinkle.getPref('logSpeedyNominations') && normalizeds.some(function(norm) {
		return Twinkle.getPref('noLogOnSpeedyNomination').indexOf(norm) === -1;
	});
	var blankpage = form.blankpage.checked;
	var notsavelog = form.notsavelog.checked;

	var params = {
		values: values,
		normalizeds: normalizeds,
		watch: watchPage,
		usertalk: notifyuser,
		welcomeuser: welcomeuser,
		lognomination: csdlog,
		templateParams: templateParams,
		blankpage: blankpage,
		notsavelog: notsavelog
	};
	console.log(params);

	Morebits.simpleWindow.setButtonsEnabled(false);
	Morebits.status.init(form);

	Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
	Morebits.wiki.actionCompleted.notice = 'Tagging complete';

	var wikipedia_page = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Tagging page');
	wikipedia_page.setChangeTags(Twinkle.changeTags); // Here to apply to triage
	wikipedia_page.setCallbackParameters(params);
	wikipedia_page.load(Twinkle.speedy.callbacks.user.main);
};

Twinkle.addInitCallback(Twinkle.speedy, 'speedy');
})(jQuery);


// </nowiki>
