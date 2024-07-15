package cloudcode.helloworld;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutionException;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerationConfig;
import com.google.cloud.vertexai.api.HarmCategory;
import com.google.cloud.vertexai.api.SafetySetting;
import com.google.cloud.vertexai.generativeai.ContentMaker;
import com.google.cloud.vertexai.generativeai.GenerativeModel;

public class MultiModal {

    public static final String TEMPLATE_STRING = "you are a translation chat bot. \nyou will be given a word to translate from input language  to another translation language.\n\nwrite a simple sentence with this word and in the output replace the original input word with the translated word.\n\ninput: input language: %s\ntranslation language: %s \ninput word: %s\nprompt: write a simple sentence with word input word and in the output replace the original input word with the translated word. \noutput: the generated sentence with the replaced word and only this sentence. The output should propose only one sentence written in the primary language and with one word in the translated language. Please do not add any special caracter to mention the tranlsated word\n";

    private String getTemplate(String inputLanguage, String translationLanguage, String inputWord) {
        return String.format(TEMPLATE_STRING, inputLanguage, translationLanguage, inputWord);
    }

    public static final String GEMINI_MODEL = System.getenv().getOrDefault("GEMINI_MODE", "gemini-1.5-flash-001");
    public static final String GEMINI_PROJECT = System.getenv().getOrDefault("GEMINI_PROJECT", "civil-victory-381915");
    public static final String GEMINI_REGION = System.getenv().getOrDefault("GEMINI_REGION", "us-central1");

    private GenerativeModel model;

    public String generateSentence(String inputLanguage, String translationLanguage, String inputWord)
            throws InterruptedException, ExecutionException, IOException {
        try (VertexAI vertexAi = new VertexAI(GEMINI_PROJECT, GEMINI_REGION);) {
            GenerationConfig generationConfig = GenerationConfig.newBuilder()
                    .setMaxOutputTokens(8192)
                    .setTemperature(1F)
                    .setTopP(0.95F)
                    .build();
            List<SafetySetting> safetySettings = Arrays.asList(
                    SafetySetting.newBuilder()
                            .setCategory(HarmCategory.HARM_CATEGORY_HATE_SPEECH)
                            .setThreshold(SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE)
                            .build(),
                    SafetySetting.newBuilder()
                            .setCategory(HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT)
                            .setThreshold(SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE)
                            .build(),
                    SafetySetting.newBuilder()
                            .setCategory(HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT)
                            .setThreshold(SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE)
                            .build(),
                    SafetySetting.newBuilder()
                            .setCategory(HarmCategory.HARM_CATEGORY_HARASSMENT)
                            .setThreshold(SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE)
                            .build());
            model = new GenerativeModel.Builder()
                    .setModelName(GEMINI_MODEL)
                    .setVertexAi(vertexAi)
                    .setGenerationConfig(generationConfig)
                    .setSafetySettings(safetySettings)
                    .build();

            var content = ContentMaker.fromMultiModalData(getTemplate(inputLanguage, translationLanguage, inputWord));

            return model.generateContentAsync(content).get().getCandidates(0).getContent().getParts(0).getText();

        }
        // ResponseStream<GenerateContentResponse> responseStream =
        // model.generateContentStream(content);
        // return responseStream.stream().map(c ->
        // c.toString()).collect(Collectors.joining("\n"));
    }

}
