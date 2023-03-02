"""Script to populate the VectorDB."""
import json

from langchain.document_loaders import PagedPDFSplitter
from steamship import Steamship
from steamship_langchain.vectorstores import SteamshipVectorStore

INDEX_NAME = "ask-my-books"

BOOKS = [
    "uploads/the-almanack-of-naval-ravikant.pdf",
]

client = Steamship(workspace=INDEX_NAME)

doc_index = SteamshipVectorStore(client=client,
                                 index_name=INDEX_NAME,
                                 embedding="text-embedding-ada-002")

books = set(json.loads(item.metadata)["source"] for item in doc_index.index.index.list_items().items)

if books.intersection(set(books)):
    print("Attempting to add the same book twice into the index with name {}.")
    doc_index.index.reset()

for book in BOOKS:
    loader = PagedPDFSplitter(book)
    pages = loader.load_and_split()

    doc_index.add_texts(
        texts=[page.page_content for page in pages],
        metadatas=[page.metadata for page in pages],
    )
