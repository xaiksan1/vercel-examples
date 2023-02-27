from typing import Type, Optional, Dict, Any

from langchain import PromptTemplate
from langchain.chains import ChatVectorDBChain
from langchain.chains.llm import LLMChain
from langchain.chains.question_answering import load_qa_chain
from steamship import Steamship
from steamship.invocable import Config
from steamship.invocable import PackageService, post
from steamship_langchain import OpenAI
from steamship_langchain.vectorstores import SteamshipVectorStore

from chat_history import ChatHistory

DEBUG = False


class AskMyBook(PackageService):
    class AskMyBookConfig(Config):
        index_name: str

    config: AskMyBookConfig

    def __init__(
            self,
            *args,
            **kwargs
    ):
        super().__init__(*args, **kwargs)
        self.qa_chain = self._get_chain()

    @classmethod
    def config_cls(cls) -> Type[Config]:
        return cls.AskMyBookConfig

    def _get_chain(self):
        doc_index = SteamshipVectorStore(client=self.client,
                                         index_name=self.config.index_name,
                                         embedding="text-embedding-ada-002"
                                         )
        condense_question_prompt_template = """Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

        Chat History:
        {chat_history}
        Follow Up Input: {question}
        Standalone question:"""
        condense_question_prompt = PromptTemplate.from_template(condense_question_prompt_template)

        qa_prompt_template = """I want you to ANSWER a QUESTION based on the following pieces of CONTEXT. 

        If you don't know the answer, just say that you don't know, don't try to make up an answer.

        Your ANSWER should be analytical and straightforward. 
        Try to share deep, thoughtful insights and explain complex ideas in a simple and concise manner. 
        When appropriate use analogies and metaphors to illustrate your point. 
        Your ANSWER should have a strong focus on clarity, logic, and brevity.


        CONTEXT: {context}

        QUESTION: {question}
        ANSWER:
        """
        qa_prompt = PromptTemplate(
            template=qa_prompt_template, input_variables=["context", "question"]
        )

        doc_chain = load_qa_chain(OpenAI(client=self.client, temperature=0, verbose=True),
                                  chain_type="stuff",
                                  prompt=qa_prompt,
                                  verbose=DEBUG)
        question_chain = LLMChain(
            llm=OpenAI(client=self.client, temperature=0, verbose=DEBUG),
            prompt=condense_question_prompt,
        )
        return ChatVectorDBChain(
            vectorstore=doc_index,
            combine_docs_chain=doc_chain,
            question_generator=question_chain,
            return_source_documents=True
        )

    @post("/generate")
    def generate(self, question: str, chat_session_id: Optional[str] = None) -> Dict[str, Any]:
        chat_history = ChatHistory(self.client, chat_session_id)

        result = self.qa_chain(
            {"question": question, "chat_history": chat_history.load()}
        )
        chat_history.append(question, result["answer"])

        return {"answer": result["answer"].strip(), "sources": result["source_documents"]}


if __name__ == "__main__":
    index_name = "crisis-protocol"

    # package = AskMyBook(client=Steamship(workspace=index_name), config={"index_name": index_name})
    # answer = package.generate(
    #     question="What is specific knowledge?",
    #     chat_session_id="007"
    # )
    # print(answer)
    #
    # answer = package.generate(
    #     question="Could you explain this to a 5 year old?",
    #     chat_session_id="007"
    # )
    # print(answer)


    client = Steamship(workspace=index_name)
    pkg = client.use(package_handle="ask-my-book-chat-api", instance_handle="test123555", config={"index_name": index_name})

    d = pkg.invoke("/generate", question="What are the parts of a crisis card?", chat_session_id="007")
    print(d)
