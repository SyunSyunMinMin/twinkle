// <nowiki>


(function($) {


/*
 ****************************************
 *** twinkleprotect.js: Protect/RPP module
 ****************************************
 * Mode of invocation:     Tab ("PP"/"RPP")
 * Active on:              Non-special, non-MediaWiki pages
 */

// Note: a lot of code in this module is re-used/called by batchprotect.

Twinkle.protect = function twinkleprotect() {
	if (mw.config.get('wgNamespaceNumber') < 0 || mw.config.get('wgNamespaceNumber') === 8) {
		return;
	}

	Twinkle.addPortletLink(Twinkle.protect.callback, Morebits.userIsSysop ? 'PP' : 'RPP', 'tw-rpp',
		Morebits.userIsSysop ? 'ページを保護' : 'ページの保護を依頼');
};

Twinkle.protect.callback = function twinkleprotectCallback() {
	var Window = new Morebits.simpleWindow(620, 530);
	Window.setTitle(Morebits.userIsSysop ? 'ページ保護の適用、依頼、タグ付け' : 'ページ保護の依頼、タグ付け');
	Window.setScriptName('Twinkle');
	Window.addFooterLink('保護テンプレート', 'Template:Pp#関連項目');
	Window.addFooterLink('保護の方針', 'Wikipedia:保護の方針');
	Window.addFooterLink('Twinkle help', ':en:WP:TW/DOC#protect');
	Window.addFooterLink('フィードバック', 'User talk:Syunsyunminmin/Twinkle');

	var form = new Morebits.quickForm(Twinkle.protect.callback.evaluate);
	var actionfield = form.append({
		type: 'field',
		label: '操作の種類'
	});
	if (Morebits.userIsSysop) {
		actionfield.append({
			type: 'radio',
			name: 'actiontype',
			event: Twinkle.protect.callback.changeAction,
			list: [
				{
					label: 'ページを保護',
					value: 'protect',
					tooltip: 'ページに保護を適用する。',
					checked: true
				}
			]
		});
	}
	actionfield.append({
		type: 'radio',
		name: 'actiontype',
		event: Twinkle.protect.callback.changeAction,
		list: [
			{
				label: 'ページの保護を依頼',
				value: 'request',
				tooltip: (Morebits.userIsSysop ? '自分で保護する代わりに' : '') + 'WP:RFPPで保護を依頼する場合',
				checked: !Morebits.userIsSysop
			},
			{
				label: '保護テンプレートをページにタグ付けする',
				value: 'tag',
				tooltip: '保護する管理者が保護テンプレートを貼り忘れたり、タグを付けずにページを保護した場合、これを使って適切な保護タグを貼り付けることができます。',
				disabled: mw.config.get('wgArticleId') === 0 || mw.config.get('wgPageContentModel') === 'Scribunto'
			}
		]
	});

	form.append({ type: 'field', label: 'プリセット', name: 'field_preset' });
	form.append({ type: 'field', label: '1', name: 'field1' });
	form.append({ type: 'field', label: '2', name: 'field2' });

	form.append({ type: 'submit' });

	var result = form.render();
	Window.setContent(result);
	Window.display();

	// We must init the controls
	var evt = document.createEvent('Event');
	evt.initEvent('change', true, true);
	result.actiontype[0].dispatchEvent(evt);

	// get current protection level asynchronously
	Twinkle.protect.fetchProtectionLevel();
};


// A list of bots who may be the protecting sysop, for whom we shouldn't
// remind the user contact before requesting unprotection (evaluate)
Twinkle.protect.trustedBots = ['MusikBot II', 'TFA Protector Bot'];

// Customizable namespace and FlaggedRevs settings
// In theory it'd be nice to have restrictionlevels defined here,
// but those are only available via a siteinfo query

// mw.loader.getState('ext.flaggedRevs.review') returns null if the
// FlaggedRevs extension is not registered.  Previously, this was done with
// wgFlaggedRevsParams, but after 1.34-wmf4 it is no longer exported if empty
// (https://gerrit.wikimedia.org/r/c/mediawiki/extensions/FlaggedRevs/+/508427)
var hasFlaggedRevs = mw.loader.getState('ext.flaggedRevs.review') &&
// FlaggedRevs only valid in some namespaces, hardcoded until [[phab:T218479]]
(mw.config.get('wgNamespaceNumber') === 0 || mw.config.get('wgNamespaceNumber') === 4);
// Limit template editor; a Twinkle restriction, not a site setting
var isTemplate = mw.config.get('wgNamespaceNumber') === 10 || mw.config.get('wgNamespaceNumber') === 828;


// Contains the current protection level in an object
// Once filled, it will look something like:
// { edit: { level: "sysop", expiry: <some date>, cascade: true }, ... }
Twinkle.protect.currentProtectionLevels = {};

// returns a jQuery Deferred object, usage:
//   Twinkle.protect.fetchProtectingAdmin(apiObject, pageName, protect/stable).done(function(admin_username) { ...code... });
Twinkle.protect.fetchProtectingAdmin = function twinkleprotectFetchProtectingAdmin(api, pageName, protType, logIds) {
	logIds = logIds || [];

	return api.get({
		format: 'json',
		action: 'query',
		list: 'logevents',
		letitle: pageName,
		letype: protType
	}).then(function(data) {
		// don't check log entries that have already been checked (e.g. don't go into an infinite loop!)
		var event = data.query ? $.grep(data.query.logevents, function(le) {
			return $.inArray(le.logid, logIds);
		})[0] : null;
		if (!event) {
			// fail gracefully
			return null;
		} else if (event.action === 'move_prot' || event.action === 'move_stable') {
			return twinkleprotectFetchProtectingAdmin(api, protType === 'protect' ? event.params.oldtitle_title : event.params.oldtitle, protType, logIds.concat(event.logid));
		}
		return event.user;
	});
};

Twinkle.protect.fetchProtectionLevel = function twinkleprotectFetchProtectionLevel() {

	var api = new mw.Api();
	var protectDeferred = api.get({
		format: 'json',
		indexpageids: true,
		action: 'query',
		list: 'logevents',
		letype: 'protect',
		letitle: mw.config.get('wgPageName'),
		prop: hasFlaggedRevs ? 'info|flagged' : 'info',
		inprop: 'protection|watched',
		titles: mw.config.get('wgPageName')
	});
	var stableDeferred = api.get({
		format: 'json',
		action: 'query',
		list: 'logevents',
		letype: 'stable',
		letitle: mw.config.get('wgPageName')
	});

	var earlyDecision = [protectDeferred];
	if (hasFlaggedRevs) {
		earlyDecision.push(stableDeferred);
	}

	$.when.apply($, earlyDecision).done(function(protectData, stableData) {
		// $.when.apply is supposed to take an unknown number of promises
		// via an array, which it does, but the type of data returned varies.
		// If there are two or more deferreds, it returns an array (of objects),
		// but if there's just one deferred, it retuns a simple object.
		// This is annoying.
		protectData = $(protectData).toArray();

		var pageid = protectData[0].query.pageids[0];
		var page = protectData[0].query.pages[pageid];
		var current = {}, adminEditDeferred;

		// Save requested page's watched status for later in case needed when filing request
		Twinkle.protect.watched = page.watchlistexpiry || page.watched === '';

		$.each(page.protection, function(index, protection) {
			// Don't overwrite actual page protection with cascading protection
			if (!protection.source) {
				current[protection.type] = {
					level: protection.level,
					expiry: protection.expiry,
					cascade: protection.cascade === ''
				};
				// logs report last admin who made changes to either edit/move/create protection, regardless if they only modified one of them
				if (!adminEditDeferred) {
					adminEditDeferred = Twinkle.protect.fetchProtectingAdmin(api, mw.config.get('wgPageName'), 'protect');
				}
			} else {
				// Account for the page being covered by cascading protection
				current.cascading = {
					expiry: protection.expiry,
					source: protection.source,
					level: protection.level // should always be sysop, unused
				};
			}
		});

		if (page.flagged) {
			current.stabilize = {
				level: page.flagged.protection_level,
				expiry: page.flagged.protection_expiry
			};
			adminEditDeferred = Twinkle.protect.fetchProtectingAdmin(api, mw.config.get('wgPageName'), 'stable');
		}

		// show the protection level and log info
		Twinkle.protect.hasProtectLog = !!protectData[0].query.logevents.length;
		Twinkle.protect.protectLog = Twinkle.protect.hasProtectLog && protectData[0].query.logevents;
		Twinkle.protect.hasStableLog = hasFlaggedRevs ? !!stableData[0].query.logevents.length : false;
		Twinkle.protect.stableLog = Twinkle.protect.hasStableLog && stableData[0].query.logevents;
		Twinkle.protect.currentProtectionLevels = current;

		if (adminEditDeferred) {
			adminEditDeferred.done(function(admin) {
				if (admin) {
					$.each(['edit', 'move', 'create', 'stabilize', 'cascading'], function(i, type) {
						if (Twinkle.protect.currentProtectionLevels[type]) {
							Twinkle.protect.currentProtectionLevels[type].admin = admin;
						}
					});
				}
				Twinkle.protect.callback.showLogAndCurrentProtectInfo();
			});
		} else {
			Twinkle.protect.callback.showLogAndCurrentProtectInfo();
		}
	});
};

Twinkle.protect.callback.showLogAndCurrentProtectInfo = function twinkleprotectCallbackShowLogAndCurrentProtectInfo() {
	var currentlyProtected = !$.isEmptyObject(Twinkle.protect.currentProtectionLevels);

	if (Twinkle.protect.hasProtectLog || Twinkle.protect.hasStableLog) {
		var $linkMarkup = $('<span>');

		if (Twinkle.protect.hasProtectLog) {
			$linkMarkup.append(
				$('<a target="_blank" href="' + mw.util.getUrl('Special:Log', {action: 'view', page: mw.config.get('wgPageName'), type: 'protect'}) + '">保護記録</a>'));
			if (!currentlyProtected || (!Twinkle.protect.currentProtectionLevels.edit && !Twinkle.protect.currentProtectionLevels.move)) {
				var lastProtectAction = Twinkle.protect.protectLog[0];
				if (lastProtectAction.action === 'unprotect') {
					$linkMarkup.append(' (' + new Morebits.date(lastProtectAction.timestamp).calendar('utc') + 'に保護解除)');
				} else { // protect or modify
					$linkMarkup.append(' (' + new Morebits.date(lastProtectAction.params.details[0].expiry).calendar('utc') + 'に期限切れ)');
				}
			}
			$linkMarkup.append(Twinkle.protect.hasStableLog ? $('<span> &bull; </span>') : null);
		}

		if (Twinkle.protect.hasStableLog) {
			$linkMarkup.append($('<a target="_blank" href="' + mw.util.getUrl('Special:Log', {action: 'view', page: mw.config.get('wgPageName'), type: 'stable'}) + '">pending changes log</a>)'));
			if (!currentlyProtected || !Twinkle.protect.currentProtectionLevels.stabilize) {
				var lastStabilizeAction = Twinkle.protect.stableLog[0];
				if (lastStabilizeAction.action === 'reset') {
					$linkMarkup.append(' (reset ' + new Morebits.date(lastStabilizeAction.timestamp).calendar('utc') + ')');
				} else { // config or modify
					$linkMarkup.append(' (expired ' + new Morebits.date(lastStabilizeAction.params.expiry).calendar('utc') + ')');
				}
			}
		}

		Morebits.status.init($('div[name="hasprotectlog"] span')[0]);
		Morebits.status.warn(
			currentlyProtected ? '以前の保護' : 'このページは過去に保護されたことがあります',
			$linkMarkup[0]
		);
	}

	Morebits.status.init($('div[name="currentprot"] span')[0]);
	var protectionNode = [], statusLevel = 'info';

	if (currentlyProtected) {
		$.each(Twinkle.protect.currentProtectionLevels, function(type, settings) {
			var label = type === 'stabilize' ? 'Pending Changes' : '';

			switch (Morebits.string.toUpperCaseFirstChar(type)) {
				case 'Edit':
					label = '編集';
					break;
				case 'Move':
					label = '移動';
					break;
				case 'create':
					label = '作成';
					break;
				case 'upload':
					label = 'アップロード';
					break;
				default:
					label = Morebits.string.toUpperCaseFirstChar(type);
					break;
			}

			if (type === 'cascading') { // Covered by another page
				label = 'カスケード保護 ';
				protectionNode.push($('<b>' + label + '</b>')[0]);
				if (settings.source) { // Should by definition exist
					var sourceLink = '<a target="_blank" href="' + mw.util.getUrl(settings.source) + '">' + settings.source + '</a>';
					protectionNode.push($('<span>from ' + sourceLink + '</span>')[0]);
				}
			} else {
				var level;
				switch (settings.level) {
					case 'sysop':
						level = '管理者のみ';
						break;
					case 'extendedconfirmed':
						level = '拡張承認された利用者のみ';
						break;
					case 'autoconfirmed':
						level = '自動承認された利用者のみ';
						break;
					default:
						level = settings.level;
						break;
				}
				// Make cascading protection more prominent
				if (settings.cascade) {
					level += ' (カスケード)';
				}
				protectionNode.push($('<b>' + label + ': ' + level + '</b>')[0]);
			}

			if (settings.expiry === 'infinity') {
				protectionNode.push(' (無期限) ');
			} else {
				protectionNode.push(' (' + new Morebits.date(settings.expiry).calendar('utc') + 'に期限切れ) ');
			}
			if (settings.admin) {
				var adminLink = '<a target="_blank" href="' + mw.util.getUrl('User talk:' + settings.admin) + '">' + settings.admin + '</a>';
				protectionNode.push($('<span>' + adminLink + 'による</span>')[0]);
			}
			protectionNode.push($('<span> \u2022 </span>')[0]);
		});
		protectionNode = protectionNode.slice(0, -1); // remove the trailing bullet
		statusLevel = 'warn';
	} else {
		protectionNode.push($('<b>保護なし</b>')[0]);
	}

	Morebits.status[statusLevel]('現在の保護レベル', protectionNode);
};

Twinkle.protect.callback.changeAction = function twinkleprotectCallbackChangeAction(e) {
	var field_preset;
	var field1;
	var field2;

	switch (e.target.values) {
		case 'protect':
			field_preset = new Morebits.quickForm.element({ type: 'field', label: 'プリセット', name: 'field_preset' });
			field_preset.append({
				type: 'select',
				name: 'category',
				label: 'プリセットを選択:',
				event: Twinkle.protect.callback.changePreset,
				list: mw.config.get('wgArticleId') ? Twinkle.protect.protectionTypes : Twinkle.protect.protectionTypesCreate
			});

			field2 = new Morebits.quickForm.element({ type: 'field', label: '保護設定', name: 'field2' });
			field2.append({ type: 'div', name: 'currentprot', label: ' ' });  // holds the current protection level, as filled out by the async callback
			field2.append({ type: 'div', name: 'hasprotectlog', label: ' ' });
			// for existing pages
			if (mw.config.get('wgArticleId')) {
				field2.append({
					type: 'checkbox',
					event: Twinkle.protect.formevents.editmodify,
					list: [
						{
							label: '編集保護設定を変更',
							name: 'editmodify',
							tooltip: 'これをオフにすると、編集保護レベルと有効期限はそのままになります。',
							checked: true
						}
					]
				});
				field2.append({
					type: 'select',
					name: 'editlevel',
					label: '誰が編集できるか:',
					event: Twinkle.protect.formevents.editlevel,
					list: Twinkle.protect.protectionLevels
				});
				field2.append({
					type: 'select',
					name: 'editexpiry',
					label: '期限:',
					event: function(e) {
						if (e.target.value === 'custom') {
							Twinkle.protect.doCustomExpiry(e.target);
						}
					},
					// default expiry selection (1 week) is conditionally set in Twinkle.protect.callback.changePreset
					list: Twinkle.protect.protectionLengths
				});
				field2.append({
					type: 'checkbox',
					event: Twinkle.protect.formevents.movemodify,
					list: [
						{
							label: '移動保護設定を変更',
							name: 'movemodify',
							tooltip: 'これをオフにすると、移動保護レベルと有効期限はそのままになります。',
							checked: true
						}
					]
				});
				field2.append({
					type: 'select',
					name: 'movelevel',
					label: '誰が移動できるか:',
					event: Twinkle.protect.formevents.movelevel,
					list: Twinkle.protect.protectionLevels.filter(function(level) {
						// Autoconfirmed is required for a move, redundant
						return level.value !== 'autoconfirmed';
					})
				});
				field2.append({
					type: 'select',
					name: 'moveexpiry',
					label: '期限:',
					event: function(e) {
						if (e.target.value === 'custom') {
							Twinkle.protect.doCustomExpiry(e.target);
						}
					},
					// default expiry selection (2 days) is conditionally set in Twinkle.protect.callback.changePreset
					list: Twinkle.protect.protectionLengths
				});
				if (hasFlaggedRevs) {
					field2.append({
						type: 'checkbox',
						event: Twinkle.protect.formevents.pcmodify,
						list: [
							{
								label: 'Modify pending changes protection',
								name: 'pcmodify',
								tooltip: 'If this is turned off, the pending changes level, and expiry time, will be left as is.',
								checked: true
							}
						]
					});
					field2.append({
						type: 'select',
						name: 'pclevel',
						label: 'Pending changes:',
						event: Twinkle.protect.formevents.pclevel,
						list: [
							{ label: 'None', value: 'none' },
							{ label: 'Pending change', value: 'autoconfirmed', selected: true }
						]
					});
					field2.append({
						type: 'select',
						name: 'pcexpiry',
						label: 'Expires:',
						event: function(e) {
							if (e.target.value === 'custom') {
								Twinkle.protect.doCustomExpiry(e.target);
							}
						},
						// default expiry selection (1 month) is conditionally set in Twinkle.protect.callback.changePreset
						list: Twinkle.protect.protectionLengths
					});
				}
			} else {  // for non-existing pages
				field2.append({
					type: 'select',
					name: 'createlevel',
					label: '作成保護:',
					event: Twinkle.protect.formevents.createlevel,
					list: Twinkle.protect.protectionLevels
				});
				field2.append({
					type: 'select',
					name: 'createexpiry',
					label: '期限:',
					event: function(e) {
						if (e.target.value === 'custom') {
							Twinkle.protect.doCustomExpiry(e.target);
						}
					},
					// default expiry selection (indefinite) is conditionally set in Twinkle.protect.callback.changePreset
					list: Twinkle.protect.protectionLengths
				});
			}
			field2.append({
				type: 'textarea',
				name: 'protectReason',
				label: '理由 (保護記録用):'
			});
			field2.append({
				type: 'div',
				name: 'protectReason_notes',
				label: '注記:',
				style: 'display:inline-block; margin-top:4px;',
				tooltip: '保護記録に、RFPPで依頼されたというメモを追加する。'
			});
			field2.append({
				type: 'checkbox',
				event: Twinkle.protect.callback.annotateProtectReason,
				style: 'display:inline-block; margin-top:4px;',
				list: [
					{
						label: 'RFPP依頼',
						name: 'protectReason_notes_rfpp',
						checked: false,
						value: '[[WP:RFPP]]による'
					}
				]
			});
			field2.append({
				type: 'input',
				event: Twinkle.protect.callback.annotateProtectReason,
				label: 'RFPP版番号',
				name: 'protectReason_notes_rfppRevid',
				value: '',
				tooltip: '保護が依頼されたRFPPページの版番号。'
			});
			if (!mw.config.get('wgArticleId') || mw.config.get('wgPageContentModel') === 'Scribunto') {  // tagging isn't relevant for non-existing or module pages
				break;
			}
			/* falls through */
		case 'tag':
			field1 = new Morebits.quickForm.element({ type: 'field', label: 'タグ付け設定', name: 'field1' });
			field1.append({ type: 'div', name: 'currentprot', label: ' ' });  // holds the current protection level, as filled out by the async callback
			field1.append({ type: 'div', name: 'hasprotectlog', label: ' ' });
			field1.append({
				type: 'select',
				name: 'tagtype',
				label: '保護テンプレートを選択:',
				list: Twinkle.protect.protectionTags,
				event: Twinkle.protect.formevents.tagtype
			});

			var isTemplateNamespace = mw.config.get('wgNamespaceNumber') === 10;
			var isAFD = Morebits.pageNameNorm.startsWith('Wikipedia:削除依頼/');
			var isCode = ['javascript', 'css', 'sanitized-css'].includes(mw.config.get('wgPageContentModel'));
			field1.append({
				type: 'checkbox',
				list: [
					{
						name: 'small',
						label: 'アイコン化 (small=yes)',
						tooltip: 'テンプレートの|small=yes機能を使用し、インジケーターとしてのみ表示する。',
						checked: true
					},
					{
						name: 'noinclude',
						label: '保護テンプレートを&lt;noinclude&gt;で囲む',
						tooltip: '参照読み込みされないように保護テンプレートを&lt;noinclude&gt;で囲む',
						checked: (isTemplateNamespace || isAFD) && !isCode
					}
				]
			});
			break;

		case 'request':
			field_preset = new Morebits.quickForm.element({ type: 'field', label: '保護の種類', name: 'field_preset' });
			field_preset.append({
				type: 'select',
				name: 'category',
				label: '種類と理由:',
				event: Twinkle.protect.callback.changePreset,
				list: mw.config.get('wgArticleId') ? Twinkle.protect.protectionTypes : Twinkle.protect.protectionTypesCreate
			});

			field_preset.append({
				type: 'checkbox',
				list: [
					{
						name: 'req_template',
						label: '保護依頼テンプレートを貼り付ける',
						tooltip: '保護を依頼するページに{{保護依頼}}テンプレートを貼り付ける',
						checked: true
					},
					{
						name: 'noinclude',
						label: '保護テンプレートを&lt;noinclude&gt;で囲む',
						tooltip: '参照読み込みされないように保護依頼テンプレートを&lt;noinclude&gt;で囲む',
						checked: mw.config.get('wgNamespaceNumber') === 10 || (mw.config.get('wgNamespaceNumber') === mw.config.get('wgNamespaceIds').project && mw.config.get('wgTitle').indexOf('削除依頼/') === 0)
					}
				]
			});

			field1 = new Morebits.quickForm.element({ type: 'field', label: 'オプション', name: 'field1' });
			field1.append({ type: 'div', name: 'currentprot', label: ' ' });  // holds the current protection level, as filled out by the async callback
			field1.append({ type: 'div', name: 'hasprotectlog', label: ' ' });
			field1.append({
				type: 'textarea',
				name: 'reason',
				label: '理由:'
			});
			break;
		default:
			alert('twinkleprotectにて何かが進行中です');
			break;
	}

	var oldfield;

	if (field_preset) {
		oldfield = $(e.target.form).find('fieldset[name="field_preset"]')[0];
		oldfield.parentNode.replaceChild(field_preset.render(), oldfield);
	} else {
		$(e.target.form).find('fieldset[name="field_preset"]').css('display', 'none');
	}
	if (field1) {
		oldfield = $(e.target.form).find('fieldset[name="field1"]')[0];
		oldfield.parentNode.replaceChild(field1.render(), oldfield);
	} else {
		$(e.target.form).find('fieldset[name="field1"]').css('display', 'none');
	}
	if (field2) {
		oldfield = $(e.target.form).find('fieldset[name="field2"]')[0];
		oldfield.parentNode.replaceChild(field2.render(), oldfield);
	} else {
		$(e.target.form).find('fieldset[name="field2"]').css('display', 'none');
	}

	if (e.target.values === 'protect') {
		// fake a change event on the preset dropdown
		var evt = document.createEvent('Event');
		evt.initEvent('change', true, true);
		e.target.form.category.dispatchEvent(evt);

		// reduce vertical height of dialog
		$(e.target.form).find('fieldset[name="field2"] select').parent().css({ display: 'inline-block', marginRight: '0.5em' });
		$(e.target.form).find('fieldset[name="field2"] input[name="protectReason_notes_rfppRevid"]').parent().css({display: 'inline-block', marginLeft: '15px'}).hide();
	}

	// re-add protection level and log info, if it's available
	Twinkle.protect.callback.showLogAndCurrentProtectInfo();
};

// NOTE: This function is used by batchprotect as well
Twinkle.protect.formevents = {
	editmodify: function twinkleprotectFormEditmodifyEvent(e) {
		e.target.form.editlevel.disabled = !e.target.checked;
		e.target.form.editexpiry.disabled = !e.target.checked || (e.target.form.editlevel.value === 'all');
		e.target.form.editlevel.style.color = e.target.form.editexpiry.style.color = e.target.checked ? '' : 'transparent';
	},
	editlevel: function twinkleprotectFormEditlevelEvent(e) {
		e.target.form.editexpiry.disabled = e.target.value === 'all';
	},
	movemodify: function twinkleprotectFormMovemodifyEvent(e) {
		// sync move settings with edit settings if applicable
		if (e.target.form.movelevel.disabled && !e.target.form.editlevel.disabled) {
			e.target.form.movelevel.value = e.target.form.editlevel.value;
			e.target.form.moveexpiry.value = e.target.form.editexpiry.value;
		} else if (e.target.form.editlevel.disabled) {
			e.target.form.movelevel.value = 'sysop';
			e.target.form.moveexpiry.value = 'infinity';
		}
		e.target.form.movelevel.disabled = !e.target.checked;
		e.target.form.moveexpiry.disabled = !e.target.checked || (e.target.form.movelevel.value === 'all');
		e.target.form.movelevel.style.color = e.target.form.moveexpiry.style.color = e.target.checked ? '' : 'transparent';
	},
	movelevel: function twinkleprotectFormMovelevelEvent(e) {
		e.target.form.moveexpiry.disabled = e.target.value === 'all';
	},
	pcmodify: function twinkleprotectFormPcmodifyEvent(e) {
		e.target.form.pclevel.disabled = !e.target.checked;
		e.target.form.pcexpiry.disabled = !e.target.checked || (e.target.form.pclevel.value === 'none');
		e.target.form.pclevel.style.color = e.target.form.pcexpiry.style.color = e.target.checked ? '' : 'transparent';
	},
	pclevel: function twinkleprotectFormPclevelEvent(e) {
		e.target.form.pcexpiry.disabled = e.target.value === 'none';
	},
	createlevel: function twinkleprotectFormCreatelevelEvent(e) {
		e.target.form.createexpiry.disabled = e.target.value === 'all';
	},
	tagtype: function twinkleprotectFormTagtypeEvent(e) {
		e.target.form.small.disabled = e.target.form.noinclude.disabled = (e.target.value === 'none') || (e.target.value === 'noop');
	}
};

Twinkle.protect.doCustomExpiry = function twinkleprotectDoCustomExpiry(target) {
	var custom = prompt('Enter a custom expiry time.  \nYou can use relative times, like "1 minute" or "19 days", or absolute timestamps, "yyyymmddhhmm" (e.g. "200602011405" is Feb 1, 2006, at 14:05 UTC).', '');
	if (custom) {
		var option = document.createElement('option');
		option.setAttribute('value', custom);
		option.textContent = custom;
		target.appendChild(option);
		target.value = custom;
	} else {
		target.selectedIndex = 0;
	}
};

// NOTE: This list is used by batchprotect as well
Twinkle.protect.protectionLevels = [
	{ label: '全ての利用者', value: 'all' },
	{ label: '自動承認された利用者', value: 'autoconfirmed' },
	{ label: '拡張承認された利用者', value: 'extendedconfirmed' },
	{ label: '管理者', value: 'sysop', selected: true }
];

// default expiry selection is conditionally set in Twinkle.protect.callback.changePreset
// NOTE: This list is used by batchprotect as well
Twinkle.protect.protectionLengths = [
	{ label: '1時間', value: '1 hour' },
	{ label: '2時間', value: '2 hours' },
	{ label: '3時間', value: '3 hours' },
	{ label: '6時間', value: '6 hours' },
	{ label: '12時間', value: '12 hours' },
	{ label: '1日間', value: '1 day' },
	{ label: '2日間', value: '2 days' },
	{ label: '3日間', value: '3 days' },
	{ label: '4日間', value: '4 days' },
	{ label: '1週間', value: '1 week' },
	{ label: '2週間', value: '2 weeks' },
	{ label: '1ヶ月間', value: '1 month' },
	{ label: '2ヶ月間', value: '2 months' },
	{ label: '3ヶ月間', value: '3 months' },
	{ label: '1年', value: '1 year' },
	{ label: '無期限', value: 'infinity' },
	{ label: 'その他', value: 'custom' }
];

Twinkle.protect.protectionTypes = [
	{ label: '保護解除', value: 'unprotect' },
	{
		label: '全保護',
		list: [
			{ label: '全般 (全)', value: 'pp' },
			{ label: '編集合戦 (全)', value: 'pp-dispute' },
			{ label: '拡張承認された利用者による問題投稿の繰り返し (全)', value: 'pp-vandalism' },
			{ label: '影響が特に大きいテンプレート (全)', value: 'pp-template' }
		]
	},
	{
		label: '拡張半保護',
		list: [
			{ label: '全般 (拡半)', value: 'pp-120-500-protected' },
			{ label: '(自動)承認された利用者による問題投稿の繰り返し (拡半)', value: 'pp-120-500-vandalism' },
			{ label: 'プライバシー侵害 (拡半)', value: 'pp-120-500-blp' },
			{ label: 'ソックパペット (拡半)', value: 'pp-120-500-sock' },
			{ label: '影響が特に大きいテンプレート (拡半)', value: 'pp-120-500-template' }
		]
	},
	{
		label: '半保護',
		list: [
			{ label: '全般 (半)', value: 'pp-semi-protected' },
			{ label: 'IP・新規利用者による問題投稿の繰り返し (半)', selected: true, value: 'pp-semi-vandalism' },
			{ label: 'プライバシー侵害 (半)', value: 'pp-semi-blp' },
			{ label: 'ソックパペット (半)', value: 'pp-semi-sock' },
			{ label: '影響が特に大きいテンプレート (半)', value: 'pp-semi-template' }
		]
	},
	{
		label: '移動保護',
		list: [
			{ label: '全般 (移)', value: 'pp-move' },
			{ label: '移動合戦 (移)', value: 'pp-move-dispute' },
			{ label: '度重なる荒らし (移)', value: 'pp-move-vandalism' },
			{ label: '移動不要ページ (移)', value: 'pp-move-indef' }
		]
	},
	{
		label: '移動拡張半保護',
		list: [
			{ label: '全般 (移拡)', value: 'pp-120-500-move' },
			{ label: '度重なる荒らし (移拡)', value: 'pp-120-500-move-vandalism' }
		]
	}
];

Twinkle.protect.protectionTypesCreate = [
	{ label: '保護解除', value: 'unprotect' },
	{
		label: '作成保護',
		list: [
			{ label: '全般 (全)', value: 'pp-create' },
			{ label: 'ソックパペットによる問題投稿の繰り返し (全)', value: 'pp-create-sock' },
			{ label: '拡張承認された利用者による問題投稿の繰り返し (全)', value: 'pp-create-vandalism' },
			{ label: '度重なる宣伝 (全)', value: 'pp-create-spam' },
			{ label: '削除されたページの改善なき再作成の繰り返し (全)', value: 'pp-create-salt' },
			{ label: 'プライバシー侵害の記述の繰り返し (全)', value: 'pp-create-blp' }
		]
	},
	{
		label: '作成拡張半保護',
		list: [
			{ label: '全般 (拡)', value: 'pp-120-500-create' },
			{ label: 'ソックパペットによる問題投稿の繰り返し (拡)', value: 'pp-120-500-create-sock' },
			{ label: '(自動)承認された利用者による問題投稿の繰り返し (拡)', value: 'pp-120-500-create-vandalism' },
			{ label: '度重なる宣伝 (拡)', value: 'pp-120-500-create-spam' },
			{ label: '削除されたページの改善なき再作成の繰り返し (拡)', value: 'pp-120-500-create-salt' },
			{ label: 'プライバシー侵害の記述の繰り返し (拡)', value: 'pp-120-500-create-blp' }
		]
	},
	{
		label: '作成半保護',
		list: [
			{ label: '全般 (半)', value: 'pp-semi-create' },
			{ label: 'ソックパペットによる問題投稿の繰り返し (半)', value: 'pp-semi-create-sock' },
			{ label: 'IP・新規利用者による問題投稿の繰り返し (半)', value: 'pp-semi-create-vandalism' },
			{ label: '度重なる宣伝 (半)', value: 'pp-semi-create-spam' },
			{ label: '削除されたページの改善なき再作成の繰り返し (半)', selected: true, value: 'pp-semi-create-salt' },
			{ label: 'プライバシー侵害の記述の繰り返し (半)', value: 'pp-semi-create-blp' }
		]
	}
];

// NOTICE: keep this synched with [[MediaWiki:Protect-dropdown]]
// Also note: stabilize = Pending Changes level
// expiry will override any defaults
Twinkle.protect.protectionPresetsInfo = {
	'pp': {
		edit: 'sysop',
		move: 'sysop',
		reason: null
	},
	'pp-dispute': {
		edit: 'sysop',
		move: 'sysop',
		reason: '編集合戦'
	},
	'pp-vandalism': {
		edit: 'sysop',
		move: 'sysop',
		reason: '拡張承認された利用者による問題投稿の繰り返し'
	},
	'pp-template': {
		edit: 'sysop',
		move: 'sysop',
		expiry: 'infinity',
		reason: '[[WP:HRT|影響が特に大きいテンプレート]]'
	},
	'pp-120-500-protected': {
		edit: 'extendedconfirmed',
		move: 'extendedconfirmed',
		reason: null,
		template: 'pp'
	},
	'pp-120-500-vandalism': {
		edit: 'extendedconfirmed',
		move: 'extendedconfirmed',
		reason: '(自動)承認された利用者による問題投稿の繰り返し',
		template: 'pp-vandalism'
	},
	'pp-120-500-blp': {
		edit: 'extendedconfirmed',
		move: 'extendedconfirmed',
		reason: 'プライバシー侵害の記述の繰り返し',
		template: 'pp-vandalism'
	},
	'pp-120-500-sock': {
		edit: 'extendedconfirmed',
		move: 'extendedconfirmed',
		reason: '[[WP:SOCK|ソックパペット]]による問題投稿の繰り返し',
		template: 'pp-vandalism'
	},
	'pp-120-500-template': {
		edit: 'extendedconfirmed',
		move: 'extendedconfirmed',
		expiry: 'infinity',
		reason: '[[WP:HRT|影響が特に大きいテンプレート]]',
		template: 'pp-template'
	},
	'pp-semi-vandalism': {
		edit: 'autoconfirmed',
		reason: 'IP・新規利用者による問題投稿の繰り返し',
		template: 'pp-vandalism'
	},
	'pp-semi-blp': {
		edit: 'autoconfirmed',
		reason: 'プライバシー侵害の記述の繰り返し',
		template: 'pp-vandalism'
	},
	'pp-semi-template': {  // removed for now
		edit: 'autoconfirmed',
		expiry: 'infinity',
		reason: '[[WP:HRT|影響が特に大きいテンプレート]]',
		template: 'pp-template'
	},
	'pp-semi-sock': {
		edit: 'autoconfirmed',
		reason: '[[WP:SOCK|ソックパペット]]による問題投稿の繰り返し',
		template: 'pp-vandalism'
	},
	'pp-semi-protected': {
		edit: 'autoconfirmed',
		reason: null,
		template: 'pp'
	},
	'pp-move': {
		move: 'sysop',
		reason: null
	},
	'pp-move-dispute': {
		move: 'sysop',
		expiry: '1 week',
		reason: '移動合戦'
	},
	'pp-move-vandalism': {
		move: 'sysop',
		reason: '度重なる荒らし'
	},
	'pp-move-indef': {
		move: 'sysop',
		expiry: 'infinity',
		reason: '移動不要ページ',
		template: 'pp-move'
	},
	'pp-120-500-move': {
		move: 'extendedconfirmed',
		reason: null,
		template: 'pp-move'
	},
	'pp-120-500-move-vandalism': {
		move: 'extendedconfirmed',
		reason: null,
		template: 'pp-move-vandalism'
	},
	'unprotect': {
		edit: 'all',
		move: 'all',
		stabilize: 'none',
		create: 'all',
		reason: null,
		template: 'none'
	},
	'pp-create-sock': {
		create: 'sysop',
		reason: '[[WP:SOCK|ソックパペット]]による問題投稿の繰り返し'
	},
	'pp-create': {
		create: 'sysop',
		reason: null
	},
	'pp-create-vandalism': {
		create: 'sysop',
		reason: '拡張承認された利用者による問題投稿の繰り返し'
	},
	'pp-create-spam': {
		create: 'sysop',
		reason: '度重なる宣伝'
	},
	'pp-create-salt': {
		create: 'sysop',
		reason: '削除されたページの改善なき再作成の繰り返し'
	},
	'pp-create-blp': {
		create: 'sysop',
		reason: 'プライバシー侵害の記述の繰り返し'
	},
	'pp-120-500-create': {
		create: 'extendedconfirmed',
		reason: null
	},
	'pp-120-500-create-sock': {
		create: 'extendedconfirmed',
		reason: '[[WP:SOCK|ソックパペット]]による問題投稿の繰り返し'
	},
	'pp-120-500-create-vandalism': {
		create: 'extendedconfirmed',
		reason: '(自動)承認された利用者による問題投稿の繰り返し'
	},
	'pp-120-500-create-spam': {
		create: 'extendedconfirmed',
		reason: '度重なる宣伝'
	},
	'pp-120-500-create-salt': {
		create: 'extendedconfirmed',
		reason: '削除されたページの改善なき再作成の繰り返し'
	},
	'pp-120-500-create-blp': {
		create: 'sysop',
		reason: 'プライバシー侵害の記述の繰り返し'
	},
	'pp-semi-create': {
		create: 'autoconfirmed',
		reason: null
	},
	'pp-semi-create-sock': {
		create: 'autoconfirmed',
		reason: '[[WP:SOCK|ソックパペット]]による問題投稿の繰り返し'
	},
	'pp-semi-create-vandalism': {
		create: 'autoconfirmed',
		reason: 'IP・新規利用者による問題投稿の繰り返し'
	},
	'pp-semi-create-spam': {
		create: 'autoconfirmed',
		reason: '度重なる宣伝'
	},
	'pp-semi-create-salt': {
		create: 'autoconfirmed',
		reason: '削除されたページの改善なき再作成の繰り返し'
	},
	'pp-semi-create-blp': {
		create: 'autoconfirmed',
		reason: 'プライバシー侵害の記述の繰り返し'
	}
};

Twinkle.protect.protectionTags = [
	{
		label: 'なし (既にある保護テンプレートを除去する)',
		value: 'none'
	},
	{
		label: 'なし (既にある保護テンプレートを除去しない)',
		value: 'noop'
	},
	{
		label: '編集保護テンプレート',
		list: [
			{ label: '{{pp}}: 全般', value: 'pp' },
			{ label: '{{pp-vandalism}}: 荒らし', value: 'pp-vandalism' },
			{ label: '{{pp-dispute}}: 編集合戦', value: 'pp-dispute' },
			{ label: '{{pp-template}}: 影響が特に大きいテンプレート', value: 'pp-template' },
			{ label: '{{pp-semi-indef}}: 長期間の半保護', value: 'pp-semi-indef' }
		]
	},
	{
		label: '移動保護テンプレート',
		list: [
			{ label: '{{pp-move-dispute}}: 移動合戦', value: 'pp-move-dispute' },
			{ label: '{{pp-move-vandalism}}: 度重なる荒らし', value: 'pp-move-vandalism' },
			{ label: '{{pp-move}}: その他', value: 'pp-move' }
		]
	}
].filter(function(type) {
	// Filter FlaggedRevs
	return hasFlaggedRevs || type.label !== 'Pending changes templates';
});

Twinkle.protect.callback.changePreset = function twinkleprotectCallbackChangePreset(e) {
	var form = e.target.form;

	var actiontypes = form.actiontype;
	var actiontype;
	for (var i = 0; i < actiontypes.length; i++) {
		if (!actiontypes[i].checked) {
			continue;
		}
		actiontype = actiontypes[i].values;
		break;
	}

	if (actiontype === 'protect') {  // actually protecting the page
		var item = Twinkle.protect.protectionPresetsInfo[form.category.value];

		if (mw.config.get('wgArticleId')) {
			if (item.edit) {
				form.editmodify.checked = true;
				Twinkle.protect.formevents.editmodify({ target: form.editmodify });
				form.editlevel.value = item.edit;
				Twinkle.protect.formevents.editlevel({ target: form.editlevel });
			} else {
				form.editmodify.checked = false;
				Twinkle.protect.formevents.editmodify({ target: form.editmodify });
			}

			if (item.move) {
				form.movemodify.checked = true;
				Twinkle.protect.formevents.movemodify({ target: form.movemodify });
				form.movelevel.value = item.move;
				Twinkle.protect.formevents.movelevel({ target: form.movelevel });
			} else {
				form.movemodify.checked = false;
				Twinkle.protect.formevents.movemodify({ target: form.movemodify });
			}

			form.editexpiry.value = form.moveexpiry.value = item.expiry || '1 week';


			if (form.pcmodify) {
				if (item.stabilize) {
					form.pcmodify.checked = true;
					Twinkle.protect.formevents.pcmodify({ target: form.pcmodify });
					form.pclevel.value = item.stabilize;
					Twinkle.protect.formevents.pclevel({ target: form.pclevel });
				} else {
					form.pcmodify.checked = false;
					Twinkle.protect.formevents.pcmodify({ target: form.pcmodify });
				}
				form.pcexpiry.value = item.expiry || '1 month';
			}
		} else {
			if (item.create) {
				form.createlevel.value = item.create;
				Twinkle.protect.formevents.createlevel({ target: form.createlevel });
			}
			form.createexpiry.value = item.expiry || 'infinity';
		}

		var reasonField = actiontype === 'protect' ? form.protectReason : form.reason;
		if (item.reason) {
			reasonField.value = item.reason;
		} else {
			reasonField.value = '';
		}
		// Add any annotations
		Twinkle.protect.callback.annotateProtectReason(e);

		// sort out tagging options, disabled if nonexistent or lua
		if (mw.config.get('wgArticleId') && mw.config.get('wgPageContentModel') !== 'Scribunto') {
			if (form.category.value === 'unprotect') {
				form.tagtype.value = 'none';
			} else {
				form.tagtype.value = item.template ? item.template : form.category.value;
			}
			Twinkle.protect.formevents.tagtype({ target: form.tagtype });

			// Default settings for adding <noinclude> tags to protection templates
			var isTemplateProtection = form.category.value === 'pp-template';
			var isAFD = Morebits.pageNameNorm.startsWith('Wikipedia:削除依頼/');
			var isNotTemplateNamespace = mw.config.get('wgNamespaceNumber') !== 10;
			var isCode = ['javascript', 'css', 'sanitized-css'].includes(mw.config.get('wgPageContentModel'));
			if ((isTemplateProtection || isAFD) && !isCode) {
				form.noinclude.checked = true;
			} else if (isCode || isNotTemplateNamespace) {
				form.noinclude.checked = false;
			}
		}

	} else {  // RPP request
		if (form.category.value === 'unprotect') {
			form.expiry.value = '';
			form.expiry.disabled = true;
		} else {
			form.expiry.value = '';
			form.expiry.disabled = false;
		}
	}
};

Twinkle.protect.callback.evaluate = function twinkleprotectCallbackEvaluate(e) {
	var form = e.target;
	var input = Morebits.quickForm.getInputData(form);

	var tagparams;
	if (input.actiontype === 'tag' || (input.actiontype === 'protect' && mw.config.get('wgArticleId') && mw.config.get('wgPageContentModel') !== 'Scribunto')) {
		tagparams = {
			tag: input.tagtype,
			reason: false,
			small: input.small,
			noinclude: input.noinclude
		};
	} else if (input.actiontype === 'request') {
		tagparams = {
			tag: '保護依頼',
			reason: false,
			noinclude: input.noinclude
		};
	}

	switch (input.actiontype) {
		case 'protect':
			// protect the page
			Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
			Morebits.wiki.actionCompleted.notice = '保護完了';

			var statusInited = false;
			var thispage;

			var allDone = function twinkleprotectCallbackAllDone() {
				if (thispage) {
					thispage.getStatusElement().info('完了');
				}
				if (tagparams) {
					Twinkle.protect.callbacks.taggingPageInitial(tagparams);
				}
			};

			var protectIt = function twinkleprotectCallbackProtectIt(next) {
				thispage = new Morebits.wiki.page(mw.config.get('wgPageName'), 'ページを保護');
				if (mw.config.get('wgArticleId')) {
					if (input.editmodify) {
						thispage.setEditProtection(input.editlevel, input.editexpiry);
					}
					if (input.movemodify) {
						// Ensure a level has actually been chosen
						if (input.movelevel) {
							thispage.setMoveProtection(input.movelevel, input.moveexpiry);
						} else {
							alert('移動保護のレベルを選択して下さい!');
							return;
						}
					}
					thispage.setWatchlist(Twinkle.getPref('watchProtectedPages'));
				} else {
					thispage.setCreateProtection(input.createlevel, input.createexpiry);
					thispage.setWatchlist(false);
				}

				if (input.protectReason) {
					thispage.setEditSummary(input.protectReason);
				} else {
					alert('保護理由を入力する必要があります。入力された理由は保護記録に記録されます。');
					return;
				}

				if (input.protectReason_notes_rfppRevid && !/^\d+$/.test(input.protectReason_notes_rfppRevid)) {
					alert('指定された版番号が無効です。正しい番号（"oldid"とも言う）を見つける方法に関しては https://ja.wikipedia.org/wiki/Help:固定リンク をご覧ください。');
					return;
				}

				if (!statusInited) {
					Morebits.simpleWindow.setButtonsEnabled(false);
					Morebits.status.init(form);
					statusInited = true;
				}

				// thispage.setChangeTags(Twinkle.changeTags);
				thispage.protect(next);
			};

			var stabilizeIt = function twinkleprotectCallbackStabilizeIt() {
				if (thispage) {
					thispage.getStatusElement().info('done');
				}

				thispage = new Morebits.wiki.page(mw.config.get('wgPageName'), 'Applying pending changes protection');
				thispage.setFlaggedRevs(input.pclevel, input.pcexpiry);

				if (input.protectReason) {
					thispage.setEditSummary(input.protectReason + Twinkle.summaryAd); // flaggedrevs tag support: [[phab:T247721]]
				} else {
					alert('You must enter a protect reason, which will be inscribed into the protection log.');
					return;
				}

				if (!statusInited) {
					Morebits.simpleWindow.setButtonsEnabled(false);
					Morebits.status.init(form);
					statusInited = true;
				}

				thispage.setWatchlist(Twinkle.getPref('watchProtectedPages'));
				thispage.stabilize(allDone, function(error) {
					if (error.errorCode === 'stabilize_denied') { // [[phab:T234743]]
						thispage.getStatusElement().error('Failed trying to modify pending changes settings, likely due to a mediawiki bug. Other actions (tagging or regular protection) may have taken place. Please reload the page and try again.');
					}
				});
			};

			if (input.editmodify || input.movemodify || !mw.config.get('wgArticleId')) {
				if (input.pcmodify) {
					protectIt(stabilizeIt);
				} else {
					protectIt(allDone);
				}
			} else if (input.pcmodify) {
				stabilizeIt();
			} else {
				alert("Twinkleに何かをさせてあげてください!\nページにタグを付けるだけなら、上部にある'保護テンプレートをページにタグ付けする'オプションを選ぶことができます。");
			}

			break;

		case 'tag':
			// apply a protection template

			Morebits.simpleWindow.setButtonsEnabled(false);
			Morebits.status.init(form);

			Morebits.wiki.actionCompleted.redirect = mw.config.get('wgPageName');
			Morebits.wiki.actionCompleted.followRedirect = false;
			Morebits.wiki.actionCompleted.notice = 'タグ付け操作';

			Twinkle.protect.callbacks.taggingPageInitial(tagparams);
			break;

		case 'request':

			if (!input.reason) {
				alert('保護が必要な理由を入力してください。');
				return;
			}
			// file request at RFPP
			var typename, typereason;
			switch (input.category) {
				case 'pp-dispute':
				case 'pp-vandalism':
				case 'pp':
				case 'pp-template':
					typename = '全保護';
					break;
				case 'pp-120-500-vandalism':
				case 'pp-120-500-blp':
				case 'pp-120-500-sock':
				case 'pp-120-500-protected':
				case 'pp-120-500-template':
					typename = '拡張半保護';
					break;
				case 'pp-semi-vandalism':
				case 'pp-semi-sock':
				case 'pp-semi-blp':
				case 'pp-semi-protected':
				case 'pp-semi-template':
					typename = '半保護';
					break;
				case 'pp-move':
				case 'pp-move-dispute':
				case 'pp-move-indef':
				case 'pp-move-vandalism':
					typename = '移動保護';
					break;
				case 'pp-120-500-move':
				case 'pp-120-500-move-vandalism':
					typename = '移動拡張半保護';
					break;
				case 'pp-create':
				case 'pp-create-sock':
				case 'pp-create-vandalism':
				case 'pp-create-spam':
				case 'pp-create-blp':
				case 'pp-create-salt':
					typename = '作成保護';
					break;
				case 'pp-120-500-create':
				case 'pp-120-500-create-sock':
				case 'pp-120-500-create-vandalism':
				case 'pp-120-500-create-spam':
				case 'pp-120-500-create-blp':
				case 'pp-120-500-create-salt':
					typename = '作成拡張半保護';
					break;
				case 'pp-semi-create':
				case 'pp-semi-create-sock':
				case 'pp-semi-create-vandalism':
				case 'pp-semi-create-spam':
				case 'pp-semi-create-blp':
				case 'pp-semi-create-salt':
					typename = '作成半保護';
					break;
				default:
					typename = '保護解除';
					break;
			}
			switch (input.category) {
				case 'pp-dispute':
					typereason = '編集合戦';
					break;
				case 'pp-vandalism':
				case 'pp-create-vandalism':
					typereason = '拡張承認された利用者による問題投稿の繰り返し';
					break;
				case 'pp-120-500-vandalism':
				case 'pp-120-500-create-vandalism':
					typereason = '(自動)承認された利用者による問題投稿の繰り返し';
					break;
				case 'pp-semi-vandalism':
				case 'pp-semi-create-vandalism':
					typereason = 'IP・新規利用者による問題投稿の繰り返し';
					break;
				case 'pp-move-vandalism':
				case 'pp-move-120-500-vandalism':
					typereason = '度重なる荒らし';
					break;
				case 'pp-template':
				case 'pp-120-500-template':
				case 'pp-semi-template':
					typereason = '[[WP:HRT|影響が特に大きいテンプレート]]';
					break;
				case 'pp-semi-sock':
				case 'pp-120-500-sock':
				case 'pp-create-sock':
				case 'pp-120-500-create-sock':
				case 'pp-semi-create-sock':
					typereason = '[[WP:SOCK|ソックパペット]]による問題投稿の繰り返し';
					break;
				case 'pp-semi-blp':
				case 'pp-120-500-blp':
				case 'pp-create-blp':
				case 'pp-120-500-create-blp':
				case 'pp-semi-create-blp':
					typereason = 'プライバシー侵害の記述の繰り返し';
					break;
				case 'pp-move-dispute':
					typereason = '移動合戦';
					break;
				case 'pp-create-spam':
				case 'pp-120-500-create-spam':
				case 'pp-semi-create-spam':
					typereason = '度重なる宣伝';
					break;
				case 'pp-move-indef':
					typereason = '移動不要ページ';
					break;
				case 'pp-create-salt':
				case 'pp-120-500-create-salt':
				case 'pp-semi-create-salt':
					typereason = '削除されたページの改善なき再作成の繰り返し';
					break;
				default:
					typereason = '';
					break;
			}

			var reason = typereason;
			if (input.reason !== '') {
				if (typereason !== '') {
					reason += '\u00A0\u2013 ';  // U+00A0 NO-BREAK SPACE; U+2013 EN RULE
				}
				reason += input.reason;
			}

			var rppparams = {
				reason: reason,
				typename: typename,
				category: input.category,
				expiry: input.expiry
			};

			Morebits.simpleWindow.setButtonsEnabled(false);
			Morebits.status.init(form);

			var rppName = 'Wikipedia:保護依頼';

			// Updating data for the action completed event
			Morebits.wiki.actionCompleted.redirect = rppparams.typename !== '保護解除' ? 'Project:保護依頼' : 'Project:保護解除依頼';
			Morebits.wiki.actionCompleted.notice = '依頼完了、依頼ページへリダイレクトします。';

			var rppPage = new Morebits.wiki.page(rppName, 'ページの保護を依頼');
			rppPage.setFollowRedirect(true);
			rppPage.setCallbackParameters(rppparams);
			rppPage.load(Twinkle.protect.callbacks.fileRequest);
			if (input.req_template && rppparams.typename !== '保護解除') {
				Twinkle.protect.callbacks.taggingPageInitial(tagparams);
			}
			break;
		default:
			alert('twinkleprotect: 不明な操作');
			break;
	}
};

Twinkle.protect.protectReasonAnnotations = [];
Twinkle.protect.callback.annotateProtectReason = function twinkleprotectCallbackAnnotateProtectReason(e) {
	var form = e.target.form;
	var protectReason = form.protectReason.value.replace(new RegExp('(?:; )?' + mw.util.escapeRegExp(Twinkle.protect.protectReasonAnnotations.join(': '))), '');

	if (this.name === 'protectReason_notes_rfpp') {
		if (this.checked) {
			Twinkle.protect.protectReasonAnnotations.push(this.value);
			$(form.protectReason_notes_rfppRevid).parent().show();
		} else {
			Twinkle.protect.protectReasonAnnotations = [];
			form.protectReason_notes_rfppRevid.value = '';
			$(form.protectReason_notes_rfppRevid).parent().hide();
		}
	} else if (this.name === 'protectReason_notes_rfppRevid') {
		Twinkle.protect.protectReasonAnnotations = Twinkle.protect.protectReasonAnnotations.filter(function(el) {
			return el.indexOf('[[Special:Permalink') === -1;
		}).filter(function(el) {
			return el.indexOf('[[WP:RFPP') === -1;
		});
		if (e.target.value.length) {
			var permalink = '[[Special:Permalink/' + e.target.value + '#' + Morebits.pageNameNorm + '（ノート_/_履歴_/_ログ_/_リンク元）|WP:RFPP]]による';
			Twinkle.protect.protectReasonAnnotations.push(permalink);
		} else {
			Twinkle.protect.protectReasonAnnotations.push('[[WP:RFPP]]による');
		}
	}

	if (!Twinkle.protect.protectReasonAnnotations.length) {
		form.protectReason.value = protectReason;
	} else {
		form.protectReason.value = (protectReason ? protectReason + '; ' : '') + Twinkle.protect.protectReasonAnnotations.join(': ');
	}
};

Twinkle.protect.callbacks = {
	taggingPageInitial: function(tagparams) {
		if (tagparams.tag === 'noop') {
			Morebits.status.info('Applying protection template', 'nothing to do');
			return;
		}

		var protectedPage = new Morebits.wiki.page(mw.config.get('wgPageName'), 'ページにタグ付け');
		protectedPage.setCallbackParameters(tagparams);
		protectedPage.load(Twinkle.protect.callbacks.taggingPage);
	},
	taggingPage: function(protectedPage) {
		var params = protectedPage.getCallbackParameters();
		var text = protectedPage.getPageText();
		var tag, summary;

		var oldtag_re = /(?:\/\*)?\s*(?:<noinclude>)?\s*\{\{\s*((?:pp|保護依頼)[^{}]*?|protected|(?:t|v|s|p-|usertalk-v|usertalk-s|sb|move)protected(?:2)?|protected template|privacy protection)\s*?\}\}\s*(?:<\/noinclude>)?\s*(?:\*\/)?\s*/gi;
		var re_result = oldtag_re.exec(text);
		if (re_result) {
			if (params.tag === 'none' || confirm('ページ上に保護関連テンプレート（{{' + re_result[1] + '}}など）が見つかりました。\nOKをクリックして除去する、またはCancelをクリックしてそのままにしておきます。')) {
				text = text.replace(oldtag_re, '');
			}
		}

		if (params.tag === 'none') {
			summary = '保護(依頼)テンプレートの除去';
		} else {
			tag = params.tag;
			if (params.reason) {
				tag += '|reason=' + params.reason;
			}
			if (params.small) {
				tag += '|small=yes';
			}

			if (/^\s*#(redirect|転送)/i.test(text)) { // redirect page
				// Only tag if no {{rcat shell}} is found
				if (!text.match(/{{(?:redr|this is a redirect|r(?:edirect)?(?:.?cat.*)?[ _]?sh)/i)) {
					text = text.replace(/#(redirect|転送) ?(\[\[.*?\]\])(.*)/i, '#REDIRECT $1$2\n\n{{' + tag + '}}');
				} else {
					Morebits.status.info('Redirect category shell present', 'nothing to do');
					return;
				}
			} else {
				var needsTagToBeCommentedOut = ['javascript', 'css', 'sanitized-css'].indexOf(protectedPage.getContentModel()) !== -1;
				if (needsTagToBeCommentedOut) {
					if (params.noinclude) {
						tag = '/* <noinclude>{{' + tag + '}}</noinclude> */';
					} else {
						tag = '/* {{' + tag + '}} */\n';
					}

					// Prepend tag at very top
					text = tag + text;
				} else {
					if (params.noinclude) {
						tag = '<noinclude>{{' + tag + '}}</noinclude>';
					} else {
						tag = '{{' + tag + '}}\n';
					}

					// Insert tag after short description or any hatnotes
					var wikipage = new Morebits.wikitext.page(text);
					text = wikipage.insertAfterTemplates(tag, Twinkle.hatnoteRegex).getText();
				}
			}
			summary = '{{' + params.tag + '}}を追加';
		}

		protectedPage.setEditSummary(summary + Twinkle.summaryAd);
		// protectedPage.setChangeTags(Twinkle.changeTags);
		protectedPage.setWatchlist(Twinkle.getPref('watchPPTaggedPages'));
		protectedPage.setPageText(text);
		protectedPage.setCreateOption('nocreate');
		protectedPage.suppressProtectWarning(); // no need to let admins know they are editing through protection
		protectedPage.save();
	},

	fileRequest: function(rppPage) {

		var rppPage2 = new Morebits.wiki.page('Wikipedia:保護解除依頼', '依頼ページを読み込み中');
		rppPage2.load(function() {
			var params = rppPage.getCallbackParameters();
			var text = rppPage.getPageText();
			var statusElement = rppPage.getStatusElement();
			var text2 = rppPage2.getPageText();

			// If either protection type results in a increased status, then post it under increase
			// else we post it under decrease
			var increase = false;
			if (params.typename !== '保護解除') {
				increase = true;
			}

			var rppRe = new RegExp('====\\s*(\\{\\{)?\\s*[pP]age\\s*\\|\\s*' + Morebits.string.escapeRegExp(Morebits.pageNameNorm) + '\\s*(\\}\\})?\\s*====', 'm');
			var newtag = '\n==== {{Page|' + Morebits.pageNameNorm + '}} ====\n';

			var tag = new RegExp('^' + mw.util.escapeRegExp(newtag).replace(/\s+/g, '\\s*'), 'm').test(text) || rppRe.exec(text);
			var tag2 = new RegExp('^' + mw.util.escapeRegExp(newtag).replace(/\s+/g, '\\s*'), 'm').test(text2) || rppRe.exec(text2);

			var rppLink = document.createElement('a');
			rppLink.setAttribute('href', mw.util.getUrl('Wikipedia:保護依頼'));
			rppLink.appendChild(document.createTextNode('Wikipedia:保護依頼'));

			var rppLink2 = document.createElement('a');
			rppLink2.setAttribute('href', mw.util.getUrl('Wikipedia:保護解除依頼'));
			rppLink2.appendChild(document.createTextNode('Wikipedia:保護解除依頼'));

			if (tag && increase) {
				statusElement.error([ 'このページの保護依頼が', rppLink, 'で見つかりました、中止します。' ]);
				return;
			} else if (tag2 && !increase) {
				statusElement.error([ 'このページの保護解除依頼が', rppLink2, 'で見つかりました、中止します。' ]);
				return;
			}

			newtag += Morebits.string.formatReasonText(params.reason) + '--~~~~';

			if (increase) {
				rppPage.parse(function() {
					var sections = rppPage.getSections();
					// 依頼先の節取得
					var time = new Morebits.date();
					var month = time.getMonth() + 1;
					var date = time.getDate();
					var section = null;
					if (date < 11) {
						section = month + '月上旬（1日から10日まで）';
					} else if (date > 20) {
						section = month + '月下旬（21日から末日まで）';
					} else {
						section = month + '月中旬（11日から20日まで）';
					}
					sections = sections.filter(function(sections) {
						return sections.level === '3';
					}).filter(function(sections) {
						return sections.fromtitle === 'Wikipedia:保護依頼';
					}).filter(function(sections) {
						return sections.line === section;
					});
					if (sections.length !== 1) {
						statusElement.error('報告先の節を正しく取得できませんでした。');
						return;
					}
					statusElement.status('新規依頼を追加中...');
					rppPage.setPageSection(Number(sections[0].index));
					rppPage.setEditSummary('/* ' + Morebits.pageNameNorm + ' */ [[:' + Morebits.pageNameNorm + ']]の' + params.typename + 'を依頼' + Twinkle.summaryAd);
					// rppPage.setChangeTags(Twinkle.changeTags);
					rppPage.setAppendText(newtag);
					rppPage.setCreateOption('recreate');

					rppPage.save(function() {
						// Watch the page being requested
						var watchPref = Twinkle.getPref('watchRequestedPages');
						// action=watch has no way to rely on user preferences (T262912), so we do it manually.
						// The watchdefault pref appears to reliably return '1' (string),
						// but that's not consistent among prefs so might as well be "correct"
						var watch = watchPref !== 'no' && (watchPref !== 'default' || !!parseInt(mw.user.options.get('watchdefault'), 10));
						if (watch) {
							var watch_query = {
								action: 'watch',
								titles: mw.config.get('wgPageName'),
								token: mw.user.tokens.get('watchToken')
							};
							// Only add the expiry if page is unwatched or already temporarily watched
							if (Twinkle.protect.watched !== true && watchPref !== 'default' && watchPref !== 'yes') {
								watch_query.expiry = watchPref;
							}
							new Morebits.wiki.api('依頼したページをウォッチリストに追加中', watch_query).post();
						}
					});
				});
			} else {
				rppPage2.parse(function() {
					var sections = rppPage2.getSections();
					// 依頼先の節取得
					var time = new Morebits.date();
					var month = time.getMonth() + 1;
					var date = time.getDate();
					var section = null;
					if (date < 11) {
						section = month + '月上旬（1日から10日まで）';
					} else if (date > 20) {
						section = month + '月下旬（21日から末日まで）';
					} else {
						section = month + '月中旬（11日から20日まで）';
					}
					sections = sections.filter(function(sections) {
						return sections.level === '3';
					}).filter(function(sections) {
						return sections.fromtitle === 'Wikipedia:保護解除依頼';
					}).filter(function(sections) {
						return sections.line === section;
					});
					if (sections.length !== 1) {
						statusElement.error('報告先の節を正しく取得できませんでした。');
						return;
					}
					text2 += '\n' + newtag;
					statusElement.status('新規依頼を追加中...');
					rppPage2.setPageSection(Number(sections[0].index));
					rppPage2.setEditSummary('/* ' + Morebits.pageNameNorm + ' */ [[:' + Morebits.pageNameNorm + ']]の' + params.typename + 'を依頼' + Twinkle.summaryAd);
					// rppPage2.setChangeTags(Twinkle.changeTags);
					rppPage2.setAppendText(newtag);
					rppPage2.setCreateOption('recreate');

					rppPage2.save(function() {
						// Watch the page being requested
						var watchPref = Twinkle.getPref('watchRequestedPages');
						// action=watch has no way to rely on user preferences (T262912), so we do it manually.
						// The watchdefault pref appears to reliably return '1' (string),
						// but that's not consistent among prefs so might as well be "correct"
						var watch = watchPref !== 'no' && (watchPref !== 'default' || !!parseInt(mw.user.options.get('watchdefault'), 10));
						if (watch) {
							var watch_query = {
								action: 'watch',
								titles: mw.config.get('wgPageName'),
								token: mw.user.tokens.get('watchToken')
							};
							// Only add the expiry if page is unwatched or already temporarily watched
							if (Twinkle.protect.watched !== true && watchPref !== 'default' && watchPref !== 'yes') {
								watch_query.expiry = watchPref;
							}
							new Morebits.wiki.api('依頼したページをウォッチリストに追加中', watch_query).post();
						}
					});
				});
			}
		});
	}
};

Twinkle.addInitCallback(Twinkle.protect, 'protect');
})(jQuery);


// </nowiki>
