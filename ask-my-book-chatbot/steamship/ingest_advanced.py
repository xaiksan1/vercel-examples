"""Script to populate the VectorDB."""
import json

from langchain.document_loaders import PagedPDFSplitter
from steamship import Steamship
from steamship_langchain.vectorstores import SteamshipVectorStore

index_name = "ask-naval-ravikant"
book_name = "the-almanack-of-naval-ravikant.pdf"
reset = True

client = Steamship(workspace=index_name)
loader = PagedPDFSplitter(book_name)
pages = loader.load_and_split()

vs = SteamshipVectorStore(client=client, index_name=index_name, embedding="text-embedding-ada-002")

books = set(json.loads(item.metadata)["source"] for item in vs.index.index.list_items().items)
if book_name in books:
    print("book already indexed")
    if reset:
        vs.index.reset()

doc_index = vs.add_texts(
    texts=[page.page_content for page in pages],
    metadatas=[page.metadata for page in pages])
