//const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { MessageFactory, InputHints } = require('botbuilder');
const {
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { UserProfile } = require('../userProfile');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const AGE_PROMPT = 'AGE_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const USER_PROFILE = 'USER_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const PREGNANCY_PROMPT = 'PREGNANCY_PROMPT';

var selfOrNot;
var age;
var pregnancy;
var medCond;
var environment;
var allergy;
var medical;
var illness;

class UserProfileDialog extends ComponentDialog {
    constructor(userState, bookingDialog) {
        super('userProfileDialog');

        if (!bookingDialog) throw new Error('[MainDialog]: Missing parameter \'bookingDialog\' is required');

        this.userProfile = userState.createProperty(USER_PROFILE);
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new TextPrompt(AGE_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new ConfirmPrompt(PREGNANCY_PROMPT));
        this.addDialog(new TextPrompt('TextPrompt'))
.addDialog(bookingDialog)
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
          //  this.introStep.bind(this),

          this.introStep.bind(this),
          this.actStep.bind(this),
          this.finalStep.bind(this)

          /*  this.selfStep.bind(this),
            this.ageStep.bind(this),
            this.pregnancyStep.bind(this),
            this.medicalConditionStep.bind(this),
            this.allergyStep.bind(this),
            this.allergictoStep.bind(this)*/
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async introStep(step) {
       
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await step.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await step.next();  
    }

    async actStep(step) {
        const bookingDetails = {};

       
            // LUIS is not configured, we just run the BookingDialog path.
            return await step.beginDialog('bookingDialog', bookingDetails);
       
        return await step.next();
    }


    async finalStep(step) {
        // If the child dialog ("bookingDialog") was cancelled or the user failed to confirm, the Result here will be null.
        
        // Restart the main dialog with a different message the second time around
        return await step.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }

    


    async selfStep(step) {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Are you checking the eligibility for yourself or someone else?',
            choices: ChoiceFactory.toChoices(['Myself', 'Someone Else'])
        });
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
    async pregnancyStep(step) {
        step.values.age = step.result.value;
        age = step.values.age;
        console.log(age);

        if(step.result)
        {
            if(step.values.age == '11-17 years' || step.values.age == '18-64 years') {
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Are you pregnant?',
                    choices: ChoiceFactory.toChoices(['Yes', 'No', 'Not Sure'])
                });       
            }
            else if(step.values.age == '< 6 months') {
                return step.context.sendActivity('Flu vaccinations are not licensed for children aged under 6 months. Please consult with their GP practice.');
            }
            else if(step.values.age == '2-10 years') {
                return step.context.sendActivity('Your child is eligible for a free flu vaccination as long as they were born between 1st September 2008 and 31st August 2017. \nIf your child was born between 1 September 2015 and 31 August 2017, their vaccination will be provided at your GP practice - please book an appointment at the practice.\nIf your child was born between 1 September 2008 and 31 August 2015, their vaccination will be provided at their primary school - please speak to the school.');
            }
            else if(step.values.age == 'Above 65 years' || step.values.age == '6 months to 2 years')
            {
                medical = false;
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Do you have any of the long-term medical conditions as shown below?',
                    choices: ChoiceFactory.toChoices(['Diabetes', 'COPD', 'Parkinsons',
                    'Nervous Problems', 'Asthma', 'Spleen problems', 'Heart disease', 'Learning disability', 'Weak immune system',
                    'Had stroke or TIA', 'Liver disease', 'Cancer', 'Kidney disease', 'Learning disability', 'Motor neuron disease', 'None'])
                });       
            }

        } else {
            return await step.ageStep();
        }
    }

    async medicalConditionStep(step) {
        step.values.pregnancy = step.result.value;
        pregnancy = step.values.pregnancy;
        console.log(step.values);
        if(step.result && medical!=false)
        {
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Do you have any of the long-term medical conditions as shown below?',
                choices: ChoiceFactory.toChoices(['Diabetes', 'COPD', 'Parkinsons',
                'Nervous Problems', 'Asthma', 'Spleen problems', 'Heart disease', 'Learning disability', 'Weak immune system',
                'Had stroke or TIA', 'Liver disease', 'Cancer', 'Kidney disease', 'Learning disability', 'Motor neuron disease', 'None'])
            });       
        } else {
           // return await step.pregnancyStep();
           console.log("working");
           console.log(step.values.pregnancy);
         //   return this.allergyStep(step);
           return await step.next(step);
            console.log("working");
        }
    }

    async allergyStep(step) {
        step.values.medicalConditions = step.result.value;
        if (step.result) {
            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Do you have any allergy?',
                choices: ChoiceFactory.toChoices(['Yes', 'No'])
            });       
    } else {
            return await step.selfStep();
        }
    }
    async allergictoStep(step) {
        step.values.allergy = step.result.value;
        console.log(step.values);
        if (step.result) {
            if(step.values.allergy == 'Yes') {
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'What are they allergic to?',
                    choices: ChoiceFactory.toChoices(['Eggs', 'Cows’ milk', 'Gluten', 'Fruit', 'Household chemicals', 'Latex'])
                });       
            }
            if(step.values.allergy == 'No') {
                return await step.prompt(CHOICE_PROMPT, {
                    prompt: 'Do any of the following apply to them?',
                    choices: ChoiceFactory.toChoices(['Allergy', 'Fever', 'None'])
                });        
            }
        } else {
            return await step.allergyStep();
        }
    }

 }

module.exports.UserProfileDialog = UserProfileDialog;

















