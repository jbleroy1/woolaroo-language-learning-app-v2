const {Datastore} = require('@google-cloud/datastore');
const {google} = require('googleapis');

const datastore = new Datastore({
    databaseId: 'woolaroo' 
});
const wordKey = datastore.key(['Translation', "beard"]);
const translations = datastore.get(wordKey);
translations.then(docs => {
    console.log("docs", docs);
   // const ret = createTranslationResponseForApp(docs[0], "en", "san");
   // console.log("ret", ret);
    const headkey = datastore.key(['Translation', "beard"]);

    const copy = 
        {
          
                "en": {
                    "translation": "beard",
                    "transliteration": "beard"
                },
                "san": {
                    "translation": "san-beard",
                    "transliteration": "san-beard"
                }
            
        }
    ;
    const entity = {
        key: headkey,
        data: copy,
      };
    datastore.upsert(entity).then(function(data) {
        console.log("data", data);
    });

}).catch(function(error) {
    console.log("Internal server error", error);
   
});
console.log("hello d " + translations)
setInterval(() => {}, 1 << 30);

function createTranslationResponseForApp(data, primary_language, target_language) {
    const primaryTranslation = data && data.translations ? data.translations[primary_language] : null;
    const targetTranslation = data && data.translations ? data.translations[target_language] : null;
    return {
        english_word: data.word,
        primary_word: primaryTranslation ? primaryTranslation.translation || '' : '',
        translation: targetTranslation ? targetTranslation.translation || '' : '',
        transliteration: targetTranslation ? targetTranslation.transliteration || '' : '',
        sound_link: targetTranslation ? targetTranslation.sound_link || '' : ''
    };
}