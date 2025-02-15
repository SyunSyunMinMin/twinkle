// <nowiki>


(function($) {


/*
 ****************************************
 *** twinkleconfig.js: Preferences module
 ****************************************
 * Mode of invocation:     Adds configuration form to User:Syunsyunminmin/Twinkle/Preferences,
                           and adds an ad box to the top of user subpages belonging to the
                           currently logged-in user which end in '.js'
 * Active on:              What I just said.  Yeah.

 I, [[User:This, that and the other]], originally wrote this.  If the code is misbehaving, or you have any
 questions, don't hesitate to ask me.  (This doesn't at all imply [[WP:OWN]]ership - it's just meant to
 point you in the right direction.)  -- TTO
 */


Twinkle.config = {};

Twinkle.config.watchlistEnums = {
	'yes': 'ウォッチリストに追加 (無期限)',
	'no': 'ウォッチリストに追加しない',
	'default': 'サイトの設定に従う',
	'1 week': '1週間ウォッチ',
	'1 month': '1ヶ月ウォッチ',
	'3 months': '3ヶ月ウォッチ',
	'6 months': '6ヶ月ウォッチ'
};

Twinkle.config.commonSets = {
	csdCriteria: {
		'db': 'その他 ({{即時削除|その他}})',
		'g1': 'G1', 'g2': 'G2', 'g3': 'G3', 'g4': 'G4', 'g5': 'G5', 'g6': 'G6', 'g8': 'G8', 'g9': 'G9', 'g10': 'G10',
		'a1': 'A1',
		'u1': 'U1', 'u2': 'U2', 'u3': 'U3',
		'f1-2': 'F1-2', 'f1-3': 'F1-3', 'f1-4': 'F1-4', 'f1-5': 'F1-5', 'f1-6': 'F1-6',
		'f3': 'F3', 'f5': 'F5', 'f6': 'F6', 'f7': 'F7', 'f8': 'F8', 'f9': 'F9',
		'c1': 'C1', 'c3': 'C3', 'c6': 'C6',
		'r1-1': 'R1-1', 'r1-2': 'R1-2', 'r1-3': 'R1-3', 'r1-4': 'R1-4',
		'r2-1': 'R2-1', 'r2-2': 'R2-2', 'r2-3': 'R2-3', 'r2-5': 'R2-5', 'r2-6': 'R2-6',
		'r4': 'R4'
	},
	csdCriteriaDisplayOrder: [
		'db',
		'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g8', 'g9', 'g10',
		'a1',
		'u1', 'u2', 'u3',
		'f1-2', 'f1-3', 'f1-4', 'f1-5', 'f1-6', 'f3', 'f5', 'f6', 'f7', 'f8', 'f9',
		'c1', 'c3', 'c6',
		'r1-1', 'r1-2', 'r1-3', 'r1-4', 'r2-1', 'r2-2', 'r2-3', 'r2-5', 'r2-6', 'r4'
	],
	csdAndImageDeletionCriteria: {
		'db': 'その他 ({{即時削除|その他}})',
		'g1': 'G1', 'g2': 'G2', 'g3': 'G3', 'g4': 'G4', 'g5': 'G5', 'g6': 'G6', 'g8': 'G8', 'g9': 'G9', 'g10': 'G10',
		'a1': 'A1',
		'u1': 'U1', 'u2': 'U2', 'u3': 'U3',
		'f1-2': 'F1-2', 'f1-3': 'F1-3', 'f1-4': 'F1-4', 'f1-5': 'F1-5', 'f1-6': 'F1-6',
		'f3': 'F3', 'f5': 'F5', 'f6': 'F6', 'f7': 'F7', 'f8': 'F8', 'f9': 'F9',
		'c1': 'C1', 'c3': 'C3', 'c6': 'C6',
		'r1-1': 'R1-1', 'r1-2': 'R1-2', 'r1-3': 'R1-3', 'r1-4': 'R1-4',
		'r2-1': 'R2-1', 'r2-2': 'R2-2', 'r2-3': 'R2-3', 'r2-5': 'R2-5', 'r2-6': 'R2-6',
		'r4': 'R4'
	},
	csdAndImageDeletionCriteriaDisplayOrder: [
		'db',
		'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g8', 'g9', 'g10',
		'a1',
		'u1', 'u2', 'u3',
		'f1-2', 'f1-3', 'f1-4', 'f1-5', 'f1-6', 'f3', 'f5', 'f6', 'f7', 'f8', 'f9',
		'c1', 'c3', 'c6',
		'r1-1', 'r1-2', 'r1-3', 'r1-4', 'r2-1', 'r2-2', 'r2-3', 'r2-5', 'r2-6', 'r4'
	],
	namespacesNoSpecial: {
		0: '標準',
		1: 'ノート (標準)',
		2: '利用者',
		3: '利用者‐会話',
		4: 'Wikipedia',
		5: 'Wikipedia‐ノート',
		6: 'ファイル',
		7: 'ファイル‐ノート',
		8: 'MediaWiki',
		9: 'MediaWiki‐ノート',
		10: 'Template',
		11: 'Template‐ノート',
		12: 'Help',
		13: 'Help‐ノート',
		14: 'Category',
		15: 'Category‐ノート',
		100: 'Portal',
		101: 'Portal‐ノート',
		710: 'TimedText',
		711: 'TimedText‐ノート',
		828: 'Module',
		829: 'Module‐ノート'
	}
};

/**
 * Section entry format:
 *
 * {
 *   title: <human-readable section title>,
 *   module: <name of the associated module, used to link to sections>,
 *   adminOnly: <true for admin-only sections>,
 *   hidden: <true for advanced preferences that rarely need to be changed - they can still be modified by manually editing twinkleoptions.js>,
 *   preferences: [
 *     {
 *       name: <TwinkleConfig property name>,
 *       label: <human-readable short description - used as a form label>,
 *       helptip: <(optional) human-readable text (using valid HTML) that complements the description, like limits, warnings, etc.>
 *       adminOnly: <true for admin-only preferences>,
 *       type: <string|boolean|integer|enum|set|customList> (customList stores an array of JSON objects { value, label }),
 *       enumValues: <for type = "enum": a JSON object where the keys are the internal names and the values are human-readable strings>,
 *       setValues: <for type = "set": a JSON object where the keys are the internal names and the values are human-readable strings>,
 *       setDisplayOrder: <(optional) for type = "set": an array containing the keys of setValues (as strings) in the order that they are displayed>,
 *       customListValueTitle: <for type = "customList": the heading for the left "value" column in the custom list editor>,
 *       customListLabelTitle: <for type = "customList": the heading for the right "label" column in the custom list editor>
 *     },
 *     . . .
 *   ]
 * },
 * . . .
 *
 */

Twinkle.config.sections = [
	{
		title: '全般',
		module: 'general',
		preferences: [
			// TwinkleConfig.userTalkPageMode may take arguments:
			// 'window': open a new window, remember the opened window
			// 'tab': opens in a new tab, if possible.
			// 'blank': force open in a new window, even if such a window exists
			{
				name: 'userTalkPageMode',
				label: '利用者会話ページを開く時は次のページで開く',
				type: 'enum',
				enumValues: { window: 'ウィンドウ内で他の利用者会話ページを置き換える', tab: '新しいタブ', blank: '完全に新しいウィンドウ' }
			},

			// TwinkleConfig.dialogLargeFont (boolean)
			{
				name: 'dialogLargeFont',
				label: 'Twinkleダイアログで大きな文字を使用する',
				type: 'boolean'
			},

			// Twinkle.config.disabledModules (array)
			{
				name: 'disabledModules',
				label: '選択したTwinkleモジュールをオフにする',
				helptip: 'ここで選択したものは使用できないので、注意してください。再び有効にするにはチェックを外してください。<br />デフォルトでチェックがついているものはまだ準備中です。このページに関連する設定が表示されていますが、対応するモジュールは読み込まれていないはずです。',
				type: 'set',
				setValues: { arv: 'ARV', warn: 'Warn', talkback: 'Talkback', speedy: 'CSD', xfd: 'XfD', image: '画像 (DI)', protect: '保護 (RPP)', tag: 'Tag', diff: '差分', unlink: 'リンク解除', fluff: '差し戻しと巻き戻し' }
			},

			// Twinkle.config.disabledSysopModules (array)
			{
				name: 'disabledSysopModules',
				label: '選択した管理者専用モジュールをオフにする',
				helptip: 'ここで選択したものは使用できないので、注意してください。再び有効にするにはチェックを外してください。',
				adminOnly: true,
				type: 'set',
				setValues: { block: 'Block', deprod: 'DePROD', batchdelete: 'D-batch', batchprotect: 'P-batch', batchundelete: 'Und-batch' }
			}
		]
	},

	{
		title: 'ARV',
		module: 'arv',
		preferences: [
			{
				name: 'spiWatchReport',
				label: 'Add sockpuppet report pages to watchlist',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			}
		]
	},

	{
		title: 'Block user',
		module: 'block',
		adminOnly: true,
		preferences: [
			// TwinkleConfig.defaultToBlock64 (boolean)
			// Whether to default to just blocking the /64 on or off
			{
				name: 'defaultToBlock64',
				label: 'For IPv6 addresses, select the option to block the /64 range by default',
				type: 'boolean'
			},

			// TwinkleConfig.defaultToPartialBlocks (boolean)
			// Whether to default partial blocks on or off
			{
				name: 'defaultToPartialBlocks',
				label: 'Select partial blocks by default when opening the block menu',
				helptip: 'If the user is already blocked, this will be overridden by in favor of defaulting to the current block type',
				type: 'boolean'
			},

			// TwinkleConfig.blankTalkpageOnIndefBlock (boolean)
			// if true, blank the talk page when issuing an indef block notice (per [[WP:UWUL#Indefinitely blocked users]])
			{
				name: 'blankTalkpageOnIndefBlock',
				label: 'Blank the talk page when indefinitely blocking users',
				helptip: 'See <a href="' + mw.util.getUrl('Wikipedia:WikiProject_User_warnings/Usage_and_layout#Indefinitely_blocked_users') + '">WP:UWUL</a> for more information.',
				type: 'boolean'
			}
		]
	},

	{
		title: '画像削除 (DI)',
		module: 'image',
		preferences: [
			// TwinkleConfig.notifyUserOnDeli (boolean)
			// If the user should be notified after placing a file deletion tag
			{
				name: 'notifyUserOnDeli',
				label: '既定で"アップロード者に通知"にチェックを入れる',
				type: 'boolean'
			},

			// TwinkleConfig.deliWatchPage (string)
			// The watchlist setting of the page tagged for deletion.
			{
				name: 'deliWatchPage',
				label: 'タグ付け時にファイルページをウォッチリストに追加',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},

			// TwinkleConfig.deliWatchUser (string)
			// The watchlist setting of the user talk page if a notification is placed.
			{
				name: 'deliWatchUser',
				label: '通知時に、アップロード者の会話ページをウォッチリストに追加する',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			}
		]
	},

	{
		title: 'ページの保護 ' + (Morebits.userIsSysop ? '(PP)' : '(RPP)'),
		module: 'protect',
		preferences: [
			{
				name: 'watchRequestedPages',
				label: '保護依頼時にページをウォッチリストに追加する',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},
			{
				name: 'watchPPTaggedPages',
				label: '保護テンプレートでページをタグ付けする際、ウォッチリストにページを追加する',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},
			{
				name: 'watchProtectedPages',
				label: '保護する際にページをウォッチリストに追加する',
				helptip: 'ページ保護後にタグ付けも行う場合は、そちらが優先されます。',
				adminOnly: true,
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			}
		]
	},

	{
		title: '差し戻しと巻き戻し',  // twinklefluff module
		module: 'fluff',
		preferences: [
			// TwinkleConfig.autoMenuAfterRollback (bool)
			// Option to automatically open the warning menu if the user talk page is opened post-reversion
			{
				name: 'autoMenuAfterRollback',
				label: 'Twinkle差し戻し後、利用者会話ページでTwinkle警告メニューを自動的に開く',
				helptip: '以下の該当するボックスにチェックが入っている場合のみ動作します。',
				type: 'boolean'
			},

			// TwinkleConfig.openTalkPage (array)
			// What types of actions that should result in opening of talk page
			{
				name: 'openTalkPage',
				label: '以下の種類の差し戻し後に、会話ページを開く。',
				type: 'set',
				setValues: { norm: '通常の差し戻し', vand: '荒らしの差し戻し' }
			},

			// TwinkleConfig.openTalkPageOnAutoRevert (bool)
			// Defines if talk page should be opened when calling revert from contribs or recent changes pages. If set to true, openTalkPage defines then if talk page will be opened.
			{
				name: 'openTalkPageOnAutoRevert',
				label: '投稿記録や最近の更新から差し戻しを実行した際に、会話ページを開く',
				helptip: 'これが有効になっている場合、前の設定で必要なオプションが有効になっていなければ機能しません。',
				type: 'boolean'
			},

			// TwinkleConfig.rollbackInPlace (bool)
			//
			{
				name: 'rollbackInPlace',
				label: '投稿記録や最近の更新から差し戻しする際、ページを更新しない。',
				helptip: 'これが有効になっている場合、Twinkleは差し戻し後に投稿記録や最近の更新フィードを再読み込みしないため、一度に複数の編集を差し戻すことができます。',
				type: 'boolean'
			},

			// TwinkleConfig.markRevertedPagesAsMinor (array)
			// What types of actions that should result in marking edit as minor
			{
				name: 'markRevertedPagesAsMinor',
				label: '以下の種類の差し戻しは細部の編集として行います',
				type: 'set',
				setValues: { norm: '通常の差し戻し', vand: '荒らしの差し戻し', torev: '"版の復元"' }
			},

			// TwinkleConfig.watchRevertedPages (array)
			// What types of actions that should result in forced addition to watchlist
			{
				name: 'watchRevertedPages',
				label: '以下の種類の差し戻しの際、ページをウォッチリストに追加する',
				type: 'set',
				setValues: { norm: '通常の差し戻し', vand: '荒らしの差し戻し', torev: '"版の復元"' }
			},
			// TwinkleConfig.watchRevertedExpiry
			// If any of the above items are selected, whether to expire the watch
			{
				name: 'watchRevertedExpiry',
				label: 'ページを差し戻した際、ウォッチする期間は',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},

			// TwinkleConfig.offerReasonOnNormalRevert (boolean)
			// If to offer a prompt for extra summary reason for normal reverts, default to true
			{
				name: 'offerReasonOnNormalRevert',
				label: '通常の差し戻しに理由の入力を求めるプロンプト',
				helptip: '"通常の"差し戻しは [差し戻し] リンクから実行される差し戻しです。',
				type: 'boolean'
			},

			{
				name: 'confirmOnFluff',
				label: '差し戻す前に確認を求める (すべての機器)',
				helptip: 'ペンやタッチデバイスを使う人、慢性的に優柔不断な人向け。',
				type: 'boolean'
			},

			{
				name: 'confirmOnMobileFluff',
				label: '差し戻す前に確認を求める (携帯機器のみ)',
				helptip: '携帯機器での誤動作を防ぐ。',
				type: 'boolean'
			},

			// TwinkleConfig.showRollbackLinks (array)
			// Where Twinkle should show rollback links:
			// diff, others, mine, contribs, history, recent
			// Note from TTO: |contribs| seems to be equal to |others| + |mine|, i.e. redundant, so I left it out heres
			{
				name: 'showRollbackLinks',
				label: 'これらのページで差し戻しリンクを表示',
				type: 'set',
				setValues: { diff: '差分ページ', others: '他の利用者の投稿記録ページ', mine: '自分の投稿記録ページ', recent: '最近の更新や関連ページの更新の特別ページ', history: '履歴ページ' }
			},
			{
				name: 'SummaryOnVandalRevert',
				label: '荒らしの差し戻しの際の要約欄をカスタムする',
				helptip: 'このボックスに要約を入力します。',
				type: 'string',
				obsolete: 'vandusersummary'
			}
		]
	},

	{
		title: '即時削除 (CSD)',
		module: 'speedy',
		preferences: [
			{
				name: 'speedySelectionStyle',
				label: 'ページをタグ付け／削除するタイミング',
				type: 'enum',
				enumValues: { buttonClick: '送信ボタンをクリックしたとき', radioClick: 'オプションをクリックするとすぐ' }
			},

			// TwinkleConfig.watchSpeedyPages (array)
			// Whether to add speedy tagged or deleted pages to watchlist
			{
				name: 'watchSpeedyPages',
				label: 'これらの基準を使用する場合は、ウォッチリストにページを追加する',
				type: 'set',
				setValues: Twinkle.config.commonSets.csdCriteria,
				setDisplayOrder: Twinkle.config.commonSets.csdCriteriaDisplayOrder
			},
			// TwinkleConfig.watchSpeedyExpiry
			// If any of the above items are selected, whether to expire the watch
			{
				name: 'watchSpeedyExpiry',
				label: 'ページをタグ付けする場合、それをウォッチする期間',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},

			// TwinkleConfig.markSpeedyPagesAsPatrolled (boolean)
			// If, when applying speedy template to page, to mark the page as triaged/patrolled (if the page was reached from NewPages)
			{
				name: 'markSpeedyPagesAsPatrolled',
				label: 'タグ付けの際、ページを巡回済みとしてマークする。（可能な場合）',
				helptip: 'これは最善の慣行に反するおそれがあるので、おそらくチェックすべきではないです。',
				type: 'boolean'
			},

			// TwinkleConfig.promptForSpeedyDeletionSummary (array of strings)
			{
				name: 'promptForSpeedyDeletionSummary',
				label: 'これらの基準で削除する場合、削除要約の編集を行う',
				adminOnly: true,
				type: 'set',
				setValues: Twinkle.config.commonSets.csdAndImageDeletionCriteria,
				setDisplayOrder: Twinkle.config.commonSets.csdAndImageDeletionCriteriaDisplayOrder
			},

			// TwinkleConfig.deleteTalkPageOnDelete (boolean)
			// If talk page if exists should also be deleted (CSD G8) when spedying a page (admin only)
			{
				name: 'deleteTalkPageOnDelete',
				label: '既定で"トークページも削除する"にチェックを入れる',
				adminOnly: true,
				type: 'boolean'
			},

			{
				name: 'deleteRedirectsOnDelete',
				label: '規定で"リダイレクトも削除"にチェックを入れる',
				adminOnly: true,
				type: 'boolean'
			},

			// TwinkleConfig.deleteSysopDefaultToDelete (boolean)
			// Make the CSD screen default to "delete" instead of "tag" (admin only)
			{
				name: 'deleteSysopDefaultToDelete',
				label: 'タグ付けではなく即時削除を規定で行う',
				helptip: 'CSDタグが既に存在する場合、Twinkleは常に「削除」モードが既定となります。',
				adminOnly: true,
				type: 'boolean'
			},

			// TwinkleConfig.speedyWindowWidth (integer)
			// Defines the width of the Twinkle SD window in pixels
			{
				name: 'speedyWindowWidth',
				label: '即時削除ウィンドウの幅（ピクセル）',
				type: 'integer'
			},

			// TwinkleConfig.speedyWindowWidth (integer)
			// Defines the width of the Twinkle SD window in pixels
			{
				name: 'speedyWindowHeight',
				label: '即時削除ウィンドウの高さ（ピクセル）',
				helptip: '大きなモニターをお持ちの場合は、これを増やしてください。',
				type: 'integer'
			},

			{
				name: 'logSpeedyNominations',
				label: 'すべてのCSDへの指定記録を利用者ページに保持します',
				helptip: '管理者以外は削除された投稿にアクセスできないため、利用者ページのログは、Twinkleを使用してCSDに指定したすべてのページを追跡するための優れた方法を提供します。 DIを使用してタグ付けされたファイルもこのログに追加されます。',
				type: 'boolean'
			},
			{
				name: 'speedyLogPageName',
				label: 'この利用者サブページでCSDユーザースペースログを保持します',
				helptip: 'このボックスにサブページ名を入力します。 CSDログは利用者:' + mw.config.get('wgUserName') + '/"サブページ名"にあります。 CSD利用者ページへの記録をオンにした場合にのみ機能します。',
				type: 'string'
			},
			{
				name: 'noLogOnSpeedyNomination',
				label: 'これらの基準でタグ付けする場合は、利用者サブページの記録項目を作成しない',
				type: 'set',
				setValues: Twinkle.config.commonSets.csdAndImageDeletionCriteria,
				setDisplayOrder: Twinkle.config.commonSets.csdAndImageDeletionCriteriaDisplayOrder
			}
		]
	},

	{
		title: 'Tag',
		module: 'tag',
		preferences: [
			{
				name: 'watchTaggedVenues',
				label: 'Add page to watchlist when tagging these type of pages',
				type: 'set',
				setValues: { articles: 'Articles', drafts: 'Drafts', redirects: 'Redirects', files: 'Files' }
			},
			{
				name: 'watchTaggedPages',
				label: 'When tagging a page, how long to watch it for',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},
			{
				name: 'watchMergeDiscussions',
				label: 'Add talk pages to watchlist when starting merge discussions',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},
			{
				name: 'markTaggedPagesAsMinor',
				label: 'Mark addition of tags as a minor edit',
				type: 'boolean'
			},
			{
				name: 'markTaggedPagesAsPatrolled',
				label: 'Check the "mark page as patrolled/reviewed" box by default',
				type: 'boolean'
			},
			{
				name: 'groupByDefault',
				label: 'Check the "group into {{multiple issues}}" box by default',
				type: 'boolean'
			},
			{
				name: 'tagArticleSortOrder',
				label: 'Default view order for article tags',
				type: 'enum',
				enumValues: { cat: 'By categories', alpha: 'In alphabetical order' }
			},
			{
				name: 'customTagList',
				label: 'Custom article/draft maintenance tags to display',
				helptip: "These appear as additional options at the bottom of the list of tags. For example, you could add new maintenance tags which have not yet been added to Twinkle's defaults.",
				type: 'customList',
				customListValueTitle: 'Template name (no curly brackets)',
				customListLabelTitle: 'Text to show in Tag dialog'
			},
			{
				name: 'customFileTagList',
				label: 'Custom file maintenance tags to display',
				helptip: 'Additional tags that you wish to add for files.',
				type: 'customList',
				customListValueTitle: 'Template name (no curly brackets)',
				customListLabelTitle: 'Text to show in Tag dialog'
			},
			{
				name: 'customRedirectTagList',
				label: 'Custom redirect category tags to display',
				helptip: 'Additional tags that you wish to add for redirects.',
				type: 'customList',
				customListValueTitle: 'Template name (no curly brackets)',
				customListLabelTitle: 'Text to show in Tag dialog'
			}
		]
	},

	{
		title: 'Talkback',
		module: 'talkback',
		preferences: [
			{
				name: 'markTalkbackAsMinor',
				label: 'Mark talkbacks as minor edits',
				type: 'boolean'
			},
			{
				name: 'insertTalkbackSignature',
				label: 'Insert signature within talkbacks',
				type: 'boolean'
			},
			{
				name: 'talkbackHeading',
				label: 'Section heading to use for talkback and please see',
				tooltip: 'Should NOT include the equals signs ("==") used for wikitext formatting',
				type: 'string'
			},
			{
				name: 'mailHeading',
				label: "Section heading to use for \"you've got mail\" notices",
				tooltip: 'Should NOT include the equals signs ("==") used for wikitext formatting',
				type: 'string'
			}
		]
	},

	{
		title: 'Unlink',
		module: 'unlink',
		preferences: [
			// TwinkleConfig.unlinkNamespaces (array)
			// In what namespaces unlink should happen, default in 0 (article), 10 (template), 100 (portal), and 118 (draft)
			{
				name: 'unlinkNamespaces',
				label: 'Remove links from pages in these namespaces',
				helptip: 'Avoid selecting any talk namespaces, as Twinkle might end up unlinking on talk archives (a big no-no).',
				type: 'set',
				setValues: Twinkle.config.commonSets.namespacesNoSpecial
			}
		]
	},

	{
		title: 'Warn user',
		module: 'warn',
		preferences: [
			// TwinkleConfig.defaultWarningGroup (int)
			// Which level warning should be the default selected group, default is 1
			{
				name: 'defaultWarningGroup',
				label: 'Default warning level',
				type: 'enum',
				enumValues: {
					1: 'Level 1',
					2: 'Level 2',
					3: 'Level 3',
					4: 'Level 4',
					5: 'Level 4im',
					6: 'Single-issue notices',
					7: 'Single-issue warnings',
					// 8 was used for block templates before #260
					9: 'Custom warnings',
					10: 'All warning templates',
					11: 'Auto-select level (1-4)'
				}
			},

			// TwinkleConfig.combinedSingletMenus (boolean)
			// if true, show one menu with both single-issue notices and warnings instead of two separately
			{
				name: 'combinedSingletMenus',
				label: 'Replace the two separate single-issue menus into one combined menu',
				helptip: 'Selecting either single-issue notices or single-issue warnings as your default will make this your default if enabled.',
				type: 'boolean'
			},

			// TwinkleConfig.showSharedIPNotice may take arguments:
			// true: to show shared ip notice if an IP address
			// false: to not print the notice
			{
				name: 'showSharedIPNotice',
				label: 'Add extra notice on shared IP talk pages',
				helptip: 'Notice used is {{Shared IP advice}}',
				type: 'boolean'
			},

			// TwinkleConfig.watchWarnings (string)
			// Watchlist setting for the page which has been dispatched an warning or notice
			{
				name: 'watchWarnings',
				label: 'Add user talk page to watchlist when notifying',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},

			// TwinkleConfig.oldSelect (boolean)
			// if true, use the native select menu rather the select2-based one
			{
				name: 'oldSelect',
				label: 'Use the non-searchable classic select menu',
				type: 'boolean'
			},

			{
				name: 'customWarningList',
				label: 'Custom warning templates to display',
				helptip: 'You can add individual templates or user subpages. Custom warnings appear in the "Custom warnings" category within the warning dialog box.',
				type: 'customList',
				customListValueTitle: 'Template name (no curly brackets)',
				customListLabelTitle: 'Text to show in warning list (also used as edit summary)'
			}
		]
	},

	{
		title: 'XFD (deletion discussions)',
		module: 'xfd',
		preferences: [
			{
				name: 'logXfdNominations',
				label: 'Keep a log in userspace of all pages you nominate for a deletion discussion (XfD)',
				helptip: 'The userspace log offers a good way to keep track of all pages you nominate for XfD using Twinkle.',
				type: 'boolean'
			},
			{
				name: 'xfdLogPageName',
				label: 'Keep the deletion discussion userspace log at this user subpage',
				helptip: 'Enter a subpage name in this box. You will find your XfD log at User:<i>username</i>/<i>subpage name</i>. Only works if you turn on the XfD userspace log.',
				type: 'string'
			},
			{
				name: 'noLogOnXfdNomination',
				label: 'Do not create a userspace log entry when nominating at this venue',
				type: 'set',
				setValues: { afd: 'AfD', tfd: 'TfD', ffd: 'FfD', cfd: 'CfD', cfds: 'CfD/S', mfd: 'MfD', rfd: 'RfD', rm: 'RM' }
			},

			// TwinkleConfig.xfdWatchPage (string)
			// The watchlist setting of the page being nominated for XfD.
			{
				name: 'xfdWatchPage',
				label: 'Add the nominated page to watchlist',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},

			// TwinkleConfig.xfdWatchDiscussion (string)
			// The watchlist setting of the newly created XfD page (for those processes that create discussion pages for each nomination),
			// or the list page for the other processes.
			{
				name: 'xfdWatchDiscussion',
				label: 'Add the deletion discussion page to watchlist',
				helptip: 'This refers to the discussion subpage (for AfD and MfD) or the daily log page (for TfD, CfD, RfD and FfD)',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},

			// TwinkleConfig.xfdWatchList (string)
			// The watchlist setting of the XfD list page, *if* the discussion is on a separate page.
			{
				name: 'xfdWatchList',
				label: 'Add the daily log/list page to the watchlist (AfD and MfD)',
				helptip: 'This only applies for AfD and MfD, where the discussions are transcluded onto a daily log page (for AfD) or the main MfD page (for MfD).',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},

			// TwinkleConfig.xfdWatchUser (string)
			// The watchlist setting of the user talk page if they receive a notification.
			{
				name: 'xfdWatchUser',
				label: 'Add user talk page of initial contributor to watchlist (when notifying)',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},

			// TwinkleConfig.xfdWatchRelated (string)
			// The watchlist setting of the target of a redirect being nominated for RfD.
			{
				name: 'xfdWatchRelated',
				label: "Add the redirect's target page to watchlist (when notifying)",
				helptip: 'This only applies for RfD, when leaving a notification on the talk page of the target of the redirect',
				type: 'enum',
				enumValues: Twinkle.config.watchlistEnums
			},

			{
				name: 'markXfdPagesAsPatrolled',
				label: 'Mark page as patrolled/reviewed when nominating for AFD (if possible)',
				type: 'boolean'
			}
		]
	},

	{
		title: 'Hidden',
		hidden: true,
		preferences: [
			// twinkle.js: portlet setup
			{
				name: 'portletArea',
				type: 'string'
			},
			{
				name: 'portletId',
				type: 'string'
			},
			{
				name: 'portletName',
				type: 'string'
			},
			{
				name: 'portletType',
				type: 'string'
			},
			{
				name: 'portletNext',
				type: 'string'
			},
			// twinklefluff.js: defines how many revision to query maximum, maximum possible is 50, default is 50
			{
				name: 'revertMaxRevisions',
				type: 'integer'
			},
			// twinklewarn.js: When using the autolevel select option, how many days makes a prior warning stale
			// Huggle is three days ([[Special:Diff/918980316]] and [[Special:Diff/919417999]]) while ClueBotNG is two:
			// https://github.com/DamianZaremba/cluebotng/blob/4958e25d6874cba01c75f11debd2e511fd5a2ce5/bot/action_functions.php#L62
			{
				name: 'autolevelStaleDays',
				type: 'integer'
			},
			// How many pages should be queried by deprod and batchdelete/protect/undelete
			{
				name: 'batchMax',
				type: 'integer',
				adminOnly: true
			},
			// How many pages should be processed at a time by deprod and batchdelete/protect/undelete
			{
				name: 'batchChunks',
				type: 'integer',
				adminOnly: true
			}
		]
	}

]; // end of Twinkle.config.sections


Twinkle.config.init = function twinkleconfigInit() {

	// create the config page at User:Syunsyunminmin/Twinkle/Preferences
	if ((mw.config.get('wgNamespaceNumber') === mw.config.get('wgNamespaceIds').user && mw.config.get('wgTitle') === 'Syunsyunminmin/Twinkle/Preferences') &&
			mw.config.get('wgAction') === 'view') {

		if (!document.getElementById('twinkle-config')) {
			return;  // maybe the page is misconfigured, or something - but any attempt to modify it will be pointless
		}

		// set style (the url() CSS function doesn't seem to work from wikicode - ?!)
		document.getElementById('twinkle-config-titlebar').style.backgroundImage = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAkCAMAAAB%2FqqA%2BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEhQTFRFr73ZobTPusjdsMHZp7nVwtDhzNbnwM3fu8jdq7vUt8nbxtDkw9DhpbfSvMrfssPZqLvVztbno7bRrr7W1d%2Fs1N7qydXk0NjpkW7Q%2BgAAADVJREFUeNoMwgESQCAAAMGLkEIi%2FP%2BnbnbpdB59app5Vdg0sXAoMZCpGoFbK6ciuy6FX4ABAEyoAef0BXOXAAAAAElFTkSuQmCC)';

		var contentdiv = document.getElementById('twinkle-config-content');
		contentdiv.textContent = '';  // clear children

		// let user know about possible conflict with skin js/common.js file
		// (settings in that file will still work, but they will be overwritten by twinkleoptions.js settings)
		if (window.TwinkleConfig || window.FriendlyConfig) {
			var contentnotice = document.createElement('p');
			contentnotice.innerHTML = '<table class="plainlinks morebits-ombox morebits-ombox-content"><tr><td class="morebits-mbox-image">' +
				'<img alt="" src="https://upload.wikimedia.org/wikipedia/commons/3/38/Imbox_content.png" /></td>' +
				'<td class="morebits-mbox-text"><p><big><b>Before modifying your settings here,</b> you must remove your old Twinkle and Friendly settings from your personal skin JavaScript.</big></p>' +
				'<p>To do this, you can <a href="' + mw.util.getUrl('User:' + mw.config.get('wgUserName') + '/' + mw.config.get('skin') +
				'.js', { action: 'edit' }) + '" target="_blank"><b>edit your personal skin javascript file</b></a> or <a href="' +
				mw.util.getUrl('User:' + mw.config.get('wgUserName') + '/common.js', { action: 'edit'}) + '" target="_blank"><b>your common.js file</b></a>, removing all lines of code that refer to <code>TwinkleConfig</code> and <code>FriendlyConfig</code>.</p>' +
				'</td></tr></table>';
			contentdiv.appendChild(contentnotice);
		}

		// start a table of contents
		var toctable = document.createElement('div');
		toctable.className = 'toc';
		toctable.style.marginLeft = '0.4em';
		// create TOC title
		var toctitle = document.createElement('div');
		toctitle.id = 'toctitle';
		var toch2 = document.createElement('h2');
		toch2.textContent = '目次 ';
		toctitle.appendChild(toch2);
		// add TOC show/hide link
		var toctoggle = document.createElement('span');
		toctoggle.className = 'toctoggle';
		toctoggle.appendChild(document.createTextNode('['));
		var toctogglelink = document.createElement('a');
		toctogglelink.className = 'internal';
		toctogglelink.setAttribute('href', '#tw-tocshowhide');
		toctogglelink.textContent = '非表示';
		toctoggle.appendChild(toctogglelink);
		toctoggle.appendChild(document.createTextNode(']'));
		toctitle.appendChild(toctoggle);
		toctable.appendChild(toctitle);
		// create item container: this is what we add stuff to
		var tocul = document.createElement('ul');
		toctogglelink.addEventListener('click', function twinkleconfigTocToggle() {
			var $tocul = $(tocul);
			$tocul.toggle();
			if ($tocul.find(':visible').length) {
				toctogglelink.textContent = '非表示';
			} else {
				toctogglelink.textContent = '表示';
			}
		}, false);
		toctable.appendChild(tocul);
		contentdiv.appendChild(toctable);

		var contentform = document.createElement('form');
		contentform.setAttribute('action', 'javascript:void(0)');  // was #tw-save - changed to void(0) to work around Chrome issue
		contentform.addEventListener('submit', Twinkle.config.save, true);
		contentdiv.appendChild(contentform);

		var container = document.createElement('table');
		container.style.width = '100%';
		contentform.appendChild(container);

		$(Twinkle.config.sections).each(function(sectionkey, section) {
			if (section.hidden || (section.adminOnly && !Morebits.userIsSysop)) {
				return true;  // i.e. "continue" in this context
			}

			// add to TOC
			var tocli = document.createElement('li');
			tocli.className = 'toclevel-1';
			var toca = document.createElement('a');
			toca.setAttribute('href', '#' + section.module);
			toca.appendChild(document.createTextNode(section.title));
			tocli.appendChild(toca);
			tocul.appendChild(tocli);

			var row = document.createElement('tr');
			var cell = document.createElement('td');
			cell.setAttribute('colspan', '3');
			var heading = document.createElement('h4');
			heading.style.borderBottom = '1px solid gray';
			heading.style.marginTop = '0.2em';
			heading.id = section.module;
			heading.appendChild(document.createTextNode(section.title));
			cell.appendChild(heading);
			row.appendChild(cell);
			container.appendChild(row);

			var rowcount = 1;  // for row banding

			// add each of the preferences to the form
			$(section.preferences).each(function(prefkey, pref) {
				if (pref.adminOnly && !Morebits.userIsSysop) {
					return true;  // i.e. "continue" in this context
				}

				row = document.createElement('tr');
				row.style.marginBottom = '0.2em';
				// create odd row banding
				if (rowcount++ % 2 === 0) {
					row.style.backgroundColor = 'rgba(128, 128, 128, 0.1)';
				}
				cell = document.createElement('td');

				var label, input, gotPref = Twinkle.getPref(pref.name), obsoletePref = Twinkle.getPref(pref.obsolete);
				switch (pref.type) {

					case 'boolean':  // create a checkbox
						cell.setAttribute('colspan', '2');

						label = document.createElement('label');
						input = document.createElement('input');
						input.setAttribute('type', 'checkbox');
						input.setAttribute('id', pref.name);
						input.setAttribute('name', pref.name);
						if (gotPref === true || obsoletePref === true) {
							input.setAttribute('checked', 'checked');
						}
						label.appendChild(input);
						label.appendChild(document.createTextNode(pref.label));
						cell.appendChild(label);
						break;

					case 'string':  // create an input box
					case 'integer':
						// add label to first column
						cell.style.textAlign = 'right';
						cell.style.paddingRight = '0.5em';
						label = document.createElement('label');
						label.setAttribute('for', pref.name);
						label.appendChild(document.createTextNode(pref.label + ':'));
						cell.appendChild(label);
						row.appendChild(cell);

						// add input box to second column
						cell = document.createElement('td');
						cell.style.paddingRight = '1em';
						input = document.createElement('input');
						input.setAttribute('type', 'text');
						input.setAttribute('id', pref.name);
						input.setAttribute('name', pref.name);
						if (pref.type === 'integer') {
							input.setAttribute('size', 6);
							input.setAttribute('type', 'number');
							input.setAttribute('step', '1');  // integers only
						}
						if (gotPref) {
							input.setAttribute('value', gotPref);
						}
						if (obsoletePref) {
							input.setAttribute('value', obsoletePref);
						}
						cell.appendChild(input);
						break;

					case 'enum':  // create a combo box
						// add label to first column
						// note: duplicates the code above, under string/integer
						cell.style.textAlign = 'right';
						cell.style.paddingRight = '0.5em';
						label = document.createElement('label');
						label.setAttribute('for', pref.name);
						label.appendChild(document.createTextNode(pref.label + ':'));
						cell.appendChild(label);
						row.appendChild(cell);

						// add input box to second column
						cell = document.createElement('td');
						cell.style.paddingRight = '1em';
						input = document.createElement('select');
						input.setAttribute('id', pref.name);
						input.setAttribute('name', pref.name);
						$.each(pref.enumValues, function(enumvalue, enumdisplay) {
							var option = document.createElement('option');
							option.setAttribute('value', enumvalue);
							if ((gotPref === enumvalue || obsoletePref === enumvalue) ||
								// Hack to convert old boolean watchlist prefs
								// to corresponding enums (added in v2.1)
								((typeof gotPref === 'boolean' || typeof obsoletePref === 'boolean') &&
								(((gotPref || obsoletePref) && enumvalue === 'yes') ||
								(!(gotPref && obsoletePref) && enumvalue === 'no')))) {
								option.setAttribute('selected', 'selected');
							}
							option.appendChild(document.createTextNode(enumdisplay));
							input.appendChild(option);
						});
						cell.appendChild(input);
						break;

					case 'set':  // create a set of check boxes
						// add label first of all
						cell.setAttribute('colspan', '2');
						label = document.createElement('label');  // not really necessary to use a label element here, but we do it for consistency of styling
						label.appendChild(document.createTextNode(pref.label + ':'));
						cell.appendChild(label);

						var checkdiv = document.createElement('div');
						checkdiv.style.paddingLeft = '1em';
						var worker = function(itemkey, itemvalue) {
							var checklabel = document.createElement('label');
							checklabel.style.marginRight = '0.7em';
							checklabel.style.display = 'inline-block';
							var check = document.createElement('input');
							check.setAttribute('type', 'checkbox');
							check.setAttribute('id', pref.name + '_' + itemkey);
							check.setAttribute('name', pref.name + '_' + itemkey);
							if ((gotPref && gotPref.indexOf(itemkey) !== -1) || (obsoletePref && obsoletePref.indexOf(itemkey) !== -1)) {
								check.setAttribute('checked', 'checked');
							}
							// cater for legacy integer array values for unlinkNamespaces (this can be removed a few years down the track...)
							if (pref.name === 'unlinkNamespaces') {
								if ((gotPref && gotPref.indexOf(parseInt(itemkey, 10)) !== -1) || (obsoletePref && obsoletePref.indexOf(parseInt(itemkey, 10)) !== -1)) {
									check.setAttribute('checked', 'checked');
								}
							}
							checklabel.appendChild(check);
							checklabel.appendChild(document.createTextNode(itemvalue));
							checkdiv.appendChild(checklabel);
						};
						if (pref.setDisplayOrder) {
							// add check boxes according to the given display order
							$.each(pref.setDisplayOrder, function(itemkey, item) {
								worker(item, pref.setValues[item]);
							});
						} else {
							// add check boxes according to the order it gets fed to us (probably strict alphabetical)
							$.each(pref.setValues, worker);
						}
						cell.appendChild(checkdiv);
						break;

					case 'customList':
						// add label to first column
						cell.style.textAlign = 'right';
						cell.style.paddingRight = '0.5em';
						label = document.createElement('label');
						label.setAttribute('for', pref.name);
						label.appendChild(document.createTextNode(pref.label + ':'));
						cell.appendChild(label);
						row.appendChild(cell);

						// add button to second column
						cell = document.createElement('td');
						cell.style.paddingRight = '1em';
						var button = document.createElement('button');
						button.setAttribute('id', pref.name);
						button.setAttribute('name', pref.name);
						button.setAttribute('type', 'button');
						button.addEventListener('click', Twinkle.config.listDialog.display, false);
						// use jQuery data on the button to store the current config value
						$(button).data({
							value: (obsoletePref) ? obsoletePref : gotPref,
							pref: pref
						});
						button.appendChild(document.createTextNode('アイテムを編集'));
						cell.appendChild(button);
						break;

					default:
						alert('twinkleconfig: 設定 ' + pref.name + ' の不明なデータ型');
						break;
				}
				row.appendChild(cell);

				// add help tip
				cell = document.createElement('td');
				cell.style.fontSize = '90%';

				cell.style.color = 'gray';
				if (pref.helptip) {
					// convert mentions of templates in the helptip to clickable links
					cell.innerHTML = pref.helptip.replace(/{{(.+?)}}/g,
						'{{<a href="' + mw.util.getUrl('Template:') + '$1" target="_blank">$1</a>}}');
				}
				// add reset link (custom lists don't need this, as their config value isn't displayed on the form)
				if (pref.type !== 'customList') {
					var resetlink = document.createElement('a');
					resetlink.setAttribute('href', '#tw-reset');
					resetlink.setAttribute('id', 'twinkle-config-reset-' + pref.name);
					resetlink.addEventListener('click', Twinkle.config.resetPrefLink, false);
					resetlink.style.cssFloat = 'right';
					resetlink.style.margin = '0 0.6em';
					resetlink.appendChild(document.createTextNode('初期化'));
					cell.appendChild(resetlink);
				}
				row.appendChild(cell);

				container.appendChild(row);
				return true;
			});
			return true;
		});

		var footerbox = document.createElement('div');
		footerbox.setAttribute('id', 'twinkle-config-buttonpane');
		footerbox.style.backgroundColor = '#BCCADF';
		footerbox.style.padding = '0.5em';
		var button = document.createElement('button');
		button.setAttribute('id', 'twinkle-config-submit');
		button.setAttribute('type', 'submit');
		button.appendChild(document.createTextNode('変更を保存'));
		footerbox.appendChild(button);
		var footerspan = document.createElement('span');
		footerspan.className = 'plainlinks';
		footerspan.style.marginLeft = '2.4em';
		footerspan.style.fontSize = '90%';
		var footera = document.createElement('a');
		footera.setAttribute('href', '#tw-reset-all');
		footera.setAttribute('id', 'twinkle-config-resetall');
		footera.addEventListener('click', Twinkle.config.resetAllPrefs, false);
		footera.appendChild(document.createTextNode('デフォルトに戻す'));
		footerspan.appendChild(footera);
		footerbox.appendChild(footerspan);
		contentform.appendChild(footerbox);

		// since all the section headers exist now, we can try going to the requested anchor
		if (window.location.hash) {
			var loc = window.location.hash;
			window.location.hash = '';
			window.location.hash = loc;
		}

	} else if (mw.config.get('wgNamespaceNumber') === mw.config.get('wgNamespaceIds').user &&
			mw.config.get('wgTitle').indexOf(mw.config.get('wgUserName')) === 0 &&
			mw.config.get('wgPageName').slice(-3) === '.js') {

		var box = document.createElement('div');
		// Styled in twinkle.css
		box.setAttribute('id', 'twinkle-config-headerbox');

		var link,
			scriptPageName = mw.config.get('wgPageName').slice(mw.config.get('wgPageName').lastIndexOf('/') + 1,
				mw.config.get('wgPageName').lastIndexOf('.js'));

		if (scriptPageName === 'twinkleoptions') {
			// place "why not try the preference panel" notice
			box.setAttribute('class', 'config-twopt-box');

			link = document.createElement('a');
			link.setAttribute('href', mw.util.getUrl(mw.config.get('wgFormattedNamespaces')[mw.config.get('wgNamespaceIds').user] + ':Syunsyunminmin/Twinkle/Preferences'));
			link.appendChild(document.createTextNode('Twinkle個人設定パネル'));

			if (mw.config.get('wgArticleId') > 0) {  // page exists
				box.appendChild(document.createTextNode('このページにはTwinkleの設定が含まれています。設定は '));
				box.appendChild(link);
				box.appendChild(document.createTextNode('を使用するか、このページを編集することで変更できます。'));
			} else {  // page does not exist
				box.appendChild(link);
				box.appendChild(document.createTextNode('またはこのページを編集することで、Twinkleを個人の好みに合わせてカスタマイズできます。'));
			}

			$(box).insertAfter($('#contentSub'));

		} else if (['monobook', 'vector', 'vector-2022', 'cologneblue', 'modern', 'timeless', 'minerva', 'common'].indexOf(scriptPageName) !== -1) {
			// place "Looking for Twinkle options?" notice
			box.setAttribute('class', 'config-userskin-box');

			box.appendChild(document.createTextNode('Twinkle個人設定を設定したい場合、'));
			link = document.createElement('a');
			link.setAttribute('href', mw.util.getUrl(mw.config.get('wgFormattedNamespaces')[mw.config.get('wgNamespaceIds').user] + ':Syunsyunminmin/Twinkle/Preferences'));
			link.appendChild(document.createTextNode('Twinkle個人設定パネル'));
			box.appendChild(link);
			box.appendChild(document.createTextNode('を使用して行えます。'));
			$(box).insertAfter($('#contentSub'));
		}
	}
};

// custom list-related stuff

Twinkle.config.listDialog = {};

Twinkle.config.listDialog.addRow = function twinkleconfigListDialogAddRow($dlgtable, value, label) {
	var $contenttr, $valueInput, $labelInput;

	$dlgtable.append(
		$contenttr = $('<tr>').append(
			$('<td>').append(
				$('<button>')
					.attr('type', 'button')
					.css('white-space', 'nowrap')
					.on('click', function () {
						$contenttr.remove();
					})
					.text('除去')
			),
			$('<td>').append(
				$valueInput = $('<input>')
					.attr('type', 'text')
					.addClass('twinkle-config-customlist-value')
					.css('width', '97%')
			),
			$('<td>').append(
				$labelInput = $('<input>')
					.attr('type', 'text')
					.addClass('twinkle-config-customlist-label')
					.css('width', '98%')
			)
		)
	);

	if (value) {
		$valueInput.val(value);
	}
	if (label) {
		$labelInput.val(label);
	}

};

Twinkle.config.listDialog.display = function twinkleconfigListDialogDisplay(e) {
	var $prefbutton = $(e.target);
	var curvalue = $prefbutton.data('value');
	var curpref = $prefbutton.data('pref');

	var dialog = new Morebits.simpleWindow(720, 400);
	dialog.setTitle(curpref.label);
	dialog.setScriptName('Twinkle個人設定');

	var $dlgtbody;

	dialog.setContent(
		$('<div>').append(
			$('<table>')
				.addClass('wikitable')
				.css({
					margin: '1.4em 1em',
					width: 'auto'
				})
				.append(
					$dlgtbody = $('<tbody>').append(
						// header row
						$('<tr>').append(
							$('<th>') // top-left cell
								.css('width', '5%'),
							$('<th>') // value column header
								.css('width', '35%')
								.text(curpref.customListValueTitle ? curpref.customListValueTitle : 'Value'),
							$('<th>') // label column header
								.css('width', '60%')
								.text(curpref.customListLabelTitle ? curpref.customListLabelTitle : 'Label')
						)
					),
					$('<tfoot>').append(
						$('<tr>').append(
							$('<td>')
								.attr('colspan', '3')
								.append(
									$('<button>')
										.text('追加')
										.css('min-width', '8em')
										.attr('type', 'button')
										.on('click', function () {
											Twinkle.config.listDialog.addRow($dlgtbody);
										})
								)
						)
					)
				),
			$('<button>')
				.text('変更を保存')
				.attr('type', 'submit') // so Morebits.simpleWindow puts the button in the button pane
				.on('click', function () {
					Twinkle.config.listDialog.save($prefbutton, $dlgtbody);
					dialog.close();
				}),
			$('<button>')
				.text('初期化')
				.attr('type', 'submit')
				.on('click', function () {
					Twinkle.config.listDialog.reset($prefbutton, $dlgtbody);
				}),
			$('<button>')
				.text('キャンセル')
				.attr('type', 'submit')
				.on('click', function () {
					dialog.close();
				})
		)[0]
	);

	// content rows
	var gotRow = false;
	$.each(curvalue, function(k, v) {
		gotRow = true;
		Twinkle.config.listDialog.addRow($dlgtbody, v.value, v.label);
	});
	// if there are no values present, add a blank row to start the user off
	if (!gotRow) {
		Twinkle.config.listDialog.addRow($dlgtbody);
	}

	dialog.display();
};

// Resets the data value, re-populates based on the new (default) value, then saves the
// old data value again (less surprising behaviour)
Twinkle.config.listDialog.reset = function twinkleconfigListDialogReset($button, $tbody) {
	// reset value on button
	var curpref = $button.data('pref');
	var oldvalue = $button.data('value');
	Twinkle.config.resetPref(curpref);

	// reset form
	$tbody.find('tr').slice(1).remove();  // all rows except the first (header) row
	// add the new values
	var curvalue = $button.data('value');
	$.each(curvalue, function(k, v) {
		Twinkle.config.listDialog.addRow($tbody, v.value, v.label);
	});

	// save the old value
	$button.data('value', oldvalue);
};

Twinkle.config.listDialog.save = function twinkleconfigListDialogSave($button, $tbody) {
	var result = [];
	var current = {};
	$tbody.find('input[type="text"]').each(function(inputkey, input) {
		if ($(input).hasClass('twinkle-config-customlist-value')) {
			current = { value: input.value };
		} else {
			current.label = input.value;
			// exclude totally empty rows
			if (current.value || current.label) {
				result.push(current);
			}
		}
	});
	$button.data('value', result);
};

// reset/restore defaults

Twinkle.config.resetPrefLink = function twinkleconfigResetPrefLink(e) {
	var wantedpref = e.target.id.substring(21); // "twinkle-config-reset-" prefix is stripped

	// search tactics
	$(Twinkle.config.sections).each(function(sectionkey, section) {
		if (section.hidden || (section.adminOnly && !Morebits.userIsSysop)) {
			return true;  // continue: skip impossibilities
		}

		var foundit = false;

		$(section.preferences).each(function(prefkey, pref) {
			if (pref.name !== wantedpref) {
				return true;  // continue
			}
			Twinkle.config.resetPref(pref);
			foundit = true;
			return false;  // break
		});

		if (foundit) {
			return false;  // break
		}
	});
	return false;  // stop link from scrolling page
};

Twinkle.config.resetPref = function twinkleconfigResetPref(pref) {
	switch (pref.type) {

		case 'boolean':
			document.getElementById(pref.name).checked = Twinkle.defaultConfig[pref.name];
			break;

		case 'string':
		case 'integer':
		case 'enum':
			document.getElementById(pref.name).value = Twinkle.defaultConfig[pref.name];
			break;

		case 'set':
			$.each(pref.setValues, function(itemkey) {
				if (document.getElementById(pref.name + '_' + itemkey)) {
					document.getElementById(pref.name + '_' + itemkey).checked = Twinkle.defaultConfig[pref.name].indexOf(itemkey) !== -1;
				}
			});
			break;

		case 'customList':
			$(document.getElementById(pref.name)).data('value', Twinkle.defaultConfig[pref.name]);
			break;

		default:
			alert('twinkleconfig: 設定 ' + pref.name + ' の不明なデータ型');
			break;
	}
};

Twinkle.config.resetAllPrefs = function twinkleconfigResetAllPrefs() {
	// no confirmation message - the user can just refresh/close the page to abort
	$(Twinkle.config.sections).each(function(sectionkey, section) {
		if (section.hidden || (section.adminOnly && !Morebits.userIsSysop)) {
			return true;  // continue: skip impossibilities
		}
		$(section.preferences).each(function(prefkey, pref) {
			if (!pref.adminOnly || Morebits.userIsSysop) {
				Twinkle.config.resetPref(pref);
			}
		});
		return true;
	});
	return false;  // stop link from scrolling page
};

Twinkle.config.save = function twinkleconfigSave(e) {
	Morebits.status.init(document.getElementById('twinkle-config-content'));

	var userjs = mw.config.get('wgFormattedNamespaces')[mw.config.get('wgNamespaceIds').user] + ':' + mw.config.get('wgUserName') + '/twinkleoptions.js';
	var wikipedia_page = new Morebits.wiki.page(userjs, userjs + 'に設定を保存');
	wikipedia_page.setCallbackParameters(e.target);
	wikipedia_page.load(Twinkle.config.writePrefs);

	return false;
};

Twinkle.config.writePrefs = function twinkleconfigWritePrefs(pageobj) {
	var form = pageobj.getCallbackParameters();

	// this is the object which gets serialized into JSON; only
	// preferences that this script knows about are kept
	var newConfig = {optionsVersion: 2.1};

	// a comparison function is needed later on
	// it is just enough for our purposes (i.e. comparing strings, numbers, booleans,
	// arrays of strings, and arrays of { value, label })
	// and it is not very robust: e.g. compare([2], ["2"]) === true, and
	// compare({}, {}) === false, but it's good enough for our purposes here
	var compare = function(a, b) {
		if (Array.isArray(a)) {
			if (a.length !== b.length) {
				return false;
			}
			var asort = a.sort(), bsort = b.sort();
			for (var i = 0; asort[i]; ++i) {
				// comparison of the two properties of custom lists
				if ((typeof asort[i] === 'object') && (asort[i].label !== bsort[i].label ||
					asort[i].value !== bsort[i].value)) {
					return false;
				} else if (asort[i].toString() !== bsort[i].toString()) {
					return false;
				}
			}
			return true;
		}
		return a === b;

	};

	$(Twinkle.config.sections).each(function(sectionkey, section) {
		if (section.adminOnly && !Morebits.userIsSysop) {
			return;  // i.e. "continue" in this context
		}

		// reach each of the preferences from the form
		$(section.preferences).each(function(prefkey, pref) {
			var userValue;  // = undefined

			// only read form values for those prefs that have them
			if (!pref.adminOnly || Morebits.userIsSysop) {
				if (!section.hidden) {
					switch (pref.type) {
						case 'boolean':  // read from the checkbox
							userValue = form[pref.name].checked;
							break;

						case 'string':  // read from the input box or combo box
						case 'enum':
							userValue = form[pref.name].value;
							break;

						case 'integer':  // read from the input box
							userValue = parseInt(form[pref.name].value, 10);
							if (isNaN(userValue)) {
								Morebits.status.warn('保存', pref.name + 'に対して指定した値 (' + pref.value + ') は無効です。保存は続行しますが、無効なデータ値は飛ばされます。');
								userValue = null;
							}
							break;

						case 'set':  // read from the set of check boxes
							userValue = [];
							if (pref.setDisplayOrder) {
							// read only those keys specified in the display order
								$.each(pref.setDisplayOrder, function(itemkey, item) {
									if (form[pref.name + '_' + item].checked) {
										userValue.push(item);
									}
								});
							} else {
							// read all the keys in the list of values
								$.each(pref.setValues, function(itemkey) {
									if (form[pref.name + '_' + itemkey].checked) {
										userValue.push(itemkey);
									}
								});
							}
							break;

						case 'customList':  // read from the jQuery data stored on the button object
							userValue = $(form[pref.name]).data('value');
							break;

						default:
							alert('twinkleconfig: 設定 ' + pref.name + ' の不明なデータ型');
							break;
					}
				} else if (Twinkle.prefs) {
					// Retain the hidden preferences that may have customised by the user from twinkleoptions.js
					// undefined if not set
					userValue = Twinkle.prefs[pref.name];
				}
			}

			// only save those preferences that are *different* from the default
			if (userValue !== undefined && !compare(userValue, Twinkle.defaultConfig[pref.name])) {
				newConfig[pref.name] = userValue;
			}
		});
	});

	var text =
		'// twinkleoptions.js: Twinkleの個人設定ファイル\n' +
		'//\n' +
		'// 注意: Twinkleの設定を変更する最も簡単な方法は、\n' +
		'// Twinkle設定パネルを使用することです。設定パネルは[[' + Morebits.pageNameNorm + ']]にあります。\n' +
		'//\n' +
		'// このファイルは自動的に生成されます。\n' +
		'// （有効なJavaScriptの方法で構成パラメーターを変更する以外に）行った変更は、\n' +
		'// 次にTwinkle設定パネルで「保存」をクリックしたときに上書きされます。\n' +
		'// このファイルを直接変更する場合は、必ず正しいJavaScriptを使用してください。\n' +
		'// <no' + 'wiki>\n' +
		'\n' +
		'window.Twinkle.prefs = ';
	text += JSON.stringify(newConfig, null, 2);
	text +=
		';\n' +
		'\n' +
		'// </no' + 'wiki>\n' +
		'// End of twinkleoptions.js\n';

	pageobj.setPageText(text);
	pageobj.setEditSummary('Twinkle個人設定を保存: [[:' + Morebits.pageNameNorm + ']]からの自動編集');
	pageobj.setCreateOption('recreate');
	pageobj.save(Twinkle.config.saveSuccess);
};

Twinkle.config.saveSuccess = function twinkleconfigSaveSuccess(pageobj) {
	pageobj.getStatusElement().info('成功');

	var noticebox = document.createElement('div');
	noticebox.className = 'mw-message-box mw-message-box-success';
	noticebox.style.fontSize = '100%';
	noticebox.style.marginTop = '2em';
	noticebox.innerHTML = '<p><b>Twinkle個人設定は保存されました。</b></p><p>変更を確認するには、<b>ブラウザのキャッシュを完全にクリアする</b>必要があります。 (手順については <a href="' + mw.util.getUrl('WP:BYPASS') + '" title="WP:BYPASS">WP:BYPASS</a> 参照</p>';
	Morebits.status.root.appendChild(noticebox);
	var noticeclear = document.createElement('br');
	noticeclear.style.clear = 'both';
	Morebits.status.root.appendChild(noticeclear);
};

Twinkle.addInitCallback(Twinkle.config.init);
})(jQuery);


// </nowiki>
