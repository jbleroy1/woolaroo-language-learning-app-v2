package cloudcode.helloworld;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutionException;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.api.GenerationConfig;
import com.google.cloud.vertexai.api.HarmCategory;
import com.google.cloud.vertexai.api.SafetySetting;
import com.google.cloud.vertexai.generativeai.ContentMaker;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.ResponseStream;

public class Main {
    public static void main(String[] args) throws IOException, InterruptedException, ExecutionException {
        MultiModal multiModal = new MultiModal();

        String s = multiModal.generateSentence("en", "fr",
                "sky");
        System.out.println(s);

    }

    public static void test(String[] args) throws IOException {
        try (VertexAI vertexAi = new VertexAI("civil-victory-381915", "us-central1");) {
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
            GenerativeModel model = new GenerativeModel.Builder()
                    .setModelName("gemini-1.5-flash-001")
                    .setVertexAi(vertexAi)
                    .setGenerationConfig(generationConfig)
                    .setSafetySettings(safetySettings)
                    .build();

            var content = ContentMaker.fromMultiModalData(
                    "you are a translation chat bot. \nyou will be given a word to translate from input language  to another translation language.\n\nwrite a simple sentence with this word and in the output replace the original input word with the translated word.\n\ninput: input language: English\ntranslation language: Sanskrit \ninput word: Hand\nprompt: write a simple sentence with word input word and in the output replace the original input word with the translated word. \noutput: translated word: hasta \ntranslated sentence - She held a flower in her hasta.\n\ninput: input language: English\nTranslation language: Sanskrit \nInput word: face\noutput:\n");
            ResponseStream<GenerateContentResponse> responseStream = model.generateContentStream(content);

            // Do something with the response
            responseStream.stream().forEach(System.out::println);
        }
    }
}
