package cloudcode.helloworld;

import com.google.cloud.functions.HttpFunction;
import com.google.cloud.functions.HttpRequest;
import com.google.cloud.functions.HttpResponse;
import com.google.gson.Gson;

public class HelloWorld implements HttpFunction {
  @Override
  public void service(HttpRequest request, HttpResponse response) throws Exception {
    Gson gson = new Gson();
    Sentence sentence = gson.fromJson(request.getReader(), Sentence.class);
    MultiModal multiModal = new MultiModal();
    String s = multiModal.generateSentence(sentence.getPrimaryLanguage(), sentence.getTargetLanguage(),
        sentence.getWord());
    sentence.setSentence(s);
    sentence.setModel(MultiModal.GEMINI_MODEL);
    response.getWriter().write(gson.toJson(sentence));
  }

}
