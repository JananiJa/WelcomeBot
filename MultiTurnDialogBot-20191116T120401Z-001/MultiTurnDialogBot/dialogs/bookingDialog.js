// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

//const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog, ComponentDialog, ChoicePrompt, ChoiceFactory, DialogSet,
    DialogTurnStatus,
    NumberPrompt } = require('botbuilder-dialogs');
// const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
// const { DateResolverDialog } = require('./dateResolverDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

const CHOICE_PROMPT = 'CHOICE_PROMPT';
//const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const AGE_PROMPT = 'AGE_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
//const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const PREGNANCY_PROMPT = 'PREGNANCY_PROMPT';

var selfOrNot;
var age;
var pregnancy;
var medCond;
var environment;
var allergy;
var medical;
var illness;

class BookingDialog extends ComponentDialog{
    constructor(id) {
        super(id || 'bookingDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            //.addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.destinationStep.bind(this),
                this.ageStep.bind(this)
                // this.originStep.bind(this),
                // this.travelDateStep.bind(this),
                // this.confirmStep.bind(this),
                // this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * If a destination city has not been provided, prompt for one.
     */
    async destinationStep(step) {
        const bookingDetails = step.options;
          console.log('success');
       
            // const messageText = 'To what city would you like to travel?';
            // const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            // return await step.prompt(TEXT_PROMPT, { prompt: msg });

            return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Are you checking the eligibility for yourself or someone else?',
            choices: ChoiceFactory.toChoices(['Myself', 'Someone Else'])
        });
        
        return await step.next(bookingDetails.destination);
    }

    async ageStep(step) {
        step.values.self = step.result.value;
        selfOrNot = step.values.self;
        if (step.result) {
            if(step.values.self == 'Myself') {
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Please select your age group',
                    choices: ChoiceFactory.toChoices(['11-17 years', '18-64 years', 'Above 65 years'])
                });       
            }
            if(step.values.self == 'Someone Else') {
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Please select their age group',
                    choices: ChoiceFactory.toChoices(['< 6 months', '6 months to 2 years', '2-10 years', '11-17 years', '18-64 years', 'Above 65 years'])
                });        
            }
        } else {
            return await step.selfStep();
        }
    }

    /**
     * If an origin city has not been provided, prompt for one.
     */

    /*
    async originStep(stepContext) {
        const bookingDetails = stepContext.options;

        // Capture the response to the previous step's prompt
        bookingDetails.destination = stepContext.result;
        if (!bookingDetails.origin) {
            const messageText = 'From what city will you be travelling?';
            const msg = MessageFactory.text(messageText, 'From what city will you be travelling?', InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.origin);
    }*/

    /**
     * If a travel date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */
    
    /* async travelDateStep(stepContext) {
        const bookingDetails = stepContext.options;

        // Capture the results of the previous step
        bookingDetails.origin = stepContext.result;
        if (!bookingDetails.travelDate || this.isAmbiguous(bookingDetails.travelDate)) {
            return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, { date: bookingDetails.travelDate });
        }
        return await stepContext.next(bookingDetails.travelDate);
    }*/

    /**
     * Confirm the information the user has provided.
     */
    /*async confirmStep(stepContext) {
        const bookingDetails = stepContext.options;

        // Capture the results of the previous step
        bookingDetails.travelDate = stepContext.result;
        const messageText = `Please confirm, I have you traveling to: ${ bookingDetails.destination } from: ${ bookingDetails.origin } on: ${ bookingDetails.travelDate }. Is this correct?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }*/

    /**
     * Complete the interaction and end the dialog.
     */
   /* async finalStep(stepContext) {
        if (stepContext.result === true) {
            const bookingDetails = stepContext.options;
            return await stepContext.endDialog(bookingDetails);
        }
        return await stepContext.endDialog();
    }

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }*/
}

module.exports.BookingDialog = BookingDialog;
