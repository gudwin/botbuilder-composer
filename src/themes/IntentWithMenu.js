"use strict";
const botbuilder = require('botbuilder');

const DEFAULT_INTENTDIALOG_CONFIG = {
  recognizers: [],
  intentThreshold: 0.3,
  recognizeOrder: botbuilder.RecognizeOrder.series,
  stopIfExactMatch: true,
  recognizeMode: botbuilder.RecognizeMode.onBeginIfRoot
}

const consts = {
  indexDialogId: '/',
  firstRunDialogId: '/theme/firstRun',
  greetingDialogId: '/theme/greeting',
  defaultDialogId: '/theme/onDefault',
  intentsDialogId: '/theme/intents',
  firstRunMessage: 'Nice to meet you!'
}


class IntentWithMenu {
  constructor(config) {
    // to be saved from type errors
    if (!config) config = {};
    this.bot = null;
    this.recognizers = [];
    this.intents = config.intents || [];
    this.menu = [];
    this.firstRunDialogId = config.firstRunDialogId || '';
    this.defaultDialogId = config.defautDialogId || consts.defaultDialogId;
    this.greetingDialogId = config.greetingDialogId || '';
    this.intentsConfig = Object.assign({}, DEFAULT_INTENTDIALOG_CONFIG, config.intents);

    this.blockUpdate = false;
  }

  init(bot) {
    this.bot = bot;
  }

  build() {
    this.blockUpdate = true;
    this.buildFirstRunDialog();
    this.buildGreetingDialog();
    this.buildIntents();
  }

  addMenuItem(config) {
    this.checkUpdatesAllowed();
    this.menu.push(config);
  }

  getMenu() {
    return this.menu;
  }

  sendMessageWithMenuActions(session, message) {
    if (!( message instanceof botbuilder.Message )) {
      message = (new botbuilder.Message(session)).text(message);
    }
    let actions = [];
    this.menu.forEach((menuItem) => {
      actions.push(botbuilder.CardAction.imBack(session, menuItem['message'],menuItem['label']));
    })
    message.suggestedActions(botbuilder.SuggestedActions.create(session,actions));

    session.send(message);
  }

  addIntent(intentName, dialogName) {
    this.checkUpdatesAllowed();
    this.intents.push([intentName, dialogName])
  }

  addRecognizer(recognizer) {
    this.checkUpdatesAllowed();
    this.recognizers.push(recognizer);
  }

  setFirstRunDialogId(dialogId) {
    this.checkUpdatesAllowed();
    this.firstRunDialogId = dialogId;
  }


  setDefaultDialogId(dialogId) {
    this.checkUpdatesAllowed();
    this.defaultDialogId = dialogId;
  }

  setGreetingDialogId(dialogId) {
    this.checkUpdatesAllowed();
    this.greetingDialogId = dialogId;
  }

  // --------------------------------------------------------------------------
  // Private & Protected methods
  //

  checkUpdatesAllowed() {
    if (this.blockUpdate) {
      throw new Error('Updates permitted. Build already happened');
    }
  }

  buildFirstRunDialog() {
    this.bot.dialog(consts.firstRunDialogId, (session) => {
        session.userData.firstRun = true;
        session.save();
        if (this.firstRunDialogId) {
          session.beginDialog(this.firstRunDialogId)
        } else {
          this.sendMessageWithMenuActions(session, consts.firstRunMessage);
          session.beginDialog(consts.intentsDialogId)
        }
      },
      (session) => {
        session.endConversation();
      }).triggerAction({
      onFindAction: function (context, callback) {
        // Only trigger if we've never seen user before
        if (!context.userData.firstRun) {
          // Return a score of 1.1 to ensure the first run dialog wins
          callback(null, 1.1);
        } else {
          callback(null, 0.0);
        }
      }
    });
  }

  buildIntents() {
    let intents;
    let intentsConfig = Object.assign({}, this.intentsConfig);
    intentsConfig.recognizers = this.recognizers.slice(0);
    intents = new botbuilder.IntentDialog(intentsConfig);

    this.buildIntentsDefaultDialog(intents);
    this.intents.forEach(row=> intents.matches(row[0], row[1]))
    this.bot.dialog(consts.intentsDialogId, intents);
  }


  buildIntentsDefaultDialog(intents) {

    intents.onDefault(this.defaultDialogId);
    this.bot.dialog(consts.defaultDialogId, (session) => {
      this.sendMessageWithMenuActions(session, `Sorry command "${session.message.text}" not supported yet`);
      session.endDialog();
    });

  }

  buildGreetingDialog() {
    this.bot.dialog(consts.indexDialogId, [
      (session, args, next) => {
        if (this.greetingDialogId) {
          session.beginDialog(this.greetingDialogId)
        } else {
          next();
        }
      },
      (session, args, next) => {
        session.beginDialog(consts.intentsDialogId)
      }
    ]);
  }
}

module.exports = IntentWithMenu;
module.exports.consts = consts;